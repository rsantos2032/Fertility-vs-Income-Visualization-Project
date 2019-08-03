var margin = {top: 20, right: 20, bottom: 100, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xValue = function(d) { return d.GDPperCapita; }
    xScale = d3.scaleLog().range([0, width]),
    xMap = function(d) { return xScale(xValue(d)); }
    xAxis = d3.axisBottom(xScale);

var yValue = function(d) { return d['FertilityRate']; },
    yScale = d3.scaleLinear().range([height, 0]),
    yMap = function(d) { return yScale(yValue(d)); }
    yAxis = d3.axisLeft(yScale);

var cValue = function(d) { return d.Region; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

var dataTime = d3.range(1, 30).map(function(d) {
  return new Date(1960 + 2 * d - 1, 10, 3);
})

var sliderTime = d3.sliderBottom()
                .min(d3.min(dataTime))
                .max(d3.max(dataTime))
                .step(1000 * 60 * 60 * 24 * 365)
                .width(800)
                .tickFormat(d3.timeFormat('%Y'))
                .tickValues(dataTime)
                .default(new Date(2017, 10, 3));

var gTime = d3.select('div#slider-time').append('svg')
            .attr('width',width + margin.left + margin.right)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(50,50)');

gTime.call(sliderTime);

var svg = d3.select('body').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

d3.csv('WDIDataCleaned.csv').then(function(data) {

  data.forEach(function(d) {
    d.GDPperCapita = +d.GDPperCapita;
    d['FertilityRate'] = +d['FertilityRate'];
    d.Year = +d.Year
  });

    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis.tickFormat(d3.format('.0s')))
        svg.append('text')
          .style('font-size', '30px')
            .attr("transform",
                "translate(" + (width/2) + " ," +
                               (height + margin.top + 40) + ")")
          .style("text-anchor", "middle")
          .text('GDP per Capita (Constant 2010 $)');

      var ticks = d3.selectAll(".tick text");

      ticks.attr("class", function(d,i){
       if(i%2 != 1) d3.select(this).remove();
      });

    svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
        svg.append('text')
        .attr("transform", "rotate(-90)")
        .style('font-size', '30px')
        .attr("y", 30 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text('Fertility Rate');

    function drawPlot(data, transition) {
      if(transition == true) {
      svg.selectAll('.circle')
            .data(data)
          .enter().append('circle')
            .attr('class', 'circle')
            .transition().duration(1000)
            .attr('r', 10)
            .attr('cx', xMap)
            .attr('cy', yMap)
            .style('fill', function(d) { return color(cValue(d)); })
      } else {
        svg.selectAll('.circle')
              .data(data)
            .enter().append('circle')
              .attr('class', 'circle')
              .attr('r', 10)
              .attr('cx', xMap)
              .attr('cy', yMap)
              .style('fill', function(d) { return color(cValue(d)); })
      }
      svg.selectAll('.circle')
            .data(data)
            .on('mouseover', function(d) {
              tooltip.transition()
                .duration(200)
                .style('opacity', .9);
              tooltip.html('Country: ' + d['Short Name'] + '<br> GDP per Capita: ' + xValue(d)
              + '<br> Fertility Rate: ' + yValue(d))
                  .style('left', (d3.event.pageX + 5) + 'px')
                  .style('top', (d3.event.pageY - 28) + 'px');
            })
            .on('mouseout', function(d) {
              tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            });
      }

    update(d3.timeFormat('%Y')(sliderTime.value()) , true);

    function update(year, transition, regionFilter = false, region = "World") {
      var newdata;
      if (regionFilter == true) {
        newdata = data.filter(function(d) {
          return d.Region == region && d.Year == year;
        })
      }
      else if(regionFilter != true || region == "World") {
        newdata = data.filter(function(d, i) {
          return d.Year == year;
        })
      }
      svg.selectAll('.circle').remove();
      drawPlot(newdata, transition);
    }

    sliderTime.on('onchange', val => {
      update(d3.timeFormat('%Y')(val), false);
    })

    var button = svg.selectAll('.button')
                .data(color.domain())
              .enter()
                .append('g')
                .attr('class', 'button')
                .attr('transform', function(d, i) {
                  return 'translate(0,' + i * 20 +')';
                })

    button.append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    button.append('text')
        .attr('x', width - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d) { return d; })

    button.on('click', function(d) {
      update(d3.timeFormat('%Y')(sliderTime.value()), false, true, d);
    })


});
