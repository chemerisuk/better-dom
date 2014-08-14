(function(matchers) {
    var el = null;

    jasmine.sandbox = {
        set: function(content) {
            if (typeof content === "string") {
                el.innerHTML = content;
            } else if (typeof content === "object") {
                content.each(function(_, node) {
                    el.innerHTML = "";
                    el.appendChild(node);
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
                    actual.each(function(_, node) {
                        result.pass = node.nodeName.toLowerCase() === tagName;
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
                    actual.each(function(_, node) {
                        result.pass = ~(" " + node.className + " ").indexOf(" " + className + " ");
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
                    actual.each(function(_, node) {
                        result.pass = node.id === value;
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
                    if (arguments.length === 2) {
                        actual.each(function(_, node) {
                            result.pass = node.hasAttribute(name);
                        });
                    } else if (arguments.length === 3) {
                        actual.each(function(_, node) {
                            result.pass = node.getAttribute(name) === value;
                        });
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
                    actual.each(function(_, node) {
                        result.pass = node[name] === value;
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

                result.pass = actual && !actual.length;

                return result;
            }
        };
    },
    toHaveHtml: function() {
        return {
            compare: function(actual, value) {
                var result = {};

                if (actual) {
                    actual.each(function(_, node) {
                        result.pass = node.innerHTML === value;
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
                    actual.each(function(_, node) {
                        // IE8 has upper cased props
                        if (!(name in node.style)) name = name.toUpperCase();

                        result.pass = node.style[name] === value;
                    });
                }

                return result;
            }
        };
    }
}));
