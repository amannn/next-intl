use next_intl_shared::hello_world;
use swc_core::{
    ecma::{
        ast::*,
        visit::{Fold, FoldWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

pub struct NextIntlPlugin;

impl Fold for NextIntlPlugin {
    fn fold_module(&mut self, module: Module) -> Module {
        // This is a placeholder implementation that doesn't actually transform anything
        // In a real implementation, this would:
        // 1. Visit all function calls and expressions
        // 2. Extract internationalization messages
        // 3. Transform the code as needed

        // For now, we just call the shared hello_world function to demonstrate
        // that the shared library is accessible
        let _greeting = hello_world();

        module.fold_children_with(self)
    }
}

/// Plugin entry point for SWC
#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut NextIntlPlugin)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plugin_compiles() {
        // This test ensures the plugin compiles and can be instantiated
        let _plugin = NextIntlPlugin;
        assert!(true);
    }
}
