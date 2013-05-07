better-dom
==========
Modern javascript library for working with DOM. 

JSDoc - http://chemerisuk.github.io/better-dom/

Overview
--------
Everybody who manipulated DOM via vanilla javascript knows that it is an awful API. Current specification has bugs, browser behavior incosistences etc. The library tries to fix that: it introduces it's own more friednly types for document nodes with developer-fiendly APIs.

Important to note that it doesn't cover everything, for instance there are no methods for working with AJAX.

Goals
-----
* ajax-friendly
* performance
* compatability
* clear and safe APIs
* the smallest size

Ajax-friendly
-------------
Creating widgets has never been so simple. `DOM.extend` is used to declare a new extension so it starts to work for all current and for any future content.

Performance
-----------
DOM is usually the main bottleneck of javascript programs. Therefore performance question should be on the top for any library that works with it.

Compatability
-------------
The library intoduces it's own objects for describing access to DOM. It doesn't modify any native object prototype. `DOM` is actually the only one global variable.

Polyfill example: placeholder
-----------------------------
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
            .set("value", input.get("placeholder"))
            .setStyle("width", offset.right - offset.left)
            .on("focus", function() {
                input.fire("focus");
            });

        input.on({
            focus: function() {
                placeholder.hide();
            },
            blur: function() {
                if (!input.get("value")) placeholder.show();
            }
        });

        if (input.get("value")) placeholder.hide();
    }
});
```
See it in action http://chemerisuk.github.io/better-placeholder-polyfill/

Browser support
---------------
* Chrome
* Firefox
* Opera
* IE8+
