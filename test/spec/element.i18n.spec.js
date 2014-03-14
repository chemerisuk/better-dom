describe("i18n", function() {
    "use strict";

    var importSpy;

    beforeEach(function() {
        importSpy = spyOn(DOM, "importStrings");
    });

    it("should return data-i18n value if no arguments specified", function() {
        expect(DOM.create("span[data-i18n=test]").i18n()).toBe("test");
    });

    it("should set data-i18n if one argument", function() {
        var span = DOM.create("span");

        expect(span.i18n("key")).toBe(span);
        expect(span.get("data-i18n")).toBe("key");

        expect(importSpy).not.toHaveBeenCalled();
    });

    // it("should set data-i18n and args", function() {
    //     var span = DOM.create("span");

    //     expect(span.i18n("key {a1} and {a2}", {a1: "1", a2: "2"})).toBe(span);
    //     expect(span.get("data-i18n")).toBe("key {a1} and {a2}");
    //     expect(span.get("data-a1")).toBe("1");
    //     expect(span.get("data-a2")).toBe("2");
    //     expect(importSpy).toHaveBeenCalled();

    //     expect(span.i18n("new {0} and {1}", ["one", "two"])).toBe(span);
    //     expect(span.get("data-i18n")).toBe("new {0} and {1}");
    //     expect(span.get("data-0")).toBe("one");
    //     expect(span.get("data-1")).toBe("two");
    //     expect(importSpy.calls.count()).toBe(2);
    // });

    // it("should work for coolections", function() {
    //     var lis = DOM.create("li*3");

    //     lis.i18n("test {user}", {user: "Maksim"});

    //     lis.each(function(li) {
    //         expect(li).toHaveAttr("data-i18n", "test {user}");
    //         expect(li).toHaveAttr("data-user", "Maksim");
    //     });
    // });

    it("should throw error if arguments are invalid", function() {
        var span = DOM.create("span");

        expect(function() { span.i18n(1) }).toThrow();
        expect(function() { span.i18n(function() {}) }).toThrow();
        expect(function() { span.i18n("key", 1) }).toThrow();
        expect(function() { span.i18n("key", function() {}) }).toThrow();
    });
});