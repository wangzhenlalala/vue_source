
var Global_Events = false;
var Global_CallHook = false;

let callbacks = [];
function cb1(index){
    console.log('cb111');
};

function cb2(index){
    console.log('cb222');
};

function cb3(index){
    // callbacks.splice(index, 1);
    console.log('cb333');
};

function cb4(index){
    console.log('cb444');
};

function cb5(index){
    console.log('cb555');
};

callbacks = callbacks.concat(cb1, cb2, cb3, cb4, cb5);


// for(let i=0, l=callbacks.length; i<l; i++){
//     callbacks[i].call(undefined, i);
// }
// Cannot read property 'call' of undefined !!!!!!


var template = `
 <div>
        <div style="clolr:red">{{name}}</div>
        <div>{{age}}</div>
        <div>{{name}}</div>
        <button @click="mutateName">mutate Name</button>
        <button @click="mutateAge">mutate Age</button>
        <p>
                <h1>heee</h1>
                <span>hehl</span>
                <h1>wangzhen</h1>
                <span>worlde</span>
        </p>
        <p>
                <span>jkk</span>
        </p>
</div>
`;
let subA = Vue.extend({
    watch: {
        name: {
                handler: function(newValue){
                        console.log(newValue)
                },
                immediate: false
        },
        age: {
                handler: function(newValue,oldValue){
                        console.log(newValue, 'age');
                },
                
                immediate: true  // immdiate 的意思 不是 “每当watch的变化发生后，不把他放入scheduler的队列当中，而立即执行该subscriber函数”
                                 // 而是只在组件第一次渲染的时候，就立即执行watch对应的subscriber函数，
                                 // 如果为false，则在第一次渲染的时候，是不执行watch对应的subscriber函数的
                                 // the callback will be called immediately after the start of the observation
        }
    },
    created: function(){
        console.log('createdAAA')
    },
    methods: {
            mutateName: function(){
                    this.name = 'fanghua';
                    console.log(this.name, 'in MutateName');
            },
            mutateAge: function(){
                    this.age = 26;
                    console.log(this.age, 'in MutateAge')
            }
    }
})
var app = new subA({
        el: '#app',
        template: template,
        data() {
                return {
                        name: 'wangzhen',
                        age: 25,
                        children: {
                                name: 'child',
                                age: 8,
                                toys: {
                                        tname: 'dinosour'
                                }
                        },
                        deepThing: {
                                
                                first: {
                                        second: {
                                                name: 'deepThing'
                                        },
                                        third: 'hello'
                                }
                        }
                }
        },
        watch: {
                "children.toys.tname": function(newVal){
                        console.log(newVal);
                },
                deepThing: {
                        deep: true,
                        handler: function(newVal, oldVal){
                                console.log('in deep thing');
                        }
                }

        }
});

app.$on('topicA',cb1);
app.$once('topicA',cb3);
app.$on('topicA', cb4);


var child = new subA({
    el: '#child',
    template: template,
    data() {
            return {
                    name: 'wangzhen',
                    age: 25,
                    children: {
                            name: 'child',
                            age: 8,
                            toys: {
                                    tname: 'dinosour'
                            }
                    }
            }
    },
    watch: {
            "children.toys.tname": function(newVal){
                    console.log(newVal);
            }
    }
});
