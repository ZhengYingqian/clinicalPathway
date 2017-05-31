/**
 * Created by yqzheng on 2017/3/29.
 */
//返回沿螺旋线方向的函数
function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function (t) {
        return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
}
//返回环绕矩形方向的函数
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
//返回四个顶点位置
function getBound(center, rectLength, rectsNum) {
    var x0, y0, x1, y1, halfL;
    halfL = rectsNum / 2 * rectLength;//矩形半长度
    x0 = center[0] - halfL;
    x1 = center[0] + halfL;
    y0 = center[1] - rectLength / 2;
    y1 = center[1] + rectLength / 2;
    return [x0, y0, x1, y1];
}
//根据状态S的type 返回相应的颜色
function color(num) {
    var colorMap={
        "1": "#3385FF",
        "2":"#FF9900",
        "3":"#FF0000",
        "4":"#FFFF00",
        "5":"#00FF00"
        // "6":"#FFA07A"
    };
   // console.log(colorMap[num]);
    return colorMap[num];
}
//group：类，bound [x0, y0, x1, y1],outputRects：最终输出所有结果的矩阵
function pushGroupRects(group, bound, outputRects,maxSize) {
    var rects = group.rects,
        x = bound[0],
        y = bound[1],
        l = rects.length,
        i;
    //对每一个状态添加位置信息，并连接起来
    for (i = 0; i < l; i++) {
        rects[i].x = x;
        rects[i].y = y;
        rects[i].width = group.rectLength;
        rects[i].height = group.rectLength;
        rects[i].groupId=group.groupId;
        outputRects.push(rects[i]);
        x += group.rectLength;
        maxSize[0]=Math.max(x,maxSize[0]);
    }
    maxSize[1]=Math.max(y,maxSize[1]);
    return maxSize;
}
//根据grooupId返回具体数据
function findId(id,data,size) {
    // console.log(id,data);
    for( var i=0;i<data.length;i++){
        if(id ===data[i].groupId){
            // data[i].OutputX*=size[0];
            // data[i].OutputY*=size[1];
            return data[i];
        }
    }
}
//判断是否冲突
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
//进行整体布局
function getLayout(data,size,widthScale,maxlen){
    var bounds = [],
        groupNum = Math.min(data.length,maxlen),
        outputRects = [],
        numMax = data[0].num,
        maxSize=[0,0],bound,group;
    for (var i=0;i<groupNum;i++){
        group=data[i];
        //序列矩形的总长度
        group.rectLength = (widthScale[1] - widthScale[0]) / numMax * group.num + widthScale[0];
        rectsLength = group.rects.length;//矩形数量
        bound=[group.OutputX*size[0],group.OutputY*size[0]];
        bounds.push(bound);
        maxSize=pushGroupRects(group, bound,outputRects,maxSize);
    }
    return [outputRects,maxSize];
}
//将svg添加到body上去、width&height分别是图大小
function draw(id,rects,maxSize,data) {
    d3.select('#'+id).append("svg")
        .attr("width", maxSize[0])
        .attr("height", maxSize[1])
        .append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".rect")//选择标签rect
        .data(rects)//绑定数据
        .enter().append("rect")//表示rect的连续绑定
        .attr("x", function (d) {
            // console.log(d);
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
        })
        .on("click",function (d) {
            showup(d,data);
        });
}
var s='<hr />'+'<h3>Selected Stream:</h3><div class = \'stastic\'></div><hr /><h3>Statistic Data</h3>';
function showup(d,data) {
    $('.showup').html(s);
   // document.write(s);
    console.log(d);
   //console.log(data);
    var temp,list,base1=[0,0];
   for(var i=0,l=data.length;i<l;i++){
       if(d.groupId===data[i].groupId){
           temp=data[i];
           console.log(temp);
       }
   }
   list=temp.rects;
    i=-1;
    d3.select(".stastic svg").remove();
    d3.select(".stastic text").remove();
    var svg =d3.select(".stastic").append('svg')
        .attr("width",400)
        .attr("height",20)
        .append("g")
        .selectAll('.rect')
        .data(list)
        .enter();
    svg.append("rect")
        .attr("x",function () {
            i++;
            return base1[0]+i*20;
        })
        .attr("y",function () {
            return base1[1];
        })
        .attr("width",widthScale[1])
        .attr("height",widthScale[1])
        .style("fill",function (d) {
            return color(d.type);
        });
    var txt='',newList=[];
    for(i=0;i<list.length;i++){
        // if(i<list.length-1)
        // txt=txt+dic[list[i].type]+', ';
        // else
        txt=txt+dic[list[i].type]+' ';
        newList.push(list[i].type);
       // console.log(txt);
    }
    // console.log(newList);
    showStatistics(newList);
   d3.select('.stastic').append('text')
        .attr('x',base1[0])
        .attr('y',base1[1]+40)
        .text(txt);
}
var size = [1000, 1000],widthScale = [5, 20],showN=1000,x=0.1;

d3.json("../data/names16.json",function (res) {
    for(var i=0;i<res.length;i++){
        res[i].s=res[i].Pik*res[i].num;

    }
    res.sort(function (a,b) {
        return b.s-a.s; //按照由大到小排序
    });
    //console.log(res);
    result=getLayout(res,size,widthScale,showN);
   draw('Clustered',result[0],result[1],res);
});