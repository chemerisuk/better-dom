import { $Node } from "../node/index";
import { WINDOW } from "../const";

$Node.prototype.then = function(resolve) {
    const node = this["<%= prop() %>"];
    var result, err;

    if (node) {
        try {
            result = resolve(node);
        } catch (e) {
            err = e;
        }
    } else {
        err = new TypeError("node must not be null");
    }

    if (err) {
        console.error(err);
    } else {
        return result;
    }
};
