/**
 * Created by yqzheng on 2017/4/20.
 */
angular.module('ctrlApp',[])
.controller('MainCtrl',[function () {
    var self = this;

}])
.controller('SubCtrl',['ItemService',function (ItemService) {
    var self = this;

}])
.factory('ItemService',[function () {
    var selection=[];
    return{
        get_selection:function(){
            $scope.selection = [];
            node.each(function(d) {
                if (d.selected) {
                    $scope.selection.push(d);
                }
            });

            console.log(selection);
            $scope.selection.forEach(function (d) {
                var idx = lis.find(function(val){return val ==d.belong});
                if(!idx){lis.push(d.belong)}
            });
            return selection;
    },
        clear_selection:function(){
            node.classed('selected', function (d) { return d.selected = false; });
            svg.selectAll('.legend').remove();
            d3.select('.line').remove();
            lis = [];
        }
    }
}]);