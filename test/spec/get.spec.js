describe("get", function() {
    "use strict";

    var link, input, textarea, form;

    beforeEach(function() {
        setFixtures("<a id='test' href='test.html' data-attr='val'>get-test</a><form id='get_form' method='post'><input type='text' id='get_input' value='test'/><textarea id='get_textarea'></textarea></form>");

        link = DOM.find("#test");
        input = DOM.find("#get_input");
        textarea = DOM.find("#get_textarea");
        form = DOM.find("#get_form");
    });

    it("should read an attribute value", function() {
        expect(link.get("id")).toBe("test");
        expect(link.get("data-attr")).toBe("val");
        expect(link.get("tagName")).toBe("a");
    });

    it("should try to read property value first", function() {
        expect(link.get("href")).not.toBe("test.html");
        expect(input.get("tabIndex")).toBe(0);
        expect(input.get("form")).toBe(form);

    });

    // it("should not allow to access to legacy objects", function() {
    //     var protectedProps = {
    //             children: true,
    //             childNodes: true,
    //             firstChild: true,
    //             lastChild: true,
    //             nextSibling: true,
    //             previousSibling: true,
    //             firstElementChild: true,
    //             lastElementChild: true,
    //             nextElementSibling: true,
    //             previousElementSibling: true,
    //             parentNode: true,
    //             elements: true
    //         },
    //         readProp = function(propName) {
    //             return function() {
    //                 link.get(propName);
    //             };
    //         };

    //     for (var propName in protectedProps) {
    //         expect(readProp(propName)).toThrow();
    //     }
    // });

    it("should use 'innerHTML' or 'value' if name argument is undefined", function() {
        expect(link.get()).toBe("get-test");
        expect(input.get()).toBe("test");
        expect(textarea.get()).toBe("");
        textarea.set("value", "123");
        expect(textarea.get()).toBe("123");

        setFixtures("<select id='get_select'><option value='a1'>a2</option><option>a3</option></select>");
        var select = DOM.find("#get_select");
        expect(select.child(0).get()).toBe("a1");
        expect(select.child(1).get()).toBe("a3");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.get(1); }).toThrow();
        expect(function() { link.get(true); }).toThrow();
        expect(function() { link.get({}); }).toThrow();
        expect(function() { link.get(function() {}); }).toThrow();
    });

    it("should lowercase some properties", function() {
        expect(form.get("method")).toBe("post");
        expect(form.get("tagName")).toBe("form");
        expect(link.get("method")).toBe("");
        expect(link.get("tagName")).toBe("a");
    });

});