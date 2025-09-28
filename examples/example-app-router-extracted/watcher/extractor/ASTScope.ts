export default class ASTScope {
  parent?: ASTScope;
  vars = new Map<string, string>();

  constructor(parent?: ASTScope) {
    this.parent = parent;
  }

  define(name: string, kind: string) {
    this.vars.set(name, kind);
  }

  lookup(name: string): string | undefined {
    if (this.vars.has(name)) return this.vars.get(name);
    return this.parent?.lookup(name);
  }
}
