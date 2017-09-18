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
    }

    if (err) {
        /* istanbul ignore next */
        WINDOW.setTimeout(() => { throw err }, 1);
    } else {
        return result;
    }
};
