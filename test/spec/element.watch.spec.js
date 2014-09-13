describe("watch", function() {
    var link;

    beforeEach(function() {
        link = DOM.create("<a href=\"url\" title=\"text\"></a>");
    });

    it("should execute callback after the setter call", function(done) {
        var spy1 = jasmine.createSpy("watcher1"),
            spy2 = jasmine.createSpy("watcher2"),
            oldHref = link.get("href");

        expect(link.watch("href", spy1)).toBe(link);
        expect(link.watch("title", spy2)).toBe(link);

        spy1.and.callFake(function(value, oldValue) {
            expect(value).toBe("url_changed");
            expect(oldValue).toBe(oldHref);

            expect(spy2).not.toHaveBeenCalled();

            link.set("title", "modified");
        });

        spy2.and.callFake(function(value, oldValue) {
            expect(value).toBe("modified");
            expect(oldValue).toBe("text");

            expect(spy1.calls.count()).toBe(1);
            expect(spy2.calls.count()).toBe(1);

            done();
        });

        link.set("href", "url_changed");
    });

    it("should execute for visibility methods", function(done) {
        var spy = jasmine.createSpy("watcher");

        link.watch("aria-hidden", spy);

        spy.and.callFake(function(newValue, oldValue) {
            expect(newValue).toBe("true");
            expect(oldValue).toBeFalsy();
        });

        link.hide();

        setTimeout(function() {
            expect(spy.calls.count()).toBe(1);

            spy.and.callFake(function(newValue, oldValue) {
                expect(newValue).toBe("false");
                expect(oldValue).toBe("true");

                done();
            });

            link.show();
        }, 50);
    });

    it("should allow to unregister handler", function(done) {
        var spy = jasmine.createSpy("watcher");

        expect(link.watch("title", spy)).toBe(link);

        spy.and.callFake(function() {
            expect(link.unwatch("title", spy)).toBe(link);

            link.set("title", "modified1");

            setTimeout(function() {
                expect(spy.calls.count()).toBe(1);

                done();
            }, 50);
        });

        link.set("title", "modified");
    });

    it("should work for the value shortcut", function(done) {
        var spy = jasmine.createSpy("watcher"),
            input = DOM.create("input");

        spy.and.callFake(function() {
            expect(spy).toHaveBeenCalledWith("test1", "");

            spy = jasmine.createSpy("watcher");
            spy.and.callFake(function() {
                expect(spy).toHaveBeenCalledWith("test2", "");

                done();
            });

            input.watch("value", spy);
            input.set("test2");
        });

        link.watch("innerHTML", spy);
        link.set("test1");
    });
});
