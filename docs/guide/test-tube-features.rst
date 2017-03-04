.. _test-tube-test-tube-features:

==================
Test-Tube Features
==================

Basic Tests
-----------

In its simplest form, a test in ``test-tube`` looks as follows:

.. code-block:: js

  o({
    _type: testtube.Test,
    doTest: function() {
      assert(<expression>)
    }
  })

It consists of a instance of :js:class:`~testtube.Test` with
:js:func:`~testtube.Test.doTest` overriden to perform the actual test. 

Basic Async Tests
-----------------

If your test is asynchronous, use the ``done`` errback to indicate the test 
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
``teardown`` methods that you can use to create fixtures expected by the test
and perform any cleanup required after the test has completed:

.. literalinclude:: ../code-frags/hello-world/test/simple-test.js
  :language: js

Note, ``setup`` and ``teardown`` have the same signature as ``doTest``, so, if
something needs to be done asynchronously, simply use the supplied errback:

.. literalinclude:: ../code-frags/hello-world/test/simple-async-test.js
  :language: js

Test Suites
-----------

To implement a test suite, simply override the :js:attr:`~testtube.Test.tests`
property with an array of tests to execute:

.. literalinclued:: ../code-frags/hello-world/test/simple-tests.js
  :language: js

Note, as mentioned previously, a test can act both as a test suite and a test.
To do this, simply override :js:func:`~testtube.Test.doTest` in addition to
:js:attr:`~testtube.Test.tests`.

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
    [*] SimpleAsyncTest (1ms)
    [*] SimpleWithSetupAndTeardownTest (0ms)
    [*] SimpleAsyncTest (0ms)
    [*] SimpleAsyncWithSetupAndTeardownTest (0ms)
    [*] SimpleTests (0ms)
    [*] SimpleTripleNestedTest (0ms)
    [*] SimpleDoubleNestedAsyncTest (1ms)
    [*] SimpleNestedTest (1ms)
    [*] SimpleNestedTests (1ms)
    [*] CmdlineTests (5ms)
    [*] ContextTests (0ms)
    [*] GET /say (86ms)
    [*] NamedHttpTestWithSetupAndTeardown (23ms)
    [*] ReqResSpecFunctionTests (4ms)
    [*] ReqResSpecFunctionTests (4ms)
    [*] GET /say (3ms)
    [*] SimpleReverseHttpHistoryTest (8ms)
    [*] SimpleForwardHttpHistoryTest (7ms)
    [*] SimpleNamedHttpHistoryTest (14ms)
    [*] NestedNamedHttpTest (17ms)
    [*] undefined undefined (15ms)
    [*] NestedHttpTest (32ms)
    [*] SimpleNamedHttpHistoryTest2 (6ms)
    [*] HttpTests (187ms)
    [*] HelloWorldTestSuite (194ms)

  Test Report
  [*] Test: HelloWorldTestSuite (A test suite demonstrating Test-Tube's various features.) (194ms)
    [*] Test: Test (0ms)
    [*] Test: SimpleTest (A simple test) (0ms)
    [*] Test: SimpleAsyncTest (A simple async test) (1ms)
    [*] Test: SimpleTests (A simple set of tests) (0ms)
      [*] Test: SimpleWithSetupAndTeardownTest (0ms)
      [*] Test: SimpleAsyncTest (0ms)
      [*] Test: SimpleAsyncWithSetupAndTeardownTest (0ms)
    [*] Test: SimpleNestedTests (A simple set of tests) (1ms)
      [*] Test: SimpleNestedTest (1ms)
        [*] Test: SimpleDoubleNestedAsyncTest (1ms)
          [*] Test: SimpleTripleNestedTest (0ms)
    [*] Test: CmdlineTests (5ms)
    [*] Test: ContextTests (0ms)
    [*] Test: HttpTests (Http tests.) (187ms)
      [*] Test: GET /say (86ms)
      [*] Test: NamedHttpTestWithSetupAndTeardown (23ms)
      [*] Test: ReqResSpecFunctionTests (4ms)
      [*] Test: ReqResSpecFunctionTests (4ms)
      [*] Test: GET /say (3ms)
      [*] Test: SimpleReverseHttpHistoryTest (8ms)
      [*] Test: SimpleForwardHttpHistoryTest (7ms)
      [*] Test: SimpleNamedHttpHistoryTest (14ms)
      [*] Test: NestedHttpTest (32ms)
        [*] Test: NestedNamedHttpTest (17ms)
        [*] Test: undefined undefined (15ms)
      [*] Test: SimpleNamedHttpHistoryTest2 (6ms)

In order to make this report more descriptive, there are two other properties of
:js:class:`~testtube.Test` that you can override: :js:attr:`~testtube.Test.name`
and :js:attr:`~testtube.Test.description`. If you do not override
:js:attr:`~testtube.Test.name`, the test will be given the default name of
``Test`` (e.g., ``[*] Test: Test (0ms)``). If
:js:attr:`~testtube.Test.description` is overridden, it will be appended to the
report output for that test in parentheses (e.g., ``[*] Test: SimpleTest (A
simple test) (0ms)``).

Additionally, the exit code will indicate success (``0``) or failure (``>0``) of
the test suite as a whole.
