var __ = require('@carbon-io/fibers').__(module)
var _o = require('@carbon-io/bond')._o(module)
var o = require('@carbon-io/atom').o(module)

var testtube = require('../../lib')

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'FailWithSuccessfulExit',
    tests: {
      $property: {
        get: function() {
          return [
            _o('./doesNotExist')
          ]
        }
      }
    }
  })
})

