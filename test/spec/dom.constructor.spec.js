describe("DOM.constructor", function() {
    "use strict";

    it("should return $Element objects", function() {
        var node = document.createElement("a"),
            el = DOM.constructor(node)[0];

        expect(el).toHaveTag("a");
        expect(el._).toBeDefined();
        expect(el[0]).toBe(node);
    });
});
