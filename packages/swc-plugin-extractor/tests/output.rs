//! Tests for the unified plugin output format: messages (Extracted/Translations),
//! dependencies, hasUseClient, hasUseServer.
//!
//! This output is consumed by the Scanner in next-intl for both catalog extraction
//! and manifest generation.

use serde_json::Value;
use swc_common::{FileName, Globals, Mark, SourceMap, GLOBALS};
use swc_core::ecma::{
    parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax},
    transforms::base::resolver,
};
use swc_ecma_ast::EsVersion;
use swc_ecma_visit::VisitMutWith;
use swc_plugin_extractor::TransformVisitor;

fn parse_and_run(cm: &SourceMap, code: &str, file_name: &str) -> Value {
    let fm = cm.new_source_file(FileName::Anon.into(), code.to_string());
    let lexer = Lexer::new(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        EsVersion::EsNext,
        StringInput::from(&*fm),
        None,
    );
    let mut parser = Parser::new_from(lexer);
    let mut program = parser.parse_program().unwrap();

    let unresolved_mark = Mark::new();
    let top_level_mark = Mark::new();
    program.visit_mut_with(&mut resolver(unresolved_mark, top_level_mark, false));

    let mut visitor = TransformVisitor::new(
        true,
        file_name.to_string(),
        None, // Source map not needed for output structure assertions
    );
    program.visit_mut_with(&mut visitor);

    let json = visitor.get_output_json();
    serde_json::from_str(&json).expect("output must be valid JSON")
}

fn run_test<F, R>(f: F) -> R
where
    F: FnOnce() -> R,
{
    let globals = Globals::new();
    GLOBALS.set(&globals, f)
}

#[test]
fn output_contains_extracted_messages() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
import { useExtracted } from "next-intl";

function Component() {
  const t = useExtracted();
  t("Hello!");
}
"#,
            "Component.tsx",
        );

        let messages = output["messages"].as_array().unwrap();
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0]["type"], "Extracted");
        assert_eq!(messages[0]["message"], "Hello!");
        assert!(!messages[0]["id"].as_str().unwrap().is_empty());
        assert!(messages[0]["references"].as_array().unwrap().len() > 0);
    });
}

#[test]
fn output_contains_translations_from_use_translations() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
import { useExtracted, useTranslations } from "next-intl";

function Component() {
  const t = useExtracted();
  const t2 = useTranslations("common");
  t("Hello!");
  t2("greeting");
}
"#,
            "Component.tsx",
        );

        let messages = output["messages"].as_array().unwrap();
        assert!(messages.len() >= 2);

        let extracted: Vec<_> = messages
            .iter()
            .filter(|m| m["type"] == "Extracted")
            .collect();
        assert_eq!(extracted.len(), 1);
        assert_eq!(extracted[0]["message"], "Hello!");

        let translations: Vec<_> = messages
            .iter()
            .filter(|m| m["type"] == "Translations")
            .collect();
        assert_eq!(translations.len(), 1);
        assert_eq!(translations[0]["id"], "common.greeting");
        assert!(translations[0]["references"].as_array().unwrap().len() > 0);
    });
}

#[test]
fn output_contains_dependencies() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
import { useExtracted } from "next-intl";
import { foo } from "./utils";

function Component() {
  const t = useExtracted();
  t("Hi");
}
"#,
            "Component.tsx",
        );

        let deps = output["dependencies"].as_array().unwrap();
        assert!(deps.iter().any(|v| v == "next-intl"));
        assert!(deps.iter().any(|v| v == "./utils"));
    });
}

#[test]
fn output_contains_dynamic_import_dependencies() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
"use client";

import dynamic from "next/dynamic";
import { lazy } from "react";

const DynamicContent = dynamic(() => import("./DynamicContent"));
const LazyContent = lazy(() => import("./LazyContent"));

function Component() {
  return null;
}
"#,
            "Component.tsx",
        );

        let deps = output["dependencies"].as_array().unwrap();
        assert!(
            deps.iter().any(|v| v == "./DynamicContent"),
            "expected ./DynamicContent in {:?}",
            deps
        );
        assert!(
            deps.iter().any(|v| v == "./LazyContent"),
            "expected ./LazyContent in {:?}",
            deps
        );
    });
}

#[test]
fn output_has_use_client_when_directive_present() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
"use client";

import { useExtracted } from "next-intl";

function Component() {
  const t = useExtracted();
  t("Hi");
}
"#,
            "Component.tsx",
        );

        assert_eq!(output["hasUseClient"], true);
        assert_eq!(output["hasUseServer"], false);
    });
}

#[test]
fn output_has_use_server_when_directive_present() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
"use server";

import { getExtracted } from "next-intl/server";

async function ServerComponent() {
  const t = await getExtracted();
  t("Hi");
}
"#,
            "ServerComponent.tsx",
        );

        assert_eq!(output["hasUseClient"], false);
        assert_eq!(output["hasUseServer"], true);
    });
}

#[test]
fn output_has_both_directives_when_both_present() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
"use client";
"use server";

import { useExtracted } from "next-intl";

function Component() {
  const t = useExtracted();
  t("Hi");
}
"#,
            "Component.tsx",
        );

        assert_eq!(output["hasUseClient"], true);
        assert_eq!(output["hasUseServer"], true);
    });
}

#[test]
fn output_structure_matches_plugin_emit_format() {
    run_test(|| {
        let cm = SourceMap::default();
        let output = parse_and_run(
            &cm,
            r#"
import { useTranslations } from "next-intl";

function Component() {
  const t = useTranslations("ui");
  return t("button");
}
"#,
            "Component.tsx",
        );

        assert!(output.get("messages").is_some());
        assert!(output.get("dependencies").is_some());
        assert!(output.get("hasUseClient").is_some());
        assert!(output.get("hasUseServer").is_some());

        let messages = output["messages"].as_array().unwrap();
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0]["type"], "Translations");
        assert_eq!(messages[0]["id"], "ui.button");
        assert!(messages[0]["references"].as_array().unwrap().len() > 0);
    });
}
