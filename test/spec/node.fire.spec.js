describe("fire", function() {
    "use strict";

    var input, callback;

    beforeEach(function() {
        jasmine.sandbox.set("<input id='input'/>");

        input = DOM.find("#input");

        callback = jasmine.createSpy("callback");
    });

    it("should trigger event handler", function() {
        var events = ["click", "focus", "blur", "change"], i;

        for (i = 0; i < 3; ++i) {
            input.on(events[i], callback).fire(events[i]);

            expect(callback.callCount).toBe(i + 1);
        }
    });

    it("should trigger native handlers", function() {
        input.legacy(function(node) {
            node.onclick = callback.andReturn(false);
        });

        input.fire("click");

        expect(callback).toHaveBeenCalled();
    });

    it("should trigger native methods if they exist", function() {
        input.fire("focus");

        expect(input.matches(":focus")).toBe(true);

        input.legacy(function(node) {
            expect(node).toBe(document.activeElement);
        });
    });

    it("should trigger custom events", function() {
        input.on("my:click", callback).fire("my:click");

        expect(callback).toHaveBeenCalled();
    });

    it("should prepend extra arguments if they exist", function() {
        var data1 = {x: 1, y: 2}, data2 = function() {};

        input.on("my:click", callback);
        input.fire("my:click", data1);
        expect(callback).toHaveBeenCalledWith(data1, input, input, false);

        input.on("click", callback);
        input.fire("click", data1, data2);
        expect(callback).toHaveBeenCalledWith(data1, data2, input, input, false);
    });

    it("should return false if default action was prevented", function() {
        expect(input.fire("focus")).toBe(true);

        input.on("focus", function() { return false });

        expect(input.fire("focus")).toBe(false);
    });

    it("should support a function to make a safe sync call", function() {
        var obj = {};

        input.fire(callback, 123, obj);
        expect(callback).toHaveBeenCalledWith(input, 0, input);

        DOM.fire(callback, obj, 321);
        expect(callback).toHaveBeenCalledWith(DOM, 0, DOM);
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.fire(1); }).toThrow();
    });

});