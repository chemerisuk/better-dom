`DOM.extend` used to define a new extension and any matched element starts to be captured by it. But the coolest thing is that the same will happen even for future content inserted via `innerHTML` or using any other javascript framework.

So as a developer you don't need to worry about when and how the extension is initialized. It just works. As a result it's much simpler to create new extensions or to write cross-browser polyfills.

Every extension have a structure below:

    DOM.extend(".myplugin", {
        constructor: function() {
            // initialize extension
        },
        method: function() {
            // this method will be mixed into every matched element
        }
    });