var clients = null;

class Client {
    constructor(obj) {
        obj && Object.assign(this, obj);
        this.html
    }
}

function checkClients(cl) {
    var ctn = document.querySelector("section#clients #clients_ctn tbody");
    for (e of cl) {
        var ce = document.querySelector(".client[data-id='"+e.id+"']");
        if (!ce) {
            ce = document.createElement("tr");
            ce.addEventListener("click", (ev)=>{
                var el = ev.target;
                if (el.tagName=="TD") {
                    el=el.parentNode;
                }
                goTo("client", false, {"client_id": el.getAttribute("data-id")});
            });
            ce.addEventListener("auxclick", (ev)=>{
                var el = ev.target;
                if (el.tagName=="TD") {
                    el=el.parentNode;
                }

                auxClick(ev, "client", {"client_id": el.getAttribute("data-id")});
                //goTo("client", false, {"client_id": el.getAttribute("data-id")});
            });
            ce.setAttribute("data-id", e.id);
            ce.className = "client";

            var t = document.createElement("td");
            t.className = "name";
            t.innerText = e.name;
            ce.appendChild(t);

            var t = document.createElement("td");
            t.className = "declared";
            t.innerText = e.declared ? "Oui" : "Non";
            ce.appendChild(t);

            var t = document.createElement("td");
            t.className = "tgain";
            t.innerText = e.tgain;
            ce.appendChild(t);

            var t = document.createElement("td");
            t.className = "ttime";
            t.innerText = Math.round(e.ttime/60);
            ce.appendChild(t);

            var t = document.createElement("td");
            t.className = "type";
            t.innerText = e.type;
            ce.appendChild(t);

            ctn.appendChild(ce);
        } else {
            ce.querySelector(".name").innerText = e.name;
            ce.querySelector(".declared").innerText = e.declared ? "Oui" : "Non";
            ce.querySelector(".tgain").innerText = e.tgain;
            ce.querySelector(".ttime").innerText = Math.round(e.ttime/60);
            ce.querySelector(".type").innerText = e.type;
        }
    }
}



function clientsSort(f, s=null) {
    var e = document.querySelector("#clients_ctn .filter[data-field='"+f+"']");

    if (!e) {
        return;
    }

    var funcs = {
        "name": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "declared": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "tgain": (a, b)=>{
            return(parseFloat(a)>parseFloat(b) ? 1 : -1);
        },
        "ttime": (a, b)=>{
            return(parseFloat(a)>parseFloat(b) ? 1 : -1);
        },
        "type": (a, b)=>{
            return(a>b ? 1 : -1);
        }
    };

    if (s=="asc") {
        e.classList.add("asc");
    } else if (s=="desc") {
        e.classList.remove("asc");
    } else {
        e.classList.toggle("asc");
    }

    sortTable(document.getElementById("clients_ctn"), f, funcs[f]??((a, b)=>{
        return(a>b ? 1 : -1);
    }), e.classList.contains("asc"));
}



function getClient(cid) {
    return( clients.value.find((e)=> e.id==cid) );
}



function viewClient(cid) {
    goTo("client", false, {
        "client_id": cid
    });
}



function addclient() {
    // https://acc.dury.dev/api/addclient
    get("addclient", {}, (r)=>{
        clients.update();

        viewClient(r["content"]['client_id']);
        console.log(`created client ${r["content"]['client_id']}`);
    }, (r)=>{
        alert("Failed to add client");
        console.log(r);
    });
}



function delclient(cid) {
    var cl = clientInfos[cid];

    confirma(`Voulez-vous vraiment supprimer le client "${cl.value.name}" ?`, ()=>{
        get("delclient", {"client_id": cid}, (r)=>{
            clients.update();
            goTo("clients");
        }, (r)=>{
            console.log(r);
        });
    });
}



function clients_load() {
    //clientsTable = agGrid.createGrid(document.getElementById("cctn"), clientsTableParams);

    clients.updateThen((r)=>{
        //clientsSort("name", "asc");
        
        /*if (window.location.hash.split("#").length > 2) {
            var subs = window.location.hash.split("#")[2];
            var ssn = subs.split("?")[0];
            var subs = subs.split("?")[1];
            var params = {};
            for (p of subs.split("&")) {
                var [pk, pv] = p.split("=");
                params[pk] = pv;
            }
    
            goTo(ssn, false, params);
        }*/
    }, (r, sc)=> {

    });
}



/*window.addEventListener('popstate', (e)=>{
    console.log("RELOADING CLIENTS");
    clients.update();
});*/



function clientChange(field, vl) {
    if (clientUpdate!=null) {
        clearTimeout(clientUpdate);
    }

    clientUpdate = setTimeout(()=>{
        cid = currentPage[1]["client_id"];

        //console.log(cid+": setting "+field+" to "+vl);
        post("clientset", {"client_id":cid, "field":field, "value":vl}, (r)=>{
            
        }, (r, sc)=> {
            console.log("FAILED TO EDIT "+field);
        });
    }, 200);
}

clients = new Ressource("clients", new Fetch("clients", {}, ["clients"], "GET"), false, 30, null, (e)=>{
    return(new Client(e));
}, checkClients);