
var Global_Options = false;

// let VueOptions = {
//     name: 'Vue',
//     components: [ 'Keep-Alive' ],
//     props: {},
//     data: {}
// };

// let mixin_A = {
//     props: {
//         old: 34
//     },
//     methods: {
//         play(){
//             console.log('i can play');
//         }
//     },
//     created(){
//         console.log('born');
//     }
// };

// let extendsA = {
//     created(){
//         console.log('Extended created');
//     },
//     props: {
//         old: 55
//     }
// }
// let  extendOptions_Sub_A = {
//     data(){
//         return {
//             name: 'Kobe',
//             number: 24
//         }
//     },
//     props: {
//         team: 'Laker'
//     },
//     mixins: [mixin_A],
//     extends: extendsA
// }

// let sub_A = Vue.extend(extendOptions_Sub_A);


// new Vue({
//     data: {
//         name: 'kobe'
//     }
// })




// _init中的 resolveConstructorOptions是如何工作的？  
// 为什么ctor.options会被更改？？？ 
// 如果想里面添加/删除属性，会引起他的变化吗？？？
// 如果ctor.options变化了，对子类有什么样的影响 ？？？？？我们要怎么做？？？？
let extend_A = {
    created: function created_A(){},
    methods: {
        m1(){}
    }
};

let subA = Vue.extend(extend_A);


//更改了父类的options
Vue.options = Object.assign(
    {},
    Vue.options,
    {
        // created: function created_Vue(){},
        who: 'vue'
    }
);

let extend_B = {
    you: 'B'
};

let subB = subA.extend(extend_B);


/**
 * 在实例化子类之前，父类的options可能已经被更改了，
 * 而且 子类自己的options可能也已经被修改了
 * 所以在
 *  resolveModifiedOptions(Ctor)中 执行的是对比当前子类的options 和 sealedOptions ，确定是否被修改，并找出差异
 *  因为我们最终会 mergeOptions(parentOptions, extendOptins),来生成子类自己的options，所以在执行该步骤之前，
 *  将上一步的结果modifiedOptions，合并到子类的extendOptions中去，extend(extendOptions, modifedOptions);
 *  然后在执行mergeOptions 重新生成子类的options
 * 
 *  当类的继承链上的 某一个类的options被用户【手动】的改变了，逻辑上来讲，该类下游的所有子类也应该随之改变。
 *  所以下游子类的 superOptions !== cachedSuperOptions 就成立，从而为该子类生成一个新的options
 * 
 */
let ins_subB = new subB({
    el: '#app',
    template: `<div>hello world</div>`
});