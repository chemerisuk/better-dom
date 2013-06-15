better-dom 
==========
Making DOM to be nice.

API description: http://chemerisuk.github.io/better-dom/.

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the library into the `components` directory at the root of your project.

Then include script below on your web page:



## Unobtrusive extensions
The idea is to write DOM additions declaratively. `DOM.extend` used to define a new extension and after the call any existing matched element will be initialized with an appropriate constructor. But the coolest thing is that the same will happen even for HTML content inserted dynamically via `innerHTML` or any other javascript framework.

No need to worry about when and how the extension will be initialized. As a result it's much simpler to create your own [components](#elastic-textarea) or to write [polyfills](#placeholder-polyfill) for old browsers.

#### elastic textarea example
This is a textarea extension which autoresizes itself to contain all entered text:


Check out [live demo](http://chemerisuk.github.io/better-elastic-textarea/).

#### placeholder polyfill example
The extension polyfills `[placeholder]` for old browsers

Check out [live demo](http://chemerisuk.github.io/better-placeholder-polyfill/) (open in IE < 10).

#### more code: dateinput polyfill
The extension makes `input[type=date]` controls with the same UX for all browsers.

Check out the [extension repository](https://github.com/chemerisuk/better-dateinput-polyfill).

## Getter and setter
One of the unclear moments about standard DOM APIs is notion of properties and attributes for a element. Every time a developer wants to get some value he or she needs to decide which entity to grab. Usually reading a property is faster, but a lot of people don't know that or just always use attribute to keep the algorithm the same everywhere.

To fix that the library introduces smart getter and setter.



## Emmet expressions support
HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

* `nav>ul>li` instead of `<nav><ul><li></li></ul></nav>`
* `form#search.wide` instead of `<form id="search" class="wide"></form>`
* `[a='value1' b="value2"]` instead of `<div a="value1" b="value2"></div>`
* `ul>li.item$*3` instead of `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>`

Because of code size emmet expressions support is only for HTML strings and has some limitations for now, but major features are in place.

## Better event handling
Events handling is a big part of writing code for DOM. And there are some features included to the library APIs that force developers to use  best practices to prevent potential issues in their code.

#### Get rid of the event object
Event handlers loose event object argument and this thing improves testability of your code.



#### Call preventDefault() or stopPropagation() before logic
It's a common situation to work with unsafe code that can throw an exception. If preventDefault() or stopPropagation() are called at the end of logic than program may start to work unexpected.



#### Callback systems are brittle
The library doesn't use callback arrays, so any event listener can't break another one (read the nice [article](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) for additional details).



## Performance
DOM is usually the main bottleneck of javascript applications. Therefore performance question should be on the top for any library that works with it.

## Browser support
* Chrome
* Safari
* Firefox
* Opera
* IE8+
