var assert = require('assert')

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var testtube = carbon.testtube

module.exports = __(function() {
  return o.main({
    _type: testtube.Test,
    name: 'SimpleNestedTests',
    description: 'A simple set of tests',
    setup: function() {
      assert(typeof this.level === 'undefined')
      this.level = 0
    },
    doTest: function() {
      assert.equal(this.level, 0)
    },
    teardown: function() {
      assert.equal(this.level, 0)
      delete this.level
    },
    tests: [
      o({
        _type: testtube.Test,
        name: 'SimpleNestedTest',
        setup: function() {
          this._oldLevel = this.parent.level
          this.parent.level += 1
        },
        doTest: function() {
          assert.equal(this.parent.level, this._oldLevel + 1)
        },
        teardown: function() {
          try {
            assert.equal(this.parent.level, this._oldLevel + 1)
          } finally {
            this.parent.level = this._oldLevel
          }
        },
        tests: [
          o({
            _type: testtube.Test,
            name: 'SimpleDoubleNestedAsyncTest',
            setup: function(_, done) {
              var self = this
              setImmediate(function() {
                self._oldLevel = self.parent.parent.level
                self.parent.parent.level += 1
                done()
              })
            },
            doTest: function(_, done) {
              var self = this
              setImmediate(function() {
                var err = undefined
                try {
                  assert.equal(self.parent.parent.level, self._oldLevel + 1)
                } catch (e) {
                  err = e
                }
                done(err)
              })
            },
            teardown: function(_, done) {
              var self = this
              setImmediate(function() {
                var err = undefined
                try {
                  assert.equal(self.parent.parent.level, self._oldLevel + 1)
                } catch (e) {
                  err = e
                } finally {
                  self.parent.parent.level = self._oldLevel
                }
                done(err)
              })
            },
            tests: [
              o({
                _type: testtube.Test,
                name: 'SimpleTripleNestedTest',
                setup: function() {
                  this._oldLevel = this.parent.parent.parent.level 
                  this.parent.parent.parent.level += 1
                },
                doTest: function() {
                  assert.equal(
                    this.parent.parent.parent.level, this._oldLevel + 1)
                },
                teardown: function() {
                  try {
                    assert.equal(
                      this.parent.parent.parent.level, this._oldLevel + 1)
                  } finally {
                    this.parent.parent.parent.level = this._oldLevel
                  }
                }
              })
            ]
          })
        ]
      })
    ]
  })
})


