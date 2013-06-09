describe("toQueryString", function() {
    "use strict";

    it("should serialize a form", function(){
        setFixtures("<form id='f1'><input type='text' name='n1' value='v1'></form>");
        expect(DOM.find("#f1").toQueryString()).toBe("n1=v1");

        setFixtures("<form id='f2'><input type='checkbox' name='n2' value='v2'></form>");
        expect(DOM.find("#f2").toQueryString()).toBe("");

        setFixtures("<form id='f3'><input type='checkbox' name='n3' value='v3' checked></form>");
        expect(DOM.find("#f3").toQueryString()).toBe("n3=v3");

        setFixtures("<form id='f4'><input type='radio' name='n4' value='v4'></form>");
        expect(DOM.find("#f4").toQueryString()).toBe("");

        setFixtures("<form id='f5'><input type='radio' name='n5' value='v5' checked></form>");
        expect(DOM.find("#f5").toQueryString()).toBe("n5=v5");

        setFixtures("<form id='f6'><select name='n6'><option value='v6'></option><option value='v66' selected></option></select></form>");
        expect(DOM.find("#f6").toQueryString()).toBe("n6=v66");

        setFixtures("<form id='f7'><select name='n7' multiple><option value='v7' selected></option><option value='v77' selected></option></select></form>");
        expect(DOM.find("#f7").toQueryString()).toBe("n7=v7&n7=v77");

        setFixtures("<form id='f8'><select name='n8'><option selected>v8</option></select></form>");
        expect(DOM.find("#f8").toQueryString()).toBe("n8=v8");
    });

    it("should ignore some form elements", function(){
        setFixtures("<form id='f1'><input type='file' name='t'></form>");
        expect(DOM.find("#f1").toQueryString()).toBe("");

        setFixtures("<form id='f2'><input type='submit' name='t'></form>");
        expect(DOM.find("#f2").toQueryString()).toBe("");

        setFixtures("<form id='f3'><input type='reset' name='t'></form>");
        expect(DOM.find("#f3").toQueryString()).toBe("");

        setFixtures("<form id='f4'><input type='button' name='t'></form>");
        expect(DOM.find("#f4").toQueryString()).toBe("");

        setFixtures("<form id='f5'><button type='submit' name='t'></button></form>");
        expect(DOM.find("#f5").toQueryString()).toBe("");

        setFixtures("<form id='f6'><fieldset name='t'></fieldset></form>");
        expect(DOM.find("#f6").toQueryString()).toBe("");
    });

    it("should serialize an element", function() {
        setFixtures("<form><input type='text' id='t1' name='n1' value='v1 v2'><input type='text' id='t2' value='v2'></form>");
        expect(DOM.find("#t1").toQueryString()).toBe("n1=v1+v2");
        expect(DOM.find("#t2").toQueryString()).toBe("");

        setFixtures("<div id='t3' name='n3'></div>");
        expect(DOM.find("#t3").toQueryString()).toBe("");
    });
});
