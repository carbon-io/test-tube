var o = require('@carbon-io/atom').o(module)
var _o = require('@carbon-io/bond')._o(module)
var __ = require('@carbon-io/fibers').__(module).main
var Test = require('../lib/Test')

__(function() {
  module.exports = o.main({
    _type: Test,
    name: "TesttubeTests",
    tests: [
      _o('./TestTests'),
      _o('./OrderingTests'),
      _o('./HttpTestTests'),
      _o('./UtilTests'),
      _o('../docs/code-frags/test')
    ]
  })
})
