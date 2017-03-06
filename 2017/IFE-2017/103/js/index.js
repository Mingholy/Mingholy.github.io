/**
 * Created by Mingholy on 2017/3/6.
 */
"use strict";
/**
 * 事件绑定函数
 * 将操作元素事件handleChild绑定到按钮上，并给它传按钮的值，以确定操作类型
 */
function eventBind() {
    var buttons = document.getElementsByClassName("btn");

    for(var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            handleChild(this.value);
            return false;
        }
    }
}

/**
 * 操作元素函数
 * @param value 操作类型代码 1:左侧入 2:右侧入 3:左侧出 4:右侧出
 */
function handleChild(value) {
    //获取DOM元素及内部值
    var number = Number(document.getElementById("input").value);
    var queue = document.getElementById("queue");
    var items = queue.childNodes;

    //由于调用一次handleChild函数只插入一个元素，故item可以在判断之外创建
    var item = document.createElement("li");

    value = Number(value);
    switch (value) {
        case 1:
        case 2:
            if (number && !isNaN(number) && queue) {
                item.setAttribute("class", "queue-item");
                //给新增元素添加事件监听器 貌似不支持IE
                item.addEventListener("click", deleteItem);
                item.innerHTML = number.toString();
                if(items.length === 0) {
                    queue.appendChild(item);
                } else {
                    insertChild(item, queue, value - 2);
                }
            } else {
                alert("Input is not a number!")
            }
            break;
        case 3:
        case 4:
            if (queue && items.length !== 0) {
                deleteChild(queue, value - 4);
            } else {
                alert("Queue is already empty!");
            }
            break;
    }
}

/**
 * 插入元素函数
 * @param item 待插入元素
 * @param queue 插入的队列
 * @param isLeft 是否左插入
 */
function insertChild(item, queue, isLeft) {
    if (isLeft) {
        queue.insertBefore(item, queue.firstChild);
    } else  {
        queue.appendChild(item);
    }
}

/**
 * 删除元素函数
 * @param queue 待删除元素的队列
 * @param isLeft 是否左删除
 */
function deleteChild(queue, isLeft) {
    var deletedValue;
    var childNode;
    if(isLeft) {
        childNode = queue.firstChild;
        queue.removeChild(childNode);
    } else {
        childNode = queue.lastChild;
        queue.removeChild(childNode);
    }
    deletedValue = childNode.textContent;
    alert(deletedValue);
}

/**
 * 点击列表元素的事件处理函数
 * 删除它自己
 * @returns {boolean} 返回false阻止冒泡
 */
function deleteItem() {
    var node = this;
    document.getElementById("queue").removeChild(node);
    return false;
}

eventBind();