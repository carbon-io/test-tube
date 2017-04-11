var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var _o = carbon.bond._o(module)
var testtube = carbon.testtube

 __(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'HelloWorldTestSuite',
    description: 'A test suite demonstrating Test-Tube\'s various features.',
    tests: [
      _o('./SimpleBareBonesTest'),
      _o('./SimpleTest'),
      _o('./SimpleAsyncTest'),
      _o('./SimpleTests'),
      _o('./SimpleNestedTests'),
      _o('./CmdlineTests'),
      _o('./ContextTests'),
      _o('./HttpTests'),
      _o('./SkipTests')
    ]
  })
})
