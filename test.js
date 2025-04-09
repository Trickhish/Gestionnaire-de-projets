function makeSortable(el) {
    new Sortable(el, {
        group: "shared",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
}

window.addEventListener("load", ()=>{
    // Palette (Source)
    new Sortable(document.getElementById("palette"), {
        group: { name: "shared", pull: "clone", put: false }, // Clone items
        sort: false
    });

    // Editor (Destination)
    /*new Sortable(document.getElementById("editor"), {
        group: "shared",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: "ghost",
        onAdd: function (evt) {
            
           console.log(evt);
        }
    });*/


    new Sortable(document.getElementById("editor"), {
        group: "shared",
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: "ghost",
        onAdd: function (evt) {
            if (evt.from.id === "palette") {
                let itemType = evt.item.getAttribute("data-type");

                if (itemType === "container") {
                    // <div class="item">Container</div>
                    evt.item.outerHTML = `
                        <div class="container">
                            <div class="nested-list"></div>
                        </div>`;
                    
                    // Initialize sorting on the new nested list
                    let newContainer = evt.to.lastElementChild.querySelector(".nested-list");
                    makeSortable(newContainer);
                } else if (itemType === "horizontal-container") {
                    // <div class="item">Horizontal Container</div>
                    evt.item.outerHTML = `
                        <div class="container">
                            <div class="nested-list horizontal"></div>
                        </div>`;

                    let newContainer = evt.to.lastElementChild.querySelector(".nested-list");
                    makeSortable(newContainer, true);
                } else {
                    // Ensure cloned elements are removed from palette
                    //evt.item.parentNode.removeChild(evt.item);
                }
            }
        }
    });



    // Deletion Area
    let deleteArea = document.getElementById("delete-area");

    new Sortable(deleteArea, {
        group: "shared",
        onAdd: function (evt) {
            evt.item.remove(); // Remove item when dropped into delete area
        }
    });
});