var tasks={};

function updateDuration(stt, edt) {
    var start = dateOfTime(stt);
    var end = dateOfTime(edt);

    console.log(start, end);

    if (start!=null && end!=null) {
        let diffMs = Math.abs(end-start);
        var [h,m,s] = getTimeOfMs(diffMs);
        var tms = formatHMS(h,m,s);
    } else {
        var tms="/";
    }

    document.querySelector("#task_duration .value").innerHTML = tms;
}

function task_nav(params) {
    var tid = params["task_id"];

    var ci = tasks[tid];
    if (!ci) {
        ci = new Ressource("task_"+tid.toString(), new Fetch("task", {"task_id": tid}, [], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            currentPage = ["task", {"task_id": tid, "task": r}];
            document.getElementById("section_title").innerText = (r.name??"New Task")+" - "+r.client_name;

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

    // https://acc.dury.dev/api/project?project_id=45&dbg=true
}