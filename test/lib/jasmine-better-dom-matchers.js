(function() {
    var matchers = {
        toHaveTagEx: function(tagName) {
            if (this.actual && this.actual._node) {
                return this.actual._node.nodeName.toLowerCase() === tagName;
            }

            return false;
        },
        toHaveClassEx: function(className) {
            if (this.actual && this.actual._node) {
                return ~(" " + this.actual._node.className + " ").indexOf(" " + className + " ");
            }

            return false;
        },
        toHaveIdEx: function(value) {
            if (this.actual && this.actual._node) {
                return this.actual._node.id === value;
            }

            return false;
        },
        toHaveAttrEx: function(name, value) {
            if (this.actual && this.actual._node) {
                if (arguments.length === 1) {
                    return this.actual._node.hasAttribute(name);
                } else if (arguments.length === 2) {
                    return this.actual._node.getAttribute(name) === value;
                }
            }

            return false;
        },
        toBeEmptyEx: function() {
            return this.actual && !this.actual._node;
        },
        toHaveHtmlEx: function(value) {
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

    beforeEach(function() {
        this.addMatchers(matchers);
    });
}());
