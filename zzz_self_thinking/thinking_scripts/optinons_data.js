let data = {

};

/**
props 仅仅指定了 key(字段的名字), 但是名字所对应的是定义在了那里呢？？
应该是 该组件实例的父组价实例中。那么父组件实例vmFather既然传递了一个props给其子组件实例vmChild那么该传递的属性（propA,propB)
一定是可以通过vmFather.propA,vmFather.propB访问到；但是VMFather中的propB的值，可能又是从其父组件实例中传递过来的。
如此，一直顺着 父组件的父组件的父组件的父组件...，就能找到最终定义该属性的地方。
1. 那么 根组件是否可以指定props属性呢？？？或者说是否有意义呢？？
2. props是在什么时候后传递的呢？？ 
    new Vue({
        el: '#app',
        template: `<div>
                            <a>{{who}}</div>
                            <ComponentA name='compA' />
                    </div>`
        props: {
            who: 'root' // can we do that ???? 
            who: {
                default: 'root'
            }
        }
    });

    Vue.component('ComponentA',{
        props: {
            name: String,
            age: {
                type: Number,
                default: 25
            }
        }
    })
    <ComponentA  name="25" />
props选项只是说明了该组件可以接受这样的参数   func(props){ } 函数的定义
在调用该组件的时候传递props参数的具体指的   func(xxxx) 函数的传参调用 
    
*/

let props = {
    'propA': {
        type: String,
        required: true
    },
    'propB': {
        type: Boolean,
        required: false
    },
    propC: Number
};
let props = [ 'propA', 'propB'];

let options = {
    props: props,
    data(){
        return data; 
    }
}
let vm = new Vue( options );

/**
 * vm实例仅仅是拿options中的data来渲染数据，data 和 template是分开指定的。 vm仅仅是一个中间的组装者。
 * vm._data = options.data()即data, vm实例代理了options.data()即data, 中的数据.(此时尽管options.data是一个函数)，
 * 但是，所有从该组件实例化的vm,都将拥有相同的data的索引。
 * 当我们手动的去 修改data时，所有依赖于该data的值，的vm，都应该被通知改变。。
 * 
 * ！！！个人猜想
 *  那么应该是在组件被实例化的时候，就应该把实例化的 vm 对data的依赖告诉给代理的data对象。。。每个被实例化的vm都应该执行一次该操作。
 *  那么
 *  1. 组件是什么时候 被实例化的 ？？
 *  2. 把 vm 对data的依赖告诉data，怎么告诉（依赖如何被收集） ？？？
 *  3. 当data变化的时候，我们告诉了vm变化，vm会干什么？？？ 收集依赖的目的是什么？？？？
 * 
 *      组件实例的存在就是为了渲染dom，呈现html元素。
 *          渲染出来什么样的html元素，是由用户传递给组件（继承自Vue的子类），的options中的
 *          template模板，或者 render()渲染函数
 *          以及 data(),props,provide,computed 等数据共同渲染出来的。
 *          template最终 也是会被编译成 render()函数，用来生成 VDOM
 *          所以当vm依赖的数据改变了的时候，vm要做的就是根据 template 和 他所依赖的数据 重新生成VDOM. 重新执行render
 *              已知：
 *                  a. 一个app只有一个根组件
 *                  b. 只有根组件可以有，el
 *                  c. 组件树的渲染是从 上 向 下，从根到叶， 从父到子到孙 (可能根据数据的向下传递方向也应该这样) 
 *                  d. 每个组件实例 最终都会拥有一个render函数
 *                  e. 组件实例的render函数会，evaluate(求值)组件模板中包含的变量
 *           当我们从根组件开始渲染的时候，我们就执行了根组件的render函数，也就触发了，模板中所依赖的所有的变量。每当遇到一个
 * 变量的时候，我们就把该变量defineReactive为其设置getter and setter.同时将我们的渲染函数，当成该变量的依赖，记录下来。
 * dep.depend() and 如果该变量是一个object or array  childOb.dep.depend()。
 */

 //当dep.depend()的时候，dep.depend做了什么？？？ 是如何组织 该变量的依赖的 ？？？
 //当变量变化别监听到之后，dep and watcher 是如何合作，触发指向该变量的依赖的。。。
 //更准确的说是如何把要执行的依赖放到 js main thread中的？？？





 /**
  * 在 Vue 中，我们可以使用 $watch 观测一个字段，当字段的值发生变化的时候执行指定的( watcher )观察者
  * 深度观测 deep watch 是什么意思 $watch('name', () => {} ), 
  * 如果name是一颗子树，当该树的子节点变化的话，
  * 也视为‘name’的变化吗？？？？
  * 
  * 
  * observe(value: Object | Array)是一个helper function 
  * Observer类 用来观测一个对象|数组 把对象|数组的属性转化成响应式的。
  * observe用来 观测value,并返回该value的Observer实例
  */




  /**
   * 由于 Watcher 对所观察字段的求值才触发了字段的 get，从而才有了收集到该观察者的机会, 
   * 只有watcher知道字段变化之后，要执行的动作（回调函数）
   *  [ key => watcher => callbacks ]
   */


   /**
    * 
        initLifecycle(vm)
        initEvents(vm)
        initRender(vm)
        callHook(vm, 'beforeCreate')
        initInjections(vm) // resolve injections before data/props
        initState(vm): 
                initProps
                initMethids
                initData
                initComputed
                initWatch
        initProvide(vm) // resolve provide after data/props
        callHook(vm, 'created')

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    * 
    */


    /**
     * src/platforms/web/entry-runtime-with-compiler.js
     *  const mount = Vue.prototype.$mount
        Vue.prototype.$mount = function (
            el?: string | Element,
            hydrating?: boolean
        ): Component {
        
            return mount.call(this, el, hydrating)
        }
     */