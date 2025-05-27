var mediasR=null;

function uploadFiles(files) {
    files.forEach(file => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        setProgress(file.name, 0);

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                //progressBar.value = percent;
                setProgress(file.name, percent);
                console.log(`Upload progress: ${percent.toFixed(2)}%`);
            }
        });

        xhr.onerror = function () {
            console.error("Upload failed:", xhr.statusText);
            setProgress(file.name, 100, "Error: " + xhr.statusText);
            setTimeout(() => setProgress(file.name, -1), 3000);
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const res = JSON.parse(xhr.responseText);
                    if (res.success) {
                        console.log("Uploaded:", res);
                    } else {
                        console.error("Upload failed:", res.error);
                    }
                    mediasR.update();
                } else {
                    console.error("HTTP error:", xhr);
                    var r = JSON.parse(xhr.responseText);
                    console.log(r);
                    setProgress(file.name, 100, "Error: " + r["error_message"]);
                }
                // Remove progress bar after upload completes
                setTimeout(() => setProgress(file.name, -1), 3000);
            }
        };

        xhr.open("POST", "/api/media_upload");
        xhr.send(formData);
    });
}

function setProgress(fid, pct=0, msg="") {
    var pgctn = document.querySelector("section#medias #upload_progress_ctn");
    var pg = pgctn.querySelector(".upload_progress[data-fid='"+fid+"']");

    if (pct==-1 && pg) {
        if (pgctn.children.length <= 1) {
            pgctn.classList.remove("active");
        }
        pg.remove();
        return;
    }

    pgctn.classList.add("active");

    pct = Math.round(pct);

    if (!pg) {
        pg = document.createElement("div");
        pg.classList.add("upload_progress");
        pg.setAttribute("data-fid", fid);
        pg.innerHTML = `<h2>${fid} ${msg}</h2>
            <div class="upload_progress_bar_ctn">
                <div class="upload_progress_bar"></div>
                <p class="upload_progress_text">50%</p>
            </div>`;
        pgctn.appendChild(pg);
    }

    pg.style.setProperty("--pct", `${pct}%`);
    var pgt = pg.querySelector(".upload_progress_text");
    pgt.innerText = `${pct}%`;
}

function medias_load(params) {
    var ctn = document.querySelector("section#medias");
    var fslt = document.querySelector("section#medias #media_input");



    if (mediasR==null) {
        // file_id,name,type,upload_date
        
        mediasR = new Ressource("medias", new Fetch("medias", {}, ["medias"], "GET"), true, 30, null, (e)=>{
            return(e);
        }, (r)=>{ // checkpresent
            var mctn = document.querySelector("section#medias #medias_ctn");
            removeAllChildren(mctn);

            for (let m of r) {                
                var me = document.createElement("div");
                me.className = "media";
                me.innerHTML = `
                    <i class="delmedia fa-solid fa-trash-can"></i>
                    <img src="/api/media?id=${m.file_id}" />
                    <p>${m.name}</p>
                `;
                mctn.appendChild(me);

                var delbtn = me.querySelector(".delmedia");
                delbtn.addEventListener("click", (ev)=>{
                    ev.stopPropagation();

                    confirma(`Voulez-vous vraiment supprimer '${m.name}' ?`, ()=>{
                        fetch(`/api/delmedia?id=${m.file_id}`, {method:"POST"})
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                console.log("Media deleted:", data);
                                mediasR.update();
                            } else {
                                console.error("Delete failed:", data.error);
                            }
                        })
                        .catch(err => console.error("Error deleting media:", err));
                    });
                });
            }
        });
    } else {
        mediasR.update();
    }



    fslt.addEventListener("change", (ev)=>{
        console.log("file selected");

        let files = [...fslt.files];

        uploadFiles(files);

        fslt.value = "";
    });

    ctn.addEventListener("drop", (ev)=>{
        console.log("droped");

        ev.preventDefault();

        let files = [];

        if (ev.dataTransfer.items) {
            for (let item of ev.dataTransfer.items) {
                if (item.kind === "file") {
                    files.push(item.getAsFile());
                }
            }
        } else {
            files = [...ev.dataTransfer.files];
        }

        uploadFiles(files);

        /*files.forEach(file => {
            const formData = new FormData();
            formData.append("file", file);

            fetch("/api/media_upload", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Uploaded:", data);
                } else {
                    console.error("Upload failed:", data.error);
                }
            })
            .catch(err => console.error("Error uploading:", err));
        });*/

    });

    ctn.addEventListener("dragover", (ev)=>{
        console.log("dragover");

        ctn.classList.add("drag-over");
        ev.preventDefault();
    });

    ctn.addEventListener("dragleave", () => {
        ctn.classList.remove("drag-over");
    });
}


function addmedia() {
    var fslt = document.querySelector("section#medias #media_input");
    fslt.click();
}