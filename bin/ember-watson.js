#!/usr/bin/env node

/* jshint multistr: true */
process.chdir('/code');

var exec = require('child_process').execSync;
var fs = require('fs');
var Watson = require('ember-watson');
var CODE_DIR = 'app';
try {
  fs.accessSync('app');
  CODE_DIR ='app';
} catch (e) {
  CODE_DIR ='addon';
}

var formulae = [{
  name: 'QUnit 1.x tests detected',
  command: 'transformQUnitTest',
  path: 'tests',
  description: 'Tests using QUnit 1.x have a different format than QUnit 2.x.\n\
\n\
To fix this, run `ember watson:upgrade-qunit-tests`.',
}, {
  name: 'Detected use of .observes and .property on functions',
  command: 'transformPrototypeExtensions',
  path: CODE_DIR,
  description: 'Ember is discouraging using prototype extensions. For more info about this please refer to the following PR [Encourage decorator-style Ember.computed/Ember.observer](https://github.com/emberjs/guides/pull/110).\n\
\n\
To fix this, run `ember watson:convert-prototype-extensions`.',
}, {
  name: 'Detected implicit synchronous relationships',
  command: 'transformEmberDataAsyncFalseRelationships',
  path: CODE_DIR,
  description: 'Ember Data 2.0 relationships are asynchronous by default. Synchronous relationships will still be supported but you will need to manually opt into them by setting { async: false } on your relationships.\n\
\n\
To fix this, run `ember watson:convert-ember-data-async-false-relationships`.'
}, {
  name: 'Detected non-standard model lookups',
  command: 'transformEmberDataModelLookups',
  path: CODE_DIR,
  description: 'Ember Data 2.0 now uses dasherized strings to lookup models instead of camel cased strings. For example:\n\
\n\
```hbs\n\
export default DS.Model.extend({\n\
  postComments: DS.hasMany(\'post-comment\', {async: true})\n\
});\n\
```\n\
\n\
To fix this, run `ember watson:convert-ember-data-model-lookups`.'
}, {
  name: 'Detected use of deprecated resource() call in app/router.js',
  command: 'transformResourceRouterMapping',
  path: CODE_DIR + '/router.js',
  description: 'Ember no longer supports this.resource() in route definitions. Instead of using `this.resource(\'user\')`, use `this.route(\'user\',  { resetNamespace: true })`.\n\
\n\
To fix this, run `ember watson:convert-resource-router-mapping`.'
}, {
  name: 'Detected ES5 method syntax',
  command: 'transformMethodify',
  path: CODE_DIR,
  description: 'Newer versions of JavaScript provide a shorthand syntax for functions.\n\
\n\
```js\n\
import Ember from \'ember\';\n\
\n\
export default Ember.Component.extend({\n\
  click() {\n\
    this.get(\'onclick\')();\n\
  }\n\
});\n\
```\n\
\n\
To fix this, run `ember watson:methodify`.'
}, {
  name: 'Detected overloaded computed properties',
  command: 'findOverloadedCPs',
  path: CODE_DIR,
  description: 'Ember no longer supports a getter and setter within the same function. A computed property that converted user entered numbers into a JavaScript number may look like the following in the old syntax:\n\
\n\
```js\n\
import Ember from \'ember\';\n\
\n\
export default function () {\n\
  return Ember.computed(function (...args) {\n\
    if (args.length > 1) {\n\
      return parseInt(args[1], 10);\n\
    }\n\
    return 0;\n\
  });\n\
};\n\
```\n\
\n\
In the new format, these are separated into a `get` and `set` method:\n\
\n\
```js\n\
import Ember from \'ember\';\n\
\n\
export default function () {\n\
  return Ember.computed({\n\
    get() {\n\
      return 0;\n\
    },\n\
    set() {\n\
      return parseInt(args[1], 10);\n\
    }\n\
  });\n\
};\n\
```\n\
\n\
To fix this, run `ember watson:find-overloaded-cps`.'
}, {
  name: 'Detected missing destroyApp helper in acceptance tests',
  command: 'transformTestToUseDestroyApp',
  path: 'tests/acceptance',
  description: 'Ember CLI 1.13.9 introduced a destroyApp helper that centralizes app destroying in acceptance tests.\n\
\n\
To fix this, run `ember watson:use-destroy-app-helper`.'
}, {
  name: 'Detected needs instead of Ember.inject.controller',
  command: 'replaceNeedsWithInjection',
  path: CODE_DIR,
  description: 'Ember has deprecated `needs` in favor of injecting controllers directly using `Ember.inject.controller.`.\n\
\n\
To fix this, run `ember watson:replace-needs-with-injection`.'
}, {
  name: 'Detected isNewSerializerApi in serializers',
  command: 'removeEmberDataIsNewSerializerAPI',
  path: CODE_DIR + '/serializers',
  description: 'Ember Data 2.0 no longers needs `isNewSerializer` in custom serializers defined in your app.\n\
\n\
To fix this, run `ember watson:remove-ember-data-is-new-serializer-api`.'
}];

var watson = new Watson();

formulae.forEach(function (formula) {
  console._log = console.log;

  var locations = [];
  console.log = function (location) {
    var file = fs.readFileSync(location.path).toString();
    var lines = file.split('\n');
    locations.push({
      path: location.path,
      positions: {
        begin: {
          line: 0,
          column: 0
        },
        end: {
          line: lines.length,
          column: lines[lines.length -1].length
        }
      }
    });
  };

  var results = watson[formula.command](formula.path, true);
  if (results) {
    locations = results.findings.map(function (finding) {
      return {
        path: finding.filename,
        positions: {
          begin: finding.loc.start,
          end: finding.loc.end
        }
      };
    });
  }

  console.log = console._log;

  locations.forEach(function (location) {
    console.log(JSON.stringify({
      type: 'issue',
      check_name: formula.name,
      description: formula.description,
      categories: ['Compatibility'],
      location: location
    }) + '\0');
  });
});
