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

    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
    });

});