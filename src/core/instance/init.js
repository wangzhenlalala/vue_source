/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-init:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    //调用了_init方法的都是组件的实例
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)// 在_update中，将mountComponent（）{}放到了watcher中，这样mountComponent就会在当前event loop的下一个循环中被执行。 其中会callHook('mounted")
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent
  opts.propsData = options.propsData
  opts._parentVnode = options._parentVnode
  opts._parentListeners = options._parentListeners
  opts._renderChildren = options._renderChildren
  opts._componentTag = options._componentTag
  opts._parentElm = options._parentElm
  opts._refElm = options._refElm
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  //wangzhen
  /**
   * 沿着父类的继承链实时的去 收集父类的options，如果和子类中存储的不一样，就使用新的父类options和
   */
  let options = Ctor.options
  if (Ctor.super) {                                                 
    //当Ctor == Vue的时候，是不会走到这里的
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      /**
       * 为什么superOptions and options 的改变才需要重新resolve  SuperClass's options???
       * extendOptions 的改变为什么没有算进来？？？
       * 父类 and 子类（类的定义）有可能，是别人(第三方，你的同事)完成的，你无法改变预测别人的操作？？？
       * 但是extendOptions是我们自己传进来的，我们对他有完全的控制能力，如果事先定义的比较好的话，我们是不会修改他的 //个人
       */
      // 一个类的options什么时候会改变 ？？？？为什么要改变options ？？？？
      /**
       * Briefly, double equals will perform a type conversion when comparing two things; 
       * triple equals will do the same comparison without type conversion (by simply always returning false if the types differ)
       */
      //mergeOptions(parent,child)仅仅是shallolw  copy parent和child的属性形成options
      //如果 extendOptions 和 options对象中添加，删除属性，是不会引起 superOptions !== cachedSuperOptions的。

      /**
       * 子类本来就是要继承父类的数据的，如果父类的数据改变了，子类当然要更新。。
       * 如果手动的update(add/delete)父类的属性，子类是无法感知这种变的，所以这个时候就可以用到了immutable类似的思想，如果update该对中的一部分，就返回一个新的对象，从而
       * 可以让后面的人，感知到变化。。。
       * 现在是在【类的实例化阶段】，不是在extend
       */
      // super option changed
      // need to resolve new options.
      Ctor.superOptions = superOptions

      /*******************11111111111********************/
      /** 如果不考虑11111块当中的代码，就可以直接执行后面的mergeOptions */
      
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      /*******************11111111111********************/
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  /**
   * constructor.options
   * constructor.super
   * constructor.superOptions
   * constructor.extendOptions
   * 
   * Vue.extend(options)   //可以实现类的继承
   */
  return options
  //每次调用mergeOptions如果superOptions被改变了，都会返回一个新的对象，和之前的不同了，从而触发后续调用mergeOptions的判断
  //superOptions !== cachedSuperOptions 成立从而生成新的options

}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  debugger
  let modified
  //wangzhen
  /**
   * 如果从该类的 继承链上的类指定的extendOptions改变了的话，Ctor.options 就会体现出来，因为JavaScript的对象中保存的都是对象的引用。。同样extendOptions也是会实时的体现出来
   * 而Ctor.sealedOptions = extend({}, super.options); sealedOptions,是对当时的类的options的shallow copy, 如果上一行的变化发生的话，是
   * 不会体现出来的。 所以叫sealed !!!
   */
  const latest = Ctor.options
  const extended = Ctor.extendOptions
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      //最近被修改 两者有对应的key,但是指向不一样 所以不相等
      //最近被添加 两者没有对应的key所以不相等
      /**
       * 对于两者的交集部分：
       * 1.来自于extendOptions
       * 2.来自于Super[options]
       * 3.来自于两者的合并
       * 如果latest[key] === sealed[key]
       * 就说明该属于 就是:
       *    expendOptions[ket]
       * || Super[options][key] 
       * || expendOptions[key] && Super[options][key] && strategyMerge($1,$2)
       * 得来的
       */
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  /**
   * 返回的值是： latest UNION sealed DIFFERENCE sealed
   */
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}
