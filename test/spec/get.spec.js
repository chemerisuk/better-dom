describe("get", function() {
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' href='test.html'>test</a>");

        link = DOM.find("#test");
    });

    it("should read an attribute value", function() {
        expect(link.get("id")).toEqual("test");
    });

    it("should try to read property value first", function() {
        expect(link.get("href")).not.toEqual("test.html");
    });

    it("should not allow to access to legacy objects", function() {
        Object.keys({
            children: true,
            childNodes: true,
            firstChild: true,
            lastChild: true,
            nextSibling: true,
            previousSibling: true,
            firstElementChild: true,
            lastElementChild: true,
            nextElementSibling: true,
            previousElementSibling: true,
            parentNode: true,
            elements: true
        })
        .forEach(function(propName) {
            expect(function() { link.get(propName); }).toThrow();
        });
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.get(1); }).toThrow();
    });

});