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
:js:func:`~testtube.Test.doTest` overriden to perform the actual test. To
indicate a failure, simply throw an error. To indicate success, don't.

Basic Async Tests
-----------------

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

.. literalinclude:: ../code-frags/hello-world/test/simple-test.js
  :language: js
  :linenos:

Note, ``setup`` and ``teardown`` have the same signature as ``doTest``, so, if
something needs to be done asynchronously, simply use the supplied errback:

.. literalinclude:: ../code-frags/hello-world/test/simple-async-test.js
  :language: js
  :linenos:

Test Suites
-----------

To implement a test suite, simply override the :js:attr:`~testtube.Test.tests`
property with an array of tests to execute:

.. literalinclude:: ../code-frags/hello-world/test/simple-tests.js
  :language: js
  :linenos:

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
:js:class:`~testtube.Test` that can be overridden: :js:attr:`~testtube.Test.name`
and :js:attr:`~testtube.Test.description`. If 
:js:attr:`~testtube.Test.name` is not overriden, the test will be given the default name of
``Test`` (e.g., ``[*] Test: Test (0ms)``). If
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

.. literalinclude:: ../code-frags/hello-world/test/context-tests.js
  :language: js
  :linenos:
  :lines: 36-53

The test context class (see: :js:class:`~testtube.TestContext`) has two
important/reserved properties: ``state`` and ``httpHistory``. ``state`` can be
used to record any state relevant to the current test. If a test contains a
``tests`` property with more tests, the current state will be saved when
execution passes to its children and restored after their completion.
Alternatively, the test itself can be used (i.e., ``this.foo = bar``) at the
cost of the test suite being reentrant.  ``httpHistory`` records all previously
executed request/response pairs in an :js:class:`testtube.HttpTest` (see:
:ref:`HttpTest <test-tube-guide-http-test>`).

In addition to maintaining state for the current test,
:js:class:`~testtube.HttpTest` can be used to communicate or collect other state
throughout the test suite. Simply attach data to the context object and it will
be passed down through the tree untouched by ``test-tube``.

The following example demonstrates the use of ``state`` by saving the
current test's name on ``state`` in ``setup`` and verifying that it persists
through ``teardown`` despite the presence of child tests. It also demonstrates
the sharing of state using the context object by recording the name of each test
that has executed on the ``testNames`` property and verifying that this persists
all the way back up to the root.

.. literalinclude:: ../code-frags/hello-world/test/context-tests.js
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

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
  :language: js
  :linenos:
  :lines: 13-34,214-

In addition to these two properties, ``name``, ``setup``, and ``teardown`` are
also valid and perform the same functions described in previous sections.

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
  :language: js
  :linenos:
  :lines: 13-34,46-65,242-

If ``reqSpec`` is a function, it will be bound to the test instance, called
with the context object as the first argument, and should return a ``refSpec`` as
described above.

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
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

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
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

.. literalinclude:: ../code-frags/hello-world/test/http-tests.js
  :language: js
  :linenos:
  :lines: 106-142

Skipping Tests
--------------



