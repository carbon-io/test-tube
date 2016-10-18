var o = require('@carbon-io/atom').o(module).main
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module).main
var _ = require('lodash')
var assert = require('assert')

/******************************************************************************
 * HttpTestTests
 */
var url = "http://pastebin.com/raw/ewNZGrjd"

var HttpTestTests = o({

  /**********************************************************************
   * _type
   */
  _type: '../lib/HttpTest',

  /**********************************************************************
   * name
   */
  name: "HttpTestTests",

  /**********************************************************************
   * baseUrl
   */
  baseUrl: "http://pastebin.com/raw",

  /**********************************************************************
   * tests
   */
  tests: [
    {
      reqSpec: {
        url: url,
        method: "GET"
      },
      resSpec: {
        statusCode: 200,
        body: {
          a: 1,
          b: "hello",
          c: [ true, false ]
        }
      }
    },
    {
      reqSpec: {
        url: "/ewNZGrjd",
        method: "GET"
      },
      resSpec: {
        statusCode: function(statusCode) {
          assert.equal(this.parent, HttpTestTests)
          return statusCode === 200
        },
        body: {
          a: 1,
          b: "hello",
          c: [ true, false ]
        }
      }
    },
    {
      reqSpec: {
        url: url,
        method: "GET"
      },
      resSpec: function(res) {
        assert.equal(this.parent, HttpTestTests)
        return res.statusCode === 200
      },
    },
    {
      reqSpec: function(prevResponse) {
        assert.equal(this.parent, HttpTestTests)
        assert(prevResponse.body.a === 1)
        return {
          url: url,
          method: "GET"
        }
      },
      resSpec: function(res) { return res.statusCode === 200 },
    },
    {
      reqSpec: {
        url: "/doesnotexist",
        method: "GET"
      },
      resSpec: {
        statusCode: 404
      },
    },
    o({
      _type: '../lib/Test',
      name: 'TestSetupTeardownHooks',
      description: 'Test HttpTest child test setup/teardown hooks',
      doTest: function() {
        var testSuite = o({
          _type: '../lib/HttpTest',
          _C: function() {
            this.setupCalled = false
            this.teardownCalled = false
          },
          baseUrl: "http://pastebin.com/raw",
          tests: [
            {
              setup: function() {
                this.parent.setupCalled = true
              },
              teardown: function() {
                this.parent.teardownCalled = true
              },
              reqSpec: {
                url: url,
                method: "GET"
              },
              resSpec: {
                statusCode: 200,
                body: {
                  a: 1,
                  b: "hello",
                  c: [ true, false ]
                }
              }
            }
          ]
        })
        var result = testSuite.run()
        assert(result.passed)
        assert(testSuite.setupCalled)
        assert(testSuite.teardownCalled)
      }
    })
  ]
})

module.exports = HttpTestTests
