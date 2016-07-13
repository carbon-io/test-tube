var __ = require('fiber').__.main(module)

__(function() {
  try {
    require('./ordering-tests'),
    require('./http-test-tests')
  } catch (e) {
//    console.log(e.stack)
 //   process.exit(1)
  }
})

