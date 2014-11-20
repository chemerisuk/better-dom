describe("DOM.format", function() {
    "use strict";

    it("should format a string", function() {
        expect(DOM.format("{0}-{1}", [0, 1])).toBe("0-1");
        expect(DOM.format("{a} and {b}", {a: "c", b: "d"})).toBe("c and d");
        expect(DOM.format("{a} and {b}", {a: null, b: undefined})).toBe("null and undefined");
    });

    it("should not throw errors in some cases", function() {
        expect(function() { DOM.format("test {0}", undefined) }).not.toThrow();
        expect(function() { DOM.format("test {0}", null) }).not.toThrow();
        expect(function() { DOM.format("test {0}", "090") }).not.toThrow();
    });

    it("accepts any argument type", function() {
        expect(DOM.format(undefined)).toBe("undefined");
        expect(DOM.format(null)).toBe("null");
        expect(DOM.format(111)).toBe("111");

        function Foo() {}

        Foo.prototype.toString = function() { return "bar" };

        expect(DOM.format(new Foo())).toBe("bar");
    });

    it("can accept functions in arg map", function() {
        var functor = function(index) {
                expect(index).toBe(4);

                return "test";
            };

        expect(DOM.format("foo {bar}", { bar: functor })).toBe("foo test");
    });
});
