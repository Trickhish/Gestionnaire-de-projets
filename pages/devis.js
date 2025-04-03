function devis_load(params) {

    var ci = tasks[tid];
    if (!ci) {
        ci = new Ressource("task_"+tid.toString(), new Fetch("task", {"task_id": tid}, [], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            console.log(r);
            currentPage = ["task", {"task_id": tid, "task": r}];
            document.getElementById("section_title").innerText = (r.name??"New Task")+" - "+r.project_name;

            var durt = new MultiTask(["start_time", "end_time"], (p)=>{                
                updateDuration(p["start_time"], p["end_time"]);
            });

            var tkn_bd = new bondInput(document.querySelector("subsection#task #task_name"), tid, "task", "name");
            var tkst_bd = new bondInput(document.querySelector("subsection#task #task_started_at"), tid, "task", "started_at", (v)=>{
                durt.run("start_time", v);
            }, (v)=>{
                durt.run("start_time", v);
            });
            var tket_bd = new bondInput(document.querySelector("subsection#task #task_ended_at"), tid, "task", "ended_at", (v)=>{
                durt.run("end_time", v);
            }, (v)=>{
                durt.run("end_time", v);
            });
            var tkdn_bd = new bondInput(document.querySelector("subsection#task #task_done"), tid, "task", "done");
            var tkd_bd = new bondInput(document.querySelector("subsection#task #task_desc"), tid, "task", "description");

            document.querySelector("subsection#task .delbt").onclick = ()=>{
                confirma(`Voulez-vous vraiment supprimer la tâche "${ci.value.name}" ?`, ()=>{
                    get("delentry", {"id":tid, "type":'tasks'}, (r)=>{
                        console.log("SUCCESS");
                        goTo("mission", false, {"mission_id": ci.value.mission_id});
                    }, (r)=>{

                    });
                });
            };

            //console.log(r);
        });
        tasks[tid] = ci;
    } else {
        document.getElementById("section_title").innerText = ci.value.name;

        ci.update();
    }
}

quotations = new Ressource("quotations", new Fetch("quotations", {}, ["clients"], "GET"), false, 30, null, (e)=>{
    return(new Client(e));
}, checkClients);