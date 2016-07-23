var o = require('atom').o(module)
var oo = require('atom').oo(module)
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module)
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
      setup: function() { visited.push("SETUP-" + this.name) },
      teardown: function() { visited.push("TEARDOWN-" + this.name) },
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
      setup: function(done) { visited.push("SETUP-" + this.name); done() },
      tests: [
        o({
          _type: '../lib/Test',
          name: "T2.0",
          doTest: function() { visited.push(this.name) }
        }),
        o({
          _type: '../lib/Test',
          name: "T2.1",
          teardown: function(done) { visited.push("TEARDOWN-" + this.name); done() },
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
      setup: function(done) { visited.push("SETUP-" + this.name); done() },
      teardown: function(done) { visited.push("TEARDOWN-" + this.name); done() },
      tests: [
        o({
          _type: '../lib/Test',
          name: "T4.0",
          doTest: function() { visited.push(this.name) },
          teardown: function() { visited.push("TEARDOWN-" + this.name) }
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
    o({
      _type: '../lib/Test',
      name: "T6",
      doTest: function() { throw new Error("Expected") },
      teardown: function() { finalTDCalled = true }
    }),
  ]
})

var finalTDCalled = false

__(function() {
  try {
    suite.run()
  } catch (e) {
    if (e.message !== "Expected") {
      console.log(e.stack)
      process.exit(1)
    }
  }

  try { // Do not combine with "try" above. Need to handle "Expected" Error up there
    assert.deepEqual(visited, 
                     ["SETUP-T0","T0","TEARDOWN-T0","T1","SETUP-T2","T2.0",
                      "T2.1","TEARDOWN-T2.1","T2.2", "T3","SETUP-T4","T4.0",
                      "TEARDOWN-T4.0","T4.1","TEARDOWN-T4","T5"])
    assert.ok(finalTDCalled)
  } catch (e) {
    console.log(e.stack)
    process.exit(1)
  }
})


