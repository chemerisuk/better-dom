import { map } from "./util/index";

// customized errors

export function MethodError(methodName, args, type = "$Element") {
    var url = "<%= pkg.docs %>/" + type + ".html#" + methodName,
        line = "invalid call `" + type + (type === "DOM" ? "." : "#") + methodName + "(";

    line += map.call(args, String).join(", ") + ")`. ";

    this.message = line + "Check " + url + " to verify the arguments";
}

MethodError.prototype = new TypeError();

export function StaticMethodError(methodName, args) {
    MethodError.call(this, methodName, args, "DOM");
}

StaticMethodError.prototype = new TypeError();

export function DocumentTypeError(methodName, args) {
    MethodError.call(this, methodName, args, "$Document");
}

DocumentTypeError.prototype = new TypeError();
