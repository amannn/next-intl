use next_intl_shared::{TraversalMode, UseExtractedVisitor};
use swc_core::{
    ecma::{
        ast::Program,
        visit::{VisitMut, VisitMutWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

#[cfg(test)]
mod lib_test;

pub struct TransformVisitor;

impl TransformVisitor {
    pub fn new() -> Self {
        Self
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_program(&mut self, program: &mut Program) {
        let mut shared = UseExtractedVisitor::new(TraversalMode::Transform);
        program.visit_mut_with(&mut shared);
    }
}

/// Plugin entry point for SWC
#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    _metadata: TransformPluginProgramMetadata,
) -> Program {
    let mut visitor = TransformVisitor::new();
    program.visit_mut_with(&mut visitor);
    program
}
