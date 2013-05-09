describe("matches", function() {
    "use strict";
    
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' href='#test' class='test1'></a>");

        link = DOM.find("#test");
    });

    it("should match element by a simple selector", function() {
        expect(link.matches("a")).toBe(true);
        expect(link.matches("[href]")).toBe(true);
        expect(link.matches(".test1")).toBe(true);
        expect(link.matches("a.test1")).toBe(true);
        expect(link.matches("a[href]")).toBe(true);
        expect(link.matches("a#test")).toBe(true);
        expect(link.matches("div")).toBe(false);
    });

    it("should match element by a complex selector", function() {
        expect(link.matches("a[href='#test']")).toBe(true);
        expect(link.matches("div a")).toBe(true);
    });

    it("should throw error if the argument is ommited or not a string", function() {
        expect(function() { link.matches(); }).toThrow();
        expect(function() { link.matches(1); }).toThrow();
    });

});