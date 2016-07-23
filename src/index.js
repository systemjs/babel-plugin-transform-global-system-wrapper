import template from "babel-template";

const buildTemplate = template(`
  SYSTEM_GLOBAL.registerDynamic(MODULE_NAME, [DEPS], false, BODY);
`);

const buildFactory = template(`
  (function ($__require, $__exports, $__module) {
    var _retrieveGlobal = SYSTEM_GLOBAL.get("@@global-helpers").prepareGlobal($__module.id, EXPORT_NAME, null);
    (BODY)()
    return _retrieveGlobal();
  })
`);

export default function ({ types: t }) {
  return {
    visitor: {
      Program: {
        exit(path, { opts = {} }) {
          let { moduleName = null } = opts;
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          let { deps = [] } = opts;
          deps = deps.map(d => t.stringLiteral(d));

          const systemGlobal = t.identifier(opts.systemGlobal || "System");

          const { node } = path;
          const wrapper = t.functionExpression(null, [], t.blockStatement(node.body, node.directives));
          node.directives = [];

          const factory = buildFactory({
            SYSTEM_GLOBAL: systemGlobal,
            EXPORT_NAME: t.stringLiteral('null'),
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
