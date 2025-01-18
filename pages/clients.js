var clientInfos = {};
var clientProjects = {};
var clientUpdate = null;
var projects = {};

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

function projectsSort(f, s=null) {
    var e = document.querySelector("#projects_ctn .filter[data-field='"+f+"']");

    if (!e) {
        return;
    }

    var funcs = {
        "name": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "creation_date": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "invoice": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "invoice_date": (a, b)=>{
            return(a>b ? 1 : -1);
        },
        "paid": (a, b)=>{
            return(parseFloat(a)>parseFloat(b) ? 1 : -1);
        },
        "received": (a, b)=>{
            return(parseFloat(a)>parseFloat(b) ? 1 : -1);
        }
    };

    if (s=="asc") {
        e.classList.add("asc");
    } else if (s=="desc") {
        e.classList.remove("asc");
    } else {
        e.classList.toggle("asc");
    }

    sortTable(document.getElementById("projects_ctn"), f, funcs[f]??((a, b)=>{
        return(a>b ? 1 : -1);
    }), e.classList.contains("asc"));
}

function client_nav(params) {
    var cid = params["client_id"];
    //var cl = getClient(cid);
    
    document.querySelector("subsection#client #client_name").value = "";
    document.querySelector("subsection#client #client_adress").value = "";
    document.querySelector("subsection#client #client_hr").value = "";
    document.querySelector("subsection#client #client_declared").checked = false;

    function update_values(res) {
        var cl = res.value;

        currentPage = ["client", {"client_id": cl.id, "client": cl}];
        document.getElementById("section_title").innerText = cl.name;

        document.querySelector("subsection#client #client_name").value = cl["name"];
        document.querySelector("subsection#client #client_adress").value = cl["adress"];
        document.querySelector("subsection#client #client_hr").value = cl["hourly_rate"];
        document.querySelector("subsection#client #client_declared").checked = cl["declared"];
        document.querySelector("subsection#client #delclient").onclick = ()=>{
            delclient(cl.id);
        };
        document.querySelector("#tg_card .value").innerHTML = cl.tgain;
        document.querySelector("#thr_card .value").innerHTML = Math.round(cl.ttime/60);
        document.querySelector("#mnb_card .value").innerHTML = cl.pcount;
        var rk = cl.rank;
        if (rk==1) {
            rk="1<sup>er</sup>";
        } else if (rk==2) {
            rk="2<sup>ème</sup>";
        } else if (rk==3) {
            rk="3<sup>ème</sup>";
        } else {
            rk=(rk).toString()+"<sup>ème</sup>";
        }
        document.querySelector("#bcr_card .value").innerHTML = rk;

        projectsSort("creation_date", "desc");
    }
    

    var ci = clientInfos[cid];
    if (!ci) {
        ci = new Ressource(cid.toString()+"_infos", new Fetch("client", {"client_id": cid}, ["client"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            update_values(ci);
        });
    
        clientInfos[cid] = ci;
    } else {
        projectsSort("creation_date", "desc");
        ci.updateThen(()=>{
            update_values(ci);
        });
    }

    var cp = clientProjects[cid];
    if (!cp) {
        cp = new Ressource(cid.toString()+"_projects", new Fetch("clientprojects", {"client_id": cid}, ["projects"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            var ctn = document.querySelector("#projects_ctn tbody");
            document.querySelector("#projects_ctn tbody").innerHTML="";
            for (pj of r) {
                var ce = document.querySelector(".project[data-id='"+pj.id+"']");

                if (!ce) {
                    ce = document.createElement("tr");
                    ce.addEventListener("click", (ev)=>{
                        goTo("mission", false, {
                            "mission_id": pj.id
                        });
                    });
                    ce.setAttribute("data-id", pj.id);
                    ce.className = "project";

                    var t = document.createElement("td");
                    t.className = "name";
                    t.innerText = pj.name;
                    ce.appendChild(t);

                    var t = document.createElement("td");
                    t.className = "creation_date";
                    t.innerText = pj.creation_date;
                    ce.appendChild(t);

                    var t = document.createElement("td");
                    t.className = "invoice link";
                    t.innerText = pj.invoice;
                    ce.appendChild(t);

                    var t = document.createElement("td");
                    t.className = "invoice_date";
                    t.innerText = pj.invoice_date;
                    ce.appendChild(t);

                    var t = document.createElement("td");
                    t.className = "paid";
                    t.innerText = pj.paid;
                    ce.appendChild(t);

                    var t = document.createElement("td");
                    t.className = "received";
                    t.innerText = pj.received;
                    ce.appendChild(t);

                    ctn.appendChild(ce);
                } else {

                }
            }
        });
    
        clientProjects[cid] = cp;
    } else {
        cp.update();
    }
}

function addmission() {
    var cl = currentPage[1]["client"];

    get("addproject", {"client_id": cl.id}, (r)=>{
        clientProjects[cl.id].update();
        console.log(r);

        goTo("mission", false, {
            "mission_id": r["content"]["project_id"]
        });
    }, (r)=>{
        console.log(r);
    });
}

function mission_nav(params) {
    var mid = params["mission_id"];

    var ci = projects[mid];
    if (!ci) {
        ci = new Ressource("project_"+mid.toString(), new Fetch("project", {"project_id": mid}, [], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            currentPage = ["project", {"project_id": mid, "project": r}];
            document.getElementById("section_title").innerText = (r.name??"New Project")+" - "+r.client_name;

            var pjn_bd = new bondInput(document.querySelector(".right_side #project_name"), mid, "project", "name");
            var pjd_bd = new bondInput(document.querySelector(".right_side #project_desc"), mid, "project", "description");
            document.querySelector(".right_side #delproject").onclick = ()=>{
                confirma(`Voulez-vous vraiment supprimer le projet "${ci.value.name}" ?`, ()=>{
                    get("delentry", {"id":mid, "type":'projects'}, (r)=>{
                        console.log("SUCCESS");
                        goTo("client", false, {"client_id": ci.value.client_id});
                    }, (r)=>{

                    });
                });
            };

            console.log(r);
        });
        projects[mid] = ci;
    } else {
        document.getElementById("section_title").innerText = ci.value.name;

        ci.update();
    }

    // https://acc.dury.dev/api/project?project_id=45&dbg=true
}

function clients_load() {
    //clientsTable = agGrid.createGrid(document.getElementById("cctn"), clientsTableParams);

    clients.updateThen((r)=>{
        clientsSort("name", "asc");
        
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

window.addEventListener('popstate', (e)=>{
    clients.update();
});

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

var clients = new Ressource("clients", new Fetch("clients", {}, ["clients"], "GET"), false, 30, null, (e)=>{
    return(new Client(e));
}, checkClients);