describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element object", function() {
        var node = document.createElement("a"),
            el = DOM.$(node);

        expect(el).toHaveTag("a");
        expect(el[0]).toBe(node);
    });

    it("supports document objects", function() {
        var el = DOM.$(document);

        expect(el).toBe(DOM);
        expect(el[0]).toBe(document);
    });

    it("should not accept non-elements", function() {
        var node = document.createTextNode("text"),
            el = DOM.$(node);

        expect(el[0]).not.toBe(node);
    });

    it("sets property length", function() {
        expect(DOM.mock().length).toBeUndefined();
        expect(DOM.create("<a>").length).toBeUndefined();
        expect(DOM.createAll("<b></b><b></b>").length).toBe(2);
    });
});
