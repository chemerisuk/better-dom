// customized errors

function MethodError(methodName, type = "$Element") {
    this.message = type + "." + methodName + " was called with illegal arguments. Check <%= pkg.docs %> to verify the call";
}

MethodError.prototype = new TypeError();

function StaticMethodError(methodName) {
    MethodError.call(this, methodName, "DOM");
}

StaticMethodError.prototype = new TypeError();

export { MethodError, StaticMethodError };
