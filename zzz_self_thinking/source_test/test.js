
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
                        age: 25
                }
        }
});