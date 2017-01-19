var o = require('@carbon-io/atom').o(module).main
var oo = require('@carbon-io/atom').oo(module)
var _o = require('@carbon-io/bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
var Test = require('../lib/Test')

module.exports = o({
  _type: Test,
  name: "Testtube Tests",
  tests: [
    _o('./TestTests'),
    _o('./OrderingTests'),
    _o('./HttpTestTests'),
    _o('./UtilTests')
  ]
})
