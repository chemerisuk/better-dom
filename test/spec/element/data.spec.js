describe("data", function() {
    var input;

    beforeEach(function() {
        input = DOM.create("<input data-a1=\"x\" data-a2='{\"a\":\"b\",\"c\":1,\"d\":null}' data-a3=\"1=2=3\" data-a4=\"/url?q=:q\" data-camel-cased=\"test\" data-a101-value=\"numbered\" data-a6=\"[1,2,3]\"/>");
    });

    it("should read an appropriate data-* attribute if it exists", function() {
        expect(input.data("a1")).toEqual("x");
        expect(input.data("a2")).toEqual({ a: "b", c: 1, d: null });
        expect(input.data("a3")).toBe("1=2=3");
        expect(input.data("a4")).toBe("/url?q=:q");
        expect(input.data("a5")).toBeNull();
        expect(input.data("a6")).toEqual([1, 2, 3]);
    });

    it("should handle camel case syntax", function() {
        expect(input.data("camelCased")).toBe("test");
        expect(input._.camelCased).toBe("test");

        expect(input.data("a101Value")).toBe("numbered");
        expect(input._.a101Value).toBe("numbered");
    });

    it("shoud be stored in _ object", function() {
        input.data("test", "yeah");

        expect(input).not.toHaveAttr("test", "yeah");
        expect(input).not.toHaveProp("test", "yeah");
    });

    it("should accept any kind of object", function() {
        var obj = {}, nmb = 123, func = function() {};

        expect(input.data("obj", obj).data("obj")).toEqual(obj);
        expect(input.data("nmb", nmb).data("nmb")).toEqual(nmb);
        expect(input.data("func", func).data("func")).toEqual(func);
    });
});