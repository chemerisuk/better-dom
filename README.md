better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
==========
> Sandbox for DOM extensions

API description: http://chemerisuk.github.io/better-dom/.

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the library into the `bower_components` directory at the root of your project. Then just include script below on your web page:

```html
<script src="bower_components/build/better-dom.js" data-htc="bower_components/extra/better-dom.htc"></script>
```

## Unobtrusive
`DOM.extend` used to define a new extension and any matched elements will be captured by it. But the coolest thing is that the same will happen even for future content inserted via `innerHTML` or using any other javascript framework.

So as a developer you don't need to worry about when and how the extension will be initialized. Therefore it's much simpler to create new [extensions](#elastic-textarea-example) or to write [polyfills](#placeholder-polyfill-example) for old browsers.

#### placeholder polyfill example
This is a polyfill of the `[placeholder]` attribute for old browsers
```js
if (DOM.supports("placeholder", "input")) return;

DOM.extend("[placeholder]", [
    "input[style='box-sizing: border-box; position: absolute; color: graytext; background: none no-repeat 0 0; border-color: transparent']"
], {
    constructor: function(holder) {
        var offset = this.offset();

        this
            .on("focus", holder, "hide")
            .on("blur", this, "_showPlaceholder", [holder]);

        holder
            .set(this.get("placeholder"))
            .setStyle("width", offset.right - offset.left)
            .on("click", this, "fire", ["focus"]);

        if (this.get() || this.isFocused()) holder.hide();

        this.before(holder);
    },
    _showPlaceholder: function(holder) {
        if (!this.get()) holder.show();
    }
});
```
Check out [live demo](http://chemerisuk.github.io/better-placeholder-polyfill/) (open in IE < 10, for example).

#### elastic textarea example
This is a textarea extension which autoresizes itself to contain all entered text.

Check out [live demo](http://chemerisuk.github.io/better-elastic-textarea/) and the [extension repository](https://github.com/chemerisuk/better-elastic-textarea).

#### more code: dateinput polyfill
The extension makes `input[type=date]` controls with the same UX for all browsers.

Check out [live demo](http://chemerisuk.github.io/better-dateinput-polyfill) the [extension repository](https://github.com/chemerisuk/better-dateinput-polyfill).

## Event handling best practices
Events handling is a big part of writing a code for DOM. And there are some features included into the library APIs that help developers to avoid potential issues and keep their code easier to maintain in future.

#### Get rid of the event object
Event callbacks loose the event object argument and it improves testability of code.

```js
// NOTICE: handler don't have e as the first argument
input.on("click", function() {...});
// NOTICE: event arguments in event name
input.on("keydown(keyCode,altKey)", function(keyCode, altKey) {...});
```

#### Correct return false interpretation
jQuery has strange behavior of event handler that returns false and it's a [cause of confusion](http://fuelyourcoding.com/jquery-events-stop-misusing-return-false/) for a lot of people. This library has standards-based behavior which does what everybody expected.

```js
// NOTICE: return false prevents ONLY default action
DOM.find("a").on("click", function() { return false; });
```

#### Late binding
Usually an event lintener function is bound when some `addEventListener` method called. This causes trouble when the function value is changed. The library helps to solve the problem by allowing to handle an event using _object property_ instead of just function.

```js
var link = DOM.find(".test-link"), 
    obj = {handleClick: function() { console.log("Hello!"); }};

link.on("click", obj, "handleClick");
// every click on the link now logs "Hello!" into console
obj.handleClick = function() { console.log("Hello, Maksim!"); }
// every click on the link now logs "Hello, Maksim!" into console
```

#### Callback systems are brittle
The library doesn't use callback arrays, so any event listener can't break another one (read a [nice article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).

```js
DOM.ready(function() { throw Error("exception in a bad code"); });
// NOTICE: you'll always see the message in console
DOM.ready(function() { console.log("Nothing can break your code") });
```

## Getter and setter
Standard DOM APIs have a notion of property and attribute for a element. Usually reading a property _is faster_, but a lot of people don't know that or just alway use attributes to keep access the same everywhere in a code.

To fix this confusion better-dom introduces smart getter and setter.

```js
var link = DOM.find("#link");

// returns value of the id property (i.e. "link" string)
link.get("id");
// returns value of "data-attr" attribute
link.get("data-attr");
// returns innerHTML of the element
link.get();

// sets property href (and that action updates attribute value too)
link.set("href", "/some/path");
// sets attribute "data-attr" to "123"
link.set("data-attr", "123");
// sets innerHTML to "some text"
link.set("some text");
```

## Emmet expressions
HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

* `nav>ul>li` instead of `<nav><ul><li></li></ul></nav>`
* `form#search.wide` instead of `<form id="search" class="wide"></form>`
* `[a='value1' b="value2"]` instead of `<div a="value1" b="value2"></div>`
* `ul>li.item$*3` instead of `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>`

Because of code size emmet expressions support is only for HTML strings and has some limitations for now, but major features are in place.


## Easy localization
Multilanguage support is often required for an extension. `DOM.importStrings` allows to add a localized string which may be displayed in a html element using `data-i18n` attribute with the appropriate key.

```js
DOM.importStrings("hello.0", "Hello!");
// NOTICE: optional parameter to specify language of the string
DOM.importStrings("hello.0", "Привет!", "ru");
// element <span data-i18n="hello.0"><span> will display "Hello!"
```
You can use parametrized strings via special `{param}` substrings and appropriate `data-*` attributes.

```js
DOM.importStrings("hello.1", "Hello {user}!");
// element <a data-i18n="hello.1" data-user="Maksim"><a> will display "Hello Maksim!"
```
To change a string language manually use setter with `lang` parameter.

```js
span.set("lang", "ru");
// now the span displays "Привет!"
DOM.find("html").set("lang", "ru");
// the line changes language globally
```

## Browser support
* Chrome
* Safari
* Firefox
* Opera
* IE8+
