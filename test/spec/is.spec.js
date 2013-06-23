describe("is", function() {
    "use strict";
    
    var link, input;

    beforeEach(function() {
        setFixtures("<a id='is1' href='#matches' class='test1'></a><input type='checkbox' id='is2' required checked>");

        link = DOM.find("#is1");
        input = DOM.find("#is2");
    });

    it("should match element by a simple selector", function() {
        expect(link.is("a")).toBe(true);
        expect(link.is("[href]")).toBe(true);
        expect(link.is(".test1")).toBe(true);
        expect(link.is("a.test1")).toBe(true);
        expect(link.is("a[href]")).toBe(true);
        expect(link.is("a#is1")).toBe(true);
        expect(link.is("div")).toBe(false);

        expect(input.is("[required]")).toBe(true);
        expect(input.is("[unknown]")).toBe(false);
        expect(input.is("[checked]")).toBe(true);
    });

    it("should match element by a complex selector", function() {
        expect(link.is("a[href='#matches']")).toBe(true);
        expect(link.is("div a")).toBe(true);
    });

    it("should throw error if the argument is ommited or not a string", function() {
        expect(function() { link.is(); }).toThrow();
        expect(function() { link.is(1); }).toThrow();
    });

});