const Directives = {
  text: {
    update (el, value) {
      el.textContent = value;
    },
  },
  class: {
    update (el, value, classname) {
      el.classList[value ? 'add' : 'remove'] (classname);
    },
  },
  on: {
    update (el, handle, event, directive, app) {
      el.addEventListener (event, handle.bind (app));
    },
  },
};

const PREFIX = 'v-';

class App {
  constructor (opts) {
    this.root = document.querySelector (opts.id);
    this.data = opts.data;
    this.methods = opts.methods;
    this.bindings = {};
    this.els = [
      this.root,
      ...this.root.querySelectorAll (this.concatSelector ()),
    ];
    [...this.els].forEach (el => {
      this.compile (el);
    });
  }
  concatSelector () {
    return Object.keys (Directives).map (d => `[${PREFIX}${d}]`).join (',');
  }
  compile (el) {
    const attrs = this.cloneAttributes (el.attributes);
    attrs.forEach (attr => {
      const directive = this.parseDirective (attr);
      if (directive) {
        el.removeAttribute (attr.name);
        directive.el = el;
        this.createBinding (directive);
      }
    });
    this.setData ();
  }
  setData () {
    Object.keys (this.data).forEach (key => {
      this[key] = this.data[key];
    });
    Object.keys (this.methods).forEach (key => {
      this[key] = this.methods[key];
    });
  }
  createBinding (directive) {
    const self = this;
    const {key, dirname} = directive;
    if (!this.bindings[key]) {
      const target = dirname == 'on' ? this.methods : this.data;
      this.bindings[key] = {
        value: target[key],
        directives: [directive],
      };
      Object.defineProperty (target, key, {
        get () {
          return self.bindings[key].value;
        },
        set (newValue) {
          self.bindings[key].value = newValue;
          self.bindings[key].directives.forEach (d =>
            d.update (d.el, newValue, d.arg, directive, self)
          );
        },
      });
      Object.defineProperty (this, key, {
        get () {
          return target[key];
        },
        set (newVal) {
          target[key] = newVal;
        },
      });
    } else {
      this.bindings[key].directives.push (directive);
    }
  }
  parseDirective (attr) {
    const {name, value} = attr;
    const noPrefix = name.slice (PREFIX.length);
    const argIndex = noPrefix.indexOf ('-');
    const arg = argIndex > -1 ? noPrefix.slice (argIndex + 1) : null;
    const dirname = arg ? noPrefix.slice (0, argIndex) : noPrefix;
    const def = Directives[dirname];
    return def
      ? {
          ...def,
          dirname,
          arg,
          key: value,
        }
      : null;
  }
  cloneAttributes (attributes) {
    return [...attributes].filter (i => i.name.startsWith (PREFIX)).map (i => {
      return {name: i.name, value: i.value};
    });
  }
}
window.app = new App ({
  id: '#app',
  data: {
    msg: '111',
    red: false,
  },
  methods: {
    handleClick (e) {
      this.red = !this.red;
    },
    toggle (e) {
      console.log (e);
      this.msg += this.msg;
    },
  },
});
