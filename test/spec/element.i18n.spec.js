describe("i18n", function() {
    "use strict";

    beforeEach(function() {
        sessionStorage.clear();
    });

    it("should return data-i18n value if no arguments specified", function() {
        expect(DOM.create("span[data-i18n=test]").i18n()).toBe("test");
    });

    it("should set data-i18n if one argument", function() {
        var span = DOM.create("span");

        expect(span.i18n("key")).toBe(span);
        expect(span.get("data-i18n")).toBe("key");
    });

    it("should set data-i18n and args", function() {
        var span = DOM.create("span");

        expect(span.i18n("key {a1} and {a2}", {a1: "1", a2: "2"})).toBe(span);
        expect(span.get("data-i18n")).toBe("key 1 and 2");

        expect(span.i18n("new {0} and {1}", ["one", "two"])).toBe(span);
        expect(span.get("data-i18n")).toBe("new one and two");
    });

    it("should work for coolections", function() {
        var lis = DOM.create("li*3");

        lis.i18n("test {user}", {user: "Maksim"});

        lis.each(function(li) {
            expect(li).toHaveAttr("data-i18n", "test Maksim");
        });
    });

    it("should throw error if arguments are invalid", function() {
        var span = DOM.create("span");

        expect(function() { span.i18n(1) }).toThrow();
        expect(function() { span.i18n(function() {}) }).toThrow();
        expect(function() { span.i18n("key", 1) }).toThrow();
        expect(function() { span.i18n("key", function() {}) }).toThrow();
    });
});