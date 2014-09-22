# [better-dom](https://github.com/chemerisuk/better-dom): Live extension playground<br>[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Bower version][fury-image]][fury-url]

_**NOTE:** documentation is currently updating to reflect changes in version 2. If you need the 1st version please use [v1.7.7 tag](https://github.com/chemerisuk/better-dom/tree/v1.7.7)._

This library is about __ideas__. After some time of using jQuery I found that it's just too big, has lack of [features](#features) I need and some desicions of the API design is debatable. In particular [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) was one of the main ideas that encoraged me to build a new library from scratch.

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/chemerisuk.svg)](https://saucelabs.com/u/chemerisuk)

## Features
* lightweight: ~22 kB minified and ~5 kB gzipped version
* clear, minimalistic and standards-based (where possible) APIs
* [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)
* [animations via CSS3](http://jsfiddle.net/C3WeM/5/)
* [microtemplating using the Emmet syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [improved event handling](https://github.com/chemerisuk/better-dom/wiki/Event-handling)
* [getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom

This will clone the latest version of the __better-dom__ with dependencies into the `bower_components` directory at the root of your project. Then just include the script below on your web page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
```

## Documentation
* Read the [FAQ](https://github.com/chemerisuk/better-dom/wiki/FAQ)
* Take a look at the [better-dom wiki](https://github.com/chemerisuk/better-dom/wiki)
* Check [releases tab](https://github.com/chemerisuk/better-dom/releases) for getting the changes log
* Walk through the sorce code of existing [projects that use better-dom](http://bower.io/search/?q=better-dom).

## Contributing
In order to modify the source and submit a patch or improvement, you have to have [grunt](https://github.com/gruntjs/grunt-cli) installed globally:

    npm install -g grunt-cli

The project uses set of ES6 transpilers to compile a file that works in current browsers. The command below starts watching for changes you are making, recompiles `build/better-dom.js` and runs unit tests after it: 

    npm start

Of course any pull request should pass all tests. Code style guide is not formalized yet, but I'll look at it manully.

## Performance
* [DOM.create vs jquery](http://jsperf.com/dom-create-vs-jquery/26)
* [DOM.find[All] vs jQuery.find](http://jsperf.com/dom-find-all-vs-jquery-find/10)
* [DOM getter/setter vs jQuery.attr/prop](http://jsperf.com/dom-getter-setter-vs-jquery-attr-prop/5)
* [better-dom vs jquery: classes manipulation](http://jsperf.com/better-dom-vs-jquery-classes-manipulation/6)
* [better-dom vs jquery: array methods](http://jsperf.com/better-dom-vs-jquery-array-methods/4)

## Notes about old IEs
For IE8-9 support you have to incude extra files via the conditional comment below into `<head>` on your page:

```
<!--[if IE]>
    <link href="bower_components/better-dom/dist/better-dom.htc" rel="htc"/>
    <script src="bower_components/es5-shim/es5-shim.js"></script>
    <script src="bower_components/html5shiv/dist/html5shiv.js"></script>
<![endif]-->
```

The **better-dom.htc** file helps to implement [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) support. This fact applies several important limitations that you must know in case when legacy browser support is required:

1) HTC behaviors have to serve up with a `content-type` header of `“text/x-component”`, otherwise IE will simply ignore the file. Many web servers are preconfigured with the correct `content-type`, but others are not:

    AddType text/x-component .htc

2) IE requires that the HTC file must be in the same domain with as the HTML page which uses it. If you try to load the behavior from a different domain, you will get an “Access Denied” error.

[html5shiv](https://github.com/aFarkas/html5shiv) provides a fix for HTML5 tags in IE8.

[es5-shim](https://github.com/kriskowal/es5-shim) is used to polyfill/fix missed standards-based functions for `Array`, `Object`, `Function`, `Date` classes.

## Browser support
#### Desktop
* Chrome
* Safari 6.0+
* Firefox 16+
* Internet Explorer 8+ (see [notes](#notes-about-old-ies))
* Opera 12.10+

#### Mobile
* iOS Safari 6+
* Android 2.3+
* Chrome for Android

Opera Mini is out of the scope because of lack of support for CSS3 Animations.

[travis-url]: http://travis-ci.org/chemerisuk/better-dom
[travis-image]: http://img.shields.io/travis/chemerisuk/better-dom/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-dom
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-dom/master.svg

[fury-url]: http://badge.fury.io/bo/better-dom
[fury-image]: https://badge.fury.io/bo/better-dom.svg

