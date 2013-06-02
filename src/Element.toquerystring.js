define(["Element"], function(DOMElement) {
    "use strict";

    /**
     * Serialize element into query string
     * @return {String} query string
     */
    DOMElement.prototype.toQueryString = function() {
        var el = this._node, result,
            makePair = function(name, value) {
                return encodeURIComponent(name) + "=" +encodeURIComponent(value);
            };

        if (el.elements) {
            result = _.reduce(el.elements, function(parts, field) {
                if (field.name) { // don't include form fields without names
                    switch(field.type) {
                    case "select-one":
                    case "select-multiple":
                        _.forEach(field.options, function(option) {
                            if (option.selected) {
                                parts.push(makePair(field.name, option.hasAttribute("value") ? option.value : option.text));
                            }
                        });
                        break;
    
                    case undefined: // fieldset
                    case "file": // file input
                    case "submit": // submit button
                    case "reset": // reset button
                    case "button": // custom button
                        break;
    
                    case "radio": // radio button
                    case "checkbox": // checkbox
                        if (!field.checked) break;
                        /* falls through */
                    default:
                        parts.push(makePair(field.name, field.value));
                    }

                    return parts;
                }
            }, []);

            result = result.join("&");
        } else if (el.form) {
            result = makePair(el.name, el.value);
        } else {
            throw this.makeError("toQueryString");
        }

        return result.replace(/%20/g, "+");
    };
});