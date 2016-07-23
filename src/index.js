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

          let bindings = scope.getAllBindings()
          for (let name in bindings) {
            let binding = bindings[name];
            node.body.push(buildGlobal({
              NAME: t.stringLiteral(name),
              VALUE: binding.identifier
            }));
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
