/**
 * Created by yqzheng on 2017/4/20.
 */
angular.module('app',[])
    .controller('mainCtrl',['$scope',function ($scope) {
        console.log('maincrtl works!');
        var drugs=['',"维生素C", "5%葡萄糖",  "抗贫血药物", "头孢菌素类", "滋阴润肠口服液","复方三维B"],
            undrugs=["大换药","护理","备皮","清洁灌肠","备血","医用垫单","留置导尿","吸氧","持续心电监护","血氧饱和度监测","液基薄层细胞制片术","正位片","人乳头瘤病毒核酸检测","肿瘤指标物九项","禁食禁饮","术前灌肠","使用防下肢血栓气压泵治疗"],
            ops=["全子宫切除术","双附件切除术","子宫肌瘤切除术","腹腔镜探查术","卵巢囊肿剥除术","宫腔镜检查术"],
            items=drugs.concat(undrugs.concat(ops));
        $scope.dic=[];
        function randomHexColor() { //随机生成十六进制颜色
            return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
        }
        var colorMap=new Array(30);
        for(var i=0;i<30;i++){
            colorMap[i]=randomHexColor()
        }
        for(var j in items){
            j=parseInt(j);
            var tempItem={};
            tempItem.index=parseInt(j);
            tempItem.name=items[j];
            if(j==0){
                tempItem.type='无'
            } else if(j<7){
                tempItem.type='诊断用药';
            }else  if(j<24){
                tempItem.type='操作检查';
            }else tempItem.type='手术项目';
            tempItem.color=colorMap[parseInt(j)];
            $scope.dic.push(tempItem);
        }
        var size=[500,500];
        var margin = {top: 20, right: 20, bottom: 30, left: 40};
        var width = size[0],height = size[1];
        var x = d3.scale.linear()
            .range([0, width]);
        var y = d3.scale.linear()
            .range([height, 0]);
        var color=function(i){
            // console.log($scope.dic[i]);
            return $scope.dic[i].color;
        };
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
                    console.log(d);
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
            var size1 = [1000, 1000],widthScale = [5, 10],showN=800,x=0.1;
            result1=getLayout1(selection,size1,widthScale,showN);
            console.log(result1[0]);
            console.log(result1[1]);
            draw1('Uncluttered',result1[0],size1,selection);
        }
        //返回沿螺旋线方向的函数
        function archimedeanSpiral(size) {
            var e = size[0] / size[1];
            return function (t) {
                return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
            };
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
        //两个数组想加的函数
        function arradd(a,b) {
            var c = [];
            a.forEach(function(v, i) {
                c.push(v + b[i]);
            });
            return c;
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
        //group：类，bound [x0, y0, x1, y1],outputRects：最终输出所有结果的矩阵
        function pushGroupRects(group, bound, outputRects,maxSize) {
            var rects = group.longrects,
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
                var items=plists[idx-1],test=0;
                  console.log(items);
                if(items.length>0){
                    for(j=0,num=items.length;j<num;j++){
                        group = findId(items[j][0],data,size);
                        // console.log(group);
                        group.rectLength= (widthScale[1] - widthScale[0])*group.Pik + widthScale[0];
                        rectsLength = group.longrects.length;//矩形数量
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
                    // console.log(d.type);
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
        function showSelected(belong) {
            node.each(function (d) {
                if(d.belong ==belong){
                    d.selected = true;
                }
            });
            node.classed('selected', function (d) {
                return d.selected;});
        }
        function clear_selection() {
            node.classed('selected', function (d) { return d.selected = false; });
            svg.selectAll('.legend').remove();
            d3.select('.line').remove();
            lis = [];
        }

        d3.json("../data/names16_patientData5.json",function (res) {
            console.log(res.length);
            res.forEach(function (d) {
                d.s = d.Pik * d.p;
                d.belong += 1;
            });
            res.sort(function (a, b) {
                return b.s - a.s; //按照由大到小排序
            });
            $scope.data=res;

            x.domain(d3.extent($scope.data,function (d) {return d.OutputX*size[0];})).nice();
            y.domain(d3.extent($scope.data, function(d) { return d.OutputY*size[1]; })).nice();

            var brush = svg.append('g')
                .datum(function (d) {
                    console.log(d);
                    return {selected: false, previouslySelected: false};
                })
                .attr("class", "brush")
                .call(d3.svg.brush()
                    .x(d3.scale.identity().domain([0, width]))
                    .y(d3.scale.identity().domain([0, height]))
                    .on("brushstart", function() {
                        console.log('brushstart');
                        node.each(function(d) { d.previouslySelected = shiftKey && d.selected });
                        // if (!shiftKey) {
                        //     d3.event.target.clear();
                        //     d3.select(this).call(d3.event.target);
                        // }
                    })
                    .on("brush", function() {
                        // if (shiftKey) {
                        //     console.log('shiftKey', shiftKey);
                        var extent = d3.event.target.extent();
                        node.classed("selected", function(d) {
                            return d.selected = d.previouslySelected ^
                                (extent[0][0] <= x(d.OutputX*size[0]) && x(d.OutputX*size[0]) < extent[1][0]
                                && extent[0][1] <= y(d.OutputY*size[1]) && y(d.OutputY*size[1]) < extent[1][1]);
                        });
                        // } else {
                        //     d3.event.target.clear();
                        //     d3.select(this).call(d3.event.target);
                        // }
                    })
                    .on("brushend", function() {
                        d3.event.target.clear();
                        d3.select(this).call(d3.event.target);
                        get_selection();
                        // svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
                    }));



            rect = svg.append('rect')
                .attr('pointer-events', 'all')
                .attr('width', width+50)
                .attr('height', height+50)
                // .attr('transform',(-500,-500))
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

            node.classed('selected', function (d) {
                return d.selected;});

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

    }]);