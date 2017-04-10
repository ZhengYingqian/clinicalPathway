/**
 * Created by xiaoyu on 17-3-12.
 */
"use strict";
var color = d3.scale.category20(),
    rectsData;
d3.json("data/names.json", function (res) {
    console.log(res);
    rectsData = getLayout(res);
    draw(rectsData);
});
function getLayout(data) {
    var size = [800, 800],
        spiral = archimedeanSpiral(size),
        // spiral = rectangularSpiral(size),
        widthScale = [20, 100],
        bounds = [],
        outputRects = [],
        spiralInt = 0,
        spiralStep = 0.5,
        padding = 1,
        isConflicting,
        groupsNum,
        groupRects,
        group,
        rectsLength,
        bound,
        i,
        test = 0,
        numMax = data[0].num;
    groupsNum = data.length;
    groupsNum = 100;
    data = data.sort(function (a, b) {
        return b.rectLength - a.rectLength;
    });
    for (i = 0; i < groupsNum; i++) {
        group = data[i];
        group.rectLength = (widthScale[1] - widthScale[0]) / numMax * group.num + widthScale[0];
        rectsLength = group.rects.length;
        do {
            bound = getBound(spiral(spiralInt), group.rectLength, rectsLength);
            isConflicting = judgeBound(bound, bounds, padding);
            spiralInt += spiralStep;
            console.log(spiralInt);
            test++;
        } while (isConflicting && test < 100000);
        bounds.push(bound);
        pushGroupRects(group, bound, outputRects);
    }
    return outputRects;
}
// rectsData = getLayout(rectGroups);
// console.log(rectsData);
// draw(rectsData);
function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function (t) {
        return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
}
function rectangularSpiral(size) {
    var dy = 4,
        dx = dy * size[0] / size[1],
        x = 0,
        y = 0;
    return function (t) {
        var sign = t < 0 ? -1 : 1;
        // See triangular numbers: T_n = n * (n + 1) / 2.
        switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
            case 0:  x += dx; break;
            case 1:  y += dy; break;
            case 2:  x -= dx; break;
            default: y -= dy; break;
        }
        return [x, y];
    };
}
function getBound(center, rectLength, rectsNum) {
    var x0, y0, x1, y1, halfL;
    halfL = rectsNum / 2 * rectLength;
    x0 = center[0] - halfL;
    x1 = center[0] + halfL;
    y0 = center[1] - rectLength / 2;
    y1 = center[1] + rectLength / 2;
    return [x0, y0, x1, y1];
}
function judgeBound(bound, bounds, padding) {
    var l = bounds.length,
        x0 = bound[0],
        y0 = bound[1],
        x1 = bound[2],
        y1 = bound[3],
        isCon = false,
        pad = padding || 0,
        i;
    for (i = 0; i < l; i++) {
        isCon = !(x0 > bounds[i][2] + pad || x1 < bounds[i][0] - pad ||
            y0 > bounds[i][3] + pad || y1 < bounds[i][1] - pad);
        if (isCon) {
            break;
        }
    }
    return isCon;
}
function pushGroupRects(group, bound, outputRects) {
    var rects = group.rects,
        x = bound[0],
        y = bound[1],
        l = rects.length,
        i;
    for (i = 0; i < l; i++) {
        rects[i].x = x;
        rects[i].y = y;
        rects[i].width = group.rectLength;
        rects[i].height = group.rectLength;
        outputRects.push(rects[i]);
        x += group.rectLength;
    }
}
function draw(rects) {
    console.log(d3);
    d3.select("body").append("svg")
        .attr("width", 1000)
        .attr("height", 1000)
        .append("g")
        .attr("transform", "translate(500,500)")
        .selectAll(".rect")
        .data(rects)
        .enter().append("rect")
        .attr("x", function (d) {
            console.log(d);
            return d.x;
        })
        .attr("y", function (d) {
            // console.log(d);
            return d.y;
        })
        .attr("width", function (d) {
            return d.width;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .style("fill", function (d) {
            return color(d.type);
            // return "steelblue";
        });
}
