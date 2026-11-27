import type {compile} from '@mdx-js/mdx';
import type {
  CallExpression,
  ExportNamedDeclaration,
  FunctionDeclaration,
  Identifier,
  Node,
  ObjectExpression,
  Pattern,
  Program,
  VariableDeclarator
} from 'estree-jsx';

type ProgramBody = Program['body'][number];

type MdxFile = Awaited<ReturnType<typeof compile>>;

type TranslationAnalysis = {
  calls: Array<CallExpression>;
  bindings: Array<Identifier>;
  hasTranslator: boolean;
};

type MetadataAnalysis = {
  statement: ExportNamedDeclaration;
  variable: VariableDeclarator | null;
  object: ObjectExpression;
  translations: TranslationAnalysis;
};

const generatedBindings = new WeakSet<VariableDeclarator>();
const generatedMetadata = new WeakMap<FunctionDeclaration, ObjectExpression>();

export default function recmaExtracted() {
  return function transform(program: Program, file: MdxFile): void {
    const metadata = inspectMetadata(program, file);
    const content = program.body.find(
      (node): node is FunctionDeclaration =>
        node.type === 'FunctionDeclaration' &&
        node.id.name === '_createMdxContent'
    );
    const analysis = content ? inspectTranslations(content, file) : null;

    if (content && analysis?.calls.length) {
      validateContent(program, content, analysis, file);
    }

    if (metadata) {
      validateReservedBindings(program, content, metadata.translations, file);

      if (metadata.variable) {
        validateMetadata(program, content, file);
      }
    }

    if (metadata?.variable) {
      const getterName = ensureTranslatorImport(program, 'getExtracted');

      transformMetadata(program, metadata, getterName);
    }

    if (content && analysis?.calls.length && !analysis.hasTranslator) {
      const declaredNames = new Set(
        analysis.bindings.map((binding) => binding.name)
      );
      const hookName = ensureTranslatorImport(
        program,
        'useExtracted',
        declaredNames
      );

      addTranslator(content, hookName);
    }
  };
}

function inspectMetadata(
  program: Program,
  file: MdxFile
): MetadataAnalysis | null {
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration') {
      continue;
    }

    const declaration = statement.declaration;

    if (declaration?.type === 'FunctionDeclaration') {
      const object = generatedMetadata.get(declaration);

      if (object) {
        return {
          statement,
          variable: null,
          object,
          translations: inspectTranslations(object, file)
        };
      }
    }

    if (declaration?.type !== 'VariableDeclaration') {
      continue;
    }

    for (const variable of declaration.declarations) {
      const declaresMetadata = getPatternIdentifiers(variable.id).some(
        (binding) => binding.name === 'metadata'
      );

      if (!declaresMetadata || !variable.init) {
        continue;
      }

      const translations = inspectTranslations(variable.init, file);

      if (translations.calls.length === 0) {
        continue;
      }

      if (
        declaration.kind !== 'const' ||
        variable.id.type !== 'Identifier' ||
        variable.init.type !== 'ObjectExpression'
      ) {
        reportError(
          file,
          variable,
          'metadata-shape',
          'Translated metadata must use export const metadata = { ... }.'
        );
      }

      return {statement, variable, object: variable.init, translations};
    }
  }

  return null;
}

function inspectTranslations(
  content: Node,
  file: MdxFile
): TranslationAnalysis {
  const analysis: TranslationAnalysis = {
    calls: [],
    bindings: [],
    hasTranslator: false
  };

  visitNodes(content, (node) => {
    analysis.bindings.push(...getDeclaredIdentifiers(node));

    if (node.type === 'VariableDeclarator' && generatedBindings.has(node)) {
      analysis.hasTranslator = true;
    }

    if (
      node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      node.object.name === 't'
    ) {
      if (node.optional) {
        reportError(
          file,
          node,
          'unsupported-call',
          'MDX messages do not support optional translator calls.'
        );
      }
      if (
        node.computed ||
        node.property.type !== 'Identifier' ||
        !['rich', 'markup', 'has'].includes(node.property.name)
      ) {
        reportError(
          file,
          node,
          'unsupported-method',
          'MDX messages support t, t.rich, t.markup and t.has only.'
        );
      }
    }

    if (
      node.type === 'CallExpression' &&
      ((node.callee.type === 'Identifier' && node.callee.name === 't') ||
        (node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 't'))
    ) {
      if (node.optional) {
        reportError(
          file,
          node,
          'unsupported-call',
          'MDX messages do not support optional translator calls.'
        );
      }
      analysis.calls.push(node);
    }
  });

  return analysis;
}

function validateContent(
  program: Program,
  content: FunctionDeclaration,
  analysis: TranslationAnalysis,
  file: MdxFile
): void {
  validateReservedBindings(program, content, analysis, file);

  if (content.async) {
    reportError(
      file,
      analysis.calls[0],
      'async-content',
      'MDX messages require synchronous content for useExtracted(); move top-level await out of the MDX content.'
    );
  }
}

function validateReservedBindings(
  program: Program,
  content: FunctionDeclaration | undefined,
  analysis: TranslationAnalysis,
  file: MdxFile
): void {
  const moduleBindings = getModuleBindings(program, content);

  for (const binding of [...analysis.bindings, ...moduleBindings]) {
    if (binding.name === 't') {
      reportError(
        file,
        binding,
        'reserved-binding',
        'The identifier t is reserved for MDX messages; rename this binding.'
      );
    }
  }
}

function getModuleBindings(
  program: Program,
  content: FunctionDeclaration | undefined
): Array<Identifier> {
  const bindings: Array<Identifier> = [];

  visitNodes(program, (node) => {
    if (node === content) {
      return false;
    }

    // Only declarations introduce module bindings.
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (node.type) {
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
        bindings.push(...getPatternIdentifiers(node.id));

        return false;
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ClassExpression':
        return false;
      default:
        bindings.push(...getDeclaredIdentifiers(node));
    }
  });

  return bindings;
}

function validateMetadata(
  program: Program,
  content: FunctionDeclaration | undefined,
  file: MdxFile
): void {
  const conflict = getModuleBindings(program, content).find(
    (binding) => binding.name === 'generateMetadata'
  );

  if (conflict) {
    reportError(
      file,
      conflict,
      'metadata-conflict',
      'Translated metadata cannot coexist with a generateMetadata binding or export.'
    );
  }

  for (const statement of program.body) {
    if (statement.type === 'ExportAllDeclaration' && !statement.exported) {
      reportError(
        file,
        statement,
        'metadata-export-star',
        'Translated metadata does not support export *; use explicit named exports.'
      );
    }

    const exports =
      statement.type === 'ExportNamedDeclaration'
        ? statement.specifiers.map((specifier) => specifier.exported)
        : statement.type === 'ExportAllDeclaration' && statement.exported
          ? [statement.exported]
          : [];
    const exported = exports.find(
      (name) =>
        (name.type === 'Identifier' ? name.name : name.value) ===
        'generateMetadata'
    );

    if (exported) {
      reportError(
        file,
        exported,
        'metadata-conflict',
        'Translated metadata cannot coexist with a generateMetadata binding or export.'
      );
    }
  }

  const reference = findMetadataReference(program);

  if (reference) {
    reportError(
      file,
      reference,
      'metadata-reference',
      'Translated metadata cannot be referenced, assigned or re-exported; use generateMetadata explicitly for that case.'
    );
  }
}

function transformMetadata(
  program: Program,
  metadata: MetadataAnalysis,
  getterName: string
): void {
  const declaration = metadata.statement.declaration;

  if (!metadata.variable || declaration?.type !== 'VariableDeclaration') {
    return;
  }

  const generated: FunctionDeclaration = {
    type: 'FunctionDeclaration',
    id: createIdentifier('generateMetadata'),
    async: true,
    generator: false,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [{type: 'ReturnStatement', argument: metadata.object}]
    }
  };

  addTranslator(generated, getterName, true);

  generatedMetadata.set(generated, metadata.object);

  const replacement: ExportNamedDeclaration = {
    type: 'ExportNamedDeclaration',
    declaration: generated,
    specifiers: [],
    source: null,
    attributes: []
  };

  const index = program.body.indexOf(metadata.statement);

  if (declaration.declarations.length === 1) {
    program.body.splice(index, 1, replacement);
  } else {
    declaration.declarations = declaration.declarations.filter(
      (variable) => variable !== metadata.variable
    );

    program.body.splice(index + 1, 0, replacement);
  }
}

function findMetadataReference(program: Program): Identifier | undefined {
  const bindings = new WeakSet<Identifier>();

  visitNodes(program, (node) => {
    for (const binding of getDeclaredIdentifiers(node)) {
      bindings.add(binding);
    }
  });

  let reference: Identifier | undefined;

  function visit(
    value: unknown,
    shadowed = false,
    parent?: Node,
    key?: string
  ): void {
    if (reference) {
      return;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        visit(child, shadowed, parent, key);
      }

      return;
    }

    if (!isNode(value)) {
      return;
    }

    if (
      value.type === 'ImportDeclaration' ||
      value.type === 'ExportAllDeclaration'
    ) {
      return;
    }

    if (value.type === 'ExportNamedDeclaration' && value.source) {
      return;
    }

    if (
      value.type === 'FunctionDeclaration' ||
      value.type === 'FunctionExpression' ||
      value.type === 'ArrowFunctionExpression'
    ) {
      const local =
        shadowed ||
        (value.type === 'FunctionExpression' &&
          value.id?.name === 'metadata') ||
        value.params.some((pattern) =>
          getPatternIdentifiers(pattern).some(
            (binding) => binding.name === 'metadata'
          )
        );

      visit(value.params, local, value, 'params');
      visit(
        value.body,
        local || hasMetadataVariable(value.body),
        value,
        'body'
      );

      return;
    }

    if (value.type === 'ClassDeclaration' || value.type === 'ClassExpression') {
      const local = shadowed || value.id?.name === 'metadata';

      visit(value.superClass, local, value, 'superClass');
      visit(value.body, local, value, 'body');

      return;
    }

    if (value.type === 'SwitchStatement') {
      visit(value.discriminant, shadowed, value, 'discriminant');

      const local =
        shadowed ||
        hasLexicalMetadata(value.cases.flatMap((branch) => branch.consequent));

      visit(value.cases, local, value, 'cases');

      return;
    }

    if (value.type === 'BlockStatement' || value.type === 'StaticBlock') {
      shadowed ||=
        hasLexicalMetadata(value.body) ||
        (value.type === 'StaticBlock' && hasMetadataVariable(value));
    } else if (value.type === 'CatchClause') {
      shadowed ||= getPatternIdentifiers(value.param).some(
        (binding) => binding.name === 'metadata'
      );
    } else if (
      value.type === 'ForStatement' ||
      value.type === 'ForInStatement' ||
      value.type === 'ForOfStatement'
    ) {
      const declaration =
        value.type === 'ForStatement' ? value.init : value.left;

      if (
        declaration?.type === 'VariableDeclaration' &&
        declaration.kind !== 'var'
      ) {
        shadowed ||= declaration.declarations.some((variable) =>
          getPatternIdentifiers(variable.id).some(
            (binding) => binding.name === 'metadata'
          )
        );
      }
    }

    if (
      value.type === 'Identifier' &&
      value.name === 'metadata' &&
      !shadowed &&
      !bindings.has(value) &&
      !isNonReferenceKey(parent, key)
    ) {
      reference = value;

      return;
    }

    const children: Array<[string, unknown]> = Object.entries(value);

    for (const [property, child] of children) {
      visit(child, shadowed, value, property);
    }
  }

  visit(program);

  return reference;
}

function hasLexicalMetadata(statements: Array<ProgramBody>): boolean {
  return statements.some((statement) => {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;

    if (
      declaration?.type === 'VariableDeclaration' &&
      declaration.kind !== 'var'
    ) {
      return declaration.declarations.some((variable) =>
        getPatternIdentifiers(variable.id).some(
          (binding) => binding.name === 'metadata'
        )
      );
    }

    return (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id.name === 'metadata'
    );
  });
}

function hasMetadataVariable(body: Node): boolean {
  let found = false;

  visitNodes(body, (node) => {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'ClassDeclaration' ||
      node.type === 'ClassExpression'
    ) {
      return false;
    }

    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      found ||= node.declarations.some((variable) =>
        getPatternIdentifiers(variable.id).some(
          (binding) => binding.name === 'metadata'
        )
      );
    }
  });

  return found;
}

function isNonReferenceKey(
  parent: Node | undefined,
  key: string | undefined
): boolean {
  if (!parent) {
    return false;
  }

  // Other nodes do not have non-reference identifier keys.
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (parent.type) {
    case 'MemberExpression':
      return key === 'property' && !parent.computed;
    case 'Property':
    case 'MethodDefinition':
    case 'PropertyDefinition':
      return key === 'key' && !parent.computed;
    case 'LabeledStatement':
    case 'BreakStatement':
    case 'ContinueStatement':
      return key === 'label';
    case 'ExportSpecifier':
      return key === 'exported';
    default:
      return false;
  }
}

function ensureTranslatorImport(
  program: Program,
  hook: 'useExtracted' | 'getExtracted',
  declaredNames: Set<string> = new Set()
): string {
  const source = hook === 'useExtracted' ? 'next-intl' : 'next-intl/server';

  for (const statement of program.body) {
    if (
      statement.type !== 'ImportDeclaration' ||
      statement.source.value !== source
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      if (specifier.type !== 'ImportSpecifier') {
        continue;
      }

      const importedName =
        specifier.imported.type === 'Identifier'
          ? specifier.imported.name
          : specifier.imported.value;

      if (importedName === hook && !declaredNames.has(specifier.local.name)) {
        return specifier.local.name;
      }
    }
  }

  const names = new Set<string>();

  visitNodes(program, (node) => {
    if (node.type === 'Identifier') {
      names.add(node.name);
    }
  });

  let hookName: string = hook;
  let suffix = 1;

  while (names.has(hookName)) {
    hookName = suffix === 1 ? '_' + hook : '_' + hook + suffix;

    suffix++;
  }

  insertAfterDirectives(program.body, {
    type: 'ImportDeclaration',
    specifiers: [
      {
        type: 'ImportSpecifier',
        imported: createIdentifier(hook),
        local: createIdentifier(hookName)
      }
    ],
    source: {type: 'Literal', value: source},
    attributes: []
  });

  return hookName;
}

function addTranslator(
  content: FunctionDeclaration,
  hookName: string,
  asynchronous = false
): void {
  const call: CallExpression = {
    type: 'CallExpression',
    callee: createIdentifier(hookName),
    arguments: [],
    optional: false
  };
  const binding: VariableDeclarator = {
    type: 'VariableDeclarator',
    id: createIdentifier('t'),
    init: asynchronous ? {type: 'AwaitExpression', argument: call} : call
  };

  generatedBindings.add(binding);

  insertAfterDirectives(content.body.body, {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [binding]
  });
}

function insertAfterDirectives<T extends ProgramBody>(
  statements: Array<T>,
  statement: T
): void {
  const index = statements.findIndex(
    (node) => !('directive' in node && node.directive)
  );

  statements.splice(index === -1 ? statements.length : index, 0, statement);
}

function visitNodes(
  node: unknown,
  visitor: (node: Node) => void | false
): void {
  if (Array.isArray(node)) {
    for (const child of node) {
      visitNodes(child, visitor);
    }

    return;
  }

  if (!isNode(node)) {
    return;
  }

  if (visitor(node) === false) {
    return;
  }

  const children: Array<unknown> = Object.values(node);

  for (const value of children) {
    visitNodes(value, visitor);
  }
}

function isNode(value: unknown): value is Node {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

function getDeclaredIdentifiers(node: Node): Array<Identifier> {
  if (node.type === 'VariableDeclarator' && generatedBindings.has(node)) {
    return [];
  }

  // Other nodes do not declare identifiers.
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (node.type) {
    case 'ImportDeclaration':
      return node.specifiers.map((specifier) => specifier.local);
    case 'VariableDeclarator':
    case 'ClassDeclaration':
    case 'ClassExpression':
      return getPatternIdentifiers(node.id);
    case 'CatchClause':
      return getPatternIdentifiers(node.param);
    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return [node.id, ...node.params].flatMap(getPatternIdentifiers);
    case 'ArrowFunctionExpression':
      return node.params.flatMap(getPatternIdentifiers);
    default:
      return [];
  }
}

function getPatternIdentifiers(
  pattern: Pattern | null | undefined
): Array<Identifier> {
  if (!pattern) {
    return [];
  }

  switch (pattern.type) {
    case 'Identifier':
      return [pattern];
    case 'RestElement':
      return getPatternIdentifiers(pattern.argument);
    case 'AssignmentPattern':
      return getPatternIdentifiers(pattern.left);
    case 'ArrayPattern':
      return pattern.elements.flatMap(getPatternIdentifiers);
    case 'ObjectPattern':
      return pattern.properties.flatMap((property) => {
        const value =
          property.type === 'RestElement' ? property.argument : property.value;
        return getPatternIdentifiers(value);
      });
    case 'MemberExpression':
      return [];
  }
}

function reportError(
  file: MdxFile,
  node: Node,
  ruleId: string,
  reason: string
): never {
  const place = node.loc && {
    line: node.loc.start.line,
    column: node.loc.start.column + 1
  };

  return file.fail(reason, {source: 'next-intl/extractor/mdx', ruleId, place});
}

function createIdentifier(name: string): Identifier {
  return {type: 'Identifier', name};
}
