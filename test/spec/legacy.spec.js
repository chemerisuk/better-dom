describe("legacy", function() {
    "use strict";

    it("should pass native element into callback", function() {
        var spy = jasmine.createSpy("legacy"),
            htmlEl = DOM.find("html"),
            links = DOM.findAll("a");

        htmlEl.legacy(spy);
        expect(spy).toHaveBeenCalledWith(document.documentElement, htmlEl, 0);

        spy.andCallFake(function(node, index) {
            expect(this).toBe(links);
            expect(node).toBe(document.links[index]);
        });

        DOM.findAll("a").legacy(spy);
        expect(spy).toHaveBeenCalled();
    });
});