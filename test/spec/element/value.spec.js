describe("$Element#value", function() {
    "use strict";

    var div, input;

    beforeEach(function() {
        div = DOM.create("div>a+a");
        input = DOM.create("input[value=foo]");
    });

    it("should replace child element(s) from node with provided element", function() {
        expect(div[0].childNodes.length).toBe(2);
        expect(div.value(DOM.create("b"))).toBe(div);
        expect(div[0].childNodes.length).toBe(1);
        expect(div.child(0)).toHaveTag("b");
    });

    it("should set value of text input to provided string value", function () {
        expect(input.value("bar")).toBe(input);
        expect(input).toHaveProp("value", "bar");
    });

    describe("getter", function() {
        it("handles different tags", function() {
            expect(div.value().toLowerCase()).toBe("<a></a><a></a>");
            expect(input.get()).toBe("foo");
        });

        it("handles textarea", function() {
            var textarea = DOM.create("textarea");

            expect(textarea.get()).toBe("");
            textarea.set("value", "123");
            expect(textarea.get()).toBe("123");
        });

        it("handles select", function() {
            var select = DOM.create("<select><option>a2</option><option>a3</option></select>");
            expect(select.get()).toBe("a2");

            select = DOM.create("<select><option>a2</option><option selected>a3</option></select>");
            expect(select.get()).toBe("a3");

            select.set("selectedIndex", -1);
            expect(select.get()).toBe("");
        });

        it("handles option", function() {
            var select = DOM.create("<select><option value='a1'>a2</option><option selected>a3</option></select>");
            expect(select.child(0).get()).toBe("a1");
            expect(select.child(1).get()).toBe("a3");
        });
    });

    // it("should set value of text input to string value of provided element", function () {
    //     expect(input.value(DOM.create("div"))).toBe(input);
    //     expect(input[0].value).toBe("<div>");
    //     expect(input[0].childNodes.length).toBe(0);
    // });
});
