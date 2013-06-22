better-dom 
==========
> Sandbox for DOM extensions

API description: http://chemerisuk.github.io/better-dom/.

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the library into the `components` directory at the root of your project. Then just include script below on your web page:



## Unobtrusive extensions
`DOM.extend` used to define a new extension and any matched elements will be captured by it. But the coolest thing is that the same will happen even for future content inserted via `innerHTML` or using a javascript framework.

So as a developer you don't need to worry about when and how the extension will be initialized. As a result it's much simpler to create your own [components](#elastic-textarea-example) or to write [polyfills](#placeholder-polyfill-example) for old browsers.

#### placeholder polyfill example
The extension polyfills `[placeholder]` for old browsers

Check out [live demo](http://chemerisuk.github.io/better-placeholder-polyfill/) (open in IE < 10).

#### elastic textarea example
This is a textarea extension which autoresizes itself to contain all entered text.

Check out [live demo](http://chemerisuk.github.io/better-elastic-textarea/) and the [extension repository](https://github.com/chemerisuk/better-elastic-textarea).

#### more code: dateinput polyfill
The extension makes `input[type=date]` controls with the same UX for all browsers.

Check out [live demo](http://chemerisuk.github.io/better-dateinput-polyfill) the [extension repository](https://github.com/chemerisuk/better-dateinput-polyfill).

## Getter and setter
One of the unclear moments about standard DOM APIs is notion of properties and attributes for a element. Every time a developer wants to get some value he or she needs to decide which value to grab. Usually reading a property _is faster_, but a lot of people don't know that or just always use attributes to keep the accessing the same everywhere in a code.

To fix that the library introduces smart getter and setter.



## Emmet expressions
HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

* `nav>ul>li` instead of `<nav><ul><li></li></ul></nav>`
* `form#search.wide` instead of `<form id="search" class="wide"></form>`
* `[a='value1' b="value2"]` instead of `<div a="value1" b="value2"></div>`
* `ul>li.item$*3` instead of `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>`

Because of code size emmet expressions support is only for HTML strings and has some limitations for now, but major features are in place.

## Event handling best practices
Events handling is a big part of writing a code for DOM. And there are some features included to the library APIs that help developers to avoid potential issues and keep their code easier to maintain.

#### Get rid of the event object
Event callback looses event object argument and it improves testability of your code.



#### Correct return false interpretation
jQuery has strange behavior of event handler that returns false and it's [cause of confusion](http://fuelyourcoding.com/jquery-events-stop-misusing-return-false/) for a lot of people. Additionally to preventing default action it also stops propagation and this is a very bad thing that may break plugin compatability. So the better-dom library has standards-friendly behavior.



#### Late binding
Usually an event lintener function is bound when some `addEventListener` method called. This causes trouble when the function value is changed. The library helps to solve the problem by allowing to handle an event using _object property_ instead of just function.



#### Callback systems are brittle
The library doesn't use callback arrays, so any event listener can't break another one (read the [nice article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).


## Easy localization
Multilanguage support is often required for a DOM extension. `DOM.importStrings` allows to add a localized string which may be displayed in a html element using `data-i18n` attribute with an appropriate key.


You can use parametrized strings via special `{param}` substrings and appropriate `data-*` attributes.


To change a string language manually use setter with `lang` parameter.



## Performance
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

## Browser support
* Chrome
* Safari
* Firefox
* Opera
* IE8+
