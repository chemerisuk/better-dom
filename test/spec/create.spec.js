describe("create", function() {
    "use strict";
    
    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create("a");

        setFixtures(link._node);

        expect(link._node).toHaveTag("a");
    });

    it("should accept html strings", function() {
        var link = DOM.create("<a><span></span></a>");

        setFixtures(link._node);

        expect(link._node).toHaveTag("a");
        expect(link.child(0)._node).toHaveTag("span");
    });

    // it("should return DOM collection when the first argument is a HTML string", function() {
    //     var elements = DOM.create("<ul class='test'><li><li></ul><a href='#'></a>"),
    //         expectedSelectors = ["ul", "a"];

    //     expect(elements.length).toBe(2);

    //     elements.each(function(el, index) {
    //         setFixtures(el._node);

    //         expect(el._node).toHaveTag(expectedSelectors[index]);
    //     });
    // });

    it("should create new DOM element if the first argument is native element", function() {
        var el = DOM.create(document.createElement("em"));

        setFixtures(el._node);

        expect(el._node).toHaveTag("em");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
    });

});