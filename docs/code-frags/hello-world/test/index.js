var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module).main
var _o = carbon.bond._o(module)
var testtube = carbon.testtube

module.exports = __(function() {
  return o({
    _type: testtube.Test,
    name: 'HelloWorldTestSuite',
    description: 'A test suite demonstrating Test-Tube\'s various features.',
    doTest: function() {
    },
    tests: [
      _o('./simple-test'),
      _o('./simple-tests'),
      _o('./simple-nested-tests'),
      _o('./cmdline-tests'),
      _o('./context-tests'),
      _o('./http-tests')
    ]
  })
})
