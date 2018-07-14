var app;
Vue.component('project', {
    props: ['project', 'index', 'hide'],
    template: '#project-template',
    methods: {
        editProject(){
            let self = this;
            // let dialog_content = document.querySelector("#dialog_content");
            // dialog_content.innerHTML = self.project.name;
            app.current_project = self.project;
            toggleDialog();
        }
    }
})

Vue.component('editor', {
    props: ['project'],
    template: '#editor-template',
    methods: {
        save() {
            app.setProjects();
            toggleDialog();
        },
        deleteProject(){
            let ok = confirm("Are you sure you want to delete this project? This cannot be undone.");
            let self = this;
            let copy = JSON.parse(JSON.stringify(app.projects));
            let index = copy.map(p => {
                return p.date == self.project.date;
            })
            if(ok){
                app.projects.splice(index, 1); toggleDialog();
            } else return;
        }
    }
})

function toggleDialog(){
    let dialog = document.querySelector('#dialog');
    let dialog_content = document.querySelector('#dialog_content');
    let show = dialog.style.display == "none" ? "flex" : "none";
    dialog.style.display = show;
}

function get(key, cb){
    let url = "https://sleepless.com/api/v1/freekey/";
    fetch(url + "?action=get&key="+key)
    .then(res => res.json())
    .then(json => {
        if(!json.error)
            cb(JSON.parse(json.value));
        else
            console.log(json.error)
    });
}

function set(key, value, cb){
    console.log("SET: ", key + " val: ", value);
    let url = "https://sleepless.com/api/v1/freekey/";
    fetch(url + "?action=put&key=" + key + "&value="+ JSON.stringify(value))
    .then(res => res.json())
    .then(json => {
        cb(json);
    });
}

document.addEventListener("DOMContentLoaded", function(){
    let d = new Date();
    app = new Vue({
        el: '#app',
        data: {
            hasKey: false,
            globalKey: localStorage.getItem("globalKey") == "null" ? null: localStorage.getItem("globalKey"),
            projects: [],
            task_name: "",
            current_project: null,
            today: d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear()
        },
        watch:{
            projects: function(){
                this.setProjects();
            },
            globalKey: function(){
                localStorage.setItem("globalKey", this.globalKey);
                if(this.globalKey == null) return;
                this.globalKey = this.globalKey.replace(' ', '_').trim();
            }
        },
        methods: {
            getProjects: function(){
                let self = this;
                if(!self.hasKey) return;
                if(self.globalKey == null || self.globalKey == "null") return;
                console.log("KEY: " + self.globalKey)
                get(self.globalKey + "_reslip_projects", (val) => {
                    console.log("GET: ", val)
                    if(val == null){
                        self.projects = [];
                        self.setProjects();
                        return;
                    }
                    self.projects = val;
                    return;
                })
                return;
            },
            setProjects: function(){
                let self = this;
                if(!self.hasKey) return;
                if(self.globalKey == null) return;
                set(app.globalKey + "_reslip_projects", self.projects, (res) => {
                    console.log("SET: ", res)
                })
            },
            createNewProject: function(e){
                e.preventDefault();
                let self = this;
                if(!self.hasKey) return;
                if(self.globalKey == null) return;
                self.projects.push({name: self.task_name, description: "", date: new Date().toLocaleString()});
                self.setProjects();
                self.task_name = "";
            },
            setKey: function(e){
                e.preventDefault();
                this.hasKey = true;
                app.getProjects();
            },
            unsetKey: function(){
                this.hasKey = false;
                this.globalKey = null;
                app.getProjects();
            }
        }
    })

    app.hasKey = (app.globalKey == null || app.globalKey == "null") ? false : true;
    app.getProjects();
})