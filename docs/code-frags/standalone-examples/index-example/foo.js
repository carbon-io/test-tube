var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module)
var _o = carbon.bond._o(module)
var o = carbon.atom.o(module)
var testtube = carbon.testtube

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'FooTests',
    descriptions: 'Test foo.',
    tests: [
      o({
        _type: testtube.Test,
        name: 'FooTest',
        doTest: function() {
          assert(true)
        }
      })
    ]
  })
})


