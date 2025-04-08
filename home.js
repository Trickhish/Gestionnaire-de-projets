
var history = [];



function switchSidebar() {
    var sb = document.getElementById("sidebar");
    var sbbt = document.getElementById("sidebar_rdbt")

    if (sb.classList.contains("active")) {
        sb.classList.remove("active");
        sbbt.classList.remove("active");

        sbbt.classList.remove("fa-circle-chevron-left");
        sbbt.classList.add("fa-circle-chevron-right");
    } else {
        sb.classList.add("active");
        sbbt.classList.add("active");

        sbbt.classList.remove("fa-circle-chevron-right");
        sbbt.classList.add("fa-circle-chevron-left");
    }
}

function goTo(page, rw=true, params={}) {
    if (!document.querySelector("section#"+page)) {
        return(subSection(page, params));
    } else if (document.querySelector("section#"+page).classList.contains("active")) {
        //console.log("aborting nav");
        return(true);
    }
    //console.log("GOING TO -> ",page,params);

    if (rw) {
        window.location.hash = page;
    }

    Array.from(document.querySelectorAll("section.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    Array.from(document.querySelectorAll("subsection.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    Array.from(document.querySelectorAll(".sidebt.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    document.getElementById("back_bt").classList.remove("active");

    document.querySelector("section#"+page).classList.add("active");
    document.querySelector(".sidebt#"+page).classList.add("active");

    document.getElementById("section_title").innerText = document.querySelector("section#"+page).getAttribute("data-title");

    currentPage = [page, {}];

    if (window[page+"_load"]) {
        window[page+"_load"]();
    }

    return(true);
}

function auxClick(ev, page, params={}) {
    if (ev.button==1) { // middle click
        newTabGo(page, params);
    }
}

function newTabGo(page, params={}) {
    getParams = "";
    for (var [pk, pv] of Object.entries(params)) {
        if (getParams=="") {
            getParams+="?";
        } else {
            getParams+="&";
        }
        getParams+=pk+"="+pv;
    }

    //window.location.hash = "#"+sse.getAttribute("data-parent")+"#"+sn+getParams;
    //window.location.hash = ;

    const wd = window.open(`${window.location.origin}/#${page}${getParams}`);
    wd.focus();
}

function subSection(sn, params={}) {
    var sse = document.querySelector("subsection#"+sn);
    if (!sse) {
        return(false);
    } else if (sse.classList.contains("active")) {
        //console.log("aborting nav");
        return(true);
    }
    //console.log("GOING TO -> ",sn,params);

    Array.from(document.querySelectorAll("section.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    Array.from(document.querySelectorAll("subsection.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    Array.from(document.querySelectorAll(".sidebt.active")).forEach((e)=>{
        e.classList.remove("active");
    });
    document.querySelector(".sidebt#"+(sse.getAttribute("data-parent"))).classList.add("active");

    sse.classList.add("active");
    document.getElementById("back_bt").classList.add("active");
    document.getElementById("back_bt").onclick = ()=>{
        window.history.back();
        //document.getElementById("back_bt").classList.remove("active");
        //goTo(sse.getAttribute("data-parent"));
    };

    getParams = "";
    for (var [pk, pv] of Object.entries(params)) {
        if (getParams=="") {
            getParams+="?";
        } else {
            getParams+="&";
        }
        getParams+=pk+"="+pv;
    }

    //window.location.hash = "#"+sse.getAttribute("data-parent")+"#"+sn+getParams;
    window.location.hash = "#"+sn+getParams;

    currentPage = [sn, {}];

    if (window[sn+"_nav"]) {
        window[sn+"_nav"](params);
    }

    return(true);
}

function logout() {
    setcookie("token", "", -1);

    window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
}

function loadHash() {
    var h = window.location.hash;

    if (h=='') {
        //console.log("EMPTY HASH");
        goTo("accueil");
    }

    var pg = h.split("#")[1].split("?")[0];

    var ps = h.split("?")[1];
    var params = {};
    if (ps!=null) {
        for (p of ps.split("&")) {
            var [pk, pv] = p.split("=");
            params[pk] = pv;
        }
    }

    console.log(`Going to ${pg}`);
    if (!goTo(pg, false, params)) {
        //console.log("NAV FAILED");
        goTo("accueil");
    }
}

window.addEventListener("load", ()=>{
    loadHash();
});

window.addEventListener("hashchange", (event) => {
    //console.log("HASH CHANGE -> ",window.location.hash);
    loadHash();
});
window.addEventListener("popstate", (event) => {
    //console.log("HASH CHANGE -> ",window.location.hash);
    loadHash();
});