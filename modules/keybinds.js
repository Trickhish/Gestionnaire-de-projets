var keyBinds = {};
var lastPressedKey = null;

function addKeyBind(key, mdfl, fct, id=null) {
    mdfl = mdfl.map((x) => x.toLowerCase());
    key = key.toLowerCase();

    if (!Object.keys(keyBinds).includes(key)) {
        keyBinds[key] = [];
    }
    keyBinds[key].push({
        ctrl: (mdfl.includes("ctrl") || mdfl.includes("meta")) || false,
        shift: mdfl.includes("shift") || false,
        alt: mdfl.includes("alt") || false,
        fct: fct,
        id: id
    });
}

function removeKeyBinds(key, mdfl) {
    mdfl = mdfl.map((x) => x.toLowerCase());
    key = key.toLowerCase();

    if (!Object.keys(keyBinds).includes(key)) {
        return;
    }

    keyBinds[key] = keyBinds[key].filter(bind => {
        return !(bind.ctrl && mdfl.includes("ctrl")) &&
               !(bind.shift && mdfl.includes("shift")) &&
               !(bind.alt && mdfl.includes("alt"));
    });

    if (keyBinds[key].length === 0) {
        delete keyBinds[key];
    }
}

function removeKeyBindsByKey(key) {
    key = key.toLowerCase();

    if (Object.keys(keyBinds).includes(key)) {
        delete keyBinds[key];
    }
}

function removeKeyBind(id) {
    if (id==null) {
        return;
    }

    for (let key in keyBinds) {
        keyBinds[key] = keyBinds[key].filter(bind => bind.id !== id);
        if (keyBinds[key].length === 0) {
            delete keyBinds[key];
        }
    }
}

function removeAllKeyBinds() {
    keyBinds = {};
}

window.addEventListener("keydown", (evt) => {
    const ctrl = evt.ctrlKey || evt.metaKey;
    const shift = evt.shiftKey;
    const alt = evt.altKey;
    const key = evt.key.toLowerCase();

    lastPressedKey = key;

    if (!Object.keys(keyBinds).includes(key)) {
        return;
    }

    let tg = evt.target;
    if (!["enter"].includes(key) && (["textarea", "input"].includes(tg.tagName.toLowerCase()) || tg.isContentEditable)) {
        return;
    }

    for (let bind of keyBinds[key]) {
        if ((!bind.ctrl || ctrl) && (!bind.shift || shift) && (!bind.alt || alt)) {
            evt.preventDefault();
            bind.fct(evt);
        }
    }
});