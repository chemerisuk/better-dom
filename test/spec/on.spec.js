describe("on", function() {
    "use strict";
    
    var link, input, form, spy;

    beforeEach(function() {
        setFixtures("<a id='test'>test element</a><form id='form'><input id='input' required='required'/></form>");

        link = DOM.find("#test");
        input = DOM.find("#input");
        form = DOM.find("#form");

        spy = jasmine.createSpy("callback");
    });

    it("should return reference to 'this'", function() {
        expect(input.on("click", spy)).toEqual(input);
    });

    it("should accept single callback", function() {
        link.on("click", spy).fire("click");

        expect(spy).toHaveBeenCalled();
    });

    it("should accept optional event filter", function() {
        DOM.on("click", "input", spy);

        link.fire("click");

        expect(spy).not.toHaveBeenCalled();

        input.fire("click");

        expect(spy).toHaveBeenCalled();
    });

    it("should accept space-separated event names", function() {
        input.on("focus click", spy).fire("focus");

        expect(spy).toHaveBeenCalled();

        input.fire("click");

        expect(spy.callCount).toEqual(2);
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

    it("should not stop to call handlers if any of them throws an error inside", function() {
        var otherSpy = jasmine.createSpy("callback2");

        spy.andCallFake(function() { throw "test"; });

        window.onerror = function() {
            return true; // suppress displaying expected error for this test
        };

        input.on("click", spy).on("click", otherSpy).fire("click");

        expect(otherSpy).toHaveBeenCalled();

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

        DOM.on("input", "a", spy);

        input.fire("input");

        expect(spy.callCount).toBe(2);

        DOM.on("input", "input", spy);

        input.fire("input");

        expect(spy.callCount).toBe(4);
    });

    it("should fix submit event", function() {
        spy.andCallFake(function(e) {
            e.preventDefault();
        });

        form.on("submit", spy).fire("submit");

        expect(spy).toHaveBeenCalled();


        DOM.on("submit", "a", spy);

        form.fire("submit");

        expect(spy.callCount).toBe(2);


        DOM.on("submit", "form", spy);

        form.fire("submit");

        expect(spy.callCount).toBe(4);
    });

    it("should not prevent default action if callback returns false", function() {

    });

    it("should optionally support extra handler arguments", function() {
        var obj = {};

        spy.andCallFake(function(e, arg) {
            expect(arg).toBe(obj);
        });

        input.on("click", spy, [obj]).fire("click");
    });

    it("should optionally support extra context", function() {
        var obj = {};

        spy.andCallFake(function() {
            expect(this).toBe(obj);
        });

        input.on("click", spy, [], obj).fire("click");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

});