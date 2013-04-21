Better-DOM
==============
Modern javascript library for working with DOM

Goals
-----
* ajax-friendly extensions
* as fast as possible
* the smallest size
* safety

Overview
--------
Everybody who manipulated DOM in vanilla javascript knows that it is an awful API. Current specification has bugs, browser behaviors varies etc. The library tries to fix that: it introduces it's own more friednly prototypes for document nodes.

Important to note that it doesn't cover everything, for instance there are no methods for AJAX.

Extensibility
-------------
Creating widgets never have been so simple. Just use DOM.extend to declare a new extension and it starts to work for current and any future content. No initialization calls required!

Browser support
---------------
* Chrome
* Firefox
* Opera
* IE9+

TODO
----
1. IE8 support - it definetely requires a lot of additional work
