describe("DOM.mock", function() {
    "use strict";

    it("should return instance of DOMElement", function() {
        var el = DOM.mock();

        expect(el).toBeDefined();
        expect(el._node).toBeFalsy();
    });

    it("should populate instance with extension methods", function() {
        var method = function() {},
            field = new Date(),
            el;

        DOM.extend(".mock", { method: method, field: field });

        el = DOM.mock("div.mock");

        expect(el.method).toBe(method);
        expect(el.field).toBe(field);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.mock(1); }).toThrow();
    });

});
