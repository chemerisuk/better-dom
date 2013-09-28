describe("DOM.importStyles", function() {
    "use strict";

    it("should accept selector with style string", function() {
        setFixtures("<a id='importStyles1'></a>");

        var link = DOM.find("#importStyles1");

        expect(link.css("display")).not.toBe("none");
        DOM.importStyles("#importStyles1", "display: none");
        expect(link.css("display")).toBe("none");
    });

    it("should accept selector with style object", function() {
        setFixtures("<a id='importStyles2'></a>");

        var link = DOM.find("#importStyles2");

        expect(link.css("display")).not.toBe("none");
        DOM.importStyles("#importStyles2", {"display": "none"});
        expect(link.css("display")).toBe("none");
    });

    it("should handle vendor prefixed properties", function() {
        setFixtures("<a id='importStyles3'></a>");

        var link = DOM.find("#importStyles3");

        expect(link.css("box-sizing")).not.toBe("border-box");
        DOM.importStyles("#importStyles3", {"box-sizing": "border-box"});
        expect(link.css("box-sizing")).toBe("border-box");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importStyles(1); }).toThrow();
        expect(function() { DOM.importStyles("a"); }).toThrow();
    });
});