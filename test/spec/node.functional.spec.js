describe("legacy", function() {
    "use strict";

    it("should pass native element into callback", function() {
        var spy = jasmine.createSpy("legacy"),
            htmlEl = DOM.find("html");

        htmlEl.legacy(spy);
        expect(spy).toHaveBeenCalledWith(document.documentElement, htmlEl, 0, htmlEl);
    });

    it("should work for collections", function() {
        var spy = jasmine.createSpy("legacy"),
            scripts = DOM.findAll("script");

        spy.and.callFake(function(node, el, index, self) {
            expect(self).toBe(scripts);
            expect(el).toBe(scripts[index]);
            scripts[index].legacy(function(n) { expect(node).toBe(n) });
        });

        scripts.legacy(spy);
        expect(spy.calls.count()).toBe(scripts.length);
    });
});