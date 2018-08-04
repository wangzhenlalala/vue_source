//for Vue
1.
    Vue.options = {
        components: {
            "Keep-Alive": null,
        },
        directives: {
            model: {},
            show: {}
        },
        _base: fVue,
    }


let subA = null;

subA.extendOptions = {
    created: function created_A(){},
    methods: {
        m1(){}
    }
};

subA.options = {
    components: {
        __proto__: {
            KeepAlive: null,
            Transition: null,
            TransitionGroup: null
        }
    },
    created: [created_A],
    directives: {
        __proto__: {
            model: {},
            show: {}
        }
    },
    filters: {

    },
    methods: {
        m1: function(){}
    },
    _Ctor: {0: fVue},
    _base: fVue
}

subA.sealedOptons = {
    
}