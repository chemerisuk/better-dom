describe("on", function() {
    "use strict";

    var link, input, form, spy;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' href='#test'>test element<i></i></a><form id='form'><input id='input' required='required'/></form>");

        link = DOM.find("#test");
        input = DOM.find("#input");
        form = DOM.find("#form");

        spy = jasmine.createSpy("callback");
    });

    it("should return reference to 'this'", function() {
        expect(input.on("click", spy)).toEqual(input);
    });

    it("should accept single callback with the element as 'this' by default", function() {
        input.on("focus", spy).fire("focus");

        spy.and.callFake(function() {
            expect(this).toEqual(input);
        });

        expect(spy).toHaveBeenCalled();
    });

    it("should accept optional event filter", function() {
        DOM.once("focus input", spy);

        link.fire("focus");
        expect(spy).not.toHaveBeenCalled();

        input.fire("focus");
        expect(spy).toHaveBeenCalled();
    });

    it("should fix currentTarget when selector exists", function() {
        spy.and.callFake(function(target, currentTarget) {
            expect(currentTarget).toHaveTag("a");

            return false;
        });

        DOM.once("click a", spy);
        link.find("i").fire("click");
        expect(spy).toHaveBeenCalled();
    });

    it("should accept array or key-value object", function() {
        var otherSpy = jasmine.createSpy("otherSpy"),
            arraySpy = jasmine.createSpy("arraySpy");

        input.on({focus: spy, click: otherSpy});

        input.fire("focus");
        expect(spy).toHaveBeenCalled();

        input.fire("click");
        expect(otherSpy).toHaveBeenCalled();

        input.on(["focus", "click"], arraySpy);

        input.fire("focus");
        input.fire("click");
        expect(arraySpy.calls.count()).toBe(2);
    });

    it("should prevent default if handler returns false", function() {
        spy.and.returnValue(false);

        link.on("click", spy).fire("click");
        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should allow to pass extra args into callback", function() {
        spy.and.callFake(function(target, currentTarget, relatedTarget) {
            expect(target).toBe(input);
            expect(currentTarget).toBe(input);
            expect(relatedTarget).not.toBeFalsy();
            expect(relatedTarget).toBeEmpty();
        });

        input.on("click", spy, ["target", "currentTarget", "relatedTarget"]).fire("click");
        expect(spy).toHaveBeenCalled();

        spy.and.callFake(function(type, defaultPrevented) {
            expect(type).toBe("focus");
            expect(defaultPrevented).toBe(false);
        });

        input.on("focus", spy, ["type", "defaultPrevented"]).fire("focus");
        expect(spy).toHaveBeenCalled();
    });

    it("should have default event properties", function() {
        spy.and.callFake(function(target, currentTarget, defaultPrevented) {
            expect(target).toBe(input);
            expect(currentTarget).toBe(input);
            expect(defaultPrevented).toBe(false);
        });

        input.on("focus", spy).fire("focus");
        expect(spy).toHaveBeenCalled();

        var detail = {a: 1};

        spy.calls.reset();

        spy.and.callFake(function(detail, target, currentTarget, defaultPrevented) {
            expect(detail).toBe(detail);
            expect(target).toBe(input);
            expect(currentTarget).toBe(input);
            expect(defaultPrevented).toBe(false);
        });

        input.fire("focus", detail);
        expect(spy).toHaveBeenCalled();

        detail = 0;

        input.fire("focus", detail);
        expect(spy).toHaveBeenCalled();
    });

    // FIXME: find a way to test without exception in browser
    // it("should not stop to call handlers if any of them throws an error inside", function() {
    //     window.onerror = function() {
    //         return true; // suppress displaying expected error for this test
    //     };

    //     input.on("click", function() { throw "test"; }).on("click", spy).fire("click");

    //     expect(spy).toHaveBeenCalled();

    //     window.onerror = null; // restore default error handling
    // });

    it("should fix some non-bubbling events", function() {
        DOM.once("focus", spy);
        input.fire("focus");
        expect(spy).toHaveBeenCalled();

        DOM.once("invalid", spy);
        input.fire("invalid");
        expect(spy.calls.count()).toBe(2);
    });

    it("should fix input event", function() {
        input.on("input", spy).fire("input");
        expect(spy).toHaveBeenCalled();

        DOM.on("input a", spy);
        input.fire("input");
        expect(spy.calls.count()).toBe(2);

        DOM.on("input input", spy);
        input.fire("input");
        expect(spy.calls.count()).toBe(4);
    });

    it("should fix submit event", function() {
        spy.and.returnValue(false);

        form.on("submit", spy).fire("submit");
        expect(spy).toHaveBeenCalled();

        DOM.on("submit a", spy);
        form.fire("submit");
        expect(spy.calls.count()).toBe(2);

        DOM.on("submit form", spy);
        form.fire("submit");
        expect(spy.calls.count()).toBe(4);
    });

    it("should fix reset event", function() {
        form.on("reset", spy).fire("reset");
        expect(spy.calls.count()).toBe(1);

        DOM.on("reset", spy);
        form.fire("reset");
        expect(spy.calls.count()).toBe(3);
    });

    it("should support late binding", function() {
        spy.and.callFake(function() { expect(this).toBe(input) });
        input.callback = spy;
        input.on("focus", "callback").fire("focus");
        expect(spy).toHaveBeenCalled();

        delete input.callback;
        input.fire("focus");
        expect(spy.calls.count()).toBe(1);
    });

    it("should allow to prevent custom events", function() {
        var spy2 = jasmine.createSpy("spy2");

        form.on("custom:on", spy, ["defaultPrevented"]);
        input.on("custom:on", spy2.and.returnValue(false));

        spy.and.callFake(function(defaultPrevented) {
            expect(defaultPrevented).toBe(true);
        });

        input.fire("custom:on");
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it("should handle global DOM as target", function() {
        var spy = jasmine.createSpy("callback");

        DOM.once("custom:event1", spy);
        DOM.fire("custom:event1");

        expect(spy).toHaveBeenCalledWith(DOM, DOM, false);

        spy.calls.reset();
        DOM.once("custom:event2 ul > li", spy);
        DOM.fire("custom:event2");
        expect(spy).not.toHaveBeenCalled();
    });

    it("should fix bubbling and triggering of the change event for IE8", function() {
        DOM.on("change", spy);

        input.set("123").fire("change");
        expect(spy).toHaveBeenCalled();

        input = DOM.create("input[type=checkbox]");
        jasmine.sandbox.set(input);

        spy.calls.reset();
        input.fire("focus");
        input.fire("click");
        expect(spy).toHaveBeenCalled();

        spy.calls.reset();
        input.fire("click");
        expect(spy).toHaveBeenCalled();

        input = DOM.create("input[type=radio]");
        jasmine.sandbox.set(input);

        spy.calls.reset();
        input.fire("focus");
        input.fire("click");
        expect(spy).toHaveBeenCalled();

        spy.calls.reset();
        input.fire("click");
        expect(spy).not.toHaveBeenCalled();
    });

    it("should debounce some events", function(done) {
        var spy = jasmine.createSpy("callback");

        form.on("mousemove", spy);
        form.fire("mousemove");
        form.fire("mousemove");
        form.fire("mousemove");

        setTimeout(function() {
            expect(spy.calls.count()).toBe(1);

            done();
        }, 50);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

    describe("once", function() {
        it("should trigger callback only one time", function() {
            spy.and.callFake(function() {
                expect(this).toBe(input);
            });

            input.once("focus", spy).fire("focus");
            expect(spy).toHaveBeenCalled();

            input.fire("focus");
            expect(spy.calls.count()).toBe(1);
        });

        it("should work for with late binding", function() {
            spy.and.callFake(function() { expect(this).toBe(input) });
            input.callback = spy;
            input.once("focus", "callback").fire("focus");
            expect(spy).toHaveBeenCalled();
        });
    });
});