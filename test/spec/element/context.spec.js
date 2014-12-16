describe("context", function() {
    "use strict";

    var link;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='context_test'></a>");

        link = DOM.find("#context_test");
    });

    it("executes callback async", function(done) {
        var spy = jasmine.createSpy("callback");

        spy.and.callFake(function() {
            link.context("test", spy.and.callFake(done));
            expect(spy.calls.count()).toBe(1);
        });

        link.context("test", spy);
        expect(spy).not.toHaveBeenCalled();
    });
});
