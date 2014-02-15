describe("DOM.importScripts", function() {
    "use strict";

    var context = document.scripts[0].parentNode,
        bodySpy;

    beforeEach(function() {
        bodySpy = spyOn(context, "insertBefore");
    });

    it("should append script element to body", function() {
        var spy = jasmine.createSpy("callback");

        bodySpy.and.callFake(function(el) {
            expect(el.tagName.toLowerCase()).toBe("script");
            expect(el.src).toBe("http://test/url");
            expect(typeof el.onload).toBe("function");
            // trigger fake onload
            el.onload();
        });

        DOM.importScripts("http://test/url", spy);
        expect(bodySpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it("should append scripts one by one", function() {
        var spy = jasmine.createSpy("callback"),
            index = 1;

        bodySpy.and.callFake(function(el) {
            expect(el.tagName.toLowerCase()).toBe("script");
            expect(el.src).toBe("http://test/" + index++);
            expect(typeof el.onload).toBe("function");
            // trigger fake onload
            el.onload();
        });

        DOM.importScripts("http://test/1", "http://test/2", "http://test/3", "http://test/4", spy);
        expect(bodySpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it("should accept just strings", function() {
        bodySpy.and.callFake(function(el) {
            // trigger fake onload
            el.onload();
        });

        DOM.importScripts("test");
        expect(bodySpy).toHaveBeenCalled();

        DOM.importScripts("test1", "test2", "test3");
        expect(bodySpy.calls.count()).toBe(4);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importScripts(1) } ).toThrow();
    });
});