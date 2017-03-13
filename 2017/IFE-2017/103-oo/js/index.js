/**
 * Created by Mingholy on 2017/3/7.
 */
/**
 * 参考了https://github.com/Away0x/baidu_fe/blob/master/bingbing/lesson_4/index.html
 * 觉得自己写的上一个任务还停留在操作DOM的初级阶段，不够优雅
 * 用新方法重写
 * 理解肯定不完全，有些语句都不知道是干什么的，暂时只实现能理解的部分
 * 思路：维护一个queue类，添加增删函数，需要显示时读取数据渲染HTML
 */

/**
 * 获取元素方法
 * @param id
 * @returns {Element}
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * 绑定事件函数
 * @param selector 元素选择器
 * @param func 事件处理函数
 */
function bindEvent(selector, func) {
    var element = $(selector);
    element.addEventListener("click", function() {
        //这里这样写应该是判断func的合法性
        func && func.call(element);
    });
}
/**
 * 获取输入值
 * @param inputSelector 输入框id
 * @returns {Function}
 */
function getValue(inputSelector) {
    return function() {
        var $input = $(inputSelector);
        var num = parseInt($input.value);

        //取后清空
        $input.value = "";

        //判断是否为数字或空
        if(! isType("Number")(num) || isNaN(num)) {
            alert("请输入一个数字");
            return false;
        }
        return num;
    }
}

/**
 * 判断类型方法
 * 原作者这里创建了两个类型判断器作为全局变量
 * 不想建立全局变量，所以直接调用返回函数
 * isType('Array')(ar);
 * @param type 要判断的类型
 * @returns {Function} 返回函数的参数是要判断的目标
 */
function isType(type) {
    return function(target) {
        //注意toString.call(target)返回的是目标的类型：[object Number], [object Array]这样的，用来判断类型。注意object后有个空格！
        return toString.call(target) === "[object " + type + "]";
    }
}

var Queue = (function () {

    /**
     * 构造函数
     * @constructor
     */
    function Queue(container) {
        this._data = [];
        this._$container = $(container);
    }

    /**
     * 重写原型
     * @type {{}}
     */
    Queue.prototype = {
        constructor: Queue,

        //右侧入
        _push: function(number) {
            this._data.push(number);
            var $liToInsert = this._render(number);
            this._$container.appendChild($liToInsert);
        },

        //右侧出
        _pop: function() {
            if(this._data.length === 0) return false;
            var $liToRemove = this._$container.lastChild;
            this._$container.removeChild($liToRemove);
            return this._data.pop();
        },

        //左侧入
        _unshift: function(number) {
            this._data.unshift(number);
            var $firstLi = this._$container.firstChild;
            var $liToInsert = this._render(number);
            this._$container.insertBefore($liToInsert, $firstLi);
        },

        //左侧出
        _shift: function() {
            if(this._data.length === 0){
                return false;
            }
            var $liToRemove = this._$container.firstChild;
            this._$container.removeChild($liToRemove);
            return this._data.shift();
        },

        /*
         * 渲染单个列表元素
         * 添加删除元素后无需重新渲染整个列表
         */
        _render: function(number) {
            var $li = document.createElement("li");
            $li.textContent = number.toString();
            $li.addEventListener("click", this._remove);
            return $li;
        },

        //删除元素
        _remove: function() {
            this.remove();
            return false;
        }
    };

    return Queue;
}());

/**
 * 初始函数
 */
window.onload = function() {
    var queueObj = new Queue("queue");
    var getNum = getValue("input");

    //事件处理函数
    function leftInEvent() {
        var num = getNum();
        if(num) {
            queueObj._unshift(num);
        }
    }

    function rightInEvent() {
        var num = getNum();
        if(num) {
            queueObj._push(num);
        }
    }

    function leftOutEvent() {
        var deletedNum = queueObj._shift();
        deletedNum ? alert(deletedNum) : alert("Queue is already empty!");
    }

    function rightOutEvent() {
        var deletedNum = queueObj._pop();
        deletedNum ? alert(deletedNum) : alert("Queue is already empty!");
    }

    //绑定事件处理函数
    bindEvent("left-in", leftInEvent);
    bindEvent("right-in", rightInEvent);
    bindEvent("left-out", leftOutEvent);
    bindEvent("right-out", rightOutEvent);
};
