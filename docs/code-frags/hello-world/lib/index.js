var carbon = require('carbon-io')
var o = carbon.atom.o(module).main
var __ = carbon.fibers.__(module).main

var HelloWorld = require('./hello-world')

__(function() {
  o({
    _type: HelloWorld
  })
})

