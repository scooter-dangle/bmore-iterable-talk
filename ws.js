(function() {
  $(document).ready(function() {
    var abs_height, abs_width, charts, colors, confine, debug, debug_count, debugging, demo_object, duration, max, methods, min, phone_home, queue, reset_queue, route, routes, slide, standard_delay, update_data, update_queue;
    abs_width = 490;
    abs_height = 180;
    debugging = false;
    max = function(x, y) {
      if (x > y) {
        return x;
      } else {
        return y;
      }
    };
    min = function(x, y) {
      if (x < y) {
        return x;
      } else {
        return y;
      }
    };
    confine = function(infimum, n, supremum) {
      n = max(infimum, n);
      n = min(n, supremum);
      return n;
    };
    debug_count = 0;
    if (debugging) $('body').append('<div id="debug"><h1>Debug</h1></div>');
    debug = function(str) {
      if (debugging) {
        debug_count = debug_count + 1;
        if (typeof str !== 'string') str = JSON.stringify(str);
        return $('#debug').append("<p>" + debug_count + ": " + str + "</p>");
      }
    };
    colors = d3.scale.category20();
    duration = 1000;
    standard_delay = duration / 5;
    update_data = function(parcel) {
      var catalogue, elems, font_factor, pkg, w, _i, _len;
      w = 40;
      font_factor = 2 / 3;
      catalogue = [];
      for (_i = 0, _len = parcel.length; _i < _len; _i++) {
        pkg = parcel[_i];
        catalogue = catalogue.concat(pkg['obj']);
      }
      elems = d3.select('svg#assets defs').selectAll('.elem').data(catalogue, function(d) {
        return d;
      }).enter().append('svg').attr('id', function(d) {
        return "elem_" + d;
      }).classed('elem', true).attr('x', 0).attr('y', 0).attr('width', w).attr('height', w);
      elems.append('rect').attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '100%').attr('fill', function(d) {
        return colors(d);
      });
      elems.append('text').attr('x', '50%').attr('y', '75%').attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', w * font_factor).attr('font-family', 'sans-serif').attr('font-style', 'bold').text(function(d) {
        return d;
      });
      return d3.select('#charts').classed('one-child', function() {
        return parcel.length === 1;
      }).classed('not-one-child', function() {
        return parcel.length !== 1;
      }).selectAll('.chart').data(parcel, function(d) {
        return d['name'];
      }).call(charts).select('.methods').selectAll('.method').data(function(d) {
        return d['methods'];
      }).call(methods);
    };
    charts = function(selection) {
      var enteror;
      enteror = selection.enter().append('div').classed('chart', true);
      enteror.append('h1').append('span').append('div').text(function(d) {
        return d['name'];
      });
      selection.exit().remove();
      enteror.append('div').classed('demo_wrapper', true).append('svg').classed('demo_object', true);
      enteror.append('section').classed('methods', true);
      return selection.select('.demo_object').each(demo_object);
    };
    demo_object = function(datar) {
      var font_factor, group_transition, joiner, main_transition, selection, w, x;
      selection = d3.select(this);
      datar = datar['obj'];
      w = 40;
      font_factor = 2 / 3;
      main_transition = selection.transition().duration(duration / 2).delay(standard_delay).attr('height', w);
      x = d3.scale.ordinal().domain(datar).rangeBands([0, min(abs_width, w * datar.length)]);
      joiner = selection.selectAll('svg.mover').data(datar, function(d) {
        return d;
      });
      joiner.enter().append('svg').classed('mover', true).each(function(d) {
        return d3.select(this).classed("elem_" + d, true);
      }).attr('x', 0).attr('y', 0).attr('width', w).attr('height', w).append('use').attr('xlink:href', function(d) {
        return "#elem_" + d;
      });
      joiner.order();
      group_transition = main_transition.selectAll('svg.mover').transition().attr('x', function(d) {
        return x(d);
      }).attr('y', 0);
      return joiner.exit().transition().duration(duration / 5).delay(standard_delay).ease('quad-in').attr('y', 750).remove();
    };
    methods = function(selection) {
      var meths, props, yield_width, yielder;
      yield_width = '40px';
      selection.exit().transition().duration(duration / 10).remove();
      props = ['name', 'args', 'block', 'yield', 'result'];
      meths = selection.enter().append('div').classed('method', true);
      meths.append('span').classed('name', true).text(function(d) {
        return ":" + d['name'];
      });
      meths.append('span').classed('args', true).text(function(d) {
        return d['args'];
      });
      meths.append('span').classed('block', true).text(function(d) {
        return d['block'];
      });
      meths.append('svg').attr('height', yield_width).attr('width', yield_width).classed('yield', true);
      meths.append('span').classed('result', true).text(function(d) {
        return d['result'];
      });
      selection.select("span.name").text(function(d) {
        return "" + d['name'];
      });
      selection.select("span.args").text(function(d) {
        return "" + d['args'];
      });
      selection.select("span.block").text(function(d) {
        return "" + d['block'];
      });
      selection.select("span.result").text(function(d) {
        return "" + d['result'];
      });
      yielder = selection.select('svg.yield').selectAll('use').data((function(d) {
        return [d['yield']];
      }), function(d) {
        return d;
      });
      yielder.exit().remove();
      return yielder.enter().append('use').attr('xlink:href', function(d) {
        return "#elem_" + d;
      }).attr('x', 0).attr('y', 0).each(function(d) {
        return $(this).parents('.chart').find(".elem_" + d).toggle('visible').toggle('visible');
      });
    };
    queue = [];
    reset_queue = function() {
      return queue = [queue.shift()];
    };
    update_queue = function(parcel) {
      if (queue[0] !== parcel) return queue.unshift(parcel);
    };
    setInterval((function() {
      if (queue.length !== 0) return update_data(queue.pop());
    }), duration * 2);
    slide = function(num) {
      var num_slides;
      num_slides = $('#slides .slide').size();
      num = confine(1, num, num_slides);
      return d3.select('#slides').selectAll('.slide').attr('hidden', function(d, i) {
        if (i === num - 1) {
          return null;
        } else {
          return true;
        }
      });
    };
    routes = {
      slide: slide,
      update: update_queue,
      msg: debug,
      reset: reset_queue,
      debug: debug
    };
    route = function(_arg) {
      var label, parcel;
      label = _arg.label, parcel = _arg.parcel;
      return routes[label](parcel);
    };
    phone_home = function(count) {
      var ws;
      if (count == null) count = 0;
      debug("Connection attempt " + count);
      ws = new WebSocket('ws://tr.ytofoc.us:443');
      ws.onmessage = function(evt) {
        return route(JSON.parse(evt.data));
      };
      ws.onclose = function() {
        debug('socket closed');
        return setTimeout((function() {
          return phone_home(count + 1);
        }), 1000);
      };
      return ws.onopen = function() {
        return debug('connected...');
      };
    };
    return phone_home();
  });
}).call(this);
