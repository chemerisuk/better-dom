describe("manipulation", function() {

    describe("remove", function() {

        it("should remove element from DOM", function() {
            setFixtures("<div id='test'></div>");

            DOM.find("#test").remove();

            expect(document.getElementById("test")).toBeNull();
        });

    });

    describe("append, prepend, after, before", function() {
        var checkStrategies = {
                prepend: "firstChild",
                append: "lastChild",
                after: "next",
                before: "prev"
            },
            div;

        beforeEach(function() {
            setFixtures("<div id='test'><a></a></div>");

            div = DOM.find("#test");
        });

        it("should accept html string", function() {
            Object.keys(checkStrategies).forEach(function(strategy) {
                var arg = createDivHtml(strategy),
                    checkMethod = checkStrategies[strategy];

                expect(div[strategy](arg)[checkMethod]()._node).toMatchSelector("." + strategy);
            });
        });

        it("should accept native object", function() {
            Object.keys(checkStrategies).forEach(function(strategy) {
                var arg = createDiv(strategy),
                    checkMethod = checkStrategies[strategy];

                expect(div[strategy](arg)[checkMethod]()._node).toMatchSelector("." + strategy);
            });
        });

        it("should accept document fragment", function() {
            Object.keys(checkStrategies).forEach(function(strategy) {
                var arg = createDivFragment(strategy),
                    checkMethod = checkStrategies[strategy];

                expect(div[strategy](arg)[checkMethod]()._node).toMatchSelector("." + strategy);
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
    });

    function createDivHtml(className) {
        return "<div class='" + className + "'>";
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

    function expectToBeReplaced(id, className) {
        expect(document.getElementById(id)).toBeNull();
        expect(document.getElementsByClassName(className).length).toBe(1);
    }

});