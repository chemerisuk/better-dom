describe("find", function() {
    "use strict";
    
    it("should find an element by id", function() {
        setFixtures("<a id='test'>test</a>");

        expect(DOM.find("#test")._node).toHaveId("test");
    });

    it("should find an element by class", function() {
        setFixtures("<a class='test321'>test</a>");
        
        expect(DOM.find(".test321")._node).toHaveClass("test321");
    });

    it("should find an element by selector", function() {
        setFixtures("<a class='test123'>test</a>");

        var domLink = DOM.find("a.test123");
        
        expect(domLink._node).toHaveTag("a");
        expect(domLink._node).toHaveClass("test123");
    });

    it("should throw error if the first argument is not a string", function() {
        expect(function() { DOM.find(1); }).toThrow();
    });

    it("should throw error if selector is not valid", function() {
        expect(function() { DOM.find("$test"); }).toThrow();
    });

});