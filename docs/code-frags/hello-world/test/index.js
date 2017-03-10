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
      _o('./simple-bare-bones-test'),
      _o('./simple-test'),
      _o('./simple-async-test'),
      _o('./simple-tests'),
      _o('./simple-nested-tests'),
      _o('./cmdline-tests'),
      _o('./context-tests'),
      _o('./http-tests'),
      _o('./skip-tests')
    ]
  })
})
