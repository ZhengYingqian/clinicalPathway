/**
 * Created by yqzheng on 2017/4/19.
 */
var app = angular.module('app',[]);
app.controller("ngCtl", [ '$scope','$interval', function($scope,$interval) {
    $scope.names = ["zoom", "brush",'tips'];

    $scope.changeLine = function (lineM) {
        d3.select('svg').remove();
        d3.select('.graphic svg').remove();
        $scope.lineM = lineM;

        drawLine($scope.lineM,$scope.shiftkey,$interval);
    };

    $scope.select = function (selectName) {
        $scope.shiftkey = selectName;
        console.log( $scope.shiftkey );
        makeselect(selectName,$scope);
    };

    $scope.showData = function showData() {
        // console.log('show data');
        var group = $('.selected ');
        var part = /\d+/g;
        d3.selectAll(group)
            .style("opacity",1);
        d3.selectAll($('.thegraph').not(group))
            .style("opacity",0.2);
        console.log('selected groups:');
        console.log(group);
        var bList=[];
        group.each(function (i,d) {
            var belong = parseInt(d.id.match(part));
            if(!bList.find(function (d,i) {
                // console.log(d,belong);
                return d ==belong;
            })){
                bList.push(belong);
            }
        });
        // console.log(bList);
        showStatistics1(bList);
    };

    $scope.clearData = function clearData() {
        console.log('clear!');
        d3.selectAll($('.thegraph'))
            .style("opacity",1)
            .classed('selected',false);
        d3.select('g.brush').remove();
    };

    function drawLine(num,shiftkey,$interval) {
        console.log('drawline' + num);

        d3.json("../data/names3.json", function (res) {
            // console.log(res.length);

            res.forEach(function (d) {
                d.s = d.Pik * d.p;
                d.belong += 1;
            });
            res.sort(function (a, b) {
                return b.s - a.s; //按照由大到小排序
            });

            var count = 0;
            selection = res.filter(function (d, i) {
                if (d.rects.length > 3 && count < num){
                    count++;
                    return d;
                }
            });

            console.log(selection);
            redraw(selection,shiftkey,$interval,res,$scope);
        });

    }
}]);

function redraw(selection,shiftkey,$interval,res,$scope) {
    var margin = {top: 50, right: 160, bottom: 80, left: 50},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    //color - d.belong;
    var linedata=[];
    selection.forEach(function (p) {
        var temp = {};
        temp.name = p.belong;
        temp.values = p.rects;
        linedata.push(temp);
        // colorList.push(p.belong);
    });
    console.log(linedata);//[[{id:,type:}..]..]
    // var colordic;
    // var color = d3.scale.ordinal().range(colordic).domain(colorList);
    var color = d3.scale.category20();

    //defines a function to be used to append the title to the tooltip.  you can set how you want it to display here.
    var maketip = function (d) {
        var tip =/* '<p class="tip3">' + d.name + */'<p class="tip1">' + d.type+ /*'</p> <p class="tip3">'+d.id+*/'</p>';
        return tip;}

    //create svg
    $scope.svg = d3.select('.graphic').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //make a rectangle so there is something to click on
    $scope.svg.append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "plot");

    //make a clip path for the graph
    var clip = $scope.svg.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    $scope.x = d3.scale.linear()
        .domain([
            d3.min(linedata, function(c) {
                console.log(c);
                return d3.min(c.values, function(v) { return v.id; }); }),
            d3.max(linedata, function(c) { return d3.max(c.values, function(v) { return v.id; }); })
        ])
        .range([0, width]);
    $scope.y = d3.scale.linear()
        .domain([
            d3.min(linedata, function(c) { return d3.min(c.values, function(v) { return v.type; }); }),
            d3.max(linedata, function(c) { return d3.max(c.values, function(v) { return v.type; }); })
        ])
        .range([height, 0]);

    var line = d3.svg.line()
        .x(function (d) {
            // console.log(d);
            return $scope.x(d.id);})
        .y(function (d) {
            return $scope.y(d.type);
        });

    //define the approx. number of x scale ticks
    // var xscaleticks = 5;

    //create and draw the x axis
    var xAxis = d3.svg.axis()
        .scale($scope.x)
        .orient("bottom");
        // .tickPadding(8)
        // .ticks(xscaleticks);

    $scope.svg.append("svg:g")
        .attr("class", "x axis");

    //create and draw the y axis
    var yAxis = d3.svg.axis()
        .scale($scope.y)
        .orient("left");
        // .tickSize(0-width)
        // .tickPadding(8);

    $scope.svg.append("svg:g")
        .attr("class", "y axis");

    //bind the data
    $scope.thegraph = $scope.svg.selectAll(".thegraph")
        .data(linedata);

    $scope.thegraphEnter=$scope.thegraph.enter().append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "thegraph")
        .attr('id',function(d){ return d.name+"-line"; })
        .style("stroke-width",2.5);

    //actually append the line to the graph
    $scope.thegraphEnter.append("path")
        .attr("class", "line")
        .style("stroke", function(d) { return color(d.name); })
        .attr("d", function(d) { return line(d.values[0]); })
        .transition()
        .duration(100)
        .attrTween('d',function (d){
            var interpolate = d3.scale.quantile()
                .domain([0,1])
                .range(d3.range(1, d.values.length+1));
            return function(t){
                return line(d.values.slice(0, interpolate(t)));
            };
        });

    //then append some 'nearly' invisible circles at each data point
    $scope.thegraph.selectAll("circle")
        .data( function(d) {return(d.values);} )
        .enter()
        .append("circle")
        .attr("class","tipcircle")
        .attr("cx", function(d,i){return $scope.x(d.id)})
        .attr("cy",function(d,i){return $scope.y(d.type)})
        .attr("r",12)
        .style('opacity', 1e-6)//1e-6
        .attr ("title", maketip);

    //append the legend
    $scope.legend = $scope.svg.selectAll('.legend')
        .data(linedata);

    $scope.legendEnter=$scope.legend
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('id',function(d){ return d.name; })
        .on('click', function (d) {                           //onclick function to toggle off the lines
            if($(this).css("opacity") == 1){				  //uses the opacity of the item clicked on to determine whether to turn the line on or off

                var elemented = document.getElementById(this.id +"-line");   //grab the line that has the same ID as this point along w/ "-line"  use get element cause ID has spaces
                d3.select(elemented)
                    .transition()
                    .duration(100)
                    .style("opacity",0)
                    .style("display",'none');

                d3.select(this)
                    .attr('fakeclass', 'fakelegend')
                    .transition()
                    .duration(100)
                    .style ("opacity", .2);
            } else {

                var elemented = document.getElementById(this.id +"-line");
                d3.select(elemented)
                    .style("display", "block")
                    .transition()
                    .duration(100)
                    .style("opacity",1);

                d3.select(this)
                    .attr('fakeclass','legend')
                    .transition()
                    .duration(100)
                    .style ("opacity", 1);}
        });

    var lastvalues = [];
    var range =new Array(selection.length);
 for(var i=0,l=selection.length;i<l;i++){range[i]=i*30;}
    console.log(range);
    //create a scale to pass the legend items through
    var legendscale= d3.scale.ordinal()
        .domain(lastvalues)
        .range(range);

    //actually add the circles to the created legend container
    $scope.legendEnter.append('circle')
        .attr('cx', width +20)
        // .attr('cy', function(d){return legendscale(d.values[d.values.length-1].type);})
        .attr('cy',function (d) {return legendscale(d.name);})
        .attr('r', 7)
        .style('fill', function(d) {
            return color(d.name);
        });

    //add the legend text
    $scope.legendEnter.append('text')
        .attr('x', width+35)
        // .attr('y', function(d){return legendscale(d.values[d.values.length-1].type);})
        .attr('y',function (d) {
            // console.log(linedata.indexOf(d));
            return legendscale(d.name);})
        .text(function(d){ return d.name; });

    // set variable for updating visualization
    $scope.thegraphUpdate = d3.transition($scope.thegraph);

    // change values of path and then the circles to those of the new series
    $scope.thegraphUpdate.select("path")
        .attr("d", function(d, i) {
            // if(!lastvalues.find(function (v) {return v == d.name;})){
                lastvalues[i]=d.name;
                lastvalues.sort(function (a,b){return b-a});
                // console.log(lastvalues);
                legendscale.domain(lastvalues);

                return line(d.values);
            // }
            //must be a better place to put this, but this works for now
            // lastvalues[i]=d.values[d.values.length-1].type;
        });

    $scope.thegraphUpdate.selectAll("circle")
        .attr ("title", maketip)
        .attr("cy",function(d,i){return $scope.y(d.type)})
        .attr("cx", function(d,i){return $scope.x(d.id)});


    // and now for legend items
    $scope.legendUpdate=d3.transition($scope.legend);

    $scope.legendUpdate.select("circle")
        .attr('cy', function(d, i){
            return legendscale(d.name);});

    $scope.legendUpdate.select("text")
        .attr('y',  function (d) {return legendscale(d.name);});


    // update the axes,
    d3.transition($scope.svg).select(".y.axis")
        .call(yAxis);

    d3.transition($scope.svg).select(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //make my tooltips work
    $('circle').tipsy({opacity:.9, gravity:'n', html:true});

    //define the zoom
    $scope.zoom = d3.behavior.zoom()
        .x($scope.x)
        .y($scope.y)
        .scaleExtent([1,8])
        .on("zoom", zoomed);

    function zoomed() {
        console.log('zoom start!');
        $scope.svg.select(".x.axis").call(xAxis);
        $scope.svg.select(".y.axis").call(yAxis);

        $scope.svg.selectAll(".tipcircle")
            .attr("cx", function(d,i){return $scope.x(d.id)})
            .attr("cy",function(d,i){return $scope.y(d.type)});

        $scope.svg.selectAll(".line")
            .attr("class","line")
            .attr("d", function (d) { return line(d.values)});
    }

}

function makeselect(shiftkey,$scope) {
   var  svg = $('svg');
    console.log('start selection');
    console.log($scope);
    if(shiftkey == 'zoom' || shiftkey == undefined){
        console.log(shiftkey);
        $('g.brush').remove();
        $scope.svg.call($scope.zoom);
    } else if(shiftkey =='tips') {
        $scope.svg = $scope.svg.call(d3.behavior.zoom().on("zoom", null));
        $('g.brush').remove();
        // var group=[];
        console.log(shiftkey);
        $scope.thegraphEnter.on("mouseover", function (d) {
            d3.select(this)                          //on mouseover of each line, give it a nice thick stroke
                .style("stroke-width",'6px');

            var selectthegraphs = $('.thegraph').not(this);     //select all the rest of the lines, except the one you are hovering on and drop their opacity
            d3.selectAll(selectthegraphs)
                .style("opacity",0.2);

            var getname = document.getElementById(d.name);    //use get element cause the ID names have spaces in them
            var selectlegend = $('.legend').not(getname);    //grab all the legend items that match the line you are on, except the one you are hovering on

            d3.selectAll(selectlegend)    // drop opacity on other legend names
                .style("opacity",.2);

            d3.select(getname)
                .attr("class", "legend-select");  //change the class on the legend name that corresponds to hovered line to be bolder
        })
            .on("mouseout",	function(d) {        //undo everything on the mouseout
                d3.select(this)
                    .style("stroke-width",'2.5px');

                var selectthegraphs = $('.thegraph').not(this);
                d3.selectAll(selectthegraphs)
                    .style("opacity",1);

                var getname = document.getElementById(d.name);
                var getname2= $('.legend[fakeclass="fakelegend"]');
                var selectlegend = $('.legend').not(getname2).not(getname);

                d3.selectAll(selectlegend)
                    .style("opacity",1);

                d3.select(getname)
                    .attr("class", "legend");
            })
            .on('click',function (d) {
               console.log(d);
                d3.select(this)
                    .classed('selected',true);
                d.selected=true;
            })
            .on('dblclick',function (d) {
                d3.select(this)
                    .classed('selected',false);
                d.selected=false;
                console.log(d);
            });
        console.log($('.selected'));
    }else if(shiftkey =='brush'){
        console.log(shiftkey);
        $scope.svg = $scope.svg.call(d3.behavior.zoom().on("zoom", null));
        var brush = $scope.svg.append("g")
            .datum(function () {return {selected: false};})
            .attr("class", "brush")
            .call(d3.svg.brush()
                .x(d3.scale.identity().domain([0, svg.width()]))
                .y(d3.scale.identity().domain([0, svg.height()]))
                .on("brush", function () {
                    var extent = d3.event.target.extent();
                    // console.log(extent);
                    $scope.thegraphUpdate.classed("selected", function (d) {
                        // console.log(this.classList);
                        // if(this.classList.find(function (v) {return v=='selevted';})) {
                        if(this.classList.length <=1){
                            var r = d.values.find(function (c) {
                                // console.log(c);
                                return extent[0][0] <= $scope.x(c.id) && $scope.x(c.id) <= extent[1][0]
                                    && extent[0][1] <= $scope.y(c.type) && $scope.y(c.type) <= extent[1][1];
                            });
                            // console.log(r)
                            d.selected =r;
                            return r;
                        }
                        // else return true;
                    });
                })
            );
    }
}

function lineUp(selection,shiftKey) {
    //
    // console.log(selection);
    //set the margins
    var margin = {top: 50, right: 160, bottom: 80, left: 50},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var size = [width, height];
// Parse the date / time
    var parseDate = d3.time.format("%d-%b-%y").parse;

// Set the ranges
    var x = d3.scale.linear().domain([0, 11]).range([0, width]);
    var y = d3.scale.linear().domain([0, 6]).range([height, 0]);

// Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);

// Adds the svg canvas
    var svg = d3.select(".line").append("svg")
        // .call(zoom)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var line = d3.svg.line()
        .interpolate("linear")
        .x(function (d) {
            return x(d.id);
        })
        .y(function (d) {
            return y(d.type);
        });

    var colors = d3.scale.category20();
// console.log(color);
// var a =d3.rgb(255,0,0);
// var b =d3.rgb(0,255,255);
// var color1 = d3.interpolate(a,b);
// var linear = d3.scale.linear()
//     .domain([1,64])
//     .range([0,1]);

    var linedata = [], node;
    selection.forEach(function (p) {
        linedata.push(p.rects);
        return p.rects;
    });

    console.log(linedata);
    svg.selectAll('.line')
        .data(linedata)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr('stroke', function (d, i) {
            // console.log(d);
            return colors[i % colors.length];
        })
        .attr("d", line);

    // Add the scatterplot
    node = svg.selectAll(".dots")
        .data(linedata)
        .enter()
        .append("g")
        .attr("class", "dots")
        .attr("clip-path", "url(#clip)");

    node.selectAll('.dot')
        .data(function (d, index) {
            // console.log(d);
            var a = [];
            d.forEach(function (point, i) {
                a.push({'index': index, 'point': point});
            });
            return a;
        })
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr("r", 2.5)
        .attr('fill', function (d, i) {
            return colors[d.index % colors.length];
        })
        .attr("transform", function (d) {
                return "translate(" + x(d.point.id) + "," + y(d.point.type) + ")";
            }
        );

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var brush = svg.append("g")
        .datum(function (d) {
            // console.log(d);
            return {selected: false};
        })
        .attr("class", "brush")
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([0, width]))
            .y(d3.scale.identity().domain([0, height]))
            .on("brush", function () {
                    var extent = d3.event.target.extent();
                    // console.log(extent);
                    node.classed("selected", function (d) {
                       var r= d.find(function (c) {
                            return extent[0][0] <= x(c.id) && x(c.id) < extent[1][0]
                                && extent[0][1] <= y(c.type) && y(c.type) < extent[1][1];
                        });
                        return d.selected =r;
                        });
            })
        );
}

function showStatistics1(blist) {
    console.log(blist);
        d3.json("../data/names3.json", function (res) {
            // console.log(res.length);

            res.forEach(function (d) {
                d.s = d.Pik * d.p;
                d.belong += 1;
            });
            res.sort(function (a, b) {
                return b.s - a.s; //按照由大到小排序
            });
            var clusters,plists,k=64;
            [clusters,plists] = kMeans1(res,k,[1000,1000]);
            // console.log(clusters);
            console.log(plists);//plists：[0]:groups;
            var array = [];
            for(var i=0,l=blist.length;i<l;i++){
                plists[blist[i]-1].forEach(function (d,i) {
                    array.push(d[0]);//d:[groupId,[posx,posy]]
                })
            }
            console.log(array);
            var listArray=[];

            res.forEach(function (d,i) {
                if(array.find(function (v) {return v ==d.groupId;})){
                    listArray.push(d.rects);
                }
            });
            console.log(listArray);

            $.get('../data/cartbehavior1S.txt').success(function (content) {
                var data=[];
                content=content.split(/\n/);
                //  var data=typeof (content);
                for(var i=0;i<content.length;i++){
                    var old = content[i];
                    // console.log(i,content[i]);
                    old=old.split(/\s+/);
                    record={
                        'segment':old[0],
                        'gender':old[1].toLocaleLowerCase(),
                        'years':old[2],
                        'time':old[3],
                        'clickStream':old[6]
                    };
                    record.clickStream=record.clickStream.split(',');
                    record.list=[];
                    for(var j=0;j<record.clickStream.length;j++){
                        var x=0;
                        switch (record.clickStream[j]){
                            case 'VIEW':
                                x=1;
                                break;
                            case 'ADD':
                                x=2;
                                break;
                            case 'REMOVE':
                                x=3;
                                break;
                            case 'UPDATE':
                                x=4;
                                break;
                            default:
                                x=5;
                        }
                        record.list.push(x);
                    }
                    if(old[4]=='N/A'){
                        record.cartSize=old[4];
                    }else if(old[4]<40){
                        var y=Math.floor(parseInt(old[4])/10);
                        record.cartSize='('+y*10+','+(y+1)*10+')';
                    }else record.cartSize='>40';
                    data.push(record)
                }
                console.log(data.length);
                var dataGroup=[];
                for(i=0,l=listArray.length;i<l;i++){
                    // console.log(dataGroup);
                    dataGroup=getData1(dataGroup,data,listArray[i]);
                }
                createCrossfilterGraphs1(dataGroup);
            });

        });


}
function getData1(dataGroup,data,list) {//dataGroup 要得到的统计数据，data，behavior.txt数据，list :rects
    var count=0;
    for(var i=0;i<data.length;i++){
        for(var j=0;j<list.length;j++){
            if((list[j].type-data[i].list[j])!=0)break;//跟 getData 不同的地方
        }
        if(j ==list.length){
            //console.log(i,j,data[i].list.length);
            dataGroup.push(data[i]);
            count++;
        }
    }
    return dataGroup;
}
//设置crossfilter
function createCrossfilterGraphs1(dataGroup) {
    var width = 250,
        height=250,
        record={};

    console.log('dataGroup');
    console.log(dataGroup);//dataGroup 和list一样的数据集
    var recordsCf = crossfilter(dataGroup);
    record.dim = {
        'segment':recordsCf.dimension(function (d) {
            return d.segment;
        }),
        'gender':recordsCf.dimension(function (d) {
            return d.gender;
        }),
        'years':recordsCf.dimension(function (d) {
            return d.years;
        }),
        'cartSize':recordsCf.dimension(function (d) {
            return d.cartSize;
        })
    };
    var segmentGroup = record.dim.segment.group().reduceCount(),
        genderGroup = record.dim.gender.group().reduceCount(),
        yearsGroup = record.dim.years.group().reduceCount(),
        cartSizeGroup = record.dim.cartSize.group().reduceCount();

    var segmentChart = dc.barChart('.segment'),
        genderChart = dc.barChart('.gender'),
        yearsChart = dc.barChart('.years'),
        cartSizeChart = dc.barChart('.cartSize');

    segmentChart.margins().left = 60;
    genderChart.margins().left = 60;
    yearsChart.margins().left = 60;
    cartSizeChart.margins().left = 60;

    segmentChart.width(width)
        .height(height)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Buyer Segment")
        .dimension(record.dim.segment)
        .group(segmentGroup)
        .elasticY(true)
        .controlsUseVisibility(true);
    genderChart.width(width)
        .height(height)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("gender")
        .dimension(record.dim.gender)
        .group(genderGroup)
        .elasticY(true)
        .controlsUseVisibility(true);
    yearsChart.width(width)
        .height(height)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Years being an eBay User")
        .dimension(record.dim.years)
        .group(yearsGroup)
        .elasticY(true)
        .controlsUseVisibility(true);
    cartSizeChart.width(width+100)
        .height(height)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Cart Size")
        .dimension(record.dim.cartSize)
        .group(cartSizeGroup)
        .elasticY(true)
        .controlsUseVisibility(true);
    dc.renderAll();
}