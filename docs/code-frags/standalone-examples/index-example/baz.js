var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module)
var _o = carbon.bond._o(module)
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'BazTests',
    descriptions: 'Test baz.',
    tests: [
      o({
        _type: testtube.Test,
        name: 'BazTest',
        doTest: function() {
          assert(true)
        }
      })
    ]
  })
})



