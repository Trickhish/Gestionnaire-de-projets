

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

function handleAdd(el, to) {
    let type = el.getAttribute("data-type");
    let dir = el.getAttribute("data-dir");

    if (type === "container") {
        var ne = document.createElement("div");
        ne.className = `stb_item nested ${(dir=="horizontal") ? "horizontal" : "vertical"}`;
        el.replaceWith(ne);
        makeSortable(ne);
    } else if (type == "image") {
        var ne = document.createElement("img");
        ne.className = "stb_item image";
        ne.src = "/res/image_placeholder.jpg";
        el.replaceWith(ne);
    }
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

