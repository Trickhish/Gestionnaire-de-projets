var quotesR=null;
var tbl=null;
var tableCtn=null;

function devis_load(params) {
    if (quotesR==null) {
        tableCtn = document.querySelector("section#devis");

        // id	user_id	creation_date	disposition	signed	client_id	title

        tbl = Table.fromName("quotes",
            [["title","Titre"],["creation_date","Création"],["client_name","Client"],["signed","Signé","bool"]],
            null,
            (type, dt)=>{
                if (type=="left") {
                    goTo("devi", false, {
                        "quote_id": dt["id"]
                    });
                } else if (type=="middle") {
                    newTabGo("devi", {
                        "quote_id": dt["id"]
                    });
                }
            }
        );
        
        quotesR = new Ressource("quotes", new Fetch("quotes", {}, ["quotes"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{ // checkpresent
            //console.log(tableCtn, r);
        
            tbl.place(tableCtn, null, r);
        });
    } else {
        quotesR.update();
    }

}

function addquote() {
    get("addquote", {}, (r)=>{
        quotesR.update();

        var qid = r["content"]['quote_id'];
        goTo("devi", false, {
            "quote_id": qid
        });

        console.log(`created quote ${r["content"]['quote_id']}`);
    }, (r)=>{
        alert("Failed to add client");
        console.log(r);
    });
}
	





/*var mts = new Ressource(mid+"_tasks", new Fetch("tasks", {"project_id": mid}, [], "GET"), true, 30, null, (e)=>{
    return(e);
}, (r)=>{ // checkpresent
    var doneTasks = r.filter(e=> e.done==1);
    setCardContent(document.querySelectorAll("subsection#mission .card")[3], null, Math.round(doneTasks.length/r.length*100));

    let sum = 0
    r.map(e=> sum+=Math.abs(dateOfTime(e["started_at"])-dateOfTime(e["ended_at"]))); // started_at ended_at
    setCardContent(document.querySelectorAll("subsection#mission .card")[0], null, formatHMS(...getTimeOfMs(sum)));

    tbl.place(c, null, r);
});*/