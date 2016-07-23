import template from "babel-template";

const buildTemplate = template(`
  SYSTEM_GLOBAL.registerDynamic(MODULE_NAME, [DEPS], false, BODY);
`);

const buildFactory = template(`
  (function ($__require, $__exports, $__module) {
    var _retrieveGlobal = SYSTEM_GLOBAL.get("@@global-helpers").prepareGlobal($__module.id, EXPORT_NAME, GLOBALS);
    (BODY)(this)
    return _retrieveGlobal();
  })
`);

const buildGlobal = template(`
  $__global[NAME] = VALUE;
`);

export default function ({ types: t }) {
  const requireIdentifier = t.identifier('$__require');
  const globalIdentifier = t.identifier('$__global');

  return {
    visitor: {
      Program: {
        enter({ scope }) {
          let bindings = scope.getAllBindingsOfKind('var');
          for (let name in bindings) {
            let binding = bindings[name];
            scope.push({
              id: binding.identifier,
              init: t.memberExpression(globalIdentifier, t.stringLiteral(name), true)
            });
          }
        },
        exit({ node, scope }, { opts = {} }) {
          let { moduleName = null } = opts;
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          let { deps = [] } = opts;
          deps = deps.map(d => t.stringLiteral(d));

          let { exportName } = opts;
          exportName = exportName ? t.stringLiteral(exportName) : t.nullLiteral();

          let { globals } = opts;
          if (globals && Object.keys(globals).length) {
            let properties = Object.keys(globals).filter(g => globals[g]).map(g => {
              let value = t.callExpression(requireIdentifier, [t.stringLiteral(globals[g])]);
              return t.objectProperty(t.stringLiteral(g), value);
            });
            globals = t.objectExpression(properties);
          }

          let bindings = scope.getAllBindings();
          for (let name in bindings) {
            let binding = bindings[name];
            var expression = buildGlobal({
              NAME: t.stringLiteral(name),
              VALUE: binding.identifier
            });
            if (binding.kind === 'var') {
              // for globals defined as "var x = 5;" in outer scope, add "$__global.x = x;" at end
              node.body.push(expression);
            } else if (binding.kind === 'hoisted') {
              // hoist function declaration assignments to the global
              node.body.unshift(expression);
            }
          }

          const wrapper = t.functionExpression(null, [globalIdentifier], t.blockStatement(node.body, node.directives));
          node.directives = [];

          const systemGlobal = t.identifier(opts.systemGlobal || "System");

          const factory = buildFactory({
            SYSTEM_GLOBAL: systemGlobal,
            EXPORT_NAME: exportName,
            GLOBALS: globals || t.nullLiteral(),
            BODY: wrapper
          });

          node.body = [buildTemplate({
            SYSTEM_GLOBAL: systemGlobal,
            MODULE_NAME: moduleName,
            DEPS: deps,
            BODY: factory
          })];
        }
      }
    }
  };
}
