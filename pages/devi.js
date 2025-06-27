var quotes = {}

function update_values(res) {
    var cl = res.value;
    var qid = cl["id"];

    currentPage = ["devi", {"quote_id":qid, "client":cl["client_name"], "quote_title":cl["title"]}];
    document.getElementById("section_title").innerText = cl.title ?? "unnamed";

    var section = document.querySelector("subsection#devi");
    var qnm_bd = new bondInput(section.querySelector("#quote_title"), qid, "quote", "title");
    var qdesc_bd = new bondInput(section.querySelector("#quote_desc"), qid, "quote", "description");
    var qsgn_bd = new bondInput(section.querySelector("#quote_signed"), qid, "quote", "signed");

    var qedt_bd = new bondInput(section.querySelector(".editor"), qid, "quote", "disposition");

    clients.updateThen((r)=>{
        var items=[];
        for (e of r) {
            items.push([e.name, e.id]);
        }
        ssSetItems(document.querySelector(".searchable_select#quote_client"), items);

        var qcl_bd = new bondInput(section.querySelector("#quote_client"), qid, "quote", "client_id");
    });
}

function devi_nav(params) {
    var qid = params["quote_id"];
    var quote = quotes[qid];

    currentPage = ["devi", {"quote_id": qid}];

    if (quote==null) {
        quote = new Ressource("quote_"+qid.toString(), new Fetch("quote", {"quote_id": qid}, ["quote"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            update_values(quote);
            //console.log(r);
        });

        quotes[qid] = quote;
    } else {
        quote.updateThen(()=>{
            update_values(quote);
            //console.log("updated");
        });
    }
}

window.addEventListener("load", (evt)=>{
    // Palette
    new Sortable(document.querySelector("subsection#devi .palette"), {
        group: { name: "shared", pull: "clone", put: false }, // Clone items
        sort: false
    });

    // Editor
    new Sortable(document.querySelector("subsection#devi .editor"), {
        group: "shared",
        animation: 150,
        fallbackOnBody: false,
        swapThreshold: 0.65,
        sort:true,
        ghostClass: "ghost",
        onAdd: function (evt) {
            if (evt.from.classList.contains("palette")) {
                handleAdd(evt.item, evt.to);
            }
        }
    });

    document.querySelector("subsection#devi .editor").addEventListener("contextmenu", (e) => {
        openRcMenu({
            "Toggle Display mode": ()=> {

            },
            "Clear All": () => {
                confirma("Voulez-vous vraiment supprimer tous les élémentss ?", ()=>{
                    var edt = document.querySelector("subsection#devi .editor");
                    removeAllChildren(edt);

                    triggerEvent(edt, "change");
                });
            }
        });
        
        e.stopPropagation();
        e.preventDefault();
    });

    // Delete Area
    //new Sortable(document.querySelector("subsection#devi .delete-area"), {
    //    group: "shared",
    //    onAdd: function (evt) {
    //        evt.item.remove();
    //    }
    //});
});


