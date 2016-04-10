describe("$Element#value", function() {
    "use strict";

    var div, input;

    beforeEach(function() {
        div = DOM.create("<div><a></a><a></a></div>");
        input = DOM.create("<input value='foo'>");
    });

    describe("getter", function() {
        it("handles different tags", function() {
            expect(input.value()).toBe("foo");

            expect(div.value().toLowerCase()).toBe("");
            div.append("bar");
            expect(div.value().toLowerCase()).toBe("bar");
        });

        it("handles textarea", function() {
            var textarea = DOM.create("<textarea></textarea>");

            expect(textarea.value()).toBe("");
            textarea.set("value", "123");
            expect(textarea.value()).toBe("123");
        });

        it("handles select", function() {
            var select = DOM.create("<select><option>a2</option><option>a3</option></select>");
            expect(select.value()).toBe("a2");

            select = DOM.create("<select><option>a2</option><option selected>a3</option></select>");
            expect(select.value()).toBe("a3");

            select.set("selectedIndex", -1);
            expect(select.value()).toBe("");
        });

        it("handles options", function() {
            var select = DOM.create("<select><option value='a1'>a2</option><option selected>a3</option></select>");
            expect(select.child(0).value()).toBe("a1");
            expect(select.child(1).value()).toBe("a3");
        });
    });

    describe("setter", function() {
        it("should set value of text input to provided string value", function () {
            expect(input.value("bar")).toBe(input);
            expect(input).toHaveProp("value", "bar");
        });

        it("should replace child element(s) from node with provided text", function() {
            expect(div[0].childNodes.length).toBe(2);
            expect(div.value("foo")).toBe(div);
            expect(div[0].childNodes.length).toBe(1);
            expect(div[0].firstChild.nodeValue).toBe("foo");
        });

        it("should set select value properly", function() {
            var select = DOM.create("<select><option>AM</option><option>PM</option></select>");

            expect(select.value()).toBe("AM");
            select.value("PM");
            expect(select.value()).toBe("PM");
            select.value("MM");
            expect(select.value()).toBe("");
        });

        it("accepts primitive types", function() {
            expect(div.value(1)).toHaveHtml("1");
            expect(div.value(true)).toHaveHtml("true");
        });

        // it("uses 'textContent' or 'value' if name argument is undefined", function() {
        //     var value = "set-test-changed";

        //     link.set(value);
        //     input.set(value);

        //     expect(link).toHaveHtml(value);
        //     expect(input).toHaveProp("value", value);
        // });

        // it("should accept function", function() {
        //     var spy = jasmine.createSpy("set").and.returnValue("ok");

        //     link.set(spy);
        //     input.set(spy);

        //     expect(spy.calls.count()).toBe(2);

        //     expect(link).toHaveHtml("ok");
        //     expect(input).toHaveProp("value", "ok");
        // });
    });

    it("works for empty node", function() {
        var foo = DOM.find("x-foo");

        expect(foo.value()).toBeUndefined();
        expect(foo.value("123")).toBe(foo);
    });
});
