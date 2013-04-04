describe("find", function() {

    it("should find an element by id", function() {
        setFixtures("<a id='test'>test</a>");

        expect(DOM.find("#test")._node).toHaveId("test");
    });

    it("should find an element by selector", function() {
        setFixtures("<a class='test'>test</a>");

        expect(DOM.find("a.test")._node).toMatchSelector("a.test");
    });

    it("should throw Error if the first argument is not a string", function() {
        expect(function() { DOM.find(1); }).toThrow();
    });

    it("should throw Error if selector is not valid", function() {
        expect(function() { DOM.find("$test"); }).toThrow();
    });

});