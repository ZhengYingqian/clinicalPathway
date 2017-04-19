/**
 * Created by yqzheng on 2017/4/15.
 */
var size = [1100,1200];
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
// console.log(color);
// var a =d3.rgb(255,0,0);
// var b =d3.rgb(0,255,255);
// var color1 = d3.interpolate(a,b);
// var linear = d3.scale.linear()
//     .domain([1,64])
//     .range([0,1]);

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

var selection=[],lis = [],
    rect,node,shiftKey;

function get_selection(){
    selection = [];
    node.each(function(d) {
        if (d.selected) {
            selection.push(d);
        }
    });

    console.log(selection);
    selection.forEach(function (d) {
        var idx = lis.find(function(val){return val ==d.belong});
        if(!idx){lis.push(d.belong)}
    });

    console.log(lis);
    var legend = svg.selectAll(".legend")
    // .data(color.domain())
        .data(lis)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    // console.log(color.domain());
    legend.append("rect")
        .attr("x", width +10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d){
            // console.log(d);
            // return color1(linear(d))});
            return color(d)});
        // .stream('fill',color);

    legend.append("text")
        .attr("x", width +44)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
    legend.on('click',function (d) {
        showSelected(d);
    });
 /*   legend.on('mouseout',function (d) {
        clear_selection(d);
    })*/
}

function showSelected(belong) {
    node.each(function (d) {
        if(d.belong ==belong){
            d.selected = true;
        }
    });
    node.classed('selected', function (d) {
        return d.selected;});
}
// function hideSelected(d) {
//
// }
function clear_selection() {
    node.classed('selected', function (d) { return d.selected = false; });
    svg.selectAll('.legend').remove();
    lis = [];
}

svg = svg.append("g")
    .attr("transform", "translate(0,0)");

d3.json("../data/names3.json",function (res) {
   // console.log(res.length);

    res.forEach(function (d) {
        d.s=d.Pik*d.p;
        d.belong +=1;
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
//         .attr("transform", "translate(0,0)")
//         .call(yAxis)
//         .append("text")
//         .attr("class", "label")
//         .attr("transform", "rotate(-90)")
//         // .attr('x',20)
//         .attr("y", -16)
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
            }));

    function zoom() {
        if (shiftKey) {
            console.log('zoom shiftKey');
            return;
        }
        console.log('zoom');
        node.attr("cx", function(d) { return x(d.OutputX*size[0]); })//修改成rect的时候需要修改cx-》x,cy->y;
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
        // .enter().append("rect")
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return d.selected ? 5 : 6; })
        .attr("cx", function(d) { return x(d.OutputX*size[0]); })
        .attr("cy", function(d) { return y(d.OutputY*size[1]); })
        // .attr("x", `function(d) {
        //     //console.log(d);
        //     return x(d.OutputX*size[0]); })
        // .attr("y", function(d) { return y(d.OutputY*size[1]); })
        // .attr('width',function (d) {
        //     return d.rects.length*5;
        // })
        // .attr('height',5)
        // .style("fill", function(d) { return color1(linear(d.belong));})
        .style("fill", function(d) { return color(d.belong);})
        .on("mousedown", function(d) {
            if (shiftKey) {
                d3.select(this).classed("selected", d.selected = true);
            }
            else {
                node.classed("selected", function(p) {
                    return p.selected = d === p;
                });
            }
        })
        ;
    //将circle换成矩形做的尝试
    group = svg.selectAll('.rects')
        .data(res)
        .enter().append('g');
    
    group.attr('class','rects')
        .attr('x',function (d) {
            // console.log(d);
        });

    node.classed('selected', function (d) {
        return d.selected;});

    var tooltip = d3.select(".Brush")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);

    node.on("mouseover",function(d){
        /*
         鼠标移入时，
         （1）通过 selection.html() 来更改提示框的文字
         （2）通过更改样式 left 和 top 来设定提示框的位置
         （3）设定提示框的透明度为1.0（完全不透明）
         */
        // console.log(d);
        tooltip.html('list:'+d.list+'<br />'+'belong:'+d.belong)
            .style("left", (d3.event.pageX)-150 + "px")
            .style("top", (d3.event.pageY) + "px")
            .style("opacity",1.0);
    })
        .on("mousemove",function(d){
            /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */

            tooltip.style("left", (d3.event.pageX)-150 + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout",function(d){
            /* 鼠标移出时，将透明度设定为0.0（完全透明）*/
            tooltip.style("opacity",0.0);
        });

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