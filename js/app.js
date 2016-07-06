'use strict';

/**
 * Angular module
 * @type {object}
 */
var app = angular.module('app', []);


/**
 * TfL service factory.
 * @param {object} $http
 * @param {object} $q
 * @returns {object}
 */
app.factory('tfl', function($http, $q) {
  function countdown(expected) {
    var difference = new Date(expected) - new Date();
    return difference / 6E4;
  }

  function getArrival(id) {
    return $http.get('https://api.tfl.gov.uk/StopPoint/' + id + '/arrivals').then(function(res) {
      angular.forEach(res.data, function(data) {
        data.expectedArrival = countdown(data.expectedArrival);
      });
      return res.data;
    })
  }

  function getArrivals(ids) {
    var promises = [];
    angular.forEach(ids, function(id) {
      promises.push(getArrival(id));
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
    from: getArrivals(['490013840R']),
    to: getArrivals(['490010374B', '490010374C'])
  };
});


/**
 * View controller.
 * @constructor
 * @param {function} tfl
 */
app.controller('ViewController', function(tfl) {
  var ctrl = this;
  tfl.from.then(function(data) {
    ctrl.busFrom = data;
  });
  tfl.to.then(function(data) {
    ctrl.busTo = data;
  });
  ctrl.pluralize = {0: 'Due', 1: '1 min', 'other': '{} mins'};
});


/**
 * Filter to get day of the week from date.
 * @constructor
 * @param {function} $filter
 * @returns {function}
 */
app.filter('dayFromDate', function($filter) {
  var filter = $filter('date');
  return function(dateString) {
    var date = new Date(dateString);
    return filter(date, 'EEEE');
  };
});


/**
 * Filter to limit decimal places, without adding missing digits
 * @constructor
 * @returns {function}
 */
app.filter('decimalPlaces', function() {
  return function(number, decimalPlaces) {
    var pow = Math.pow(10, decimalPlaces);
    return Math.round(number * pow) / pow;
  };
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
