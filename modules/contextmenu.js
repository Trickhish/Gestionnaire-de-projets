var mouse_pos = [0,0];


function rcMenu(bl) {
    Array.from(document.getElementsByClassName('rcmenu')).forEach(function(e){e.remove();});

    var ce = document.createElement('div');
    ce.className='rcmenu';
    ce.style.left=mouse_pos[0]+'px';
    ce.style.top=(mouse_pos[1])+'px';

    if (mouse_pos[0] > window.innerWidth/2) {
        ce.classList.add("left");
    }
    if (mouse_pos[1] > window.innerHeight/2) {
        ce.classList.add("up");
    }

    for(var b in bl) {
        if (b!=null) {
            ce.appendChild(bt(b, 'nbt mnbt', bl[b]));
        }
    }

    return(ce);
}


window.onmousemove=function(e){mouse_pos=[e.clientX,e.clientY+window.scrollY];};

