Vue.component('todo-item', {
    props: ['item', 'index', 'hide'],
    template: '#todo-template',
    watch: {
        completed: function(){
            app.setTodos();
        }
    },
    methods: {
        deleteTodo() {
            let self = this;
            let i = app.todos.map(item => item.text).indexOf(self.item.text)
            app.todos.splice(i,1);
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        hasKey: false,
        globalKey: localStorage.getItem("globalKey") == "null" ? null: localStorage.getItem("globalKey"),
        todos: [],
        input_todo: "",
        hide_completed: false
    },
    watch:{
        todos: function(){
            this.setTodos();
        },
        globalKey: function(){
            localStorage.setItem("globalKey", this.globalKey);
            if(this.globalKey == null) return;
            this.globalKey = this.globalKey.replace(' ', '_').trim();
        }
    },
    methods: {
        getTodos: function(){
            let self = this;
            if(!self.hasKey) return;
            if(self.globalKey == null || self.globalKey == "null") return;
            console.log("KEY: " + self.globalKey)
            get(self.globalKey + "_invoice_todo", (val) => {
                console.log("GET: ", val)
                if(val == null){
                    self.todos = [];
                    self.setTodos();
                    return;
                }
                self.todos = val;
                return;
            })
            return;
        },
        setTodos: function(){
            let self = this;
            if(!self.hasKey) return;
            if(self.globalKey == null) return;
            set(app.globalKey + "_invoice_todo", self.todos, (res) => {
                console.log("SET: ", res)
            })
        },
        createNewTodo: function(e){
            e.preventDefault();
            let self = this;
            if(!self.hasKey) return;
            if(self.globalKey == null) return;
            self.todos.push({text: self.input_todo});
            self.setTodos();
            self.input_todo = "";
        },
        setKey: function(e){
            e.preventDefault();
            this.hasKey = true;
            app.getTodos();
        },
        unsetKey: function(){
            this.hasKey = false;
            this.globalKey = null;
            app.getTodos();
        }
    }
})

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

app.hasKey = (app.globalKey == null || app.globalKey == "null") ? false : true;
app.getTodos();

// setInterval(function(){
//     if(app.hasKey){
//         app.getTodos();
//     }
// }, 1000)