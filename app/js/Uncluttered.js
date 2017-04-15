/**
 * Created by yqzheng on 2017/3/29.
 */

function getLayout1(data,size,widthScale,maxLen){
    var bounds = [],
        spiral = rectangularSpiral(size),
        groupNum = Math.min(data.length,maxLen),
        outputRects = [],
        spiralInt = 0,
        spiralStep = 0.5,
        padding = 1,
        numMax = data[0].num,clusters,plists,idx,k=64,num,group,i,j,isConflicting,t=0,
        maxSize=[0,0],bound;
    [clusters,plists]=kMeans1(data,k,size);
    console.log(clusters);
    console.log(plists);
    k=clusters.length;
    for (i=0;i<k&&t<groupNum ;i++){
        idx = clusters[i].belong;
        spiralInt = clusters[i].pos[1];
      //  console.log(spiralInt);
        var items=plists[idx],test=0;
        //console.log(items);
        if(items.length>0){
            for(j=0,num=items.length;j<num;j++){
                group = findId(items[j][0],data,size);
                group.rectLength= (widthScale[1] - widthScale[0]) / numMax * group.num + widthScale[0];
                rectsLength = group.rects.length;//矩形数量
                do {
                    bound = getBound(spiral(spiralInt), group.rectLength, rectsLength);
                    isConflicting = judgeBound(bound, bounds, padding);
                    spiralInt += spiralStep;
                    test++;
                }while (isConflicting && test < 1000);
                bounds.push(bound);
                maxSize=pushGroupRects(group, bound,outputRects,maxSize);
                t++;
            }
        }
    }
    return [outputRects,maxSize];
}

//将svg添加到body上去、width&height分别是图大小
function draw1(id,rects,maxSize,data) {
    d3.select('#'+id).append("svg")
        .attr("width", 1000)
        .attr("height", 1000)
        .append("g")
        .attr("transform", "translate(150,250)")
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
          //  showup(d,data);
            return color(d.type);
        })
        .on("click",function (d) {
            showup(d,data);
        });
}

var size = [20, 20],widthScale = [5, 20],showN=3000,x=0.1;

d3.json("../data/names.json",function (res) {
    for(var i=0;i<res.length;i++){
        res[i].s=res[i].Pik*res[i].p;

    }
    res.sort(function (a,b) {
        return b.s-a.s; //按照由大到小排序
    });

    result1=getLayout1(res,size,widthScale,showN);
    console.log(result1[0]);
    console.log(result1[1]);
    draw1('Uncluttered',result1[0],result1[1],res);
});

//txt原始数据的处理
function showStatistics(list){
    // console.log(list);
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
   // console.log(data[0]);
    createCrossfilterGraphs(data,list);
});
}

//设置crossfilter
function createCrossfilterGraphs(data,list) {
    var width = 250,
        height=250,
        record={},
        dataGroup=[],
        count=0;
    for(var i=0;i<data.length;i++){
    //for(var i=0;i<100;i++){
       // if(data[i].list.length==2)console.log(data[i]);
       //  if(data[i].list.length!=list.length){
       //      //console.log(data[i]);
       //      continue;
       //  }
        for(var j=0;j<list.length;j++){
            if((list[j]-data[i].list[j])!=0)break;
        }
        if(j ==list.length){
            //console.log(i,j,data[i].list.length);
            dataGroup.push(data[i]);
            count++;
        }
    }
    console.log(count);
    console.log(dataGroup);
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
//kmeans算法实现：
function kMeans1(data,k,size){
    console.log(data[0]);
    var points=[];
    for(var i=0;i<data.length;i++){
        var temp={};
        temp.belong=data[i].belong;
        temp.pos=[data[i].groupId,[data[i].OutputX*size[0],data[i].OutputY*size[1]]];
      //  temp.groupId = data[i].groupId;
        points.push(temp);
    }
    console.log(points[0]);
    var plen = points.length,
        clusters =[],
        seen = [],
        // x=new Array(64),
        j,found=false;
    i=0;
   while(clusters.length<=k && i<plen){
       //console.log(i);
       idx=points[i].belong;
      //console.log(data[i]);
       found = false;
       for(j=0;j<seen.length;j++){
           if(idx==seen[j]){
               found=true;
               break;
           }
       }
       if(!found){
           // x[idx]=0;
           seen.push(idx);
           clusters.push(points[i]);
          // console.log(x);
       }
       i++;
   }
 // k=clusters.length;
   console.log(clusters[0]);
   var wcss=0,sum=0,t=0;
    for (j = 0; j < plen; j++) {
        for (i = 0; i < clusters.length; i++){
            //console.log(wcss);
            sum += euclidean(points[j].pos[1], clusters[i].pos[1]);
        }
    }
    console.log(sum);
 // do{
      //  sum=wcss;
       var plists = [];
       for (i = 0; i < k; i++) {
           plists.push([]);
       }
       console.log(plists);
       for (j = 0; j < plen; j++) {
           var p = points[j].pos,
               g = points[j].label,
               smallest_distance = 10000000,
               idx = 0,
               // dist=[],
               distance;
        //   console.log(typeof(g) == 'undefined');
           if (typeof(g) == 'undefined') {
               for (i = 0; i < clusters.length; i++) {
                   distance = euclidean(p[1], clusters[i].pos[1]);
                   if (distance < smallest_distance) {
                       //console.log([distance, smallest_distance]);
                       smallest_distance = distance;
                       idx = i;
                   }
               }
           } else {
               idx = g;
           }
           //console.log(idx);
           plists[idx].push(p);
       }

       for (i = 0; i < clusters.length; i++) {
           //var old = clusters[i].pos;
           var key = clusters[i].belong,
               list = plists[key],//keyç±»çš„æ‰€æœ‰ç‚¹çš„posé›†åˆ
               center = null;

           if (list.length > 0) {
               center = calculateCenter(plists[key], 2);
           } else {
               center = calculateCenter([clusters[i].pos[1]], 2);
           }
           //console.log(i,center);
           clusters[i].pos = center;
       }
       // wcss=0;
       // for (j = 0; j < plen; j++) {
       //     for (i = 0; i < clusters.length; i++) {
       //         wcss += euclidean(points[j].pos, clusters[i].pos);
       //        // console.log(wcss);
       //     }
       // }
       // console.log(wcss,sum);
       // t++;
  // }while (wcss>sum && t<5)
    return [clusters,plists];
}
function euclidean(p1, p2) {
    var s = 0;
    for ( i = 0, l = p1.length; i < l; i++) {
        s += Math.pow(p1[i] - p2[i], 2);
    }
    return Math.sqrt(s);
}
function calculateCenter(points, n) {
    //console.log(points);
    var vals = [];
    // var plen = 0;
    for ( i = 0; i < n; i++) { vals.push(0); }
    //var vals=new Array(n);
    for (var i = 0, l = points.length; i <l; i++) {
        // plen++;
        for ( j = 0; j < n; j++) {
            vals[j] += points[i][1][j];
        }
    }
    for ( i = 0; i < n; i++) {
        // if (plen >= 0){
            vals[i] = vals[i] / l;
        // }
    }
    return vals;
}