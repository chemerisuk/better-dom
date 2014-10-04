import _ from "./util/index";

// customized errors

function MethodError(methodName, args, type = "$Element") {
    var url = "<%= pkg.docs %>/" + type + ".html#" + methodName,
        line = type + (type === "DOM" ? "." : "#") + methodName + "(";

    line += _.map.call(args, (arg) => JSON.stringify(arg)).join(", ") + ");";

    this.message = line + " Check " + url + " to verify the function call";
}

MethodError.prototype = new TypeError();

function StaticMethodError(methodName, args) {
    MethodError.call(this, methodName, args, "DOM");
}

StaticMethodError.prototype = new TypeError();

export { MethodError, StaticMethodError };
