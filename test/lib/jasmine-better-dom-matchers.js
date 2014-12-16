(function(matchers) {
    var el = null;

    jasmine.sandbox = {
        set: function(content) {
            if (typeof content === "string") {
                el.innerHTML = content;
            } else if (typeof content === "object") {
                el.innerHTML = "";
                el.appendChild(content[0]);
            }
        },
        get: function() {
            return el.innerHTML;
        }
    };

    beforeEach(function() {
        jasmine.addMatchers(matchers);

        jasmine.sandbox.id = "sandbox-" + Math.random().toString(32).substr(2);

        el = document.createElement("div");
        el.id = jasmine.sandbox.id;

        document.body.appendChild(el);
    });

    afterEach(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
}({
    toHaveTag: function() {
        return {
            compare: function(actual, tagName) {
                var result = {};

                if (actual) {
                    result.pass = actual[0].nodeName.toLowerCase() === tagName;
                }

                return result;
            }
        };
    },
    toHaveClass: function() {
        return {
            compare: function(actual, className) {
                var result = {};

                if (actual) {
                    result.pass = ~(" " + actual[0].className + " ").indexOf(" " + className + " ");
                }

                return result;
            }
        };
    },
    toHaveId: function() {
        return {
            compare: function(actual, value) {
                var result = {};

                if (actual) {
                    result.pass = actual[0].id === value;
                }

                return result;
            }
        };
    },
    toHaveAttr: function() {
        return {
            compare: function(actual, name, value) {
                var result = {};

                if (actual) {
                    if (arguments.length === 2) {
                        result.pass = actual[0].hasAttribute(name);
                    } else if (arguments.length === 3) {
                        result.pass = actual[0].getAttribute(name) === value;
                    }
                }

                return result;
            }
        };
    },
    toHaveProp: function() {
        return {
            compare: function(actual, name, value) {
                var result = {};

                if (actual) {
                    result.pass = actual[0][name] === value;
                }

                return result;
            }
        };
    },
    toBeEmpty: function() {
        return {
            compare: function(actual) {
                var result = {};

                if (actual) {
                    if ("value" in actual[0]) {
                        result.pass = actual[0].value === "";
                    } else {
                        result.pass = actual[0].innerHTML === "";
                    }
                }

                return result;
            }
        };
    },
    toBeMock: function() {
        return {
            compare: function(actual) {
                var result = {};

                result.pass = actual && !actual[0];

                return result;
            }
        };
    },
    toHaveHtml: function() {
        return {
            compare: function(actual, value) {
                var result = {};

                if (actual) {
                    result.pass = actual[0].innerHTML === value;
                }

                return result;
            }
        };
    },
    toHaveStyle: function() {
        return {
            compare: function(actual, name, value) {
                var result = {};

                if (actual) {
                    var style = actual[0] && actual[0].style;

                    if (style) {
                        // IE8 has upper cased props
                        if (!(name in style)) name = name.toUpperCase();

                        result.pass = style[name] === value;
                    }
                }

                return result;
            }
        };
    }
}));
