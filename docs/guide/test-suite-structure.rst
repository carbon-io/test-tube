.. _test-tube-test-suite-structure:

====================
Test Suite Structure
====================

Defining your test suite is pretty straight forward and for those familiar with
traditional unit testing frameworks like ``Java``'s ``JUnit`` or ``Python``'s
``unittest`` module, things should feel reasonably comfortable. 

With ``test-tube`` there is no difference between a "test" and a "test suite",
as the :js:class:`~testtube.Test` class acts as both. A basic test suite then
might look something like the following:

.. code-block:: js

  var carbon = require('carbon-io')
  var __ = carbon.fibers.__(module).main
  var o = carbon.atom.o(module).main
  var _o = carbon.bond._o(module)
  var testtube = carbon.testtube

  module.exports = __(function() o({
    _type: testtube.Test,
    name: 'FooBarBazTest',
    description: 'Test all the foos, bars, and bazes.',
    return o({
      _('./foo-tests'),
      _('./bar-tests'),
      _('./baz-tests')
    }))
  })

In the context of our "hello-world" application (see
:file:`<test-tube-root>/docs/code-frags/hello-world`) it looks as follows:

.. literalinclude:: ../code-frags/hello-world/test/index.js
  :language: js

With the corresponding directory hierarchy looking like:

.. todo:: use a different example here so we don't have to keep this in sync

.. code-block:: sh

  $> tree test
  test
  ├── cmdline-tests.js
  ├── context-tests.js
  ├── http-tests.js
  ├── index.js
  ├── simple-async-test.js
  ├── simple-bare-bones-test.js
  ├── simple-nested-tests.js
  ├── simple-test.js
  ├── simple-tests.js
  └── skip-tests.js

You may have noticed a bit a boiler plate in the previous two examples:

.. code-block:: js

  __(function() {
    return o({
      ....
    })
  })

.. todo:: fix up links to fibers and atom documentation below

This boiler plate code should wrap every test exported by a module in the tree,
not just ``index.js`` (see the various tests in ``hello-world`` for examples).
This accomplishes two things. First, it ensures that all setup within the
wrapped test and its children run inside a `Fiber
<https://github.com/laverdet/node-fibers>`_. Second, it allows you to easily
run any subtree of tests by passing a particular test module to ``node`` as the
main module (e.g., if you just want to run ``hello-world``'s command line
tests, you would issue the command ``node test/cmdline-tests.js``).
Additionally, it should be noted that the ``main`` variant of both the ``__``
and ``o`` operators are required (see documentation for ``@carbon-io/fibers``
and ``@carbon-io/atom`` for a more in-depth explanation). 

