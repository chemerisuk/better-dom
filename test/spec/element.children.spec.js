describe("children", function() {
    "use strict";

    beforeEach(function() {

    });

    it("should allow to filter children by selector", function() {
        var list = DOM.create("ul>li*3");

        expect(list.children().length).toBe(3);
        expect(list.children("a").length).toBe(0);
        expect(list.children("li").length).toBe(3);
    });
});
