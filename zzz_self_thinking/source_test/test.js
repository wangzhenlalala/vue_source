var Global_InitData = true;
var Global_Options = false;
var template = `
 <div>
        <div style="clolr:red">{{name}}</div>
        <div>{{age}}</div>
        <div>{{name}}</div>
</div>
`;
var p = new Vue({
        el: '#app',
        template: template,
        data() {
                return {
                        name: 'wangzhen',
                        age: 25,
                        children: {
                                name: 'child',
                                age: 8,
                                toys: {
                                        tname: 'dinosour'
                                }
                        }
                }
        },
        watch: {
                "children.toys.tname": function(newVal){
                        console.log(newVal);
                }
        }
});