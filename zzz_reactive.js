

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
let uid = 0;

 class Dep {
    //static target: ?Watcher;
    // id: number;
    // subs: Array<Watcher>;


    //subs means subscriber
    constructor () {
        this.id = uid++;
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
        //为什么要把当前的 dep 放到watcher中 ？？？？？
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



( function main(){
    initState(viewModel);
} )();

