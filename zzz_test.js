/** 以下说明了： defineProperty（object，key, propDescriptor} 
 * 对key定义的getter and setter,指定拦截到 通过object[key]的形式
 * 获取，设置该key 的值的操作，
 * 但是 delete object[key] 并不会触发该属性的 setter 或 getter。
 * 
 * 
 * 所以在Vue中 当  object[key]  is Object or Array的时候，
 *  objA = {name: 'objA};
 *  objB = {name: 'objB'};
 *                  对于： object[key] = objA; 
 * 1. object[key] = ojbB; //触发key的依赖
 *      我们要在key的setter中触发，依赖于该属性的watcher，来监听该属性值的改变[如果改变就已经不是 该属性值本身了]
 *          
 * 2. delete object[key] //从对象中移除该属性 此时也应该触发 key 的依赖，因为object[key]已经不存在了
 *                       //但是 object key的setter ，getter 无法监测到这种形式的改变
 * 3. object[key]['age'] = 25; //此时也应该触发key的依赖，因为object[key]已经和原来不一样了。
 *                             //但是，object key的setter， getter无法监测到这种形式改变
 *      
 *     所以如果你需要第 2,3 种改变，并且想让vue监听到该改变，你应该主动的告诉vue
 *     因此vue提供了 vue.set vue.delete
 *      : vue.delete(object,key)  //告诉vue从object上移除key，并且移除所有对key的依赖
 *      : vue.set(object, 'age', 25) // 告诉Vue在object上添加新的属性age, 
 *                                   // 并且还会把该新添加的属性变成响应式的 
 *                                   // 如果age是Object Or Array 的话，还可以是deep watch
 * 
 *          
*/
let test = {
    _hour: 8,
    hour: 8,
    minute: 50,
    second: 27
};

Object.defineProperty(test, 'hour', {
    enumerable: true,
    configurable: true,
    get: function(){
        console.log('get hour');
        return this._hour;
    },
    set: function(newVal){
        console.log('set hour');
        this._hour = newVal;
        return newVal;
    }
});

test['hour']; //trigger getter
test['hour'] = 10; //trigger setter
delete test['hour']; // trigger neither getter nor setter 
console.log(test);   // property 'hour' just has been deleted !!! without our being notified!!

/** 以下说明了： defineProperty（object，key, propDescriptor} */