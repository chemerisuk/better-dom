describe("off", function() {
    "use strict";

    var input, link, obj = {test: function() { }, test2: function() {}}, spy;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='link'><input id='input'></a>");

        input = DOM.find("#input");
        link = DOM.find("#link");

        spy = jasmine.createSpy("click");
    });

    it("should remove event callback", function() {
        input.on("click", spy).off("click", null).fire("click");
        expect(spy).not.toHaveBeenCalled();

        input.on("click", spy).off("click", spy).fire("click");
        expect(spy).not.toHaveBeenCalled();

        input.on("click", "a", spy).off("click", "a", spy).fire("click");
        expect(spy).not.toHaveBeenCalled();
    });

    it("supports selector argument", function() {
        link.on("click", spy).on("click", "input", spy);
        input.fire("click");
        expect(spy.calls.count()).toBe(2);

        link.off("click", "input", spy);
        input.fire("click");
        expect(spy.calls.count()).toBe(3);
    });

    // it("should remove event callback with context", function() {
    //     var obj = {callback: function() {}};

    //     spy = spyOn(obj, "callback");

    //     input.on("click", obj, "callback").off("click").fire("click");
    //     expect(spy).not.toHaveBeenCalled();

    //     input.on("click", obj, "callback").off("click", obj, "callback").fire("click");
    //     expect(spy).not.toHaveBeenCalled();

    //     input.on("click a", obj, "callback").off("click a", obj, "callback").fire("click");
    //     expect(spy).not.toHaveBeenCalled();
    // });

    it("should remove all event handlers if called without the second argument", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        link.on("click", obj.test).on("click", obj.test2).off("click");
        input.fire("click");

        expect(obj.test).not.toHaveBeenCalled();
        expect(obj.test2).not.toHaveBeenCalled();
    });

    it("should return reference to 'this'", function() {
        expect(input.off("click")).toEqual(input);

        var empty = DOM.mock();
        expect(empty.off("click")).toBe(empty);
    });

    it("should throw error if agruments are invalid", function() {
        expect(function() { link.off(123); }).toThrow();
    });

});