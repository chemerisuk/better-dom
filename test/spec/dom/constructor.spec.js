describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element object", function() {
        var node = document.createElement("a"),
            el = DOM.$(node);

        expect(el).toHaveTag("a");

        el.then((n) => {
            expect(n).toBe(node);
        });
    });

    it("supports document objects", function() {
        var el = DOM.$(document);

        expect(el).toBe(DOM);

        el.then((n) => {
            expect(n).toBe(document);
        });
    });

    it("should not accept non-elements", function() {
        var node = document.createTextNode("text"),
            el = DOM.$(node);

        el.then((n) => {
            expect(n).not.toBe(node);
        });
    });

    it("sets property length", function() {
        expect(DOM.mock().length).toBeUndefined();
        expect(DOM.create("<a>").length).toBeUndefined();
        expect(DOM.createAll("<b></b><b></b>").length).toBe(2);
    });
});
