#!/usr/bin/env node

process.chdir('/code');

var exec = require('child_process').execSync;

console.log(exec("/usr/src/app/node_modules/ember-watson/bin/ember-watson all --dry-run").toString());
