/**
 * Created by Jesus F on 2015/12/30 0030.
 */
    //只有一种匀速运动方式；
var animate = (function () {
    var flag = "getComputedStyle" in window;
    var getCss = function (curEle, attr) {
        var val = null;
        var reg = null;
        if (flag) {
            val = window.getComputedStyle(curEle, null)[attr];
        } else {
            if (attr === "opacity") {
                val = curEle.currentStyle["filter"];
                reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/;
                val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = curEle.currentStyle[attr];
            }
        }
        reg = /^-?\d+(\.\d+)?(px|pt|em|rem)?$/;
        return reg.test(val) ? parseFloat(val) : val;
    };
    var setCss = function (curEle, attr, value) {
        var reg = /^(width|height|top|right|left|bottom|((margin|padding)(top|left|right|bottom)?))$/i;
        if (attr === "float") {
            curEle["style"]["cssFloat"] = value;
            curEle["style"]["styleFloat"] = value;
            return;
        }
        if (attr === "opacity") {
            value = Number(value);
            isNaN(value) ? value = 1 : null;
            curEle["style"]["opacity"] = value;
            curEle["style"]["filter"] = "alpha(opacity=" + value*100 + ")";
            return;
        }
        if (reg.test(attr)) {
            curEle["style"][attr] = isNaN(value) ? value : value + "px";
            return;
        }
        curEle["style"][attr] = value;
    };
    var Effect = {
        Linear: function (t, b, c, d) {
            return c * t / d + b;
        }
    };
    return function (curEle, options, duration, effect, callback) {
        //init effect
        var fnEffect = Effect.Linear;//->默认是匀速的运动
        if (typeof effect === "number") {
            fnEffect = Effect.Linear;
        } else if (effect instanceof Array) {
            var effectFir = effect[0];
            fnEffect = Effect[effectFir];
        } else if (typeof effect === "function") {
            callback = effect;
        }
        var times = 0, interval = 15, oBegin = {}, oChange = {};
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                oBegin[key] = getCss(curEle, key);
                oChange[key] = options[key] - oBegin[key];
            }
        }
        var move = function () {
            window.clearTimeout(curEle.timer);
            times += interval;
            if (times >= duration) {
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        setCss(curEle, key, options[key]);
                    }
                }
                typeof callback === "function" ? callback.call(curEle) : null;
                return;
            }
            for (var attr in oChange) {
                if (oChange.hasOwnProperty(attr)) {
                    var curVal = fnEffect(times, oBegin[attr], oChange[attr], duration);
                    setCss(curEle, attr, curVal);
                }
            }
            curEle.timer = window.setTimeout(move, interval);
        };
        move()
    }
})();