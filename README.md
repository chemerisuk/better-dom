# better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
> Sandbox for living DOM extensions

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the __better-dom__ with dependencies into the `bower_components` directory at the root of your project. Then just include scripts below on your web page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <!--[if IE]><script src="bower_components/html5shiv/dist/html5shiv.js"></script><![endif]-->
</head>
<body>
    ...
    <script src="bower_components/better-dom/better-dom.js" data-htc="bower_components/better-dom/better-dom.htc"></script>
</body>
</html>
```

## Living extensions
`DOM.extend` used to define a new extension and any matched element starts to be captured by it. But the coolest thing is that the same will happen even for future content inserted via `innerHTML` or using any other javascript framework.

So as a developer you don't need to worry about when and how the extension is initialized. It just works. As a result it's much simpler to create new extensions or to write cross-browser polyfills.

#### Usage examples
* [better-placeholder-polyfill](https://github.com/chemerisuk/better-placeholder-polyfill) - Placeholder attribute polyfill
* [better-elastic-textarea](https://github.com/chemerisuk/better-elastic-textarea) - Make textarea to expand on user input
* [better-dateinput-polyfill](https://github.com/chemerisuk/better-dateinput-polyfill) - input[type=date] polyfill
* [better-form-validation](https://github.com/chemerisuk/better-form-validation) - Form validation polyfill
* [better-prettydate](https://github.com/chemerisuk/better-prettydate) - Enhances time element to update text in realtime
* [better-ajaxify](https://github.com/chemerisuk/better-ajaxify) - Ajax websites engine for better-dom

## Getter and setter
Standard DOM APIs have a notion of property and attribute for a element. Usually reading a property is _faster_, but a lot of people don't know that or just always use attributes to keep code the same everywhere.

The library fixes this confusion and introduces _smart_ getter and setter.

```js
var link = DOM.find("#link");

// returns value of the id property (i.e. "link" string)
link.get("id");
// returns value of the "data-attr" attribute
link.get("data-attr");
// returns innerHTML of the element
link.get();

// sets property href (and that action updates attribute value too)
link.set("href", "/some/path");
// sets the "data-attr" attribute to "123"
link.set("data-attr", "123");
// sets innerHTML to "some text"
link.set("some text");
```

## Event handling best practices
Event handling is a big part of coding for DOM. There are some features included into the library that help developers to avoid potential issues and keep their code easier to maintain.

#### Get rid of the event object
Event callbacks loose the event object argument that improves testability of code.

```js
// NOTICE: handler don't have e as the first argument
input.on("click", function() {...});
// NOTICE: using of array to pass event properties into callback
input.on("keydown", ["which", "altKey"], function(which, altKey) {...});
```

#### Correct return false interpretation
jQuery has strange behavior of event handler that returns false which is a [cause of confusion](http://fuelyourcoding.com/jquery-events-stop-misusing-return-false/) for a lot of people. This library has standards-based behavior and does what everybody expects.

```js
// NOTICE: returning false prevents ONLY default action
DOM.find("a").on("click", function() { return false; });
```

#### stopPropagation is evil
If you need to call stopPropagation in an event handler in 95% situations you are doing something wrong. Solutions that utilize this function becomes to be complex, moreover they introduce compatability problems. Probably every experienced javascript developer had a issue where a third party script has blocked some useful event and there is no way to fix exept forking the extension's source code.

That's why it's _not possible to call stopPropagation_ using better-dom. And this is not a bug _it's a feature_.

#### Late binding
Usually an event listener is bound when the `addEventListener` method is called. This causes trouble when the handler is changed. The library helps to solve the problem by allowing to listent to an event using _object property_ instead of just function.

```js
var link = DOM.find(".test-link"),
    obj = {handleClick: function() { console.log("Hello!"); }};

link.on("click", obj, "handleClick");
// every click on the link now logs "Hello!" into console
obj.handleClick = function() { console.log("Hello, Maksim!"); }
// every click on the link now logs "Hello, Maksim!" into console
```

#### Callback systems are brittle
There are no callback arrays, so any event listener can't break another one (read a [nice article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).

```js
DOM.ready(function() { throw Error("exception in a bad code"); });
// NOTICE: you'll always see the message in console
DOM.ready(function() { console.log("Nothing can break your code") });
```

## Emmet expressions
HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

* `nav>ul>li` instead of `<nav><ul><li></li></ul></nav>`
* `form#search.wide` instead of `<form id="search" class="wide"></form>`
* `[a='value1' b="value2"]` instead of `<div a="value1" b="value2"></div>`
* `ul>li.item$*3` instead of `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>`

Because of code size emmet expressions support is only for HTML strings for now. Take a look at the [emmet cheat sheet](http://docs.emmet.io/cheat-sheet/) for more examples.

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

#### Behind the scenes
All strings are actually stored in css and `:before` pseudoelement is used to display them. So the code above actually create several css rules below:

```css
[data-i18n="hello.0"]:before {content: "Hello!"}
[data-i18n="hello.0"]:lang(ru):before {content: "Привет!"}
[data-i18n="hello.1"]:before {content: "Hello " attr(data-user) "!"}
```

## Browser support
* Chrome
* Safari 5.2.2+
* Firefox 16+
* Opera 12.10+
* IE8+
