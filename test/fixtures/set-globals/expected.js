System.registerDynamic([], false, function ($__require, $__exports, $__module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, null, {
    "baz": $__require("qux"),
    "eggs": $__require("bacon")
  });

  (function () {
    var foo = "bar";
  })();

  return _retrieveGlobal();
});