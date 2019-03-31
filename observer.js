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
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // todo...
        return value;
      },
      set(newVal) {
        if (newVal !== value) {
          _this.observer(newVal); // 如果设置的值是对象，还需要从进行劫持
          value = newVal;
        }
      }
    })
  }
}