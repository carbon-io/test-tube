var o = require('atom').o(module).main
var _o = require('bond')._o(module)
var __ = require('@carbon-io/fibers').__(module).main
var _ = require('lodash')
var assert = require('assert')

/******************************************************************************
 * HttpTestTests
 */
var url = "http://pastebin.com/raw/ewNZGrjd"

module.exports = o({

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
        statusCode: 404
      },
    },
  ]
})

