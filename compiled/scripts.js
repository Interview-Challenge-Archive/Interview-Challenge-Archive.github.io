webpackJsonp([1],{

/***/ 101:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 102:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 103:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(122),
  /* template */
  __webpack_require__(231),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/copy_to_clipboard_field/control.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] control.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4af20504", Component.options)
  } else {
    hotAPI.reload("data-v-4af20504", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 110:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(124),
  /* template */
  __webpack_require__(227),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/github_profile_field/control.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] control.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2a6c34f2", Component.options)
  } else {
    hotAPI.reload("data-v-2a6c34f2", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 111:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(125),
  /* template */
  __webpack_require__(229),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/projects/control.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] control.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-36bef0f9", Component.options)
  } else {
    hotAPI.reload("data-v-36bef0f9", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 112:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(127),
  /* template */
  __webpack_require__(236),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/control.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] control.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f52b68f4", Component.options)
  } else {
    hotAPI.reload("data-v-f52b68f4", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 122:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_clipboard__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_clipboard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_clipboard__);
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        dialog: __webpack_require__(29)
    },
    data: function data() {
        return {
            input_id: 'copy_to_clipboard_' + Math.random().toString(36).substring(7),
            clipboard: null
        };
    },

    props: {
        value: {
            type: String,
            default: function _default() {
                return '';
            }
        }
    },
    computed: {
        input_target: function input_target() {
            return '#' + input_id;
        }
    },
    mounted: function mounted() {
        this.clipboard = new __WEBPACK_IMPORTED_MODULE_0_clipboard___default.a(this.$refs.button);

        this.clipboard.on('success', function (e) {
            this.$refs.dialog.showModal('Clipboard', 'The link was copied to the clipboard!');
            e.clearSelection();
        });

        this.clipboard.on('error', function (e) {
            this.$refs.dialog.showModal('Clipboard', 'The link was copied to the clipboard!');
            window.jobtestvault.showErrorDialog('Clipboard', "Your browser doesn't support copy to clipboard command. Try to use manual shortcuts!", true);
        });
    }
});

/***/ }),

/***/ 123:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dialog_polyfill__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dialog_polyfill___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_dialog_polyfill__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_es6_enum__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_es6_enum___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_es6_enum__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




var DialogType = __WEBPACK_IMPORTED_MODULE_1_es6_enum___default()('INFO', 'ERROR', 'CUSTOM');
var ButtonType = __WEBPACK_IMPORTED_MODULE_1_es6_enum___default()('OK', 'CANCEL');

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        field_action: {
            type: String,
            required: true,
            default: function _default() {
                return '__action';
            }
        },
        title: {
            type: String,
            default: function _default() {
                return '';
            }
        },
        type: {
            type: DialogType,
            default: function _default() {
                return DialogType.INFO;
            }
        },
        buttons: {
            type: Array,
            default: function _default() {
                return [ButtonType.OK];
            }
        },
        html: {
            type: String,
            required: true
        }
    },
    computed: {
        value: function value() {
            return this.$el.returnValue;
        },
        isOpened: function isOpened() {
            return this.$el.open;
        }
    },
    methods: {
        onCloseButtonClick: function onCloseButtonClick(e) {
            e.preventDefault();
            this.$el.close();
        },
        onCancel: function onCancel(e) {
            this.$emit('done', true);
        },
        onClose: function onClose(e) {
            this.$emit('done', false);
        },
        invoke: function invoke(title, message, buttons, method) {
            var self = this;
            if (title) {
                this.title = title;
            }
            if (message) {
                this.html = message;
            }
            return new Promise(function (resolve, reject) {
                self.$once('done', function (canceled) {
                    if (canceled) {
                        reject();
                    } else {
                        resolve(self.value);
                    }
                });
                self.$el[method]();
            });
        },
        show: function show(title, message, buttons) {
            return this.invoke(title, message, buttons, 'show');
        },
        showModal: function showModal(title, message, buttons) {
            return this.invoke(title, message, buttons, 'showModal');
        },
        confirm: function confirm(title, message) {
            return this.showModal(title, message, [ButtonType.OK, ButtonType.CANCEL]);
        }
    }
});

/***/ }),

/***/ 124:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hellojs__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hellojs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_hellojs__);
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        dialog: __webpack_require__(29)
    },
    data: function data() {
        return {
            user: null
        };
    },

    props: {
        redirect_url: {
            type: String,
            required: true
        },
        value: {
            type: String,
            default: function _default() {
                return '';
            }
        }
    },
    computed: {
        auth_provider: function auth_provider() {
            return __WEBPACK_IMPORTED_MODULE_0_hellojs___default()('github');
        }
    },
    methods: {
        login: function login() {
            return this.auth_provider.login('github', {
                display: 'popup',
                scope: ['user', 'read:org'],
                redirect_uri: this.redirect_url
            }, function (ret) {
                //alert('login');
            });
        },
        readUser: function readUser() {
            return this.auth_provider.api('user');
        },
        onButtonClick: function onButtonClick() {
            this.login().then(function (ret) {
                this.$emit('reading_started');
            }, function (e) {
                this.$emit('error', e.error.message);
            });
        },
        onError: function onError(error) {
            this.value = '';
            this.$refs.dialog.type = DialogType.ERROR;
            this.$refs.dialog.showModal('GitHub error', error.replace('+', ' '));
        },
        onReadingStarted: function onReadingStarted() {
            var self = this;
            this.readUser().then(function (response) {
                self.value = response.url;
                self.user = response;
                self.$emit('reading_finished');
            }, function (e) {
                this.$emit('error', e.error.message);
            });
        }
    },
    mounted: function mounted() {
        this.$on('reading_started', this.onReadingStarted);
        this.$on('error', this.onError);
    }
});

/***/ }),

/***/ 125:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        item: __webpack_require__(46)
    },
    props: {
        items: {
            type: Array,
            default: function _default() {
                return [];
            }
        }
    }
});

/***/ }),

/***/ 126:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        image: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    }
});

/***/ }),

/***/ 127:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    components: {
        twitter: __webpack_require__(51),
        facebook: __webpack_require__(48),
        email: __webpack_require__(47),
        linkedin: __webpack_require__(50),
        google: __webpack_require__(49)
    },
    props: {
        message: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            default: function _default() {
                return 'I found interesting example for job test in JobTestVault';
            }
        }
    }
});

/***/ }),

/***/ 128:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        message: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        }
    },
    computed: {
        href: function href() {
            return "mailto:?&subject=" + encodeURIComponent(this.subject) + "&body=" + encodeURIComponent(this.message) + "%20" + encodeURIComponent(this.url);
        }
    }
});

/***/ }),

/***/ 129:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        url: {
            type: String,
            required: true
        }
    },
    computed: {
        href: function href() {
            return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.url);
        }
    }
});

/***/ }),

/***/ 130:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        url: {
            type: String,
            required: true
        }
    },
    computed: {
        href: function href() {
            return 'https://plus.google.com/share?url=' + encodeURIComponent(this.url);
        }
    }
});

/***/ }),

/***/ 131:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        message: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        }
    },
    computed: {
        source: function source() {
            return location.toString();
        },
        href: function href() {
            return "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(this.url) + "&title=" + encodeURIComponent(this.subject) + "&summary=" + encodeURIComponent(this.message) + "&source=" + encodeURIComponent(this.source);
        }
    }
});

/***/ }),

/***/ 132:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {
        message: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    computed: {
        href: function href() {
            return 'https://twitter.com/home?status=' + encodeURIComponent(this.message) + '%20' + encodeURIComponent(this.url);
        }
    }
});

/***/ }),

/***/ 226:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "icon fa-envelope",
    attrs: {
      "title": "Share by email",
      "href": _vm.href
    }
  }, [_c('span', {
    staticClass: "label"
  }, [_vm._v("E-mail")])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-13d6f418", module.exports)
  }
}

/***/ }),

/***/ 227:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field multiple"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.value),
      expression: "value"
    }],
    attrs: {
      "type": "text",
      "name": "github_url",
      "id": "github_url",
      "readonly": "",
      "placeholder": "Get your profile url"
    },
    domProps: {
      "value": (_vm.value)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.value = $event.target.value
      }
    }
  }), _vm._v(" "), _c('button', {
    staticClass: "icon fa-github-alt",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.onButtonClick
    }
  }, [_vm._v("Login")]), _vm._v(" "), _c('dialog', {
    ref: "dialog"
  })])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-2a6c34f2", module.exports)
  }
}

/***/ }),

/***/ 228:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "icon fa-google-plus",
    attrs: {
      "title": "Share on Google+",
      "href": _vm.href
    }
  }, [_c('span', {
    staticClass: "label"
  }, [_vm._v("Google+")])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-31dbfd8e", module.exports)
  }
}

/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', _vm._l((_vm.items), function(item) {
    return _c('item', {
      key: item.name,
      attrs: {
        "image": item.image,
        "name": item.name,
        "description": item.description
      }
    })
  }))
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-36bef0f9", module.exports)
  }
}

/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "icon fa-twitter",
    attrs: {
      "title": "Share on Twitter",
      "href": _vm.real_url
    }
  }, [_c('span', {
    staticClass: "label"
  }, [_vm._v("Twitter")])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-4898b322", module.exports)
  }
}

/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field multiple"
  }, [_c('input', {
    attrs: {
      "type": "text",
      "readonly": "",
      "id": _vm.input_id
    },
    domProps: {
      "value": _vm.value
    }
  }), _vm._v(" "), _c('button', {
    ref: "button",
    staticClass: "icon fa-copy",
    attrs: {
      "data-clipboard-target": _vm.input_target
    }
  }, [_vm._v("\n        Copy\n    ")]), _vm._v(" "), _c('dialog', {
    ref: "dialog"
  })])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-4af20504", module.exports)
  }
}

/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('article', {
    staticClass: "thumb"
  }, [_c('a', {
    staticClass: "image",
    attrs: {
      "href": "images/fulls/01.jpg"
    }
  }, [_c('img', {
    attrs: {
      "src": _vm.image,
      "alt": _vm.name
    }
  })]), _vm._v(" "), _c('h2', [_vm._v(_vm._s(_vm.name))]), _vm._v(" "), _c('p', [_vm._v(_vm._s(_vm.description))])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-4f7b6b27", module.exports)
  }
}

/***/ }),

/***/ 233:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('dialog', {
    on: {
      "close": _vm.onClose,
      "cancel": _vm.onCancel
    }
  }, [_c('h2', [_c('a', {
    staticClass: "closer",
    attrs: {
      "href": "#",
      "tabIndex": "-1",
      "aria-hidden": "true"
    },
    on: {
      "click": _vm.onCloseButtonClick
    }
  }), _vm._v(" "), (this.type == _vm.DialogType.INFO) ? _c('i', {
    staticClass: "fa fa-info-circle",
    attrs: {
      "aria-hidden": "true"
    }
  }) : _vm._e(), _vm._v(" "), (this.type == _vm.DialogType.ERROR) ? _c('i', {
    staticClass: "fa fa-exclamation-circle",
    attrs: {
      "aria-hidden": "true"
    }
  }) : _vm._e(), _vm._v("\n        " + _vm._s(_vm.title) + "\n    ")]), _vm._v(" "), _c('div', {
    staticClass: "content"
  }, [_c('form', {
    attrs: {
      "method": "dialog"
    }
  }, [_c('div', {
    staticClass: "content"
  }, [_vm._v("\n                " + _vm._s(_vm.html) + "\n            ")]), _vm._v(" "), _c('div', {
    staticClass: "buttons"
  }, _vm._l((_vm.buttons), function(button) {
    return _c('span', [(button == _vm.ButtonType.OK) ? _c('button', {
      attrs: {
        "name": _vm.field_action,
        "value": "ok",
        "type": "submit"
      }
    }, [_vm._v("OK")]) : _vm._e(), _vm._v(" "), (button == _vm.ButtonType.CANCEL) ? _c('button', {
      attrs: {
        "name": _vm.field_action,
        "value": "cancel",
        "type": "submit"
      }
    }, [_vm._v("Cancel")]) : _vm._e()])
  }))])])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-6b02b9f2", module.exports)
  }
}

/***/ }),

/***/ 234:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "icon fa-linkedin",
    attrs: {
      "title": "Share on Linkedin",
      "href": _vm.href
    }
  }, [_c('span', {
    staticClass: "label"
  }, [_vm._v("LinkedIn")])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-70ab3632", module.exports)
  }
}

/***/ }),

/***/ 235:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('a', {
    staticClass: "icon fa-facebook",
    attrs: {
      "title": "Share on Facebook",
      "href": _vm.href
    }
  }, [_c('span', {
    staticClass: "label"
  }, [_vm._v("Facebook")])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-8a25c80c", module.exports)
  }
}

/***/ }),

/***/ 236:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('ul', {
    staticClass: "icons share"
  }, [_c('li', [_c('twiter', {
    attrs: {
      "message": _vm.message,
      "url": _vm.url
    }
  })], 1), _vm._v(" "), _c('li', [_c('facebook', {
    attrs: {
      "url": _vm.url
    }
  })], 1), _vm._v(" "), _c('li', [_c('email', {
    attrs: {
      "message": _vm.message,
      "url": _vm.url,
      "subject": _vm.subject
    }
  })], 1), _vm._v(" "), _c('li', [_c('linkedin', {
    attrs: {
      "message": _vm.message,
      "url": _vm.url,
      "subject": _vm.subject
    }
  })], 1), _vm._v(" "), _c('li', [_c('google', {
    attrs: {
      "url": _vm.url
    }
  })], 1)])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-f52b68f4", module.exports)
  }
}

/***/ }),

/***/ 242:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(92);
__webpack_require__(93);
__webpack_require__(94);
__webpack_require__(95);
__webpack_require__(96);
__webpack_require__(97);
__webpack_require__(98);
__webpack_require__(99);
__webpack_require__(109);
__webpack_require__(29);
__webpack_require__(110);
__webpack_require__(111);
__webpack_require__(46);
__webpack_require__(112);
__webpack_require__(47);
__webpack_require__(48);
__webpack_require__(49);
__webpack_require__(50);
__webpack_require__(51);
__webpack_require__(102);
__webpack_require__(103);
module.exports = __webpack_require__(101);


/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(123),
  /* template */
  __webpack_require__(233),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/dialog/control.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] control.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6b02b9f2", Component.options)
  } else {
    hotAPI.reload("data-v-6b02b9f2", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 4:
/***/ (function(module, exports) {

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  scopeId,
  cssModules
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  // inject cssModules
  if (cssModules) {
    var computed = Object.create(options.computed || null)
    Object.keys(cssModules).forEach(function (key) {
      var module = cssModules[key]
      computed[key] = function () { return module }
    })
    options.computed = computed
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ 46:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(126),
  /* template */
  __webpack_require__(232),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/projects/item.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] item.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4f7b6b27", Component.options)
  } else {
    hotAPI.reload("data-v-4f7b6b27", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 47:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(128),
  /* template */
  __webpack_require__(226),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/providers/email.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] email.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-13d6f418", Component.options)
  } else {
    hotAPI.reload("data-v-13d6f418", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 48:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(129),
  /* template */
  __webpack_require__(235),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/providers/facebook.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] facebook.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-8a25c80c", Component.options)
  } else {
    hotAPI.reload("data-v-8a25c80c", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 49:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(130),
  /* template */
  __webpack_require__(228),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/providers/google+.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] google+.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-31dbfd8e", Component.options)
  } else {
    hotAPI.reload("data-v-31dbfd8e", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 50:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(131),
  /* template */
  __webpack_require__(234),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/providers/linkedin.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] linkedin.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-70ab3632", Component.options)
  } else {
    hotAPI.reload("data-v-70ab3632", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 51:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(132),
  /* template */
  __webpack_require__(230),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/mnt/c/Users/Raimondas/Documents/GitHub/jobtestvault.github.io/assets/components/controls/share_links/providers/twitter.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] twitter.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4898b322", Component.options)
  } else {
    hotAPI.reload("data-v-4898b322", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 92:
/***/ (function(module, exports) {

/**
 * Created by mekdr on 1/10/2017.
 */

Array.prototype.last = function () {
  return this[this.length - 1];
};

/***/ }),

/***/ 93:
/***/ (function(module, exports) {

/**
 * Created by mekdr on 12/27/2016.
 */

window.jobtestvault = {
    onLoadLinkedIn: function onLoadLinkedIn() {
        if (IN.User.isAuthorized()) {
            $('[data-role="get-profile-linkedin"] button').trigger('click');
        }
    },
    showDialog: function showDialog(title, html, modal, onEvent) {
        $('body .panel.active:first').append(dialog);
        $('button', dialog).first().focus();
    },
    showInfoDialog: function showInfoDialog(title, html, modal, onEvent) {
        window.jobtestvault.showDialog('<i class="fa fa-info-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons"><button data-role="close">OK</button></div>', modal, onEvent);
    },
    showErrorDialog: function showErrorDialog(title, html, modal, onEvent) {
        window.jobtestvault.showDialog('<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons"><button data-role="close">OK</button></div>', modal, onEvent);
    },
    confirm: function confirm(title, html, buttons, modal, onEvent) {
        if (!buttons) {
            buttons = ["OK", "Cancel"];
        }
        var buttons_rendered = buttons.map(function (button_data) {
            return '<button name="action" value="' + button_data.toLowerCase() + '" type="submit">' + button_data + '</button>';
        }).join('');
        window.jobtestvault.showDialog('<i class="fa fa-info-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons">' + buttons_rendered + '</div>', modal, onEvent);
    }
};

/***/ }),

/***/ 94:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {if (global) {
    var window = global;
}

if (!window.jobtestvault) {
    window.jobtestvault = {};
}

window.jobtestvault.config = {
    github: {
        token: '5af35c8e574c9791150f70dcba5166429768df77',
        user: 'MekDrop',
        client: {
            id: 'bad45375ab68d3570283',
            secret: '839d2e580a2f89622e3de4b143e8df6c9b75ef74'
        },
        oauth: {
            application_callback_url: 'https://jobtestvault.github.io'
        }
    },
    db: {
        host: 'ds145168.mlab.com',
        port: 45168,
        name: 'job_test_vault',
        username: 'ANpJXRNJ7jFs6jjh',
        password: '~#-wFC7?#FU$u(g7'
    }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),

/***/ 95:
/***/ (function(module, exports) {

$('input[data-role="autocomplete"]').on({
    change: function change() {
        $(this).trigger('keyup');
    },
    keyup: function keyup() {
        var self = $(this);
        var val = self.val();
        if (self.data('old_value') == val) {
            return;
        }
        self.data('old_value', val);
        if (val.length < 3) {
            return;
        }
        if (self.data('loading')) {
            self.data('postponed-loading', self.data('postponed-loading') + 1);
            return;
        }
        if (!self.attr('id')) {
            var i = 0,
                name,
                o_name = self.attr('name');
            while ($('[name="' + (name = o_name + "_" + ++i) + '"]').length > 0) {}
            self.attr('id', name);
        }
        var data_list_id = 'datalist_for_' + self.attr('id');
        if (!self.data('list')) {
            var datalist = $('<datalist></datalist>');
            datalist.attr('id', data_list_id);
            self.parent().append(datalist);
            self.data('list', data_list_id);
        } else {
            var datalist = $('#' + data_list_id);
        }

        var request = {
            url: self.data('src'),
            cache: self.data('cache') ? parseInt(self.data('cache')) ? true : false : false,
            data: {},
            crossDomain: self.data('cross-domain') ? self.data('cross-domain') : true,
            method: self.data('method') ? self.data('method') : 'GET',
            success: function success(data, textStatus, jqXHR) {
                $('option', datalist).remove();
                var key_to_read = self.data('key');
                var items = Array.isArray(data) ? data : data.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (!item || !item[key_to_read]) {
                        continue;
                    }
                    datalist.append("<option value='" + item[key_to_read] + "'>");
                }
                self.attr('list', data_list_id);
                self.data('loading', false);
                if (self.data('postponed-loading')) {
                    self.data('postponed-loading', null);
                    self.trigger('keyup');
                }
            }
        };

        var data = self.data();
        var c = 0;
        for (var k in data) {
            if (k.beginsWith('param')) {
                request.data[k.extractParamNameFromDataName('param')] = data[k];
                c++;
            }
            if (k.beginsWith('dynParam')) {
                var cmd = data[k].replace('this.', 'self.') + ';';
                request.data[k.extractParamNameFromDataName('dynParam')] = eval(cmd);
                c++;
            }
        }

        if (c == 0 && self.attr('list')) {
            return;
        }

        if (window.jobtestvault && window.jobtestvault.config && window.jobtestvault.config.github) {
            if (window.jobtestvault.config.github.token) {
                request.password = window.jobtestvault.config.github.token;
            }
            if (window.jobtestvault.config.github.user) {
                request.username = window.jobtestvault.config.github.user;
            }
        }

        self.removeAttr('list');

        $.ajax(request);
    }
});

$('form[data-role="search"]').on({
    'reset': function reset() {
        $('input[type!="button"][type!="submit"][type!="reset"]', this).val('');
        $('input', this).first().trigger('change');
    },
    'submit': function submit(e) {
        e.preventDefault();
        window.history.pushState({}, $(this).data('message'), $('#' + $(this).data('search-url-view')).val());
    }
});
$('form[data-role="search"] input').on({
    change: function change() {
        $(this).trigger('keyup');
    },
    keyup: function keyup() {
        var form = $($(this).get(0).form);
        var view = $('#' + form.data('search-url-view'));
        var input_items = $("input", form).filter(function () {
            return !!$(this).val() && !!$(this).attr('name');
        });
        view.val(window.location.href.split('?')[0] + '?' + input_items.serialize());
        var link = encodeURIComponent(view.val());
        if (input_items.length > 0) {
            var message = 'Search in JobTestVault for items where';
            input_items.each(function () {
                message += ' ' + $(this).attr('name') + ' = ' + $(this).val();
            });
        } else {
            var message = 'Search in JobTestVault for all items';
        }
        form.data('message', message);
        message = encodeURIComponent(message);
        $('#' + form.data('share-links-zone') + ' [data-href]').each(function () {
            $(this).attr('href', $(this).data('href').replace('{url}', link).replace('{message}', message));
        });
    }
});

$(function () {
    hello.init({
        github: window.jobtestvault.config.github.client.id
    }, {
        display: 'popup'
    });

    var params = window.location.search.substring(1).parseQuery();
    if (params.error_description) {
        window.jobtestvault.showErrorDialog('Error', params.error_description, true);
        delete params.error_description;
    }
    for (var x in params) {
        $('form[data-role="search"] [name="' + x + '"]').val(params[x]);
    }
    $('form[data-role="search"] input:first-child').change();

    $('[data-role="file-uploader"]').trigger('empty');
});

$('[data-role="get-profile-linkedin"] button').on({
    click: function click() {
        var btn = $(this);
        IN.User.authorize(function () {
            btn.trigger('read');
        });
    },
    read: function read() {
        var btn = $(this);
        IN.API.Raw("/people/~:(public-profile-url)?format=json").result(function (data) {
            btn.parent().find('input').first().val(data.publicProfileUrl);
        }).error(function (err) {
            btn.parent().find('input').first().val('');
        });
    }
});

$('[data-role="get-profile-github"]').on({
    update_repos_list_available: function update_repos_list_available() {
        var container = $(this);
        var target = $('#' + container.data('list-target'));
        target.find('option, optgroup').remove();
        hello('github').api('user/orgs').then(function (response) {
            hello('github').api('user/repos', 'get', { type: 'owner' }).then(function (response) {
                response.data = response.data.filter(function (repo) {
                    return repo.owner.login == window.jobtestvault.user.github.login;
                });
                if (response.data.length < 1) {
                    return;
                }
                var group = $('<optgroup></optgroup>');
                group.attr('label', window.jobtestvault.user.github.login);
                group.append(response.data.map(function (repo) {
                    var option = $('<option>' + repo.full_name + '</option>');
                    option.attr('value', repo.full_name);
                    option.attr('title', repo.description);
                    return option;
                }));
                target.append(group);
                if (!target.val()) {
                    target.val($("option:first", target).val());
                    target.trigger('change');
                }
            }, function (e) {
                console.error(e);
            });
            response.data.forEach(function (org) {
                if (org.login == 'JobTestVault') {
                    return;
                }
                hello('github').api('orgs/' + org.login + '/repos', 'get', { type: 'owner' }).then(function (response) {
                    if (response.data.length < 1) {
                        return;
                    }
                    var group = $('<optgroup></optgroup>');
                    group.attr('label', org.login.descConcat(org.description));
                    group.append(response.data.map(function (repo) {
                        var option = $('<option>' + repo.full_name + '</option>');
                        option.attr('value', repo.full_name);
                        option.attr('title', repo.description);
                        return option;
                    }));
                    target.append(group);
                }, function (e) {
                    console.error(e);
                });
            });
            target.closest('.field').removeClass('hidden');
        }, function (e) {
            console.error(e);
        });
    }
});

$('[data-role="file-uploader"] button').on({
    click: function click() {
        $(this).parent().trigger('dialog_show');
    }
});
$('[data-role="file-uploader"]').on('click', '[data-role="remove"]', function () {
    var item = $(this).closest('.item');
    window.jobtestvault.confirm('Remove file?', 'Do you want to remove this file from upload?', ['Yes', 'No'], true, {
        close: function close(ret) {
            if (ret == 'yes') {
                item.find('[data-role="remove"]').remove();
                item.animate({
                    width: '1px',
                    opacity: 0.25
                }, 750, function () {
                    var container = item.parent();
                    if (container.find('.item').length < 2) {
                        container.trigger('empty');
                    }
                    item.remove();
                });
            }
        }
    });
});
$('[data-role="file-uploader"]').on({
    dialog_show: function dialog_show() {
        var self = $(this);
        var multiple = parseInt(self.data('multiple')) ? true : false;
        var uploader = $('<input type="file">');
        var name = '__' + self.data('name') + '_file';
        var rname = self.data('name');
        if (multiple) {
            name += "[]";
            rname += '[]';
        }
        uploader.attr('name', name);
        uploader.data('name', rname);
        uploader.css('display', 'none');
        uploader.prop('accept', self.data('accept'));
        uploader.attr('multiple', multiple);
        uploader.on({
            change: function change() {
                self.trigger('uploader_change');
            }
        });
        self.append(uploader);
        self.data('uploader', uploader);
        self.data('uploader').click();
    },
    empty: function empty() {
        var container = $(this);
        var fieldset = container.find('fieldset');
        fieldset.html('<div class="empty">' + container.data('placeholder') + '</div>');
    },
    uploader_change: function uploader_change() {
        var container = $(this);
        var fieldset = container.find('fieldset');
        var uploader = container.data('uploader');
        var files = uploader.get(0).files;
        var l = files.length;
        if (l == 0 && container.find('.item').length == 0) {
            container.trigger('empty');
            return;
        }
        if (uploader.prop('multiple')) {
            fieldset.find('.empty').remove();
            var item_template = container.find('script[type="x-template-mustache"][data-name="item"]').first().html();
            var loading_template = container.find('script[type="x-template-mustache"][data-name="loading"]').first().html();
            Mustache.parse(item_template);
            Mustache.parse(loading_template);
            var rw, rh;
            var default_loading = $(Mustache.render(loading_template));
            var createLoader = function createLoader() {
                var loading = default_loading.clone();
                fieldset.append(loading);
                return loading;
            };
            var createCanvas = function createCanvas(width, height) {
                var canvas = $('<canvas />');
                canvas.attr('width', width);
                canvas.attr('height', height);
                //console.log(canvas.get(0));
                return canvas.get(0);
            };
            var doResize = function doResize(image, maxWidth, maxHeight, func) {
                var ratio = 0,
                    rw,
                    rh;

                if (image.width > maxWidth) {
                    ratio = maxWidth / image.width;
                    rw = maxWidth;
                    rh = image.height * ratio;
                }

                if (image.height > maxHeight) {
                    ratio = maxHeight / image.height;
                    rw = image.width * ratio;
                    rh = maxHeight;
                }

                var canvas = createCanvas(rw, rh);
                pica.WW = true;
                pica.WEBGL = true;
                pica.resizeCanvas(image, canvas, {
                    quality: 3,
                    alpha: false,
                    unsharpAmount: 75,
                    unsharpRadius: 1.0,
                    unsharpThreshold: 0
                }, function (err) {
                    func(canvas.toDataURL());
                });
            };
            var readFile = function readFile(file, image) {
                var reader = new FileReader();
                reader.onload = function () {
                    image.src = reader.result;
                };
                reader.readAsDataURL(file);
            };
            var createImage = function createImage(loading, file, w, h, func) {
                var image = new Image();
                image.onload = function () {
                    var full_image = $('<input type="hidden" />');
                    full_image.attr('name', uploader.data('name'));
                    var full_image_url = this.toDataURL();
                    full_image.val(full_image_url);
                    var hash = sha1(full_image_url);
                    if (container.find('.item[data-hash="' + hash + '"]').length > 0) {
                        loading.remove();
                        func();
                        return;
                    }
                    doResize(image, w, h, function (url) {
                        var item = $(Mustache.render(item_template, {
                            type: file.type,
                            preview_img: url,
                            file: file.name
                        }));
                        item.append(full_image);
                        item.attr('data-hash', hash);
                        loading.replaceWith(item);
                        func();
                    });
                };
                return image;
            };
            var queue = [];
            var running = false;
            var _processNext = function processNext() {
                if (queue.length > 0) {
                    running = true;
                    var func = queue.shift();
                    func();
                } else {
                    _processNext = false;
                }
            };
            var addItem = function addItem(file) {
                var loading = createLoader();
                var interval = setInterval(function () {
                    if (!loading.width() || !loading.height()) {
                        return;
                    }
                    clearInterval(interval);
                    queue.push(function () {
                        readFile(file, createImage(loading, file, loading.width(), loading.height(), _processNext));
                    });
                    if (!running) {
                        _processNext();
                    }
                }, 250);
            };
            for (var i = 0; i < l; i++) {
                addItem(files[i]);
            }
        } else {
            fieldset.html('<div class="inline">' + files[0].name + '</div>');
        }
    }
});

$('.share a[data-role="popup"]').on({
    click: function click(e) {
        e.preventDefault();
        window.open($(this).attr('href'), "share_popup", "menubar=0,resizable=1,width=350,height=250");
    }
});

$('form').on({
    reset: function reset() {
        $(this).find('[data-role="get-profile-github"]').each(function () {
            var target = $('#' + $(this).data('list-target'));
            target.find('option, optgroup').remove();
            target.closest('.field').addClass('hidden');
        });
    }
});

$('[data-role="auto-name"]').each(function () {
    var self = $(this);
    var src = $('#' + self.data('src'));
    src.on({
        change: function change() {
            if (self.val() != '' && !self.data('autogenerated')) {
                return;
            }
            var src_val = src.val();
            if (!src_val) {
                src_val = '';
            }
            self.val(src_val.split("/", 2).last().replace(/JobTest|Job Test/g, '').replace(/[_-]/g, ' ').split(' ').map(function (str) {
                return str.trim().ucfirst();
            }).join(' '));
            self.data('autogenerated', true);
        }
    });
    self.on({
        keypress: function keypress() {
            self.data('autogenerated', false);
        },
        click: function click() {
            self.data('autogenerated', false);
        }
    });
    src.trigger('change');
});

/***/ }),

/***/ 96:
/***/ (function(module, exports) {

/**
 * Created by mekdr on 1/11/2017.
 */

Image.prototype.toDataURL = function (format, quality) {
    if (!format) {
        format = 'image/png';
    }
    if (!quality) {
        quality = 0.71;
    }
    var canvas = $('<canvas></canvas>');
    canvas.attr('width', this.naturalWidth);
    canvas.attr('height', this.naturalHeight);
    canvas.get(0).getContext('2d').drawImage(this, 0, 0);

    return canvas.get(0).toDataURL(format, quality);
};

/***/ }),

/***/ 97:
/***/ (function(module, exports) {

/*
	Multiverse by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function () {

		var $window = $(window),
		    $body = $('body'),
		    $wrapper = $('#wrapper');

		// Hack: Enable IE workarounds.
		if (skel.vars.IEVersion < 12) $body.addClass('ie');

		// Touch?
		if (skel.vars.mobile) $body.addClass('touch');

		// Transitions supported?
		if (skel.canUse('transition')) {

			// Add (and later, on load, remove) "loading" class.
			$body.addClass('loading');

			$window.on('load', function () {
				window.setTimeout(function () {
					$body.removeClass('loading');
				}, 100);
			});

			// Prevent transitions/animations on resize.
			var resizeTimeout;

			$window.on('resize', function () {

				window.clearTimeout(resizeTimeout);

				$body.addClass('resizing');

				resizeTimeout = window.setTimeout(function () {
					$body.removeClass('resizing');
				}, 100);
			});
		}

		// Scroll back to top.
		$window.scrollTop(0);

		// Fix: Placeholder polyfill.
		$('form').placeholder();

		// Panels.
		var $panels = $('.panel');

		$panels.each(function () {

			var $this = $(this),
			    $toggles = $('[href="#' + $this.attr('id') + '"]'),
			    $closer = $('<div class="closer" />').appendTo($this);

			// Closer.
			$closer.on('click', function (event) {
				$this.trigger('---hide');
			});

			// Events.
			$this.on('click', function (event) {
				event.stopPropagation();
			}).on('---toggle', function () {

				if ($this.hasClass('active')) $this.triggerHandler('---hide');else $this.triggerHandler('---show');
			}).on('---show', function () {

				// Hide other content.
				if ($body.hasClass('content-active')) $panels.trigger('---hide');

				// Activate content, toggles.
				$this.addClass('active');
				$toggles.addClass('active');

				// Activate body.
				$body.addClass('content-active');
			}).on('---hide', function () {

				// Deactivate content, toggles.
				$this.removeClass('active');
				$toggles.removeClass('active');

				// Deactivate body.
				$body.removeClass('content-active');
			});

			// Toggles.
			$toggles.removeAttr('href').css('cursor', 'pointer').on('click', function (event) {

				event.preventDefault();
				event.stopPropagation();

				$this.trigger('---toggle');
			});
		});

		// Global events.
		$body.on('click', function (event) {

			if ($body.hasClass('content-active')) {

				event.preventDefault();
				event.stopPropagation();

				$panels.trigger('---hide');
			}
		});

		$window.on('keyup', function (event) {

			if (event.keyCode == 27 && $body.hasClass('content-active')) {

				event.preventDefault();
				event.stopPropagation();

				$panels.trigger('---hide');
			}
		});

		// Header.
		var $header = $('#header');

		// Links.
		$header.find('a').each(function () {

			var $this = $(this),
			    href = $this.attr('href');

			// Internal link? Skip.
			if (!href || href.charAt(0) == '#') return;

			// Redirect on click.
			$this.removeAttr('href').css('cursor', 'pointer').on('click', function (event) {

				event.preventDefault();
				event.stopPropagation();

				window.location.href = href;
			});
		});

		// Footer.
		var $footer = $('#footer');

		// Copyright.
		// This basically just moves the copyright line to the end of the *last* sibling of its current parent
		// when the "medium" breakpoint activates, and moves it back when it deactivates.
		$footer.find('.copyright').each(function () {

			var $this = $(this),
			    $parent = $this.parent(),
			    $lastParent = $parent.parent().children().last();

			skel.on('+medium', function () {
				$this.appendTo($lastParent);
			}).on('-medium', function () {
				$this.appendTo($parent);
			});
		});

		// Main.
		var $main = $('#main');

		// Thumbs.
		$main.children('.thumb').each(function () {

			var $this = $(this),
			    $image = $this.find('.image'),
			    $image_img = $image.children('img'),
			    x;

			// No image? Bail.
			if ($image.length == 0) return;

			// Image.
			// This sets the background of the "image" <span> to the image pointed to by its child
			// <img> (which is then hidden). Gives us way more flexibility.

			// Set background.
			$image.css('background-image', 'url(' + $image_img.attr('src') + ')');

			// Set background position.
			if (x = $image_img.data('position')) $image.css('background-position', x);

			// Hide original img.
			$image_img.hide();

			// Hack: IE<11 doesn't support pointer-events, which means clicks to our image never
			// land as they're blocked by the thumbnail's caption overlay gradient. This just forces
			// the click through to the image.
			if (skel.vars.IEVersion < 11) $this.css('cursor', 'pointer').on('click', function () {
				$image.trigger('click');
			});
		});

		// Poptrox.
		$main.poptrox({
			baseZIndex: 20000,
			caption: function caption($a) {

				var s = '';

				$a.nextAll().each(function () {
					s += this.outerHTML;
				});

				return s;
			},
			fadeSpeed: 300,
			onPopupClose: function onPopupClose() {
				$body.removeClass('modal-active');
			},
			onPopupOpen: function onPopupOpen() {
				$body.addClass('modal-active');
			},
			overlayOpacity: 0,
			popupCloserText: '',
			popupHeight: 150,
			popupLoaderText: '',
			popupSpeed: 300,
			popupWidth: 150,
			selector: '.thumb > a.image',
			usePopupCaption: true,
			usePopupCloser: true,
			usePopupDefaultStyling: false,
			usePopupForceClose: true,
			usePopupLoader: true,
			usePopupNav: true,
			windowMargin: 50
		});

		// Hack: Set margins to 0 when 'xsmall' activates.
		skel.on('-xsmall', function () {
			$main[0]._poptrox.windowMargin = 50;
		}).on('+xsmall', function () {
			$main[0]._poptrox.windowMargin = 0;
		});
	});
})(jQuery);

/***/ }),

/***/ 98:
/***/ (function(module, exports) {

/**
 * Created by mekdr on 12/27/2016.
 */

String.prototype.lcfirst = function () {
    if (this.length < 1) {
        return this;
    }
    var val = this.substr(0, 1).toLowerCase();
    if (this.length < 2) {
        return val;
    }
    return val + this.substr(1);
};

String.prototype.ucfirst = function () {
    if (this.length < 1) {
        return this;
    }
    var val = this.substr(0, 1).toUpperCase();
    if (this.length < 2) {
        return val;
    }
    return val + this.substr(1);
};

String.prototype.extractParamNameFromDataName = function (prefix) {
    return this.substr(prefix.length).lcfirst();
};

String.prototype.beginsWith = function (text) {
    return this.substr(0, text.length) == text;
};

String.prototype.endsWith = function (text) {
    return this.substr(-text.length) == text;
};

String.prototype.parseQuery = function () {
    var ret = {};
    var groups = this.split('&');
    for (var i = 0; i < groups.length; i++) {
        var item = groups[i].split('=', 2);
        ret[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
    }
    return ret;
};

String.prototype.descConcat = function (description) {
    if (!description) {
        return this;
    }
    return this + ' - ' + description;
};

/***/ }),

/***/ 99:
/***/ (function(module, exports) {

(function ($) {

	/**
  * Generate an indented list of links from a nav. Meant for use with panel().
  * @return {jQuery} jQuery object.
  */
	$.fn.navList = function () {

		var $this = $(this);
		$a = $this.find('a'), b = [];

		$a.each(function () {

			var $this = $(this),
			    indent = Math.max(0, $this.parents('li').length - 1),
			    href = $this.attr('href'),
			    target = $this.attr('target');

			b.push('<a ' + 'class="link depth-' + indent + '"' + (typeof target !== 'undefined' && target != '' ? ' target="' + target + '"' : '') + (typeof href !== 'undefined' && href != '' ? ' href="' + href + '"' : '') + '>' + '<span class="indent-' + indent + '"></span>' + $this.text() + '</a>');
		});

		return b.join('');
	};

	/**
  * Panel-ify an element.
  * @param {object} userConfig User config.
  * @return {jQuery} jQuery object.
  */
	$.fn.panel = function (userConfig) {

		// No elements?
		if (this.length == 0) return $this;

		// Multiple elements?
		if (this.length > 1) {

			for (var i = 0; i < this.length; i++) {
				$(this[i]).panel(userConfig);
			}return $this;
		}

		// Vars.
		var $this = $(this),
		    $body = $('body'),
		    $window = $(window),
		    id = $this.attr('id'),
		    config;

		// Config.
		config = $.extend({

			// Delay.
			delay: 0,

			// Hide panel on link click.
			hideOnClick: false,

			// Hide panel on escape keypress.
			hideOnEscape: false,

			// Hide panel on swipe.
			hideOnSwipe: false,

			// Reset scroll position on hide.
			resetScroll: false,

			// Reset forms on hide.
			resetForms: false,

			// Side of viewport the panel will appear.
			side: null,

			// Target element for "class".
			target: $this,

			// Class to toggle.
			visibleClass: 'visible'

		}, userConfig);

		// Expand "target" if it's not a jQuery object already.
		if (typeof config.target != 'jQuery') config.target = $(config.target);

		// Panel.

		// Methods.
		$this._hide = function (event) {

			// Already hidden? Bail.
			if (!config.target.hasClass(config.visibleClass)) return;

			// If an event was provided, cancel it.
			if (event) {

				event.preventDefault();
				event.stopPropagation();
			}

			// Hide.
			config.target.removeClass(config.visibleClass);

			// Post-hide stuff.
			window.setTimeout(function () {

				// Reset scroll position.
				if (config.resetScroll) $this.scrollTop(0);

				// Reset forms.
				if (config.resetForms) $this.find('form').each(function () {
					this.reset();
				});
			}, config.delay);
		};

		// Vendor fixes.
		$this.css('-ms-overflow-style', '-ms-autohiding-scrollbar').css('-webkit-overflow-scrolling', 'touch');

		// Hide on click.
		if (config.hideOnClick) {

			$this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

			$this.on('click', 'a', function (event) {

				var $a = $(this),
				    href = $a.attr('href'),
				    target = $a.attr('target');

				if (!href || href == '#' || href == '' || href == '#' + id) return;

				// Cancel original event.
				event.preventDefault();
				event.stopPropagation();

				// Hide panel.
				$this._hide();

				// Redirect to href.
				window.setTimeout(function () {

					if (target == '_blank') window.open(href);else window.location.href = href;
				}, config.delay + 10);
			});
		}

		// Event: Touch stuff.
		$this.on('touchstart', function (event) {

			$this.touchPosX = event.originalEvent.touches[0].pageX;
			$this.touchPosY = event.originalEvent.touches[0].pageY;
		});

		$this.on('touchmove', function (event) {

			if ($this.touchPosX === null || $this.touchPosY === null) return;

			var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
			    diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
			    th = $this.outerHeight(),
			    ts = $this.get(0).scrollHeight - $this.scrollTop();

			// Hide on swipe?
			if (config.hideOnSwipe) {

				var result = false,
				    boundary = 20,
				    delta = 50;

				switch (config.side) {

					case 'left':
						result = diffY < boundary && diffY > -1 * boundary && diffX > delta;
						break;

					case 'right':
						result = diffY < boundary && diffY > -1 * boundary && diffX < -1 * delta;
						break;

					case 'top':
						result = diffX < boundary && diffX > -1 * boundary && diffY > delta;
						break;

					case 'bottom':
						result = diffX < boundary && diffX > -1 * boundary && diffY < -1 * delta;
						break;

					default:
						break;

				}

				if (result) {

					$this.touchPosX = null;
					$this.touchPosY = null;
					$this._hide();

					return false;
				}
			}

			// Prevent vertical scrolling past the top or bottom.
			if ($this.scrollTop() < 0 && diffY < 0 || ts > th - 2 && ts < th + 2 && diffY > 0) {

				event.preventDefault();
				event.stopPropagation();
			}
		});

		// Event: Prevent certain events inside the panel from bubbling.
		$this.on('click touchend touchstart touchmove', function (event) {
			event.stopPropagation();
		});

		// Event: Hide panel if a child anchor tag pointing to its ID is clicked.
		$this.on('click', 'a[href="#' + id + '"]', function (event) {

			event.preventDefault();
			event.stopPropagation();

			config.target.removeClass(config.visibleClass);
		});

		// Body.

		// Event: Hide panel on body click/tap.
		$body.on('click touchend', function (event) {
			$this._hide(event);
		});

		// Event: Toggle.
		$body.on('click', 'a[href="#' + id + '"]', function (event) {

			event.preventDefault();
			event.stopPropagation();

			config.target.toggleClass(config.visibleClass);
		});

		// Window.

		// Event: Hide on ESC.
		if (config.hideOnEscape) $window.on('keydown', function (event) {

			if (event.keyCode == 27) $this._hide(event);
		});

		return $this;
	};

	/**
  * Apply "placeholder" attribute polyfill to one or more forms.
  * @return {jQuery} jQuery object.
  */
	$.fn.placeholder = function () {

		// Browser natively supports placeholders? Bail.
		if (typeof document.createElement('input').placeholder != 'undefined') return $(this);

		// No elements?
		if (this.length == 0) return $this;

		// Multiple elements?
		if (this.length > 1) {

			for (var i = 0; i < this.length; i++) {
				$(this[i]).placeholder();
			}return $this;
		}

		// Vars.
		var $this = $(this);

		// Text, TextArea.
		$this.find('input[type=text],textarea').each(function () {

			var i = $(this);

			if (i.val() == '' || i.val() == i.attr('placeholder')) i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
		}).on('blur', function () {

			var i = $(this);

			if (i.attr('name').match(/-polyfill-field$/)) return;

			if (i.val() == '') i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
		}).on('focus', function () {

			var i = $(this);

			if (i.attr('name').match(/-polyfill-field$/)) return;

			if (i.val() == i.attr('placeholder')) i.removeClass('polyfill-placeholder').val('');
		});

		// Password.
		$this.find('input[type=password]').each(function () {

			var i = $(this);
			var x = $($('<div>').append(i.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text'));

			if (i.attr('id') != '') x.attr('id', i.attr('id') + '-polyfill-field');

			if (i.attr('name') != '') x.attr('name', i.attr('name') + '-polyfill-field');

			x.addClass('polyfill-placeholder').val(x.attr('placeholder')).insertAfter(i);

			if (i.val() == '') i.hide();else x.hide();

			i.on('blur', function (event) {

				event.preventDefault();

				var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

				if (i.val() == '') {

					i.hide();
					x.show();
				}
			});

			x.on('focus', function (event) {

				event.preventDefault();

				var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');

				x.hide();

				i.show().focus();
			}).on('keypress', function (event) {

				event.preventDefault();
				x.val('');
			});
		});

		// Events.
		$this.on('submit', function () {

			$this.find('input[type=text],input[type=password],textarea').each(function (event) {

				var i = $(this);

				if (i.attr('name').match(/-polyfill-field$/)) i.attr('name', '');

				if (i.val() == i.attr('placeholder')) {

					i.removeClass('polyfill-placeholder');
					i.val('');
				}
			});
		}).on('reset', function (event) {

			event.preventDefault();

			$this.find('select').val($('option:first').val());

			$this.find('input,textarea').each(function () {

				var i = $(this),
				    x;

				i.removeClass('polyfill-placeholder');

				switch (this.type) {

					case 'submit':
					case 'reset':
						break;

					case 'password':
						i.val(i.attr('defaultValue'));

						x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

						if (i.val() == '') {
							i.hide();
							x.show();
						} else {
							i.show();
							x.hide();
						}

						break;

					case 'checkbox':
					case 'radio':
						i.attr('checked', i.attr('defaultValue'));
						break;

					case 'text':
					case 'textarea':
						i.val(i.attr('defaultValue'));

						if (i.val() == '') {
							i.addClass('polyfill-placeholder');
							i.val(i.attr('placeholder'));
						}

						break;

					default:
						i.val(i.attr('defaultValue'));
						break;

				}
			});
		});

		return $this;
	};

	/**
  * Moves elements to/from the first positions of their respective parents.
  * @param {jQuery} $elements Elements (or selector) to move.
  * @param {bool} condition If true, moves elements to the top. Otherwise, moves elements back to their original locations.
  */
	$.prioritize = function ($elements, condition) {

		var key = '__prioritize';

		// Expand $elements if it's not already a jQuery object.
		if (typeof $elements != 'jQuery') $elements = $($elements);

		// Step through elements.
		$elements.each(function () {

			var $e = $(this),
			    $p,
			    $parent = $e.parent();

			// No parent? Bail.
			if ($parent.length == 0) return;

			// Not moved? Move it.
			if (!$e.data(key)) {

				// Condition is false? Bail.
				if (!condition) return;

				// Get placeholder (which will serve as our point of reference for when this element needs to move back).
				$p = $e.prev();

				// Couldn't find anything? Means this element's already at the top, so bail.
				if ($p.length == 0) return;

				// Move element to top of parent.
				$e.prependTo($parent);

				// Mark element as moved.
				$e.data(key, $p);
			}

			// Moved already?
			else {

					// Condition is true? Bail.
					if (condition) return;

					$p = $e.data(key);

					// Move element back to its original location (using our placeholder).
					$e.insertAfter($p);

					// Unmark element as moved.
					$e.removeData(key);
				}
		});
	};
})(jQuery);

/***/ })

},[242]);