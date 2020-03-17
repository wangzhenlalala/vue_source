let tmp = `
    <div>
        <p>name: {{name}}</p>
        <p>age: {{age}}</p>
        <button @click="changeName">change name</button>
    </div>
`
let vm = new Vue({
    el: "#watcher_callback",
    template: tmp,
    data: {
        name: "wanzhen",
        age: 20
    },
    beforeUpdate() {
        console.log('before update');
    },
    methods: {
        changeName: function() {
            this.name = "fanghua";
        }
    },
    watch: {
        name: function(newV, oldV) {
            this.age = 30;
        },
        age: function(newV, oldV) {
            console.log('this age');
        }
    } 

})
/**
 * vm实例下一共有3个Watcher实例，分别对应
 *  1. name watcher id = 1
 *  2. age watcher id = 2
 *  3. vm._update watcher id = 3
 *  name的callback当中会使得，age的watcher加入到 schedule queue当中， 
 *  而且被插入到了_update watcher之前
 *  这样可以使得所有的callback中对状态的修改，都可以在更新组件之前完成。
 */