// use this hack to prevent async errors from DOM.importStyles
jasmine.clock().install();

DOM.importStyles("@keyframes fade", "from {opacity: 1} to {opacity: 0}");
DOM.importStyles("@-webkit-keyframes fade", "from {opacity: 1} to {opacity: 0}");
DOM.importStyles(".animate[aria-hidden=true]", "opacity:0;transform:scale(0,0);-webkit-transform:scale(0,0)");

jasmine.clock().uninstall();

describe("show", function() {
    var link;

    beforeEach(function() {
        link = DOM.create("<a>123</a>");

        jasmine.sandbox.set(link);
    });

    it("sets aria-hidden to 'false'", function() {
        expect(link).not.toHaveAttr("aria-hidden");
        link.show();
        expect(link).toHaveAttr("aria-hidden", "false");
    });

    it("invokes callback on the next transitionEnd", function(done) {
        link.addClass("animate");

        link.set("aria-hidden", "true");
        link.show(function(el) {
            expect(el).toBe(link);

            done();
        });
    });

    it("invokes callback when animation ends", function(done) {
        link.show("fade", function(el) {
            expect(el).toBe(link);

            done();
        });
    });
});

describe("hide", function() {
    var link;

    beforeEach(function() {
        link = DOM.create("<a>123</a>");

        jasmine.sandbox.set(link);
    });

    it("sets aria-hidden to 'false'", function() {
        expect(link).not.toHaveAttr("aria-hidden");
        link.hide();
        expect(link).toHaveAttr("aria-hidden", "true");
    });

    it("invokes callback on the next transitionEnd", function(done) {
        link.addClass("animate");

        link.set("aria-hidden", "false");
        link.hide(function(el) {
            expect(el).toBe(link);

            done();
        });
    });

    it("invokes callback when animation ends", function(done) {
        link.hide("fade", function(el) {
            expect(el).toBe(link);

            done();
        });
    });
});
