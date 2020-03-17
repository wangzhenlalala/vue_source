/**
 * vue的组件树，被created的时候，组件的实例有自己的id，实例对应watcher也有自己id，
 * 那么该组件树的 线性化 序列，是以怎样的遍历方式实现的呢？ 广度 Or 深度 遍历？？？
 */

import { nextTick } from "../../src/core/util";
import { callHook, activateChildComponent } from "../../src/core/instance/lifecycle";

let has = {};
let circular = {};
let queue = [];

let flushing = false;
let waiting = false; //waiting 的意义是什么 ？？？
let index = 0;
const activatedChildren = [] // Array<Component>  //dynamic component

const MAX_UPDATE_COUNT = 100   ;

function queueWatcher(watcher){
        const id = watcher.id;
        if(has[id] == null){
                //同一个watcher，被多个dep触发，应该只被触发一次。这里来过滤。
                has[id] = true;
                if(!flushing){
                        //属性的set被触发，dep向watchers发送通知，使得watchers设定的行为被调用
                        //watcher.lazy = true or watcher.sync = false; 
                        //在当前的执行栈被回退至空之前被调用的watcher，都被缓存起来，
                        //等待下一次的macrotask或者本次的microtask时被实际的执行
                        queue.push(wathcer);
                }else{
                        //在调用watcher队列的时候，watcher中的回调又触发了
                        //另外的watcher(s),使得他们也进入该函数内.
                        /**
                         * 首先： 
                         *  1. 组件树的更新是从parent 到 child
                         *  2. when queue is being flushed, the queueed watcher has already been sorted by thier id
                         *  3. 父组件的id < 子组件的id
                         *  此时： 如果有新来了一个watcher,
                         *  i > index ： 未执行的watcher
                         *  queue[i].id > watcher.id 为假的时候，queue[i].id <= watcher.id
                         *  也就是在未执行的watchers中，从后向前，找到第一个，id比wacher.id小的watcher，即该组件的最近的ancestor node
                         *  无论如何，该watcher都会被插入到queue,保证，该watcher.id，比他后面所有的watcher.id都小
                         *  也就是该watcher比其后的watchers处在组件树的更高层次。
                         *  因为更高层次的wacher的动作可能会对后面的组件产生影响，比如props的传递。
                         */
                        let i = queue.length - 1;
                        while(i > index && queue[i].id > watcher.id ){
                                i--;
                        };


                        //数组的splice方法会自动的更改数组的长度。
                        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                        //deleteCount
                        queue.splice( i+1, 0, watcher);
                }
        };
        if( !waiting ){
                //waiting 代表着本次调度的watchers已经被放到了，最近一次的tick当中了。
                //后续再来的就不用再重复同样的行为了
                waiting = true;
                nextTick(flushSchedulerQueue);
        };

}


function flushSchedulerQueue(){
        flushing = true;
        let watcher , id;
        //Sort queue before flush.
        //This ensures that:
        // 1. Components are updated from parent to child (because parent is always created before the child.);
        // 2. A component's user watchers are run before its render watcher (because user watchers are created before ther render watcher);
        // 3. If a component is destroyed during a parent component's watcher run, its watchers can be skipped.
        queue.sort((a,b) => { return a.id - b.id});
        
        //do not cache length because mor watchers might be pushed
        //as we run existing watchers
        //因为在queueWatcher,即使主线程正在执行flushSchedulerQueue，新的watcher也允许被添加进来
        for( index = 0; index < queue.length; index++){
                watcher = queue[index];
                id = watcher.id;
                has[id] = null; //该watcher执行完之后，就把他标记为没有执行过，以便后来queueWatcher可以据需添加该watcher,而不是把他过滤掉
                watcher.run(); //求值，触发依赖，然后回来，而不是等待在这中间触发的依赖的执行完毕
                if( process.env.NODE_ENV !== 'production' && has[id] != null){
                        circular[id] = ( circular[id] || 0 ) + 1;
                        if( circular[id] > MAX_UPDATE_COUNT){
                                console.error(
                                        `you may have an infinite update loop` + 
                                        watcher.user 
                                        ? `in watcher with expression "${watcher.expression}"`
                                        : `in a component render function.`
                                );
                                break;
                        }
                }
        }

        // keep copies of post queues before resetting state;
        const activatedQueue = activatedChildren.slice();
        const updatedQueue = queue.slice();
 
        resetSchedulerState();

        // call component updated and actived hooks
        callActivatedHooks(activatedQueue);
        callUpdateHooks(updateQueue);
}

function resetSchedulerState(){
        index = queue.length = activatedChildren.length = 0;
        has = {};
        if( process.env.NODE_ENV !== 'production'){
                circular = [];
        };
        waiting = flushing = false;
}

function callUpdateHooks(){
        let i = queue.length;
        while( i-- ){
                const watcher = queue[i];
                const vm = watcher.vm;
                if(vm._watcher === watcher && vm._isMounted){
                        //首次渲染是不触发 updated 组件生命周期
                        //updated在来一轮flush中可能被触发好多次！！！！
                        callHook(vm, 'updated');
                }
        }
}


/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched !!!
 */
function queueActivatedComponent(vm){
        // setting _inactive to false here so that a render function can 
        //rely on checking whether it's in an inactive tree 
        vm._inactive = false;
        activatedChildren.push(vm);
};

function callActivatedHooks(queue){
        for(let i = 0; i < queue.length; i++){
                queue[i]._inactive = true;
                activateChildComponent(queue[i], true);
        }
}

let nextTick = ( function(){
        var callbacks = [];
        var pending = false;
        var timerFunc;

        function nextTickHandler () {
                pending = false;
                var copies = callbacks.slice(0);
                callbacks.length = 0;
                for(var i = 0; i < copies.length; i++ ) {
                        copies[i]();
                }
        };

        var p = Promise.resolve();
        var logError = function (err) {console.error(err)};
        timerFunc = function() {
                p.then(nextTickHandler).catch(logError);
        };

        return function queueNextTick (cb, ctx){
                //如果cb没有提供，该函数返回的是一个Promise
                var _resolve;
                callbacks.push( function() {
                        if(cb){
                                try{
                                        cb.call(ctx);
                                }catch(e){
                                        console.error(e,ctx,'nextTick');
                                }
                        }else if(_resolve){
                                _resolve(ctx);
                        }
                });
                //无论cb有没有传递，当pend为假的时候等会执行timerFunc
                if(!pending){
                        pending = true;
                        timerFunc();
                };
                if( !cb && typeof Promise !== 'undefined'){
                        return new Promise( function(resolve, reject) {
                                _resolve = resolve;
                        })
                }
        }
} )();

/**
 *   1.你可以这样写 nextTick().then(function(data){});
 */
