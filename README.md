better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
==========
Making DOM to be nice.

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the library into the `components` directory at the root of your project.

Then include script below on your web page:

```html
<!DOCTYPE html>
<html>
<head>
    ...    
</head>
<body>
    ...
    <script src="components/build/better-dom.js" data-htc="components/extra/better-dom.htc"></script>
</body>
</html>
```

## Unobtrusive extensions
The idea is to write DOM additions declaratively. `DOM.extend` used to define a new extension and after the call any existing matched element will be initialized with an appropriate constructor. But the coolest thing is that the same will happen even for HTML content inserted dynamically via `innerHTML` or any other javascript framework.

No need to worry about when and how the extension will be initialized. As a result it's much simpler to create your own [components](#elastic-textarea) or to write [polyfills](#placeholder-polyfill) for old browsers.

#### elastic textarea example
This is a textarea extension which autoresizes itself to contain all entered text:

```js
DOM.extend("textarea.elastic", [
    "div[style=position:relative]>pre[style=visibility:hidden;margin:0;border-style:solid]>span[style=display:inline-block;white-space:pre-wrap]"
], {
    constructor: function(wrapper) {
        var holder = wrapper.child(0),
            span = holder.child(0);

        this.on("input", this._syncWithHolder, [span])._syncWithHolder(span);

        this.parent("form").on("reset", this._syncWithHolder, [span, true], this);

        holder.setStyle({
            "font": this.getStyle("font"),
            "padding": this.getStyle("padding"),
            "border-width": this.getStyle("border-width")
        });

        wrapper.append(this.after(wrapper));
    },
    _syncWithHolder: function(span, defaultValue) {
        value = this.get(defaultValue ? "defaultValue" : "value");

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
Check out [live demo](http://chemerisuk.github.io/better-elastic-textarea/).

#### placeholder polyfill example
The extension polyfills `[placeholder]` for old browsers
```js
DOM.supports("placeholder", "input") || DOM.extend("[placeholder]", [
    "input[style='box-sizing: border-box; position: absolute; color: graytext; background: none no-repeat 0 0; border-color: transparent']"
], {
    constructor: function(holder) {
        var offset = this.offset();

        this
            .on("focus", holder.hide, holder)
            .on("blur", this._showPlaceholder, [holder]);

        holder
            .set(this.get("placeholder"))
            .setStyle("width", offset.right - offset.left)
            .on("click", this.fire, ["focus"], this);

        if (this.get() || this.isFocused()) holder.hide();

        this.before(holder);
    },
    _showPlaceholder: function(holder) {
        if (!this.get()) holder.show();
    }
});
```
Check out [live demo](http://chemerisuk.github.io/better-placeholder-polyfill/) (open in IE < 10).

#### more code: dateinput polyfill
The extension makes `input[type=date]` controls with the same UX for all browsers.

Check out the [extension repository](https://github.com/chemerisuk/better-dateinput-polyfill).

## Emmet expressions support
HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

* `nav>ul>li` -> `<nav><ul><li></li></ul></nav>`
* `form#search.wide` -> `<form id="search" class="wide"></form>`
* `[a='value1' b="value2"]` -> `<div a="value1" b="value2"></div>`
* `ul>li.item$*3` -> `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>`

Because of code size emmet expressions support is only for HTML strings and has some limitations for now, but major features are in place.


## Event handling best practices
Events handling is a big part of writing code for DOM. And there are some features included to the library APIs that force developers to prevent known issues in their code.

#### Get rid of the event object
Event handlers don't own an event object now and this thing improves testability of your code:

```js
// NOTICE: handler don't have e as the first argument
DOM.find("#link").on("click", function() {...});
// NOTICE: the second options argument
DOM.find("#link").on("keydown", {args: ["keyCode", "altKey"]}, function(keyCode, altKey) {...});
```

#### Call preventDefault() or stopPropagation() before logic
It's a common situation to work with unsafe code that can throw an exception. If preventDefault() or stopPropagation() are called at the end of logic than program may start to work unexpected.

```js
// NOTICE: preventDefault is always called before the handler
DOM.find("#link").on("click", {cancel: true}, handler);
// NOTICE: stopPropagation os always called before the handler
DOM.find("#link").on("click", {stop: true}, handler);
```

#### Callback systems are brittle
The library doesn't use callback arrays, so any event listener can't break another one (read the nice [article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).

```js
DOM.ready(function() { throw Error("exception in a bad code"); });
// NOTICE: you'll always see the message in console
DOM.ready(function() { console.log("Nothing can break your code") });
```

## Performance
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

## Browser support
* Chrome
* Safari
* Firefox
* Opera
* IE8+
