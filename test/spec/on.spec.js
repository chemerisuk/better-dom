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

    it("should accept single callback", function() {
        input.on("focus", spy).fire("focus");

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

    it("should have target element as 'this' by default", function() {
        spy.andCallFake(function() {
            expect(this).toEqual(input);
        });

        input.on("click", spy).fire("click");
    });

    it("should call preventDefault if options have cancel:true", function() {
        input.on("click", {cancel: true}, spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should call stopPropagation if options have stop:true", function() {
        var callback = jasmine.createSpy("callback");

        DOM.on("click", callback);
        input.on("click", {stop: true}, spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
    });

    it("should call preventDefault and stopPropagation if options have cancel:true and stop:true", function() {
        var callback = jasmine.createSpy("callback");

        DOM.on("click", callback);
        input.on("click", {cancel: true, stop: true}, spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should pass optional event arguments", function() {
        spy.andCallFake(function(type) {
            expect(type).toBe("click");
        });

        input
            .on("click", {args: ["type"]}, spy)
            .on("click", ["type"], spy)
            .fire("click");

        expect(spy.callCount).toBe(2);
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
        form.on("submit", {cancel: true}, spy).fire("submit");

        expect(spy).toHaveBeenCalled();

        DOM.on("submit a", {cancel: true}, spy);

        form.fire("submit");

        expect(spy.callCount).toBe(2);

        DOM.on("submit form", {cancel: true}, spy);

        form.fire("submit");

        expect(spy.callCount).toBe(4);
    });

    it("should not prevent default action if callback returns false", function() {
        spy.andReturn(false);

        input.on("click", spy).fire("click");

        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#test");
    });

    it("should optionally support extra handler arguments", function() {
        var a = {}, b = {};

        spy.andCallFake(function(arg) {
            expect(arg).toBe(a, b);
        });

        input.on("click", spy, [a, b]).fire("click");

        expect(spy).toHaveBeenCalled();
    });

    it("should optionally support extra context", function() {
        var obj = {};

        spy.andCallFake(function() {
            expect(this).toBe(obj);
        });

        input.on("click", spy, [], obj).fire("click");

        expect(spy).toHaveBeenCalled();
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

});