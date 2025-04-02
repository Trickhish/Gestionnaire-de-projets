var tk="";
var currentPage = ["", {}];
var modals=new Map();

function fgc(file, mode=false) { var requete = null; if (mode == undefined || mode == '') mode = false; if (window.XMLHttpRequest) {requete = new XMLHttpRequest();} else if (window.ActiveXObject) { requete = new ActiveXObject('Microsoft.XMLHTTP');} else return('false'); requete.open('GET', file, mode); requete.send(null); return requete.responseText;}

function fgca(url, s, e=function(){}) {
    var rq = new XMLHttpRequest();
    rq.open('GET', url, true);

    //rq.setRequestHeader("X-Token", tk);

    rq.onload = function() {
        var r = rq.responseText;
        s(r, rq.status);
    };
    rq.onerror = e;

    rq.send();
}

function posta(gp, pp={}, s, e=function(){}) {
    var rq = new XMLHttpRequest();
    rq.open('POST', "/api/"+gp, true);

    //console.log(pp);

    var fd = new FormData();
    for (var [pk, pv] of Object.entries(pp)) {
        fd.append(pk, pv);
    }

    //rq.setRequestHeader("X-Token", tk);

    rq.onload = function() {
        var r = rq.responseText;
        s(r, rq.status);
    }

    rq.onerror=e;

    rq.send(fd);
}

function postr(gp, pp={}) {
    var rq = new XMLHttpRequest();
    rq.open('POST', "/api/"+gp, false);

    //console.log(pp);

    //rq.setRequestHeader("X-Token", tk);

    var fd = new FormData();
    for (var [pk, pv] of Object.entries(pp)) {
        fd.append(pk, pv);
    }
    rq.send(fd);
    var r = rq.responseText;
    //console.log(gp+' => '+r);

    return(r);
}

// Synchronous api call
function action(p) {
    var r = fgc('/api/'+p);
    //console.log(p+' => '+r);

    return(r);
}

// Asynchronous api call
function aaction(p, s=function(){}, e=function(){}) {
    fgca('/api/'+p, s, e);
}

function get(p, params={}, s=function(){}, e=function(){}) {
    if (!window.navigator.onLine) { // no internet
        console.log("NO INTERNET");
        return;
    }

    var pt="";
    for (var [pk, pv] of Object.entries(params)) {
        if (pt=='') {
            pt="?";
        } else {
            pt+="&";
        }
        pt+=pk+"="+encodeURIComponent(pv);
    }

    fgca('/api/'+p+pt, (r, sc)=> {
        if (sc>=200 && sc<=299) { // success
            s(JSON.parse(r));
        } else {
            e(JSON.parse(r), sc);
        }
    }, (err)=> { // error : maybe no internet
        console.log("error: ",err);
    });
}

function post(p, params={}, s=function(){}, e=function(){}) {
    if (!window.navigator.onLine) { // no internet
        console.log("NO INTERNET");
        return;
    }

    posta(p, params, (r, sc)=>{
        if (sc>=200 && sc<=299) { // success
            s(r);
        } else {
            e(r, sc);
        }
    }, (err)=>{ // error : maybe no internet
        console.log("error: ",err);
    });
}

class Fetch {
    constructor(url, params={}, path=[], method="GET") {
        this.url=url;
        this.method=method;
        this.params=params;
        this.path=path;
    }

    execute(out) {
        if (this.method=="GET") { // GET
            get(this.url, this.params, (r)=>{
                r=r["content"];
                for (var k of this.path) {
                    r=r[k];
                }
                out.value=r;
            }, (r, sc)=>{
                if (sc==401) {
                    window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
                }
                console.log(r, sc);
            });
        } else { // POST
            post(this.url, this.params, (r)=>{
                r=r["content"];
                for (var k of this.path) {
                    r=r[k];
                }
                out.value=r;
            }, (r, sc)=> {
                if (sc==401) {
                    window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
                }
                console.log(r, sc);
            });
        }
    }

    executeThen(out, s=()=>{}, e=()=>{}) {
        if (this.method=="GET") { // GET
            get(this.url, this.params, (r)=>{
                r=r["content"];
                for (var k of this.path) {
                    r=r[k];
                }
                out.value=r;
                s(r);
            }, (r, sc)=>{
                if (sc==401) {
                    window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
                }
                e(r, sc);
            });
        } else { // POST
            post(this.url, this.params, (r)=>{
                r=r["content"];
                for (var k of this.path) {
                    r=r[k];
                }
                out.value=r;
                s(r);
            }, (r, sc)=> {
                if (sc==401) {
                    window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
                }
                e(s, sc);
            });
        }
    }
}



class Ressource {
    constructor(key, fetch, initFetch=false, rltime=60, autorl=null, mapFunction=null, checkPresent=null) {
        this.last_update = null;
        this.fetch=fetch;
        this.key=key;
        this.value=null;
        this.rltime=rltime;
        this.htmlElements={};
        this.autorl = autorl;
        this.checkPresent=checkPresent;
        
        if (this.autorl) {
            setTimeout(()=>{
                this.update();
            }, this.autorl);
        }

        if (initFetch) {
            //console.log("initiating", this.key);
            this.update();
        }
    }

    update() {
        //console.log("update");
        
        this.last_update = Date.now();
        this.fetch.executeThen(this, (r)=>{
            if (this.mapFunction!=null) {
                this.value.map(this.mapFunction);
            }
            if (this.checkPresent!=null) {
                this.checkPresent(r);
            }
        });
    }

    fetchThen(s=()=>{}, e=()=>{}) {
        //console.log("fetchthen");

        this.last_update = Date.now();
        this.fetch.executeThen(this, (r)=>{
            if (this.mapFunction!=null) {
                this.value.map(this.mapFunction);
            }
            if (this.checkPresent!=null) {
                this.checkPresent(this.value);
            }

            s(this.value);
        }, e);
    }

    updateThen(s=()=>{}, e=()=>{}) {
        //console.log("updatethen");

        if ((Date.now() - this.last_update)/1000 > this.rltime) {
            this.fetchThen((r)=>{
                if (this.mapFunction!=null) {
                    this.value.map(this.mapFunction);
                }
                if (this.checkPresent!=null) {
                    this.checkPresent(this.value);
                }
    
                s(this.value);
            }, e);
            console.log("updating");
        } else {
            console.log("uptodate");
            s(this.value);
        }
    }

    get() {
        if ((Date.now() - this.last_update)/1000 > this.rltime) {
            this.update();
        }
        return(this.value);
    }

    isValid() {
        return((Date.now() - this.last_update)/1000 < this.rltime);
    }
}

class MultiTask {
    constructor(params, cb) {
        this.params=params;
        this.values = {};
        this.cb=cb;
    }

    run(param, value) {
        this.params = this.params.filter(e=> e!=param);
        this.values[param]=value;

        if (this.params.length==0) {
            this.cb(this.values);
        }
    }
}

class bondInput {
    constructor(elm, eid, table, field, oninit=()=>{}, onupdt=()=>{}) {
        this.type = elm.tagName;
        if (this.type=="INPUT" && elm.type=="checkbox") {
            this.type="CHECKBOX";
        }
        this.node = elm;
        this.table=table;
        this.field=field;
        this.eid = eid;
        this.prevValue=null;
        this.changeTo=null;

        this.oninit=oninit;
        this.onupdt=onupdt;

        this.initBond();
    }

    initBond() {
        get("getvalue", {
            "id":this.eid,
            "table":this.table,
            "field":this.field
        }, (r)=>{
            this.setValue(r["content"]);
            this.oninit(r["content"]);

            this.node.onchange = (ev)=>{
                this.change(ev);
            };
            this.node.onkeyup = (ev)=>{
                this.change(ev);
            };
            this.node.onkeypress = (ev)=>{
                this.change(ev);
            };
            this.node.oninput = (ev)=>{
                this.change(ev);
            };
        }, (r)=>{
            console.log(r);
        });
    }

    change(ev) {
        var vl = this.getValue();

        if (vl==this.prevValue) { //  || vl===""
            return;
        }
        if (this.changeTo!=null) {
            clearTimeout(this.changeTo);
        }

        this.onupdt(vl);

        this.changeTo = setTimeout(()=>{
            post("setvalue", {
                "id":this.eid,
                "table":this.table,
                "field":this.field,
                "value":vl
            }, (r)=>{
                console.log("value set");
                this.prevValue=vl;
            }, (r)=>{
                console.log("failed to set value");
                this.setValue(this.prevValue);
            });
        }, 200);
    }

    setValue(value) {
        if (this.type=="INPUT") {
            this.node.value=value;
        } else if (this.type=="CHECKBOX") {
            this.node.checked=value;
        } else if (this.type=="TEXTAREA") {
            this.node.value=value;
        }
    }

    getValue() {
        if (this.type=="INPUT") {
            return(this.node.value);
        } else if (this.type=="CHECKBOX") {
            return(this.node.checked);
        } else if (this.type=="TEXTAREA") {
            return(this.node.value);
        }
        return(false);
    }

    set() {

    }
}

// get cookie value
function getcookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// set cookie value
function setcookie(name, value, exmins) {
    const d = new Date();
    d.setTime(d.getTime() + (exmins*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
    //alert(name + "=" + value+' => '+document.cookie);
}

function urlf(t) {
    return(encodeURIComponent(t));
}

function changeTheme(f='') {
    if (f!='dark' && (document.documentElement.getAttribute("data-theme")=="dark" || f=='light')) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');

        if (document.getElementById("cctn")) {
            document.getElementById("cctn").classList.remove("ag-theme-quartz-dark");
        }

        if (document.getElementById("dark_mode")) {
            document.getElementById("dark_mode").classList.add('active');
        }
        if (document.getElementById("light_mode")) {
            document.getElementById("light_mode").classList.remove('active');
        }
    }
    else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');

        if (document.getElementById("cctn")) {
            document.getElementById("cctn").classList.add("ag-theme-quartz-dark");
        }

        if (document.getElementById("dark_mode")) {
            document.getElementById("dark_mode").classList.remove('active');
        }
        if (document.getElementById("light_mode")) {
            document.getElementById("light_mode").classList.add('active');
        }
    }
}

function sortTable(table, columnName, sortFunction, ascending = true) {
    const headers = Array.from(table.querySelectorAll('th'));
    const columnIndex = headers.findIndex(header => (header.getAttribute("data-field")==columnName || header.textContent.trim()===columnName));
    
    if (columnIndex === -1) {
        console.error(`Column "${columnName}" not found.`);
        return;
    }

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();

        const comparison = sortFunction(cellA, cellB);

        return ascending ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));
}

function vtk(tk) {
    get("vtk", {}, (r)=>{
        console.log(r);
    }, (err, sc)=>{
        console.log(sc," error: ",err);
    });
}

function vtki() {
    tk = getcookie("token");

    if (tk=='') {
        if (window.location.pathname!="/login") {
            window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
        }
    }

    get("vtk", {}, (r)=>{
        //console.log("connecté: ", r);
        if (window.location.pathname=="/login") {
            return;
            var red = window.location.hash.split("#red=")[1];
            if (red==null) {
                window.location.href = "/";
            }
            red = red.split(";")[0];
            window.location.href = decodeURIComponent(red);
        }
    }, (err, sc)=>{
        if (window.location.pathname=="/login") {

        } else {
            window.location.href = "/login#red="+urlf(window.location.pathname + window.location.hash);
        }
    });
}

//const modalCloseEvent = new Event('modal_close');
function openModal(mname, init=()=>{}) {
    var md = document.querySelector(`modal.template#${mname}`).cloneNode(true);
    md.classList = "active";
    document.body.appendChild(md);

    init(md);

    document.getElementById("modal_background").classList.add("active");

    modals.set(md, mname);
}

function closeModal(md, ccld=false) {
    var mname = modals.get(md);

    md.remove();

    if (modals.size<=1) {
        document.getElementById("modal_background").classList.remove("active");
    }

    md.dispatchEvent(new CustomEvent("modal_close", {
        detail:{
            cancelled:ccld
        }
    }));

    modals.delete(md);
}

function closeLastModal(ccld=false) {
    closeModal(Array.from(modals.keys()).slice(-1)[0], ccld);
}

function confirma(msg, o=()=>{}, n=()=>{}, cc=()=>{}) {
    openModal("confirm_modal", (md)=>{
        var tt = md.querySelector("h1");
        var [ybt, nbt] = md.querySelectorAll("button");

        tt.innerText = msg;
        ybt.onclick = ()=>{
            o();
            closeModal(md);
        };
        nbt.onclick = ()=>{
            n();
            closeModal(md);
        };

        /*if (getEventListeners(md)["modal_close"]) {
            getEventListeners(md)["modal_close"].forEach((e)=>{
                md.removeEventListener("confirm_modal", e);
            });
        }*/
        
        md.addEventListener("modal_close", (e)=>{
            if (e.detail.cancelled) {
                cc();
            }
        });
    });
}

function dateOfTime(h) {
    if (h==null) {
        return(null);
    }
    var dt = new Date(`1970-01-01T${h}Z`);

    return(dt);
}

function getTimeOfMs(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    ms %= (1000 * 60 * 60);
    const minutes = Math.floor(ms / (1000 * 60));
    ms %= (1000 * 60);
    const seconds = Math.floor(ms / 1000);

    return([hours, minutes, seconds]);
}

function formatHMS(hours,minutes,seconds) {
    var tms = "";
    if (hours>0) {
        tms=`${hours}h`;
        if (minutes>0) {
            tms+=`${minutes}m`;
        }
    } else {
        tms=`${minutes}min`
    }
    return(tms);
}

function durationOfInterval(t1, t2) {
    var start = dateOfTime(t1);
    var end = dateOfTime(t2);

    if (start==null || end==null) {
        return("");
    }

    var msDiff = Math.abs(start-end);

    var [h,m,s] = getTimeOfMs(msDiff);
    return(formatHMS(h,m,s));
}

function currentTime() {
    var tm = new Date();
    return(tm.getHours()+":"+tm.getMinutes());
}

function setCardContent(card, title=null, body=null) {
    if (title!=null) {
        card.querySelector("h1").innerHTML = title;
    }
    if (body!=null) {
        card.querySelector(".value").innerHTML = body;
    }
}

window.addEventListener("load", ()=>{
    if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem("theme")==null) || localStorage.getItem('theme')=="dark") {
        changeTheme('dark');
    }

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    vtki();
});

window.onclick = function(e){
    
}

if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem("theme")==null) || localStorage.getItem('theme')=="dark") {
    changeTheme('dark');
}