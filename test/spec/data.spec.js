describe("data", function() {
    "use strict";

    var input;

    beforeEach(function() {
        input = DOM.mock("input[data-a1=x data-a2=n1=v1;n2=1 data-a3=1=2=3]");
    });

    it("should store any kind of object", function() {
        var obj = {}, nmb = 123, func = function() {};

        expect(input.data("obj", obj).data("obj")).toEqual(obj);
        expect(input.data("nmb", nmb).data("nmb")).toEqual(nmb);
        expect(input.data("func", func).data("func")).toEqual(func);
    });

    it("should accept object argument", function() {
        var param = {a: "b", c: 1};

        input.data(param);

        expect(input.data("a")).toBe("b");
        expect(input.data("c")).toBe(1);
    });

    it("should read an appropriate data-* attribute if it exists", function() {
        expect(input.data("a1")).toEqual("x");
        expect(input.data("a2")).toEqual({ n1: "v1", n2: "1" });
        expect(input.data("a3")).toBe("1=2=3");
    });

    it("should return reference to 'this' when called with 2 arguments", function() {
        expect(input.data("a1", 123)).toEqual(input);
    });

    it("should work for DOM as well", function() {
        expect(DOM.data("a1")).toBeUndefined();
        expect(DOM.data("a1", "test")).toBe(DOM);
        expect(DOM.data("a1")).toBe("test");
    });

    it("should throw error if arguments a invalid", function() {
        expect(function() { input.data(123); }).toThrow();
        expect(function() { input.data(); }).toThrow();
        expect(function() { input.data("y", "u", "345"); }).toThrow();
    });

});