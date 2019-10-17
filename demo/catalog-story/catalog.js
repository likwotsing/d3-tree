var catalogBarHeight = 20;

var catalogDuration = 400,
catalogRoot;

var catalogDiagonal = d3v4
.linkHorizontal()
.x(function(d) {
  return d.y;
})
.y(function(d) {
  return d.x;
});

var svg = d3v4.select('#catalog-story')
.attr('width', 1200)
.attr('height', 900)
var catalogG = svg.append('g')
.attr('class', 'catalog-wrapper')
.attr('transform', 'translate(20, 30)');

d3v4.json('catalog.json', function(error, flare) {
  if (error) throw error;
  catalogRoot = d3v4.hierarchy(flare);
  catalogRoot.x0 = 0;
  catalogRoot.y0 = 0;
  catalogUpdate(catalogRoot);
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
catalogG.selectAll('test-line')
  .data(dataset)
  .enter()
  .append('path')
  .attr('d', function(d, i) {
    // Mx2, y2 C (x1+x2)/2,y2 (x1+x2)/2,y1 x1,y1 
    return `M${d.x2},${d.y2}C${(d.x1+d.x2)/2},${d.y2} ${(d.x1+d.x2)/2},${d.y1} ${d.x1} ${d.y1}`
  })
  .classed('test-line', true)
}
function catalogUpdate(source) {
// Compute the flattened node list.
var nodes = catalogRoot.descendants();

d3v4.select('svg')
  .transition()
  .duration(catalogDuration)
  .attr('height', 600);


// Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
var index = -1;
catalogRoot.eachBefore(function(n) {
  n.x = ++index * catalogBarHeight;
  n.y = n.depth * 20;
});
// Update the nodes…
var node = catalogG.selectAll('.catalog-node-indented').data(nodes, function(d) {
  return d.id || (d.id = ++index);
});

indentedNodes = nodes;

var nodeEnter = node
  .enter()
  .append('g')
  .attr('class', 'catalog-node-indented')
  .attr('transform', function(d) {
    return 'translate(' + source.y0 + ',' + source.x0 + ')';
  })
  .style('opacity', 0);

// Enter any new nodes at the parent's previous position.
nodeEnter
  .append('rect')
  .attr('y', -catalogBarHeight / 2)
  .attr('height', catalogBarHeight)
  .attr('width', function(d, i) {
    return 200 - d.depth * 20
  })
  .style('fill', catalogColor)
  .classed('indented-rect', true)
  .on('click', catalogClick);

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
  .duration(catalogDuration)
  .attr('transform', function(d) {
    return 'translate(' + d.y + ',' + d.x + ')';
  })
  .style('opacity', 1);

node
  .transition()
  .duration(catalogDuration)
  .attr('transform', function(d) {
    return 'translate(' + d.y + ',' + d.x + ')';
  })
  .style('opacity', 1)
  .select('rect')
  .style('fill', catalogColor);

// Transition exiting nodes to the parent's new position.
node
  .exit()
  .transition()
  .duration(catalogDuration)
  .attr('transform', function(d) {
    return 'translate(' + source.y + ',' + source.x + ')';
  })
  .style('opacity', 0)
  .remove();
// Update the links…
var link = catalogG.selectAll('.catalog-link-indented').data(catalogRoot.links(), function(d) {
  return d.target.id;
});

// Enter any new links at the parent's previous position.
link
  .enter()
  .insert('path', 'g')
  .attr('class', 'catalog-link-indented')
  .attr('d', function(d) {
    var o = { x: source.x0, y: source.y0 };
    return catalogDiagonal({ source: o, target: o });
  })
  .transition()
  .duration(catalogDuration)
  .attr('d', catalogDiagonal);

// Transition links to their new position.
link
  .transition()
  .duration(catalogDuration)
  .attr('d', catalogDiagonal);

// Transition exiting nodes to the parent's new position.
link
  .exit()
  .transition()
  .duration(catalogDuration)
  .attr('d', function(d) {
    var o = { x: source.x, y: source.y };
    return catalogDiagonal({ source: o, target: o });
  })
  .remove();

// Stash the old positions for transition.
catalogRoot.each(function(d) {
  d.x0 = d.x;
  d.y0 = d.y;
});
}

// Toggle children on click.
function catalogClick(d) {
// alert(d.data.name)
if (d.children) {
  d._children = d.children;
  d.children = null;
} else {
  d.children = d._children;
  d._children = null;
}
catalogUpdate(d);
// indented2Arc(d)
}

function catalogColor(d) {
return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
}