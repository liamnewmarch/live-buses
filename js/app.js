var app = angular.module('app', []);

app.constant('weekDays', [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]);

app.service('weather', function($http) {
  return $http.get('js/data.js').then(function(res) {
    return res.data;
  });
});

app.service('tfl', function($http, $q) {
  function countdown(expected) {
    var difference = new Date(expected) - new Date();
    return difference / 6E4;
  }

  function getArrivals() {
    var promises = [];
    angular.forEach(arguments, function(id) {
      promises.push($http.get('https://api.tfl.gov.uk/StopPoint/' + id + '/arrivals').then(function(res) {
        angular.forEach(res.data, function(data) {
          data.expectedArrival = countdown(data.expectedArrival);
        });
        return res.data;
      }));
    });
    return $q.all(promises).then(function(resolveds) {
      var arrivals = [];
      angular.forEach(resolveds, function(resolved) {
        angular.forEach(resolved, function(bus) {
          if (bus.lineName === '188' || bus.lineName === '422') {
            arrivals.push(bus);
          }
        })
      });
      return arrivals;
    });
  }

  return {
    from: getArrivals('490013840R'),
    to: getArrivals('490010374B', '490010374C')
  };
});

app.controller('ViewController', function(weather, tfl) {
  var ctrl = this;
  weather.then(function(data) {
    ctrl.weather = data;
  });
  tfl.from.then(function(data) {
    ctrl.busFrom = data;
  });
  tfl.to.then(function(data) {
    ctrl.busTo = data;
  });
  ctrl.pluralize = { 0: 'Due', 1: '1 min', 'other': '{} mins'};
});

app.filter('dayFromDate', function(weekDays) {
  return function(dateString) {
    var date = new Date(dateString);
    var day = date.getUTCDay();
    return weekDays[day];
  };
});

app.filter('decimalPlaces', function() {
  return function(number, decimalPlaces) {
    var pow = Math.pow(10, decimalPlaces);
    return Math.round(number * pow) / pow;
  };
});
