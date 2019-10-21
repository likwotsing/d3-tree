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

var catalogNodes = null; // 第一次获取的节点
var updateCatalogNodes = null; // 每次点击后重新获取的节点
var catalogEnterNodes = [];
var catalogExitNodes = [];
function catalogUpdate(source) {
  // source.data.children === undefined, 点击的节点没有children
  if(source.data.children === undefined) {
    return;
  }
  // 每次点击，都清空enter和eixt
  catalogEnterNodes = [];
  catalogExitNodes = [];
  // Compute the flattened node list.
  var nodes = catalogRoot.descendants();
  // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
  var index = -1;
  catalogRoot.eachBefore(function(n) {
    n.x = ++index * catalogBarHeight;
    n.y = n.depth * 20;
  });
  // Update the nodes…
  var node = catalogG.selectAll('.catalog-node-indented').data(nodes, function(d) {
    return d.data.id || (d.id = ++index);
    // return d.id || (d.id = ++index);
  });
  

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
    
  if(!catalogNodes) { // 第一次加载
    catalogNodes = nodes;
    updateCatalogNodes = nodes;
    // catalogNodes = Object.assign({}, nodes);
  } else {
    updateCatalogNodes = nodes;
  }
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
    d.xx = d.x0;
    d.yy = d.y0;
    d.x0 = d.x;
    d.y0 = d.y;
  });
  node.enter().each(function(c, i, a) {
    catalogEnterNodes.push(c);
  })
  node.exit().each(function(c, i, a) {
    catalogExitNodes.push(c)
  })

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
  if(catalogNodes && storyNodes) {
    indented2Arc(true)
  }
}

function catalogColor(d) {
return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
}