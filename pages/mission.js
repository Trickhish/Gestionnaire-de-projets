var projects = {};
var tasks = {};

function mission_nav(params) {
    var mid = params["mission_id"];

    var cards = document.querySelectorAll("subsection#mission .card");
    //setCardContent(cards[0], null, "//");
    //setCardContent(cards[1], null, "//");
    //setCardContent(cards[2], null, "//");
    //setCardContent(document.querySelectorAll("subsection#mission .card")[3], null, "//");

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
        });
        projects[mid] = ci;
    } else {
        document.getElementById("section_title").innerText = ci.value.name;

        ci.update();
    }

    if (tasks[mid]==undefined) {
        var c = document.querySelector("#mission .bottom");
        var tbl = Table.fromName("tasks",
            [["name","Nom"],["duration","Durée","custom",["started_at", "ended_at"],(p)=>{
                var start = dateOfTime(p["started_at"]);
                var end = dateOfTime(p["ended_at"]);

                if (start==null || end==null) {
                    return("");
                }

                var msDiff = Math.abs(start-end);

                var [h,m,s] = getTimeOfMs(msDiff);

                return(formatHMS(h,m,s));
            }],["done","Faite","bool"],["price","Prix"]],
            null,
            (type, dt)=>{
                if (type=="left") {
                    goTo("task", false, {
                        "task_id": dt["id"]
                    });
                } else if (type=="middle") {
                    newTabGo("task", {
                        "task_id": dt["id"]
                    });
                }
            }
        );

        /*var tbl = new Table("tasks",
            [["name","Nom"],["duration","Durée"],["done","Faite"],["price","Prix"]],
            r,
            (dt)=>{
                console.log(dt);
            }
        );*/
        
        /*if (tbl.element==null) {
            c.appendChild(tbl.buildTable());
        } else {
            tbl.fillTable();
        }*/

        // tbl.place(c, null, null);
        // c.appendChild(tbl.buildTable(null, null));

        var mts = new Ressource(mid+"_tasks", new Fetch("tasks", {"project_id": mid}, [], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{ // checkpresent
            var doneTasks = r.filter(e=> e.done==1);
            setCardContent(document.querySelectorAll("subsection#mission .card")[3], null, Math.round(doneTasks.length/r.length*100));

            let sum = 0
            r.map(e=> sum+=Math.abs(dateOfTime(e["started_at"])-dateOfTime(e["ended_at"]))); // started_at ended_at
            setCardContent(document.querySelectorAll("subsection#mission .card")[0], null, formatHMS(...getTimeOfMs(sum)));

            tbl.place(c, null, r);
        });

        tasks[mid] = mts;
    } else {
        tasks[mid].update();
    }

    // https://acc.dury.dev/api/project?project_id=45&dbg=true
}



function addtask() {
    let mid = currentPage[1]["project_id"];

    get("addtask", {"project_id": mid}, (r)=>{
        console.log(r);
        tasks[mid].update();

        goTo("task", false, {
            "task_id": r["content"]["task_id"]
        });
    });


    /*var cl = currentPage[1]["client"];

    get("addproject", {"client_id": cl.id}, (r)=>{
        clientProjects[cl.id].update();
        console.log(r);

        goTo("mission", false, {
            "mission_id": r["content"]["project_id"]
        });
    }, (r)=>{
        console.log(r);
    });*/
}