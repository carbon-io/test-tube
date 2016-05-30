var o = require('atom').o(module)
var _o = require('bond')._o(module)
var __ = require('fiber').__.main(module)
var _ = require('lodash')
var assert = require('assert')

/******************************************************************************
 * http-test-tests
 */
var visited = []
var url = "https://raw.githubusercontent.com/carbon-io/test-tube/master/test/fixtures/test1.json?token=AAtDzcd2-p2GjxzNTRoX1SZ41_pnmMH0ks5XVeADwA%3D%3D"

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
   * baseUrl
   */
  baseUrl: "https://raw.githubusercontent.com",

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
        url: "/carbon-io/test-tube/master/test/fixtures/test1.json?token=AAtDzRAYNtoNk24O57llebX9poca0oiHks5XVd9twA%3D%3D",
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
    {
      reqSpec: {
        url: "/doesnotexist",
        method: "GET"
      },
      resSpec: {
        statusCode: 400
      },
    },
  ]
})

__(function() {
  test.run()
})

