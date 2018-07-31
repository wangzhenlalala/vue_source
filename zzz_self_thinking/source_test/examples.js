let VueOptions = {
    name: 'Vue',
    components: [ 'Keep-Alive' ],
    props: {},
    data: {}
};

let mixin_A = {
    props: {
        old: 34
    },
    methods: {
        play(){
            console.log('i can play');
        }
    },
    created(){
        console.log('born');
    }
};

let extendsA = {
    created(){
        console.log('Extended created');
    },
    props: {
        old: 55
    }
}
let  extendOptions_Sub_A = {
    data(){
        return {
            name: 'Kobe',
            number: 24
        }
    },
    props: {
        team: 'Laker'
    },
    mixins: [mixin_A],
    extends: extendsA
}


let sub_A = Vue.extend(extendOptions_Sub_A);


// new Vue({
//     data: {
//         name: 'kobe'
//     }
// })