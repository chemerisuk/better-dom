describe("collection", function() {
    "use strict";

    var inputs, spy;

    beforeEach(function(){
        setFixtures("<div id='collection'><input class='c1'><input class='c2'><input class='c3'></div>");

        inputs = DOM.findAll("#collection > input");
        spy = jasmine.createSpy("callback");
    });

    it("should allow to execute callback for each element", function() {
        expect(inputs.each(spy)).toBe(inputs);
        expect(spy.callCount).toBe(3);
    });

    // it("should allow to break execution if true was returned", function() {
    //     inputs.each(spy.andReturn(true));
    //     expect(spy.callCount).toBe(1);
    // });

    it("should return undefined for getters and do for each for setters", function() {
        var links = DOM.findAll("body"),
            link = DOM.find("body"),
            spy = jasmine.createSpy("callback");

        _.forIn(link, function(value, key) {
            if (~("" + value).indexOf("return this;")) {
                expect(typeof links[key]).toBe("function");
            }
        });

        link.on("click", ["detail"], spy);
        links.fire("click", "abc");

        expect(spy).toHaveBeenCalledWith("abc");
    });

    // it("should allow to invoke method for each element", function() {
    //     inputs.invoke("on", "focus", spy);

    //     expect(inputs.invoke("fire", "focus"));
    //     expect(spy.callCount).toBe(3);

    //     expect(inputs.invoke("hide"));
    //     expect(inputs.every(function(el) { return el.isHidden(); })).toBe(true);

    //     expect(function() { inputs.invoke(); }).toThrow();
    // });

    it("should have basic collection methods", function() {
        var obj = {};

        expect(inputs.some(function(el) { return el.hasClass("c2"); })).toBe(true);
        expect(inputs.some(function(el, index, a) {
            expect(this).toBe(obj);
            expect(a).toBe(inputs);

            return el.hasClass("b2");
        }, obj)).toBe(false);

        expect(inputs.every(function(el) { return el.hasClass("c2"); })).toBe(false);
        expect(inputs.every(function(el, index, a) {
            expect(this).toBe(obj);
            expect(a).toBe(inputs);

            return el.matches("input");
        }, obj)).toBe(true);

        expect(inputs.map(function(el) { return el.get("className"); })).toEqual(["c1","c2","c3"]);
        expect(inputs.map(function(el, index, a) {
            expect(this).toBe(obj);
            expect(a).toBe(inputs);

            return el.get("type");
        }, obj)).toEqual(["text", "text", "text"]);

        //expect(inputs.filter(function(el) { return el.hasClass("c2"); })).toEqual(DOM.findAll(".c2"));
        expect(inputs.filter(function(el) {
            expect(this).toBe(obj);

            return el.get("options").length;
        }, obj)).toEqual([]);

        expect(inputs.reduce(function(memo, el, index, a) {
            if (index === 0) expect(memo).toBe("");

            expect(a).toBe(inputs);
            return memo + el.get("className");
        }, "")).toBe("c1c2c3");

        expect(inputs.reduceRight(function(memo, el, index, a) {
            if (index === 2) expect(memo).toBe("");

            expect(a).toBe(inputs);
            return memo + el.get("className");
        }, "")).toBe("c3c2c1");
    });

    // it("should have aliases", function() {
    //     _.forOwn({
    //         all: "every",
    //         any: "some",
    //         select: "filter",
    //         reduce: "foldl",
    //         reduceRight: "foldr",
    //         collect: "map"
    //     }, function(value, key) {
    //         expect(inputs[key]).toBe(inputs[value]);
    //     });
    // });
});
