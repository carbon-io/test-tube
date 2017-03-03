var util = require('util')

var express = require('express')

function HelloWorld(addr, port, name) {
  this.addr = addr || HelloWorld._addr
  this.port = port || HelloWorld._port
  this.name = name || HelloWorld._name
  this._server = undefined
}

HelloWorld._name = 'world'
HelloWorld._template = 'Hello %s%s'
HelloWorld._addr = '127.0.0.1'
HelloWorld._port = 8888

HelloWorld.prototype.cmdargs = {
  say: {
    help: 'Say hello',
    command: true,
    default: true
  },
  yell: {
    help: 'Yell hello',
    command: true
  },
  scream: {
    help: 'Scream hello',
    command: true
  },
  serve: {
    help: 'Run hello server',
    command: true,
    cmdargs: {
      addr: {
        help: 'Bind to ADDR',
        metavar: 'ADDR',
        abbr: 'a',
        default: HelloWorld._addr
      },
      port: {
        help: 'Bind to PORT',
        metavar: 'PORT',
        abbr: 'p',
        default: HelloWorld._port
      }
    }
  },
  name: {
    help: 'Change the default name%s',
    abbr: 'n',
    metavar: 'NAME',
    default: HelloWorld._name
  }
},

HelloWorld.prototype.say = function(opts) {
  return util.format(
    HelloWorld._template, 
    opts && opts.name || this.name, 
    '.')
}

HelloWorld.prototype.yell = function(opts) {
  return util.format(
    HelloWorld._template, 
    opts && opts.name || this.name, 
    '!').toUpperCase()
}

HelloWorld.prototype.scream = function(opts) {
  return util.format(
    HelloWorld._template, 
    opts && opts.name || this.name, 
    '!!!').toUpperCase()
}

HelloWorld.prototype.serve = function(opts, cb) {
  var self = this
  var app = express()
  app.get('/', function(req, res) {
    res.redirect('/say/')
  })
  app.get('/say(/:name)?/?', function(req, res) {
    res.send(self.say(req.params.name ? req.params : opts))
  })
  app.get('/yell(/:name)?/?', function(req, res) {
    res.send(self.yell(req.params.name ? req.params : opts))
  })
  app.get('/scream(/:name)?/?', function(req, res) {
    res.send(self.yell(req.params.name ? req.params : opts))
  })
  this._server = app.listen(this.port, this.addr, cb)
}

HelloWorld.prototype.close = function(cb) {
  if (typeof this._server === undefined) {
    return process.nextTick(function() {
      if (typeof cb !== 'undefined') {
        cb()
      }
    })
  }
  this._server.close(cb)
}

HelloWorld.prototype._main = {
  say: function(opts) {
    console.log(this.say(opts))
  },
  yell: function(opts) {
    console.log(this.yell(opts))
  },
  scream: function(opts) {
    console.log(this.scream(opts))
  },
  serve: function(opts) {
    this.serve(opts)
  }
}

module.exports = HelloWorld
