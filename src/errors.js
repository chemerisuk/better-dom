// customized errors

function MethodError(methodName, type = "$Element") {
    var url = "<%= pkg.docs %>" + type + ".html#" + methodName;

    this.message = type + "#" + methodName + " was called with illegal arguments. Check " + url + " to verify the method call";
}

MethodError.prototype = new TypeError();

function StaticMethodError(methodName) {
    MethodError.call(this, methodName, "DOM");
}

StaticMethodError.prototype = new TypeError();

export { MethodError, StaticMethodError };
