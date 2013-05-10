describe("get", function() {
    "use strict";
    
    var link, input;

    beforeEach(function() {
        setFixtures("<a id='test' href='test.html'>get-test</a><input type='text' id='get_input' value='test'/>");

        link = DOM.find("#test");
        input = DOM.find("#get_input");
    });

    it("should read an attribute value", function() {
        expect(link.get("id")).toBe("test");
    });

    it("should try to read property value first", function() {
        expect(link.get("href")).not.toBe("test.html");
        expect(input.get("tabIndex")).toBe(0);
    });

    it("should not allow to access to legacy objects", function() {
        var protectedProps = {
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
            },
            readProp = function(propName) {
                return function() {
                    link.get(propName);
                };
            };

        for (var propName in protectedProps) {
            expect(readProp(propName)).toThrow();
        }
    });

    it("should use 'innerHTML' or 'value' if name argument is undefined", function() {
        expect(link.get()).toBe("get-test");
        expect(input.get()).toBe("test");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.get(1); }).toThrow();
        expect(function() { link.get(true); }).toThrow();
        expect(function() { link.get({}); }).toThrow();
        expect(function() { link.get(function() {}); }).toThrow();
    });

});