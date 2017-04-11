var carbon = require('carbon-io')
var o = carbon.atom.o(module)
var __ = carbon.fibers.__(module)

var HelloWorld = require('./hello-world')

__(function() {
  o.main({
    _type: HelloWorld
  })
})

