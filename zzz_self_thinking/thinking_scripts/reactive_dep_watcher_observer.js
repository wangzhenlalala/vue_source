import { setServers } from "dns";
import { parsePath, handleError, def } from "../../src/core/util";
import config from "../../src/core/config";
import { queueWatcher } from "../../src/core/observer/scheduler";

let config = {
    errorHandler: function(err, vm ,info){
        console.log(err,info);
    }
}
/**
 * 自己定义的vue的data
 */
let data = {
    name: 'wang',
    age: 24,
    children: {
        son: 'hechen',
        daughter: 'woruo'
    }
};

/**
 * 自己定义的Vue实例
 */
let viewModel = {
    data(){
        return data;
    }
}


function initState(vm){
    //vm: Component
    initData(vm);
};

function proxy(obj, sourceKey, key){
    //key 被闭包保存了
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        set(newVal){
            this[sourceKey][key] = newVal;
        },
        get(){
            return this[sourceKey][key];
        }
    })
};

function initData(vm){
    //vm: Component
    //make data to be an object
    let data = vm.data;
    data = vm._data = typeof data === 'function' 
        ? data()
        : data || {} ;

    const keys = Object.keys(data);
    let i = keys.length;
    //这里还要检查 data中的key不和  props 中的key冲突，同时也不是vue保留名字
    while(i--){
        //将data中的属性代理到 vm实例上
        proxy(vm, '_data', keys[i]);
    }

    //开始监听data

    observe(data, true);
};

function hasOwn(obj, key){
    return Object.prototype.hasOwnProperty.call(obj,key);
}

function isObject(obj){
    return obj !== null && typeof obj === 'object';
};

function isPlainObject(obj){
    return Object.prototype.toString.call(obj) === "[object Object]"
}
function isServerRendering(){
    return false;
}
function isExtensible(obj){
    return Object.isExtensible(obj)
}

function def(obj,key,val,enumerable){
    Object.defineProperty(obj, key, {
        value: val,
        writable: true,
        enumerable: !!enumerable,
        configurable: true
    })

}
/**
 * Attempt to create an observer instance for a [[[[[[[ value ]]]]]]](not for key),
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe(value, asRootData){
    // value： any ， asRootData: ?boolean;

    //value如果不是 object || array, 干函数就直接返回 undefined;
    if(!isPlainObject(value)) return ;

    let ob;
    // let ob: Observer | void;
    if( hasOwn(value, '__ob__') && value.__ob__ instanceof Observer ){
        ob  = value.__ob__;
    }else if(
        !isServerRendering() &&
        (Array.isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ){
        ob = new Observer( value ); 
    }
}


/**
* Observer class that are attached to each [[[ observed object ]]]. 
* Once attached, the observer converts target
* object's property keys into getter/setters that
* collect dependencies and dispatches updates.
*/

 class Observer {
    // value: any;
    // dep: Dep;
    // vmCount: number
    //  value;
    //  dep;
    //  vmCount;

     constructor (value){
         //value: any 
         //保留了 对value的一个引用
         this.value = value;
         this.dep = new Dep();
         this.vmCount = 0;
         
         def(value, '__ob__', this);
         //生成Observer的时候，传进来的value 要么是： Object 要么是 Array
         if( Array.isArray(value)){
             //是数组的话  代理 数组的mutation methods
         }else{
             //object
             this.walk( value );
         }
     };

     walk( obj ){
         const keys = Object.keys(obj);
         for(let i = 0; i < keys.length; i++){
             defineReactive(obj, keys[i], obj[ keys[i] ]);
         }
     };

     observeArray (items) {
        // items: Araay<any>
         for(let i = 0; i < items.length; i++){
            observe( items[i]);
         };
     }

 };

/**
 *将一个object 或者 array的属性变成是 响应式的 设置他们的 get && set
    obj: Object,
    key: String,
    val: any,
    customSetter?: Function
 */
 function defineReactive(
    obj,
    key,
    val,
    customSetter
 ){

    //这才是该属性 改变的时候，需要通知的 subscribers （watcher）
    const dep = new Dep();
    
    const property = Object.getOwnPropertyDescriptor(obj, key);
    if(property && property.configurable === false){
        return ;
    }

    const getter = property && property.get;
    const setter = property && property.set;

    //递归的对val的值进行 observe
    let childOb = observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configuable: true,
        get: function reactiveGetter(){
            const value = getter ? getter.call(obj) : val;
            if(Dep.target){
                dep.depend();
                if(childOb){
                    childOb.dep.depend();
                };
            };
            if(Array.isArray(value)){
                dependArray(value);
            };
            return value;
        },
        set: function reactiveSetter (newVal){
            const value = getter ? getter.call(obj) : val;

            if( newVal === value || ( newVal !== newVal && value !== value) ){
                return ;
            }

            if( process.env.NODE_ENV !== 'production' && customSetter){
                customSetter();
            };

            if(setter){
                setter.call(obj, newVal);
            }else{
                val = newVal;
            };
            /**
             * 每次值的改变都要重新 observe(newVal), 接着去触发属性的依赖
             * 然后渲染函数执行，求值。然后属性的依赖被重新设置。
             */
            childob = observe(newVal);
            dep.notify();
        }
    })

 };

function remove(arr, item){
    //arr: Array<any>, item: any
    if(arr.length){
        const index = arr.indexOf(item);
        return arr.splice(index,1);
    }
}
 /**
 * A dep is an observable that can have multiple directives subscribing to it.
 */
let uid_Dep = 0;

 class Dep {
    //static target: ?Watcher;
    // id: number;
    // subs: Array<Watcher>;


    //subs means subscriber
    constructor () {
        this.id = uid_Dep++;
        this.subs = [];
    };

    
    addSub (subscriber){
        //subscriber: Watcher
        this.subs.push(subscriber);
    };

    removeSub( subscriber){
        // subscriber: Watcher
        remove(this.subs, subscriber);
    };

    depend() {
        // Dep.target 是一个watcher，他是谁？ 他是什么时候被设置的？？？？？
        //为什么要把当前的 dep 放到watcher中 ？？？？Dep.target.addDep(this)？
        //这个操作是为什么 ？？？？
        if(Dep.target){
            Dep.target.addDep(this);
        };
    };

    notify(){
        const subs = this.subs.slice();
        for(let i = 0; i < subs.length; i++){
            subs[i].update();
        }
    }

 }
// the current target watcher being evaluated .
//this is globally unique because there could be only one 
//watch being evaluated at any time;

Dep.target = null;
const targetStack = [];

function pushTarget( _target){
    //_target: Watcher
    if(Dep.target ) targetStack.push(Dep.target);
    Dep.target = _target;
};

function popTarget(){
    Dep.target = targetStack.pop();
}

const bailRE = /[^\w.$]/   //匹配让那个不是 0-9 a-z A-Z dot dollar的其他字符
function parsePath(expression){
    // "father.child.name"
    //father....child..name... //错误的输入
    if(bailRE.test(expression)){
        return;
    };

    const segments = path.split('.');

    return function(obj){
        //obj = family
        //family[father][child][name];
        for(let i = 0; i< segments.length; i++){
            if(!obj) return;
            obj = job[ segments[i] ];
        };
        return obj;
    }
}


function handleError(err, vm, info){
    if(config.errorHandler){
        config.errorHandler.call(null, err, vm, info);
    }else{
        if(process.env.NODE_ENV !== 'production'){

        };

        if(inBrowser && typeof console != 'undefined'){
            console.error(err);
        }else{
            throw err;
        }
    }
};


/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
/**
 * Watcher 的原理是通过对“被观测目标”的求值，
 * 触发数据属性的 get 拦截器函数从而收集依赖，
 * 至于“被观测目标”到底是表达式还是函数或者是其他形式的内容都不重要，
 * 重要的是“被观测目标”能否触发数据属性的 get 拦截器函数，
 * 很显然函数是具备这个能力的。
 */
let uid_Watcher = 0;

class Watcher {

    constructor(
        vm,
        expOrFn,
        cb,
        options
    ){
        // vm: Component,
        // expOrFn: string | function,
        // cb: Function,
        // options?: Object
        this.vm = vm;
        vm._watchers.push(this); //什么时候加入的? => initLifecycle
        //options

        if(options){
            this.deep = !!options.deep;
            this.user = !!options.user;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
        }else{
            this.user = this.deep = this.lazy = this.sync = false;
        }

        this.cb = cb;
        this.id = ++uid_Watcher; //uid for batching 
        this.active = true;
        this.dirty = this.lazy //for lazy watchers
        this.deps = [];
        this.depIds = new Set();

        this.newDeps = [];
        this.newDepIds = new Set();
        this.expression = expOrFn.toString();
        if( typeof expOrFn == 'function'){
            this.getter = expOrFn;
        }else{
            this.getter = parsePath(expOrFn);
            if(!this.getter){
                console.error(`failed watching path: ${expOrFn}`)
            }
        }

        this.value = this.lazy
            ? undefined
            : this.get();
    }

    /**
     * Evaluate ther getter, and re-collect dependencies
     */
    get(){
        pushTarget(this);
        let value ;
        const vm = this.vm;
        if( this.user ){
            //如果是用户自定义的watcher
            try{
                value = this.getter.call(vm,vm);
            }catch(error){
                handleError(error, vm, `${this.expression}`);
            }
        }else{
            value = this.getter.call(vm,vm);
        };

        //touch every property so they are all tracked as
        //dependencies for deep watching

        if(this.deep){
            traverse(value);
        };

        popTarget();
        this.cleanupDeps();
        return value;
    }


    /**
     * Add a dependency to this directive
     */
    addDep(dep){
        //dep: Dep
        const id = dep.id;
        if(!this.newDepIds.has(id)){
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if( !this.depIds.has(id)){
                dep.addSub(this);
            }
        }
    }

    /**
     *  Clean up for dependency collenction
     */
    cleanupDeps(){
        //更新 旧的依赖 和新的依赖 数组
        let i = this.deps.length;
        while(i--){
            const dep = this.deps[i];
            if( !this.newDepIds.has(dep.id)){
                dep.removeSub(this);
            }
        };

        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;

    }

    /**
     * Subsciber interface.
     * Will be call when a dependency changes.
     */

     update(){
         if(this.lazy){
             this.dirty = true;
         }else if( this.sync ){
             this.run();
         }else{
             queueWatcher(this);
         }
     }


     /**
      * Scheduler job interface
      * Will be called by the scheduler.
      */
     run(){
         if( this.active){
             const value = this.get();

             if(
                 value != value || 
                 isObject(value) || 
                 this.deep
             ){
                 const oldValue = this.value;
                 this.value = value;
                 if( this.user){
                     try{
                         this.cb.call(this.vm, value, oldValue);
                     }catch(error){
                         handleError(error, this.vm, `callback for watcher ${this.expression}`)
                     }
                 }else{
                     this.cb.call(this.vm,value,oldValue);
                 }
             }
         }
     }


     /**
      *  Evaluate the value of the watcher.
      *  This only gets called for lazy watchers
      */
     evaluate(){
         this.value = this.get();
         this.dirty = false;
     };

     /**
      * Depend on all deps collected by this watcher
      */
     depend(){
         let i = this.deps.length;
         while(i--){
             this.deps[i].depend();
         }
     };

     /**
      * Remove self from all dependencies's subscriber list
      */
     teardown() {
         if(this.active){
            //remove self from vm's watcher list
            //this is a somewhat expensive operation so we skip it
            //if ther vm is being destroyed

            if( !this.vm._isBeingDestroyed){
                remove(this.vm._watchers, this);
            }

            let i = this.deps.length;
            while(i--){
                this.deps[i].removeSub(this);
            };
            this.active = false;
        }
     }
}









( function main(){
    initState(viewModel);
} )();

