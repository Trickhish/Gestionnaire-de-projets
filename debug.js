var isdbg=false;

var dbg = {
    ".fullctn": "dashed 2px blue",
    ".left_side": "dashed 1px green",
    ".right_side": "dashed 1px red"
};

function startDebug() {
    if (isdbg) {
        return;
    }
    isdbg=true;

    for (var [slt, vl] of Object.entries(dbg)) {
        Array.from(document.querySelectorAll(slt)).forEach((e)=>{
            e.style.outline = vl;
            e.classList.add("debugging");
        });
    }
}

function stopDebug() {
    if (!isdbg) {
        return;
    }
    isdbg=false;

    Array.from(document.querySelectorAll(".debugging")).forEach((e)=>{
        e.style.outline = "";
        e.classList.remove("debugging");
    });
}

function toggleDbg() {
    if (isdbg) {
        stopDebug();
    } else {
        startDebug();
    }
}


window.addEventListener("load", ()=>{
    //startDebug();
});