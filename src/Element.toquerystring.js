define(["Element"], function(DOMElement, _forEach) {
    "use strict";

    // FORM SERIALIZATION
    // ------------------

    /**
     * Serialize element into query string
     * @return {String} query string
     * @function
     */
    DOMElement.prototype.toQueryString = (function(){
        var makePair = function(name, value) {
                return encodeURIComponent(name) + "=" + encodeURIComponent(value);
            };

        return function() {
            var el = this._node,
                result = [];

            _forEach(el.elements || (el.form ? [el] : []), function(el) {
                if (el.name) { // don't include form fields without names
                    switch(el.type) {
                    case "select-one":
                    case "select-multiple":
                        _forEach(el.options, function(option) {
                            if (option.selected) {
                                result.push(makePair(el.name, option.hasAttribute("value") ? option.value : option.text));
                            }
                        });
                        break;
    
                    case undefined:
                    case "fieldset": // fieldset
                    case "file": // file input
                    case "submit": // submit button
                    case "reset": // reset button
                    case "button": // custom button
                        break;
    
                    case "radio": // radio button
                    case "checkbox": // checkbox
                        if (!el.checked) break;
                        /* falls through */
                    default:
                        result.push(makePair(el.name, el.value));
                    }
                }
            });

            return result.join("&").replace(/%20/g, "+");
        };
    }());
});