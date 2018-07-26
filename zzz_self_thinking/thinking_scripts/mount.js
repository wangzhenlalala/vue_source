import { compileToFunctions } from "../../src/platforms/web/compiler";
import { createEmptyVNode } from "../../src/core/vdom/vnode";
import { callHook } from "../../src/core/instance/lifecycle";
import Watcher from "../../src/core/observer/watcher";

let place1 = 'platforms/web/runtime/index.js'

function mountComponent(
  vm,
  el,
  hydrating
){
  vm.$el = el;
  if( !vm.$options.render ){
    vm.$options.render = createEmptyVNode;
    /**
     * 一下是在开发环境下的各种警告
     */
  };
  callHook(vm, 'beforeMount');

  let updateComponent;


  //vm._update 是 把生成的VNode，渲染成真正的DOM
  //vm._render 的作用是： 根据模板生成的渲染函数，得到还模板对应的VNode。
  updateComponent = () => {
    vm._update( vm._render(), hydrating);
    //现在，该组件实例vm就被，插入到了 DOM树当中了 ！！！！
  }
  
  let options = {
      before(){
        if(vm._isMounted){
          callHook(vm, 'beforeUpdate');
        }
      }
  };
  //Watcher(vm, expOrFn, cb, options);
  vm._watcher = new Watcher(vm, updateComponent, noop, options);
  
  hydrating = false;

  if(vm.$vnode == null){
    vm._isMounted = true;
    callHook(vm, "mounted");
  };

  return vm;
};



Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}


/************************************************************************/
 let place2 =  'src/platforms/web/entry-runtime-with-compiler.js '

 const mount = Vue.proto.$mount;
 Vue.prototype.$mount = function (
  el,
  hydrating
 ){
    el = el && query(el);
    if(el == document.body || el == document.documentElement){
      console.error("can not mount on body or html");
      return this;
    };

    const options = this.$options;
    //resolve template/el and convert to render function

    if(!options.render){
        let template = opeions.template;
        if(template){
            //指定了template模板
            if( typeof template === 'String'){
                if(template.charAt(0) == "#"){
                  //如果指定的是一个 样式id
                  template = idToTemplate(template);
                  if(process.env.NODE_ENV != 'production' && !template ){
                    console.error('Template element not found or is empty');
                  }
              }
          }else if ( template.nodeType){
              //是一个dom元素
              template = template.innerHTML;
          }else {
              if(process.env.NODE_ENV != 'production' ){
                console.error(' invalid template option');
              }
          }
        }
    }else if (el){
      template = getOuterHTML(el);
    };



    if(template){
        const { render, staticRenderFns } = compileToFunctions( template, {
            shouldDecodeNewLines,
            delimiters: options.delimiters
        });
        options.render = render;
        options.staticRenderFns = staticRenderFns;
    }
    /****************************************************** */
      到这里options中就一定 具有了 render函数，然后再去 挂载该实例
    /****************************************************** */

    return mount.call(this, el, hydrating);
  } 
    
    //将模板字符串，parse成渲染函数
    // render = function(createElement){
    //   return createElement(tagName, attrbutions, children);
    // }
    Vue.compile = compileToFunctions ;