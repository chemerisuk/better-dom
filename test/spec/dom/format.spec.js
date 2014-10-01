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

    it("should throw error when arguments are invalid", function() {
        expect(function() { DOM.format(undefined) }).toThrow();
        expect(function() { DOM.format(null) }).toThrow();
    });
});
