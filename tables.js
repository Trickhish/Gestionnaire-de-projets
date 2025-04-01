var tables = {};

class Table {
    constructor(name, headers=null, data=null, rowClick=()=>{}) {
        this.name = name;
        this.data = data;
        this.headers=headers;
        this.element=null;
        this.rowClick=rowClick;

        if (tables[name]) {
            return(tables[name]);
        }
        tables[name]=this;

        console.log(`New table '${name}'`);
    }

    static fromName(name, headers=null, data=null, rowClick=()=>{}) {
        if (tables[name]) {
            if (headers!=null) {
                tables[name].headers=headers;
            }
            if (data!=null) {
                tables[name].data=data;
            }
            return(tbl);
        }
        return(new Table(name, headers, data, rowClick));
    }

    static exists(name) {
        for (let tbl of tables) {
            if (tbl.name==name) {
                return(true);
            }
        }
        return(false);
    }

    place(parent, headers=null, data=null) {
        if (this.element==null) {
            parent.appendChild(this.buildTable(headers, data));
        } else {
            this.fillTable(headers, data);
        }
    }

    fillTable(headers=null, data=null, ) {
        if (data!=null) {
            this.data=data;
        }
        if (headers!=null) {
            this.headers=headers;
        }
        if (this.headers==null || this.data==null) {
            return;
        }

        var tr = this.element.querySelector("thead tr");
        while (tr.firstChild) { // Deleting all header elements
            tr.lastChild.remove();
        }
        var header_types = {};
        for (let [hd, hdd, type] of this.headers) {
            var th = document.createElement("th");
            th.className = "filter";
            th.setAttribute("data-field", hd);
            th.innerText = hdd;
            tr.appendChild(th);

            header_types[hd]=type;
        }
        //console.log(header_types);

        var tbd = this.element.querySelector("tbody");
        while (tbd.firstChild) {
            tbd.lastChild.remove();
        }
        console.log("data: ",this.data);

        if (Array.isArray(this.data[0])) { // list
            //console.log("Table data is list");

            for (let dt of this.data) {
                var tr = document.createElement("tr");
                tr.addEventListener("click", ()=>{
                    //console.log(`${dt["id"]} clicked`);
                    this.rowClick(dt);
                });

                var i=0;
                for (let v of dt) {
                    //console.log("type: ",Object.values(header_types)[i]);

                    //var type=Object.values(header_types)[i];
                    var [type, vars, fct] = this.headers[i];
                    if (type=="bool") {
                        console.log(`${v} is bool`);
                        //v=(v==0 ? '❌' : '✅');
                        v=(v==0 ? `<i class="table_icon bad fa-solid fa-square-xmark"></i>` : `<i class="table_icon good fa-solid fa-circle-check"></i>`);
                    } else if (type=="custom") {
                        v=fct(v);
                    }
                    
                    var td = document.createElement("td");
                    td.className = this.name+"_"+this.headers[i][0];
                    td.innerHTML = v;
    
                    tr.appendChild(td);
                    i+=1;
                }
                tbd.appendChild(tr);
            }
        } else { // dictionnary
            //console.log("Table data is dictionnary");

            for (let dt of this.data) {
                var tr = document.createElement("tr");
                tr.addEventListener("click", ()=>{
                    //console.log(`${dt["id"]} clicked`);
                    this.rowClick(dt);
                });
                //console.log(dt);
    
                for (let [hd, hdd, type, vars, fct] of this.headers) { // [key, dispName]
                    var td = document.createElement("td");
                    td.className = this.name+"_"+hd;
                    
                    if (hd in dt) {
                        var v = dt[hd];

                        //console.log("type: ", type);

                        if (type=="bool") {
                            //v=(v==0 ? '❌' : '✅');
                            v=(v==0 ? `<i class="table_icon bad fa-solid fa-square-xmark"></i>` : `<i class="table_icon good fa-solid fa-circle-check"></i>`);
                        } else if (type=="custom") {
                            var pms={};
                            for (var vn of vars) {
                                pms[]
                            }
                            v=fct(pms);
                        }
                        td.innerHTML = v;
                    } else {
                        //console.log(`Didn't find ${hd}`);
                    }
                    tr.appendChild(td);
                }
                tbd.appendChild(tr);
            }
        }
    }

    buildTable(headers=null, data=null) {
        if (data!=null) {
            this.data=data;
        }
        if (headers!=null) {
            this.headers=headers;
        }

        var table = document.createElement("table");
        table.className="table";
        table.id  = this.name+"_table"

        var thead = document.createElement("thead");
        let tr = document.createElement("tr");
        tr.id = this.name+"_filters";
        tr.className="table_filters";
        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        table.appendChild(tbody);

        this.element=table;
        this.fillTable();

        return(table);
    }

}