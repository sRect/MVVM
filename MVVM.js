class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) {
      // 编译之前，对数据进行劫持
      new Observer(this.$data);
      // 用数据和元素进行编译
      new Compile(this.$el, this);
    }
  }



}