import template from "babel-template";

let buildTemplate = template(`
  SYSTEM_REGISTER(MODULE_NAME, [SOURCES], false, BODY);
`);

let buildFactory = template(`
  (function ($__require, $__exports, $__module) {
    var _retrieveGlobal = SYSTEM_GLOBAL.get("@@global-helpers").prepareGlobal($__module.id, EXPORT_NAME, null);
    (BODY)()
    return _retrieveGlobal();
  })
`);

export default function ({types: t}) {
  return {
    visitor: {
      Program: {
        exit(path, {opts = {}}) {
          let moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const systemGlobal = t.identifier(opts.systemGlobal || "System");

          let {node} = path;
          let wrapper = t.functionExpression(null, [], t.blockStatement(node.body, node.directives));
          node.directives = [];

          let factory = buildFactory({
            SYSTEM_GLOBAL: systemGlobal,
            EXPORT_NAME: t.stringLiteral('null'),
            BODY: wrapper
          });

          node.body = [buildTemplate({
            SYSTEM_REGISTER: t.memberExpression(systemGlobal, t.identifier("registerDynamic")),
            MODULE_NAME: moduleName,
            SOURCES: [],
            BODY: factory
          })];
        }
      }
    }
  };
}
