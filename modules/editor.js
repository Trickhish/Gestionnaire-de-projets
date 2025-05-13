

function makeSortable(el) {
    new Sortable(el, {
        group: "shared",
        animation: 150,
        fallbackOnBody: false,
        sort:false,
        //swapThreshold: 0.65,
        emptyInsertThreshold: 5,
        dragoverBubble: true,
        onAdd: function (evt) {
            if (evt.from.classList.contains("palette")) {
                handleAdd(evt.item, evt.to);
            }
        }
    });
}

function getEditor(el, mx=10) {
    if (el==null) {
        return(null);
    }

    if (el.classList.contains("editor") && el.classList.contains("stb_ctn")) {
        return(el);
    } else {
        if (mx<=0) {
            return(null);
        } else {
            return(getEditor(el.parentElement, mx-1));
        }
    }
}

function addBlock(dt) {
    let type = dt["type"];

    if (type === "container") {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.setAttribute("data-dir", dt["dir"]);
        ne.className = `stb_item nested ${(dt["dir"]=="horizontal") ? "horizontal" : "vertical"}`;
        makeSortable(ne);
    } else if (type == "image") {
        var ne = document.createElement("img");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item image";
        ne.src = "/res/image_placeholder.jpg";
    } else if (type == "text") {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item text";
        
        var se = document.createElement("h2");
        se.innerText = dt["text"]??"";
        se.setAttribute("contenteditable", "true");
        ne.appendChild(se);
    } else {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item";
    }

    ne.addEventListener("contextmenu", (e) => {
        openRcMenu({
            "Edit": () => {
                console.log("Edit");
            },
            "Properties": () => {
                console.log("Properties");
            },
            "Supprimer": () => {
                console.log(ne, getEditor(ne));

                var edt = getEditor(ne);
                ne.remove();
                if (edt!=null) {
                    triggerEvent(edt, "change");
                }
            }
        });
        
        e.stopPropagation();
        e.preventDefault();
    });

    return(ne);
}

function handleAdd(el, to) {
    let type = el.getAttribute("data-type");
    let dir = el.getAttribute("data-dir");

    let ne = addBlock({
        "type": type,
        "dir": dir
    });
    el.replaceWith(ne);
    el=ne;

    /*if (type === "container") {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.className = `stb_item nested ${(dir=="horizontal") ? "horizontal" : "vertical"}`;
        el.replaceWith(ne);
        makeSortable(ne);
        el=ne;
    } else if (type == "image") {
        var ne = document.createElement("img");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item image";
        ne.src = "/res/image_placeholder.jpg";
        el.replaceWith(ne);
        el=ne;
    }*/

    triggerEvent(getEditor(el), "change");
}

function stbSave(editor) {
    var data = [];
    Array.from(editor.children).forEach((el)=>{
        var type = el.getAttribute("data-type");
        var dir = el.getAttribute("data-dir");

        var e = {
            type: type
        };

        if (type == "container") {
            e["children"] = stbSave(el);
        } else if (type == "image") {
            e["src"] = el.src;
        } else if (type == "text") {
            e["text"] = el.innerText;
        }

        for (var k of ["dir"]) {
            if (el.hasAttribute("data-"+k)) {
                e[k] = el.getAttribute("data-"+k);
            }
        }

        data.push(e);
    });

    console.log(data);

    return(data);
}

function loadBlock(el) {
    let ne = addBlock(el);
    console.log(el);
    
    if (Object.keys(el).includes("children")) {
        el.children.forEach((child)=>{
            let childEl = loadBlock(child);
            ne.appendChild(childEl);
        });
    }
    return(ne);
}

function stbLoad(editor, data) {
    if (data==null) {
        return;
    }
    console.log(data);

    removeAllChildren(editor);

    data.forEach((el)=>{
        let ne = loadBlock(el);
        editor.appendChild(ne);

        /*var ne = document.createElement("div");
        ne.className = `stb_item nested ${(el.dir=="horizontal") ? "horizontal" : "vertical"}`;
        editor.appendChild(ne);
        makeSortable(ne);
        handleAdd(ne, editor);*/
    });
}

window.addEventListener("load", ()=>{
    return;

    // Palette
    new Sortable(document.getElementById("palette"), {
        group: { name: "shared", pull: "clone", put: false }, // Clone items
        sort: false
    });

    // Editor
    new Sortable(document.getElementById("editor"), {
        group: "shared",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: "ghost",
        onAdd: function (evt) {
            if (evt.from.id === "palette") {
                handleAdd(evt.item, evt.to);
            }
        }
    });

    // Delete Area
    new Sortable(document.getElementById("delete-area"), {
        group: "shared",
        onAdd: function (evt) {
            evt.item.remove();
        }
    });
});

