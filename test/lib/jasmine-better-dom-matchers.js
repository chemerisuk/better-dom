(function() {
    var sandbox = null,
        matchers = {
        toHaveTag: function(tagName) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = node.nodeName.toLowerCase() === tagName;
                });
            }

            return result;
        },
        toHaveClass: function(className) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = ~(" " + node.className + " ").indexOf(" " + className + " ");
                });
            }

            return result;
        },
        toHaveId: function(value) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = node.id === value;
                });
            }

            return result;
        },
        toHaveAttr: function(name, value) {
            var result = false;

            if (this.actual) {
                if (arguments.length === 1) {
                    this.actual.legacy(function(node) {
                        result = node.hasAttribute(name);
                    });
                } else if (arguments.length === 2) {
                    this.actual.legacy(function(node) {
                        result = node.getAttribute(name) === value;
                    });
                }
            }

            return result;
        },
        toHaveProp: function(name, value) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = node[name] === value;
                });
            }

            return result;
        },
        toBeEmpty: function() {
            return this.actual && !this.actual.length;
        },
        toHaveHtml: function(value) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = node.innerHTML === value;
                });
            }

            return result;
        },
        toHaveStyle: function(name, value) {
            var result = false;

            if (this.actual) {
                this.actual.legacy(function(node) {
                    result = node.style[name] === value;
                });
            }

            return result;
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
        this.addMatchers(matchers);

        sandbox = document.createElement("div");
        sandbox.id = "sandbox" + new Date().getTime();

        document.body.appendChild(sandbox);
    });

    afterEach(function() {
        document.body.removeChild(sandbox);
    });
}());
