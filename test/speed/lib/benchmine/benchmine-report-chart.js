// Chart reporter
// ==============
// Reporter that creates a chart with the results obtained from executing a suite.

;(function (window, undefined) {

  // I18n strings.
  var i18n = {
  };

  // API shortcuts.
  var getEnv        = Benchmine.getEnv;
  var getElement    = Benchmine.getElement;
  var createElement = Benchmine.createElement;
  var emptyElement  = Benchmine.emptyElement;
  var formatNumber  = Benchmine.formatNumber;
  var formatString  = Benchmine.formatString;

  // ---------------------------------------------------------------------------

  // Chart reporter constructor.
  var ChartReporter = function () {
  };

  // Called to initialize the reporter.
  ChartReporter.prototype.init = function (suite) {
  };

  // Called when the suite starts running.v
  ChartReporter.prototype.onStart = function (event, bench) {
  };

  // Called between running benchmarks.
  ChartReporter.prototype.onCycle = function (event, bench) {
  };

  // Called when a test throws an error.
  ChartReporter.prototype.onError = function (event, bench) {
  };

  // Called when the suite is aborted.
  ChartReporter.prototype.onAbort = function (event, bench) {
  };

  // Called when the suite is reset.
  ChartReporter.prototype.onReset = function (event, bench) {
  };

  // Called when the suite completes running.
  ChartReporter.prototype.onComplete = function (event, bench) {
    var suite = this;

    // Create the bar chart.
    var chart = createChart(suite);
  };

  Benchmine.ChartReporter = ChartReporter;

  // ---------------------------------------------------------------------------

  // Creates a chart with the results from the suite.
  function createChart(suite) {
    var data = getData(suite);

    var config = {
      // Dimensions.
      width:    1024,
      height:   64 * data.length,
      // Margins.
      margin: {
        top:    36,
        right:  48,
        bottom: 24,
        left:   48
      },
      // Ticks.
      ticks:    10
    };

    // Scales.
    config.x = d3.scale.linear()
      .domain([0, d3.max(data, function (d, i) { return d.value; })])
      .rangeRound([0, config.width - (config.margin.left + config.margin.right)]);
    config.y = d3.scale.ordinal()
      .domain(d3.range(data.length))
      .rangeRoundBands([config.margin.top, config.height - config.margin.bottom], 0.5);

    // Bounds.
    config.left   = config.margin.left;
    config.right  = config.width - config.margin.right;
    config.top    = config.margin.top + (config.y.rangeBand() / 2);
    config.bottom = config.height - config.margin.bottom - (config.y.rangeBand() / 2);

    // Chart (empty it in case it already existed).
    var chart = emptyElement(
      getElement(formatString('div#suite_{0}.suite>div#chart_{0}.chart', suite.id))
    );
    var cont  = createContainer(chart, config, data);
    var bars  = addBars(cont, config, data);
    var ticks = addTicks(cont, config, data);
    var axes  = addAxes(cont, config, data);

    return chart;
  }

  // ---------------------------------------------------------------------------

  // Gets an array with the results from the suite.
  function getData(suite) {
    var benches = suite;
    var fastests = suite.filter('fastest');
    var slowests = suite.filter('slowest');

    var fastest   = fastests[0];
    var reference = 100;
    if (fastest != null) {
      reference = fastest.hz;
    }

    // Get the data from the benchmarks.
    var data = [];
    benches.forEach(function (bench) {
      var fastest = fastests.indexOf(bench) > -1;
      var slowest = !fastest && slowests.indexOf(bench) > -1;
      // We are interested in the name, the relative speed, and whether it is
      // one of the fastests or slowests tests.
      data.push({
        label:   bench.name,
        value:   Math.round((bench.hz / reference) * 100),
        fastest: fastest,
        slowest: slowest
      });
    });

    return data;
  }

  // Creates the container for the chart.
  function createContainer(parent, config, data) {
    var cont = d3.select(parent)
      .append('div')
        .attr('style', formatString('height: {0}em', data.length * 4))
      .append('svg:svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', formatString('0 0 {0} {1}', config.width, config.height))
        .attr('preserveAspectRatio', 'none'); // 'xMidYMid meet' if you want to preserve aspect ratio

    return cont;
  }

  // Adds the bars to the chart.
  function addBars(parent, config, data) {
    var bars = parent.selectAll('g.bars')
      .data(data)
      .enter()
        .append('svg:g')
          .attr('transform', function (d, i) { return formatString('translate(0, {0})', config.y(i)); })
        .append('svg:rect')
          .attr('class', function (d, i) { return 'bar' + (d.slowest ? ' slowest' : '') + (d.fastest ? ' fastest' : ''); })
          .attr('x', config.left)
          .attr('width', function (d, i) { return config.x(d.value); })
          .attr('height', config.y.rangeBand());

    return bars;
  }

  // Adds the ticks to the chart.
  function addTicks(parent, config, data) {
    var ticks = parent.selectAll('g.ticks')
      .data(config.x.ticks(config.ticks))
      .enter()
        .append('svg:g')
          .attr('transform', function (d, i) { return formatString('translate({0}, 0)', config.left + config.x(d)); });
    ticks.append('svg:line')
          .attr('class', 'tick')
          .attr('y1', config.top)
          .attr('y2', config.bottom);
    ticks.append('svg:text')
          .attr('class', 'tickval')
          .attr('y', config.top)
          .attr('dy', -5)
          .text(config.x.tickFormat(config.ticks));

    return ticks;
  }

  // Adds the axes to the chart.
  function addAxes(parent, config, data) {
    var axes = parent.append('svg:g');
    axes.append('svg:line')
        .attr('class', 'vertical axis')
        .attr('x1', config.left)
        .attr('x2', config.left)
        .attr('y1', config.top)
        .attr('y2', config.bottom);
    axes.append('svg:line')
        .attr('class', 'horizontal axis')
        .attr('x1', config.left)
        .attr('x2', config.right)
        .attr('y1', config.bottom)
        .attr('y2', config.bottom);

    return axes;
  }

  // ---------------------------------------------------------------------------

}(this));
