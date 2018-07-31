/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { warn, extend, mergeOptions } from '../util/index'
import { defineComputed, proxy } from '../instance/state'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  //wangzhen
  /**
   * initExtend(Vue) 只会在 Vue 这个基类 上调用吗？？？？
   * Vue.cid = 0;
   * 以后每次通过Vue.extend 继承的子类都 Sub.cid = Super.cid+1 ?? 不对的？？？
   * 
   * Sub.cid = cid++;  无论哪个层次的继承类，都是引用initExtend这个闭包里面的cid ！！！！
   */
  ////////////////////////////////////////////////////////////
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    //wangzhen
    /**
     * extend的是Vue实现继承的方法。通过Vue.extend()产生的子类都会拥有这个extend的类方法。
     * someClass_Vue_As_Base.extend(extendOptions) 都将会产生一个继承自omeClass_Vue_As_Base子类 Sub，
     * 对于Sub来说someClass_Vue_As_Base 就是他的父类，就是Super
     * 一个类，定义了有由该类实例化的实例，将会具有什么样的 属性和行为
     * vue本身指定 其实例会具有的$data,$props,methods等属性和行为，但Vue仅仅是一个 基类，仅仅定义了如果数据存在应该怎么玩，逻辑应该如何走
     * 但是其中的数据和行为都是由生成子类是提供的options来指定的，这些option指定的属性和行为就被该子类的实例代理了。
     */
    extendOptions = extendOptions || {} 
    //wangzhen
    
    const Super = this
    const SuperId = Super.cid
    //当同一个extendOptins对象，用来从同一个（相同superid) 再一次 继承生成子类，那么就直接返回已经缓存生成的子类
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId] 
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        )
      }
    }

    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++   //wangzhen/////////////////////////引用闭包内的（相当于全局的cid变量，使得各个衍生类的cid唯一
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
