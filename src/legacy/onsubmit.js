// submit event bubbling fix for IE<9
function handleFormEvent() {
    var e = window.event;

    if (!e.cancelBubble) DOM.create(e.srcElement).fire(e.type);

    return false;
}

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
            form = target.form,
            type = target.type;

        if (!form) return;

        if (type === "submit" || type === "reset") {
            form.detachEvent("on" + type, handleFormEvent);
            form.attachEvent("on" + type, handleFormEvent);
        }
    });
}
