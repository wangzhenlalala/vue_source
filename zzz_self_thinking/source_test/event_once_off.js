
var Global_Events = false;
var Global_CallHook = true;

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
</div>
`;
let subA = Vue.extend({
    watch: {
        name: function(newValue){
            console.log(newValue)
        }
    },
    created: function(){
        console.log('createdAAA')
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
                        }
                }
        },
        watch: {
                "children.toys.tname": function(newVal){
                        console.log(newVal);
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
