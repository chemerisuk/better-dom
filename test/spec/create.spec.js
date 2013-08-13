describe("create", function() {
    "use strict";
    
    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create("a");

        setFixtures(link._node);

        expect(link._node).toHaveTag("a");
    });

    it("should create new DOM element if the first argument is native element", function() {
        var el = DOM.create(document.createElement("em"));

        setFixtures(el._node);

        expect(el._node).toHaveTag("em");
    });

    it("should parse HTML strings", function() {
        var el = DOM.create("<a><span></span></a>");

        setFixtures(el._node);

        expect(el._node).toHaveTag("a");
        expect(el.child(0)._node).toHaveTag("span");
    });

    it("should wrap non-single element strings with div", function() {
        expect(DOM.create("123")._node).toHaveTag("div");
        expect(DOM.create("<b></b>123<a></a>")._node).toHaveTag("div");
        expect(DOM.create("<b></b><a></a>")._node).toHaveTag("div");
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
        expect(function() { DOM.create(null); }).toThrow();
        expect(function() { DOM.create({}); }).toThrow();
    });

});