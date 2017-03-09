.. class:: testtube.errors.SkipTestError
    :heading:

==============
testtube.errors.SkipTestError
==============

:class:`~testtube.errors.SkipTestError` should be thrown to indicate that a test
should be skipped. Tests throwing this error will succeed, but will be
differentiated in the report to indicate this and potentially the reason why.

Class
-----

.. class:: testtube.errors.SkipTestError

  *extends*: :js:class:`Error`

Properties
----------

.. class:: testtube.errors.SkipTestError
    :noindex:
    :hidden:

    .. attribute:: testtube.errors.SkipTestError.tag

        *static*

        :type: ``string``
        :default: "SKIPPED"

        The default tag for all instance of
        :js:class:`~testtube.errors.SkipTestError`.

    .. attribute:: testtube.errors.SkipTestError.tag

        :type: ``string``
        :default: "SKIPPED"

        A tag used to classify the test result during reporting.

    .. attribute:: testtube.errors.SkipTestError.name

        :type: ``string``
        :default: "SkipTestError"

        The error name.
    
    .. attribute:: testtube.errors.SkipTestError.message

        :type: ``string``
        :default: ""

        The error message.

.. Methods
.. -------

.. .. class:: testtube.errors.SkipTestError
..     :noindex:
..     :hidden:

Example
-------

.. literalinclude:: ../code-frags/hello-world/test/skip-tests.js
    :language: js
    :linenos:
    :lines: 15-20
