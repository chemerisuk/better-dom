describe("manipulation", function() {
    "use strict";

    describe("remove", function() {
        var div;
        
        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should remove element from DOM", function() {
            setFixtures("<div id='test'></div>");

            DOM.find("#test").remove();

            expect(document.getElementById("test")).toBeNull();
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

        it("should accept functor", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = function() { return createDivHtml(strategy); };

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept native object", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDiv(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept document fragment", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = createDivFragment(strategy);

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should accept DOMElement", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var arg = DOM.create(createDiv(strategy));

                expect(checkMethod(div[strategy](arg))._node).toHaveClass(strategy);
            });
        });

        it("should fix html5 elements", function() {
            _.forOwn(checkStrategies, function(checkMethod, strategy) {
                var otherDiv = DOM.create("div");

                otherDiv.set("innerHTML", "<section>This native javascript sentence is in a green box <mark>with these words highlighted</mark>?</section>");

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

    });

    describe("replace", function() {
        var div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            div.replace(createDivHtml("replace"));

            expectToBeReplaced("test", "replace");
        });

        it("should accept native object", function() {
            div.replace(createDiv("replace"));

            expectToBeReplaced("test", "replace");
        });

        it("should accept document fragment", function() {
            div.replace(createDivFragment("replace"));

            expectToBeReplaced("test", "replace");
        });

        it("should throw error if argument is invalid", function() {
            expect(function() { div.replace(1); }).toThrow();
        });
    });

    function createDivHtml(className) {
        return "<div class='" + className + "'>";
    }

    function createDivEmmet(className) {
        return "div." + className;
    }

    function createDiv(className) {
        var el = document.createElement("div");

        el.className = className;

        return el;
    }

    function createDivFragment(className) {
        var fragment = document.createDocumentFragment();

        fragment.appendChild(createDiv(className));

        return fragment;
    }

    function expectToBeReplaced(id) {
        expect(document.getElementById(id)).toBeNull();
    }

});