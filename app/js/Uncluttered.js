/**
 * Created by yqzheng on 2017/3/29.
 */
//两个数组想加的函数
function arradd(a,b) {
    var c = [];
    a.forEach(function(v, i) {
        c.push(v + b[i]);
    });
    return c;
}
//layout函数
function getLayout1(data,size,widthScale,maxLen){
    var bounds = [],
        spiral = archimedeanSpiral(size),
        groupNum = Math.min(data.length,maxLen),
        outputRects = [],
        spiralInt = 0,
        spiralStep = 0.5,
        padding = 1,
        numMax = data[0].num,clusters,plists,idx,k=16,num,group,i,j,isConflicting,t=0,
        maxSize=[0,0],bound;
    [clusters,plists]=kMeans1(data,k,size);
    console.log(clusters);
    console.log(plists);
    k=clusters.length;
    for (i=0;i<k&&t<groupNum ;i++){
        idx = clusters[i].belong;
        spiralInt = 0;
     // console.log(i,spiralInt);
        var items=plists[idx],test=0;
     //   console.log(items);
        if(items.length>0){
            for(j=0,num=items.length;j<num;j++){
                group = findId(items[j][0],data,size);
                // console.log(group);
                group.rectLength= (widthScale[1] - widthScale[0])*group.Pik + widthScale[0];
                rectsLength = group.rects.length;//矩形数量
                do {

                    bound = getBound(arradd(spiral(spiralInt),clusters[i].pos), group.rectLength, rectsLength);
                    isConflicting = judgeBound(bound, bounds, padding);
                    spiralInt += spiralStep;
                    test++;
                }while ( isConflicting && test < 100000);
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
    var shiftKey;
    var svg = d3.select('#' + id).append("svg")
        .attr("width", maxSize[0])
        .attr("height", maxSize[1])
        .append("g")
        .attr("transform", "translate(0,0)");

    var rect = svg.append('rect')
        .attr('pointer-events', 'all')
        .attr('width', maxSize[0])
        .attr('height', maxSize[1])
        .style('fill', 'none');

    var rectL = svg.selectAll(".rect")//选择标签rect
        .data(rects)//绑定数据
        .enter()
        .append("rect")//表示rect的连续绑定
        .attr('class', 'rect')
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
        .on("dbclick", function (d) {
            clear_selection();
            if (shiftKey) {
                d3.select(this).classed("selected", d.selected = true);
            }
            else {
                rectL.classed("selected", function (p) {
                    return p.selected = d === p;
                });
            }
        });
    rectL.classed('selected', function (d) {
        return d.selected;
    });

    var x = d3.scale.linear()
        .range([0, maxSize[0]]);

    var y = d3.scale.linear()
        .range([maxSize[1], 0]);

    var selection = [], lis = [];
    var brush = svg.append('g')
        .attr('class', 'brush')
        .datum(function (d) {return {selected: false}})
        .call(d3.svg.brush()
            .x(d3.scale.identity().domain([0, maxSize[0]]))
            .y(d3.scale.identity().domain([0, maxSize[1]]))
            .on('brush', function (d) {
                d3.select('.showup svg').remove();
                if (shiftKey) {
                    var extent = d3.event.target.extent();
                    // console.log(extent);
                    rectL.classed('selected', function (d) {
                        return d.selected = extent[0][0] <= d.x && d.x <= extent[1][0]
                            && extent[0][1] <= d.y && (d.y) <= extent[1][1];
                    });
                } else {
                    d3.event.target.clear();
                    d3.select(this).call(d3.event.target);
                }
            })
            .on("brushend", function () {
                d3.event.target.clear();
                d3.select(this).call(d3.event.target);
                console.log(rectL);
                selection = [];
                lis = [];
                svg.selectAll('.legend').remove();
                get_selection(selection, lis);
                drawLegend(selection,lis);
            })
        );

    d3.select(window).on("keydown", function () {
        shiftKey = d3.event.shiftKey;
        if (shiftKey) {
            rect = rect.attr('pointer-events', 'none');
        } else {
            rect = rect.attr('pointer-events', 'all');
        }
    });
    d3.select(window).on("keyup", function () {
        shiftKey = d3.event.shiftKey;
        if (shiftKey) {
            rect = rect.attr('pointer-events', 'none');
        } else {
            rect = rect.attr('pointer-events', 'all');
        }
    });
    //添加图例
    function drawLegend(selection,lis) {
    var color = d3.scale.category20();
    console.log(lis);
    var legend = d3.select('.showup').append('svg').selectAll(".legend")
    // .data(color.domain())
        .data(lis)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate("+ i * 30 +",0 )";
        });
    // console.log(color.domain());
    legend.append("rect")
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 18)
        .style("fill", function (d) {return color(d)});

    legend.append("text")
        .attr("y", 30)
        .attr("dx", "3em")
        .style("text-anchor", "end")
        .text(function (d) {return d;});

    legend.on('click', function (d) {
        selection = [];
        showSelected(d,data);
    });
}
    //根据selected===true判断是否展示
    function get_selection(selection,lis){
        rectL.each(function(d) {
            if (d.selected) {
                selection.push(d);
            }
        });

        rectL .attr('opacity',function (d) {return d.selected ? 1:0.5;});

        console.log(selection);
        selection.forEach(function (d) {
            var temp =findId(d.groupId,data,[]);
            var idx = lis.find(function(val){return val ==temp.belong});
            if(!idx){lis.push(temp.belong)}
        });

        showStatistics1(lis);
        rectL.classed('selected', function (d) { return d.selected = false; });
    }
    //单个类别显示
    function showSelected(belong,data) {
        var groupIdGroup = [];
        data.forEach(function (p) {
            if(p.belong ==belong){
                groupIdGroup.push(p.groupId);
            }}
        );
        console.info('groupIdGroup');
        console.log(groupIdGroup);
        rectL.each(function (d) {
            // if(d.groupId ==belong){
            if(groupIdGroup.find(function (c) {return c ==d.groupId}) ){
                d.selected = true;
            }else d.selected =false;
        });
        rectL.classed('selected', function (d) {
            return d.selected;})
            .attr('opacity', function (d) {
            return d.selected ? 1 : 0.5;
        })

        get_selection([],[belong])
    }
    //清除选中序列和添加的svg图
    function clear_selection() {
        rectL.classed('selected', function (d) { return d.selected = false; });
        d3.selectAll('.legend').remove();
    }
}

var size = [1000, 1000],widthScale = [5, 10],showN=1100,x=0.1;
d3.json("../data/names16_patientData5.json",function (res) {
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
$.get('../data/statistics.json').success(function (content) {
    var data=[];
    console.log(content);
    // content=content.split(/\n/);
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
    var dataGroup=[];
    getData(dataGroup,data,list);
});
}
function getData(dataGroup,data,list) {//dataGroup 要得到的统计数据，data，behavior.txt数据，list :rects
    var count=0;
    for(var i=0;i<data.length;i++){
        for(var j=0;j<list.length;j++){
            if((list[j]-data[i].list[j])!=0)break;
        }
        if(j ==list.length){
            //console.log(i,j,data[i].list.length);
            dataGroup.push(data[i]);
            count++;
        }
    }
    createCrossfilterGraphs(dataGroup)
}
//设置crossfilter
function createCrossfilterGraphs(dataGroup) {
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

//kmeans算法实现：
function kMeans1(data,k,size){
    console.log(data[0]);
    var points=[];
    for(var i=0;i<data.length;i++){
        var temp={};
        temp.belong=data[i].belong;
        temp.pos=[data[i].groupId,[data[i].OutputX*size[0],data[i].OutputY*size[1]]];
        points.push(temp);
    }
    console.log(points[0]);
    var plen = points.length,
        clusters =[],
        seen = [],
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
               list = plists[key],
               center = null;
           // console.log(list);
           if(typeof (list)!='undefined') {
               if (list.length > 0) {
                   center = calculateCenter(plists[key], 2);
               } else {
                   center = calculateCenter([clusters[i].pos[1]], 2);
               }
               //console.log(i,center);
               clusters[i].pos = center;
           }
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