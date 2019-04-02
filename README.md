## 实现属于自己的MVVM

>　思路
![avatar](https://github.com/sRect/MVVM/blob/master/images/%E6%80%9D%E8%B7%AF.png?raw=true)

1. index.html
```html
<body>
  <div id="app">
    <input type="text" v-model="msg.a">
    <h1 v-text="msg.a"></h1>
    <div></div>
    <ul>
      <li>1</li>
      <li>{{}}</li>
    </ul>
    <p>{{msg.a}} {{msg.b}}</p>
  </div>

  <script src="./watcher.js"></script>
  <script src="./observer.js"></script>
  <script src="./compile.js"></script>
  <script src="./MVVM.js"></script>
  <script>
    let vm = new MVVM({
      el: "#app",
      data: {
        msg: {
          a: "hello world",
          b: "你好"
        },
        b: null,
        c: {
          c_1: "wait..."
        }
      }
    })
  </script>
</body>
```

2. MVVM.js
```javascript
class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) {
      // 编译之前，对数据进行劫持
      new Observer(this.$data);
      this.proxyData(this.$data)
      // 用数据和元素进行编译
      new Compile(this.$el, this);
    }
  }
}
```

3. compile.js(模板的编译)
```javascript
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
    ...
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
  text(node, vm, expr) {
    ...
  },
  model(node, vm, expr) {
    let updateFn = this.updater['modelUpdater'];
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新
    modelUpdater(node, value) {
      node.value = value;
    }
  }
}
```

3. observer.js(数据劫持)
```javascript
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
```
4. watcher.js(观察者)
```javascript
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
    let val = this.getVal(this.vm, this.expr);
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
```
