var mouse_pos = [0,0];

function bt(t, cs='cm_bt', oc=function(){}) {
    var ce = document.createElement('button');
    ce.className=cs;
    ce.innerHTML=t;
    ce.onclick=oc;
    return(ce);
}

function rcMenu(bl, rpl=null) {
    if (rpl!=null) {
        var ce = rpl;
        removeAllChildren(ce);
        ce.classList.add('active');
    } else {
        var ce = document.createElement('div');
        ce.className='rcmenu dismissible active delete';
        ce.style.left=mouse_pos[0]+'px';
        ce.style.top=mouse_pos[1]+'px';

        if (mouse_pos[0] > window.innerWidth/2) {
            ce.classList.add("left");
        }
        if (mouse_pos[1] > window.innerHeight/2) {
            ce.classList.add("up");
        }
    }

    for(let b in bl) {
        if (b==null) {
            continue
        }

        if (typeof bl[b] == "object") {
            var se = document.createElement('button');
            se.className="cm_bt cm_bt_sub";
            se.innerHTML=b;
            se.onclick=()=>{
                console.log(b);
                rcMenu(bl[b], ce);
            };
            se.setAttribute("data-dndm", ".rcmenu");
            ce.appendChild(se);
        } else {
            var bte = bt(b, 'cm_bt', bl[b]);
            //bte.setAttribute("data-dndm", ".rcmenu");
            ce.appendChild(bte);
        }
    }

    return(ce);
}

function openRcMenu(bl) {
    Array.from(document.getElementsByClassName('rcmenu')).forEach(function(e){e.remove();});

    if (Object.keys(bl).length==0) {
        return;
    }

    var ce = rcMenu(bl);
    document.body.appendChild(ce);
    disableScroll();
}



function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
        preventDefault(e);
        return false;
    }
}

var supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
    }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}


window.onmousemove=function(e){mouse_pos=[e.clientX,e.clientY+window.scrollY];};

