

function makeSortable(el) {
    new Sortable(el, {
        group: "shared",
        animation: 150,
        fallbackOnBody: false,
        sort:true,
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

    let rcb = {}

    if (type === "container") {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.setAttribute("data-dir", dt["dir"]);
        ne.className = `stb_item nested ${(dt["dir"]=="horizontal") ? "horizontal" : "vertical"}`;
        makeSortable(ne);
    } else if (type == "image") {
        var ne = document.createElement("img");
        ne.setAttribute("data-type", type);
        ne.setAttribute("data-mid", dt["mid"]??"");
        ne.className = "stb_item image";
        ne.src = dt["src"]; // "/res/image_placeholder.jpg"

        rcb["Changer l'image"] = ()=>{
            setTimeout(() => {
                msOpen((mid)=>{
                    ne.setAttribute("data-mid", mid);
                    ne.src = `/api/media?id=${mid}`;
                    var edt = getEditor(ne);
                    if (edt!=null) {
                        triggerEvent(edt, "change");
                    }
                }, ()=>{
                    
                });
            }, 100);
        };
    } else if (type == "text") {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item text";
        
        var se = document.createElement("h2");
        se.innerText = dt["text"]??"";
        se.setAttribute("contenteditable", "true");
        ne.appendChild(se);

        rcb["Changer la taille"] = {
            "h1 / 2em": ()=> {

            },
            "h2 / 1.5em": ()=> {

            },
            "h3 / 1.17em": ()=> {

            },
        };
        
    } else {
        var ne = document.createElement("div");
        ne.setAttribute("data-type", type);
        ne.className = "stb_item";
    }

    rcb["Supprimer"] = () => {
        console.log(ne, getEditor(ne));

        var edt = getEditor(ne);
        ne.remove();
        if (edt!=null) {
            triggerEvent(edt, "change");
        }
    };

    ne.addEventListener("contextmenu", (e) => {
        openRcMenu(rcb);
        
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
    //console.log(data);

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