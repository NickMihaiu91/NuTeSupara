(function () {
    angular.module('relativeDate', []).provider('relativeDate', function () {
        var _cutoffDay_, _defaultFallbackFormat_;
        _defaultFallbackFormat_ = "MMM d, yyyy";
        _cutoffDay_ = 22;
        this.defaultFallbackFormat = function (format) {
            return _defaultFallbackFormat_ = format;
        };
        this.cutoffDayCount = function (numDays) {
            return _cutoffDay_ = numDays;
        };
        this.$get = [
            'dateFilter', '$interval', function (dateFilter, $interval) {
                var fallbackFormat, time_ago;
                fallbackFormat = function (formatOverride) {
                    if (typeof formatOverride !== 'undefined') {
                        return formatOverride;
                    } else {
                        return _defaultFallbackFormat_;
                    }
                };
                time_ago = function (time, override) {
                    var date, day_diff, diff;
                    date = new Date(time || "");
                    diff = ((new Date()).getTime() - date.getTime()) / 1000;
                    day_diff = Math.floor(diff / 86400);
                    if (isNaN(day_diff) || day_diff < 0 || day_diff >= _cutoffDay_) {
                        return dateFilter(time, fallbackFormat(override));
                    }
                    return day_diff === 0 && (diff < 60 && "Chiar acum" || diff < 120 && "Acum 1 minut" || diff < 3600 && Math.floor(diff / 60) + " minute în urmă" || diff < 7200 && "Acum 1 oră" || diff < 86400 && Math.floor(diff / 3600) + " ore în urmă") || day_diff === 1 && "Ieri" || day_diff < 7 && day_diff + " zile în urmă" || day_diff === 7 && "O săptămâna" || Math.ceil(day_diff / 7) + " săptămâni în urmă";
                };
                return {
                    set: function (date, callback, optionalFormat) {
                        var error, iterator, notice, relDate, success;
                        relDate = time_ago(date, optionalFormat);
                        iterator = $interval(function () {
                            relDate = time_ago(date, optionalFormat);
                            return callback(relDate);
                        }, 60000);
                        success = function () { };
                        error = function () { };
                        notice = function () {
                            if (!(relDate.slice(-4) === "acum" || relDate.slice(-5) === "minut" || relDate.slice(-4) === "urmă")) {
                                return $interval.cancel(iterator);
                            }
                        };
                        iterator.then(success, error, notice);
                        callback(relDate);
                        return iterator;
                    }
                };
            }
        ];
        return this;
    });

}).call(this);