describe("create", function() {
    "use strict";
    
    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create("a");

        setFixtures(link._node);

        expect(link._node).toHaveTag("a");
    });

    it("should parse HTML strings", function() {
        var el = DOM.create("<a><span></span></a>");

        setFixtures(el._node);

        expect(el._node).toHaveTag("a");
        expect(el.child(0)._node).toHaveTag("span");
    });

    it("should parse emmet-like expressions", function() {
        var el = DOM.create("ul>li");

        setFixtures(el._node);

        expect(el._node).toHaveTag("ul");
        expect(el.child(0)._node).toHaveTag("li");
    });

    it("should wrap element to div if HTML string has several root nodes", function() {
        var el = DOM.create("<a></a><b></b>");

        setFixtures(el._node);

        expect(el._node).toHaveTag("div");
        expect(el.child(0)._node).toHaveTag("a");
        expect(el.child(1)._node).toHaveTag("b");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
        expect(function() { DOM.create(document.createElement("a")); }).toThrow();
    });

});