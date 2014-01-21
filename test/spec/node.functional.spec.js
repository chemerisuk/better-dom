describe("legacy", function() {
    "use strict";

    it("should pass native element into callback", function() {
        var spy = jasmine.createSpy("legacy"),
            htmlEl = DOM.find("html");

        htmlEl.legacy(spy);
        expect(spy).toHaveBeenCalledWith(document.documentElement, htmlEl, 0);
    });

    it("should work for collections", function() {
        var spy = jasmine.createSpy("legacy"),
            scripts = DOM.findAll("script");

        spy.andCallFake(function(node, el, index) {
            expect(this).toBe(scripts);
            expect(el).toBe(scripts[index]);

            scripts[index].legacy(function(n) {
                expect(node).toBe(n);
            });
        });

        scripts.legacy(spy);
        expect(spy.callCount).toBe(scripts.length);
    });
});