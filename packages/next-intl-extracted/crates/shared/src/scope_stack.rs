#[derive(Debug, Default, Clone)]
pub struct ScopeStack {
    stack: Vec<std::collections::HashMap<String, String>>, // name -> kind
}

impl ScopeStack {
    pub fn new() -> Self {
        Self {
            stack: vec![Default::default()],
        }
    }

    pub fn push_scope(&mut self) {
        self.stack.push(Default::default());
    }

    pub fn pop_scope(&mut self) {
        self.stack.pop();
    }

    pub fn define(&mut self, name: &str, kind: &str) {
        if let Some(current) = self.stack.last_mut() {
            current.insert(name.to_string(), kind.to_string());
        }
    }

    pub fn lookup(&self, name: &str) -> Option<&str> {
        for scope in self.stack.iter().rev() {
            if let Some(kind) = scope.get(name) {
                return Some(kind.as_str());
            }
        }
        None
    }
}
