describe("create", function() {
    "use strict";

    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create(DOM.format("<a id=\"{id}\" title=\"{title}\"></a>", {id: "b", title: "c"}));

        jasmine.sandbox.set(link);

        expect(link).toHaveTag("a");
        expect(link.get("id")).toBe("b");
        expect(link.get("title")).toBe("c");
    });

    it("should parse HTML strings", function() {
        var el = DOM.create("<a><span></span></a>");

        jasmine.sandbox.set(el);

        expect(el).toHaveTag("a");
        expect(el.child(0)).toHaveTag("span");

        expect(DOM.createAll("a+b").length).toBe(2);
    });

    it("should accept empty strings", function() {
        var el = DOM.create("");

        expect(el).toBeDefined();
        expect(el[0]).not.toBeDefined();
    });

    it("should trim inner html strings", function() {
        var el = DOM.create("   <a><span></span></a>  ");

        expect(el).toHaveTag("a");
        expect(el.child(0)).toHaveTag("span");
    });

    it("should support varMap for HTML strings", function() {
        var el = DOM.create("<a>{0}</a>", ["yo"]);

        expect(el).toHaveTag("a");
        expect(el.get()).toBe("yo");
    });

    it("should parse emmet-like expressions", function() {
        var el = DOM.create("ul>li");

        jasmine.sandbox.set(el);

        expect(el).toHaveTag("ul");
        expect(el.child(0)).toHaveTag("li");
    });

    describe("createAll", function() {
        it("should always return array of elements", function() {
            var els = DOM.createAll("a");

            expect(Array.isArray(els)).toBeTruthy();
            expect(els[0]).toHaveTag("a");
        });

        it("should wrap element to div if HTML string has several root nodes", function() {
            var el = DOM.createAll("a+b");

            expect(el[0]).toHaveTag("a");
            expect(el[1]).toHaveTag("b");
        });
    });



    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
        // expect(function() { DOM.create(null); }).toThrow();
        expect(function() { DOM.create({}); }).toThrow();
    });

});