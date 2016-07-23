System.registerDynamic([], false, function ($__require, $__exports, $__module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, "foo", null);

  (function () {
    var foo = "bar";
  })();

  return _retrieveGlobal();
});
