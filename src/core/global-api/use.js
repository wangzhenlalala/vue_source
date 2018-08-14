/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return this
    }
    // additional parameters
    const args = toArray(arguments, 1);
    //调用插件的时候，插件得到的第一个参数，就是被调用use方法的Vue或者Vue的子类
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    plugin.installed = true
    return this
  }
}
