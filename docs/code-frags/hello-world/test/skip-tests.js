var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var testtube = carbon.testtube

module.exports = __(function() {
  return o.main({
    _type: testtube.Test,
    name: 'SkipTests',
    description: 'Demonstrate how to skip tests.',
    tests: [
      o({
        _type: testtube.Test,
        doTest: function() {
          throw new testtube.errors.SkipTestError('Skipping test because of foo')
        }
      }),
      o({
        _type: testtube.util.SkipTest,
        description: 'Skipping test because of foo'
      }),
      o({
        _type: testtube.Test,
        doTest: function() {
          throw new testtube.errors.NotImplementedError('Implement foo')
        }
      })
    ]
  })
})


