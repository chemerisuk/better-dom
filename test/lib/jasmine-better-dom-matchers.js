(function() {
    var sandbox = null,
        matchers = {
        toHaveTag: function(tagName) {
            if (this.actual && this.actual._node) {
                return this.actual._node.nodeName.toLowerCase() === tagName;
            }

            return false;
        },
        toHaveClass: function(className) {
            if (this.actual && this.actual._node) {
                return ~(" " + this.actual._node.className + " ").indexOf(" " + className + " ");
            }

            return false;
        },
        toHaveId: function(value) {
            if (this.actual && this.actual._node) {
                return this.actual._node.id === value;
            }

            return false;
        },
        toHaveAttr: function(name, value) {
            if (this.actual && this.actual._node) {
                if (arguments.length === 1) {
                    return this.actual._node.hasAttribute(name);
                } else if (arguments.length === 2) {
                    return this.actual._node.getAttribute(name) === value;
                }
            }

            return false;
        },
        toBeEmpty: function() {
            return this.actual && !this.actual._node;
        },
        toHaveHtml: function(value) {
            if (this.actual && this.actual._node) {
                return this.actual._node.innerHTML === value;
            }

            return false;
        },
        toHaveStyle: function(name, value) {
            if (this.actual && this.actual._node) {
                return this.actual._node.style[name] === value;
            }

            return false;
        }
    };

    jasmine.sandbox = {
        set: function(content) {
            if (typeof content === "string") {
                sandbox.innerHTML = content;
            } else if (typeof content === "object") {
                sandbox.innerHTML = "";
                sandbox.appendChild(content._node);
            }
        },
        get: function() {
            return sandbox.innerHTML;
        }
    };

    sandbox = document.createElement("div");
    sandbox.id = "sandbox";

    window.onload = function() {
        document.body.appendChild(sandbox);
    };

    beforeEach(function() {
        this.addMatchers(matchers);
    });

    afterEach(function() {
        sandbox.innerHTML = "";
    });
}());
