var o = require('@carbon-io/atom').o(module).main
var _o = require('@carbon-io/bond')._o(module)
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
      name: 'namedTest',
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
          assert.equal(statusCode, 200)
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
        assert.equal(res.statusCode, 200)
      },
    },
    {
      reqSpec: function(history) {
        assert.equal(this.parent, HttpTestTests)
        assert(history.getRes(-1).body.a === 1)
        return {
          url: url,
          method: "GET"
        }
      },
      resSpec: function(res) { 
        assert.equal(res.statusCode, 200)
      },
    },
    {
      name: 'doesNotExistTest',
      reqSpec: {
        url: "/doesnotexist",
        method: "GET"
      },
      resSpec: {
        statusCode: 404
      },
    },
    {
      name: 'reqResHistoryTest',
      reqSpec: function(history) {
        var req = history.getReqSpec('namedTest')
        assert.deepEqual(history.getReqSpec(0), req)
        assert.equal(req.url, url)
        assert.equal(req.method, 'GET')
        reqSpec = history.getReqSpec(-1)
        assert.equal(reqSpec.url, this.parent.baseUrl + '/doesnotexist')
        req = history.getReq(-1)
        assert(req.finished)
        assert.equal(req.path, '/doesnotexist')
        assert.equal(req.method, 'GET')
        return reqSpec
      },
      resSpec: function(response, history) {
        var resSpec = history.getResSpec(-1)
        var res = history.getRes('doesNotExistTest')
        assert.deepEqual(resSpec, {statusCode: 404})
        assert.deepEqual(_.pick(res.toJSON(), ['statusCode', 'request']), 
                         _.pick(response.toJSON(), ['statusCode', 'request']))
      }
    },
    {
      name: 'assertionErrorHistoryLengthTest',
      errorExpected: /Request spec must provide a method\./,
      setup: function() {
        this.history = undefined
        this.historyLength = undefined
      },
      reqSpec: function(history) {
        assert.equal(_.uniqBy([
          history._requestSpecs,
          history._responseSpecs,
          history._requests,
          history._responses], 'length').length,
          1)
        this.history = history
        this.historyLength = history._requestSpecs.length
        return {
          // XXX: no method provided, should throw
          url: '/foobarbaz',
        }
      },
      resSpec: {
        statusCode: 200
      },
      teardown: function() {
        assert.equal(_.uniqBy([
          this.history._requestSpecs,
          this.history._responseSpecs,
          this.history._requests,
          this.history._responses], 'length').length,
          1)
        assert.equal(this.history._requestSpecs.length, 
                     this.historyLength + 1)
      }
    },
    o({
      _type: '../lib/HttpTest',
      name: 'testReqSpecFunctionNoBaseUrl',
      tests: [
        {
          reqSpec: function() {
            return {
              url: url,
              method: 'GET'
            }
          },
          resSpec: {
            statusCode: 200
          }
        }
      ]
    }),
    o({
      _type: '../lib/Test',
      name: 'setupTeardownHooksTest',
      description: 'HttpTest child test setup/teardown hooks test',
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
    }),
    o({
      _type: '../lib/HttpTest',
      name: 'httpHistoryStashRestoreTest',
      baseUrl: "http://pastebin.com/raw",
      setup: function() {
        this.httpHistoriesLength = this.context._httpHistories.stack.length
        assert(this.httpHistoriesLength >= 0)
        assert.equal(this._history.length, 0)
      },
      teardown: function() {
        assert.equal(this.context._httpHistories.stack.length, 
                     this.httpHistoriesLength)
        assert.equal(this._history.length, 2)
      },
      tests: [
        {
          name: 'firstFirstLevelHttpHistoryStashRestoreTest',
          reqSpec: {
            url: '/ewNZGrjd',
            method: 'GET'
          },
          resSpec: {
            statusCode: 200
          }
        },
        o({
          _type: '../lib/HttpTest',
          name: 'subHttpHistoryStashRestoreTest',
          baseUrl: "http://pastebin.com/raw",
        setup: function() {
          this.httpHistoriesLength = this.context._httpHistories.stack.length
          assert(this.httpHistoriesLength > this.parent.httpHistoriesLength)
          assert.equal(this._history.length, 0)
        },
        teardown: function() {
          assert.equal(this.context._httpHistories.stack.length, 
                       this.httpHistoriesLength)
          assert.equal(this._history.length, 2)
        },
          tests: [
            {
              name: 'firstSecondLevelHttpHistoryStashRestoreTest',
              reqSpec: {
                url: '/ewNZGrjd',
                method: 'GET'
              },
              resSpec: {
                statusCode: 200
              }
            },
            {
              name: 'secondSecondLevelHttpHistoryStashRestoreTest',
              reqSpec: {
                url: '/ewNZGrjd',
                method: 'GET'
              },
              resSpec: {
                statusCode: 200
              }
            }
          ],
        }),
        {
          name: 'secondFirstLevelHttpHistoryStashRestoreTest',
          reqSpec: {
            url: '/ewNZGrjd',
            method: 'GET'
          },
          resSpec: {
            statusCode: 200
          }
        },
      ]
    })
  ]
})

module.exports = HttpTestTests
