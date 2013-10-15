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

        link.set("id", function(value) {
            spy(value);

            return "test_changed";
        });

        expect(spy).toHaveBeenCalledWith("test");
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
    //         setProp = function(propName) {
    //             return function() {
    //                 link.set(propName, "t");
    //             };
    //         };

    //     for (var propName in protectedProps) {
    //         expect(setProp(propName)).toThrow();
    //     }
    // });

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

    it("should emulate defaultValue for select", function() {
        setFixtures("<select id='test_select'><option>a</option><option>b</option><option>c</option></select>");

        var select = DOM.find("#test_select"),
            selected = function(el) { return el.get("selected") };

        expect(select.children().filter(selected)[0].get()).toBe("a");
        select.set("defaultValue", "b");
        expect(select.children().filter(selected)[0].get()).toBe("b");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { link.set(1, ""); }).toThrow();
        expect(function() { link.set(true, ""); }).toThrow();
        expect(function() { link.set(function() {}, ""); }).toThrow();
    });

});