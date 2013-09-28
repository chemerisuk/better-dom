describe("style", function() {
    "use strict";

    var link;

    beforeEach(function() {
        setFixtures("<a id='test' style='line-height:2;color:red;padding:5px;margin:2px;border:1px solid;float:left;display:block;width:100px'>test</a>");

        link = DOM.find("#test");
    });

    describe("getter", function() {
        it("should read style property", function() {
            expect(link.css("color")).toBe("red");
        });

        it("should read properties by dash-separated key", function() {
            expect(link.css("line-height")).toBe("2");
        });

        it("should handle vendor-prefixed properties", function() {
            // TODO
        });

        it("should handle composite properties", function() {
            expect(link.css("padding")).toBe("5px 5px 5px 5px");
            expect(link.css("margin")).toBe("2px 2px 2px 2px");
            expect(link.css("border-width")).toBe("1px 1px 1px 1px");
            expect(link.css("border-style")).toBe("solid solid solid solid");
        });

        it("should read runtime style property if style doesn't contain any value", function() {
            expect(link.css("font-size")).toBeTruthy();
        });

        it("should fix float property name", function() {
            expect(link.css("float")).toBe("left");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.css(1); }).toThrow();
        });
    });

    describe("setter", function() {
        it("should return reference to 'this'", function() {
            expect(link.css("color", "white")).toBe(link);
        });

        it("should set style properties", function() {
            expect(link.css("color", "white")._node.style.color).toBe("white");
            expect(link.css("float", "right").css("float")).toBe("right");
        });

        it("should support styles object", function() {
            link.css({color: "white", padding: "5px"});

            expect(link._node.style.color).toBe("white");
            expect(link._node.style.padding).toBe("5px");
        });

        it("should support setting of composite properties", function() {
            var value = "7px";

            link.css("border-width", value);

            expect(link.css("border-left-width")).toBe(value);
            expect(link.css("border-top-width")).toBe(value);
            expect(link.css("border-bottom-width")).toBe(value);
            expect(link.css("border-right-width")).toBe(value);
        });

        it("should support number values", function() {
            link.css("line-height", 7);

            expect(link.css("line-height")).toBe("7");

            link.css("width", 50);

            expect(link.css("width")).toBe("50px");
        });

        it("should handle vendor-prefixed properties", function() {
            var offset = link.offset();

            link.css("box-sizing", "border-box");

            expect(link.offset()).not.toEqual(offset);
        });

        it("should not add px suffix to some css properties", function() {
            _.forEach("fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" "), function(propName) {
                expect(link.css(propName, 5).css(propName)).not.toBe("5px");
            });
        });

        it("should accept function", function() {
            var spy = jasmine.createSpy("value");

            link.css("line-height", function(value) {
                spy(value);

                expect(this).toBe(link);

                return 7;
            });

            expect(spy).toHaveBeenCalledWith("2");
            expect(link.css("line-height")).toBe("7");
        });

        it("should throw error if arguments are invalid", function() {
            expect(function() { link.css(1); }).toThrow();
        });
    });

});