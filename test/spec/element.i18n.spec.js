describe("i18n", function() {
    "use strict";

    it("should return data-i18n value if no arguments specified", function() {
        expect(DOM.create("span[data-i18n=test]").i18n()).toBe("test");
    });

    it("should set data-i18n if one argument", function() {
        var span = DOM.create("span");

        expect(span.i18n("key")).toBe(span);
        expect(span.get("data-i18n")).toBe("key");

        expect(span.i18n(null)).not.toHaveAttrEx("data-i18n");
    });

    it("should set data-i18n and args", function() {
        var span = DOM.create("span");

        expect(span.i18n("key", {a1: "1", a2: "2"})).toBe(span);
        expect(span.get("data-i18n")).toBe("key");
        expect(span.get("data-a1")).toBe("1");
        expect(span.get("data-a2")).toBe("2");
    });

    it("should throw error if arguments are invalid", function() {
        var span = DOM.create("span");

        expect(function() { span.i18n(1) }).toThrow();
        expect(function() { span.i18n(function() {}) }).toThrow();
        expect(function() { span.i18n("key", 1) }).toThrow();
        expect(function() { span.i18n("key", function() {}) }).toThrow();
    });
});