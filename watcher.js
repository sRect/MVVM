// 观察者的目的
// 就是给需要变化的那个元素增加一个观察者
// 当数据变化后进行相应的方法
// 用新值和旧值进行比对，发生变化，就调用更新方法
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;

    // 先获取旧值
    this.value = this.get();
  }

  getVal(vm, expr) { // 获取实例上对应的数据
    return expr.split(".").reduce((prev, next) => {
      return prev[next];
    }, vm.$data)
  }

  get() {
    Dep.target = this; // Dep.target为这个watcher对象
    let val = this.getVal(this.vm, this.expr);
    Dep.target = null;
    return val;
  }

  // 对外暴露的方法
  update() {
    let newVal = this.getVal(this.vm, this.expr);
    let oldVal = this.value;
    if (newVal !== oldVal) {
      this.cb(newVal); // 调用watch的callback
    }
  }
}