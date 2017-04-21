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

    $scope.lineBelong = function () {

    };

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

            lineUp(selection);
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

function lineUp(selection) {
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

    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([1, 10])
        .on("zoom", function(){
            console.log("zoom");
            if(shiftKey == false)
            zoomed();
        });
    //
// Adds the svg canvas
    var svg = d3.select(".line").append("svg")
        .call(zoom)
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
        // p.dxdy=[];
        // rects.forEach(function (d) {
        //     dxdy.push(d.id,d.type);
        // });
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

        node.selectAll('circle').attr("transform", function (d) {
            console.log(d);
                return "translate(" + x(d.point.id) + "," + y(d.point.type) + ")";
            }
        );
    }

    var brush = svg.append("g")
        .attr("class", "brush")
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([0, width]))
            .y(d3.scale.identity().domain([0, height]))
            .on("brushstart", function(d) {
                svg = svg.call(d3.behavior.zoom().on("zoom", null));
                console.log('brushstart');
                // line.each(function(d) { d.previouslySelected = shiftKey && d.selected });
                if (!shiftKey) {
                    d3.event.target.clear();
                    d3.select(this).call(d3.event.target);
                }
            })
            .on("brush", function () {
                if(shiftKey){
                    console.log('shiftKey', shiftKey);
                    var extent = d3.event.target.extent();
                    line.classed("selected", function (d) {
                    return d.selected = extent[0][0] <= d.id && d.id < extent[1][0]
                        && extent[0][1] <= d.type && d.type < extent[1][1];
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

    var shiftKey;
    d3.select(window)
        .on('keydown', function () {
            shiftKey = d3.event.shiftKey;
        })
        .on('keyup', function () {
            shiftKey = false;
        });
}