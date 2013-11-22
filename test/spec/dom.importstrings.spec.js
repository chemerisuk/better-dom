describe("DOM.importStrings", function(){
    "use strict";

    it("should allow to add i18n strings", function() {
        var spy = spyOn(DOM, "importStyles");

        DOM.importStrings("en", "str0", "Hello ${user}!");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str0\"]:lang(en):before",
            "content:\"Hello \"attr(data-user)\"!\"",
            true
        );

        DOM.importStrings("en", "str1", "Hello ${user}! I'm ${friend}.");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str1\"]:lang(en):before",
            "content:\"Hello \"attr(data-user)\"! I'm \"attr(data-friend)\".\"",
            true
        );

        DOM.importStrings("ru", "str3", "Hello!");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str3\"]:lang(ru):before",
            "content:\"Hello!\"",
            true
        );
    });

    it("should allow to add banch of i18n strings", function() {
        var spy = spyOn(DOM, "importStyles");

        DOM.importStrings("en", {str4: "test1", str5: "test2"});
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str4\"]:lang(en):before",
            "content:\"test1\"",
            true
        );
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str5\"]:lang(en):before",
            "content:\"test2\"",
            true
        );
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importStrings(1, 2, 3); }).toThrow();
        expect(function() { DOM.importStrings("a"); }).toThrow();
    });
});
