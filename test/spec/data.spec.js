describe("data", function() {
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

    it("should read an appropriate data-* attribute if it exists", function() {
        expect(input.data("test")).toEqual("x");
    });

    it("should return reference to 'this' when called with 2 arguments", function() {
        expect(input.data("test", 123)).toEqual(input);
    });

    it("should throw error if arguments a invalid", function() {
        expect(function() { link.data(123); }).toThrow();
    });

});