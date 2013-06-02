define([], function() {
    "use strict";

    // HELPERS
    // -------

    // jshint unused:false
    var supports = function(prop, tag) {
            var el = typeof tag === "string" ? createElement(tag) : tag || document,
                isSupported = prop in el;

            if (!isSupported && !prop.indexOf("on")) {
                // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
                
                el.setAttribute(prop, "return;");
                isSupported = typeof el[prop] === "function";
            }
                
            return isSupported;
        },
        makeError = function(method, type) {
            type = type || "DOMElement";

            return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
        },
        handleObjectParam = function(name) {
            var cache = {};

            return cache[name] || (cache[name] = function(key, index, obj) {
                this[name](key, obj[key]);
            });
        },
        getComputedStyle = window.getComputedStyle || function(el) {
            return el.currentStyle;
        },
        parseFragment, createElement, createFragment;

    (function() {
        var parser = document.createElement("body");

        if (document.addEventListener) {
            createElement = function(tagName) {
                return document.createElement(tagName);
            };
            createFragment = function() {
                return document.createDocumentFragment();
            };
        } else {
            // Add html5 elements support via:
            // https://github.com/aFarkas/html5shiv
            (function(){
                var elements = "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                    // Used to skip problem elements
                    reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                    // Not all elements can be cloned in IE
                    saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                    create = document.createElement,
                    frag = document.createDocumentFragment(),
                    cache = {};

                frag.appendChild(parser);

                createElement = function(nodeName) {
                    var node;

                    if (cache[nodeName]) {
                        node = cache[nodeName].cloneNode();
                    } else if (saveClones.test(nodeName)) {
                        node = (cache[nodeName] = create(nodeName)).cloneNode();
                    } else {
                        node = create(nodeName);
                    }

                    return node.canHaveChildren && !reSkip.test(nodeName) ? frag.appendChild(node) : node;
                };

                createFragment = Function("f", "return function(){" +
                    "var n=f.cloneNode(),c=n.createElement;" +
                    "(" +
                        // unroll the `createElement` calls
                        elements.split(" ").join().replace(/\w+/g, function(nodeName) {
                            create(nodeName);
                            frag.createElement(nodeName);
                            return "c('" + nodeName + "')";
                        }) +
                    ");return n}"
                )(frag);
            })();
        }

        parseFragment = function(html) {
            var fragment = createFragment();

            // fix NoScope bug
            parser.innerHTML = "<br/>" + html;
            parser.removeChild(parser.firstChild);

            while (parser.firstChild) {
                fragment.appendChild(parser.firstChild);
            }

            return fragment;
        };
    })();
});