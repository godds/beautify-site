var ko = require('knockout');

// from: https://gist.github.com/idanz/6411301/raw/f2c765589a017dcc1e94e18c4c86614595c33673/gistfile1.coffee
/* 
inspired from  http://www.knockmeout.net/2011/04/pausing-notifications-in-knockoutjs.html , with the following changes
1. Pause never causes trigger or computation
2. Resume only causes trigger if the computed dependencies were triggered while it was paused
3. Pause and Resume can be nested without any additional triggers or computation
*/
if (!ko.pausableComputed) {
    ko.pausableComputed = function(evaluatorFunction, evaluatorTarget) {
      var isPaused, notify, pauseCounter, result,
        _this = this;
      isPaused = ko.observable(false);
      pauseCounter = ko.observable(0);
      ko.computed(function() {
        return isPaused(pauseCounter() > 0);
      });
      notify = [];
      result = ko.computed(function() {
        if (isPaused.peek()) {
          isPaused();
          return result.peek();
        } else {
          return evaluatorFunction.call(evaluatorTarget);
        }
      });
      result.pause = function() {
        if (!isPaused()) {
          notify.push(result.notifySubscribers);
          result.notifySubscribers = function() {};
        }
        return pauseCounter(pauseCounter() + 1);
      };
      result.resume = function() {
        result.notifySubscribers = notify[0];
        return pauseCounter(pauseCounter() - 1);
      };
      return result;
    };
}