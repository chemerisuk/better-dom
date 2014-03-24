# better-dom [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]
> Live extension playground

jQuery knows a concept called “**live events**”. Using the idea of event delegation they enabled developers to handle existing and future elements. 
But more flexibility is required in a lot of cases. For example, delegated events fall short when the DOM needs to be mutated in order to initialize a widget. To handle such cases I'd like to introduce **[live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)** and **better-dom** - a new library for working with the DOM.

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

## Quick start
I'd recommend to read articles below that cover the main ideas of the library:
* [Introduction into the better-dom library in English](http://coding.smashingmagazine.com/2014/01/13/better-javascript-library-for-the-dom/) @smashingmagazine.com
* [Введение в библиотеку better-dom по-русски](http://habrahabr.ru/post/209140/) @habrahabr.ru

## Features
* compact size: ~27kb minified and ~6kb gzipped version ([custom builds](#how-to-make-a-custom-build) are available to reduce file size even more)
* clear, minimalistic and standards-based (where possible) APIs
* [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)
* [animations via CSS3](http://jsfiddle.net/C3WeM/5/)
* [i18n support](https://github.com/chemerisuk/better-dom/wiki/Localization)
* [microtemplating using the Emmet syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [improved event handling](https://github.com/chemerisuk/better-dom/wiki/Event-handling)
* [getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the __better-dom__ with dependencies into the `bower_components` directory at the root of your project. Then just include scripts below on your web page:

```html
<!DOCTYPE html>
<html>
<head>
    ...
    <!--[if IE]>
        <link href="bower_components/better-dom/dist/better-dom-legacy.htc" rel="htc"/>
        <script src="bower_components/better-dom/dist/better-dom-legacy.js"></script>
    <![endif]-->
</head>
<body>
    ...
    <script src="bower_components/better-dom/dist/better-dom.js"></script>
</body>
</html>
```

## Documentation
* Read the [FAQ](https://github.com/chemerisuk/better-dom/wiki/FAQ)
* Take a look at the [better-dom wiki](https://github.com/chemerisuk/better-dom/wiki)
* Check [releases tab](https://github.com/chemerisuk/better-dom/releases) for getting the changes log
* Walk through the sorce code of existing [projects that use better-dom](http://bower.io/search/?q=better-dom).

## Performance
* [DOM.create vs jquery](http://jsperf.com/dom-create-vs-jquery/26)
* [DOM.find[All] vs jQuery.find](http://jsperf.com/dom-find-all-vs-jquery-find/10)
* [DOM getter/setter vs jQuery.attr/prop](http://jsperf.com/dom-getter-setter-vs-jquery-attr-prop/5)
* [better-dom vs jquery: classes manipulation](http://jsperf.com/better-dom-vs-jquery-classes-manipulation/6)
* [better-dom vs jquery: array methods](http://jsperf.com/better-dom-vs-jquery-array-methods/4)

## How to make a custom build
In order to create a custom build make sure that you installed [grunt-cli](https://github.com/gruntjs/grunt-cli) globally:

    npm install -g grunt-cli

Then you can print all available modules for customization via the default task:

    grunt

To create a full build run `build` task without arguments:

    grunt build

Your build will be created inside of the `build` folder including uglified version with source maps. Pick modules that you want to exclude and pass them to the same task separated by comma:

    grunt build:classes,offset,traversing

Look at the [API documentation](http://chemerisuk.github.io/better-dom/) to find which functions are included into a particular module (see *Modules* menu).

## Notes about old IEs
For IE8-9 support you have to incude extra files via conditional comment (see [Installation](#installation) section).

The **better-dom-legacy.js** file includes excellent [html5shiv](https://github.com/aFarkas/html5shiv) that provides fix for HTML5 tags and [es5-shim](https://github.com/kriskowal/es5-shim) is used to polyfill missed standards-based functions. These projects are bundled into signle file with other fixes.

The **better-dom-legacy.htc** file helps to implement [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) support. This fact applies several important limitations that you must know in case when legacy browser support is required.

#### Setup content-type header
HTC behaviors have to serve up with a content-type header of “text/x-component”, otherwise IE will simply ignore the file. Many web servers are preconfigured with the correct content-type, but others are not.

    AddType text/x-component .htc

#### Same domain limitation
IE requires that the HTC file must be in the same domain with as the HTML page which uses it. If you try to load the behavior from a different domain, you will get an “Access Denied” error.

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* IE8+

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

Opera Mini is out of the scope because of lack of support for CSS3 Animations.

[travis-url]: http://travis-ci.org/chemerisuk/better-dom
[travis-image]: https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-dom
[coveralls-image]: https://coveralls.io/repos/chemerisuk/better-dom/badge.png?branch=master

