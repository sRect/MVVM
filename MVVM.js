class MVVM {
  constructor(el, data) {
    this.$el = this.isNodeElement ? el : document.querySelector(el);
    this.$data = data;
  }

  isNodeElement(el) {
    return el.nodeType === 3;
  }
}