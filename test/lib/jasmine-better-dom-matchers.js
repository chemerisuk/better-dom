(function() {
    var sandbox = null,
        matchers = {
        toHaveTag: function() {
            return {
                compare: function(actual, tagName) {
                    var result = {};

                    if (actual) {
                        actual.legacy(function(node) {
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
                        actual.legacy(function(node) {
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
                        actual.legacy(function(node) {
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
                            actual.legacy(function(node) {
                                result.pass = node.hasAttribute(name);
                            });
                        } else if (arguments.length === 3) {
                            actual.legacy(function(node) {
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
                        actual.legacy(function(node) {
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
                        actual.legacy(function(node) {
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
                        actual.legacy(function(node) {
                            result.pass = node.style[name] === value;
                        });
                    }

                    return result;
                }
            };
        }
    };

    jasmine.sandbox = {
        set: function(content) {
            if (typeof content === "string") {
                sandbox.innerHTML = content;
            } else if (typeof content === "object") {
                content.legacy(function(node) {
                    sandbox.innerHTML = "";
                    sandbox.appendChild(node);
                });
            }
        },
        get: function() {
            return sandbox.innerHTML;
        }
    };

    beforeEach(function() {
        jasmine.addMatchers(matchers);

        sandbox = document.createElement("div");
        sandbox.id = "sandbox" + new Date().getTime();

        document.body.appendChild(sandbox);
    });

    afterEach(function() {
        document.body.removeChild(sandbox);
    });
}());
