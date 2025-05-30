

function makeSortable(el) {
    new Sortable(el, {
        group: "shared",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onAdd: function (evt) {
            if (evt.from.id === "palette") {
                handleAdd(evt.item, evt.to);
            }
        }
    });
}

function handleAdd(el, to) {
    let itemType = el.getAttribute("data-type");
    let dir = el.getAttribute("data-dir");

    if (itemType === "container") {
        var ne = document.createElement("div");
        ne.className = `container ${(dir=="horizontal") ? "horizontal" : "vertical"}`;
        el.replaceWith(ne);

        // <div class="nested-list${(dir=="horizontal") ? " horizontal" : " vertical"}"></div>

        /*el.outerHTML = `
            <div class="container${(dir=="horizontal") ? " horizontal" : " vertical"}">

            </div>`;
        */
        
        //let newContainer = to.lastElementChild.querySelector(".container"); // .nested-list
        makeSortable(ne);
    }
}


window.addEventListener("load", ()=>{

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

