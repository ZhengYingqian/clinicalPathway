/**
 * Created by yqzheng on 2017/4/15.
 */
var size = [1000,1200];
var widthScale = [5,20];
var showN = 1000;
//
var margin = {top: 20, right: 20, bottom: 30, left: 40};
//     width = size[0] - margin.left - margin.right,
//     height = size[1] - margin.top - margin.bottom;
var width = size[0],height = size[1];
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20();

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
    rect,node,shiftKey;

function get_selection(){
    selection = [];
    node.each(function(d) {
        if (d.selected) {
            selection.push(d);
        }
    });
    console.log(selection);
    // drawLegend();
    var legend = svg.selectAll(".legend")
    // .data(color.domain())
        .data(function(){
            var lis=[];
            console.log(selection);
            selection.forEach(function (d) {
                lis.push([d.belong,d.list])
            });
            return lis;
        })
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    console.log(color.domain());
    console.log(selection);
    legend.append("rect")
        .attr("x", width +10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width +24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d[1]; });

}

function clear_selection() {
    node.classed('selected', function (d) { return d.selected = false; })
    d3.select('.legend').remove;
}


svg = svg.append("g")
    .attr("transform", "translate(0,0)");

d3.json("../data/names3.json",function (res) {
    console.log(res.length);

    res.forEach(function (d) {
        d.s=d.Pik*d.p;
    });
    res.sort(function (a,b) {
        return b.s-a.s; //按照由大到小排序
    });

    x.domain(d3.extent(res,function (d) {return d.OutputX*size[0];})).nice();
    y.domain(d3.extent(res, function(d) { return d.OutputY*size[1]; })).nice();

    svg = svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

// //x轴label
//     svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(xAxis)
//         .append("text")
//         .attr("class", "label")
//         .attr("x", width)
//         .attr("y", 20)
//         .style("text-anchor", "end")
//         .text("X axis");
// //y轴label
//     svg.append("g")
//         .attr("class", "y axis")
//         .call(yAxis)
//         .append("text")
//         .attr("class", "label")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 16)
//         .attr("dy", ".71em")
//         .style("text-anchor", "end")
//         .text("Y axis");

    var brush = svg.append('g')
        .datum(function (d) {
            console.log(d);
            return {selected: false, previouslySelected: false};
        })
        .attr("class", "brush")
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([0, width]))
            .y(d3.scale.identity().domain([0, height]))
            .on("brushstart", function(d) {
                svg = svg.call(d3.behavior.zoom().on("zoom", null));
                console.log('brushstart');
                node.each(function(d) { d.previouslySelected = shiftKey && d.selected });
                if (!shiftKey) {
                    d3.event.target.clear();
                    d3.select(this).call(d3.event.target);
                }
            })
            .on("brush", function() {
                if (shiftKey) {
                    console.log('shiftKey', shiftKey);
                    var extent = d3.event.target.extent();
                    node.classed("selected", function(d) {
                        return d.selected = d.previouslySelected ^
                            (extent[0][0] <= x(d.OutputX*size[0]) && x(d.OutputX*size[0]) < extent[1][0]
                            && extent[0][1] <= y(d.OutputY*size[1]) && y(d.OutputY*size[1]) < extent[1][1]);
                    });
                } else {
                    d3.event.target.clear();
                    d3.select(this).call(d3.event.target);
                }
            })
            .on("brushend", function() {
                d3.event.target.clear();
                d3.select(this).call(d3.event.target);
                svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
                // svg.call(d3.behavior.drawLegend())
            }));

    function zoom() {
        if (shiftKey) {
            console.log('zoom shiftKey');
            return;
        }
        console.log('zoom');
        node.attr("cx", function(d) { return x(d.OutputX*size[0]); })
            .attr("cy", function(d) { return y(d.OutputY*size[1]); });
        d3.select('.x.axis').call(xAxis);
        d3.select('.y.axis').call(yAxis);
    }

    rect = svg.append('rect')
        .attr('pointer-events', 'all')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none');

    node = svg.selectAll(".dot")
        .data(res)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return d.selected ? 5 : 6; })
        .attr("cx", function(d) { return x(d.OutputX*size[0]); })
        .attr("cy", function(d) { return y(d.OutputY*size[1]); })
        .style("fill", function(d) { return color(d.belong); })
        .on("mousedown", function(d) {
            if (shiftKey) {
                d3.select(this).classed("selected", d.selected = true);
            }
            else {
                node.classed("selected", function(p) {
                    return p.selected = d === p;
                });
            }
        });

    node.classed('selected', function (d) {
        return d.selected;});
function drawLegend() {
    var legend = svg.selectAll(".legend")
    // .data(color.domain())
        .data(function(){
            var lis=[];
            console.log(selection);
            selection.forEach(function (d) {
                lis.push([d.belong,d.list])
            });
            return lis;
        })
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    console.log(color.domain());
    console.log(selection);
    legend.append("rect")
        .attr("x", width +10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width +24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d[1]; });

}
//     $interval(drawLegend,100);

    d3.select(window).on("keydown", function() {
        shiftKey = d3.event.shiftKey;
        if (shiftKey) {
            rect = rect.attr('pointer-events', 'none');
        } else {
            rect = rect.attr('pointer-events', 'all');
        }
    });

    d3.select(window).on("keyup", function() {
        shiftKey = d3.event.shiftKey;
        if (shiftKey) {
            rect = rect.attr('pointer-events', 'none');
        } else {
            rect = rect.attr('pointer-events', 'all');
        }
    });

//result2 = getLayout2(res,size,widthScale,showN);
});




function getLayout2(data,size,widthScale,maxLen) {
    var spiral = rectangularSpiral(size);

    var groupNum = Math.min(data.length,maxLen),
        outputRects = [],
        spiralInt = 0,
        spiralStep = [1,1],
        padding = 1,
        numMax = data[0].num,
        k=64,
        clusters,plists,group,i,j,isConflicting,t=0,bound,bounds=[];

    [clusters,plists]=kMeans1(data,k,size);
    console.log(clusters);
    console.log(plists);
    for (i=0;i<k&&t<groupNum ;i++){
        idx = clusters[i].belong;
        spiralInt = clusters[i].pos;
        //  console.log(spiralInt);
        var items=plists[idx],test=0;
        //console.log(items);
        if(items.length>0){
            for(j=0,num=items.length;j<num;j++){
                group = findId(items[j][0],data,size);
                group.rectLength= (widthScale[1] - widthScale[0])*group.Pik + widthScale[0];
                rectsLength = group.rects.length;//矩形数量
                do {
                    bound = getBound(spiral(spiralInt), group.rectLength, rectsLength);
                    isConflicting = judgeBound(bound, bounds, padding);
                    spiralInt += spiralStep;
                    test++;
                }while (isConflicting && test < 10000);
                bounds.push(bound);
                maxSize=pushGroupRects(group, bound,outputRects,maxSize);
                t++;
            }
        }
        console.log()
    }

}
//两个数组想加的函数
function arradd(a,b) {
    var c = [];
    a.forEach(function(v, i) {
        c.push(v + b[i]);
    });
    return c;
}