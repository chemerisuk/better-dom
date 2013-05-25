better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
==========
Modern javascript library for working with DOM. 

JSDoc - http://chemerisuk.github.io/better-dom/

Overview
--------
Everybody who manipulated DOM via vanilla javascript knows that it is an awful API. Current specification has bugs, browser behavior incosistences etc. The library tries to fix that: it introduces it's own more friednly types for document nodes with developer-fiendly APIs.

Important to note that it covers only DOM so, for instance, there are no methods for working with AJAX.

Installation
------------
Use [bower](http://bower.io/) to download the library:

    bower install better-dom

This will clone the latest version of the better-dom into the `components` directory at the root of your project.

Then append the following script on your page:

```html
<script src="components/better-dom/src/better-dom.js" data-htc="components/better-dom/src/better-dom.htc"></script>
```

Unobtrusive
-----------
No dependencies on other scripts.

The library introduces it's own objects for working with DOM. It doesn't modify any native prototypes. `DOM` is actually the only one global variable.

Moreover you can use DOM extentions with any other AJAX-library because they are...

Ajax-friendly
-------------
The idea is to write DOM plugins in declaratively. `DOM.extend` is used to implement a new extension and the coolest thing is that any matched HTML element is automatically captured by the library even in dynamic content. As a result it's much simpler to write [polyfills](#quick-example-placeholder-polyfill) or to create your own web components for a single-page website.

Performance
-----------
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

Quick example: placeholder polyfill
-----------------------------------
It's pretty simple to write polyfills:

```js
DOM.supports("placeholder", "input") || DOM.extend("[placeholder]", {
    before: "<input type='text' style='box-sizing: border-box; position: absolute; color: graytext; background: transparent; border-color: transparent'/>"
}, {
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

        if (input.get() || input.isFocused()) placeholder.hide();
    }
});
```

See it in action: http://chemerisuk.github.io/better-placeholder-polyfill/ (open in IE < 10)

More complex example: elastic textarea extension
-----------------------------------------
Textarea extension which autoextends textarea to contain all text:

```js
DOM.extend("textarea.elastic", {
    after: "div[style=position:relative]>pre[style=visibility:hidden;margin:0;border-style:solid]>span[style=display:inline-block;white-space:pre-wrap]"
    }, {
    constructor: function() {
        var textarea = this,
            wrapper = textarea.next(),
            holder = wrapper.firstChild(),
            span = holder.firstChild();

        wrapper.append(textarea);

        textarea.on("input", function() {
            textarea._syncTextarea(span);
        });

        holder.setStyle({
            font: textarea.getStyle("font"),
            padding: textarea.getStyle("padding"),
            "border-width": textarea.getStyle("border-width")
        });

        textarea.parent("form").on("reset", function() {
            textarea._syncTextarea(span, textarea.get("defaultValue"));
        });

        textarea._syncTextarea(span);
    },
    _syncTextarea: function(span, value) {
        if (value === undefined) value = this.get();

        // use &nbsp; to fix issue with adding a new line
        if (value[value.length - 1] === "\n") value += "&nbsp;";
        
        // IE doesn't respect newlines so use <br> instead
        span.set(value.split("\n").join("<br>"));
    }
});

DOM.importStyles("textarea.elastic", {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    resize: "none",
    "box-sizing": "border-box"
});
```
See it in action: http://chemerisuk.github.io/better-elastic-textarea/

Another example: dateinput polyfill
-----------------------------------
See the extension repository at https://github.com/chemerisuk/better-dateinput-polyfill.

Specs example (using jasmine) is included.

Browser support
---------------
* Chrome
* Safari
* Firefox
* Opera
* IE8+
