// problems with swc approach:
// 1. we need a way to emit json file (not supported by swc)
// 2. if we want to emit json file by js loader (in the same compile pass), we need to access swc output. for this we need this.loadModule, which is currently not supported
// 3. so that means if we want to keep swc plugin, we need a sidecar watcher (which again comes with the problem of triple-specific rust builds)
// 4. so maybe we should go for a js-based loader that does ast transform and also extraction. we can use global state there, diff as much as needed and only write the minimum

use next_intl_shared::{TraversalMode, UseExtractedVisitor};
use swc_core::{
    ecma::{
        ast::Program,
        visit::{VisitMut, VisitMutWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

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
