
// Get JSON data
// treeJSON = d3.json("flare.json", function(error, treeData) {
  treeJSON = d3.json("data.json", function(error, treeData) {
    treeData = treeData.author;
    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // Misc. variables
    var idx = 0;
    var duration = 750;
    var root;
    var index = 0;

    // size of the diagram
    var viewerWidth = 400;
    var viewerHeight = 400;
    // var viewerWidth = $(document).width();
    // var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    // sortTree();


    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        // svgGroup.attr("transform", "skew(0,30deg)");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);

    var overCircle = function(d) {
        updateTempConnector();
    };
    var outCircle = function(d) {
        updateTempConnector();
    };


    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")")
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.
    var clickTimeId = null;
    var lastCName = null;

    function clickG(d) {
      // alert(d.name)
      centerNode(d);
var cName = '.' + d.name; // 点击的作者名称
      // d3.selectAll('rect')
      d3.selectAll('.rect1')
        .style('fill', function(d) {
          return 'lightsteelblue'
        })
if(lastCName) {
  d3.selectAll(lastCName)
  .select('rect')
  .style('fill', function(d) {
    return 'lightsteelblue'
  })
}
        d3.selectAll(cName)
        .select('rect')
        .style('fill', function(d) {
          return 'red'
        })
      
lastCName = cName;

      d3.select(this)
        .select('rect')
        .style('fill', function(d) {
          return '#336BA3'
        })
// debugger
      var tmp = d3.select(this).select('node')
// debugger

      // var status = d3.event.defaultPrevented
      // clearTimeout(clickTimeId);
      //  clickTimeId = setTimeout(() => {
      //   if (status) return; // click suppressed
      //   d = toggleChildren(d);
      //   update(d);
      //   centerNode(d);
      //  }, 250)
    }
    function dblclick(d) {
      clearTimeout(clickTimeId)
      alert(d.name)
    }
    function mouseover(d) {
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        // var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 20)); //maxLabelLength * 10px
            // d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++idx);
                // return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr('id', function(d) {
              return d.id
            })
            // hello
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', clickG)
            // .on('dblclick', dblclick)

        nodeEnter.append("rect")
            .attr('class', 'nodeCircle')
            .attr('class', 'rect1')
            .attr("width", 40)
            .attr("height", 22)
            .attr("x", 0)
            .attr("y", -11)
            .style("fill", function(d) {
                return "lightsteelblue";
                // return d._children ? "lightsteelblue" : "#336BA3";
            })
            .on('click', function(d, i) {
            })
        // nodeEnter.append("circle")
        //     .attr('class', 'nodeCircle')
        //     .attr("r", 0)
        //     .style("fill", function(d) {
        //         return d._children ? "lightsteelblue" : "#fff";
        //     });

        nodeEnter.append("text")
            .attr("x", function(d) {
                // return d.children || d._children ? -10 : 10;
                return 3;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                // return d.children || d._children ? "end" : "start";
                return "start";
            })
            .text(function(d) {
              if(d.name.length > 3) {
                return d.name.slice(0, 3) + '···'
              } else {
                return d.name;
              }
            })
            .style("fill-opacity", 0)
            .on('mouseover', function(d, i) {
              d3.select(this)
                .text(function(d) {
                  return d.name;
                })
                .style('fill', 'red')
            })
            .on('mouseout', function(d) {
              d3.select(this)
                .text(function(d) {
                  if(d.name.length > 3) {
                    return d.name.slice(0, 3) + '···'
                  } else {
                    return d.name;
                  }
                })
                .style('fill', '#fff')
            })

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
              debugger
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                // return d.children || d._children ? -10 : 10;
                return 3;
            })
            .attr("text-anchor", function(d) {
                // return d.children || d._children ? "end" : "start";
                return "start";
            })
            .text(function(d) {
              if(d.name.length > 3) {
                return d.name.slice(0, 3) + '···'
              } else {
                return d.name;
              }
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
        // node.select("rect.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        // link.exit().transition()
        //     .duration(duration)
        //     .attr("d", function(d) {
        //         var o = {
        //             x: source.x,
        //             y: source.y
        //         };
        //         return diagonal({
        //             source: o,
        //             target: o
        //         });
        //     })
        //     .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    // centerNode(root);
});