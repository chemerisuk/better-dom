define(["DOM"], function(DOM, _makeError) {
    "use strict";

    /**
     * Return current page title
     * @memberOf DOM
     * @return {String} current page title
     */
    DOM.getTitle = function() {
        return document.title;
    };

    /**
     * Change current page title
     * @memberOf DOM
     * @param  {String} value new title
     * @return {DOM}
     */
    DOM.setTitle = function(value) {
        if (typeof value !== "string") {
            throw _makeError("setTitle", this);
        }
        
        document.title = value;

        return this;
    };
});
