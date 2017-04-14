/**
 * 自定义平铺式日历插件
 *
 * @author qianli_xy@163.com
 * @version 1.0.0
 */
!(function($, win, cusc) {

    var DEFALUT = {
        tagName:'span',
        yearWrap:'.year_wrap',
        monthWrap:'.month_wrap',
        weekWrap:'.week_wrap',
        daysWrap:'.day_wrap',
        prevMonth:'.prev',
        nextMonth:'.next',
        today:'.today',
        presetDate:new Date(),
        onYearClick:function(year){},
        onMonthClick:function(month){},
        onDayClick:function(year, month, day){},
        onPrevClick:function(year, month){},
        onNextClick:function(year, month){},
        onBuildDay:function(year, month, day){}
    };

    cusc.weeks = cusc.weeks || ["周日","周一","周二","周三","周四","周五","周六"];

    if(!win.CusCalendar) win.CusCalendar = cusc;

    function bind(jq, event, callback) {
        var jv = parseInt($().jquery.replace(/\./g, "")) || 0;
        if(jv <= 183) $(jq).live(event, callback);
        else $(document).on(event, jq.selector, callback);
    }

    var StringBuffer = function() {
        this.array = [];
        this.appendAll(arguments);
    };

    StringBuffer.prototype.appendAll = function() {
        for(var i=0; i<arguments.length; i++) {
            var arg = arguments[i];
            if(arg.length && arg.length > 0) {
                for(var j=0; j<arg.length; j++) this.array.push(arg[j]);
            } else this.array.push(arguments[i]);
        }
    };

    StringBuffer.prototype.toString = function() {
        return this.array.join("");
    };

    function createTag(tagName, tagVal, attrs) {
        var sb = new StringBuffer("<", tagName);
        $.each(attrs, function(name, value) {
            sb.appendAll(" ", name, "=\"", value, "\"");
        });
        sb.appendAll(">", tagVal || '', "</", tagName, ">");
        return sb.toString();
    }

    $.fn.cuscal = function(setting) {

        var opts = $.extend({}, DEFALUT, typeof setting === "object" ? setting : {}),

        cal = new Calendar(opts.presetDate),

        _arguments = arguments;

        var outerMethods = {
            move : function(year, month) {
                cal.date.setFullYear(year);
                cal.date.setMonth(month - 1);
                buildAllWithoutWeek.call(this);
            }
        };

        return this.each(function() {
            var $this = $(this);
            if($this.data("cuscal") !== true) {
                buildAll.call(this);
                bind($this.find(opts.yearWrap), "click", function() {
                    opts.onYearClick.call(this, cal.date.getFullYear());
                });
                bind($this.find(opts.monthWrap), "click", function() {
                    opts.onMonthClick.call(this, cal.date.getMonth() + 1);
                });
                bind($this.find(opts.daysWrap + " .day"), "click", function() {
                    var $this = $(this), month = cal.date.getMonth() + 1;
                    if($this.is(".prev_month_day")) month -= 1;
                    else if($this.is(".next_month_day")) month += 1;
                    opts.onDayClick.call(this, $this.data("year"), $this.data("month"), $this.data("day"));}
                );
                bind($this.find(opts.prevMonth), "click", function() {
                    var month = cal.date.getMonth() + 1 - 1;
                    if(opts.onPrevClick.call(this, cal.date.getFullYear(), month)!==false) {
                        cal.moveMonth(month);
                        buildAllWithoutWeek.call($this[0]);
                    }
                });
                bind($this.find(opts.nextMonth), "click", function() {
                    var month = cal.date.getMonth() + 1 + 1;
                    if(opts.onNextClick.call(this, cal.date.getFullYear(), month)!==false) {
                        cal.moveMonth(month);
                        buildAllWithoutWeek.call($this[0]);
                    }
                });
                bind($this.find(opts.today), "click", function() {
                    backToday.call($this[0]);
                });
                $this.data("cuscal", true);
            }

            if(typeof setting == "string" && typeof outerMethods[setting] == "function") {
                var args = [];
                for(var i=0; i<_arguments.length; i++) {
                    if(i === 0) continue;
                    args.push(_arguments[i]);
                }
                outerMethods[setting].apply(this, args);
            }
        });

        function backToday() {
            cal.date = new Date();
            buildAllWithoutWeek.call(this);
        }

        function buildAll(isWithoutWeek){
            var $this = $(this);
            buildYear.call($this.find(opts.yearWrap));
            buildMonth.call($this.find(opts.monthWrap));
            if(!isWithoutWeek) buildWeek.call($this.find(opts.weekWrap));
            buildDays.call($this.find(opts.daysWrap));
        }

        function buildAllWithoutWeek() {
            buildAll.call(this, true);
        }

        function buildYear(){
            $(this).attr("data-val", cal.date.getFullYear());
            $(this).html(cal.date.getFullYear());
        }

        function buildMonth(){
            $(this).attr("data-val", cal.date.getMonth() + 1);
            $(this).html(cal.date.getMonth() + 1);
        }

        function buildWeek(){
            var $this = $(this);
            $.each(cusc.weeks, function(index, week) {
                $this.append(createTag(opts.tagName, week, {'class':'week','data-val':index}));
            });
        }

        function buildDays(){
            var $this = $(this), dayArry = [], systemDate = new Date(),
                year = cal.date.getFullYear(), monthNum = cal.date.getMonth();
            $this.html("");
            // 上月的日期
            for(var i=cal.howManyDays(1)-1; i>=0; i--) dayArry.push({month:monthNum,day:cal.prevMonthDays()-i});
            // 当前月的日期
            var monthDays = cal.monthDays();
            for(var j=1; j<=monthDays; j++) dayArry.push({month:monthNum+1,day:j});
            // 下月的日期
            for(var k=1; k<(7-cal.howManyDays(monthDays)); k++) dayArry.push({month:monthNum+2,day:k});

            $.each(dayArry, function(i, date) {
                var style = ["day"];
                if(date.month === cal.date.getMonth()) style.push(" prev_month_day");
                else if(date.month === cal.date.getMonth() + 1) style.push(" cur_month_day");
                else style.push(" next_month_day");
                if(Calendar.isSameDay(systemDate, year+"-"+date.month+"-"+date.day))
                    style.push(" cur_day");
                var ele = $(createTag(opts.tagName, date.day, {'class':style,'data-year':year,'data-month':date.month,'data-day':date.day}));
                opts.onBuildDay.call(ele[0], year, date.month, date.day);
                $this.append(ele);
            });
        }

    };

})(jQuery, window, typeof(CusCalendar)!="undefined"?CusCalendar:{});
