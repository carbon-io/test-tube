.. class:: testtube.errors.NotImplementedError
    :heading:

==============
testtube.errors.NotImplementedError
==============

:class:`~testtube.errors.NotImplementedError` should be thrown to indicate that
a particular test has not yet been implemented. Tests throwing this error will
succeed, but will be differentiated in the report to serve as a reminder.

Class
-----

.. class:: testtube.errors.NotImplementedError

    *extends*: :js:class:`~testtube.errors.SkipTestError`


Properties
----------

.. class:: testtube.errors.NotImplementedError
    :noindex:
    :hidden:

    .. attribute:: testtube.errors.NotImplementedError.tag

        *static*

        :type: ``string``
        :default: "NOT IMPLEMENTED"

        The default tag for all instance of
        :js:class:`~testtube.errors.NotImplementedError`.

    .. attribute:: testtube.errors.NotImplementedError.tag

        :type: ``string``
        :default: "NOT IMPLEMENTED"

        A tag used to classify the test result during reporting.

    .. attribute:: testtube.errors.NotImplementedError.name

        :type: ``string``
        :default: "NotImplementedError"

        The error name.
    
    .. attribute:: testtube.errors.NotImplementedError.message

        :type: ``string``
        :default: "Not implemented"

        The error message.

.. Methods
.. -------

.. .. class:: testtube.errors.NotImplementedError
..    :noindex:
..    :hidden:


Example
-------

.. literalinclude:: ../code-frags/hello-world/test/skip-tests.js
    :language: js
    :linenos:
    :lines: 25-30


