import _ from "../util/index";
import { MethodError } from "../errors";

_.register({
    map(fn, context) {
        if (typeof fn !== "function") {
            throw new MethodError("map", arguments);
        }

        return [ fn.call(context, this) ];
    }
}, () => {
    return () => [];
});
