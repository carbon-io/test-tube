var carbon = require('carbon-io')

var __ = carbon.fibers.__(module)
var _o = carbon.bond._o(module)
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    /*
     * Test implementation
     */
    name: 'FooBarBazTests',
    descriptions: 'Test all the foos, bars, and bazes.',
    tests: [
      _o('./foo'),
      _o('./bar'),
      _o('./baz')
    ]
  })
})

