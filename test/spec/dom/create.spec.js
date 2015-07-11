describe("create", function() {
    "use strict";

    it("should create single DOM element if parameter is not an HTML string", function() {
        var link = DOM.create("<a id=\"b\" title=\"c\"></a>");

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

        expect(DOM.createAll("<a></a><b></b>").length).toBe(2);
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

    it("supports HTML strings", function() {
        var el = DOM.create("<a>you</a>");

        expect(el).toHaveTag("a");
        expect(el).toHaveHtml("you");
    });

    it("should throw error if argument is invalid", function() {
        expect(function() { DOM.create(2); }).toThrow();
        // expect(function() { DOM.create(null); }).toThrow();
        expect(function() { DOM.create({}); }).toThrow();
    });

    describe("createAll", function() {
        it("should always return array of elements", function() {
            var els = DOM.createAll("<a></a>");

            expect(Array.isArray(els)).toBeTruthy();
            expect(els[0]).toHaveTag("a");
        });

        it("wraps element to div if HTML string has several root nodes", function() {
            var el = DOM.createAll("<a></a><b></b>");

            expect(el[0]).toHaveTag("a");
            expect(el[1]).toHaveTag("b");
        });

        it("skips non elements", function() {
            var links = DOM.createAll("<a></a>text<a></a>");

            expect(links.length).toBe(2);
            expect(links[0]).toHaveTag("a");
            expect(links[1]).toHaveTag("a");
        });
    });
});