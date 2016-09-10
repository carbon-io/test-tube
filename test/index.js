var o = require('atom').o(module).main
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var Test = require('../lib/Test')

module.exports = o({
  _type: Test,
  name: "Testtube Tests",
  tests: [
    _o('./OrderingTests'),
    _o('./HttpTestTests')
  ]
})
