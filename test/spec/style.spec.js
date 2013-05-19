describe("style", function() {
    "use strict";
    
    var link;

    beforeEach(function() {
        setFixtures("<a id='test' style='line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left'></a>");

        link = DOM.find("#test");
    });

    describe("getStyle", function() {
        it("should read style property", function() {
            expect(link.getStyle("color")).toBe("red");
        });

        it("should read properties by dash-separated key", function() {
            expect(link.getStyle("line-height")).toBe("2");
        });

        it("should handle vendor-prefixed properties", function() {

        });

        it("should handle composite properties", function() {
            expect(link.getStyle("padding")).toBe("5px 5px 5px 5px");
            expect(link.getStyle("margin")).toBe("2px 2px 2px 2px");
            expect(link.getStyle("border-width")).toBe("1px 1px 1px 1px");
            expect(link.getStyle("border-style")).toBe("solid solid solid solid");
        });

        it("should read runtime style property if style doesn't contain any value", function() {
            expect(link.getStyle("font-size")).toBeTruthy();
        });

        it("should fix float property name", function() {
            expect(link.getStyle("float")).toBe("left");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.getStyle(1); }).toThrow();
        });
    });

    describe("setStyle", function() {
        it("should return reference to 'this'", function() {
            expect(link.setStyle("color", "white")).toBe(link);
        });

        it("should set style properties", function() {
            expect(link.setStyle("color", "white")._node.style.color).toBe("white");
        });

        it("should support styles object", function() {
            link.setStyle({color: "white", padding: "5px"});

            expect(link._node.style.color).toBe("white");
            expect(link._node.style.padding).toBe("5px");
        });

        it("should support setting of composite properties", function() {
            var value = "7px";

            link.setStyle("border-width", value);

            expect(link.getStyle("border-left-width")).toBe(value);
            expect(link.getStyle("border-top-width")).toBe(value);
            expect(link.getStyle("border-bottom-width")).toBe(value);
            expect(link.getStyle("border-right-width")).toBe(value);
        });

        it("should support number values", function() {
            link.setStyle("line-height", 7);

            expect(link.getStyle("line-height")).toBe("7");

            link.setStyle("width", 50);

            expect(link.getStyle("width")).toBe("50px");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.setStyle(1); }).toThrow();
        });
    });

});