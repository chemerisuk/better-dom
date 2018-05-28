# [better-dom](https://github.com/chemerisuk/better-dom): Live extension playground<br>[![NPM version][npm-version]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM downloads][npm-downloads]][npm-url]

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

This library is about __ideas__. After some time of using jQuery I found that it's just too big, has lack of [features](#features) I need and the API design is debatable. In particular [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) was one of the main ideas that encouraged me to build a new library from scratch.

Vanilla DOM also has a lot of bad parts, that I'm trying to fix by providing a JavaScript wrapper for each DOM element you use in code. This extra layer allows to abstract from legacy interfaces and to add new methods on __the top of particular elements__ without touching vanilla DOM prototypes. So the object model used is very different from what jQuery does.

Note, that the better-dom project is only about the DOM. It does not contain any AJAX or BOM helper.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/chemerisuk.svg)](https://saucelabs.com/u/chemerisuk)

## Features
* lightweight: ~5 kB gzipped
* [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)
* [getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)
* [declarative animations](https://github.com/chemerisuk/better-dom/wiki/Declarative-animations)
* [microtemplating using the Emmet syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [improved event handling](https://github.com/chemerisuk/better-dom/wiki/Event-handling)

## Installation
The simplest way is to use [bower](http://bower.io/):

```sh
$ bower install better-dom
```

This will clone the latest version of the __better-dom__ with dependencies into the `bower_components` directory at the root of your project. Then just include the script below on your web page:

```html
<script src="bower_components/better-dom/dist/better-dom.js"></script>
```

If you need to support IE8-9 please read [the section below](#notes-about-old-ies).

## Documentation
* Read the [FAQ](https://github.com/chemerisuk/better-dom/wiki/FAQ)
* Take a look at the [better-dom wiki](https://github.com/chemerisuk/better-dom/wiki)
* Check [releases tab](https://github.com/chemerisuk/better-dom/releases) for getting the changes log
* Walk through the sorce code of existing [projects that use better-dom](http://bower.io/search/?q=better-dom).

## Contributing
In order to modify the source code you have to install [gulp](http://gulpjs.com) globally:

```sh
$ npm install -g gulp
```

The project uses set of ES6 transpilers to compile the output file. You can use command below to start development: 

```sh
$ npm start
```

After any change it recompiles `build/better-dom.js` and runs unit tests automatically.

## Browser support
#### Desktop
* Chrome
* Firefox
* Opera
* Safari
* Edge
* Internet Explorer 10-11

#### Mobile
* iOS Safari 7+
* Chrome for Android 30+
    
[npm-url]: https://www.npmjs.com/package/better-dom
[npm-version]: https://img.shields.io/npm/v/better-dom.svg
[npm-downloads]: https://img.shields.io/npm/dm/better-dom.svg

[travis-url]: http://travis-ci.org/chemerisuk/better-dom
[travis-image]: http://img.shields.io/travis/chemerisuk/better-dom/master.svg

[coveralls-url]: https://coveralls.io/r/chemerisuk/better-dom
[coveralls-image]: http://img.shields.io/coveralls/chemerisuk/better-dom/master.svg
