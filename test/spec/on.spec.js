describe("on", function() {
    "use strict";
    
    var link, input, form, spy;

    beforeEach(function() {
        setFixtures("<a id='test' href='#test'>test element</a><form id='form'><input id='input' required='required'/></form>");

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
        DOM.on("focus input", spy);

        link.fire("focus");
        expect(spy).not.toHaveBeenCalled();

        input.fire("focus");
        expect(spy).toHaveBeenCalled();
    });

    it("should accept event object", function() {
        var otherSpy = jasmine.createSpy("callback2");

        input.on({focus: spy, click: otherSpy}).fire("focus");
        expect(spy).toHaveBeenCalled();

        input.fire("click");
        expect(otherSpy).toHaveBeenCalled();
    });

    it("should prevent default if handler returns false", function() {
        spy.andReturn(false);

        link.on("click", spy).fire("click");
        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should support optional extra arguments", function() {
        var a = {}, b = {}, obj = {callback: function() {}};

        spy.andCallFake(function(target, argA, argB) {
            expect(target).toBe(input);
            expect(argA).toBe(a);
            expect(argB).toBe(b);
        });

        input.on("click(target)", spy, [a, b]).fire("click");
        expect(spy).toHaveBeenCalled();

        spy = spyOn(obj, "callback");
        spy.andCallFake(function(argA, argB, argC) {
            expect(argA).toBe(1);
            expect(argB).toBe(2);
            expect(argC).toBe(3);
        });

        input.on("click", spy, [1, 2, 3]).fire("click");
        expect(spy).toHaveBeenCalled();

        spy.andCallFake(function(type) {
            expect(type).toBe("focus");
        });

        input.on("focus(type)", spy).fire("focus");
        expect(spy).toHaveBeenCalled();
    });

    it("should not stop to call handlers if any of them throws an error inside", function() {
        window.onerror = function() {
            return true; // suppress displaying expected error for this test
        };

        input.on("click", function() { throw "test"; }).on("click", spy).fire("click");

        expect(spy).toHaveBeenCalled();

        window.onerror = null; // restore default error handling
    });

    it("should fix some non-bubbling events", function() {
        DOM.on("focus", spy);

        input.fire("focus");

        expect(spy).toHaveBeenCalled();

        DOM.on("invalid", spy);

        if (input._node.checkValidity) {
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

        spy = spyOn(obj, "callback");
        spy.andCallFake(function() {
            expect(this).toBe(obj);
        });

        input.on("click", obj, "callback").fire("click");
        expect(spy).toHaveBeenCalled();

        obj.callback = null;
        expect(function() { input.on("click", obj, "callback").fire("click"); }).not.toThrow();
    });

    it("should support late binding", function() {
        var obj = {callback: spy},
            spy2 = jasmine.createSpy("spy2");

        input.on("click", obj, "callback").fire("click");
        expect(spy).toHaveBeenCalled();

        obj.callback = spy2;

        input.fire("click");
        expect(spy2).toHaveBeenCalled();
        expect(spy.callCount).toBe(1);
    });

    it("should allow to prevent custom events", function() {
        var spy2 = jasmine.createSpy("spy2");

        form.on("custom:on(defaultPrevented)", spy);
        input.on("custom:on", spy2.andReturn(false));

        spy.andCallFake(function(defaultPrevented) {
            expect(defaultPrevented).toBe(true);
        });

        input.fire("custom:on");
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

});