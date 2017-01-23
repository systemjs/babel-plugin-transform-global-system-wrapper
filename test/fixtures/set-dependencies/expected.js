System.registerDynamic(["baz", "qux"], function ($__require, $__exports, $__module) {
  $__require("baz");
  $__require("qux");

  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, null, null);

  (function ($__global) {
    foo = "bar";
  })(this);

  return _retrieveGlobal();
});
