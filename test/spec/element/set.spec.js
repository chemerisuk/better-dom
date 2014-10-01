describe("set", function() {
    "use strict";

    var link, input;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' href='#'>set-test</a><input id='set_input'/><input id='set_input1'/>");

        link = DOM.find("#test");
        input = DOM.find("#set_input");
    });

    it("should return reference to 'this'", function() {
        expect(link.set("id", "t")).toBe(link);
        // expect(inputs.set("id", "t")).toBe(inputs);
    });

    it("should update an appropriate native object attribute", function() {
        expect(link.set("data-test", "t")).toHaveAttr("data-test", "t");
    });

    it("should try to update an appropriate native object property first", function() {
        link.set("href", "#test");

        expect(link).toHaveAttr("href", "#test");
        expect(link).not.toHaveAttr("href", "#");
    });

    it("should remove attribute if value is null or undefined", function() {
        expect(link.set("id", null)).not.toHaveAttr("id");
        expect(link.set("href", undefined)).not.toHaveAttr("href");

        // expect(link.set(null)).toHaveHtml("");
        // expect(link.set("12345")).not.toHaveHtml("");
        // expect(link.set(undefined)).toHaveHtml("");
    });

    it("should accept primitive types", function() {
        expect(link.set(1)).toHaveHtml("1");
        expect(link.set(true)).toHaveHtml("true");
    });

    it("should accept function", function() {
        var spy = jasmine.createSpy("setter").and.returnValue("test_changed");

        link.set("id", spy);

        expect(spy).toHaveBeenCalledWith("test");
        expect(link).toHaveAttr("id", "test_changed");
    });

    it("should accept object with key-value pairs", function() {
        link.set({"data-test1": "test1", "data-test2": "test2"});

        expect(link).toHaveAttr("data-test1", "test1");
        expect(link).toHaveAttr("data-test2", "test2");
    });

    it("should accept array of key values", function() {
        link.set(["autocomplete", "autocorrect"], "off");

        expect(link).toHaveAttr("autocomplete", "off");
        expect(link).toHaveAttr("autocorrect", "off");
    });

    it("should polyfill textContent", function() {
        expect(link.get("textContent")).toBe("set-test");
        link.set("textContent", "<i>changed</i>");
        expect(link.get("textContent")).toBe("<i>changed</i>");
        expect(link.get()).toBe("&lt;i&gt;changed&lt;/i&gt;");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.set(1, ""); }).toThrow();
        expect(function() { link.set(true, ""); }).toThrow();
        expect(function() { link.set(function() {}, ""); }).toThrow();
    });

    it("should read/write current page title", function() {
        expect(DOM.get("title")).toBe(document.title);

        expect(DOM.set("title", "abc")).toBe(DOM);
        expect(document.title).toBe("abc");
    });

    it("should access cssText for the style property", function() {
        expect(link).not.toHaveStyle("font-style", "italic");
        expect(link).not.toHaveStyle("float", "left");

        link.set("style", "font-style:italic");

        expect(link.css("font-style")).toBe("italic");
        expect(link.css("float")).not.toBe("left");

        link.set("style", "float:left");

        expect(link.css("font-style")).not.toBe("italic");
        expect(link.css("float")).toBe("left");
    });

    it("should return this for empty nodes", function() {
        var empty = DOM.find("some-node");

        expect(empty.set("attr", "test")).toBe(empty);
    });

    // it("should clear all children with empty string", function () {
    //     // TODO: need to catch IE bug with innerHTML = ""
    // });

    describe("private properties", function() {
        it("shoud be stored in _ object", function() {
            input.set("_test", "yeah");

            expect(input).not.toHaveAttr("_test", "yeah");
            expect(input).not.toHaveProp("_test", "yeah");
        });

        it("should accept any kind of object", function() {
            var obj = {}, nmb = 123, func = function() {};

            expect(input.set("_obj", obj).get("_obj")).toEqual(obj);
            expect(input.set("_nmb", nmb).get("_nmb")).toEqual(nmb);
            expect(input.set("_func", func).get("_func")).toEqual(func);
        });
    });

    describe("value shortcut", function() {
        it("should use 'innerHTML' or 'value' if name argument is undefined", function() {
            var value = "set-test-changed";

            link.set(value);
            input.set(value);

            expect(link).toHaveHtml(value);
            expect(input).toHaveProp("value", value);
        });

        it("should set select value properly", function() {
            var select = DOM.create("<select><option>AM</option><option>PM</option></select>");

            expect(select.get()).toBe("AM");
            select.set("PM");
            expect(select.get()).toBe("PM");
            select.set("MM");
            expect(select.get()).toBe("");
        });

        it("should accept function", function() {
            var spy = jasmine.createSpy("set").and.returnValue("ok");

            link.set(spy);
            input.set(spy);

            expect(spy.calls.count()).toBe(2);

            expect(link).toHaveHtml("ok");
            expect(input).toHaveProp("value", "ok");
        });
    });

});
