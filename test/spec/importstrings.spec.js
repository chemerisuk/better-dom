describe("DOM.importStrings", function(){
    "use strict";

    it("should allow to add i18n strings", function() {
        var spy = spyOn(DOM, "importStyles");

        DOM.importStrings("str0", "Hello {user}!");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str0\"]:before",
            "content:\"Hello \"attr(data-user)\"!\""
        );

        DOM.importStrings("str1", "Hello {user}! I'm {friend}.");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str1\"]:before",
            "content:\"Hello \"attr(data-user)\"! I'm \"attr(data-friend)\".\""
        );

        DOM.importStrings("str3", "Hello!", "ru");
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str3\"]:lang(ru):before",
            "content:\"Hello!\""
        );
    });

    it("should allow to add banch of i18n strings", function() {
        var spy = spyOn(DOM, "importStyles");

        DOM.importStrings({str4: "test1", str5: "test2"});
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str4\"]:before", "content:\"test1\""
        );
        expect(spy).toHaveBeenCalledWith(
            "[data-i18n=\"str5\"]:before", "content:\"test2\""
        );
    });
});
