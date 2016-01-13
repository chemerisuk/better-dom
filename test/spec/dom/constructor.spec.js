describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element object", function() {
        var node = document.createElement("a"),
            el = DOM.constructor(node);

        expect(el).toHaveTag("a");
        expect(el._).toBeDefined();
        expect(el[0]).toBe(node);
    });

    it("supports document objects", function() {
        var el = DOM.constructor(document);

        expect(el[0]).toBe(document);
        expect(el).toBe(DOM);
    });

    it("should not accept non-elements", function() {
        var node = document.createTextNode("text"),
            el = DOM.constructor(node);

        expect(el[0]).not.toBe(node);
    });

    it("sets property length", function() {
        expect(DOM.mock().length).toBe(0);
        expect(DOM.create("<a>").length).toBe(1);
        expect(DOM.createAll("<b></b><b></b>").length).toBe(2);
    });
});
