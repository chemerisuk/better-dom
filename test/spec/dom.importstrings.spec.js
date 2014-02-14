describe("DOM.importStrings", function(){
    "use strict";

    var importSpy;

    beforeEach(function() {
        importSpy = spyOn(DOM, "importStyles");
    });

    it("should allow to add i18n strings", function() {
        DOM.importStrings("en", "str0", "Hello {user}!");
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str0\"]:lang(en):before",
            "content:\"Hello \"attr(data-user)\"!\"",
            false
        );

        DOM.importStrings("ru", "str3", "Hello!");
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str3\"]:lang(ru):before",
            "content:\"Hello!\"",
            false
        );
    });

    it("should support variables", function() {
        DOM.importStrings("en", "str1", "Hello {user}! I'm {friend}.");
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str1\"]:lang(en):before",
            "content:\"Hello \"attr(data-user)\"! I'm \"attr(data-friend)\".\"",
            false
        );

        DOM.importStrings("en", "str1", "Hello {0}! I'm {1}.");
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str1\"]:lang(en):before",
            "content:\"Hello \"attr(data-0)\"! I'm \"attr(data-1)\".\"",
            false
        );
    });

    it("should allow to add banch of i18n strings", function() {
        DOM.importStrings("en", {str4: "test1", str5: "test2"});
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str4\"]:lang(en):before",
            "content:\"test1\"",
            false
        );
        expect(importSpy).toHaveBeenCalledWith(
            "[data-i18n=\"str5\"]:lang(en):before",
            "content:\"test2\"",
            false
        );
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importStrings(1, 2, 3); }).toThrow();
        expect(function() { DOM.importStrings("a"); }).toThrow();
    });
});
