describe("DOM.importStyles", function() {
    "use strict";

    it("should accept selector with style string", function() {
        jasmine.sandbox.set("<a id='importStyles1'></a>");

        var link = DOM.find("#importStyles1");

        expect(link.css("display")).not.toBe("none");
        DOM.importStyles("#importStyles1", "display: none;");
        expect(link.css("display")).toBe("none");
    });

    // it("should accept selector with style object", function() {
    //     jasmine.sandbox.set("<a id='importStyles2'></a>");

    //     var link = DOM.find("#importStyles2");

    //     expect(link.css("display")).not.toBe("none");
    //     DOM.importStyles("#importStyles2", {"display": "none", "some-prop": "test"});
    //     expect(link.css("display")).toBe("none");

    //     var unknownProp = link.css("some-prop");
    //     // different browsers handle unknown properties differently
    //     if (unknownProp) {
    //         expect(unknownProp).toBe("test");
    //     } else {
    //         expect(unknownProp).toBeUndefined();
    //     }
    // });

    it("should handle vendor prefixed properties", function() {
        jasmine.sandbox.set("<a id='importStyles3'></a>");

        var link = DOM.find("#importStyles3");

        expect(link.css("box-sizing")).not.toBe("border-box");
        // DOM.importStyles("#importStyles3", {"box-sizing": "border-box", "opacity": 0});
        // expect(link.css("box-sizing")).toBe("border-box");
        // expect(link.css("opacity")).toBe("0");
    });

    it("skips invalid selectors", function() {
        expect(function() {
            DOM.importStyles("::-webkit-input-placeholder", "color:gray");
            DOM.importStyles("::-moz-placeholder", "color:gray");
            DOM.importStyles("input:-ms-input-placeholder", "color:gray");
        }).not.toThrow();
    });

    it("supports at-rules", function() {
        jasmine.sandbox.set("<a id='importStyles4'></a>");

        var link = DOM.find("#importStyles4");

        expect(link.css("display")).not.toBe("none");
        DOM.importStyles("@media all", "#importStyles4 {display: none}");
        expect(link.css("display")).toBe("none");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { DOM.importStyles(1); }).toThrow();
        expect(function() { DOM.importStyles("a"); }).toThrow();
        expect(function() { DOM.importStyles("a", null); }).toThrow();
    });
});