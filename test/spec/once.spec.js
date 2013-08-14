describe("once", function() {
    "use strict";
    
    var link, input, form, spy;

    beforeEach(function() {
        setFixtures("<a id='once_test' href='#once_test'>test element</a><form id='once_form'><input id='once_input' required='required'/></form>");

        link = DOM.find("#once_test");
        input = DOM.find("#once_input");
        form = DOM.find("#once_form");

        spy = jasmine.createSpy("callback");
    });

    it("should return reference to 'this'", function() {
        expect(input.once("click", spy)).toEqual(input);
    });

    it("should accept single callback with the element as 'this' by default", function() {
        input.once("focus", spy).fire("focus");

        spy.andCallFake(function() {
            expect(this).toEqual(input);
        });

        expect(spy).toHaveBeenCalled();

        input.fire("focus");
        expect(spy.callCount).toBe(1);
    });

    it("should prevent default if handler returns false", function() {
        spy.andReturn(false);

        link.once("click", spy).fire("click");
        expect(spy).toHaveBeenCalled();
        expect(location.hash).not.toBe("#once_test");

        link.fire("click");
        expect(spy.callCount).toBe(1);
    });

    it("should allow to pass event propertient into callback", function() {
        spy.andCallFake(function(target, currentTarget, relatedTarget) {
            expect(target).toBe(input);
            expect(currentTarget).toBe(input);
            expect(relatedTarget._node).toBeUndefined();
        });

        input.once("click", ["target", "currentTarget", "relatedTarget"], spy).fire("click");
        expect(spy).toHaveBeenCalled();

        spy.andCallFake(function(type, defaultPrevented) {
            expect(type).toBe("focus");
            expect(defaultPrevented).toBe(false);
        });

        input.fire("click");
        expect(spy.callCount).toBe(1);

        input.once("focus", ["type", "defaultPrevented"], spy).fire("focus");
        expect(spy).toHaveBeenCalled();

        input.fire("focus");
        expect(spy.callCount).toBe(2);
    });

    // it("should accept optional event filter", function() {
    //     DOM.once("focus input", spy);

    //     link.fire("focus");
    //     expect(spy).not.toHaveBeenCalled();

    //     input.fire("focus");
    //     expect(spy).toHaveBeenCalled();

    //     input.fire("focus");
    //     expect(spy.callCount).toBe(1);
    // });
});
