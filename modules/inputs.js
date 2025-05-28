

function removeAllChildren(e) {
    while (e.firstChild) {
        e.removeChild(e.lastChild);
    }
}


/*
     Searchable Select
*/

function ssOptionSelect(ssctn, ssopt) {
    Array.from(ssctn.querySelectorAll(".option")).forEach((e)=>{
        e.classList.remove("selected");
    });
    ssopt.classList.add("selected");
    ssctn.classList.remove("active");

    ssctn.setAttribute("value", ssopt.getAttribute("data-value"));
    ssctn.querySelector(".ss_btn").innerHTML = ssopt.innerHTML;
}

function ssOptionSelectByVal(ssctn, val) {
    for (var opt of Array.from(ssctn.querySelectorAll(".option"))) {
        if (opt.getAttribute("data-value")==val) {
            ssOptionSelect(ssctn, opt);
            break;
        }
    }
}

function ssFilter(ssctn, q=null) {
    var itc = ssctn.querySelector(".ss_items");
    var items = Array.from(ssctn.querySelectorAll(".option"));

    if (q==null || q=="") {
        items.forEach((e)=>{
            e.classList.remove("filtered");
        });
    } else {
        for (e of items) {
            if (e.innerHTML.toLowerCase().includes(q.toLowerCase())) {
                e.classList.remove("filtered");
            } else {
                e.classList.add("filtered");
            }
        }
    }
}

function ssSetItems(ssctn, options) {
    var itc = ssctn.querySelector(".ss_items");
    removeAllChildren(itc);

    for (var e of options) {
        var [name, val] = e;

        let opt = document.createElement("li");
        opt.className = "option";
        opt.setAttribute("data-value", val);
        opt.innerText = name

        opt.addEventListener("click", (ev)=>{
            ssOptionSelect(ssctn, opt);
            triggerEvent(ssctn, "change");
        });

        itc.appendChild(opt);
    }
}

function ssReload(e) {
    Array.from(e.querySelectorAll(".option")).forEach((opt)=>{
        opt.addEventListener("click", (ev)=>{
            ssOptionSelect(e, opt);
            triggerEvent(e, "change");
        });
    });
}

function ssLoad(e) {
    var bt = e.querySelector(".ss_btn");
    var shb = e.querySelector(".ss_search");

    bt.addEventListener("click", (ev)=>{
        shb.value="";
        ssFilter(e);
        e.classList.toggle("active");
    });

    shb.addEventListener("change", (ev)=>{
        ssFilter(e, shb.value);
    });
    shb.addEventListener("keyup", (ev)=>{
        ssFilter(e, shb.value);
    });

    Array.from(e.querySelectorAll(".option")).forEach((opt)=>{
        opt.addEventListener("click", (ev)=>{
            ssOptionSelect(e, opt);
            triggerEvent(e, "change");
        });
    });
}

function loadAllss() {
    var ssl = document.getElementsByClassName("searchable_select");
    Array.from(ssl).forEach((e)=>{
        ssLoad(e);
    });
}

/*
     Searchable Select END
*/




/*
     Media selection START
*/

function msOpen(ons=()=>{}, oncc=()=>{}) {
    var msc = document.querySelector("#media_select_ctn");

    if (msc!=null) {
        console.log("dismissed");
        msc.remove();
    }

    msc = document.createElement("modal");
    msc.id = "media_select_ctn";
    msc.className = "dismissible active delete";
    msc.setAttribute("data-dndm", "#media_select_ctn");
    document.body.appendChild(msc);

    get("medias", {}, (r)=>{
        var mctn = document.createElement("div");
        mctn.className = "media_ctn";

        mds = r["content"]["medias"];

        for (let m of mds) {
            var me = document.createElement("div");
            me.className = "media";
            me.setAttribute("data-fid", m.file_id);
            me.innerHTML = `
                <img src="/api/media?id=${m.file_id}" />
                <p>${m.name}</p>
            `;
            me.addEventListener("click", (ev)=>{
                ons(m.file_id);
                enableScroll();
                msc.remove();
            });
            mctn.appendChild(me);
        }

        msc.appendChild(mctn);
    });

    msc.addEventListener("dismissed", (e)=>{
        enableScroll();
        oncc();
    });
    disableScroll();
}

/*
     Media selection END
*/



/*
    Prompt START
*/

function cbprompt(title, bd, okcb, cccb) {
    var prompt = document.createElement("modal");
    prompt.id = "prompt_ctn";
    prompt.className = "dismissible active delete";
    prompt.setAttribute("data-dndm", "#prompt_ctn");
    prompt.innerHTML = `
        <h2>${title}</h2>
    `;

    for (let el of bd) {
        if (typeof el == "string") {
            var p = document.createElement("p");
            p.innerText = el;
            prompt.appendChild(p);
        } else {
            let [type, name, label, plhd, def] = el;
            if (type=="input") {
                var p = document.createElement("label");
                p.setAttribute("for", "prompt_input_"+name);
                p.className = "prompt_label";
                p.innerText = label;
                prompt.appendChild(p);

                var inp = document.createElement("input");
                inp.placeholder = plhd;
                inp.type = "text";
                inp.value = def ?? "";
                inp.name = name;
                inp.id = "prompt_input_"+name;
                inp.className = "prompt_input";
                prompt.appendChild(inp);
            } else if (type=="textarea") {

            }
        }
    }

    var btctn = document.createElement("div");
    btctn.className = "prompt_buttons";
    prompt.appendChild(btctn);

    var ccbt = document.createElement("button");
    ccbt.innerText = "Annuler";
    btctn.appendChild(ccbt);
    ccbt.addEventListener("click", (ev)=>{
        cccb();
        prompt.remove();
    });

    var okbt = document.createElement("button");
    okbt.innerText = "Ok";
    btctn.appendChild(okbt);
    okbt.addEventListener("click", (ev)=>{
        var values = {};
        Array.from(prompt.querySelectorAll(".prompt_input")).forEach((inp)=>{
            values[inp.name] = inp.value;
        });

        okcb(values);
        prompt.remove();
    });


    addKeyBind("escape", [], (ev)=>{
        enableScroll();
        removeKeyBind("escape");
        removeKeyBind("enter");
        cccb();
        prompt.remove();
    });
    addKeyBind("enter", [], (ev)=>{
        enableScroll();
        removeKeyBind("escape");
        removeKeyBind("enter");

        var values = {};
        Array.from(prompt.querySelectorAll(".prompt_input")).forEach((inp)=>{
            values[inp.name] = inp.value;
        });

        okcb(values);
        prompt.remove();
    });
    prompt.addEventListener("dismissed", (e)=>{
        enableScroll();
        removeKeyBind("escape");
        removeKeyBind("enter");
        cccb();
    });


    document.body.appendChild(prompt);
}

/*
    Prompt END
*/






window.addEventListener("load", (lev)=>{
    loadAllss(); 
});