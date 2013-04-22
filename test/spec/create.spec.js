describe("create", function() {

    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create("a");

        setFixtures(link._node);

        expect(link._node).toMatchSelector("a");
    });

    it("should return DOM collection when the first argument is a HTML string", function() {
        var elements = DOM.create("<ul class='test'><li><li></ul><a href='#'></a>"),
            expectedSelectors = ["ul.test", "a[href]"];

        expect(elements.length).toBe(2);

        elements.each(function(el, index) {
            setFixtures(el._node);

            expect(el._node).toMatchSelector(expectedSelectors[index]);
        });
    });

    it("should create new DOM element if the first argument is native element", function() {
        var el = DOM.create(document.createElement("em"));

        setFixtures(el._node);

        expect(el._node).toMatchSelector("em"); 
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
    });

});