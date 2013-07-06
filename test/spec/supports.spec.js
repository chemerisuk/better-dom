describe("supports", function() {
    "use strict";

    it("should check element properties first", function() {
        expect(DOM.supports("lang")).toBe(true);
        expect(DOM.supports("forms")).toBe(false);
        expect(DOM.supports("form", "input")).toBe(true);
        expect(DOM.supports("form", "a")).toBe(false);
    });

    it("should check events", function() {
        expect(DOM.supports("onclick")).toBe(true);
        expect(DOM.supports("onsmth")).toBe(false);
        expect(DOM.supports("custom:event")).toBe(false);
    });
});
