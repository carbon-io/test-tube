var o = require('atom').o(module).main
var _o = require('bond')._o(module)
var __ = require('fiber').__
var _ = require('lodash')
var assert = require('assert')

/******************************************************************************
 * http-test-tests
 */
var visited = []
var url = "https://raw.githubusercontent.com/carbon-io/test-tube/master/test/fixtures/test1.json?token=AAtDzfV-iOqjMHHVTkjx0tnK2AfC64NPks5XR9NYwA%3D%3D"

var test = o({

  /**********************************************************************
   * _type
   */
  _type: '../lib/HttpTest',

  /**********************************************************************
   * name
   */
  name: "httptest",

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
        url: url,
        method: "GET"
      },
      resSpec: {
        statusCode: function(statusCode) { return statusCode === 200 },
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
      resSpec: function(res) { return res.statusCode === 200 },
    },
    {
      reqSpec: function(prevResponse) {
        assert(prevResponse.body.a === 1)
        return {
          url: url,
          method: "GET"
        }
      },
      resSpec: function(res) { return res.statusCode === 200 },
    },
  ]
})

