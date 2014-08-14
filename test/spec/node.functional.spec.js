describe("each", function() {
    "use strict";

    it("should pass native element into callback", function() {
        var spy = jasmine.createSpy("each");

        DOM.each(spy);
        expect(spy).toHaveBeenCalledWith(DOM, document.documentElement);
    });

    it("should accept optional context", function() {
        var spy = jasmine.createSpy("each"),
            context = {};

        spy.and.callFake(function() {
            expect(this).toBe(context);
        });

        DOM.each(spy, context);
        expect(spy).toHaveBeenCalled();
    });

    // it("should work for collections", function() {
    //     var spy = jasmine.createSpy("legacy"),
    //         scripts = DOM.findAll("script");

    //     spy.and.callFake(function(node, el, index, self) {
    //         expect(self).toBe(scripts);
    //         expect(el).toBe(scripts[index]);
    //         scripts[index].legacy(function(n) { expect(node).toBe(n) });
    //     });

    //     scripts.legacy(spy);
    //     expect(spy.calls.count()).toBe(scripts.length);
    // });
});