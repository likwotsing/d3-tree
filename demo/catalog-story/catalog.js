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

// var svg = d3v4
//   .select('body')
//   .append('svg')
var svg = d3v4.select('#catalog-story')
// .attr('width', width) // + margin.left + margin.right)
.attr('width', 1200) // + margin.left + margin.right)
.attr('height', 900)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3v4.json('catalog.json', function(error, flare) {
if (error) throw error;
root = d3v4.hierarchy(flare);
root.x0 = 0;
root.y0 = 0;
update(root);
});

function indented2Arc (source) {

indentedNodes = indentedNodes.slice(0, 12)
arcNodes = arcNodes.slice(0, 12)
var dataset = [];
indentedNodes.forEach(function(c, i, a) {
    var obj = {};
    obj.x1 = (c.y + 200 - c.depth * 20) | 0
    obj.y1 = c.x | 0
    obj.x2 = arcNodes[i].x + 500 - 20 | 0
    obj.y2 = arcNodes[i].y | 0
    dataset.push(obj)
})
svg.selectAll('test-line')
  .data(dataset)
  .enter()
  .append('path')
  .attr('d', function(d, i) {
    // Mx2, y2 C (x1+x2)/2,y2 (x1+x2)/2,y1 x1,y1 
    return `M${d.x2},${d.y2}C${(d.x1+d.x2)/2},${d.y2} ${(d.x1+d.x2)/2},${d.y1} ${d.x1} ${d.y1}`
  })
  .classed('test-line', true)
// svg.selectAll('test-line')
//   .data(dataset)
//   .enter()
//   .append('line')
//   .attr('x1', function(d, i) {
//     return d.x1 + 200
//   })
//   .attr('y1', function(d, i) {
//     return d.y1
//   })
//   .attr('x2', function(d, i) {
//     return d.x2 + 500 - 20
//   })
//   .attr('y2', function(d, i) {
//     return d.y2
//   })
//   .classed('test-line', true)

}
function update(source) {
// Compute the flattened node list.
var nodes = root.descendants();
// var height = Math.max(
//   500,
//   nodes.length * barHeight + margin.top + margin.bottom
// );

d3v4.select('svg')
  .transition()
  .duration(duration)
  .attr('height', 600);

// d3v4.select(self.frameElement)
//   .transition()
//   .duration(duration)
//   .style('height', height + 'px');

// Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
var index = -1;
root.eachBefore(function(n) {
  n.x = ++index * barHeight;
  n.y = n.depth * 20;
});
// Update the nodes…
var node = svg.selectAll('.node-indented').data(nodes, function(d) {
  return d.id || (d.id = ++i);
});

indentedNodes = nodes;

var nodeEnter = node
  .enter()
  .append('g')
  .attr('class', 'node-indented')
  .attr('transform', function(d) {
    return 'translate(' + source.y0 + ',' + source.x0 + ')';
  })
  .style('opacity', 0);

// Enter any new nodes at the parent's previous position.
nodeEnter
  .append('rect')
  .attr('y', -barHeight / 2)
  .attr('height', barHeight)
  .attr('width', function(d, i) {
    return 200 - d.depth * 20
    // depth
  })
  // .attr('width', 200)
  // .attr('width', barWidth)
  .style('fill', color)
  .classed('indented-rect', true)
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
  .style('fill', color);

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
var link = svg.selectAll('.link-indented').data(root.links(), function(d) {
  return d.target.id;
});

// Enter any new links at the parent's previous position.
link
  .enter()
  .insert('path', 'g')
  .attr('class', 'link-indented')
  .attr('d', function(d) {
    var o = { x: source.x0, y: source.y0 };
    return diagonal({ source: o, target: o });
  })
  .transition()
  .duration(duration)
  .attr('d', diagonal);

// Transition links to their new position.
link
  .transition()
  .duration(duration)
  .attr('d', diagonal);

// Transition exiting nodes to the parent's new position.
link
  .exit()
  .transition()
  .duration(duration)
  .attr('d', function(d) {
    var o = { x: source.x, y: source.y };
    return diagonal({ source: o, target: o });
  })
  .remove();

// Stash the old positions for transition.
root.each(function(d) {
  d.x0 = d.x;
  d.y0 = d.y;
});
}

// Toggle children on click.
function click(d) {
// alert(d.data.name)
if (d.children) {
  d._children = d.children;
  d.children = null;
} else {
  d.children = d._children;
  d._children = null;
}
update(d);
// indented2Arc(d)
}

function color(d) {
return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
}