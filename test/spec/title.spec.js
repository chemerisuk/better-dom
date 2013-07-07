describe("DOM.title", function() {
    "use strict";

    it("should read/write current page title", function() {
        expect(DOM.getTitle()).toBe(document.title);

        expect(DOM.setTitle("abc")).toBe(DOM);
        expect(document.title).toBe("abc");
    });

    it("should throw error if title is not a string", function() {
        expect(function() { DOM.setTitle(); }).toThrow();
        expect(function() { DOM.setTitle(123); }).toThrow();
        expect(function() { DOM.setTitle(function() {}); }).toThrow();
    });
});
