describe("data", function() {
    "use strict";
    
    var input;

    beforeEach(function() {
        setFixtures("<input id='test' data-test='x'/>");

        input = DOM.find("#test");
    });

    it("should store any kind of object", function() {
        var obj = {}, nmb = 123, func = function() {};

        expect(input.setData("obj", obj).getData("obj")).toEqual(obj);
        expect(input.setData("nmb", nmb).getData("nmb")).toEqual(nmb);
        expect(input.setData("func", func).getData("func")).toEqual(func);
    });

    it("should read an appropriate data-* attribute if it exists", function() {
        expect(input.getData("test")).toEqual("x");
    });

    it("should return reference to 'this' when called with 2 arguments", function() {
        expect(input.setData("test", 123)).toEqual(input);
    });

    it("should throw error if arguments a invalid", function() {
        expect(function() { input.getData(123); }).toThrow();
    });

});