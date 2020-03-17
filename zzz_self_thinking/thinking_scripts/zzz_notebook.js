

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

1.vue.extend 具体做了什么 ???
2.如果 Sub_1= Vue.extend(options); 那么我们如何 Sub_2 = inheritacne(Sub_1); ???



在 Sub  = Vue.extend({})中，为Sub添加了extendOptions , options

// 三目运算符

condition1
?   condition2
    ?   condition3
        ?   true_3
        :   falsy_3
    :   falsy_2 
:   falsy_1

// 三目运算符

//initProxy 的目的，就是设置渲染函数的作用域代理，其目的是为我们提供更好的提示信息。

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */


    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.


1. Binding 
2. Subject
3. Observer

?-1: Binding 是社么时候，什么条件下创建的
?-2: Subject 是如何通过 Binding 通知 Observer的
?-3: Observer是如何响应变化的
?-4: Binding 是什么时候，什么条件下解除的