use swc_common::{FileName, Globals, GLOBALS, Mark, SourceMap};
use swc_core::ecma::{
    parser::{lexer::Lexer, Parser, StringInput, Syntax},
    transforms::base::resolver,
};
use swc_ecma_ast::{EsVersion, Program};
use swc_ecma_visit::VisitMutWith;
use swc_plugin_extractor::TransformVisitor;

fn parse(cm: &SourceMap, code: &str) -> Program {
    let fm = cm.new_source_file(FileName::Anon.into(), code.to_string());
    let lexer = Lexer::new(
        Syntax::Es(Default::default()),
        EsVersion::EsNext,
        StringInput::from(&*fm),
        None,
    );
    let mut parser = Parser::new_from(lexer);
    parser.parse_program().unwrap()
}

#[test]
fn merges_duplicate_messages_preserving_description() {
    let globals = Globals::new();
    GLOBALS.set(&globals, || {
        let code = r#"
            import {useExtracted} from 'next-intl';
            
            function Component() {
                const t = useExtracted();
                t('message');
                t({message: 'message', description: 'A description'});
            }
        "#;

        let cm = SourceMap::default();
        let mut program = parse(&cm, code);
        
        if !program.is_module() {
             panic!("Parsed as script, expected module");
        }
        
        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();
        
        program.visit_mut_with(&mut resolver(unresolved_mark, top_level_mark, false));

        let mut visitor: TransformVisitor<SourceMap> = TransformVisitor::new(
            true,
            "test.tsx".to_string(),
            None,
        );

        program.visit_mut_with(&mut visitor);

        let results = visitor.get_results();
        
        // There should be 1 message
        assert_eq!(results.len(), 1);
        
        let message = &results[0];
        // Check references
        assert_eq!(message.references.len(), 2);
        
        // Check description
        if let Some(desc) = &message.description {
            assert_eq!(desc.to_string_lossy(), "A description");
        } else {
            panic!("Description is missing");
        }
    });
}
