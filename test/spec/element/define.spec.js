// describe("$Element#defineProperty", function() {
//     var el;

//     beforeEach(function() {
//         el = DOM.mock("div");
//     });

//     it("should be a function", function() {
//         expect(typeof el.defineProperty).toBe("function");
//         expect(el.defineProperty("test", {
//             get: function() {},
//             set: function() {}
//         })).toBe(el);
//     });

//     it("declares a property on native element", function() {
//         var placeholder = "initial";

//         el.defineProperty("placeholder", {
//             get: function() {
//                 expect(this).toBe(el);

//                 return placeholder;
//             },
//             set: function(value) {
//                 expect(this).toBe(el);

//                 placeholder = value;
//             }
//         });

//         expect(el[0].placeholder).toBe("initial");
//         el[0].placeholder = "modified";
//         expect(el[0].placeholder).toBe("modified");
//     });

//     it("throws error on invalid arguments", function() {
//         expect(function() { el.defineProperty(1) }).toThrow();
//         expect(function() { el.defineProperty("n") }).toThrow();
//         expect(function() { el.defineProperty("n", {}) }).toThrow();
//         expect(function() { el.defineProperty("n", {get: 1, set: 2}) }).toThrow();
//     });
// });

describe("$Element#define", function() {
    var el;

    beforeEach(function() {
        el = DOM.mock("<div>");
    });

    it("updates attribute if setter returns a value", function() {
        var placeholder = "initial";

        el.define("placeholder", function() {
            return placeholder;
        }, function(value) {
            placeholder = value;

            return value;
        });

        el[0].placeholder = "modified";
        expect(el[0].placeholder).toBe("modified");
        expect(el[0].getAttribute("placeholder")).toBe("modified");

        el[0].placeholder = null;
        expect(el[0].placeholder).toBeNull();
        expect(el[0].hasAttribute("placeholder")).toBe(false);
    });

    it("passes attribute value into getter", function() {
        var placeholder = "initial";

        el.define("placeholder", function(value) {
            if (value) {
                expect(value).toBe("ok");
            }

            return placeholder;
        }, function(value) {
            placeholder = value;

            return "ok";
        });

        el[0].placeholder = "modified";
        expect(el[0].placeholder).toBe("modified");
        expect(el[0].getAttribute("placeholder")).toBe("ok");
    });

    it("syncs initial attribute value", function() {
        var getSpy = jasmine.createSpy("getSpy");
        var setSpy = jasmine.createSpy("setSpy");

        el.set("foo", "foo1");

        el.define("foo", getSpy.and.returnValue("foo2"), setSpy.and.returnValue("foo3"));
        el.define("bar", getSpy.and.returnValue("bar1"), setSpy.and.returnValue("bar2"));

        expect(el[0].getAttribute("foo")).toBe("foo1");
        expect(el[0].getAttribute("bar")).toBeNull();
    });

    it("observes attribute changes", function() {
        var spy = jasmine.createSpy("spy");

        spy.and.callFake(function(value) {
            return value;
        });

        el.define("foo", function(value) { return value }, spy);

        expect(spy).not.toHaveBeenCalled();
        expect(el.get("foo")).toBeUndefined();

        spy.calls.reset();
        el[0].setAttribute("foo", "bar");
        expect(el.get("foo")).toBe("bar");
        // expect(spy).toHaveBeenCalledWith("bar");
        el[0].setAttribute("bar", "test");
        expect(spy.calls.count()).toBe(1);
        // el[0].setAttribute("FOO", "BAR");
        // expect(el.get("foo")).toBe("BAR");
        // expect(spy.calls.count()).toBe(2);

        spy.calls.reset();
        el[0].removeAttribute("foo");
        expect(el.get("foo")).toBeUndefined();
        // expect(spy).toHaveBeenCalledWith(null);
        // el[0].removeAttribute("bar");
        // expect(spy.calls.count()).toBe(1);
        // el[0].removeAttribute("FOO");
        // expect(spy.calls.count()).toBe(2);
    });

    it("throws error on invalid arguments", function() {
        expect(function() { el.define(1) }).toThrow();
        expect(function() { el.define("n") }).toThrow();
        expect(function() { el.define("n", {}) }).toThrow();
        expect(function() { el.define("n", {get: 1, set: 2}) }).toThrow();
    });
});
