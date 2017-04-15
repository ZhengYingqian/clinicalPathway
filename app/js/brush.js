/**
 * Created by yqzheng on 2017/4/15.
 */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select(".Brush")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var selection=[],
    rect,node;

svg = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("../data/names3.json",function (res) {
    res.forEach(function (d) {
        d.s=d.Pik*d.p;
    });
    res.sort(function (a,b) {
        return b.s-a.s; //按照由大到小排序
    });
    result2 = getLayout2(res,size,showN);
});

function getLayout2(res,size,widthScale,showN) {
    var spiral = archimedeanSpiral(size);

    var groupNum = Math.min(data.length,maxLen),
        outputRects = [],
        spiralInt = 0,
        spiralStep = 0.5,
        padding = 1,
        numMax = data[0].num,
        k=64,
        clusters,plists,group,i,j,isConflicting,t=0,bound,bounds;

    [clusters,plists]=kMeans1(data,k,size);
    for(i=0;i<groupNum;i++){
        // group =
    }
}