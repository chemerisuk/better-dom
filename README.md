# better-dom [![Build Status](https://api.travis-ci.org/chemerisuk/better-dom.png?branch=master)](http://travis-ci.org/chemerisuk/better-dom)
> Sandbox for living DOM extensions

[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)

## Features
* compact size (~28kb minified and ~6kb gzipped)
* clean, standards-based (if possible) APIs
* [living extensions](https://github.com/chemerisuk/better-dom/wiki/Living-extensions)
* [smarter getter and setter](https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter)
* [event handling best practices](https://github.com/chemerisuk/better-dom/wiki/Event-handling)
* [microtemplating via emmet-like syntax](https://github.com/chemerisuk/better-dom/wiki/Microtemplating)
* [localization support](https://github.com/chemerisuk/better-dom/wiki/Localization)
* [css3 animations support](http://jsfiddle.net/C3WeM/)
* cross-browser `input` event

## Performance
* [DOM.create vs jquery](http://jsperf.com/dom-create-vs-jquery/17)
* [emmet vs DOM.template](http://jsperf.com/emmet-vs-dom-parsetemplate/10)
* [DOM.find[All] vs jQuery.find](http://jsperf.com/dom-find-all-vs-jquery-find/2)
* [DOM getter/setter vs jQuery.attr/prop](http://jsperf.com/dom-getter-setter-vs-jquery-attr-prop/2)

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
        <link href="bower_components/better-dom/dist/better-dom.htc" rel="htc"/>
        <script src="bower_components/html5shiv/dist/html5shiv.js"></script>
    <![endif]-->
</head>
<body>
    ...
    <script src="bower_components/better-dom/dist/better-dom.js"></script>
</body>
</html>
```

## Usage examples
* [better-ajaxify](https://github.com/chemerisuk/better-ajaxify) - Ajax websites engine
* [better-dateinput-polyfill](https://github.com/chemerisuk/better-dateinput-polyfill) - input[type=date] polyfill
* [better-timeinput-polyfill](https://github.com/chemerisuk/better-timeinput-polyfill) - input[type=time] polyfill
* [better-form-validation](https://github.com/chemerisuk/better-form-validation) - Form validation polyfill
* [better-prettydate](https://github.com/chemerisuk/better-prettydate) - Enhances time element to update text in realtime
* [better-placeholder-polyfill](https://github.com/chemerisuk/better-placeholder-polyfill) - Placeholder attribute polyfill
* [better-elastic-textarea](https://github.com/chemerisuk/better-elastic-textarea) - Make textarea to expand on user input

## Notes about old IEs
For IE8-9 support you have to incude conditional comment above into head. The excellent __html5shiv__ library is used to fix the HTML5 elements bug in legacy browsers and the HTC file helps to implement live extensions support.

#### Setup content-type header
HTC behaviors have to serve up with a content-type header of “text/x-component”, otherwise IE will simply ignore the file. Many web servers are preconfigured with the correct content-type, but others are not.

    AddType text/x-component .htc

#### Same domain limitation
IE requires that the HTC file must be in the same domain with as the HTML page which uses it. If you try to load the behavior from a different domain, you will get an “Access Denied” error.

## Browser support
* Chrome
* Safari 5.2.2+
* Firefox 16+
* Opera 12.10+
* IE8+
