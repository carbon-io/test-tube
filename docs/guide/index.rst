.. _test-tube-guide:

=========
Test-Tube
=========

``test-tube`` is the testing component of the Carbon.io framework. It is used to
test all components of Carbon.io (including ``test-tube`` itself) and can be used
independently to test any ``JavaScript`` based project.

Test Environment Setup
----------------------
The suggested way to structure your test environment is to create a directory
named ``test`` that exists in your application's root directory:

.. code-block:: sh

  <path-to-your-app>/
    test/
      index.js

To use ``test-tube``, you can access it via ``carbon-io`` as follows:

.. code-block:: js

  var testtube = require('carbon-io').testtube

Additionally, to run tests via ``npm``, you should add the following
``scripts`` property to your ``package.json`` file:

.. code-block:: js

  {
    ...,
    "scripts": {
      "test": "node test"
    }
    ...
  }

Test Suite Structure
--------------------

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
    ├── CmdlineTests.js
    ├── ContextTests.js
    ├── HttpTests.js
    ├── SimpleAsyncTest.js
    ├── SimpleBareBonesTest.js
    ├── SimpleNestedTests.js
    ├── SimpleTest.js
    ├── SimpleTests.js
    ├── SkipTests.js
    └── index.js

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

Basic Tests
-----------

Synchronous
^^^^^^^^^^^

In its simplest form, a test in ``test-tube`` looks as follows:

.. code-block:: js

  o({
    _type: testtube.Test,
    doTest: function() {
      assert(<expression>)
    }
  })

It consists of a instance of :js:class:`~testtube.Test` with
:js:func:`~testtube.Test.doTest` overriden to perform the actual test. To
indicate a failure, simply throw an error. To indicate success, don't.

Asynchronous
^^^^^^^^^^^^

If a test is asynchronous, use the ``done`` errback to indicate the test 
has completed:

.. code-block:: js

  o({
    _type: testtube.Test,
    doTest: function(_, done) {
      asyncFunc(..., function(err, result) {
        if (!err) {
          try {
            assert(<expression>)
          } catch (e) {
            err = e
          }
        }
        done(err)
      })
    }
  })

Fixtures
--------

In addition to :js:func:`~testtube.Test.doTest`, test classes have ``setup`` and
``teardown`` methods that can be used to create fixtures expected by the test
and perform any cleanup required after the test has completed:

.. literalinclude:: ../code-frags/hello-world/test/SimpleTest.js
  :language: js
  :linenos:

Note, ``setup`` and ``teardown`` have the same signature as ``doTest``, so, if
something needs to be done asynchronously, simply use the supplied errback:

.. literalinclude:: ../code-frags/hello-world/test/SimpleAsyncTest.js
  :language: js
  :linenos:

Test Suites
-----------

To implement a test suite, simply override the :js:attr:`~testtube.Test.tests`
property with an array of tests to execute:

.. literalinclude:: ../code-frags/hello-world/test/SimpleTests.js
  :language: js
  :linenos:

Note, as mentioned previously, a test can act both as a test suite and a test.
To do this, simply override :js:func:`~testtube.Test.doTest` in addition to
:js:attr:`~testtube.Test.tests`.

Back References
---------------

If access to the test suite is required by a test, the
:js:attr:`~testtube.Test.parent` property can be used:

.. literalinclude:: ../code-frags/hello-world/test/SimpleNestedTests.js
  :language: js
  :linenos:
  :lines: 9-

Expecting an Error
------------------

If an error is expected to be thrown by a test, the
:js:attr:`~testtube.Test.errorExpected` can be used to catch and verify an error
that may be thrown anywhere in the defined test. If it is set to a ``boolean``,
the test class will simply verify that an error was thrown or not. If it is set
to a class or function, it will behave like :js:func:`~assert.throws`. This is
mostly useful for meta-tests.

.. todo:: example

Reporting
---------

Tests and their outcomes are reported as the test suite executes, with a final
hierarchical test report generated at completion. For example, the output of
running the "hello-world" test suite looks as follows:

.. todo:: coloring for the following output

.. code-block:: sh

  $> npm test

    Running HelloWorldTestSuite...
      [*] Test (0ms)
      [*] SimpleTest (0ms)
      [*] SimpleAsyncTest (0ms)
      [*] SimpleWithSetupAndTeardownTest (0ms)
      [*] SimpleAsyncTest (1ms)
      [*] SimpleAsyncWithSetupAndTeardownTest (1ms)
      [*] SimpleTests (2ms)
      [*] SimpleTripleNestedTest (0ms)
      [*] SimpleDoubleNestedAsyncTest (0ms)
      [*] SimpleNestedTest (0ms)
      [*] SimpleNestedTests (0ms)
      [*] CmdlineTests (10ms)
      [*] SimpleContextTest (0ms)
      [*] SimpleNestedTestWithContextTest1 (1ms)
      [*] SimpleNestedTestWithContextTest2 (0ms)
      [*] SimpleNestedTestsWithContextTest (1ms)
      [*] SimpleAsyncContextTest (1ms)
      [*] SimpleContextTests (2ms)
      [*] GET /say (86ms)
      [*] NamedHttpTestWithSetupAndTeardown (16ms)
      [*] ReqResSpecFunctionTests (7ms)
      [*] ReqResSpecFunctionTests (6ms)
      [*] GET /say (5ms)
      [*] SimpleReverseHttpHistoryTest (9ms)
      [*] SimpleForwardHttpHistoryTest (4ms)
      [*] SimpleNamedHttpHistoryTest (10ms)
      [*] NestedNamedHttpTest (4ms)
      [*] undefined undefined (11ms)
      [*] NestedHttpTest (15ms)
      [*] SimpleNamedHttpHistoryTest2 (9ms)
      [*] GET undefined (60ms)
      [*] GET http://127.0.0.1:8888/say (8ms)
      [*] GET /say (8ms)
      [*] HttpTests (243ms)
      [*] Test SKIPPED (0ms)
      [*] SkipTest SKIPPED (0ms)
      [*] Test NOT IMPLEMENTED (1ms)
      [*] NotImplementedTest NOT IMPLEMENTED (0ms)
      [*] SkipTests (1ms)
      [*] HelloWorldTestSuite (258ms)

    Test Report
      [*] Test: HelloWorldTestSuite (A test suite demonstrating Test-Tube's various features.) (258ms)
      [*] Test: Test (0ms)
      [*] Test: SimpleTest (A simple test) (0ms)
      [*] Test: SimpleAsyncTest (A simple async test) (0ms)
      [*] Test: SimpleTests (A simple set of tests) (2ms)
        [*] Test: SimpleWithSetupAndTeardownTest (0ms)
        [*] Test: SimpleAsyncTest (1ms)
        [*] Test: SimpleAsyncWithSetupAndTeardownTest (1ms)
      [*] Test: SimpleNestedTests (A simple set of tests) (0ms)
        [*] Test: SimpleNestedTest (0ms)
          [*] Test: SimpleDoubleNestedAsyncTest (0ms)
            [*] Test: SimpleTripleNestedTest (0ms)
      [*] Test: CmdlineTests (10ms)
      [*] Test: SimpleContextTests (A simple set of tests using context) (2ms)
        [*] Test: SimpleContextTest (0ms)
        [*] Test: SimpleNestedTestsWithContextTest (1ms)
          [*] Test: SimpleNestedTestWithContextTest1 (1ms)
          [*] Test: SimpleNestedTestWithContextTest2 (0ms)
        [*] Test: SimpleAsyncContextTest (1ms)
      [*] Test: HttpTests (Http tests.) (243ms)
        [*] Test: GET /say (86ms)
        [*] Test: NamedHttpTestWithSetupAndTeardown (16ms)
        [*] Test: ReqResSpecFunctionTests (7ms)
        [*] Test: ReqResSpecFunctionTests (6ms)
        [*] Test: GET /say (5ms)
        [*] Test: SimpleReverseHttpHistoryTest (9ms)
        [*] Test: SimpleForwardHttpHistoryTest (4ms)
        [*] Test: SimpleNamedHttpHistoryTest (10ms)
        [*] Test: NestedHttpTest (15ms)
          [*] Test: NestedNamedHttpTest (4ms)
          [*] Test: undefined undefined (11ms)
        [*] Test: SimpleNamedHttpHistoryTest2 (9ms)
        [*] Test: GET undefined (60ms)
        [*] Test: GET http://127.0.0.1:8888/say (8ms)
        [*] Test: GET /say (8ms)
      [*] Test: SkipTests (Demonstrate how to skip tests.) (1ms)
        [*] Test: Test SKIPPED (0ms)
          Skipping test because of foo
        [*] Test: SkipTest SKIPPED (Skipping test because of foo) (0ms)
          Skipping test because of foo
        [*] Test: Test NOT IMPLEMENTED (1ms)
          Implement foo
        [*] Test: NotImplementedTest NOT IMPLEMENTED (Foo test not implemented) (0ms)
          Foo test not implemented

In order to make this report more descriptive, there are two other properties of
:js:class:`~testtube.Test` that can be overridden:
:js:attr:`~testtube.Test.name` and :js:attr:`~testtube.Test.description`. If
:js:attr:`~testtube.Test.name` is not overriden, the test will be given the
default name of ``Test`` (e.g., ``[*] Test: Test (0ms)``). If
:js:attr:`~testtube.Test.description` is overridden, it will be appended to the
report output for that test in parentheses (e.g., ``[*] Test: SimpleTest (A
simple test) (0ms)``).

Additionally, the exit code will indicate success (``0``) or failure (``>0``) of
the test suite as a whole.

Context
-------

In order to make test suites reentrant, ``test-tube`` provides a context object
that is passed down through the execution tree as the first argument to each
test's ``setup``, ``teardown``, and ``doTest`` mthods. 

.. literalinclude:: ../code-frags/hello-world/test/ContextTests.js
  :language: js
  :linenos:
  :lines: 36-53

The test context class (see: :js:class:`~testtube.TestContext`) has two
important/reserved properties: ``global``, ``local``, and ``httpHistory``.
``local`` can be used to record any state relevant to the current test. If a
test contains a ``tests`` property with more tests, the current state will be
saved when execution passes to its children and restored after their completion.
Alternatively, the test itself can be used (i.e., ``this.foo = bar``) at the
cost of the test suite being reentrant.  ``httpHistory`` records all previously
executed request/response pairs in a :js:class:`testtube.HttpTest` (see:
:ref:`HttpTest <test-tube-guide-http-test>`).

In addition to maintaining state for the current test,
:js:class:`~testtube.TestContext` can be used to communicate or collect other
state throughout the test suite. Simply attach data to the context object's
``global`` property and it will be passed down through the tree untouched by
``test-tube``.

The following example demonstrates the use of ``local`` by saving the current
test's name on ``local`` in ``setup`` and verifying that it persists through
``teardown`` despite the presence of child tests. It also demonstrates the
sharing of state using the context object by recording the name of each test
that has executed on the ``global.testNames`` property and verifying that this
persists all the way back up to the root.

.. literalinclude:: ../code-frags/hello-world/test/ContextTests.js
  :language: js
  :linenos:
  :lines: 9-

.. _test-tube-guide-http-test:

HttpTest
--------

To simplify testing Carbon.io based services, ``test-tube`` provides a second
test class called :js:class:`~testtube.HttpTest`. This class extends
:js:class:`~testtube.Test`, adding the top-level property ``baseUrl`` which may
or may not be overriden by a test instance. Additionally, it provides a
shorthand for issuing requests to a service as well as for validating the
responses to those requests.

Instead of instantiating tests in the ``tests`` property directly, the requests
to send and the responses that are expected can be specified with the following
shorthand:

.. code-block:: js

  ...
  tests: [
    ...
    {
      reqSpec: { 
        <request specification>
      },
      resSpec: {
        <response specification>
      }
    }
  ],
  ...

Of course, you can also intermingle regular tests if you should choose.

reqSpec
^^^^^^^

A ``reqSpec`` has one required property, ``method``, which should be an
``HTTP`` verb (e.g., ``GET``, ``PUT``, ``POST``, etc.). Beyond this, the ``URL``
to probe can be specified using the ``url`` property as an absolute
``URL`` (containing the scheme, host, path, etc.) or as a relative ``URL`` (to
be appended to the aforementioned ``baseUrl`` property of the parent test). 

.. literalinclude:: ../code-frags/hello-world/test/HttpTests.js
  :language: js
  :linenos:
  :lines: 13-34,214-

In addition to these two properties, ``name``, ``setup``, and ``teardown`` are
also valid and perform the same functions described in previous sections.

.. literalinclude:: ../code-frags/hello-world/test/HttpTests.js
  :language: js
  :linenos:
  :lines: 13-34,46-65,242-

If ``reqSpec`` is a function, it will be bound to the test instance, called
with the context object as the first argument, and should return a ``refSpec`` as
described above.

.. literalinclude:: ../code-frags/hello-world/test/HttpTests.js
  :language: js
  :linenos:
  :lines: 66-78

resSpec
^^^^^^^

Much like a ``reqSpec``, a ``resSpec`` can be an ``Object`` or a ``Function``.
However, it can also be an ``Object`` whose properties are ``Functions``. If it
is a plain old object, the value of each property will be compared (using
``assert.deepEquals``) to the corresponding value on the response object (as
seen above), failing if any of these values do not match. If the
value is a function (as seen in the previous example), it will be bound to the
test and called with the response object as the first argument and the context
object as the second. If the ``resSpec`` falls into the third category, each
function in the ``resSpec`` will bound to the test instance and called with the
corresponding value of the response object as the first argument and the context
object as the second.

.. literalinclude:: ../code-frags/hello-world/test/HttpTests.js
  :language: js
  :linenos:
  :lines: 79-95

httpHistory
^^^^^^^^^^^

Finally, if you need to look back at the request/response history in a test, you
can use the ``httpHistory`` property of the context object to do this. This is
useful if you need to base the current request of a previous response or if you
simply want to replay a previous request. The ``httpHistory`` object is an
instance of :js:class:`~testtube.HttpTestHistory` and has five methods of
interest: ``getReqSpec``, ``getResSpec``, ``getReq``, ``getRes``, and ``get``
(where ``get`` simply returns all history for a particular test).
All of these methods take an integer or a string as an argument (the "index"). If the 
index is negative, the Nth previous history object is returned. If the index is
postive it starts from the Nth history object starting from the beginning (e.g.
``0`` would return the history object for the first test). Finally, if the index
is a string, it will return the history object for the test with that name.

.. literalinclude:: ../code-frags/hello-world/test/HttpTests.js
  :language: js
  :linenos:
  :lines: 106-142

Skipping Tests
--------------

Sometimes a test needs to be skipped (e.g., when a certain language feature is not
available in the version of node being run) or marked as unimplemented. There are 
a couple ways to do this.

To skip a test, either throw an instance of
:js:class:`~testtube.errors.SkipTestError` or instantiate an instance of
:js:class:`~testtube.util.SkipTest`:

.. literalinclude:: ../code-frags/hello-world/test/SkipTests.js
  :language: js
  :linenos:
  :lines: 15-24

Note, if :js:class:`~testtube.util.SkipTest` is instantiated, the
``description`` property will be used as the ``message`` argument to 
:js:class:`~testtube.errors.SkipTestError`.

It is often common to think of tests that need to be implemented as one is
designing a certain feature or in the midst of implementation. In these cases, a
placeholder test can be added that indicates the test has not been implemented
and that doesn't fail the test suite. To do this, simply add the test skeleton
and throw a :js:class:`testtube.errors.NotImplementedError`

.. literalinclude:: ../code-frags/hello-world/test/SkipTests.js
  :language: js
  :linenos:
  :lines: 25-31

The resulting report for the above tests should look something like:

.. todo:: add coloring to reporting

.. code-block:: sh

  Running SkipTests...
    [*] Test SKIPPED (0ms)
    [*] SkipTest SKIPPED (1ms)
    [*] Test NOT IMPLEMENTED (0ms)
    [*] SkipTests (1ms)

  Test Report
  [*] Test: SkipTests (Demonstrate how to skip tests.) (1ms)
    [*] Test: Test SKIPPED (0ms)
      Skipping test because of foo
    [*] Test: SkipTest SKIPPED (Skipping test because of foo) (1ms)
      Skipping test because of foo
    [*] Test: Test NOT IMPLEMENTED (0ms)
      Implement foo

Command Line
------------

.. todo:: document command line

.. code-block:: sh
  
 $> node test -h

  Usage: node test <command> [options]

  command
    run     Run the test suite

  Options:
     --path PATH      Process tests rooted at PATH (globs allowed)
     --include GLOB   Process tests matching GLOB (if --exclude is present, --include takes precedence, but will fall through if a test is not matched)
     --exclude GLOB   Process tests not matching GLOB (if --include is present, --exclude will be skipped if the test is matched by the former)

  Environment variables:
    <none> 
