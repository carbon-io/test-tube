var assert = require('assert')
var querystring = require('querystring')
var urlResolve = require('url').resolve

var _ = require('lodash')
var nock = require('nock')
var sinon = require('sinon')

var __ = require('@carbon-io/fibers').__(module)
var _o = require('@carbon-io/bond')._o(module)
var o = require('@carbon-io/atom').o(module)

var HttpTest = require('../lib/HttpTest')

/******************************************************************************
 * HttpTestTests
 */
var baseUrl = "http://pastebin.com"
var path = "/raw/ewNZGrjd"
var url = urlResolve(baseUrl, path)

__(function() {
  var HttpTestTests = o.main({

    /**********************************************************************
     * _type
     */
    _type: HttpTest,

    /**********************************************************************
     * name
     */
    name: "HttpTestTests",

    /**********************************************************************
     * baseUrl
     */
    baseUrl: baseUrl,

    /**********************************************************************
     * setup
     */
    setup: function(ctx, done) {
      HttpTest.prototype.setup.call(this, ctx, done)
      nock.disableNetConnect()
    },

    /**********************************************************************
     * teardown
     */
    teardown: function(ctx, done) {
      nock.enableNetConnect()
      HttpTest.prototype.teardown.call(this, ctx, done)
    },

    /**********************************************************************
     * tests
     */
    tests: [
      {
        name: 'namedTest',
        setup: function() {
          this.scope = nock(baseUrl).get(path).reply(200, {
            a: 1,
            b: "hello",
            c: [ true, false ]
          })
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
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
      },
      {
        setup: function() {
          this.scope = nock(baseUrl).get(path).reply(200, {
            a: 1,
            b: "hello",
            c: [ true, false ]
          })
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: {
          url: path,
          method: "GET"
        },
        resSpec: {
          statusCode: function(statusCode) {
            assert.equal(this.parent.name, 'HttpTestTests')
            assert.equal(statusCode, 200)
          },
          body: {
            a: 1,
            b: "hello",
            c: [ true, false ]
          },
        }
      },
      {
        setup: function() {
          this.scope = nock(baseUrl).get(path).reply(200, {
            a: 1,
            b: "hello",
            c: [ true, false ]
          })
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: {
          url: url,
          method: "GET"
        },
        resSpec: function(res) {
          assert.equal(this.parent.name, 'HttpTestTests')
          assert.equal(res.statusCode, 200)
        },
      },
      {
        setup: function() {
          this.scope = nock(baseUrl).get(path).reply(200, {
            a: 1,
            b: "hello",
            c: [ true, false ]
          })
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: function(context) {
          assert.equal(this.parent.name, 'HttpTestTests')
          assert(context.httpHistory.getRes(-1).body.a === 1)
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
        setup: function() {
          this.scope = nock(baseUrl).get('/doesnotexist').reply(404)
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
        },
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
        setup: function() {
          this.scope = nock(baseUrl).get('/doesnotexist').reply(404)
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: function(context) {
          var req = context.httpHistory.getReqSpec('namedTest')
          assert.deepEqual(context.httpHistory.getReqSpec(0), req)
          assert.equal(req.url, url)
          assert.equal(req.method, 'GET')
          reqSpec = context.httpHistory.getReqSpec(-1)
          assert.equal(reqSpec.url, this.parent.baseUrl + '/doesnotexist')
          req = context.httpHistory.getReq(-1)
          // XXX: the request doesn't appear to get updated when using nock
          // assert(req.finished)
          // assert.equal(req.method, 'GET')
          assert.equal(req.path, '/doesnotexist')
          return reqSpec
        },
        resSpec: function(response, context) {
          var resSpec = context.httpHistory.getResSpec(-1)
          var res = context.httpHistory.getRes('doesNotExistTest')
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
        reqSpec: function(context) {
          assert.equal(_.uniqBy([
            context.httpHistory._requestSpecs,
            context.httpHistory._responseSpecs,
            context.httpHistory._requests,
            context.httpHistory._responses], 'length').length,
            1)
          this.history = context.httpHistory
          this.historyLength = context.httpHistory._requestSpecs.length
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
            setup: function() {
              this.scope = nock(baseUrl).get(path).reply(200)
            },
            teardown: function() {
              try {
                this.scope.done()
              } finally {
                nock.cleanAll()
              }
            },
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
        setup: function() {
          this.sandbox = sinon.sandbox.create()
          this.scope = nock(baseUrl).get(path).reply(200, {
            a: 1,
            b: "hello",
            c: [ true, false ]
          })
        },
        teardown: function() {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
          this.sandbox.restore()
        },
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
          this.sandbox.stub(_o('../lib/Test').prototype, '_log', function() {})
          var result = testSuite.run()
          assert(result.passed)
          assert(testSuite.setupCalled)
          assert(testSuite.teardownCalled)
        }
      }),
      o({
        _type: '../lib/HttpTest',
        name: 'httpHistoryStashRestoreTest',
        baseUrl: baseUrl,
        setup: function(context) {
          this.statesLength = context.__testtube.localStateStack.length
          assert(this.statesLength >= 0)
          assert.equal(context.httpHistory.length, 0)
          this.scope = nock(baseUrl).get(path).times(4).reply(200)
          this.scope.get(function(uri) {
            return uri !== url
          }).optionally().reply(404)
        },
        teardown: function(context) {
          try {
            this.scope.done()
          } finally {
            nock.cleanAll()
          }
          assert.equal(context.__testtube.localStateStack.length,
                       this.statesLength)
          assert.equal(context.httpHistory.length, 2)
        },
        tests: [
          {
            name: 'firstFirstLevelHttpHistoryStashRestoreTest',
            reqSpec: {
              url: path,
              method: 'GET'
            },
            resSpec: {
              statusCode: 200
            }
          },
          o({
            _type: '../lib/HttpTest',
            name: 'subHttpHistoryStashRestoreTest',
            baseUrl: baseUrl,
            setup: function(context) {
              this.statesLength = context.__testtube.localStateStack.length
              assert(this.statesLength > this.parent.statesLength)
              assert.equal(context.httpHistory.length, 0)
            },
            teardown: function(context) {
              assert.equal(context.__testtube.localStateStack.length, this.statesLength)
              assert.equal(context.httpHistory.length, 2)
            },
            tests: [
              {
                name: 'firstSecondLevelHttpHistoryStashRestoreTest',
                reqSpec: {
                  url: path,
                  method: 'GET'
                },
                resSpec: {
                  statusCode: 200
                }
              },
              {
                name: 'secondSecondLevelHttpHistoryStashRestoreTest',
                reqSpec: {
                  url: path,
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
              url: path,
              method: 'GET'
            },
            resSpec: {
              statusCode: 200
            }
          },
        ]
      }),
      {
        name: 'resSpecMethodBoundToTestWhenReqSpecIsMethod',
        setup: function() {
          this.scope = nock(baseUrl).get(path).reply(200)
        },
        teardown: function() {
          try {
            this.scope.isDone()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: function() {
          return {
            url: path,
            method: 'GET'
          }
        },
        resSpec: function() {
          assert.equal(this.parent.name, 'HttpTestTests')
        }
      },
      {
        name: 'parametersTest',
        setup: function() {
          this.scope = nock(baseUrl).get(path)
                                    .query({
                                      foo: 'bar',
                                      baz: 'yaz'
                                    })
                                    .reply(200)
        },
        teardown: function() {
          try {
            this.scope.isDone()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: {
          url: path,
          method: 'GET',
          parameters: {
            foo: 'bar',
            baz: 'yaz'
          }
        },
        resSpec: function(res) {
          assert.equal(res.statusCode, 200)
          assert.equal(res.request.url.query, querystring.stringify({
            foo: 'bar',
            baz: 'yaz'
          }))
        }
      },
      {
        name: 'headersTest',
        setup: function() {
          this.scope = nock(baseUrl).get(path)
                                    .matchHeader('foo', 'bar')
                                    .reply(200)
        },
        teardown: function() {
          try {
            this.scope.isDone()
          } finally {
            nock.cleanAll()
          }
        },
        reqSpec: {
          url: path,
          method: 'GET',
          headers: {
            foo: 'bar'
          }
        },
        resSpec: function(res) {
          assert.equal(res.statusCode, 200)
          assert.deepEqual(_.pick(res.request.headers, ['foo']), 
                           {foo: 'bar'})
        }
      }
    ]
  })
  module.exports = HttpTestTests
})

