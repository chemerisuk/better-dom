# better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
> Live extension playground

In jQuery there is a notion of **live events**. They allow to attach listeners on future elements but do not cover all possible cases. Therefore I'd like to introduce **live extensions** and **better-dom** - a next-level library for working with DOM.

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

## Features
* compact size (~27kb minified and ~6kb gzipped)
* clean, minimalistic and standards-based (if possible) APIs
* [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions)
* [getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)
* [better event handling](https://github.com/chemerisuk/better-dom/wiki/Event-handling)
* [microtemplating via emmet-like syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [i18n support](https://github.com/chemerisuk/better-dom/wiki/Localization)
* [css3 animations support](http://jsfiddle.net/C3WeM/4/)

## Performance
* [DOM.create vs jquery](http://jsperf.com/dom-create-vs-jquery/18)
* [DOM.find[All] vs jQuery.find](http://jsperf.com/dom-find-all-vs-jquery-find/3)
* [DOM getter/setter vs jQuery.attr/prop](http://jsperf.com/dom-getter-setter-vs-jquery-attr-prop/3)
* [better-dom vs jquery: classes manipulation](http://jsperf.com/better-dom-vs-jquery-classes-manipulation)
* [better-dom vs jquery: array methods](http://jsperf.com/better-dom-vs-jquery-array-methods/2)

## Installation
The simplest way is to use [bower](http://bower.io/):

    bower install better-dom --save

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

## Projects that use better-dom
* [better-ajaxify](https://github.com/chemerisuk/better-ajaxify) - Ajax websites engine
* [better-dateinput-polyfill](https://github.com/chemerisuk/better-dateinput-polyfill) - `input[type=date]` polyfill
* [better-timeinput-polyfill](https://github.com/chemerisuk/better-timeinput-polyfill) - `input[type=time]` polyfill
* [better-form-validation](https://github.com/chemerisuk/better-form-validation) - Form validation polyfill
* [better-prettydate](https://github.com/chemerisuk/better-prettydate) - Enhances time element to update text in realtime
* [better-placeholder-polyfill](https://github.com/chemerisuk/better-placeholder-polyfill) - `[placeholder]` polyfill
* [better-elastic-textarea](https://github.com/chemerisuk/better-elastic-textarea) - Make textarea to expand on user input

## Notes about old IEs
For IE8-9 support you have to incude the conditional comment above with 2 extra elements into `<head>`. The excellent [html5shiv](https://github.com/aFarkas/html5shiv) provides fix for new HTML5 tags and [es5-shim](https://github.com/kriskowal/es5-shim) is used to polyfill missed standards-based functions. These projects are bundled into **better-dom-legacy.js** with other fixes.

The **better-dom-legacy.htc** file helps to implement [live extensions](https://github.com/chemerisuk/better-dom/wiki/Live-extensions) support. This fact applies several important limitations that you must know in case when legacy browser support is required.

#### Setup content-type header
HTC behaviors have to serve up with a content-type header of “text/x-component”, otherwise IE will simply ignore the file. Many web servers are preconfigured with the correct content-type, but others are not.

    AddType text/x-component .htc

#### Same domain limitation
IE requires that the HTC file must be in the same domain with as the HTML page which uses it. If you try to load the behavior from a different domain, you will get an “Access Denied” error.

## Browser support
* Chrome
* Safari 6.0+
* Firefox 16+
* Opera 12.10+
* IE8+
