describe("DOM.mock", function() {
    "use strict";

    it("should return instance of DOMElement", function() {
        var el = DOM.mock();

        expect(el).toBeDefined();
        expect(el._node).toBeFalsy();
    });

    it("should populate instance with extension methods", function() {
        setFixtures("<div class='mock'></div>");

        var method = function() {}, field = new Date();

        DOM.extend(".mock", {
            method: method,
            field: field
        });

        waits(50);

        runs(function() {
            var el = DOM.mock(".mock");

            expect(el.method).toBe(method);
            expect(el.field).toBe(field);
        });
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.mock(1); }).toThrow();
    });

});
