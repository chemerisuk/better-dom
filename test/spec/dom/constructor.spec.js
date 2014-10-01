describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element object", function() {
        var node = document.createElement("a"),
            el = DOM.constructor(node);

        expect(el).toHaveTag("a");
        expect(el._).toBeDefined();
        expect(el[0]).toBe(node);
    });

    it("should not accept non-elements", function() {
        var node = document.createTextNode("text"),
            el = DOM.constructor(node);

        expect(el[0]).not.toBe(node);

        el = DOM.constructor(document);

        expect(el[0]).not.toBe(document);
    });
});
