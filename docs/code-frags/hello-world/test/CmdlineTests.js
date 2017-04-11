var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module)
var o = carbon.atom.o(module)
var testtube = carbon.testtube

var HelloWorld = require('../lib/hello-world')

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'CmdlineTests',
    setup: function() {
      var self = this

      this._argv = process.argv
      this._log = console.log
      this._msgs = []

      console.log = function(msg) {
        self._msgs.push(msg)
      }
    },
    doTest: function() {
      var o = carbon.atom.o(require.main).main
      process.argv = [this._argv[0], 'test', 'say', '--name', 'foo']
      o.reset()
      o({_type: HelloWorld, runMainInFiber: false})
      process.argv = [this._argv[0], 'test', 'yell', '--name', 'foo']
      o.reset()
      o({_type: HelloWorld, runMainInFiber: false})
      process.argv = [this._argv[0], 'test', 'scream', '--name', 'foo']
      o.reset()
      o({_type: HelloWorld, runMainInFiber: false})
      assert.deepEqual(['Hello foo.', 'HELLO FOO!',  'HELLO FOO!!!'], this._msgs) 
    },
    teardown: function() {
      process.argv = this._argv
      console.log = this._log
    }
  })
})

