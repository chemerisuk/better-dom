// submit event bubbling fix for IE<9

var handleSubmit = function() {
    var form = window.event.srcElement;

    form.detachEvent("onsubmit", handleSubmit);
    DOM.create(form).fire("submit");

    return false;
};

if (!document.addEventListener) {
    document.attachEvent("onkeydown", function() {
        var e = window.event,
            target = e.srcElement,
            form = target.form;

        if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
            DOM.create(form).fire("submit");

            return false;
        }
    });

    document.attachEvent("onclick", function() {
        var target = window.event.srcElement,
            form = target.form;

        if (form && target.type === "submit") {
            form.attachEvent("onsubmit", handleSubmit);
        }
    });
}
