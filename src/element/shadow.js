import _ from "../util/index";
import { JSCRIPT_VERSION, DOCUMENT } from "../const";
import { $Element } from "../types";

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

_.register({
    shadow(width, height, callback) {
        var node = this[0];
        var obj = DOCUMENT.createElement("object");

        // TODO: width and height are optional
        obj.type = "text/html";
        obj.width = width || "300px";
        obj.height = height || "100px";
        obj.onload = () => {
            if (typeof callback === "function") {
                var api = new $Element(obj.contentDocument.documentElement);

                callback(api);
            }
        };

        if (!JSCRIPT_VERSION) obj.data = "about:blank";
        // TODO: check if parent is not null
        node.parentNode.insertBefore(obj, node);
        // must add data source after insertion, because IE is a goon
        if (JSCRIPT_VERSION) obj.data = "about:blank";

        return this;
    }
});
