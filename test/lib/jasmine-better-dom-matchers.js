(function(matchers) {
    var el = null;

    jasmine.sandbox = {
        set: function(content) {
            if (typeof content === "string") {
                el.innerHTML = content;
            } else if (typeof content === "object") {
                el.innerHTML = "";
                content.then((n) => {
                    el.appendChild(n);
                });
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
                    actual.then((n) => {
                        result.pass = n.nodeName.toLowerCase() === tagName;
                    });
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
                    actual.then((n) => {
                        result.pass = ~(" " + n.className + " ").indexOf(" " + className + " ");
                    });
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
                    actual.then((n) => {
                        result.pass = n.id === value;
                    });
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
                    actual.then((n) => {
                        if (arguments.length === 2) {
                            result.pass = n.hasAttribute(name);
                        } else if (arguments.length === 3) {
                            result.pass = n.getAttribute(name) === value;
                        }
                    });
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
                    actual.then((n) => {
                        result.pass = n[name] === value;
                    });
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
                    actual.then((n) => {
                        if ("value" in n) {
                            result.pass = n.value === "";
                        } else {
                            result.pass = n.innerHTML === "";
                        }
                    });
                }

                return result;
            }
        };
    },
    toBeMock: function() {
        return {
            compare: function(actual) {
                var result = {};

                if (+actual) {
                    result.pass = false;
                } else {
                    result.pass = true;
                }

                return result;
            }
        };
    },
    toHaveHtml: function() {
        return {
            compare: function(actual, value) {
                var result = {};

                if (actual) {
                    actual.then((n) => {
                        result.pass = n.innerHTML === value;
                    });
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
                    actual.then((n) => {
                        var style = n && n.style;

                        if (style) {
                            // IE8 has upper cased props
                            if (!(name in style)) name = name.toUpperCase();

                            result.pass = style[name] === value;
                        }
                    });
                }

                return result;
            }
        };
    }
}));
