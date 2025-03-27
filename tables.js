var tables = {};

class Table {
    constructor(name, headers=null, data=null) {
        this.name = name;
        this.data = data;
        this.headers=headers;
        this.element=null;

        if (tables[name]) {
            return(tables[name]);
        }
        tables[name]=this;
    }

    fillTable(headers=null, data=null) {
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
        while (tr.firstChild) {
            tr.lastChild.remove();
        }
        for (let [hd, hdd] of this.headers) {
            var th = document.createElement("th");
            th.className = "filter";
            th.setAttribute("data-field", hd);
            th.innerText = hdd;
            tr.appendChild(th);
        }

        console.log(this.data);

        var tbd = this.element.querySelector("tbody");
        while (tbd.firstChild) {
            tbd.lastChild.remove();
        }
        if (Array.isArray(this.data[0])) { // list
            for (let dt of this.data) {
                var tr = document.createElement("tr");
    
                var i=0;
                for (let v of dt) {
                    var td = document.createElement("td");
                    td.className = this.name+"_"+this.headers[i][0];
                    td.innerHTML = v;
    
                    tr.appendChild(td);
                    i+=1;
                }
                tbd.appendChild(tr);
            }
        } else { // dictionnary
            for (let dt of this.data) {
                var tr = document.createElement("tr");
    
                for (let [hd, hdd] of this.headers) {
                    if (dt[hd]) {
                        var td = document.createElement("td");
                        td.className = this.name+"_"+hd;
                        td.innerHTML = dt[hd];
    
                        tr.appendChild(td);
                    }
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
        table.id  = this.name+"_ctn"

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