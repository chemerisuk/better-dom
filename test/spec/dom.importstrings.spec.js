describe("DOM.importStrings", function(){
    "use strict";

    var randomString;

    beforeEach(function() {
        randomString = Math.random().toString(32).split(".")[1];
    });

    it("should append global styles for new languages", function() {
        var importSpy = spyOn(DOM, "importStyles");

        DOM.importStrings("en", randomString, "");
        expect(importSpy).toHaveBeenCalledWith("[data-i18n-en]:lang(en):before", "content:attr(data-i18n-en)");

        DOM.importStrings("fr", randomString, "");
        expect(importSpy).toHaveBeenCalledWith("[data-i18n-fr]:lang(fr):before", "content:attr(data-i18n-fr)");
    });

    it("should support key/value map as argument", function() {
        var spy = spyOn(DOM, "importStrings").and.callThrough();

        DOM.importStrings("en", {a: "b", c: "d"});
        expect(spy).toHaveBeenCalledWith("en", "a", "b");
        expect(spy).toHaveBeenCalledWith("en", "c", "d");
    });

    it("should update all existing localized strings", function() {
        var link = DOM.create("a");

        jasmine.sandbox.set(link);

        link.i18n(randomString).set("en");
        expect(link.get("data-i18n-en")).toBeNull();

        DOM.importStrings("en", randomString, "test");
        expect(link.get("data-i18n-en")).toBe("test");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importStrings(1, 2, 3); }).toThrow();
        expect(function() { DOM.importStrings("a"); }).toThrow();
    });
});
