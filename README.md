# babel-plugin-transform-global-system-wrapper

Converts global scripts into named `System.registerDynamic('name', [], ...`

_For SystemJS 0.19 and below use the 0.0.1 version._

## Example

**In**

```js
foo = "bar";
```

**Out**

```js
System.registerDynamic("foo", [], function ($__require, $__exports, $__module) {
  var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, "foo", null);

  (function ($__global) {
    foo = "bar";
  })(this);

  return _retrieveGlobal();
});
```

## Installation

```sh
$ npm install babel-plugin-transform-global-system-wrapper
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    ["transform-global-system-wrapper", {
      "deps": ["baz.js"],
      "exportName": "foo",
      "globals": {
        "jquery": "jquery.js"
      },
      "moduleName": "foo",
      "systemGlobal": "SystemJS"
    }]
  ]
}
```

### Via CLI

```sh
$ babel --plugins transform-global-system-wrapper script.js
```

### Via Node API (Recommended)

```javascript
require("babel-core").transform("code", {
  plugins: [
    ["transform-global-system-wrapper", {
      deps: ["baz.js"],
      exportName: "foo",
      globals: {
        "jquery": "jquery.js"
      },
      moduleName: "foo",
      systemGlobal: "SystemJS",
    }]
  ]
});
```
