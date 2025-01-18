


function login() {
    var user = document.getElementById("user").value;
    var pass = document.getElementById("pass").value;

    console.log(user, pass);

    if (user=='' || pass=='') {
        err("Tous les champs doivent être remplis", "info");
    }

    get("login", {"user":user, "pass":pass}, (r)=>{
        tk = r["content"]["token"];

        setcookie("token", tk, 5*60);

        var red = window.location.hash.split("#red=")[1].split(";")[0];
        window.location.href = decodeURIComponent(red);
    }, (r)=>{
        console.log(r);
        err(r["error_message"], "info");
    });
}

function resetErr() {
    document.getElementById("err").innerHTML = "";
    document.getElementById("err").classList.remove("active");
}

function err(msg, type="info") {
    var icon="fa-solid fa-exclamation";

    switch (type) {
        case "error":
            icon="error fa-solid fa-circle-exclamation";
            break;
        case "warning":
            icon="warning fa-solid fa-triangle-exclamation";
            break;
        default:
            icon="info fa-solid fa-exclamation"
    }

    document.getElementById("err").innerHTML = '<i class="'+icon+'"></i> '+msg;
    document.getElementById("err").classList.add("active");
}

function showPass() {
    if (document.getElementById("pass").getAttribute("type")=="password") {
        document.getElementById("pass").setAttribute("type", "text");

        document.getElementById("pass_eye").classList.add("fa-eye-slash");
        document.getElementById("pass_eye").classList.remove("fa-eye");
    } else {
        document.getElementById("pass").setAttribute("type", "password");

        document.getElementById("pass_eye").classList.remove("fa-eye-slash");
        document.getElementById("pass_eye").classList.add("fa-eye");
    }
}

window.addEventListener("keydown", (e)=>{
    var key = e.key;
    var kcode = e.keyCode;
    
    if (key=="Enter") {
        document.getElementById("valbt").click();
    }
});

window.addEventListener("load", (e)=>{
    document.getElementById('login_form').addEventListener('submit', function(event) {
        event.preventDefault();
        login();
    });
});

