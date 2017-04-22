/**
 * Created by yqzheng on 2017/4/19.
 */
var app = angular.module('app',[]);
app.controller("ngCtl", [ '$scope', function($scope) {

    $scope.changeLineN = function (lineM) {
        console.log('changeLineN');
        console.log(lineM);
        d3.select('svg').remove();
        drawLine(lineM);
    };
    $scope.names = ["zoom", "brush"];
    $scope.changeOption = function (selectName) {
        shiftKey = (selectName == 'brush');
      console.log(selectName,shiftKey);
    };

    // $scope.changeBelong =function(belongN){
    //
    // }

    function drawLine(num) {
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

            var plists = getLists(selection,res);

            console.log(selection);
            lineUp(selection,shiftKey);
            redraw(selection);
        });

    }
}]);

function getLists(selection,data) {
    var plist = [];
    selection.forEach(function (d,i) {
        plist.find(function (p) {
            if(p.belong !==d.belong){

            }
        })
    })
}

function redraw(selection) {
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

    //create svg
    var svg = d3.select('.graphic').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.time.scale()
        .domain([
            d3.min(linedata, function(c) {
                console.log(c);
                return d3.min(c.values, function(v) { return v.id; }); }),
            d3.max(linedata, function(c) { return d3.max(c.values, function(v) { return v.id; }); })
        ])
        .range([0, width]);
    var y = d3.scale.linear()
        .domain([
            d3.min(linedata, function(c) { return d3.min(c.values, function(v) { return v.type; }); }),
            d3.max(linedata, function(c) { return d3.max(c.values, function(v) { return v.type; }); })
        ])
        .range([height, 0]);

    var line = d3.svg.line()
        .x(function (d) {
            // console.log(d);
            return x(d.id);})
        .y(function (d) {
            return y(d.type);
        });

    //define the approx. number of x scale ticks
    // var xscaleticks = 5;

    //create and draw the x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        // .tickPadding(8)
        // .ticks(xscaleticks);

    svg.append("svg:g")
        .attr("class", "x axis");

    //create and draw the y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
        // .tickSize(0-width)
        // .tickPadding(8);

    svg.append("svg:g")
        .attr("class", "y axis");

    //bind the data
    var thegraph = svg.selectAll(".thegraph")
        .data(linedata);

    var thegraphEnter=thegraph.enter().append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "thegraph")
        .attr('id',function(d){ return d.name+"-line"; })
        .style("stroke-width",2.5)

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

    // var zoom = d3.behavior.zoom()
    //     .x(x)
    //     .y(y)
    //     .scaleExtent([1, 10])
    //     .on("zoom", function(){
    //         console.log("zoom");
    //         if(shiftKey == false)
    //         zoomed();
    //     });
    //
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
            // console.log(d);
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

    function zoomed() {
        if (shiftKey) {
            console.log('zoom shiftKey');
            return;
        }
        console.log('start');
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll('path.line').attr('d', line);

        // node.selectAll('circle').attr("transform", function (d) {
            // console.log(d);
            //     return "translate(" + x(d.point.id) + "," + y(d.point.type) + ")";
            // }
        // );
    }

    // line.data(linedata).enter();

    var brush = svg.append("g")
        .datum(function (d) {
            // console.log(d);
            return {selected: false};
        })
        .attr("class", "brush")
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([0, width]))
            .y(d3.scale.identity().domain([0, height]))
            // .on("brushstart", function(d) {
            //     // svg = svg.call(d3.behavior.zoom().on("zoom", null));
            //     // console.log('brushstart');
            //     // line.each(function(d) { d.previouslySelected = shiftKey && d.selected });
            //     if (!shiftKey) {
            //         d3.event.target.clear();
            //         d3.select(this).call(d3.event.target);
            //     }
            // })
            .on("brush", function () {
                // if(shiftKey){
                //     console.log('shiftKey', shiftKey);
                    var extent = d3.event.target.extent();
                    // console.log(extent);
                    node.classed("selected", function (d) {
                       var r= d.find(function (c) {
                            return extent[0][0] <= x(c.id) && x(c.id) < extent[1][0]
                                && extent[0][1] <= y(c.type) && y(c.type) < extent[1][1];
                        });
                        return d.selected =r;
                        });
                // } else {
                //     d3.event.target.clear();
                //     d3.select(this).call(d3.event.target);
                // }
            })
        );

            // .on("brushend", function() {
            // }));

    // var shiftKey;
    // d3.select(window)
    //     .on('keydown', function () {
    //         shiftKey = d3.event.shiftKey;
    //     })
    //     .on('keyup', function () {
    //         shiftKey = false;
    //     });
}