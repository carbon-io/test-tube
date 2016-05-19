var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__
var _ = require('lodash')
var assert = require('assert')

/******************************************************************************
 * ordering-tests
 */
var visited = []

var suite = o({

  /**********************************************************************
   * _type
   */
  _type: '../lib/TestSuite',

  /**********************************************************************
   * name
   */
  name: "ordering-test",

  /**********************************************************************
   * tests
   */
  tests: [
    o({
      _type: '../lib/Test',
      name: "T0",
      doTest: function(done) { visited.push(this.name); done() }
    }),
    o({
      _type: '../lib/Test',
      name: "T1",
      // XXX come back to the case where this done() is not called. Program exits in way I would not expect. 
      doTest: function(done) { visited.push(this.name); done() } 
    }),
    o({
      _type: '../lib/TestSuite',
      name: "T2",
      tests: [
        o({
          _type: '../lib/Test',
          name: "T2.0",
          doTest: function() { visited.push(this.name) }
        }),
        o({
          _type: '../lib/Test',
          name: "T2.1",
          doTest: function(done) { visited.push(this.name); done() }
        }),
        o({
          _type: '../lib/Test',
          name: "T2.2",
          doTest: function() { visited.push(this.name) }
        }),
      ]
    }),
    o({
      _type: '../lib/Test',
      name: "T3",
      doTest: function(done) { visited.push(this.name); process.nextTick(done) }
    }),
    o({
      _type: '../lib/TestSuite',
      name: "T4",
      tests: [
        o({
          _type: '../lib/Test',
          name: "T4.0",
          doTest: function() { visited.push(this.name) }
        }),
        o({
          _type: '../lib/Test',
          name: "T4.1",
          doTest: function() { visited.push(this.name) }
        })
      ]
    }),
    o({
      _type: '../lib/Test',
      name: "T5",
      doTest: function() { visited.push(this.name) }
    }),
  ]
})


__(function() {
  try {
    suite.run()
  } catch (e) {
    console.log(e)
  }
  assert.deepEqual(visited, ["T0", "T1", "T2.0", "T2.1", "T2.2", "T3", "T4.0", "T4.1", "T5"])
})


