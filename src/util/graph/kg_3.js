initKG = function (data, config, container) {

    var lastFocusNode = null;
    
    //data:nodes 至少需要一个id
    var nodeDict = {};
    data.nodes.forEach(function(node) {
        nodeDict[node.id] = node;
    });

    var links = data.links;

    var nodes = {};

    links.forEach(function (link) {
        //利用source和target名称进行连线以及节点的确认
        link.source = nodeDict[link.source];
        link.target = nodeDict[link.target];
        if (!nodes[link.source.id]) {
            nodes[link.source.id] = link.source;
        }
        if (!nodes[link.target.id]) {
            nodes[link.target.id] = link.target;
        }
    });

    //默认的节点配色方案
    if (!config.nodeColor || config.nodeColor === "") {
        var defaultNodeColor = [
            //粉红
            { fill: "rgb(249, 235, 249)", stroke: "rgb(162, 84, 162)", text: "rgb(162, 84, 162)" },
            //灰色
            { fill: "#ccc", stroke: "rgb(145, 138, 138)", text: "#333" },
            { fill: "rgb(112, 202, 225)", stroke: "#23b3d7", text: "rgb(93, 76, 93)" },
            { fill: "#D9C8AE", stroke: "#c0a378", text: "rgb(60, 60, 60)" },
            { fill: "rgb(178, 229, 183)", stroke: "rgb(98, 182, 105)", text: "rgb(60, 60, 60)" },
            //红
            { fill: "rgb(248, 152, 152)", stroke: "rgb(233, 115, 116)", text: "rgb(60, 60, 60)" }
        ];
    } else {
        var defaultNodeColor = config.nodeColor;
    }

    //默认的关系配色方案
    if (!config.linkColor || config.linkColor === "") {
        var defaultLinkColor = [
            { color: "rgb(162, 84, 162)" },
            { color: "rgb(145, 138, 138)" },
            { color: "#23b3d7" },
            { color: "#c0a378" },
            { color: "rgb(98, 182, 105)" },
            { color: "rgb(233, 115, 116)" }
        ];
    } else {
        var defaultLinkColor = config.linkColor;
    }

    //为node分配方案
    var colorDict = {};
    //配色循环指针
    var point = 0;
    Object.keys(data.nodes).forEach(function (key) {
        var type = data.nodes[key].group == null ? (data.nodes[key].group = "default") : data.nodes[key].group;
        if (colorDict[type] == null) {
            colorDict[type] = defaultNodeColor[point];
            point = (point + 1) % defaultNodeColor.length;
        }
    });

    //为link分配配色方案
    var colorLinkDict = {};
    //配色循环指针
    var point = 0;
    Object.keys(data.links).forEach(function (key) {
        var type = data.links[key].type == null ? (data.links[key].type = "default") : data.links[key].type;
        if (colorLinkDict[type] == null) {
            colorLinkDict[type] = defaultLinkColor[point];
            point = (point + 1) % defaultLinkColor.length;
        }
    });

    var width = config.width || 1560,
        height = config.height || 800;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(120)
        .charge(-1200)
        .on("tick", tick)
        .start();

    var zoom = d3.behavior.zoom()
        .scaleExtent([0, 2])
        .on("zoom", zoomed);

    function zoomed() {
        svg.selectAll("g").attr("transform",
            "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var marker = svg.append("marker")
        .attr("id", "resolved")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 40)
        .attr("refY", 0)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .attr("stroke-width", 3)
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#000000");

    var edges_line = svg.append("g").selectAll(".edgepath")
        .data(force.links())
        .enter()
        .append("path")
        .attr({
            'd': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y; },
            'class': 'edgepath',
            'id': function (d, i) { return 'edgepath' + i; }
        })
        .style("stroke", function (link) {
            return colorLinkDict[link.type].color;
        })
        .style("stroke-width", 1)
        .attr("marker-end", "url(#resolved)");

    var edges_text = svg.append("g").selectAll(".edgelabel")
        .data(force.links())
        .enter()
        .append("text")
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) { return 'edgepath' + i; },
            'dx': 60,
            'dy': 0
        });

    edges_text.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i; })
        .style("pointer-events", "none")
        .text(function (d) { return d.label; });

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0.0);

    var circle = svg.append("g")
        .selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .style("fill", function (node) {
            return colorDict[node.group].fill;
        })
        .style('stroke', function (node) {
            return colorDict[node.group].stroke;
        })
        .attr("r", 30)
        .on("click", function (node) {
            edges_line.style("stroke-width", function (line) {
                if ((line.source.id == node.id || line.target.id == node.id)) {
                    if (line.focus && node.focus) {
                        line.focus = false;
                        return 1;
                    } else {
                        line.focus = true;
                        return 2.5;
                    }
                } else {
                    return 1;
                }
            });
            circle.style('stroke-width', 1);
            node.focus = !node.focus;
            if (lastFocusNode != node && lastFocusNode != null) {
                lastFocusNode.focus = false;
            }
            if (node.focus) {
                d3.select(this).style('stroke-width', 2.5);
            } else {
                d3.select(this).style('stroke-width', 1);
            }
            lastFocusNode = node;
        })
        .on("dblclick", function (d) {
            d.fx = null;
            d.fy = null;
        })
        .on("mouseover", function (d) {
            var content = config.contentHook ? config.contentHook(d) : config.content;
            tooltip.html(content)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity", 1.0);
        })
        .on("mousemove", function (d) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px");
            })
            .on("mouseout", function (d) {
            tooltip.style("opacity", 0.0);
            })
            .call(force.drag()
            .on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation();
            d.fx = d.x; // 固定 x 坐标
            d.fy = d.y; // 固定 y 坐标
            })
            .on("drag", function (d) {
            d.fx = d3.event.x; // 随鼠标更新 x
            d.fy = d3.event.y; // 随鼠标更新 y
            })
            .on("dragend", function (d) {
            d.fx = d.x; // 拖动结束时固定 x
            d.fy = d.y; // 拖动结束时固定 y
            })
            );
            
            var text = svg.append("g").selectAll("text")
                .data(force.nodes())
                .enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style('fill', function (node) {
                    return colorDict[node.group].text;
                })
                .text(function (d) { return d.id; });
            
            function tick() {
                circle.attr("transform", function (d) {
                    // 如果节点被固定，强制使用 fx 和 fy
                    d.x = d.fx !== undefined ? d.fx : d.x;
                    d.y = d.fy !== undefined ? d.fy : d.y;
                    return "translate(" + d.x + "," + d.y + ")";
                });
            
                text.attr("transform", function (d) {
                    d.x = d.fx !== undefined ? d.fx : d.x;
                    d.y = d.fy !== undefined ? d.fy : d.y;
                    return "translate(" + d.x + "," + d.y + ")";
                });
            
                edges_line.attr('d', function (d) {
                    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                });
            
                edges_text.attr('transform', function (d, i) {
                    if (d.target.x < d.source.x) {
                        let bbox = this.getBBox();
                        let rx = bbox.x + bbox.width / 2;
                        let ry = bbox.y + bbox.height / 2;
                        return 'rotate(180 ' + rx + ' ' + ry + ')';
                    } else {
                        return 'rotate(0)';
                    }
                });
            }
            
            function transform1(d) {
                return "translate(" + d.x + "," + d.y + ")";
            }
            };


