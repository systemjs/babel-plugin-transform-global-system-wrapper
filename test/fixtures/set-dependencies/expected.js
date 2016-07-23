System.registerDynamic(["baz", "qux"], false, function ($__require, $__exports, $__module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, "null", null);

  (function () {
    var foo = "bar";
  })();

  return _retrieveGlobal();
});
