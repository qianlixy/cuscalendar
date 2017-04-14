/**
 * 日期格式化工具类
 *
 * 构造方法：
 *     1. new Calendar();   // 默认系统当前时间创建日历对象
 *     2. new Calendar(date);   // 通过指定日期对象创建日历对象
 *     3. new Calendar(dateStr);    // 通过指定时间字符串创建日历对象（时间格式必须为：yyyy-MM-dd HH:mm:ss）
 *     4. new Calendar(dateStr, pattern);   // 通过指定时间字符串和时间格式创建日历对象
 *     5. new Calendar(year, month, day);   // 通过指定年、月、日创建日历对象。时、分、秒默认为0
 *     6. new Calendar(year, month, day, hours, mimutes, seconds);  // 通过指定年、月、日、时、分、秒创建日历对象
 *
 * 静态方法：
 *     1. Calendar.parse(dateStr, pattern);     // 根据时间格式解析时间字符串。返回值为日期对象
 *     2. Calendar.isSameDay(date1, date2);     // 判断两个日期是否是同一天。如果参数为日期格式字符串格式必须为yyyy-MM-dd
 *
 * 成员方法：
 *     1. monthDays();  // 获取当前月份的天数。返回值为整数
 *     2. prevMonthDays();  // 获取上个月份的天数。返回值为整数
 *     3. nextMonthDays();  // 获取下个月份的天数。返回值为整数
 *     4. offsetMonthDays();    // 获取相对当前月指定偏移量的月份的天数。返回值为整数
 *     5. howManyDays();    // 当前月份某天在一周中是第几天（默认周日为一周的第一天）。返回值为整数
 *     6. move(year, month, day, hours, mimutes, seconds);  // 将日历的当前时间移动到指定时间。无返回值
 *     7. moveYear(year, month, day, hours, mimutes, seconds);  // 将日历的当前时间移动到指定年份。无返回值
 *     8. moveMonth(year, month, day, hours, mimutes, seconds);  // 将日历的当前时间移动到指定月份。无返回值
 *     9. moveDay(year, month, day, hours, mimutes, seconds);  // 将日历的当前时间移动到指定天。无返回值
 *
 * @author qianli_xy@163.com
 * @version 1.0.0
 */

!(function(win) {

    function isType(obj, type) {
        return Object.prototype.toString.call(obj) === ('[object ' + type + ']');
    }

    function foreach(obj, callback) {
        if(isType(obj, "Array")) {
            for(var i=0; i<obj.length; i++) {
                if(callback.call(null, i, obj[i])) break;
                else continue;
            }
        } else {
            for(var name in obj) {
                if(callback.call(null, name, obj[name])) break;
                else continue;
            }
        }
    }

    function setDate(date, year, month, day, hours, mimutes, seconds) {
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        date.setHours(hours);
        date.setMinutes(mimutes);
        date.setSeconds(seconds);
        return date;
    }

    var Calendar = function() {
        if(arguments.length === 0) this.date = new Date();
        else if(arguments.length === 1 && isType(arguments[0], "Date")) this.date = arguments[0];
        else if(arguments.length === 1 && isType(arguments[0], "String")) this.date = Calendar.parse(arguments[0], "yyyy-MM-dd HH:mm:ss");
        else if(arguments.length === 2 && isType(arguments[0], "String") && isType(arguments[1], "String")) {
            this.date = Calendar.parse(arguments[0], arguments[1]);
        }
        else if(arguments.length === 3 || arguments.length === 6 && Calendar.isInteger(arguments)) {
            this.date = setDate(new Date(), arguments[0], arguments[1] - 1, arguments[2], 0, 0, 0);
        }
        if(arguments.length === 6 && Calendar.isInteger(arguments)) {
            this.date.setHours(arguments[3]);
            this.date.setMinutes(arguments[4]);
            this.date.setSeconds(arguments[5]);
        }
        if(!this.date) throw "无效参数：" + JSON.stringify(arguments);
    };

    Calendar.prototype.__record = function() {
        if(!this.isDefer) this._backupTime = this.date.getTime();
    };

    Calendar.prototype.__recover = function() {
        if(!this.isDefer) this.date.setTime(this._backupTime);
    };

    var formatPatterns = ["yyyy","MM","dd","HH","mm","ss"],
    formatPatternsMethod = {"yyyy":"FullYear", "MM":"Month", "dd":"Date", "HH":"Hours", "mm":"Minutes", "ss":"Seconds"};

    /**
     * 解析日期字符串
     */
    Calendar.parse = function(dateStr, pattern) {
        // 获取格式位置
        var patPosition = [];
        foreach(formatPatterns, function(i, pat) {
            var index = pattern.indexOf(pat);
            if(index >= 0) patPosition.push([pat, index]);
        });
        patPosition.sort(function(o1, o2) {return o1[1] - o2[1];});

        // 拼接分隔符正则表达式
        var regStr = "";
        foreach(patPosition, function(index, pat) {
            if(0 === index) regStr += ("(.*)" + pat[0]);
            else if(patPosition.length === index+1) regStr += ("(.+)" + pat[0] + "(.*)");
            else regStr += ("(.+)" + pat[0]);
        });
        // 拼接时间信息正则表达式
        var result = new RegExp(regStr).exec(pattern);
        regStr = "";
        foreach(result, function(index, s) {if("" === s || index === 0) return false;regStr += ("(.+)" + s);});
        regStr += "(.+)";

        // 获取时间信息
        foreach(RegExp(regStr).exec(dateStr), function(i, d) {if(0 === i) return false;patPosition[i-1].push(d);});
        var resultDate = new Date();
        foreach(patPosition, function(i, v) {
            resultDate["set"+formatPatternsMethod[v[0]]].call(resultDate, v[2]);
        });
        // 矫正月份
        resultDate.setMonth(resultDate.getMonth() - 1);
        return resultDate;
    };

    /**
     * 判断是否是同天
     */
    Calendar.isSameDay = function(arg1, arg2) {
        var date1 = arg1, date2 = arg2;
        if(!isType(arg1, "Date")) date1 = Calendar.parse(arg1, "yyyy-MM-dd");
        if(!isType(arg2, "Date")) date2 = Calendar.parse(arg2, "yyyy-MM-dd");
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    /**
     * 判断是否是整型
     */
    Calendar.isInteger = function(obj) {
        if(isType(obj, "Array") || isType("Arguments")) {
            for(var i=0; i<obj.length; i++) {
                if(!isIntegerWithOne(obj[i])) return false;
            }
        } else {
            return isIntegerWithOne(obj);
        }

        return true;

        function isIntegerWithOne(num) {
            if(typeof(num) === "undefined" || null === num || '' === num)
                return false;
            try {
                return parseInt(num) === num;
            } catch (e) {
                return false;
            }
        }
    };

    /**
     * 当前月份的天数
     */
    Calendar._monthDays = function() {
        return this.offsetMonthDays();
    };

    /**
     * 上个月份的天数
     */
    Calendar._prevMonthDays = function() {
        return this.offsetMonthDays(-1);
    };

    /**
     * 下个月份的天数
     */
    Calendar._nextMonthDays = function() {
        return this.offsetMonthDays(1);
    };

    /**
     * 判断日期参数和当前日历所在天是否是同一天
     */
    Calendar._isSameDay = function(date) {
        return Calendar.isSameDay(this.date, date);
    };

    /**
     * 相对当前月份偏移月份的天数
     */
    Calendar._offsetMonthDays = function(offset) {
        if(Math.abs(offset) >= 12) {
            var offsetYear = parseInt(Math.abs(offset) / 12);
            var offsetMonth = Math.abs(offset) - offsetYear * 12;
            var sign = offset < 0 ? -1 : 1;
            this.date.setFullYear(this.date.getFullYear() + offsetYear * sign);
            this.date.setMonth(this.date.getMonth() + offsetMonth * sign);
        } else {
            var currentMonth = this.date.getMonth() + (offset || 0);
            this.date.setMonth(currentMonth);
        }
        var time = this.date.setDate(1);
        this.date.setMonth(this.date.getMonth() + 1);
        var nextTime = this.date.getTime();
        return (nextTime - time) / 86400000;
    };

    /**
     * 当前月份某天在一周中是第几天（默认周日为一周的第一天）
     */
    Calendar._howManyDays = function(day) {
        this.date.setDate(day);
        return this.date.getDay();
    };

    Calendar._move = function(year, month, day, hours, minutes, seconds) {
        setDate(this.date,
            year || this.date.getFullYear(),
            Calendar.isInteger(month) ? (month - 1) : this.date.getMonth(),
            day || this.date.getDate(),
            hours || this.date.getHours(),
            minutes || this.date.getMinutes(),
            seconds || this.date.getSeconds());
        return this;
    };

    Calendar._moveYear = function(year) {
        return this.move(year);
    };

    Calendar._moveMonth = function(month) {
        return this.move(null,month);
    };

    Calendar._moveDay = function(day) {
        return this.move(null,null,day);
    };

    foreach(Calendar, function(key, value) {
        if(key.indexOf("__")===0) return false;
        else if(key.indexOf("_")===0) {
            Calendar.prototype[key.substr(1)] = function() {
                this.__record();
                var result = Calendar[key].apply(this, arguments);
                if(result !== this) this.__recover();
                return result;
            };
        }
    });

    win.Calendar = Calendar;

})(window);
