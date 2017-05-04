/**
 * Created by qian on 2017/5/3.
 */
;
// 将circle换成矩形做的尝试
var rectGroup = svg.select('.graphic');

rectGroup.append('g')
    .selectAll('.rectg')
    .data(rectGroups)
    .enter()
    .append('rect')
    .attr('class','.rectg');

group = svg.selectAll('.rects')
    .data(res)
    .enter().append('g');

group.attr('class','rects')
    .attr('x',function (d) {
        // console.log(d);
    });

