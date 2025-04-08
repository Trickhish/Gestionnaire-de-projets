var quotes = {}


function update_values(res) {
    var cl = res.value;
    var qid = cl["id"];

    currentPage = ["devi", {"quote_id":qid, "client":cl["client_name"], "quote_titile":cl["title"]}];
    document.getElementById("section_title").innerText = cl.title ?? "unnamed";

    return;

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

function devi_nav(params) {
    console.log("devi", params);

    var qid = params["quote_id"];
    console.log(qid);
    var quote = quotes[qid];

    currentPage = ["devi", {"quote_id": qid}];

    if (quote==null) {
        quote = new Ressource("quote_"+qid.toString(), new Fetch("quote", {"quote_id": qid}, ["quote"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{
            update_values(quote);
            console.log(r);
        });

        quotes[qid] = quote;
    } else {
        quote.updateThen(()=>{
            update_values(quote);
            console.log("updated");
        });
    }
}


