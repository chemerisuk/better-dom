describe("ready", function(){
    "use strict";

    var done1, done2, index = 0;

    DOM.ready(function() { done1 = ++index });
    DOM.ready(function() { done2 = ++index });
    // FIXME: find a way to test without exception in browser
    // it("should trigger callbacks if DOM is ready", function(){
    //     var spy1 = jasmine.createSpy("callback1"),
    //         spy2 = jasmine.createSpy("callback2");

    //     spy1.andThrow("ready");

    //     DOM.ready(spy1);
    //     DOM.ready(spy2);

    //     waits(50);

    //     runs(function() {
    //         expect(spy1.callCount).toBe(1);
    //         expect(spy2.callCount).toBe(1);
    //     });
    // });

    it("should execute callbacks when DOM is ready", function() {
        expect(done1).toBeTruthy();
        expect(done2).toBeTruthy();
        expect(done1 < done2).toBeTruthy();
    });

    it("should call callback asynchronously after DOMContentLoaded", function() {
        var spy = jasmine.createSpy("callback");

        DOM.ready(spy);

        expect(spy).not.toHaveBeenCalled();

        waitsFor(function() {
            return spy.callCount === 1;
        });
    });

    it("should throw error if arguments are invalid", function(){
        expect(function() { DOM.ready(1); }).toThrow();
    });

});
