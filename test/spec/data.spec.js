describe("data", function() {
    "use strict";

    var input;

    beforeEach(function() {
        setFixtures("<input id='test' data-test='x'/>");

        input = DOM.find("#test");
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
        expect(input.data("test")).toEqual("x");
    });

    it("should return reference to 'this' when called with 2 arguments", function() {
        expect(input.data("test", 123)).toEqual(input);
    });

    it("should throw error if arguments a invalid", function() {
        expect(function() { input.data(123); }).toThrow();
        expect(function() { input.data(123); }).toThrow();
    });

});