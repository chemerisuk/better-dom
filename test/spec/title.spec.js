describe("DOM.title", function() {
    "use strict";

    it("should read/write current page title", function() {
        expect(DOM.getTitle()).toBe(document.title);

        expect(DOM.setTitle("abc")).toBe(DOM);
        expect(document.title).toBe("abc");
    });
});
