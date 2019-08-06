let child_vue = Vue.extend({
    template: `
        <div class="mount">
            <p>{{name}}</p>
            <div>
                <span>{{age}}</span>
            </div>
        </div>
    `,
    data(){
        return {
            name: 'name',
            age: 27
        }
    },
    beforeCreate(){
        console.log('before create');
    },
    created(){
        console.log("created");
    },
    beforeMount(){
        console.log('before mount');
    },
    mounted(){
        console.log('mounted');
    },
    beforeUpdate(){
        console.log('before update');
    },
    updated(){
        console.log('updated');
    },
    beforeDestroy(){
        console.log('before destroy');
    },
    destroyed(){
        console.log('destroyed');
    },
    watch: {
        name: function(){
            console.log("watch")
        }
    }
});
let vm = new child_vue();

// vm.$mount();
vm.$watch('age', function watchAge(newValue){
    console.log(newValue);
})

// document.querySelector('#mount').appendChild(vm.$el);
// console.log(vm);

// 我只是想看看，如果，没有经过 $mount 的步骤，会有update，destroy的事件发生吗？？
// 只要调用了vm.$mount就会出发 beforeMount, mounted事件，不管$el时候被插入了 document中，，仅仅是从template -> off-document dom
// update 是数据变化后，更新dom后出发。如果没有mounted，就不会出发update事件
// $destroy 就会触发 destroy 回调