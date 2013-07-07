define(["DOM"], function(DOM) {
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
     * @param  {String} [value] new title
     * @return {DOM}
     */
    DOM.setTitle = function(value) {
        document.title = value;

        return this;
    };
});
