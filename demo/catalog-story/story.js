
var storyBarHeight = 20;

var storyDuration = 400,
  storyRoot;

var svg = d3v4
  .select('#catalog-story')

var storyG = svg.append('g')
  .attr('class', 'story-wrapper')
  .attr('transform', 'translate(420, 30)');

d3v4.json('story.json', function(error, flare) {
  if (error) throw error;
  storyRoot = d3v4.hierarchy(flare);
  storyRoot.x0 = 0;
  storyRoot.y0 = 0;
  storyUpdate(storyRoot);
});

var storyClickNode = null;

function storyUpdate(source) {
  // Compute the flattened node list.
  var nodes = storyRoot.descendants();

  d3v4.select(self.frameElement)
    .transition()
    .duration(storyDuration)
    .style('height', '500px');

  // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
  var index = -1;
  storyRoot.eachBefore(function(n) {
    n.x = ++index * storyBarHeight;
    n.y = 20;
    // n.y = n.depth * 20;
  });

  // Update the nodes…
  var node = storyG.selectAll('.story-node').data(nodes, function(d) {
    return d.id || (d.id = ++index);
  });

  var nodeEnter = node
    .enter()
    .append('g')
    .attr('class', 'story-node')
    .attr('transform', function(d) {
      return 'translate(' + source.y0 + ',' + source.x0 + ')';
    })
    .style('opacity', 0);

  // Enter any new nodes at the parent's previous position.
  nodeEnter
    .append('rect')
    .attr('y', -storyBarHeight / 2)
    .attr('height', storyBarHeight)
    .attr('width', 30)
    .style('fill', function(d, i) {
      return storyColor(d, storyClickNode)
    })
    .classed('story-normal-node', true)
    .on('click', storyClick);

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
    .duration(storyDuration)
    .attr('transform', function(d) {
      return 'translate(' + d.y + ',' + d.x + ')';
    })
    .style('opacity', 1);

  node
    .transition()
    .duration(storyDuration)
    .attr('transform', function(d) {
      return 'translate(' + d.y + ',' + d.x + ')';
    })
    .style('opacity', 1)
    .select('rect')
    .style('fill', function(d) {
      return storyColor(d, storyClickNode)
    })

  // Transition exiting nodes to the parent's new position.
  node
    .exit()
    .transition()
    .duration(storyDuration)
    .attr('transform', function(d) {
      return 'translate(' + source.y + ',' + source.x + ')';
    })
    .style('opacity', 0)
    .remove();

  // Stash the old positions for transition.
  storyRoot.each(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function storyClick(d) {
  storyClickNode = d;
  // alert(d.data.name)
  // if (d.children) {
  //   d._children = d.children;
  //   d.children = null;
  // } else {
  //   d.children = d._children;
  //   d._children = null;
  // }
  storyUpdate(d);
}

function storyColor(d, storyClickNode) {
  if(!storyClickNode) {
    return 'lightblue';
  }
  // 默认节点颜色：lightblue, 点击节点后，父节点：red, 子节点：green, 兄弟节点：yellow, 当前节点：blue
  var dData = d.data;
  var cData = storyClickNode.data;
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