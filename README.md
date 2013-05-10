better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
==========
Modern javascript library for working with DOM. 

JSDoc - http://chemerisuk.github.io/better-dom/

Overview
--------
Everybody who manipulated DOM via vanilla javascript knows that it is an awful API. Current specification has bugs, browser behavior incosistences etc. The library tries to fix that: it introduces it's own more friednly types for document nodes with developer-fiendly APIs.

Important to note that it doesn't cover everything, for instance there are no methods for working with AJAX.

Installation
------------
`bower install better-dom --save-dev`

This will clone the latest version of the better-dom into the `components` directory at the root of your project.

Then append the following script on your page:

```html
<script src="components/better-dom/src/better-dom.js" data-htc="components/better-dom/src/better-dom.htc"></script>
```

Ajax-friendly
-------------
The idea is to write plugins in declarative way. `DOM.extend` is used to implement a new extension which starts to work for all current and for any future content. As result it's much simpler to write [polyfills](#code-example-placeholder-polyfill) or to create your own web components.

Performance
-----------
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

Compatability
-------------
The library intoduces it's own objects for describing access to DOM. It doesn't modify any native prototypes. `DOM` is actually the only one global variable.

Clear and safe APIs
-------------------
TODO

Code example: placeholder polyfill
----------------------------------
Now it's pretty simple to write your own polyfill:

```js
DOM.supports("placeholder", "input") || DOM.extend("[placeholder]", {
    template: {
        before: '<input type="text" style="box-sizing: border-box; position: absolute; color: graytext; background: transparent; border-color: transparent"/>'
    },
    constructor: function() {
        var input = this,
            offset = input.offset(),
            placeholder = input.prev();

        placeholder
            .set(input.get("placeholder"))
            .setStyle("width", offset.right - offset.left)
            .on("focus", function() {
                input.fire("focus");
            });

        input.on({
            focus: function() {
                placeholder.hide();
            },
            blur: function() {
                if (!input.get()) placeholder.show();
            }
        });

        if (input.get()) placeholder.hide();
    }
});
```

See it in action (open in IE < 10) http://chemerisuk.github.io/better-placeholder-polyfill/

Browser support
---------------
* Chrome
* Safari
* Firefox
* Opera
* IE8+
