describe("set", function() {
    "use strict";

    var link, input, inputs;

    beforeEach(function() {
        jasmine.sandbox.set("<a id='test' href='#'>set-test</a><input id='set_input'/><input id='set_input1'/>");

        link = DOM.find("#test");
        input = DOM.find("#set_input");
        inputs = DOM.findAll("#set_input, #set_input1");
    });

    it("should return reference to 'this'", function() {
        expect(link.set("id", "t")).toBe(link);
        expect(inputs.set("id", "t")).toBe(inputs);
    });

    it("should update an appropriate native object attribute", function() {
        expect(link.set("data-test", "t")).toHaveAttr("data-test", "t");
        inputs.set("name", "abc").legacy(function(node) {
            expect(node.name).toBe("abc");
        });
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


    // it("should accept space-separated property names", function() {
    //     link.set("id href", "changed");

    //     expect(link).toHaveId("changed");
    //     expect(link).toHaveAttr("href", "changed");
    // });

    it("should accept function", function() {
        var spy = jasmine.createSpy("setter");

        link.set("id", function(el, index) {
            spy(el, index);

            return "test_changed";
        });

        expect(spy).toHaveBeenCalledWith(link, 0);
        expect(link).toHaveAttr("id", "test_changed");
    });

    it("should accept object with key-value pairs", function() {
        link.set({"data-test1": "test1", "data-test2": "test2"});

        expect(link).toHaveAttr("data-test1", "test1");
        expect(link).toHaveAttr("data-test2", "test2");
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

    describe("private props", function() {
        it("shoud touch private _data object", function() {
            input.set("_test", "yeah");

            expect(input).not.toHaveAttr("_test", "yeah");
            expect(input).not.toHaveProp("_test", "yeah");
        });

        it("should store any kind of object", function() {
            var obj = {}, nmb = 123, func = function() {};

            expect(input.set("_obj", obj).get("_obj")).toEqual(obj);
            expect(input.set("_nmb", nmb).get("_nmb")).toEqual(nmb);
            expect(input.set("_func", func).get("_func")).toEqual(func);
        });

        it("should work with collections", function() {
            var links = DOM.create("a[data-test]*2");

            expect(links.get("_test")).toBeUndefined();
            expect(links.set("_test", "x")).toBe(links);
            expect(links.get("_test")).toBeUndefined();

            links.each(function(link) {
                expect(link.get("_test")).toBe("x");
            });
        });
    });

    describe("value shortcut", function() {
        it("should use 'innerHTML' or 'value' if name argument is undefined", function() {
            var value = "set-test-changed";

            link.set(value);
            input.set(value);

            expect(link).toHaveHtml(value);
            expect(input).toHaveProp("value", value);

            inputs.set("qqq").legacy(function(node) {
                expect(node.value).toBe("qqq");
            });
        });

        it("should set select value properly", function() {
            var select = DOM.create("select>option>`AM`^option>`PM`)");

            expect(select.get()).toBe("AM");
            select.set("PM");
            expect(select.get()).toBe("PM");
            select.set("MM");
            expect(select.get()).toBe("");
        });
    });

    describe("style", function() {
        var links;

        beforeEach(function() {
            jasmine.sandbox.set("<a id='test0' style='z-index:2;line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left;display:block;width:100px'>test</a><a id='test1' style='line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left;display:block;width:100px'>test</a>");

            link = DOM.find("#test0");
            links = DOM.findAll("#test0, #test1");
        });

        it("should return reference to 'this'", function() {
            expect(link.set("color", "white")).toBe(link);
        });

        it("should set style properties", function() {
            expect(link.set("color", "white")).toHaveStyle("color", "white");
            expect(link.set("float", "right")).toHaveStyle("float", "right");
        });

        it("should support styles object", function() {
            link.set({color: "white", padding: "5px"});

            expect(link).toHaveStyle("color", "white");
            expect(link).toHaveStyle("padding", "5px");
        });

        it("should support setting of composite properties", function() {
            var value = "7px";

            link.set("border-width", value);

            expect(link.get("border-left-width")).toBe(value);
            expect(link.get("border-top-width")).toBe(value);
            expect(link.get("border-bottom-width")).toBe(value);
            expect(link.get("border-right-width")).toBe(value);
        });

        it("should support number values", function() {
            link.set("line-height", 7);

            expect(link).toHaveStyle("line-height", "7");

            link.set("width", 50);

            expect(link).toHaveStyle("width", "50px");
        });

        it("should handle vendor-prefixed properties", function() {
            var offset = link.offset();

            link.set("box-sizing", "border-box");

            expect(link.offset()).not.toEqual(offset);
        });

        it("should not add px suffix to some css properties", function() {
            var props = "orphans line-height widows z-index".split(" "),
                propName, i, n;

            for (i = 0, n = props.length; i < n; ++i) {
                propName = props[i];

                expect(link.set(propName, 5)).not.toHaveStyle(propName, "5px");
            }
        });

        it("should accept function", function() {
            var spy = jasmine.createSpy("value").and.returnValue(7);

            link.set("line-height", spy);

            expect(spy).toHaveBeenCalledWith(link, 0, link);
            expect(link).toHaveStyle("line-height", "7");
        });

        it("should be suported by collections", function() {
            links.set("float", "right").each(function(el) {
                expect(el).toHaveStyle("float", "right");
            });
        });

        it("should allow to clear style value", function() {
            expect(link.set("padding", null).get("padding")).toBe("0px 0px 0px 0px");
            expect(link.set("z-index", "").get("z-index")).toBe("auto");
            expect(link.set("float", undefined).get("float")).toBe("none");
        });

        it("should return undefined for empty nodes", function() {
            var emptyEl = DOM.find("xxx");

            expect(emptyEl.get("color")).toBeUndefined();
            expect(emptyEl.set("color", "red")).toBe(emptyEl);
        });
    });
});