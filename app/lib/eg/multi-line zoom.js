/**
 * Created by yqzheng on 2017/4/19.
 */

//************************************************************
// Data notice the structure
//************************************************************
var data = 	[
    [{'x':1,'y':0},{'x':2,'y':5},{'x':3,'y':10},{'x':4,'y':0},{'x':5,'y':6},{'x':6,'y':11},{'x':7,'y':9},{'x':8,'y':4},{'x':9,'y':11},{'x':10,'y':2}],
    [{'x':1,'y':1},{'x':2,'y':6},{'x':3,'y':11},{'x':4,'y':1},{'x':5,'y':7},{'x':6,'y':12},{'x':7,'y':8},{'x':8,'y':3},{'x':9,'y':13},{'x':10,'y':3}],
    [{'x':1,'y':2},{'x':2,'y':7},{'x':3,'y':12},{'x':4,'y':2},{'x':5,'y':8},{'x':6,'y':13},{'x':7,'y':7},{'x':8,'y':2},{'x':9,'y':4},{'x':10,'y':7}],
    [{'x':1,'y':3},{'x':2,'y':8},{'x':3,'y':13},{'x':4,'y':3},{'x':5,'y':9},{'x':6,'y':14},{'x':7,'y':6},{'x':8,'y':1},{'x':9,'y':7},{'x':10,'y':9}],
    [{'x':1,'y':4},{'x':2,'y':9},{'x':3,'y':14},{'x':4,'y':4},{'x':5,'y':10},{'x':6,'y':15},{'x':7,'y':5},{'x':8,'y':0},{'x':9,'y':8},{'x':10,'y':5}]
];

var colors = [
    'steelblue',
    'green',
    'red',
    'purple'
];


//************************************************************
// Create Margins and Axis and hook our zoom function
//************************************************************
var margin = {top: 20, right: 30, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, 12])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([-1, 16])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(-height)
    .tickPadding(10)
    .tickSubdivide(true)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .tickPadding(10)
    .tickSize(-width)
    .tickSubdivide(true)
    .orient("left");

var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);



//************************************************************
// Generate our SVG object
//************************************************************
var svg = d3.select("body").append("svg")
    .call(zoom)
    // .call(gbrush)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", (-margin.left) + 10)
    .attr("x", -height/2)
    .text('Axis Label');

svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);





//************************************************************
// Create D3 line object and draw data on our SVG object
//************************************************************
var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

console.log(data);

svg.selectAll('.line')
    .data(data)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("clip-path", "url(#clip)")
    .attr('stroke', function(d,i){
        return colors[i%colors.length];
    })
    .attr("d", line);




//************************************************************
// Draw points on SVG object based on the data given
//************************************************************
var points = svg.selectAll('.dots')
    .data(data)
    .enter()
    .append("g")
    .attr("class", "dots")
    .attr("clip-path", "url(#clip)");

points.selectAll('.dot')
    .data(function(d, index){
        console.log(d);
        var a = [];
        d.forEach(function(point,i){
            a.push({'index': index, 'point': point});
        });
        return a;
    })
    .enter()
    .append('circle')
    .attr('class','dot')
    .attr("r", 2.5)
    .attr('fill', function(d,i){
        return colors[d.index%colors.length];
    })
    .attr("transform", function(d) {
        return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
    );






//************************************************************
// Zoom specific updates
//************************************************************
function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    svg.selectAll('path.line').attr('d', line);

    points.selectAll('circle').attr("transform", function(d) {
        return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
    );
}

//brush test
// var brush = svg.append("g")
//     .attr("class", "brush")
//     .call(d3.svg.brush()
//         .x(d3.scale.identity().domain([0, width]))
//         .y(d3.scale.identity().domain([0, height]))
//         .on("brush", function() {
//             var extent = d3.event.target.extent();
//             line.classed("selected", function(d) {
//                 return extent[0][0] <= d.x && d.x < extent[1][0]
//                     && extent[0][1] <= d.y && d.y < extent[1][1];
//             });
//         }));
// var brush = svg.append('g')
//     .datum(function () {return {selected: false};})
//     .attr('class','brush')
//     .call(gbrush);
//
// var gbrush = d3.svg.brush()
//     .x(d3.scale.identity().domain([0, width]))
//     .y(d3.scale.identity().domain([0, height]))
//     .extent([[0,0],[width,height]])
//     .on("brush", brushed);
// // .attr('class','brush1');
//
// function brushed() {
//     // x.domain(gbrush.empty() ? x.domain() : gbrush.extent());
//     // y.domain(gbrush.empty() ? y.domain() : gbrush.extent());
//     d3.select(".area").attr("d", line);
//     d3.select(".x.axis").call(xAxis);
//     d3.select(".y.axis").call(yAxis);
// }

// var focus = svg.append("g")
//         .attr("class", "focus")
//         .attr("transform",
//             "translate(" + margin.left + "," + margin.top + ")")
//     ;