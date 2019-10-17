
var margin = { top: 30, right: 20, bottom: 30, left: 20 },
  width = 960,
  barHeight = 20,
  barWidth = (width - margin.left - margin.right) * 0.8;

var i = 0,
  duration = 400,
  root;

var diagonal = d3v4
  .linkHorizontal()
  .x(function(d) {
    return d.y;
  })
  .y(function(d) {
    return d.x;
  });

var svg = d3v4
  .select('#catalog-story')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3v4.json('story.json', function(error, flare) {
  if (error) throw error;
  root = d3v4.hierarchy(flare);
  root.x0 = 0;
  root.y0 = 0;
  update(root);
});

var clickNode = null;

function update(source) {
  // Compute the flattened node list.
  var nodes = root.descendants();

  var height = Math.max(
    500,
    nodes.length * barHeight + margin.top + margin.bottom
  );

  d3v4.select('svg')
    .transition()
    .duration(duration)
    .attr('height', height);

  d3v4.select(self.frameElement)
    .transition()
    .duration(duration)
    .style('height', height + 'px');

  // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
  var index = -1;
  root.eachBefore(function(n) {
    n.x = ++index * barHeight;
    n.y = 20;
    // n.y = n.depth * 20;
  });

  // Update the nodes…
  var node = svg.selectAll('.node').data(nodes, function(d) {
    return d.id || (d.id = ++i);
  });

  var nodeEnter = node
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + source.y0 + ',' + source.x0 + ')';
    })
    .style('opacity', 0);

  // Enter any new nodes at the parent's previous position.
  nodeEnter
    .append('rect')
    .attr('y', -barHeight / 2)
    .attr('height', barHeight)
    .attr('width', 30)
    // .attr('width', barWidth)
    .style('fill', function(d, i) {
      return color(d, clickNode)
    })
    // .style('fill', color)
    .classed('normal-node', true)
    .on('click', click);

  nodeEnter
    .append('text')
    .attr('dy', 3.5)
    .attr('dx', 5.5)
    .text(function(d) {
      return d.data.name;
    });

  // Transition nodes to their new position.
  nodeEnter
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + d.y + ',' + d.x + ')';
    })
    .style('opacity', 1);

  node
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + d.y + ',' + d.x + ')';
    })
    .style('opacity', 1)
    .select('rect')
    // .style('fill', color)
    .style('fill', function(d) {
      return color(d, clickNode)
    })

  // Transition exiting nodes to the parent's new position.
  node
    .exit()
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + source.y + ',' + source.x + ')';
    })
    .style('opacity', 0)
    .remove();

  // Update the links…
  // var link = svg.selectAll('.link').data(root.links(), function(d) {
  //   return d.target.id;
  // });

  // // Enter any new links at the parent's previous position.
  // link
  //   .enter()
  //   .insert('path', 'g')
  //   .attr('class', 'link')
  //   .attr('d', function(d) {
  //     var o = { x: source.x0, y: source.y0 };
  //     return diagonal({ source: o, target: o });
  //   })
  //   .transition()
  //   .duration(duration)
  //   .attr('d', diagonal);

  // // Transition links to their new position.
  // link
  //   .transition()
  //   .duration(duration)
  //   .attr('d', diagonal);

  // // Transition exiting nodes to the parent's new position.
  // link
  //   .exit()
  //   .transition()
  //   .duration(duration)
  //   .attr('d', function(d) {
  //     var o = { x: source.x, y: source.y };
  //     return diagonal({ source: o, target: o });
  //   })
  //   .remove();

  // Stash the old positions for transition.
  root.each(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  clickNode = d;
  // alert(d.data.name)
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d, clickNode) {
  if(!clickNode) {
    return 'lightblue';
  }
  // 默认节点颜色：lightblue, 点击节点后，父节点：red, 子节点：green, 兄弟节点：yellow, 当前节点：blue
  var dData = d.data;
  var cData = clickNode.data;
  if(dData.id === cData.id) {
    return 'blue';
  } else if(dData.id === cData.pid) {
    return 'red';
  } else if(dData.pid === cData.id) {
    return 'green';
  } else if(dData.pid === cData.pid) {
    return 'yellow';
  } else {
    return 'lightblue';
  }
  // return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
}