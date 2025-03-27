var clientInfos = {};
var clientProjects = {};
var clientUpdate = null;

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
        //projectsSort("creation_date", "desc");
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
            for (let pj of r) {
                var ce = document.querySelector(".project[data-id='"+pj.id+"']");

                if (!ce) {
                    ce = document.createElement("tr");
                    ce.addEventListener("click", (ev)=>{
                        goTo("mission", false, {
                            "mission_id": pj.id
                        });
                    });
                    
                    ctn.appendChild(ce);
                }

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
            }
        });
    
        clientProjects[cid] = cp;
    } else {
        cp.update();
    }
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