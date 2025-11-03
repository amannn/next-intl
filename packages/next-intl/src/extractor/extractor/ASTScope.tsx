type VarInfo = {
  kind: string;
  namespace?: string;
};

export default class ASTScope {
  parent?: ASTScope;
  vars = new Map<string, VarInfo>();

  constructor(parent?: ASTScope) {
    this.parent = parent;
  }

  define(name: string, kind: string, namespace?: string) {
    this.vars.set(name, {kind, namespace});
  }

  lookup(name: string): VarInfo | undefined {
    if (this.vars.has(name)) return this.vars.get(name);
    return this.parent?.lookup(name);
  }
}
