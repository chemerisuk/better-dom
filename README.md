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
Use [bower](http://bower.io/) to download this extension with all required dependencies:

    bower install better-dom

This will clone the latest version of the better-dom into the `components` directory at the root of your project.

Then append the following script on your page:

```html
<script src="components/better-dom/src/better-dom.js" data-htc="components/better-dom/src/better-dom.htc"></script>
```

Ajax-friendly
-------------
The idea is to write plugins in declarative way. `DOM.extend` is used to implement a new extension which starts to work for all current and for any future content. As result it's much simpler to write [polyfills](#quick-example-placeholder-polyfill) or to create your own web components.

Performance
-----------
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

Compatability
-------------
The library intoduces it's own objects for describing access to DOM. It doesn't modify any native prototypes. `DOM` is actually the only one global variable.

You can write DOM extentions and use your own library to modify content on page: any matched element will be automatically initialized.

Quick example: placeholder polyfill
-----------------------------------
Now it's pretty simple to write your own polyfill:

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

Another example: dateinput polyfill
-----------------------------------
See the extension repository at https://github.com/chemerisuk/better-dateinput-polyfill.

Specs example (using jasmine):

```js
describe("better-dateinput-polyfill", function() {
    var calendar, dateinput;

    beforeEach(function() {
        calendar = DOM.mock();
        dateinput = DOM.mock("input[type=date]");

        spyOn(dateinput, "_refreshCalendar");
    });
    
    ...

    it("should hide calendar on escape or tab key", function() {
        var spy = spyOn(calendar, "hide");

        dateinput._handleDateInputKeys(9, false, calendar);

        expect(spy).toHaveBeenCalled();

        dateinput._handleDateInputKeys(27, false, calendar);

        expect(spy.callCount).toBe(2);
    });

    it("should reset calendar value on backspace or delete keys", function() {
        var spy = spyOn(dateinput, "set");

        spy.andCallFake(function(value) {
            expect(value).toBe("");
        });

        dateinput._handleDateInputKeys(8, false, calendar);

        expect(spy).toHaveBeenCalled();

        dateinput._handleDateInputKeys(46, false, calendar);

        expect(spy.callCount).toBe(2);
    });

    it("should handle arrow keys", function() {
        var now = new Date(),
            getSpy = spyOn(dateinput, "getCalendarDate"),
            setSpy = spyOn(dateinput, "setCalendarDate"),
            expectKey = function(key, altKey, expected) {
                getSpy.andReturn(new Date(now.getTime()));

                dateinput._handleDateInputKeys(key, altKey, calendar);

                expect(setSpy).toHaveBeenCalledWith(expected);
            }

        expectKey(74, false, new Date(now.getTime() + 604800000));
        expectKey(40, false, new Date(now.getTime() + 604800000));
        expectKey(75, false, new Date(now.getTime() - 604800000));
        expectKey(38, false, new Date(now.getTime() - 604800000));
        expectKey(76, false, new Date(now.getTime() + 86400000));
        expectKey(39, false, new Date(now.getTime() + 86400000));
        expectKey(72, false, new Date(now.getTime() - 86400000));
        expectKey(37, false, new Date(now.getTime() - 86400000));
    });

});
```

Browser support
---------------
* Chrome
* Safari
* Firefox
* Opera
* IE8+
