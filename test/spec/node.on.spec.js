describe("on", function() {
    "use strict";

    var link, input, form, spy;

    beforeEach(function() {
        setFixtures("<a id='test' href='#test'>test element<i></i></a><form id='form'><input id='input' required='required'/></form>");

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

        spy.andCallFake(function() {
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

    it("should fix target in case of event filter", function() {
        spy.andCallFake(function(target) {
            expect(target._node).toHaveTag("a");

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
        expect(arraySpy.callCount).toBe(2);
    });

    it("should prevent default if handler returns false", function() {
        spy.andReturn(false);

        link.on("click", spy).fire("click");
        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should allow to pass extra args into callback", function() {
        spy.andCallFake(function(target, currentTarget, relatedTarget) {
            expect(target).toBe(input);
            expect(currentTarget).toBe(input);
            expect(relatedTarget._node).toBeUndefined();
        });

        input.on("click", spy, ["target", "currentTarget", "relatedTarget"]).fire("click");
        expect(spy).toHaveBeenCalled();

        spy.andCallFake(function(type, defaultPrevented) {
            expect(type).toBe("focus");
            expect(defaultPrevented).toBe(false);
        });

        input.on("focus", spy, ["type", "defaultPrevented"]).fire("focus");
        expect(spy).toHaveBeenCalled();
    });

    it("should have default event properties", function() {
        spy.andCallFake(function(target, defaultPrevented) {
            expect(target).toBe(input);
            expect(defaultPrevented).toBe(false);
        });

        input.on("focus", spy).fire("focus");
        expect(spy).toHaveBeenCalled();

        var detail = {a: 1};

        spy.reset();

        spy.andCallFake(function(detail, target, defaultPrevented) {
            expect(detail).toBe(detail);
            expect(target).toBe(input);
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
        DOM.on("focus", spy);
        input.fire("focus");
        expect(spy).toHaveBeenCalled();

        if (input.get("validity")) {
            DOM.on("invalid", spy);
            input._node.checkValidity();
            expect(spy.callCount).toBe(2);
        }
    });

    it("should fix input event", function() {
        input.on("input", spy).fire("input");
        expect(spy).toHaveBeenCalled();

        DOM.on("input a", spy);
        input.fire("input");
        expect(spy.callCount).toBe(2);

        DOM.on("input input", spy);
        input.fire("input");
        expect(spy.callCount).toBe(4);
    });

    it("should fix submit event", function() {
        spy.andReturn(false);

        form.on("submit", spy).fire("submit");
        expect(spy).toHaveBeenCalled();

        DOM.on("submit a", spy);
        form.fire("submit");
        expect(spy.callCount).toBe(2);

        DOM.on("submit form", spy);
        form.fire("submit");
        expect(spy.callCount).toBe(4);
    });

    it("should not prevent default action if callback returns false", function() {
        spy.andReturn(false);

        input.on("click", spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should optionally support extra context", function() {
        var obj = {callback: function() {}};

        spy.andCallFake(function() { expect(this).toBe(obj) });

        input.on("click", obj, spy).fire("click");
        expect(spy).toHaveBeenCalled();
    });

    it("should support late binding", function() {
        var obj = {callback: spy};

        spy.andCallFake(function() { expect(this).toBe(input) });
        input.callback = spy;
        input.on("focus", "callback").fire("focus");
        expect(spy).toHaveBeenCalled();

        delete input.callback;
        input.fire("focus");
        expect(spy.callCount).toBe(1);


        spy.reset();
        spy.andCallFake(function() { expect(this).toBe(obj) });
        input.on("click", obj, "callback").fire("click");
        expect(spy).toHaveBeenCalled();

        delete obj.callback;
        input.fire("focus");
        expect(spy.callCount).toBe(1);
    });

    it("should allow to prevent custom events", function() {
        var spy2 = jasmine.createSpy("spy2");

        form.on("custom:on", spy, ["defaultPrevented"]);
        input.on("custom:on", spy2.andReturn(false));

        spy.andCallFake(function(defaultPrevented) {
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

        expect(spy).toHaveBeenCalledWith(DOM, false);

        spy.reset();
        DOM.once("custom:event2 ul > li", spy);
        DOM.fire("custom:event2");
        expect(spy).not.toHaveBeenCalled();
    });

    // it("should debounce some events", function() {
    //     var spy = jasmine.createSpy("callback");

    //     form.on("scroll", spy);
    //     form.fire("scroll");
    //     form.fire("scroll");
    //     form.fire("scroll");

    //     expect(spy).toHaveBeenCalledWith(form, false);
    //     expect(spy.callCount).toBe(1);
    // });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

    describe("once", function() {
        it("should trigger callback only one time", function() {
            spy.andCallFake(function() {
                expect(this).toBe(input);
            });

            input.once("focus", spy).fire("focus");
            expect(spy).toHaveBeenCalled();

            input.fire("focus");
            expect(spy.callCount).toBe(1);
        });
    });
});