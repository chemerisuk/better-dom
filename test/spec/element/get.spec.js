describe("get", function() {
    "use strict";

    var link, input, textarea, form;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' href='test.html' data-attr='val'>get-test</a><form id='get_form' method='post'><input type='email' id='get_input' value='test' readonly='true' tabindex='10'/><textarea id='get_textarea'></textarea></form>");

        link = DOM.find("#test");
        input = DOM.find("#get_input");
        textarea = DOM.find("#get_textarea");
        form = DOM.find("#get_form");
    });

    it("should read an attribute value(s)", function() {
        expect(link.get("id")).toBe("test");
        expect(link.get("data-attr")).toBe("val");
        expect(link.get("tagName")).toBe("A");

        expect(link.get(["id", "data-attr", "tagName"])).toEqual({
            id: "test",
            "data-attr": "val",
            "tagName": "A"
        });

        expect(input.get("type")).toBe("email");
        expect(textarea.get("type")).toBe("textarea");
    });

    it("should try to read property value first", function() {
        expect(link.get("href")).not.toBe("test.html");
        expect(input.get("tabIndex")).toBe(10);
        expect(input.get("form").nodeType).toBe(1);
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

    it("should fix camel cased attributes", function() {
        expect(input.get("readonly")).toBe(true);
        expect(input.get("tabindex")).toBe(10);
    });

    it("should return cssText on accessing style property", function() {
        expect(input.get("style")).toBe("");

        input.css("float", "left");

        expect(input.get("style").trim().toLowerCase().indexOf("float: left")).toBe(0);
    });

    it("should return undefined for empty node", function() {
        expect(DOM.find("some-node").get("attr")).toBeUndefined();
    });

    describe("private properties", function() {
        beforeEach(function() {
            input = DOM.create("<input data-a1=\"x\" data-a2='{\"a\":\"b\",\"c\":1,\"d\":null}' data-a3=\"1=2=3\" data-a4=\"/url?q=:q\" data-camel-cased=\"test\" data-a101-value=\"numbered\" data-a6=\"[1,2,3]\"/>");
        });

        it("should read an appropriate data-* attribute if it exists", function() {
            expect(input.get("_a1")).toEqual("x");
            expect(input.get("_a2")).toEqual({ a: "b", c: 1, d: null });
            expect(input.get("_a3")).toBe("1=2=3");
            expect(input.get("_a4")).toBe("/url?q=:q");
            expect(input.get("_a5")).toBeNull();
            expect(input.get("_a6")).toEqual([1, 2, 3]);
        });

        it("should handle camel case syntax", function() {
            expect(input.get("_camelCased")).toBe("test");
            expect(input._.camelCased).toBe("test");

            expect(input.get("_a101Value")).toBe("numbered");
            expect(input._.a101Value).toBe("numbered");
        });
    });

});
