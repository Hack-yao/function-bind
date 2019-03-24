'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);  // 0 是 that

    var bound;
    var binder = function () {
        if (this instanceof bound) { // bound 作为 new 构造函数使用
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) { // target函数 返回一个对象，使用target返回值
                return result;
            }
            return this;  // 返回 构造函数中的this对象
        } else { // 正常函数调用
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) { // 剩余缺少的参数， 保持函数的length值
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);
//     bound = function ($1,$2, ...) {
//         return binder.apply(this, arguments);
//     }

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();  // 这样 bound.prototype上添加的属性不会影响到 target.prototype，实现了一定程度上的隔离
        Empty.prototype = null;  // 销毁 Empty.prototype对target.prototype的引用。防止一些未释放的引用造成的内存泄漏
    }

    return bound;
};
