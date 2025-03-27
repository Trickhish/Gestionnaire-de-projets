var projects = {};
var tasks = {};

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


    if (tasks[mid]==undefined) {
        var mts = new Ressource(mid+"_tasks", new Fetch("tasks", {"project_id": mid}, [], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            var c = document.querySelector("#mission .bottom");
            var tbl = new Table("tasks", 
                [["name","Nom"],["duration","Durée"],["done","Faite"],["price","Prix"]],
                r
            );
            c.appendChild(tbl.buildTable());
        });

        tasks[mid] = mts;
    } else {
        tasks[mid].update();
    }

    // https://acc.dury.dev/api/project?project_id=45&dbg=true
}



function addtask() {
    let mid = currentPage[1]["project_id"];

    get();
    tasks[mid].update();
}