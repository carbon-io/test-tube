var assert = require('assert')
var urlParse = require('url').parse

var carbon = require('carbon-io')

var __ = carbon.fibers.__(module).main
var o = carbon.atom.o(module)
var _o = carbon.bond._o(module)
var testtube = carbon.testtube

var HelloWorld = require('../lib/hello-world')

DEFAULT_NAME = 'foo'
BASE_URL = 'http://127.0.0.1:8888'

module.exports = __(function() {
  return o.main({
    _type: testtube.HttpTest,
    name: 'HttpTests',
    description: 'Http tests.',
    baseUrl: BASE_URL, 
    setup: function(_, done) {
      var parsedUrl = urlParse(this.baseUrl)
      this.server = new HelloWorld(
        parsedUrl.hostname, 
        parsedUrl.port,
        DEFAULT_NAME)
      this.server.serve({}, done)
    },
    teardown: function(_, done) {
      this.server.close(done)
    },
    tests: [
      {
        // name defaults to <method> <url> (GET /say)
        reqSpec: {
          url: '/say',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
      {
        name: 'NamedHttpTestWithSetupAndTeardown',
        setup: function() {
          process.env[this.name] = 1
        },
        teardown: function() {
          try {
            assert.equal(process.env[this.name], 1)
          } finally {
            delete process.env[this.name]
          }
        },
        reqSpec: {
          url: '/say',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
      {
        name: 'ReqResSpecFunctionTests',
        reqSpec: function() {
          return {
            url: '/say',
            method: 'GET'
          }
        },
        resSpec: function(res) {
          assert.equal(res.statusCode, 200)
          assert.equal(res.body, `Hello ${DEFAULT_NAME}.`)
        }
      },
      {
        name: 'ReqResSpecFunctionTests',
        reqSpec: function() {
          return {
            url: '/say',
            method: 'GET'
          }
        },
        resSpec: {
          statusCode: function(val) {
            assert.equal(val, 200)
          },
          body: function(val) {
            assert.equal(val, `Hello ${DEFAULT_NAME}.`)
          }
        }
      },
      {
        reqSpec: {
          url: '/say',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
      {
        name: 'SimpleReverseHttpHistoryTest',
        reqSpec: function(context) {
          return context.httpHistory.getReqSpec(-1)
        },
        resSpec: function(res, context) {
          var prevResSpec = context.httpHistory.getResSpec(-1)
          for (var k in prevResSpec) {
            assert.equal(res[k], prevResSpec[k])
          }
        }
      },
      {
        name: 'SimpleForwardHttpHistoryTest',
        reqSpec: function(context) {
          return context.httpHistory.getReqSpec(0)
        },
        resSpec: function(res, context) {
          var prevResSpec = context.httpHistory.getResSpec(0)
          for (var k in prevResSpec) {
            assert.equal(res[k], prevResSpec[k])
          }
        }
      },
      {
        name: 'SimpleNamedHttpHistoryTest',
        reqSpec: function(context) {
          return context.httpHistory.getReqSpec('NamedHttpTestWithSetupAndTeardown')
        },
        resSpec: function(res, context) {
          var prevResSpec = 
            context.httpHistory.getResSpec('NamedHttpTestWithSetupAndTeardown')
          for (var k in prevResSpec) {
            assert.equal(res[k], prevResSpec[k])
          }
        }
      },
      o({
        _type: testtube.HttpTest,
        name: 'NestedHttpTest',
        baseUrl: BASE_URL,
        tests: [
          {
            name: 'NestedNamedHttpTest',
            setup: function(context) {
              assert.throws(function() {
                context.httpHistory.getReqSpec(0)
              }, RangeError)
              assert.throws(function() {
                context.httpHistory.getReqSpec(-1)
              }, RangeError)
              assert.throws(function() {
                context.httpHistory.getReqSpec('SimpleNamedHttpHistoryTest')
              }, RangeError)
            },
            reqSpec: {
              url: '/yell',
              method: 'GET'
            },
            resSpec: {
              statusCode: 200,
              body: `HELLO ${DEFAULT_NAME.toUpperCase()}!`
            },
          },
          {
            setup: function(context) {
              assert.doesNotThrow(function() {
                context.httpHistory.getReqSpec(0)
              }, RangeError)
              assert.doesNotThrow(function() {
                context.httpHistory.getReqSpec(-1)
              }, RangeError)
              assert.doesNotThrow(function() {
                context.httpHistory.getReqSpec('NestedNamedHttpTest')
              }, RangeError)
            },
            reqSpec: function(context) {
              return context.httpHistory.getReqSpec('NestedNamedHttpTest')
            },
            resSpec: function(res, context) {
              var prevResSpec = 
                context.httpHistory.getResSpec('NestedNamedHttpTest')
              for (var k in prevResSpec) {
                assert.equal(res[k], prevResSpec[k])
              }
            },
          },
        ]
      }),
      {
        name: 'SimpleNamedHttpHistoryTest2',
        setup: function(context) {
          assert.throws(function() {
            context.httpHistory.getReqSpec('NestedNamedHttpTest')
          }, RangeError)
        },
        reqSpec: function(context) {
          return context.httpHistory.getReqSpec('SimpleNamedHttpHistoryTest')
        },
        resSpec: function(res, context) {
          var prevResSpec = 
            context.httpHistory.getResSpec('SimpleNamedHttpHistoryTest')
          for (var k in prevResSpec) {
            assert.equal(res[k], prevResSpec[k])
          }
        }
      },
      {
        reqSpec: {
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
      {
        reqSpec: {
          url: BASE_URL + '/say',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
      {
        reqSpec: {
          url: '/say',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: `Hello ${DEFAULT_NAME}.`
        }
      },
    ]
  })
})

