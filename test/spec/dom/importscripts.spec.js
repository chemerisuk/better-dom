describe("DOM.importScripts", function() {
    "use strict";

    // var head = document.getElementsByTagName("head")[0],
    //     headSpy;

    // beforeEach(function() {
    //     headSpy = spyOn(head, "appendChild");
    // });

    // it("should append script element to body", function() {
    //     var spy = jasmine.createSpy("callback");

    //     headSpy.and.callFake(function(el) {
    //         expect(el.tagName.toLowerCase()).toBe("script");
    //         expect(el.src).toBe("http://test/url");
    //         expect(typeof el.onload).toBe("function");
    //         // trigger fake onload
    //         el.onload();
    //     });

    //     DOM.importScripts("http://test/url", spy);
    //     expect(headSpy).toHaveBeenCalled();
    //     expect(spy).toHaveBeenCalled();
    // });

    // it("should append scripts one by one", function() {
    //     var spy = jasmine.createSpy("callback"),
    //         index = 1;

    //     headSpy.and.callFake(function(el) {
    //         expect(el.tagName.toLowerCase()).toBe("script");
    //         expect(el.src).toBe("http://test/" + index++);
    //         expect(typeof el.onload).toBe("function");
    //         // trigger fake onload
    //         el.onload();
    //     });

    //     DOM.importScripts("http://test/1", "http://test/2", "http://test/3", "http://test/4", spy);
    //     expect(headSpy).toHaveBeenCalled();
    //     expect(spy).toHaveBeenCalled();
    // });

    // it("should accept just strings", function() {
    //     headSpy.and.callFake(function(el) {
    //         // trigger fake onload
    //         el.onload();
    //     });

    //     DOM.importScripts("http://test");
    //     expect(headSpy).toHaveBeenCalled();

    //     DOM.importScripts("http://test1", "http://test2", "http://test3");
    //     expect(headSpy.calls.count()).toBe(4);
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importScripts(1) } ).toThrow();
    });
});