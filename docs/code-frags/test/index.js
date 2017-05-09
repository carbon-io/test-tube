var mockery = require('mockery')

var atom = require('@carbon-io/atom')
var o = atom.o(module)
var bond = require('@carbon-io/bond')
var _o = bond._o(module)
var fibers = require('@carbon-io/fibers')
var __ = fibers.__(module)
var testtube = require('../../../lib')

var carbonioMock = {
  atom: atom,
  bond: bond,
  fibers: fibers,
  testtube: testtube
}

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: "DocsCodeFragsTests",
    tests: {
      $property: {
        get: function() {
          try {
            mockery.registerMock('carbon-io', carbonioMock)
            mockery.enable({
              warnOnReplace: false,
              warnOnUnregistered: false
            })
            return [
              _o('../hello-world/test'),
              _o('../standalone-examples/index-example')
            ]
          } finally {
            mockery.disable()
            mockery.deregisterMock('carbon-io')
          }
        }
      }
    }
  })
})

