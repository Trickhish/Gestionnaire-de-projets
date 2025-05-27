function activate(sel) {
    var e = document.querySelector(sel);
    if (e) {
        e.classList.add("active");
    } else {
        setTimeout(()=>{
            activate(sel);
        }, 500);
    }
}

function deactivate(sel) {
    console.log("DEACTIVATE");
    var e = document.querySelector(sel);
    if (e) {
        e.classList.remove("active");
    } else {
        setTimeout(()=>{
            deactivate(sel);
        }, 500);
    }
}

function parentDnDM(e, l) {
    if (e==null) {
        return(false);
    }

    if (l.some((cl)=> e.classList.contains(cl))) {
        return(true);
    } else {
        return(parentDnDM(e.parentElement, l));
    }
}
function getAllDnDM(e) {
    if (e==null) {
        return([]);
    } else {
        var dndm = e.getAttribute("data-dndm");
        if (dndm==null) {
            dndm=[];
        } else {
            dndm=dndm.split("/");
        }
        return(dndm.concat(getAllDnDM(e.parentElement)));
    }
}

function getDismissible() {
    return(Array.from(document.querySelectorAll(".dismissible.active")));
}

window.onclick = function(e){
    var tg = e.target;
    var wtl = getAllDnDM(tg);

    // document.getElementsByClassName("dismissible")
    Array.from(document.querySelectorAll(".dismissible.active")).forEach((el)=>{
        if (!wtl.some((sel) => Array.from(document.querySelectorAll(sel)).includes(el))) { // el.classList.contains(cl)
            //console.log("wtl:", wtl);
            var name = el.tagName + (el.id=="" ? (el.classList.length > 0 ? Array.from(el.classList).slice(0, 2).map(e=>`.${e}`).join("") : "") : "#" + el.id);
            console.log(`${name} Dismissed`);

            triggerEvent(el, "dismissed");
            if (el.classList.contains("delete")) {
                el.remove();
                //enableScroll();
            } else {
                el.classList.remove("active");
            }
        }
    });
}