.. _test-tube-test-env-structure:

======================
Test Environment Setup
======================

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
