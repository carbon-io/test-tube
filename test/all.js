var __ = require('@carbon-io/fibers').__(module).main

__(function() {
  try {
    require('./ordering-tests'),
    require('./http-test-tests')
  } catch (e) {
//    console.log(e.stack)
 //   process.exit(1)
  }
})

