class Compile {
  constructor(el, vm) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    // 元素存在进行编译
    if (this.$el) {
      // 1.把真实的DOM放入到内存中 fragment
      let fragment = this.node2fragment(this.$el);
      // 2.编译 元素节点 v-model  文本节点 {{}}
      this.compile(fragment);
      // 3.把编译好的fragment放回页面中
      this.$el.appendChild(fragment);
    }

  }

  /**
   * 辅助方法
   */
  isElementNode(node) {
    return node.nodeType === 1;
  }
  // 是否为指令
  isDirective(name) {
    return name.includes("v-");
  }


  /**
   * 核心方法
   */
  // 节点转成文档碎片
  node2fragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild = null;

    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }

    return fragment;
  }

  // 编译元素
  compileElement(node) {
    let attrs = node.attributes;

    Array.from(attrs).forEach(attr => {
      // 判断属性名字是否包含v-
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // 取到对应的值放到节点中 node this.vm.$data expr
        let expr = attr.value;
        // let type = attrName.slice(2);
        let [, type] = attrName.split("-");
        CompileUtil[type](node, this.vm, expr);
      }
    })
  }

  // 编译文本
  compileText(node) {
    // {{a}} {{b}}
    let expr = node.textContent; // 文本内容
    let reg = /\{\{([^}]+)\}\}/g;

    if (reg.test(expr)) {
      // node this.vm.$data expr
      CompileUtil['text'](node, this.vm, expr);
    }
  }

  // 进行编译
  compile(fragment) {
    let childNodes = fragment.childNodes;

    [...childNodes].forEach(node => {
      if (this.isElementNode(node)) {
        // 元素节点，需要递归
        this.compileElement(node);
        this.compile(node);
      } else {
        // 文本
        this.compileText(node);
      }
    })
  }
}

CompileUtil = {
  // 获取实例上对应的$data的值
  getVal(vm, expr) {
    return expr.split(".").reduce((prev, next) => {
      return prev[next];
    }, vm.$data)
  },
  // 文本处理
  text(node, vm, expr) {
    if (expr.startsWith("{{") && expr.endsWith("}}")) { // {{}}
      let updateFn = this.updater['textUpdater'];

    } else { // v-text
      let updateFn = this.updater['directiveTextUpdater'];
      updateFn && updateFn(node, this.getVal(vm, expr));
    }
  },
  // 输入框处理
  model(node, vm, expr) {
    let updateFn = this.updater['modelUpdater'];
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value;
    },
    // v-text
    directiveTextUpdater(node, value) {
      node.innerText = value;
    },
    // 输入框更新
    modelUpdater(node, value) {
      node.value = value;
    }
  }
}