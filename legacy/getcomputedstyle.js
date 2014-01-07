// getComputedStyle implementation

if (!window.getComputedStyle) {
    window.getComputedStyle = function(node) {
        return node.currentStyle;
    };
}
