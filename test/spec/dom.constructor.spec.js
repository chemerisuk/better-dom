describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element objects", function() {
        var el = DOM.constructor(document.createElement("a"));

        expect(el).toHaveTag("a");
        expect(el._).toBeDefined();
        expect(el[0]).toBe(el);
    });
});
