describe("set", function() {
    "use strict";

    var link, input, inputs;

    beforeEach(function() {
        setFixtures("<a id='test' href='#'>set-test</a><input id='set_input'/><input id='set_input1'/>");

        link = DOM.find("#test");
        input = DOM.find("#set_input");
        inputs = DOM.findAll("#set_input, #set_input1");
    });

    it("should return reference to 'this'", function() {
        expect(link.set("id", "t")).toBe(link);
        expect(inputs.set("id", "t")).toBe(inputs);
    });

    it("should update an appropriate native object attribute", function() {
        expect(link.set("data-test", "t")._node).toHaveAttr("data-test", "t");
        inputs.set("name", "abc").legacy(function(node) {
            expect(node.name).toBe("abc");
        });
    });

    it("should try to update an appropriate native object property first", function() {
        link.set("href", "#test");

        expect(link._node).toHaveAttr("href", "#test");
        expect(link._node.href).not.toEqual("#");
    });

    it("should remove attribute if value is null or undefined", function() {
        expect(link.set("id", null)._node).not.toHaveAttr("id");
        expect(link.set("href", undefined)._node).not.toHaveAttr("href");

        expect(link.set(null)._node.innerHTML).toBe("");
        expect(link.set("12345")._node.innerHTML).not.toBe("");
        expect(link.set(undefined)._node.innerHTML).toBe("");
    });

    it("should accept primitive types", function() {
        expect(link.set(1)._node.innerHTML).toBe("1");
        expect(link.set(true)._node.innerHTML).toBe("true");
    });


    // it("should accept space-separated property names", function() {
    //     link.set("id href", "changed");

    //     expect(link._node).toHaveId("changed");
    //     expect(link._node).toHaveAttr("href", "changed");
    // });

    it("should accept function", function() {
        var spy = jasmine.createSpy("setter");

        link.set("id", function(value, index, el) {
            expect(this).toBe(undefined);

            spy(value, index, el);

            return "test_changed";
        });

        expect(spy).toHaveBeenCalledWith("test", 0, link);
        expect(link._node).toHaveAttr("id", "test_changed");

        spy.reset();

        link.set(function(value) {
            spy(value);

            return "set-test-updated";
        });

        expect(spy).toHaveBeenCalledWith("set-test");
        expect(link._node.innerHTML).toBe("set-test-updated");
    });

    it("should accept object with key-value pairs", function() {
        link.set({"data-test1": "test1", "data-test2": "test2"});

        expect(link._node).toHaveAttr("data-test1", "test1");
        expect(link._node).toHaveAttr("data-test2", "test2");
    });

    it("should use 'innerHTML' or 'value' if name argument is undefined", function() {
        var value = "set-test-changed";

        link.set(value);
        input.set(value);

        expect(link._node.innerHTML).toBe(value);
        expect(input._node.value).toBe(value);

        inputs.set("qqq").legacy(function(node) {
            expect(node.value).toBe("qqq");
        });
    });

    it("should set select value properly", function() {
        var select = DOM.create("select>option>{AM}^option>{PM})");

        expect(select.get()).toBe("AM");
        select.set("PM");
        expect(select.get()).toBe("PM");
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

    it("should throw error if title is not a string", function() {
        expect(function() { DOM.set("title"); }).toThrow();
        expect(function() { DOM.set("title", 123); }).toThrow();
        expect(function() { DOM.set("title", function() {}); }).toThrow();
    });

});