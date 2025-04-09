

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





window.addEventListener("load", (lev)=>{
    loadAllss(); 
});