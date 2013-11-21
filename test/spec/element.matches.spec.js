describe("matches", function() {
    "use strict";

    var link, input;

    beforeEach(function() {
        setFixtures("<a id='is1' href='#matches' class='test1'><i></i></a><input type='checkbox' id='is2' required checked>");

        link = DOM.find("#is1");
        input = DOM.find("#is2");
    });

    it("should match element by a simple selector", function() {
        expect(link.matches("a")).toBe(true);
        expect(link.matches("[href]")).toBe(true);
        expect(link.matches(".test1")).toBe(true);
        expect(link.matches("a.test1")).toBe(true);
        expect(link.matches("a[href]")).toBe(true);
        expect(link.matches("a#is1")).toBe(true);
        expect(link.matches("div")).toBe(false);

        expect(input.matches("[required]")).toBe(true);
        expect(input.matches("[unknown]")).toBe(false);
        expect(input.matches("[checked]")).toBe(true);
        expect(input.matches("[type=checkbox]")).toBe(true);
    });

    it("should match element by a complex selector", function() {
        expect(link.matches("a[href='#matches']")).toBe(true);
        expect(link.matches("div a")).toBe(true);
    });

    it("should throw error if the argument is ommited or not a string", function() {
        expect(function() { link.matches(); }).toThrow();
        expect(function() { link.matches(1); }).toThrow();
    });

    it("should accept optional deep argument", function() {
        expect(link.child(0).matches("a")).toBe(false);
        expect(link.child(0).matches("a", true)).toBe(true);
    });
});
