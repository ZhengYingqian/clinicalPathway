/**
 * Created by yqzheng on 2017/4/2.
 */
//画布大小
var width = 200, height = 100;
var dic={
    '1':'Title',
    '2':'Picture',
    '3':'Description',
    '4':'Pricing',
    '5':'Shipping'
   // '6':'Other Options'
};
var initrect=[];
var base=[0,0];
for(var i=0;i<5;i++){
    var item = {};
    // item.height=20;
    // item.width=100;
    item.x=base[0];
    item.y=base[1]+20*i;
    item.type=i+1;
    item.title=dic[i+1];
    initrect.push(item);
}
console.log(initrect);
addTips('tips',initrect);
// 在body里添加一个SVG画布
function addTips(cla,data) {
    var svg = d3.select("."+cla).append('svg')
        .attr("width",width)
        .attr("height",height)
        .append("g")
        .selectAll(".rect")
        .data(data)
        .enter();
    svg.append("rect")
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", 50)
        .attr("height", 20)
        .style("fill", function (d) {
            return color(d.type);
        });

    svg.append('text')
        .attr('x',function (d) {
            return d.x+75;
        })
        .attr('y',function (d) {
            return d.y+17;
        })
        .text(function (d) {
            return d.title;
        });

}


// circle.on("click", function(){
//     // 添加交互内容
//
// });
// function num2state(num) {
//     if(dir(num)){
//         return dir(num);
//     }else return 'Other Options';
// }

var size,clusters,plists,
    k=64;
d3.json('data/names.json',function (res) {
    for(var i=0;i<res.length;i++){
        res[i].s=res[i].Pik*res[i].num;

    }
    res.sort(function (a,b) {
        return b.s-a.s; //按照由大到小排序
    });
    size=[width,height];
    [clusters,plists]=kMeans1(res ,k,size);

});