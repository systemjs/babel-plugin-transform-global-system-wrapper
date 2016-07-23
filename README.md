# babel-plugin-transform-global-system-register-dynamic

Converts global scripts into named `System.registerDynamic('name', [], ...`

## Example

**In**

```js
window.foo = {};
```

**Out**

```js
System.registerDynamic("foo", [], false, function($__require, $__exports, $__module) {
    var _retrieveGlobal = System.get("@@global-helpers").prepareGlobal($__module.id, "foo", null);
    (function() {
        window.foo = {};
    })();
    return _retrieveGlobal();
});
```

## Installation

```sh
$ npm install babel-plugin-transform-global-system-register-dynamic
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    ["transform-global-system-register-dynamic", {
      "moduleName": "foo",
      "systemGlobal": "SystemJS"
    }]
  ]
}
```

### Via CLI

```sh
$ babel --plugins transform-global-system-register-dynamic script.js
```

### Via Node API (Recommended)

```javascript
require("babel-core").transform("code", {
  plugins: [
    ["transform-global-system-register-dynamic", {
      moduleName: "foo",
      systemGlobal: "SystemJS",
      map: function(name) {
        return normalize(name);
      }
    }]
  ]
});
```
