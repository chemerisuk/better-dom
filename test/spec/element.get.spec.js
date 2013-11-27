describe("get", function() {
    "use strict";

    var link, input, textarea, form, links;

    beforeEach(function() {
        setFixtures("<a id='test' href='test.html' data-attr='val'>get-test</a><form id='get_form' method='post'><input type='email' id='get_input' value='test'/><textarea id='get_textarea'></textarea></form>");

        link = DOM.find("#test");
        input = DOM.find("#get_input");
        textarea = DOM.find("#get_textarea");
        form = DOM.find("#get_form");

        links = DOM.create("a[data-test=$]*3");
    });

    it("should read an attribute value(s)", function() {
        expect(link.get("id")).toBe("test");
        expect(link.get("data-attr")).toBe("val");
        expect(link.get("tagName")).toBe("A");

        expect(input.get("type")).toBe("email");
        expect(textarea.get("type")).toBe("textarea");

        expect(links.get("data-test")).toEqual(["1", "2", "3"]);
    });

    it("should try to read property value first", function() {
        expect(link.get("href")).not.toBe("test.html");
        expect(input.get("tabIndex")).toBe(0);
        expect(input.get("form").nodeType).toBe(1);
    });

    it("could absent any parameter", function() {
        expect(link.get()).toBe("get-test");
        expect(input.get()).toBe("test");
        expect(textarea.get()).toBe("");
        textarea.set("value", "123");
        expect(textarea.get()).toBe("123");
    });

    it("should handle select value correctly", function() {
        var select = DOM.create("<select><option>a2</option><option>a3</option></select>");
        expect(select.get()).toBe("a2");

        select = DOM.create("<select><option>a2</option><option selected>a3</option></select>");
        expect(select.get()).toBe("a3");

        select.set("selectedIndex", -1);
        expect(select.get()).toBe("");
    });

    it("should handle option value correctly", function() {
        var select = DOM.create("<select><option value='a1'>a2</option><option selected>a3</option></select>");
        expect(select.child(0).get()).toBe("a1");
        expect(select.child(1).get()).toBe("a3");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.get(1); }).toThrow();
        expect(function() { link.get(true); }).toThrow();
        expect(function() { link.get({}); }).toThrow();
        expect(function() { link.get(function() {}); }).toThrow();
    });

    it("should polyfill textContent", function() {
        expect(link.get("textContent")).toBe("get-test");
        expect(form.get("textContent")).toBe("");
    });

    it("should return null if attribute doesn't exist", function() {
        expect(link.get("xxx")).toBeNull();
        expect(link.get("data-test")).toBeNull();
    });

});