describe("manipulation", function() {
    "use strict";

    describe("remove", function() {
        var div, italics;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a><a></a></div><i class='removeable'></i><i class='removeable'></i>");

            div = DOM.find("#test");
            italics = div.nextAll(".removeable");
        });

        it("should remove element(s) from DOM", function() {
            expect(div.remove()).toBe(div);
            expect(document.getElementById("test")).toBeNull();

            expect(italics.remove()).toBe(italics);
            expect(DOM.findAll(".removeable").length).toBe(0);
        });

        it("should throw error if argument is invalid", function() {
            expect(function() { div.remove(1); }).toThrow();
        });
    });

    describe("append, prepend, after, before", function() {
        var checkStrategies = {
                prepend: function(el) { return el.child(0); },
                append: function(el) { return el.child(-1); },
                after: function(el) { return el.next(); },
                before: function(el) { return el.prev(); }
            },
            div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should trim html string", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtmlWhitespaced(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept functor", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = function() { return createDivHtml(strategy); };

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept DOMElement", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                //var arg = DOM.create(createDiv(strategy));
                var arg = DOM.create(createDivHtml(strategy)),
                    otherDiv = DOM.create("div");

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);

                otherDiv.set("<section>This native javascript sentence is in a green box <mark>with these words highlighted</mark>?</section>");

                expect(checkMethod(div[strategy](otherDiv))._node).toHaveTag("div");
                expect(otherDiv.find("section")._node).toHaveTag("section");
            });
        });

        it("should support emmet-like expressions", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivEmmet(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept multiple arguments", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivEmmet(strategy);

                expect(checkMethod(div[strategy](createDivHtml(strategy), arg))._node).toHaveClass(strategy);
            });
        });

        it("should throw error if argument is invalid", function() {
            var callProp = function(strategy) {
                    return function() {
                        div[strategy](1);
                    };
                };

            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                expect(callProp(strategy)).toThrow();
            });
        });

        it("should return this", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivHtml(strategy);

                expect(div[strategy](arg)).toBe(div);
            });
        });
    });

    describe("replace", function() {
        var div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            expect(div.replace(createDivHtml("replace"))).toBe(div);

            expectToBeReplaced("test", "replace");
        });

        it("should throw error if argument is invalid", function() {
            expect(function() { div.replace(1); }).toThrow();
        });
    });

    function createDivHtml(className) {
        return "<div class='" + className + "'></div>";
    }

    function createDivHtmlWhitespaced(className) {
        return "   <div class='" + className + "'></div>  ";
    }

    function createDivEmmet(className) {
        return "div." + className;
    }

    function expectToBeReplaced(id) {
        expect(document.getElementById(id)).toBeNull();
    }

});