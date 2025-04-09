window.addEventListener("load", (lev)=>{
    var ssl = document.getElementsByClassName("searchable_select");
    Array.from(ssl).forEach((e)=>{
        var bt = e.querySelector(".ss_btn");
        //console.log(e, bt);

        bt.addEventListener("click", (ev)=>{
            e.classList.toggle("active");
        });
    });
});