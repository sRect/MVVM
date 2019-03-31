class Observer {
  constructor(data) {
    this.observer(data);
  }

  observer(data) {
    // data不是对象或者为null,直接return
    if (!data || typeof (data) !== 'object') {
      return;
    }

    // 要将数据进行劫持
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
      this.observer(data[key]); // 递归深度劫持
    })
  }

  // 定义响应式
  defineReactive(obj, key, value) {
    let _this = this;
    let dep = new Dep(); // 每个变化的数据都会对应一个数组，这个数组是存放所有的更新操作
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newVal) {
        if (newVal !== value) {
          _this.observer(newVal); // 如果设置的值是对象，还需要从进行劫持
          value = newVal;
          dep.notify(); // 通知数据更新
        }
      }
    })
  }
}

class Dep {
  constructor() {
    this.subs = []; //订阅的数组
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => {
      watcher.update();
    })
  }
}