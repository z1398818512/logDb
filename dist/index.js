(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 118:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "z": () => (/* binding */ getFilterDateLogger)
/* harmony export */ });
// 筛选范围日期内的数据

const getFilterDateLogger = (db,start = 0, end = Date.now())=>{
    return  db.where('timeStamp').between(start, end, true, true);
}


/***/ }),

/***/ 775:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ serve)
/* harmony export */ });
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(118);
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(809);
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(socket_io_client__WEBPACK_IMPORTED_MODULE_0__);


let serveInstrance = null

class serve {
  constructor(props = {}) {
    // 单例模式
    if(serveInstrance){
      return serveInstrance
    }

    const {db,room} = props;
    this.db = db;
    this.room = room
    // this.getFilterDateLogger = getFilterDateLogger.bind(this,db)
    // this.queryData()
    this.initIo()
    serveInstrance = this;
  }
  initIo(){
    const socket = socket_io_client__WEBPACK_IMPORTED_MODULE_0___default()('http://127.0.0.1:7001/user',{
      query: {roomId:this.room}
    });
    this.socket = socket;
    socket.on('connect', () => {
      socket.on('pageUrl',({data})=>{
        console.info('已启动在线日志预览页：'+data)
       })
      socket.on('query',({data})=>{
       this.queryData(data)
      })
      socket.on('openRealLog',({data})=>{
        this.isOpenRealLog = data || true
      })
      socket.on('handleScirpt',({data})=>{
        try{
          this.db.log('控制台脚本：',eval(data))
        }catch(err){
          this.db.log('err', '函数处理报错，原因：'+err)
        }
       
        
      })
    });
  }

  async sendOnceLog(log){
    if(this.isOpenRealLog){
      this.socket.emit('sendonCeLog',log);
    }
  }

  closeWs(){}
  async queryData(data={}){
    const {start,end,pageIndex=1,pageSize=100,logType} = data
    const startIndex = (pageIndex-1)*pageSize;
    var FilterDateLogger = (0,_model__WEBPACK_IMPORTED_MODULE_1__/* .getFilterDateLogger */ .z)(this.db.logger,start,end).reverse()
    
    // 筛选类型
    if(logType){
      FilterDateLogger = FilterDateLogger.and(firend=>{
        if(firend.logType.toLowerCase().includes(logType.toLowerCase())){
          return true
        }
      })
    }
    // 获取数量
    const count = await FilterDateLogger.count()
    // 分页处理
    const arr = await FilterDateLogger.offset(startIndex).limit(pageSize).toArray()
  
    // 发送数据
    if(arr){
      this.socket.emit('send',{data:{
        dataList: arr,
        total: count,
        pageIndex,
        pageSize
      },})
    }
  }
}

/***/ }),

/***/ 906:
/***/ ((module) => {

module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}


/***/ }),

/***/ 718:
/***/ ((module) => {

/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};


/***/ }),

/***/ 10:
/***/ ((module) => {


/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};



/***/ }),

/***/ 704:
/***/ ((__unused_webpack_module, exports) => {

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");


/***/ }),

/***/ 548:
/***/ ((module) => {

/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder :
  typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder :
  typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder :
  typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : 
  false;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  return ary.map(function(chunk) {
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      return buf;
    }

    return chunk;
  });
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary).forEach(function(part) {
    bb.append(part);
  });

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  return new Blob(mapArrayBufferViews(ary), options || {});
};

if (typeof Blob !== 'undefined') {
  BlobBuilderConstructor.prototype = Blob.prototype;
  BlobConstructor.prototype = Blob.prototype;
}

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();


/***/ }),

/***/ 77:
/***/ ((module) => {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};


/***/ }),

/***/ 767:
/***/ ((module) => {


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ }),

/***/ 861:
/***/ ((module) => {


module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};

/***/ }),

/***/ 227:
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(658);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ 658:
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(824);

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ 549:
/***/ ((module) => {

module.exports = (function () {
  if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')(); // eslint-disable-line no-new-func
  }
})();


/***/ }),

/***/ 983:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = __webpack_require__(192);

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = __webpack_require__(455);


/***/ }),

/***/ 192:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var transports = __webpack_require__(352);
var Emitter = __webpack_require__(767);
var debug = __webpack_require__(227)('engine.io-client:socket');
var index = __webpack_require__(355);
var parser = __webpack_require__(455);
var parseuri = __webpack_require__(187);
var parseqs = __webpack_require__(830);

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (typeof location !== 'undefined' && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (typeof location !== 'undefined' ? location.hostname : 'localhost');
  this.port = opts.port || (typeof location !== 'undefined' && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.withCredentials = false !== opts.withCredentials;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.transportOptions = opts.transportOptions || {};
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || undefined;
  this.key = opts.key || undefined;
  this.passphrase = opts.passphrase || undefined;
  this.cert = opts.cert || undefined;
  this.ca = opts.ca || undefined;
  this.ciphers = opts.ciphers || undefined;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // detect ReactNative environment
  this.isReactNative = (typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative');

  // other options for Node.js or ReactNative client
  if (typeof self === 'undefined' || this.isReactNative) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = __webpack_require__(496);
Socket.transports = __webpack_require__(352);
Socket.parser = __webpack_require__(455);

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // per-transport options
  var options = this.transportOptions[name] || {};

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    query: query,
    socket: this,
    agent: options.agent || this.agent,
    hostname: options.hostname || this.hostname,
    port: options.port || this.port,
    secure: options.secure || this.secure,
    path: options.path || this.path,
    forceJSONP: options.forceJSONP || this.forceJSONP,
    jsonp: options.jsonp || this.jsonp,
    forceBase64: options.forceBase64 || this.forceBase64,
    enablesXDR: options.enablesXDR || this.enablesXDR,
    withCredentials: options.withCredentials || this.withCredentials,
    timestampRequests: options.timestampRequests || this.timestampRequests,
    timestampParam: options.timestampParam || this.timestampParam,
    policyPort: options.policyPort || this.policyPort,
    pfx: options.pfx || this.pfx,
    key: options.key || this.key,
    passphrase: options.passphrase || this.passphrase,
    cert: options.cert || this.cert,
    ca: options.ca || this.ca,
    ciphers: options.ciphers || this.ciphers,
    rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
    perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
    extraHeaders: options.extraHeaders || this.extraHeaders,
    forceNode: options.forceNode || this.forceNode,
    localAddress: options.localAddress || this.localAddress,
    requestTimeout: options.requestTimeout || this.requestTimeout,
    protocols: options.protocols || void (0),
    isReactNative: this.isReactNative
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(JSON.parse(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};


/***/ }),

/***/ 496:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var parser = __webpack_require__(455);
var Emitter = __webpack_require__(767);

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;
  this.withCredentials = opts.withCredentials;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // results of ReactNative environment detection
  this.isReactNative = opts.isReactNative;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};


/***/ }),

/***/ 352:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * Module dependencies
 */

var XMLHttpRequest = __webpack_require__(777);
var XHR = __webpack_require__(416);
var JSONP = __webpack_require__(785);
var websocket = __webpack_require__(442);

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (typeof location !== 'undefined') {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}


/***/ }),

/***/ 785:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module requirements.
 */

var Polling = __webpack_require__(15);
var inherit = __webpack_require__(861);
var globalThis = __webpack_require__(549);

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    callbacks = globalThis.___eio = (globalThis.___eio || []);
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (typeof addEventListener === 'function') {
    addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};


/***/ }),

/***/ 416:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* global attachEvent */

/**
 * Module requirements.
 */

var XMLHttpRequest = __webpack_require__(777);
var Polling = __webpack_require__(15);
var Emitter = __webpack_require__(767);
var inherit = __webpack_require__(861);
var debug = __webpack_require__(227)('engine.io-client:polling-xhr');
var globalThis = __webpack_require__(549);

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;
  this.extraHeaders = opts.extraHeaders;

  if (typeof location !== 'undefined') {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = (typeof location !== 'undefined' && opts.hostname !== location.hostname) ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;
  opts.withCredentials = this.withCredentials;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.withCredentials = opts.withCredentials;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = this.withCredentials;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 2) {
          try {
            var contentType = xhr.getResponseHeader('Content-Type');
            if (self.supportsBinary && contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
              xhr.responseType = 'arraybuffer';
            }
          } catch (e) {}
        }
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(typeof xhr.status === 'number' ? xhr.status : 0);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (typeof document !== 'undefined') {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (typeof document !== 'undefined') {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type');
    } catch (e) {}
    if (contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      data = this.xhr.responseText;
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return typeof XDomainRequest !== 'undefined' && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (typeof document !== 'undefined') {
  if (typeof attachEvent === 'function') {
    attachEvent('onunload', unloadHandler);
  } else if (typeof addEventListener === 'function') {
    var terminationEvent = 'onpagehide' in globalThis ? 'pagehide' : 'unload';
    addEventListener(terminationEvent, unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}


/***/ }),

/***/ 15:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var Transport = __webpack_require__(496);
var parseqs = __webpack_require__(830);
var parser = __webpack_require__(455);
var inherit = __webpack_require__(861);
var yeast = __webpack_require__(281);
var debug = __webpack_require__(227)('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = __webpack_require__(777);
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState && packet.type === 'open') {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};


/***/ }),

/***/ 442:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var Transport = __webpack_require__(496);
var parser = __webpack_require__(455);
var parseqs = __webpack_require__(830);
var inherit = __webpack_require__(861);
var yeast = __webpack_require__(281);
var debug = __webpack_require__(227)('engine.io-client:websocket');

var BrowserWebSocket, NodeWebSocket;

if (typeof WebSocket !== 'undefined') {
  BrowserWebSocket = WebSocket;
} else if (typeof self !== 'undefined') {
  BrowserWebSocket = self.WebSocket || self.MozWebSocket;
}

if (typeof window === 'undefined') {
  try {
    NodeWebSocket = __webpack_require__(20);
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocketImpl = BrowserWebSocket || NodeWebSocket;

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  this.protocols = opts.protocols;
  if (!this.usingBrowserWebSocket) {
    WebSocketImpl = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = this.protocols;

  var opts = {};

  if (!this.isReactNative) {
    opts.agent = this.agent;
    opts.perMessageDeflate = this.perMessageDeflate;

    // SSL options for Node.js client
    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;
  }

  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws =
      this.usingBrowserWebSocket && !this.isReactNative
        ? protocols
          ? new WebSocketImpl(uri, protocols)
          : new WebSocketImpl(uri)
        : new WebSocketImpl(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
};


/***/ }),

/***/ 777:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// browser shim for xmlhttprequest module

var hasCORS = __webpack_require__(58);
var globalThis = __webpack_require__(549);

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new globalThis[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};


/***/ }),

/***/ 455:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var keys = __webpack_require__(990);
var hasBinary = __webpack_require__(466);
var sliceBuffer = __webpack_require__(718);
var after = __webpack_require__(906);
var utf8 = __webpack_require__(414);

var base64encoder;
if (typeof ArrayBuffer !== 'undefined') {
  base64encoder = __webpack_require__(704);
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = __webpack_require__(548);

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if (typeof supportsBinary === 'function') {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if (typeof utf8encode === 'function') {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data), { strict: false }) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    exports.encodePacket({ type: packet.type, data: fr.result }, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (typeof Blob !== 'undefined' && packet.data instanceof Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data === 'string') {
    if (data.charAt(0) === 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data, { strict: false });
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary === 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data !== 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data === '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = '', n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (chr !== ':') {
      length += chr;
      continue;
    }

    if (length === '' || (length != (n = Number(length)))) {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    msg = data.substr(i + 1, n);

    if (length != msg.length) {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    if (msg.length) {
      packet = exports.decodePacket(msg, binaryType, false);

      if (err.type === packet.type && err.data === packet.data) {
        // parser error in individual packet - ignoring payload
        return callback(err, 0, 1);
      }

      var ret = callback(packet, i + n, l);
      if (false === ret) return;
    }

    // advance cursor
    i += n;
    length = '';
  }

  if (length !== '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] === 255) break;

      // 310 = char length of Number.MAX_VALUE
      if (msgLength.length > 310) {
        return callback(err, 0, 1);
      }

      msgLength += tailArray[i];
    }

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};


/***/ }),

/***/ 990:
/***/ ((module) => {


/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};


/***/ }),

/***/ 414:
/***/ ((module) => {

/*! https://mths.be/utf8js v2.1.2 by @mathias */

var stringFromCharCode = String.fromCharCode;

// Taken from https://mths.be/punycode
function ucs2decode(string) {
	var output = [];
	var counter = 0;
	var length = string.length;
	var value;
	var extra;
	while (counter < length) {
		value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// high surrogate, and there is a next character
			extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) { // low surrogate
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// unmatched surrogate; only append this code unit, in case the next
				// code unit is the high surrogate of a surrogate pair
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

// Taken from https://mths.be/punycode
function ucs2encode(array) {
	var length = array.length;
	var index = -1;
	var value;
	var output = '';
	while (++index < length) {
		value = array[index];
		if (value > 0xFFFF) {
			value -= 0x10000;
			output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
			value = 0xDC00 | value & 0x3FF;
		}
		output += stringFromCharCode(value);
	}
	return output;
}

function checkScalarValue(codePoint, strict) {
	if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
		if (strict) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
		return false;
	}
	return true;
}
/*--------------------------------------------------------------------------*/

function createByte(codePoint, shift) {
	return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
}

function encodeCodePoint(codePoint, strict) {
	if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
		return stringFromCharCode(codePoint);
	}
	var symbol = '';
	if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
		symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
	}
	else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
		if (!checkScalarValue(codePoint, strict)) {
			codePoint = 0xFFFD;
		}
		symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
		symbol += createByte(codePoint, 6);
	}
	else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
		symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
		symbol += createByte(codePoint, 12);
		symbol += createByte(codePoint, 6);
	}
	symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
	return symbol;
}

function utf8encode(string, opts) {
	opts = opts || {};
	var strict = false !== opts.strict;

	var codePoints = ucs2decode(string);
	var length = codePoints.length;
	var index = -1;
	var codePoint;
	var byteString = '';
	while (++index < length) {
		codePoint = codePoints[index];
		byteString += encodeCodePoint(codePoint, strict);
	}
	return byteString;
}

/*--------------------------------------------------------------------------*/

function readContinuationByte() {
	if (byteIndex >= byteCount) {
		throw Error('Invalid byte index');
	}

	var continuationByte = byteArray[byteIndex] & 0xFF;
	byteIndex++;

	if ((continuationByte & 0xC0) == 0x80) {
		return continuationByte & 0x3F;
	}

	// If we end up here, it’s not a continuation byte
	throw Error('Invalid continuation byte');
}

function decodeSymbol(strict) {
	var byte1;
	var byte2;
	var byte3;
	var byte4;
	var codePoint;

	if (byteIndex > byteCount) {
		throw Error('Invalid byte index');
	}

	if (byteIndex == byteCount) {
		return false;
	}

	// Read first byte
	byte1 = byteArray[byteIndex] & 0xFF;
	byteIndex++;

	// 1-byte sequence (no continuation bytes)
	if ((byte1 & 0x80) == 0) {
		return byte1;
	}

	// 2-byte sequence
	if ((byte1 & 0xE0) == 0xC0) {
		byte2 = readContinuationByte();
		codePoint = ((byte1 & 0x1F) << 6) | byte2;
		if (codePoint >= 0x80) {
			return codePoint;
		} else {
			throw Error('Invalid continuation byte');
		}
	}

	// 3-byte sequence (may include unpaired surrogates)
	if ((byte1 & 0xF0) == 0xE0) {
		byte2 = readContinuationByte();
		byte3 = readContinuationByte();
		codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
		if (codePoint >= 0x0800) {
			return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
		} else {
			throw Error('Invalid continuation byte');
		}
	}

	// 4-byte sequence
	if ((byte1 & 0xF8) == 0xF0) {
		byte2 = readContinuationByte();
		byte3 = readContinuationByte();
		byte4 = readContinuationByte();
		codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
			(byte3 << 0x06) | byte4;
		if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
			return codePoint;
		}
	}

	throw Error('Invalid UTF-8 detected');
}

var byteArray;
var byteCount;
var byteIndex;
function utf8decode(byteString, opts) {
	opts = opts || {};
	var strict = false !== opts.strict;

	byteArray = ucs2decode(byteString);
	byteCount = byteArray.length;
	byteIndex = 0;
	var codePoints = [];
	var tmp;
	while ((tmp = decodeSymbol(strict)) !== false) {
		codePoints.push(tmp);
	}
	return ucs2encode(codePoints);
}

module.exports = {
	version: '2.1.2',
	encode: utf8encode,
	decode: utf8decode
};


/***/ }),

/***/ 466:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* global Blob File */

/*
 * Module requirements.
 */

var isArray = __webpack_require__(826);

var toString = Object.prototype.toString;
var withNativeBlob = typeof Blob === 'function' ||
                        typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]';
var withNativeFile = typeof File === 'function' ||
                        typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]';

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Supports Buffer, ArrayBuffer, Blob and File.
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary (obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }
    return false;
  }

  if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
    (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
    (withNativeBlob && obj instanceof Blob) ||
    (withNativeFile && obj instanceof File)
  ) {
    return true;
  }

  // see: https://github.com/Automattic/has-binary/pull/4
  if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }

  return false;
}


/***/ }),

/***/ 58:
/***/ ((module) => {


/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}


/***/ }),

/***/ 355:
/***/ ((module) => {


var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/***/ }),

/***/ 826:
/***/ ((module) => {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ 824:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ 830:
/***/ ((__unused_webpack_module, exports) => {

/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};


/***/ }),

/***/ 187:
/***/ ((module) => {

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    uri.pathNames = pathNames(uri, uri['path']);
    uri.queryKey = queryKey(uri, uri['query']);

    return uri;
};

function pathNames(obj, path) {
    var regx = /\/{2,9}/g,
        names = path.replace(regx, "/").split("/");

    if (path.substr(0, 1) == '/' || path.length === 0) {
        names.splice(0, 1);
    }
    if (path.substr(path.length - 1, 1) == '/') {
        names.splice(names.length - 1, 1);
    }

    return names;
}

function queryKey(uri, query) {
    var data = {};

    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
            data[$1] = $2;
        }
    });

    return data;
}


/***/ }),

/***/ 809:
/***/ ((module, exports, __webpack_require__) => {


/**
 * Module dependencies.
 */

var url = __webpack_require__(678);
var parser = __webpack_require__(113);
var Manager = __webpack_require__(739);
var debug = __webpack_require__(227)('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  }
  return io.socket(parsed.path, opts);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = __webpack_require__(739);
exports.Socket = __webpack_require__(584);


/***/ }),

/***/ 739:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * Module dependencies.
 */

var eio = __webpack_require__(983);
var Socket = __webpack_require__(584);
var Emitter = __webpack_require__(767);
var parser = __webpack_require__(113);
var on = __webpack_require__(464);
var bind = __webpack_require__(77);
var debug = __webpack_require__(227)('socket.io-client:manager');
var indexOf = __webpack_require__(355);
var Backoff = __webpack_require__(10);

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  var _parser = opts.parser || parser;
  this.encoder = new _parser.Encoder();
  this.decoder = new _parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.generateId(nsp);
    }
  }
};

/**
 * generate `socket.id` for the given `nsp`
 *
 * @param {String} nsp
 * @return {String}
 * @api private
 */

Manager.prototype.generateId = function (nsp) {
  return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    if (timeout === 0) {
      openSub.destroy(); // prevents a race condition with the 'open' event
    }

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.generateId(nsp);
    });

    if (this.autoConnect) {
      // manually call here since connecting event is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};


/***/ }),

/***/ 464:
/***/ ((module) => {


/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}


/***/ }),

/***/ 584:
/***/ ((module, exports, __webpack_require__) => {


/**
 * Module dependencies.
 */

var parser = __webpack_require__(113);
var Emitter = __webpack_require__(767);
var toArray = __webpack_require__(42);
var on = __webpack_require__(464);
var bind = __webpack_require__(77);
var debug = __webpack_require__(227)('socket.io-client:socket');
var parseqs = __webpack_require__(830);
var hasBin = __webpack_require__(466);

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  this.flags = {};
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  if (!this.io.reconnecting) this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var packet = {
    type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
    data: args
  };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  this.flags = {};

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
      debug('sending connect packet with query %s', query);
      this.packet({type: parser.CONNECT, query: query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  var sameNamespace = packet.nsp === this.nsp;
  var rootNamespaceError = packet.type === parser.ERROR && packet.nsp === '/';

  if (!sameNamespace && !rootNamespaceError) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    self.packet({
      type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags.compress = compress;
  return this;
};

/**
 * Sets the binary flag
 *
 * @param {Boolean} whether the emitted data contains binary
 * @return {Socket} self
 * @api public
 */

Socket.prototype.binary = function (binary) {
  this.flags.binary = binary;
  return this;
};


/***/ }),

/***/ 678:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * Module dependencies.
 */

var parseuri = __webpack_require__(187);
var debug = __webpack_require__(227)('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || (typeof location !== 'undefined' && location);
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}


/***/ }),

/***/ 326:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = __webpack_require__(826);
var isBuf = __webpack_require__(66);
var toString = Object.prototype.toString;
var withNativeBlob = typeof Blob === 'function' || (typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]');
var withNativeFile = typeof File === 'function' || (typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet) {
  var buffers = [];
  var packetData = packet.data;
  var pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

function _deconstructPacket(data, buffers) {
  if (!data) return data;

  if (isBuf(data)) {
    var placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (isArray(data)) {
    var newData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }
    return newData;
  } else if (typeof data === 'object' && !(data instanceof Date)) {
    var newData = {};
    for (var key in data) {
      newData[key] = _deconstructPacket(data[key], buffers);
    }
    return newData;
  }
  return data;
}

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  packet.attachments = undefined; // no longer useful
  return packet;
};

function _reconstructPacket(data, buffers) {
  if (!data) return data;

  if (data && data._placeholder) {
    return buffers[data.num]; // appropriate buffer (should be natural order anyway)
  } else if (isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === 'object') {
    for (var key in data) {
      data[key] = _reconstructPacket(data[key], buffers);
    }
  }

  return data;
}

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (typeof obj === 'object' && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};


/***/ }),

/***/ 113:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Module dependencies.
 */

var debug = __webpack_require__(227)('socket.io-parser');
var Emitter = __webpack_require__(767);
var binary = __webpack_require__(326);
var isArray = __webpack_require__(826);
var isBuf = __webpack_require__(66);

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

var ERROR_PACKET = exports.ERROR + '"encode error"';

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    encodeAsBinary(obj, callback);
  } else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {

  // first is type
  var str = '' + obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    str += obj.attachments + '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' !== obj.nsp) {
    str += obj.nsp + ',';
  }

  // immediately followed by the id
  if (null != obj.id) {
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    var payload = tryStringify(obj.data);
    if (payload !== false) {
      str += payload;
    } else {
      return ERROR_PACKET;
    }
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

function tryStringify(str) {
  try {
    return JSON.stringify(str);
  } catch(e){
    return false;
  }
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an encoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if (typeof obj === 'string') {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  } else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  } else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var i = 0;
  // look up type
  var p = {
    type: Number(str.charAt(0))
  };

  if (null == exports.types[p.type]) {
    return error('unknown packet type ' + p.type);
  }

  // look up attachments if type binary
  if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
    var start = i + 1;
    while (str.charAt(++i) !== '-' && i != str.length) {}
    var buf = str.substring(start, i);
    if (buf != Number(buf) || str.charAt(i) !== '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' === str.charAt(i + 1)) {
    var start = i + 1;
    while (++i) {
      var c = str.charAt(i);
      if (',' === c) break;
      if (i === str.length) break;
    }
    p.nsp = str.substring(start, i);
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    var start = i + 1;
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      if (i === str.length) break;
    }
    p.id = Number(str.substring(start, i + 1));
  }

  // look up json data
  if (str.charAt(++i)) {
    var payload = tryParse(str.substr(i));
    var isPayloadValid = payload !== false && (p.type === exports.ERROR || isArray(payload));
    if (isPayloadValid) {
      p.data = payload;
    } else {
      return error('invalid payload');
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch(e){
    return false;
  }
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(msg) {
  return {
    type: exports.ERROR,
    data: 'parser error: ' + msg
  };
}


/***/ }),

/***/ 66:
/***/ ((module) => {


module.exports = isBuf;

var withNativeBuffer = typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function';
var withNativeArrayBuffer = typeof ArrayBuffer === 'function';

var isView = function (obj) {
  return typeof ArrayBuffer.isView === 'function' ? ArrayBuffer.isView(obj) : (obj.buffer instanceof ArrayBuffer);
};

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (withNativeBuffer && Buffer.isBuffer(obj)) ||
          (withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)));
}


/***/ }),

/***/ 42:
/***/ ((module) => {

module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}


/***/ }),

/***/ 281:
/***/ ((module) => {

"use strict";


var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;


/***/ }),

/***/ 20:
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ logDb)
});

;// CONCATENATED MODULE: ./node_modules/dexie/dist/modern/dexie.mjs
/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 3.2.0, Thu Nov 18 2021
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */
 
const _global = typeof globalThis !== 'undefined' ? globalThis :
    typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
            global;

const keys = Object.keys;
const isArray = Array.isArray;
if (typeof Promise !== 'undefined' && !_global.Promise) {
    _global.Promise = Promise;
}
function extend(obj, extension) {
    if (typeof extension !== 'object')
        return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}
const getProto = Object.getPrototypeOf;
const _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
    if (typeof extension === 'function')
        extension = extension(getProto(proto));
    (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(key => {
        setProp(proto, key, extension[key]);
    });
}
const defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
    defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
        { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
        { value: functionOrGetSet, configurable: true, writable: true }, options));
}
function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: props.bind(null, Child.prototype)
            };
        }
    };
}
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
    const pd = getOwnPropertyDescriptor(obj, prop);
    let proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}
const _slice = [].slice;
function slice(args, start, end) {
    return _slice.call(args, start, end);
}
function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}
function assert(b) {
    if (!b)
        throw new Error("Assertion Failed");
}
function asap$1(fn) {
    if (_global.setImmediate)
        setImmediate(fn);
    else
        setTimeout(fn, 0);
}
function arrayToObject(array, extractor) {
    return array.reduce((result, item, i) => {
        var nameAndValue = extractor(item, i);
        if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}
function tryCatch(fn, onerror, args) {
    try {
        fn.apply(null, args);
    }
    catch (ex) {
        onerror && onerror(ex);
    }
}
function getByKeyPath(obj, keyPath) {
    if (hasOwn(obj, keyPath))
        return obj[keyPath];
    if (!keyPath)
        return obj;
    if (typeof keyPath !== 'string') {
        var rv = [];
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
        }
        return rv;
    }
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var innerObj = obj[keyPath.substr(0, period)];
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
}
function setByKeyPath(obj, keyPath, value) {
    if (!obj || keyPath === undefined)
        return;
    if ('isFrozen' in Object && Object.isFrozen(obj))
        return;
    if (typeof keyPath !== 'string' && 'length' in keyPath) {
        assert(typeof value !== 'string' && 'length' in value);
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
        }
    }
    else {
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
                if (value === undefined) {
                    if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                        obj.splice(currentKeyPath, 1);
                    else
                        delete obj[currentKeyPath];
                }
                else
                    obj[currentKeyPath] = value;
            else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj)
                    innerObj = (obj[currentKeyPath] = {});
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        }
        else {
            if (value === undefined) {
                if (isArray(obj) && !isNaN(parseInt(keyPath)))
                    obj.splice(keyPath, 1);
                else
                    delete obj[keyPath];
            }
            else
                obj[keyPath] = value;
        }
    }
}
function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string')
        setByKeyPath(obj, keyPath, undefined);
    else if ('length' in keyPath)
        [].map.call(keyPath, function (kp) {
            setByKeyPath(obj, kp, undefined);
        });
}
function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (hasOwn(obj, m))
            rv[m] = obj[m];
    }
    return rv;
}
const concat = [].concat;
function flatten(a) {
    return concat.apply([], a);
}
const intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey"
    .split(',').concat(flatten([8, 16, 32, 64].map(num => ["Int", "Uint", "Float"].map(t => t + num + "Array")))).filter(t => _global[t]);
const intrinsicTypes = intrinsicTypeNames.map(t => _global[t]);
arrayToObject(intrinsicTypeNames, x => [x, true]);
let circularRefs = null;
function deepClone(any) {
    circularRefs = typeof WeakMap !== 'undefined' && new WeakMap();
    const rv = innerDeepClone(any);
    circularRefs = null;
    return rv;
}
function innerDeepClone(any) {
    if (!any || typeof any !== 'object')
        return any;
    let rv = circularRefs && circularRefs.get(any);
    if (rv)
        return rv;
    if (isArray(any)) {
        rv = [];
        circularRefs && circularRefs.set(any, rv);
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(innerDeepClone(any[i]));
        }
    }
    else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
        rv = any;
    }
    else {
        const proto = getProto(any);
        rv = proto === Object.prototype ? {} : Object.create(proto);
        circularRefs && circularRefs.set(any, rv);
        for (var prop in any) {
            if (hasOwn(any, prop)) {
                rv[prop] = innerDeepClone(any[prop]);
            }
        }
    }
    return rv;
}
const { toString: dexie_toString } = {};
function toStringTag(o) {
    return dexie_toString.call(o).slice(8, -1);
}
const iteratorSymbol = typeof Symbol !== 'undefined' ?
    Symbol.iterator :
    '@@iterator';
const getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () { return null; };
const NO_CHAR_ARRAY = {};
function getArrayOf(arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike))
            return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
            return [arrayLike];
        if ((it = getIteratorOf(arrayLike))) {
            a = [];
            while ((x = it.next()), !x.done)
                a.push(x.value);
            return a;
        }
        if (arrayLike == null)
            return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--)
                a[i] = arrayLike[i];
            return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--)
        a[i] = arguments[i];
    return a;
}
const isAsyncFunction = typeof Symbol !== 'undefined'
    ? (fn) => fn[Symbol.toStringTag] === 'AsyncFunction'
    : () => false;

var debug = typeof location !== 'undefined' &&
    /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}
var libraryFilter = () => true;
const NEEDS_THROW_FOR_STACK = !new Error("").stack;
function getErrorWithStack() {
    if (NEEDS_THROW_FOR_STACK)
        try {
            getErrorWithStack.arguments;
            throw new Error();
        }
        catch (e) {
            return e;
        }
    return new Error();
}
function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack)
        return "";
    numIgnoredFrames = (numIgnoredFrames || 0);
    if (stack.indexOf(exception.name) === 0)
        numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n')
        .slice(numIgnoredFrames)
        .filter(libraryFilter)
        .map(frame => "\n" + frame)
        .join('');
}

var dexieErrorNames = [
    'Modify',
    'Bulk',
    'OpenFailed',
    'VersionChange',
    'Schema',
    'Upgrade',
    'InvalidTable',
    'MissingAPI',
    'NoSuchDatabase',
    'InvalidArgument',
    'SubTransaction',
    'Unsupported',
    'Internal',
    'DatabaseClosed',
    'PrematureCommit',
    'ForeignAwait'
];
var idbDomErrorNames = [
    'Unknown',
    'Constraint',
    'Data',
    'TransactionInactive',
    'ReadOnly',
    'Version',
    'NotFound',
    'InvalidState',
    'InvalidAccess',
    'Abort',
    'Timeout',
    'QuotaExceeded',
    'Syntax',
    'DataClone'
];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
    VersionChanged: "Database version changed by other database connection",
    DatabaseClosed: "Database has been closed",
    Abort: "Transaction aborted",
    TransactionInactive: "Transaction has already completed or failed",
    MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function DexieError(name, msg) {
    this._e = getErrorWithStack();
    this.name = name;
    this.message = msg;
}
derive(DexieError).from(Error).extend({
    stack: {
        get: function () {
            return this._stack ||
                (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
        }
    },
    toString: function () { return this.name + ": " + this.message; }
});
function getMultiErrorMessage(msg, failures) {
    return msg + ". Errors: " + Object.keys(failures)
        .map(key => failures[key].toString())
        .filter((v, i, s) => s.indexOf(v) === i)
        .join('\n');
}
function ModifyError(msg, failures, successCount, failedKeys) {
    this._e = getErrorWithStack();
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
    this._e = getErrorWithStack();
    this.name = "BulkError";
    this.failures = Object.keys(failures).map(pos => failures[pos]);
    this.failuresByPos = failures;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);
var errnames = errorList.reduce((obj, name) => (obj[name] = name + "Error", obj), {});
const BaseException = DexieError;
var exceptions = errorList.reduce((obj, name) => {
    var fullName = name + "Error";
    function DexieError(msgOrInner, inner) {
        this._e = getErrorWithStack();
        this.name = fullName;
        if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
        }
        else if (typeof msgOrInner === 'string') {
            this.message = `${msgOrInner}${!inner ? '' : '\n ' + inner}`;
            this.inner = inner || null;
        }
        else if (typeof msgOrInner === 'object') {
            this.message = `${msgOrInner.name} ${msgOrInner.message}`;
            this.inner = msgOrInner;
        }
    }
    derive(DexieError).from(BaseException);
    obj[name] = DexieError;
    return obj;
}, {});
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce((obj, name) => {
    obj[name + "Error"] = exceptions[name];
    return obj;
}, {});
function mapError(domError, message) {
    if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
        return domError;
    var rv = new exceptionMap[domError.name](message || domError.message, domError);
    if ("stack" in domError) {
        setProp(rv, "stack", { get: function () {
                return this.inner.stack;
            } });
    }
    return rv;
}
var fullNameExceptions = errorList.reduce((obj, name) => {
    if (["Syntax", "Type", "Range"].indexOf(name) === -1)
        obj[name + "Error"] = exceptions[name];
    return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

function nop() { }
function mirror(val) { return val; }
function pureFunctionChain(f1, f2) {
    if (f1 == null || f1 === mirror)
        return f2;
    return function (val) {
        return f2(f1(val));
    };
}
function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}
function hookCreatingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined)
            arguments[0] = res;
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res2 !== undefined ? res2 : res;
    };
}
function hookDeletingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        f1.apply(this, arguments);
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = this.onerror = null;
        f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    };
}
function hookUpdatingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function (modifications) {
        var res = f1.apply(this, arguments);
        extend(modifications, res);
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res === undefined ?
            (res2 === undefined ? undefined : res2) :
            (extend(res, res2));
    };
}
function reverseStoppableEventChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        if (f2.apply(this, arguments) === false)
            return false;
        return f1.apply(this, arguments);
    };
}
function promisableChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this, i = arguments.length, args = new Array(i);
            while (i--)
                args[i] = arguments[i];
            return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}

var INTERNAL = {};
const LONG_STACKS_CLIP_LIMIT = 100,
MAX_LONG_STACKS = 20, ZONE_ECHO_LIMIT = 100, [resolvedNativePromise, nativePromiseProto, resolvedGlobalPromise] = typeof Promise === 'undefined' ?
    [] :
    (() => {
        let globalP = Promise.resolve();
        if (typeof crypto === 'undefined' || !crypto.subtle)
            return [globalP, getProto(globalP), globalP];
        const nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [
            nativeP,
            getProto(nativeP),
            globalP
        ];
    })(), nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
const NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
const patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
var schedulePhysicalTick = resolvedGlobalPromise ?
    () => { resolvedGlobalPromise.then(physicalTick); }
    :
        _global.setImmediate ?
            setImmediate.bind(null, physicalTick) :
            _global.MutationObserver ?
                () => {
                    var hiddenDiv = document.createElement("div");
                    (new MutationObserver(() => {
                        physicalTick();
                        hiddenDiv = null;
                    })).observe(hiddenDiv, { attributes: true });
                    hiddenDiv.setAttribute('i', '1');
                } :
                () => { setTimeout(physicalTick, 0); };
var asap = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};
var isOutsideMicroTick = true,
needsNewPhysicalTick = true,
unhandledErrors = [],
rejectingErrors = [],
currentFulfiller = null, rejectionMapper = mirror;
var globalPSD = {
    id: 'global',
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: globalError,
    pgp: false,
    env: {},
    finalize: function () {
        this.unhandleds.forEach(uh => {
            try {
                globalError(uh[0], uh[1]);
            }
            catch (e) { }
        });
    }
};
var PSD = globalPSD;
var microtickQueue = [];
var numScheduledCalls = 0;
var tickFinalizers = [];
function DexiePromise(fn) {
    if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
    this._listeners = [];
    this.onuncatched = nop;
    this._lib = false;
    var psd = (this._PSD = PSD);
    if (debug) {
        this._stackHolder = getErrorWithStack();
        this._prev = null;
        this._numPrev = 0;
    }
    if (typeof fn !== 'function') {
        if (fn !== INTERNAL)
            throw new TypeError('Not a function');
        this._state = arguments[1];
        this._value = arguments[2];
        if (this._state === false)
            handleRejection(this, this._value);
        return;
    }
    this._state = null;
    this._value = null;
    ++psd.ref;
    executePromiseTask(this, fn);
}
const thenProp = {
    get: function () {
        var psd = PSD, microTaskId = totalEchoes;
        function then(onFulfilled, onRejected) {
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            const cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise((resolve, reject) => {
                propagateToListener(this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            debug && linkToPreviousPromise(rv, this);
            return rv;
        }
        then.prototype = INTERNAL;
        return then;
    },
    set: function (value) {
        setProp(this, 'then', value && value.prototype === INTERNAL ?
            thenProp :
            {
                get: function () {
                    return value;
                },
                set: thenProp.set
            });
    }
};
props(DexiePromise.prototype, {
    then: thenProp,
    _then: function (onFulfilled, onRejected) {
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
    },
    catch: function (onRejected) {
        if (arguments.length === 1)
            return this.then(null, onRejected);
        var type = arguments[0], handler = arguments[1];
        return typeof type === 'function' ? this.then(null, err =>
        err instanceof type ? handler(err) : PromiseReject(err))
            : this.then(null, err =>
            err && err.name === type ? handler(err) : PromiseReject(err));
    },
    finally: function (onFinally) {
        return this.then(value => {
            onFinally();
            return value;
        }, err => {
            onFinally();
            return PromiseReject(err);
        });
    },
    stack: {
        get: function () {
            if (this._stack)
                return this._stack;
            try {
                stack_being_generated = true;
                var stacks = getStack(this, [], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous: ");
                if (this._state !== null)
                    this._stack = stack;
                return stack;
            }
            finally {
                stack_being_generated = false;
            }
        }
    },
    timeout: function (ms, msg) {
        return ms < Infinity ?
            new DexiePromise((resolve, reject) => {
                var handle = setTimeout(() => reject(new exceptions.Timeout(msg)), ms);
                this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
            }) : this;
    }
});
if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
    setProp(DexiePromise.prototype, Symbol.toStringTag, 'Dexie.Promise');
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = zone;
}
props(DexiePromise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments)
            .map(onPossibleParallellAsync);
        return new DexiePromise(function (resolve, reject) {
            if (values.length === 0)
                resolve([]);
            var remaining = values.length;
            values.forEach((a, i) => DexiePromise.resolve(a).then(x => {
                values[i] = x;
                if (!--remaining)
                    resolve(values);
            }, reject));
        });
    },
    resolve: value => {
        if (value instanceof DexiePromise)
            return value;
        if (value && typeof value.then === 'function')
            return new DexiePromise((resolve, reject) => {
                value.then(resolve, reject);
            });
        var rv = new DexiePromise(INTERNAL, true, value);
        linkToPreviousPromise(rv, currentFulfiller);
        return rv;
    },
    reject: PromiseReject,
    race: function () {
        var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
        return new DexiePromise((resolve, reject) => {
            values.map(value => DexiePromise.resolve(value).then(resolve, reject));
        });
    },
    PSD: {
        get: () => PSD,
        set: value => PSD = value
    },
    totalEchoes: { get: () => totalEchoes },
    newPSD: newScope,
    usePSD: usePSD,
    scheduler: {
        get: () => asap,
        set: value => { asap = value; }
    },
    rejectionMapper: {
        get: () => rejectionMapper,
        set: value => { rejectionMapper = value; }
    },
    follow: (fn, zoneProps) => {
        return new DexiePromise((resolve, reject) => {
            return newScope((resolve, reject) => {
                var psd = PSD;
                psd.unhandleds = [];
                psd.onunhandled = reject;
                psd.finalize = callBoth(function () {
                    run_at_end_of_this_or_next_physical_tick(() => {
                        this.unhandleds.length === 0 ? resolve() : reject(this.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, zoneProps, resolve, reject);
        });
    }
});
if (NativePromise) {
    if (NativePromise.allSettled)
        setProp(DexiePromise, "allSettled", function () {
            const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(resolve => {
                if (possiblePromises.length === 0)
                    resolve([]);
                let remaining = possiblePromises.length;
                const results = new Array(remaining);
                possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => results[i] = { status: "fulfilled", value }, reason => results[i] = { status: "rejected", reason })
                    .then(() => --remaining || resolve(results)));
            });
        });
    if (NativePromise.any && typeof AggregateError !== 'undefined')
        setProp(DexiePromise, "any", function () {
            const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise((resolve, reject) => {
                if (possiblePromises.length === 0)
                    reject(new AggregateError([]));
                let remaining = possiblePromises.length;
                const failures = new Array(remaining);
                possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => resolve(value), failure => {
                    failures[i] = failure;
                    if (!--remaining)
                        reject(new AggregateError(failures));
                }));
            });
        });
}
function executePromiseTask(promise, fn) {
    try {
        fn(value => {
            if (promise._state !== null)
                return;
            if (value === promise)
                throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, (resolve, reject) => {
                    value instanceof DexiePromise ?
                        value._then(resolve, reject) :
                        value.then(resolve, reject);
                });
            }
            else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
                endMicroTickScope();
        }, handleRejection.bind(null, promise));
    }
    catch (ex) {
        handleRejection(promise, ex);
    }
}
function handleRejection(promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null)
        return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(() => {
        var origProp = getPropertyDescriptor(reason, "stack");
        reason._promise = promise;
        setProp(reason, "stack", {
            get: () => stack_being_generated ?
                origProp && (origProp.get ?
                    origProp.get.apply(reason) :
                    origProp.value) :
                promise.stack
        });
    });
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick)
        endMicroTickScope();
}
function propagateAllListeners(promise) {
    var listeners = promise._listeners;
    promise._listeners = [];
    for (var i = 0, len = listeners.length; i < len; ++i) {
        propagateToListener(promise, listeners[i]);
    }
    var psd = promise._PSD;
    --psd.ref || psd.finalize();
    if (numScheduledCalls === 0) {
        ++numScheduledCalls;
        asap(() => {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
        }, []);
    }
}
function propagateToListener(promise, listener) {
    if (promise._state === null) {
        promise._listeners.push(listener);
        return;
    }
    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
    if (cb === null) {
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    ++listener.psd.ref;
    ++numScheduledCalls;
    asap(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
    try {
        currentFulfiller = promise;
        var ret, value = promise._value;
        if (promise._state) {
            ret = cb(value);
        }
        else {
            if (rejectingErrors.length)
                rejectingErrors = [];
            ret = cb(value);
            if (rejectingErrors.indexOf(value) === -1)
                markErrorAsHandled(promise);
        }
        listener.resolve(ret);
    }
    catch (e) {
        listener.reject(e);
    }
    finally {
        currentFulfiller = null;
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        --listener.psd.ref || listener.psd.finalize();
    }
}
function getStack(promise, stacks, limit) {
    if (stacks.length === limit)
        return stacks;
    var stack = "";
    if (promise._state === false) {
        var failure = promise._value, errorName, message;
        if (failure != null) {
            errorName = failure.name || "Error";
            message = failure.message || failure;
            stack = prettyStack(failure, 0);
        }
        else {
            errorName = failure;
            message = "";
        }
        stacks.push(errorName + (message ? ": " + message : "") + stack);
    }
    if (debug) {
        stack = prettyStack(promise._stackHolder, 2);
        if (stack && stacks.indexOf(stack) === -1)
            stacks.push(stack);
        if (promise._prev)
            getStack(promise._prev, stacks, limit);
    }
    return stacks;
}
function linkToPreviousPromise(promise, prev) {
    var numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) {
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}
function physicalTick() {
    beginMicroTickScope() && endMicroTickScope();
}
function beginMicroTickScope() {
    var wasRootExec = isOutsideMicroTick;
    isOutsideMicroTick = false;
    needsNewPhysicalTick = false;
    return wasRootExec;
}
function endMicroTickScope() {
    var callbacks, i, l;
    do {
        while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                item[0].apply(null, item[1]);
            }
        }
    } while (microtickQueue.length > 0);
    isOutsideMicroTick = true;
    needsNewPhysicalTick = true;
}
function finalizePhysicalTick() {
    var unhandledErrs = unhandledErrors;
    unhandledErrors = [];
    unhandledErrs.forEach(p => {
        p._PSD.onunhandled.call(null, p._value, p);
    });
    var finalizers = tickFinalizers.slice(0);
    var i = finalizers.length;
    while (i)
        finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap(() => {
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
    }, []);
}
function addPossiblyUnhandledError(promise) {
    if (!unhandledErrors.some(p => p._value === promise._value))
        unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
    var i = unhandledErrors.length;
    while (i)
        if (unhandledErrors[--i]._value === promise._value) {
            unhandledErrors.splice(i, 1);
            return;
        }
}
function PromiseReject(reason) {
    return new DexiePromise(INTERNAL, false, reason);
}
function wrap(fn, errorCatcher) {
    var psd = PSD;
    return function () {
        var wasRootExec = beginMicroTickScope(), outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
        }
        catch (e) {
            errorCatcher && errorCatcher(e);
        }
        finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
                endMicroTickScope();
        }
    };
}
const task = { awaits: 0, echoes: 0, id: 0 };
var taskCounter = 0;
var zoneStack = [];
var zoneEchoes = 0;
var totalEchoes = 0;
var zone_id_counter = 0;
function newScope(fn, props, a1, a2) {
    var parent = PSD, psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    psd.id = ++zone_id_counter;
    var globalEnv = globalPSD.env;
    psd.env = patchGlobalPromise ? {
        Promise: DexiePromise,
        PromiseProp: { value: DexiePromise, configurable: true, writable: true },
        all: DexiePromise.all,
        race: DexiePromise.race,
        allSettled: DexiePromise.allSettled,
        any: DexiePromise.any,
        resolve: DexiePromise.resolve,
        reject: DexiePromise.reject,
        nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
        gthen: getPatchedPromiseThen(globalEnv.gthen, psd)
    } : {};
    if (props)
        extend(psd, props);
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    };
    var rv = usePSD(psd, fn, a1, a2);
    if (psd.ref === 0)
        psd.finalize();
    return rv;
}
function incrementExpectedAwaits() {
    if (!task.id)
        task.id = ++taskCounter;
    ++task.awaits;
    task.echoes += ZONE_ECHO_LIMIT;
    return task.id;
}
function decrementExpectedAwaits() {
    if (!task.awaits)
        return false;
    if (--task.awaits === 0)
        task.id = 0;
    task.echoes = task.awaits * ZONE_ECHO_LIMIT;
    return true;
}
if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
    incrementExpectedAwaits = decrementExpectedAwaits = nop;
}
function onPossibleParallellAsync(possiblePromise) {
    if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
        incrementExpectedAwaits();
        return possiblePromise.then(x => {
            decrementExpectedAwaits();
            return x;
        }, e => {
            decrementExpectedAwaits();
            return rejection(e);
        });
    }
    return possiblePromise;
}
function zoneEnterEcho(targetZone) {
    ++totalEchoes;
    if (!task.echoes || --task.echoes === 0) {
        task.echoes = task.id = 0;
    }
    zoneStack.push(PSD);
    switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
    var zone = zoneStack[zoneStack.length - 1];
    zoneStack.pop();
    switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
    var currentZone = PSD;
    if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
        enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
    }
    if (targetZone === PSD)
        return;
    PSD = targetZone;
    if (currentZone === globalPSD)
        globalPSD.env = snapShot();
    if (patchGlobalPromise) {
        var GlobalPromise = globalPSD.env.Promise;
        var targetEnv = targetZone.env;
        nativePromiseProto.then = targetEnv.nthen;
        GlobalPromise.prototype.then = targetEnv.gthen;
        if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
                GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
                GlobalPromise.any = targetEnv.any;
        }
    }
}
function snapShot() {
    var GlobalPromise = _global.Promise;
    return patchGlobalPromise ? {
        Promise: GlobalPromise,
        PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
        all: GlobalPromise.all,
        race: GlobalPromise.race,
        allSettled: GlobalPromise.allSettled,
        any: GlobalPromise.any,
        resolve: GlobalPromise.resolve,
        reject: GlobalPromise.reject,
        nthen: nativePromiseProto.then,
        gthen: GlobalPromise.prototype.then
    } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        switchToZone(psd, true);
        return fn(a1, a2, a3);
    }
    finally {
        switchToZone(outerScope, false);
    }
}
function enqueueNativeMicroTask(job) {
    nativePromiseThen.call(resolvedNativePromise, job);
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
    return typeof fn !== 'function' ? fn : function () {
        var outerZone = PSD;
        if (possibleAwait)
            incrementExpectedAwaits();
        switchToZone(zone, true);
        try {
            return fn.apply(this, arguments);
        }
        finally {
            switchToZone(outerZone, false);
            if (cleanup)
                enqueueNativeMicroTask(decrementExpectedAwaits);
        }
    };
}
function getPatchedPromiseThen(origThen, zone) {
    return function (onResolved, onRejected) {
        return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone), nativeAwaitCompatibleWrap(onRejected, zone));
    };
}
const UNHANDLEDREJECTION = "unhandledrejection";
function globalError(err, promise) {
    var rv;
    try {
        rv = promise.onuncatched(err);
    }
    catch (e) { }
    if (rv !== false)
        try {
            var event, eventData = { promise: promise, reason: err };
            if (_global.document && document.createEvent) {
                event = document.createEvent('Event');
                event.initEvent(UNHANDLEDREJECTION, true, true);
                extend(event, eventData);
            }
            else if (_global.CustomEvent) {
                event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                extend(event, eventData);
            }
            if (event && _global.dispatchEvent) {
                dispatchEvent(event);
                if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                    try {
                        _global.onunhandledrejection(event);
                    }
                    catch (_) { }
            }
            if (debug && event && !event.defaultPrevented) {
                console.warn(`Unhandled rejection: ${err.stack || err}`);
            }
        }
        catch (e) { }
}
var rejection = DexiePromise.reject;

function tempTransaction(db, mode, storeNames, fn) {
    if (!db.idbdb || (!db._state.openComplete && (!PSD.letThrough && !db._vip))) {
        if (db._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
        }
        if (!db._state.isBeingOpened) {
            if (!db._options.autoOpen)
                return rejection(new exceptions.DatabaseClosed());
            db.open().catch(nop);
        }
        return db._state.dbReadyPromise.then(() => tempTransaction(db, mode, storeNames, fn));
    }
    else {
        var trans = db._createTransaction(mode, storeNames, db._dbSchema);
        try {
            trans.create();
        }
        catch (ex) {
            return rejection(ex);
        }
        return trans._promise(mode, (resolve, reject) => {
            return newScope(() => {
                PSD.trans = trans;
                return fn(resolve, reject, trans);
            });
        }).then(result => {
            return trans._completion.then(() => result);
        });
    }
}

const DEXIE_VERSION = '3.2.0';
const maxString = String.fromCharCode(65535);
const minKey = -Infinity;
const INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
const STRING_EXPECTED = "String expected.";
const connections = [];
const isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
const hasIEDeleteObjectStoreBug = isIEOrEdge;
const hangsOnDeleteLargeKeyRange = isIEOrEdge;
const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
const DBNAMES_DB = '__dbnames';
const READONLY = 'readonly';
const READWRITE = 'readwrite';

function combine(filter1, filter2) {
    return filter1 ?
        filter2 ?
            function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
            filter1 :
        filter2;
}

const AnyRange = {
    type: 3 ,
    lower: -Infinity,
    lowerOpen: false,
    upper: [[]],
    upperOpen: false
};

function workaroundForUndefinedPrimKey(keyPath) {
    return typeof keyPath === "string" && !/\./.test(keyPath)
        ? (obj) => {
            if (obj[keyPath] === undefined && (keyPath in obj)) {
                obj = deepClone(obj);
                delete obj[keyPath];
            }
            return obj;
        }
        : (obj) => obj;
}

class Table {
    _trans(mode, fn, writeLocked) {
        const trans = this._tx || PSD.trans;
        const tableName = this.name;
        function checkTableInTransaction(resolve, reject, trans) {
            if (!trans.schema[tableName])
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans.idbtrans, trans);
        }
        const wasRootExec = beginMicroTickScope();
        try {
            return trans && trans.db === this.db ?
                trans === PSD.trans ?
                    trans._promise(mode, checkTableInTransaction, writeLocked) :
                    newScope(() => trans._promise(mode, checkTableInTransaction, writeLocked), { trans: trans, transless: PSD.transless || PSD }) :
                tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
        }
        finally {
            if (wasRootExec)
                endMicroTickScope();
        }
    }
    get(keyOrCrit, cb) {
        if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
        return this._trans('readonly', (trans) => {
            return this.core.get({ trans, key: keyOrCrit })
                .then(res => this.hook.reading.fire(res));
        }).then(cb);
    }
    where(indexOrCrit) {
        if (typeof indexOrCrit === 'string')
            return new this.db.WhereClause(this, indexOrCrit);
        if (isArray(indexOrCrit))
            return new this.db.WhereClause(this, `[${indexOrCrit.join('+')}]`);
        const keyPaths = keys(indexOrCrit);
        if (keyPaths.length === 1)
            return this
                .where(keyPaths[0])
                .equals(indexOrCrit[keyPaths[0]]);
        const compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(ix => ix.compound &&
            keyPaths.every(keyPath => ix.keyPath.indexOf(keyPath) >= 0) &&
            ix.keyPath.every(keyPath => keyPaths.indexOf(keyPath) >= 0))[0];
        if (compoundIndex && this.db._maxKey !== maxString)
            return this
                .where(compoundIndex.name)
                .equals(compoundIndex.keyPath.map(kp => indexOrCrit[kp]));
        if (!compoundIndex && debug)
            console.warn(`The query ${JSON.stringify(indexOrCrit)} on ${this.name} would benefit of a ` +
                `compound index [${keyPaths.join('+')}]`);
        const { idxByName } = this.schema;
        const idb = this.db._deps.indexedDB;
        function equals(a, b) {
            try {
                return idb.cmp(a, b) === 0;
            }
            catch (e) {
                return false;
            }
        }
        const [idx, filterFunction] = keyPaths.reduce(([prevIndex, prevFilterFn], keyPath) => {
            const index = idxByName[keyPath];
            const value = indexOrCrit[keyPath];
            return [
                prevIndex || index,
                prevIndex || !index ?
                    combine(prevFilterFn, index && index.multi ?
                        x => {
                            const prop = getByKeyPath(x, keyPath);
                            return isArray(prop) && prop.some(item => equals(value, item));
                        } : x => equals(value, getByKeyPath(x, keyPath)))
                    : prevFilterFn
            ];
        }, [null, null]);
        return idx ?
            this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                .filter(filterFunction) :
            compoundIndex ?
                this.filter(filterFunction) :
                this.where(keyPaths).equals('');
    }
    filter(filterFunction) {
        return this.toCollection().and(filterFunction);
    }
    count(thenShortcut) {
        return this.toCollection().count(thenShortcut);
    }
    offset(offset) {
        return this.toCollection().offset(offset);
    }
    limit(numRows) {
        return this.toCollection().limit(numRows);
    }
    each(callback) {
        return this.toCollection().each(callback);
    }
    toArray(thenShortcut) {
        return this.toCollection().toArray(thenShortcut);
    }
    toCollection() {
        return new this.db.Collection(new this.db.WhereClause(this));
    }
    orderBy(index) {
        return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ?
            `[${index.join('+')}]` :
            index));
    }
    reverse() {
        return this.toCollection().reverse();
    }
    mapToClass(constructor) {
        this.schema.mappedClass = constructor;
        const readHook = obj => {
            if (!obj)
                return obj;
            const res = Object.create(constructor.prototype);
            for (var m in obj)
                if (hasOwn(obj, m))
                    try {
                        res[m] = obj[m];
                    }
                    catch (_) { }
            return res;
        };
        if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
        }
        this.schema.readHook = readHook;
        this.hook("reading", readHook);
        return constructor;
    }
    defineClass() {
        function Class(content) {
            extend(this, content);
        }
        return this.mapToClass(Class);
    }
    add(obj, key) {
        const { auto, keyPath } = this.schema.primKey;
        let objToAdd = obj;
        if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
        }
        return this._trans('readwrite', trans => {
            return this.core.mutate({ trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd] });
        }).then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
            .then(lastResult => {
            if (keyPath) {
                try {
                    setByKeyPath(obj, keyPath, lastResult);
                }
                catch (_) { }
            }
            return lastResult;
        });
    }
    update(keyOrObject, modifications) {
        if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
            const key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === undefined)
                return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            try {
                if (typeof modifications !== "function") {
                    keys(modifications).forEach(keyPath => {
                        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                    });
                }
                else {
                    modifications(keyOrObject, { value: keyOrObject, primKey: key });
                }
            }
            catch (_a) {
            }
            return this.where(":id").equals(key).modify(modifications);
        }
        else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
        }
    }
    put(obj, key) {
        const { auto, keyPath } = this.schema.primKey;
        let objToAdd = obj;
        if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
        }
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
            .then(lastResult => {
            if (keyPath) {
                try {
                    setByKeyPath(obj, keyPath, lastResult);
                }
                catch (_) { }
            }
            return lastResult;
        });
    }
    delete(key) {
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'delete', keys: [key] }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
    }
    clear() {
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'deleteRange', range: AnyRange }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
    }
    bulkGet(keys) {
        return this._trans('readonly', trans => {
            return this.core.getMany({
                keys,
                trans
            }).then(result => result.map(res => this.hook.reading.fire(res)));
        });
    }
    bulkAdd(objects, keysOrOptions, options) {
        const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
        options = options || (keys ? undefined : keysOrOptions);
        const wantResults = options ? options.allKeys : undefined;
        return this._trans('readwrite', trans => {
            const { auto, keyPath } = this.schema.primKey;
            if (keyPath && keys)
                throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys && keys.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            const numObjects = objects.length;
            let objectsToAdd = keyPath && auto ?
                objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                objects;
            return this.core.mutate({ trans, type: 'add', keys: keys, values: objectsToAdd, wantResults })
                .then(({ numFailures, results, lastResult, failures }) => {
                const result = wantResults ? results : lastResult;
                if (numFailures === 0)
                    return result;
                throw new BulkError(`${this.name}.bulkAdd(): ${numFailures} of ${numObjects} operations failed`, failures);
            });
        });
    }
    bulkPut(objects, keysOrOptions, options) {
        const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
        options = options || (keys ? undefined : keysOrOptions);
        const wantResults = options ? options.allKeys : undefined;
        return this._trans('readwrite', trans => {
            const { auto, keyPath } = this.schema.primKey;
            if (keyPath && keys)
                throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys && keys.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            const numObjects = objects.length;
            let objectsToPut = keyPath && auto ?
                objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                objects;
            return this.core.mutate({ trans, type: 'put', keys: keys, values: objectsToPut, wantResults })
                .then(({ numFailures, results, lastResult, failures }) => {
                const result = wantResults ? results : lastResult;
                if (numFailures === 0)
                    return result;
                throw new BulkError(`${this.name}.bulkPut(): ${numFailures} of ${numObjects} operations failed`, failures);
            });
        });
    }
    bulkDelete(keys) {
        const numKeys = keys.length;
        return this._trans('readwrite', trans => {
            return this.core.mutate({ trans, type: 'delete', keys: keys });
        }).then(({ numFailures, lastResult, failures }) => {
            if (numFailures === 0)
                return lastResult;
            throw new BulkError(`${this.name}.bulkDelete(): ${numFailures} of ${numKeys} operations failed`, failures);
        });
    }
}

function Events(ctx) {
    var evs = {};
    var rv = function (eventName, subscriber) {
        if (subscriber) {
            var i = arguments.length, args = new Array(i - 1);
            while (--i)
                args[i - 1] = arguments[i];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
        }
        else if (typeof (eventName) === 'string') {
            return evs[eventName];
        }
    };
    rv.addEventType = add;
    for (var i = 1, l = arguments.length; i < l; ++i) {
        add(arguments[i]);
    }
    return rv;
    function add(eventName, chainFunction, defaultFunction) {
        if (typeof eventName === 'object')
            return addConfiguredEvents(eventName);
        if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
        if (!defaultFunction)
            defaultFunction = nop;
        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function (cb) {
                if (context.subscribers.indexOf(cb) === -1) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                }
            },
            unsubscribe: function (cb) {
                context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }
    function addConfiguredEvents(cfg) {
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            }
            else if (args === 'asap') {
                var context = add(eventName, mirror, function fire() {
                    var i = arguments.length, args = new Array(i);
                    while (i--)
                        args[i] = arguments[i];
                    context.subscribers.forEach(function (fn) {
                        asap$1(function fireEvent() {
                            fn.apply(null, args);
                        });
                    });
                });
            }
            else
                throw new exceptions.InvalidArgument("Invalid event config");
        });
    }
}

function makeClassConstructor(prototype, constructor) {
    derive(constructor).from({ prototype });
    return constructor;
}

function createTableConstructor(db) {
    return makeClassConstructor(Table.prototype, function Table(name, tableSchema, trans) {
        this.db = db;
        this._tx = trans;
        this.name = name;
        this.schema = tableSchema;
        this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [hookDeletingChain, nop]
        });
    });
}

function isPlainKeyRange(ctx, ignoreLimitFilter) {
    return !(ctx.filter || ctx.algorithm || ctx.or) &&
        (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
}
function addFilter(ctx, fn) {
    ctx.filter = combine(ctx.filter, fn);
}
function addReplayFilter(ctx, factory, isLimitFilter) {
    var curr = ctx.replayFilter;
    ctx.replayFilter = curr ? () => combine(curr(), factory()) : factory;
    ctx.justLimit = isLimitFilter && !curr;
}
function addMatchFilter(ctx, fn) {
    ctx.isMatch = combine(ctx.isMatch, fn);
}
function getIndexOrStore(ctx, coreSchema) {
    if (ctx.isPrimKey)
        return coreSchema.primaryKey;
    const index = coreSchema.getIndexByKeyPath(ctx.index);
    if (!index)
        throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
    return index;
}
function openCursor(ctx, coreTable, trans) {
    const index = getIndexOrStore(ctx, coreTable.schema);
    return coreTable.openCursor({
        trans,
        values: !ctx.keysOnly,
        reverse: ctx.dir === 'prev',
        unique: !!ctx.unique,
        query: {
            index,
            range: ctx.range
        }
    });
}
function iter(ctx, fn, coreTrans, coreTable) {
    const filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
    if (!ctx.or) {
        return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
    }
    else {
        const set = {};
        const union = (item, cursor, advance) => {
            if (!filter || filter(cursor, advance, result => cursor.stop(result), err => cursor.fail(err))) {
                var primaryKey = cursor.primaryKey;
                var key = '' + primaryKey;
                if (key === '[object ArrayBuffer]')
                    key = '' + new Uint8Array(primaryKey);
                if (!hasOwn(set, key)) {
                    set[key] = true;
                    fn(item, cursor, advance);
                }
            }
        };
        return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
        ]);
    }
}
function iterate(cursorPromise, filter, fn, valueMapper) {
    var mappedFn = valueMapper ? (x, c, a) => fn(valueMapper(x), c, a) : fn;
    var wrappedFn = wrap(mappedFn);
    return cursorPromise.then(cursor => {
        if (cursor) {
            return cursor.start(() => {
                var c = () => cursor.continue();
                if (!filter || filter(cursor, advancer => c = advancer, val => { cursor.stop(val); c = nop; }, e => { cursor.fail(e); c = nop; }))
                    wrappedFn(cursor.value, cursor, advancer => c = advancer);
                c();
            });
        }
    });
}

function cmp(a, b) {
    try {
        const ta = type(a);
        const tb = type(b);
        if (ta !== tb) {
            if (ta === 'Array')
                return 1;
            if (tb === 'Array')
                return -1;
            if (ta === 'binary')
                return 1;
            if (tb === 'binary')
                return -1;
            if (ta === 'string')
                return 1;
            if (tb === 'string')
                return -1;
            if (ta === 'Date')
                return 1;
            if (tb !== 'Date')
                return NaN;
            return -1;
        }
        switch (ta) {
            case 'number':
            case 'Date':
            case 'string':
                return a > b ? 1 : a < b ? -1 : 0;
            case 'binary': {
                return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case 'Array':
                return compareArrays(a, b);
        }
    }
    catch (_a) { }
    return NaN;
}
function compareArrays(a, b) {
    const al = a.length;
    const bl = b.length;
    const l = al < bl ? al : bl;
    for (let i = 0; i < l; ++i) {
        const res = cmp(a[i], b[i]);
        if (res !== 0)
            return res;
    }
    return al === bl ? 0 : al < bl ? -1 : 1;
}
function compareUint8Arrays(a, b) {
    const al = a.length;
    const bl = b.length;
    const l = al < bl ? al : bl;
    for (let i = 0; i < l; ++i) {
        if (a[i] !== b[i])
            return a[i] < b[i] ? -1 : 1;
    }
    return al === bl ? 0 : al < bl ? -1 : 1;
}
function type(x) {
    const t = typeof x;
    if (t !== 'object')
        return t;
    if (ArrayBuffer.isView(x))
        return 'binary';
    const tsTag = toStringTag(x);
    return tsTag === 'ArrayBuffer' ? 'binary' : tsTag;
}
function getUint8Array(a) {
    if (a instanceof Uint8Array)
        return a;
    if (ArrayBuffer.isView(a))
        return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    return new Uint8Array(a);
}

class Collection {
    _read(fn, cb) {
        var ctx = this._ctx;
        return ctx.error ?
            ctx.table._trans(null, rejection.bind(null, ctx.error)) :
            ctx.table._trans('readonly', fn).then(cb);
    }
    _write(fn) {
        var ctx = this._ctx;
        return ctx.error ?
            ctx.table._trans(null, rejection.bind(null, ctx.error)) :
            ctx.table._trans('readwrite', fn, "locked");
    }
    _addAlgorithm(fn) {
        var ctx = this._ctx;
        ctx.algorithm = combine(ctx.algorithm, fn);
    }
    _iterate(fn, coreTrans) {
        return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
    }
    clone(props) {
        var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
        if (props)
            extend(ctx, props);
        rv._ctx = ctx;
        return rv;
    }
    raw() {
        this._ctx.valueMapper = null;
        return this;
    }
    each(fn) {
        var ctx = this._ctx;
        return this._read(trans => iter(ctx, fn, trans, ctx.table.core));
    }
    count(cb) {
        return this._read(trans => {
            const ctx = this._ctx;
            const coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
                return coreTable.count({
                    trans,
                    query: {
                        index: getIndexOrStore(ctx, coreTable.schema),
                        range: ctx.range
                    }
                }).then(count => Math.min(count, ctx.limit));
            }
            else {
                var count = 0;
                return iter(ctx, () => { ++count; return false; }, trans, coreTable)
                    .then(() => count);
            }
        }).then(cb);
    }
    sortBy(keyPath, cb) {
        const parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
        function getval(obj, i) {
            if (i)
                return getval(obj[parts[i]], i - 1);
            return obj[lastPart];
        }
        var order = this._ctx.dir === "next" ? 1 : -1;
        function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return aVal < bVal ? -order : aVal > bVal ? order : 0;
        }
        return this.toArray(function (a) {
            return a.sort(sorter);
        }).then(cb);
    }
    toArray(cb) {
        return this._read(trans => {
            var ctx = this._ctx;
            if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                const { valueMapper } = ctx;
                const index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                    trans,
                    limit: ctx.limit,
                    values: true,
                    query: {
                        index,
                        range: ctx.range
                    }
                }).then(({ result }) => valueMapper ? result.map(valueMapper) : result);
            }
            else {
                const a = [];
                return iter(ctx, item => a.push(item), trans, ctx.table.core).then(() => a);
            }
        }, cb);
    }
    offset(offset) {
        var ctx = this._ctx;
        if (offset <= 0)
            return this;
        ctx.offset += offset;
        if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, () => {
                var offsetLeft = offset;
                return (cursor, advance) => {
                    if (offsetLeft === 0)
                        return true;
                    if (offsetLeft === 1) {
                        --offsetLeft;
                        return false;
                    }
                    advance(() => {
                        cursor.advance(offsetLeft);
                        offsetLeft = 0;
                    });
                    return false;
                };
            });
        }
        else {
            addReplayFilter(ctx, () => {
                var offsetLeft = offset;
                return () => (--offsetLeft < 0);
            });
        }
        return this;
    }
    limit(numRows) {
        this._ctx.limit = Math.min(this._ctx.limit, numRows);
        addReplayFilter(this._ctx, () => {
            var rowsLeft = numRows;
            return function (cursor, advance, resolve) {
                if (--rowsLeft <= 0)
                    advance(resolve);
                return rowsLeft >= 0;
            };
        }, true);
        return this;
    }
    until(filterFunction, bIncludeStopEntry) {
        addFilter(this._ctx, function (cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
                advance(resolve);
                return bIncludeStopEntry;
            }
            else {
                return true;
            }
        });
        return this;
    }
    first(cb) {
        return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
    }
    last(cb) {
        return this.reverse().first(cb);
    }
    filter(filterFunction) {
        addFilter(this._ctx, function (cursor) {
            return filterFunction(cursor.value);
        });
        addMatchFilter(this._ctx, filterFunction);
        return this;
    }
    and(filter) {
        return this.filter(filter);
    }
    or(indexName) {
        return new this.db.WhereClause(this._ctx.table, indexName, this);
    }
    reverse() {
        this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
        if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
        return this;
    }
    desc() {
        return this.reverse();
    }
    eachKey(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) { cb(cursor.key, cursor); });
    }
    eachUniqueKey(cb) {
        this._ctx.unique = "unique";
        return this.eachKey(cb);
    }
    eachPrimaryKey(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
    }
    keys(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
            a.push(cursor.key);
        }).then(function () {
            return a;
        }).then(cb);
    }
    primaryKeys(cb) {
        var ctx = this._ctx;
        if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(trans => {
                var index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                    trans,
                    values: false,
                    limit: ctx.limit,
                    query: {
                        index,
                        range: ctx.range
                    }
                });
            }).then(({ result }) => result).then(cb);
        }
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
            a.push(cursor.primaryKey);
        }).then(function () {
            return a;
        }).then(cb);
    }
    uniqueKeys(cb) {
        this._ctx.unique = "unique";
        return this.keys(cb);
    }
    firstKey(cb) {
        return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
    }
    lastKey(cb) {
        return this.reverse().firstKey(cb);
    }
    distinct() {
        var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
        if (!idx || !idx.multi)
            return this;
        var set = {};
        addFilter(this._ctx, function (cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn(set, strKey);
            set[strKey] = true;
            return !found;
        });
        return this;
    }
    modify(changes) {
        var ctx = this._ctx;
        return this._write(trans => {
            var modifyer;
            if (typeof changes === 'function') {
                modifyer = changes;
            }
            else {
                var keyPaths = keys(changes);
                var numKeys = keyPaths.length;
                modifyer = function (item) {
                    var anythingModified = false;
                    for (var i = 0; i < numKeys; ++i) {
                        var keyPath = keyPaths[i], val = changes[keyPath];
                        if (getByKeyPath(item, keyPath) !== val) {
                            setByKeyPath(item, keyPath, val);
                            anythingModified = true;
                        }
                    }
                    return anythingModified;
                };
            }
            const coreTable = ctx.table.core;
            const { outbound, extractKey } = coreTable.schema.primaryKey;
            const limit = this.db._options.modifyChunkSize || 200;
            const totalFailures = [];
            let successCount = 0;
            const failedKeys = [];
            const applyMutateResult = (expectedCount, res) => {
                const { failures, numFailures } = res;
                successCount += expectedCount - numFailures;
                for (let pos of keys(failures)) {
                    totalFailures.push(failures[pos]);
                }
            };
            return this.clone().primaryKeys().then(keys => {
                const nextChunk = (offset) => {
                    const count = Math.min(limit, keys.length - offset);
                    return coreTable.getMany({
                        trans,
                        keys: keys.slice(offset, offset + count),
                        cache: "immutable"
                    }).then(values => {
                        const addValues = [];
                        const putValues = [];
                        const putKeys = outbound ? [] : null;
                        const deleteKeys = [];
                        for (let i = 0; i < count; ++i) {
                            const origValue = values[i];
                            const ctx = {
                                value: deepClone(origValue),
                                primKey: keys[offset + i]
                            };
                            if (modifyer.call(ctx, ctx.value, ctx) !== false) {
                                if (ctx.value == null) {
                                    deleteKeys.push(keys[offset + i]);
                                }
                                else if (!outbound && cmp(extractKey(origValue), extractKey(ctx.value)) !== 0) {
                                    deleteKeys.push(keys[offset + i]);
                                    addValues.push(ctx.value);
                                }
                                else {
                                    putValues.push(ctx.value);
                                    if (outbound)
                                        putKeys.push(keys[offset + i]);
                                }
                            }
                        }
                        const criteria = isPlainKeyRange(ctx) &&
                            ctx.limit === Infinity &&
                            (typeof changes !== 'function' || changes === deleteCallback) && {
                            index: ctx.index,
                            range: ctx.range
                        };
                        return Promise.resolve(addValues.length > 0 &&
                            coreTable.mutate({ trans, type: 'add', values: addValues })
                                .then(res => {
                                for (let pos in res.failures) {
                                    deleteKeys.splice(parseInt(pos), 1);
                                }
                                applyMutateResult(addValues.length, res);
                            })).then(() => (putValues.length > 0 || (criteria && typeof changes === 'object')) &&
                            coreTable.mutate({
                                trans,
                                type: 'put',
                                keys: putKeys,
                                values: putValues,
                                criteria,
                                changeSpec: typeof changes !== 'function'
                                    && changes
                            }).then(res => applyMutateResult(putValues.length, res))).then(() => (deleteKeys.length > 0 || (criteria && changes === deleteCallback)) &&
                            coreTable.mutate({
                                trans,
                                type: 'delete',
                                keys: deleteKeys,
                                criteria
                            }).then(res => applyMutateResult(deleteKeys.length, res))).then(() => {
                            return keys.length > offset + count && nextChunk(offset + limit);
                        });
                    });
                };
                return nextChunk(0).then(() => {
                    if (totalFailures.length > 0)
                        throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                    return keys.length;
                });
            });
        });
    }
    delete() {
        var ctx = this._ctx, range = ctx.range;
        if (isPlainKeyRange(ctx) &&
            ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || range.type === 3 ))
         {
            return this._write(trans => {
                const { primaryKey } = ctx.table.core.schema;
                const coreRange = range;
                return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(count => {
                    return ctx.table.core.mutate({ trans, type: 'deleteRange', range: coreRange })
                        .then(({ failures, lastResult, results, numFailures }) => {
                        if (numFailures)
                            throw new ModifyError("Could not delete some values", Object.keys(failures).map(pos => failures[pos]), count - numFailures);
                        return count - numFailures;
                    });
                });
            });
        }
        return this.modify(deleteCallback);
    }
}
const deleteCallback = (value, ctx) => ctx.value = null;

function createCollectionConstructor(db) {
    return makeClassConstructor(Collection.prototype, function Collection(whereClause, keyRangeGenerator) {
        this.db = db;
        let keyRange = AnyRange, error = null;
        if (keyRangeGenerator)
            try {
                keyRange = keyRangeGenerator();
            }
            catch (ex) {
                error = ex;
            }
        const whereCtx = whereClause._ctx;
        const table = whereCtx.table;
        const readingHook = table.hook.reading.fire;
        this._ctx = {
            table: table,
            index: whereCtx.index,
            isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
        };
    });
}

function simpleCompare(a, b) {
    return a < b ? -1 : a === b ? 0 : 1;
}
function simpleCompareReverse(a, b) {
    return a > b ? -1 : a === b ? 0 : 1;
}

function fail(collectionOrWhereClause, err, T) {
    var collection = collectionOrWhereClause instanceof WhereClause ?
        new collectionOrWhereClause.Collection(collectionOrWhereClause) :
        collectionOrWhereClause;
    collection._ctx.error = T ? new T(err) : new TypeError(err);
    return collection;
}
function emptyCollection(whereClause) {
    return new whereClause.Collection(whereClause, () => rangeEqual("")).limit(0);
}
function upperFactory(dir) {
    return dir === "next" ?
        (s) => s.toUpperCase() :
        (s) => s.toLowerCase();
}
function lowerFactory(dir) {
    return dir === "next" ?
        (s) => s.toLowerCase() :
        (s) => s.toUpperCase();
}
function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
    var length = Math.min(key.length, lowerNeedle.length);
    var llp = -1;
    for (var i = 0; i < length; ++i) {
        var lwrKeyChar = lowerKey[i];
        if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp(key[i], upperNeedle[i]) < 0)
                return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp(key[i], lowerNeedle[i]) < 0)
                return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0)
                return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
        }
        if (cmp(key[i], lwrKeyChar) < 0)
            llp = i;
    }
    if (length < lowerNeedle.length && dir === "next")
        return key + upperNeedle.substr(key.length);
    if (length < key.length && dir === "prev")
        return key.substr(0, upperNeedle.length);
    return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
}
function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
    var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
    if (!needles.every(s => typeof s === 'string')) {
        return fail(whereClause, STRING_EXPECTED);
    }
    function initDirection(dir) {
        upper = upperFactory(dir);
        lower = lowerFactory(dir);
        compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
        var needleBounds = needles.map(function (needle) {
            return { lower: lower(needle), upper: upper(needle) };
        }).sort(function (a, b) {
            return compare(a.lower, b.lower);
        });
        upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
        lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
        direction = dir;
        nextKeySuffix = (dir === "next" ? "" : suffix);
    }
    initDirection("next");
    var c = new whereClause.Collection(whereClause, () => createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix));
    c._ondirectionchange = function (direction) {
        initDirection(direction);
    };
    var firstPossibleNeedle = 0;
    c._addAlgorithm(function (cursor, advance, resolve) {
        var key = cursor.key;
        if (typeof key !== 'string')
            return false;
        var lowerKey = lower(key);
        if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
        }
        else {
            var lowestPossibleCasing = null;
            for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                if (casing === null && lowestPossibleCasing === null)
                    firstPossibleNeedle = i + 1;
                else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                    lowestPossibleCasing = casing;
                }
            }
            if (lowestPossibleCasing !== null) {
                advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
            }
            else {
                advance(resolve);
            }
            return false;
        }
    });
    return c;
}
function createRange(lower, upper, lowerOpen, upperOpen) {
    return {
        type: 2 ,
        lower,
        upper,
        lowerOpen,
        upperOpen
    };
}
function rangeEqual(value) {
    return {
        type: 1 ,
        lower: value,
        upper: value
    };
}

class WhereClause {
    get Collection() {
        return this._ctx.table.db.Collection;
    }
    between(lower, upper, includeLower, includeUpper) {
        includeLower = includeLower !== false;
        includeUpper = includeUpper === true;
        try {
            if ((this._cmp(lower, upper) > 0) ||
                (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                return emptyCollection(this);
            return new this.Collection(this, () => createRange(lower, upper, !includeLower, !includeUpper));
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
    }
    equals(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => rangeEqual(value));
    }
    above(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(value, undefined, true));
    }
    aboveOrEqual(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(value, undefined, false));
    }
    below(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(undefined, value, false, true));
    }
    belowOrEqual(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(undefined, value));
    }
    startsWith(str) {
        if (typeof str !== 'string')
            return fail(this, STRING_EXPECTED);
        return this.between(str, str + maxString, true, true);
    }
    startsWithIgnoreCase(str) {
        if (str === "")
            return this.startsWith(str);
        return addIgnoreCaseAlgorithm(this, (x, a) => x.indexOf(a[0]) === 0, [str], maxString);
    }
    equalsIgnoreCase(str) {
        return addIgnoreCaseAlgorithm(this, (x, a) => x === a[0], [str], "");
    }
    anyOfIgnoreCase() {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, (x, a) => a.indexOf(x) !== -1, set, "");
    }
    startsWithAnyOfIgnoreCase() {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, (x, a) => a.some(n => x.indexOf(n) === 0), set, maxString);
    }
    anyOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        let compare = this._cmp;
        try {
            set.sort(compare);
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        if (set.length === 0)
            return emptyCollection(this);
        const c = new this.Collection(this, () => createRange(set[0], set[set.length - 1]));
        c._ondirectionchange = direction => {
            compare = (direction === "next" ?
                this._ascending :
                this._descending);
            set.sort(compare);
        };
        let i = 0;
        c._addAlgorithm((cursor, advance, resolve) => {
            const key = cursor.key;
            while (compare(key, set[i]) > 0) {
                ++i;
                if (i === set.length) {
                    advance(resolve);
                    return false;
                }
            }
            if (compare(key, set[i]) === 0) {
                return true;
            }
            else {
                advance(() => { cursor.continue(set[i]); });
                return false;
            }
        });
        return c;
    }
    notEqual(value) {
        return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
    }
    noneOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return new this.Collection(this);
        try {
            set.sort(this._ascending);
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        const ranges = set.reduce((res, val) => res ?
            res.concat([[res[res.length - 1][1], val]]) :
            [[minKey, val]], null);
        ranges.push([set[set.length - 1], this.db._maxKey]);
        return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
    }
    inAnyRange(ranges, options) {
        const cmp = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
        if (ranges.length === 0)
            return emptyCollection(this);
        if (!ranges.every(range => range[0] !== undefined &&
            range[1] !== undefined &&
            ascending(range[0], range[1]) <= 0)) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
        }
        const includeLowers = !options || options.includeLowers !== false;
        const includeUppers = options && options.includeUppers === true;
        function addRange(ranges, newRange) {
            let i = 0, l = ranges.length;
            for (; i < l; ++i) {
                const range = ranges[i];
                if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                    range[0] = min(range[0], newRange[0]);
                    range[1] = max(range[1], newRange[1]);
                    break;
                }
            }
            if (i === l)
                ranges.push(newRange);
            return ranges;
        }
        let sortDirection = ascending;
        function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
        let set;
        try {
            set = ranges.reduce(addRange, []);
            set.sort(rangeSorter);
        }
        catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        let rangePos = 0;
        const keyIsBeyondCurrentEntry = includeUppers ?
            key => ascending(key, set[rangePos][1]) > 0 :
            key => ascending(key, set[rangePos][1]) >= 0;
        const keyIsBeforeCurrentEntry = includeLowers ?
            key => descending(key, set[rangePos][0]) > 0 :
            key => descending(key, set[rangePos][0]) >= 0;
        function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
        }
        let checkKey = keyIsBeyondCurrentEntry;
        const c = new this.Collection(this, () => createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers));
        c._ondirectionchange = direction => {
            if (direction === "next") {
                checkKey = keyIsBeyondCurrentEntry;
                sortDirection = ascending;
            }
            else {
                checkKey = keyIsBeforeCurrentEntry;
                sortDirection = descending;
            }
            set.sort(rangeSorter);
        };
        c._addAlgorithm((cursor, advance, resolve) => {
            var key = cursor.key;
            while (checkKey(key)) {
                ++rangePos;
                if (rangePos === set.length) {
                    advance(resolve);
                    return false;
                }
            }
            if (keyWithinCurrentRange(key)) {
                return true;
            }
            else if (this._cmp(key, set[rangePos][1]) === 0 || this._cmp(key, set[rangePos][0]) === 0) {
                return false;
            }
            else {
                advance(() => {
                    if (sortDirection === ascending)
                        cursor.continue(set[rangePos][0]);
                    else
                        cursor.continue(set[rangePos][1]);
                });
                return false;
            }
        });
        return c;
    }
    startsWithAnyOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (!set.every(s => typeof s === 'string')) {
            return fail(this, "startsWithAnyOf() only works with strings");
        }
        if (set.length === 0)
            return emptyCollection(this);
        return this.inAnyRange(set.map((str) => [str, str + maxString]));
    }
}

function createWhereClauseConstructor(db) {
    return makeClassConstructor(WhereClause.prototype, function WhereClause(table, index, orCollection) {
        this.db = db;
        this._ctx = {
            table: table,
            index: index === ":id" ? null : index,
            or: orCollection
        };
        const indexedDB = db._deps.indexedDB;
        if (!indexedDB)
            throw new exceptions.MissingAPI();
        this._cmp = this._ascending = indexedDB.cmp.bind(indexedDB);
        this._descending = (a, b) => indexedDB.cmp(b, a);
        this._max = (a, b) => indexedDB.cmp(a, b) > 0 ? a : b;
        this._min = (a, b) => indexedDB.cmp(a, b) < 0 ? a : b;
        this._IDBKeyRange = db._deps.IDBKeyRange;
    });
}

function eventRejectHandler(reject) {
    return wrap(function (event) {
        preventDefault(event);
        reject(event.target.error);
        return false;
    });
}
function preventDefault(event) {
    if (event.stopPropagation)
        event.stopPropagation();
    if (event.preventDefault)
        event.preventDefault();
}

const DEXIE_STORAGE_MUTATED_EVENT_NAME = 'storagemutated';
const STORAGE_MUTATED_DOM_EVENT_NAME = 'x-storagemutated-1';
const globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);

class Transaction {
    _lock() {
        assert(!PSD.global);
        ++this._reculock;
        if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
        return this;
    }
    _unlock() {
        assert(!PSD.global);
        if (--this._reculock === 0) {
            if (!PSD.global)
                PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
                var fnAndPSD = this._blockedFuncs.shift();
                try {
                    usePSD(fnAndPSD[1], fnAndPSD[0]);
                }
                catch (e) { }
            }
        }
        return this;
    }
    _locked() {
        return this._reculock && PSD.lockOwnerFor !== this;
    }
    create(idbtrans) {
        if (!this.mode)
            return this;
        const idbdb = this.db.idbdb;
        const dbOpenError = this.db._state.dbOpenError;
        assert(!this.idbtrans);
        if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
                case "DatabaseClosedError":
                    throw new exceptions.DatabaseClosed(dbOpenError);
                case "MissingAPIError":
                    throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                default:
                    throw new exceptions.OpenFailed(dbOpenError);
            }
        }
        if (!this.active)
            throw new exceptions.TransactionInactive();
        assert(this._completion._state === null);
        idbtrans = this.idbtrans = idbtrans ||
            (this.db.core
                ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })
                : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
        idbtrans.onerror = wrap(ev => {
            preventDefault(ev);
            this._reject(idbtrans.error);
        });
        idbtrans.onabort = wrap(ev => {
            preventDefault(ev);
            this.active && this._reject(new exceptions.Abort(idbtrans.error));
            this.active = false;
            this.on("abort").fire(ev);
        });
        idbtrans.oncomplete = wrap(() => {
            this.active = false;
            this._resolve();
            if ('mutatedParts' in idbtrans) {
                globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
        });
        return this;
    }
    _promise(mode, fn, bWriteLock) {
        if (mode === 'readwrite' && this.mode !== 'readwrite')
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
        if (!this.active)
            return rejection(new exceptions.TransactionInactive());
        if (this._locked()) {
            return new DexiePromise((resolve, reject) => {
                this._blockedFuncs.push([() => {
                        this._promise(mode, fn, bWriteLock).then(resolve, reject);
                    }, PSD]);
            });
        }
        else if (bWriteLock) {
            return newScope(() => {
                var p = new DexiePromise((resolve, reject) => {
                    this._lock();
                    const rv = fn(resolve, reject, this);
                    if (rv && rv.then)
                        rv.then(resolve, reject);
                });
                p.finally(() => this._unlock());
                p._lib = true;
                return p;
            });
        }
        else {
            var p = new DexiePromise((resolve, reject) => {
                var rv = fn(resolve, reject, this);
                if (rv && rv.then)
                    rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
        }
    }
    _root() {
        return this.parent ? this.parent._root() : this;
    }
    waitFor(promiseLike) {
        var root = this._root();
        const promise = DexiePromise.resolve(promiseLike);
        if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(() => promise);
        }
        else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
                ++root._spinCount;
                while (root._waitingQueue.length)
                    (root._waitingQueue.shift())();
                if (root._waitingFor)
                    store.get(-Infinity).onsuccess = spin;
            }());
        }
        var currentWaitPromise = root._waitingFor;
        return new DexiePromise((resolve, reject) => {
            promise.then(res => root._waitingQueue.push(wrap(resolve.bind(null, res))), err => root._waitingQueue.push(wrap(reject.bind(null, err)))).finally(() => {
                if (root._waitingFor === currentWaitPromise) {
                    root._waitingFor = null;
                }
            });
        });
    }
    abort() {
        if (this.active) {
            this.active = false;
            if (this.idbtrans)
                this.idbtrans.abort();
            this._reject(new exceptions.Abort());
        }
    }
    table(tableName) {
        const memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
        if (hasOwn(memoizedTables, tableName))
            return memoizedTables[tableName];
        const tableSchema = this.schema[tableName];
        if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
        }
        const transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
        transactionBoundTable.core = this.db.core.table(tableName);
        memoizedTables[tableName] = transactionBoundTable;
        return transactionBoundTable;
    }
}

function createTransactionConstructor(db) {
    return makeClassConstructor(Transaction.prototype, function Transaction(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
        this.db = db;
        this.mode = mode;
        this.storeNames = storeNames;
        this.schema = dbschema;
        this.chromeTransactionDurability = chromeTransactionDurability;
        this.idbtrans = null;
        this.on = Events(this, "complete", "error", "abort");
        this.parent = parent || null;
        this.active = true;
        this._reculock = 0;
        this._blockedFuncs = [];
        this._resolve = null;
        this._reject = null;
        this._waitingFor = null;
        this._waitingQueue = null;
        this._spinCount = 0;
        this._completion = new DexiePromise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this._completion.then(() => {
            this.active = false;
            this.on.complete.fire();
        }, e => {
            var wasActive = this.active;
            this.active = false;
            this.on.error.fire(e);
            this.parent ?
                this.parent._reject(e) :
                wasActive && this.idbtrans && this.idbtrans.abort();
            return rejection(e);
        });
    });
}

function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
    return {
        name,
        keyPath,
        unique,
        multi,
        auto,
        compound,
        src: (unique && !isPrimKey ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
    };
}
function nameFromKeyPath(keyPath) {
    return typeof keyPath === 'string' ?
        keyPath :
        keyPath ? ('[' + [].join.call(keyPath, '+') + ']') : "";
}

function createTableSchema(name, primKey, indexes) {
    return {
        name,
        primKey,
        indexes,
        mappedClass: null,
        idxByName: arrayToObject(indexes, index => [index.name, index])
    };
}

function safariMultiStoreFix(storeNames) {
    return storeNames.length === 1 ? storeNames[0] : storeNames;
}
let getMaxKey = (IdbKeyRange) => {
    try {
        IdbKeyRange.only([[]]);
        getMaxKey = () => [[]];
        return [[]];
    }
    catch (e) {
        getMaxKey = () => maxString;
        return maxString;
    }
};

function getKeyExtractor(keyPath) {
    if (keyPath == null) {
        return () => undefined;
    }
    else if (typeof keyPath === 'string') {
        return getSinglePathKeyExtractor(keyPath);
    }
    else {
        return obj => getByKeyPath(obj, keyPath);
    }
}
function getSinglePathKeyExtractor(keyPath) {
    const split = keyPath.split('.');
    if (split.length === 1) {
        return obj => obj[keyPath];
    }
    else {
        return obj => getByKeyPath(obj, keyPath);
    }
}

function arrayify(arrayLike) {
    return [].slice.call(arrayLike);
}
let _id_counter = 0;
function getKeyPathAlias(keyPath) {
    return keyPath == null ?
        ":id" :
        typeof keyPath === 'string' ?
            keyPath :
            `[${keyPath.join('+')}]`;
}
function createDBCore(db, IdbKeyRange, tmpTrans) {
    function extractSchema(db, trans) {
        const tables = arrayify(db.objectStoreNames);
        return {
            schema: {
                name: db.name,
                tables: tables.map(table => trans.objectStore(table)).map(store => {
                    const { keyPath, autoIncrement } = store;
                    const compound = isArray(keyPath);
                    const outbound = keyPath == null;
                    const indexByKeyPath = {};
                    const result = {
                        name: store.name,
                        primaryKey: {
                            name: null,
                            isPrimaryKey: true,
                            outbound,
                            compound,
                            keyPath,
                            autoIncrement,
                            unique: true,
                            extractKey: getKeyExtractor(keyPath)
                        },
                        indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
                            .map(index => {
                            const { name, unique, multiEntry, keyPath } = index;
                            const compound = isArray(keyPath);
                            const result = {
                                name,
                                compound,
                                keyPath,
                                unique,
                                multiEntry,
                                extractKey: getKeyExtractor(keyPath)
                            };
                            indexByKeyPath[getKeyPathAlias(keyPath)] = result;
                            return result;
                        }),
                        getIndexByKeyPath: (keyPath) => indexByKeyPath[getKeyPathAlias(keyPath)]
                    };
                    indexByKeyPath[":id"] = result.primaryKey;
                    if (keyPath != null) {
                        indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                    }
                    return result;
                })
            },
            hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
                !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
                    !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                    [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
        };
    }
    function makeIDBKeyRange(range) {
        if (range.type === 3 )
            return null;
        if (range.type === 4 )
            throw new Error("Cannot convert never type to IDBKeyRange");
        const { lower, upper, lowerOpen, upperOpen } = range;
        const idbRange = lower === undefined ?
            upper === undefined ?
                null :
                IdbKeyRange.upperBound(upper, !!upperOpen) :
            upper === undefined ?
                IdbKeyRange.lowerBound(lower, !!lowerOpen) :
                IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
        return idbRange;
    }
    function createDbCoreTable(tableSchema) {
        const tableName = tableSchema.name;
        function mutate({ trans, type, keys, values, range }) {
            return new Promise((resolve, reject) => {
                resolve = wrap(resolve);
                const store = trans.objectStore(tableName);
                const outbound = store.keyPath == null;
                const isAddOrPut = type === "put" || type === "add";
                if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
                    throw new Error("Invalid operation type: " + type);
                const { length } = keys || values || { length: 1 };
                if (keys && values && keys.length !== values.length) {
                    throw new Error("Given keys array must have same length as given values array.");
                }
                if (length === 0)
                    return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
                let req;
                const reqs = [];
                const failures = [];
                let numFailures = 0;
                const errorHandler = event => {
                    ++numFailures;
                    preventDefault(event);
                };
                if (type === 'deleteRange') {
                    if (range.type === 4 )
                        return resolve({ numFailures, failures, results: [], lastResult: undefined });
                    if (range.type === 3 )
                        reqs.push(req = store.clear());
                    else
                        reqs.push(req = store.delete(makeIDBKeyRange(range)));
                }
                else {
                    const [args1, args2] = isAddOrPut ?
                        outbound ?
                            [values, keys] :
                            [values, null] :
                        [keys, null];
                    if (isAddOrPut) {
                        for (let i = 0; i < length; ++i) {
                            reqs.push(req = (args2 && args2[i] !== undefined ?
                                store[type](args1[i], args2[i]) :
                                store[type](args1[i])));
                            req.onerror = errorHandler;
                        }
                    }
                    else {
                        for (let i = 0; i < length; ++i) {
                            reqs.push(req = store[type](args1[i]));
                            req.onerror = errorHandler;
                        }
                    }
                }
                const done = event => {
                    const lastResult = event.target.result;
                    reqs.forEach((req, i) => req.error != null && (failures[i] = req.error));
                    resolve({
                        numFailures,
                        failures,
                        results: type === "delete" ? keys : reqs.map(req => req.result),
                        lastResult
                    });
                };
                req.onerror = event => {
                    errorHandler(event);
                    done(event);
                };
                req.onsuccess = done;
            });
        }
        function openCursor({ trans, values, query, reverse, unique }) {
            return new Promise((resolve, reject) => {
                resolve = wrap(resolve);
                const { index, range } = query;
                const store = trans.objectStore(tableName);
                const source = index.isPrimaryKey ?
                    store :
                    store.index(index.name);
                const direction = reverse ?
                    unique ?
                        "prevunique" :
                        "prev" :
                    unique ?
                        "nextunique" :
                        "next";
                const req = values || !('openKeyCursor' in source) ?
                    source.openCursor(makeIDBKeyRange(range), direction) :
                    source.openKeyCursor(makeIDBKeyRange(range), direction);
                req.onerror = eventRejectHandler(reject);
                req.onsuccess = wrap(ev => {
                    const cursor = req.result;
                    if (!cursor) {
                        resolve(null);
                        return;
                    }
                    cursor.___id = ++_id_counter;
                    cursor.done = false;
                    const _cursorContinue = cursor.continue.bind(cursor);
                    let _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                    if (_cursorContinuePrimaryKey)
                        _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                    const _cursorAdvance = cursor.advance.bind(cursor);
                    const doThrowCursorIsNotStarted = () => { throw new Error("Cursor not started"); };
                    const doThrowCursorIsStopped = () => { throw new Error("Cursor not stopped"); };
                    cursor.trans = trans;
                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                    cursor.fail = wrap(reject);
                    cursor.next = function () {
                        let gotOne = 1;
                        return this.start(() => gotOne-- ? this.continue() : this.stop()).then(() => this);
                    };
                    cursor.start = (callback) => {
                        const iterationPromise = new Promise((resolveIteration, rejectIteration) => {
                            resolveIteration = wrap(resolveIteration);
                            req.onerror = eventRejectHandler(rejectIteration);
                            cursor.fail = rejectIteration;
                            cursor.stop = value => {
                                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                                resolveIteration(value);
                            };
                        });
                        const guardedCallback = () => {
                            if (req.result) {
                                try {
                                    callback();
                                }
                                catch (err) {
                                    cursor.fail(err);
                                }
                            }
                            else {
                                cursor.done = true;
                                cursor.start = () => { throw new Error("Cursor behind last entry"); };
                                cursor.stop();
                            }
                        };
                        req.onsuccess = wrap(ev => {
                            req.onsuccess = guardedCallback;
                            guardedCallback();
                        });
                        cursor.continue = _cursorContinue;
                        cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                        cursor.advance = _cursorAdvance;
                        guardedCallback();
                        return iterationPromise;
                    };
                    resolve(cursor);
                }, reject);
            });
        }
        function query(hasGetAll) {
            return (request) => {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const { trans, values, limit, query } = request;
                    const nonInfinitLimit = limit === Infinity ? undefined : limit;
                    const { index, range } = query;
                    const store = trans.objectStore(tableName);
                    const source = index.isPrimaryKey ? store : store.index(index.name);
                    const idbKeyRange = makeIDBKeyRange(range);
                    if (limit === 0)
                        return resolve({ result: [] });
                    if (hasGetAll) {
                        const req = values ?
                            source.getAll(idbKeyRange, nonInfinitLimit) :
                            source.getAllKeys(idbKeyRange, nonInfinitLimit);
                        req.onsuccess = event => resolve({ result: event.target.result });
                        req.onerror = eventRejectHandler(reject);
                    }
                    else {
                        let count = 0;
                        const req = values || !('openKeyCursor' in source) ?
                            source.openCursor(idbKeyRange) :
                            source.openKeyCursor(idbKeyRange);
                        const result = [];
                        req.onsuccess = event => {
                            const cursor = req.result;
                            if (!cursor)
                                return resolve({ result });
                            result.push(values ? cursor.value : cursor.primaryKey);
                            if (++count === limit)
                                return resolve({ result });
                            cursor.continue();
                        };
                        req.onerror = eventRejectHandler(reject);
                    }
                });
            };
        }
        return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany({ trans, keys }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const store = trans.objectStore(tableName);
                    const length = keys.length;
                    const result = new Array(length);
                    let keyCount = 0;
                    let callbackCount = 0;
                    let req;
                    const successHandler = event => {
                        const req = event.target;
                        if ((result[req._pos] = req.result) != null)
                            ;
                        if (++callbackCount === keyCount)
                            resolve(result);
                    };
                    const errorHandler = eventRejectHandler(reject);
                    for (let i = 0; i < length; ++i) {
                        const key = keys[i];
                        if (key != null) {
                            req = store.get(keys[i]);
                            req._pos = i;
                            req.onsuccess = successHandler;
                            req.onerror = errorHandler;
                            ++keyCount;
                        }
                    }
                    if (keyCount === 0)
                        resolve(result);
                });
            },
            get({ trans, key }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const store = trans.objectStore(tableName);
                    const req = store.get(key);
                    req.onsuccess = event => resolve(event.target.result);
                    req.onerror = eventRejectHandler(reject);
                });
            },
            query: query(hasGetAll),
            openCursor,
            count({ query, trans }) {
                const { index, range } = query;
                return new Promise((resolve, reject) => {
                    const store = trans.objectStore(tableName);
                    const source = index.isPrimaryKey ? store : store.index(index.name);
                    const idbKeyRange = makeIDBKeyRange(range);
                    const req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                    req.onsuccess = wrap(ev => resolve(ev.target.result));
                    req.onerror = eventRejectHandler(reject);
                });
            }
        };
    }
    const { schema, hasGetAll } = extractSchema(db, tmpTrans);
    const tables = schema.tables.map(tableSchema => createDbCoreTable(tableSchema));
    const tableMap = {};
    tables.forEach(table => tableMap[table.name] = table);
    return {
        stack: "dbcore",
        transaction: db.transaction.bind(db),
        table(name) {
            const result = tableMap[name];
            if (!result)
                throw new Error(`Table '${name}' not found`);
            return tableMap[name];
        },
        MIN_KEY: -Infinity,
        MAX_KEY: getMaxKey(IdbKeyRange),
        schema
    };
}

function createMiddlewareStack(stackImpl, middlewares) {
    return middlewares.reduce((down, { create }) => ({ ...down, ...create(down) }), stackImpl);
}
function createMiddlewareStacks(middlewares, idbdb, { IDBKeyRange, indexedDB }, tmpTrans) {
    const dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
    return {
        dbcore
    };
}
function generateMiddlewareStacks({ _novip: db }, tmpTrans) {
    const idbdb = tmpTrans.db;
    const stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
    db.core = stacks.dbcore;
    db.tables.forEach(table => {
        const tableName = table.name;
        if (db.core.schema.tables.some(tbl => tbl.name === tableName)) {
            table.core = db.core.table(tableName);
            if (db[tableName] instanceof db.Table) {
                db[tableName].core = table.core;
            }
        }
    });
}

function setApiOnPlace({ _novip: db }, objs, tableNames, dbschema) {
    tableNames.forEach(tableName => {
        const schema = dbschema[tableName];
        objs.forEach(obj => {
            const propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
                if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                    setProp(obj, tableName, {
                        get() { return this.table(tableName); },
                        set(value) {
                            defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                        }
                    });
                }
                else {
                    obj[tableName] = new db.Table(tableName, schema);
                }
            }
        });
    });
}
function removeTablesApi({ _novip: db }, objs) {
    objs.forEach(obj => {
        for (let key in obj) {
            if (obj[key] instanceof db.Table)
                delete obj[key];
        }
    });
}
function lowerVersionFirst(a, b) {
    return a._cfg.version - b._cfg.version;
}
function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
    const globalSchema = db._dbSchema;
    const trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
    trans.create(idbUpgradeTrans);
    trans._completion.catch(reject);
    const rejectTransaction = trans._reject.bind(trans);
    const transless = PSD.transless || PSD;
    newScope(() => {
        PSD.trans = trans;
        PSD.transless = transless;
        if (oldVersion === 0) {
            keys(globalSchema).forEach(tableName => {
                createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db, idbUpgradeTrans);
            DexiePromise.follow(() => db.on.populate.fire(trans)).catch(rejectTransaction);
        }
        else
            updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans).catch(rejectTransaction);
    });
}
function updateTablesAndIndexes({ _novip: db }, oldVersion, trans, idbUpgradeTrans) {
    const queue = [];
    const versions = db._versions;
    let globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
    let anyContentUpgraderHasRun = false;
    const versToRun = versions.filter(v => v._cfg.version >= oldVersion);
    versToRun.forEach(version => {
        queue.push(() => {
            const oldSchema = globalSchema;
            const newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
            globalSchema = db._dbSchema = newSchema;
            const diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(tuple => {
                createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(change => {
                if (change.recreate) {
                    throw new exceptions.Upgrade("Not yet support for changing primary key");
                }
                else {
                    const store = idbUpgradeTrans.objectStore(change.name);
                    change.add.forEach(idx => addIndex(store, idx));
                    change.change.forEach(idx => {
                        store.deleteIndex(idx.name);
                        addIndex(store, idx);
                    });
                    change.del.forEach(idxName => store.deleteIndex(idxName));
                }
            });
            const contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
                generateMiddlewareStacks(db, idbUpgradeTrans);
                trans._memoizedTables = {};
                anyContentUpgraderHasRun = true;
                let upgradeSchema = shallowClone(newSchema);
                diff.del.forEach(table => {
                    upgradeSchema[table] = oldSchema[table];
                });
                removeTablesApi(db, [db.Transaction.prototype]);
                setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema), upgradeSchema);
                trans.schema = upgradeSchema;
                const contentUpgradeIsAsync = isAsyncFunction(contentUpgrade);
                if (contentUpgradeIsAsync) {
                    incrementExpectedAwaits();
                }
                let returnValue;
                const promiseFollowed = DexiePromise.follow(() => {
                    returnValue = contentUpgrade(trans);
                    if (returnValue) {
                        if (contentUpgradeIsAsync) {
                            var decrementor = decrementExpectedAwaits.bind(null, null);
                            returnValue.then(decrementor, decrementor);
                        }
                    }
                });
                return (returnValue && typeof returnValue.then === 'function' ?
                    DexiePromise.resolve(returnValue) : promiseFollowed.then(() => returnValue));
            }
        });
        queue.push(idbtrans => {
            if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                const newSchema = version._cfg.dbschema;
                deleteRemovedTables(newSchema, idbtrans);
            }
            removeTablesApi(db, [db.Transaction.prototype]);
            setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
            trans.schema = db._dbSchema;
        });
    });
    function runQueue() {
        return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
            DexiePromise.resolve();
    }
    return runQueue().then(() => {
        createMissingTables(globalSchema, idbUpgradeTrans);
    });
}
function getSchemaDiff(oldSchema, newSchema) {
    const diff = {
        del: [],
        add: [],
        change: []
    };
    let table;
    for (table in oldSchema) {
        if (!newSchema[table])
            diff.del.push(table);
    }
    for (table in newSchema) {
        const oldDef = oldSchema[table], newDef = newSchema[table];
        if (!oldDef) {
            diff.add.push([table, newDef]);
        }
        else {
            const change = {
                name: table,
                def: newDef,
                recreate: false,
                del: [],
                add: [],
                change: []
            };
            if ((
            '' + (oldDef.primKey.keyPath || '')) !== ('' + (newDef.primKey.keyPath || '')) ||
                (oldDef.primKey.auto !== newDef.primKey.auto && !isIEOrEdge))
             {
                change.recreate = true;
                diff.change.push(change);
            }
            else {
                const oldIndexes = oldDef.idxByName;
                const newIndexes = newDef.idxByName;
                let idxName;
                for (idxName in oldIndexes) {
                    if (!newIndexes[idxName])
                        change.del.push(idxName);
                }
                for (idxName in newIndexes) {
                    const oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                    if (!oldIdx)
                        change.add.push(newIdx);
                    else if (oldIdx.src !== newIdx.src)
                        change.change.push(newIdx);
                }
                if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                    diff.change.push(change);
                }
            }
        }
    }
    return diff;
}
function createTable(idbtrans, tableName, primKey, indexes) {
    const store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ?
        { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
        { autoIncrement: primKey.auto });
    indexes.forEach(idx => addIndex(store, idx));
    return store;
}
function createMissingTables(newSchema, idbtrans) {
    keys(newSchema).forEach(tableName => {
        if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
        }
    });
}
function deleteRemovedTables(newSchema, idbtrans) {
    [].slice.call(idbtrans.db.objectStoreNames).forEach(storeName => newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName));
}
function addIndex(store, idx) {
    store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
}
function buildGlobalSchema(db, idbdb, tmpTrans) {
    const globalSchema = {};
    const dbStoreNames = slice(idbdb.objectStoreNames, 0);
    dbStoreNames.forEach(storeName => {
        const store = tmpTrans.objectStore(storeName);
        let keyPath = store.keyPath;
        const primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
        const indexes = [];
        for (let j = 0; j < store.indexNames.length; ++j) {
            const idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
        }
        globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
    });
    return globalSchema;
}
function readGlobalSchema({ _novip: db }, idbdb, tmpTrans) {
    db.verno = idbdb.version / 10;
    const globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
    db._storeNames = slice(idbdb.objectStoreNames, 0);
    setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
}
function verifyInstalledSchema(db, tmpTrans) {
    const installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
    const diff = getSchemaDiff(installedSchema, db._dbSchema);
    return !(diff.add.length || diff.change.some(ch => ch.add.length || ch.change.length));
}
function adjustToExistingIndexNames({ _novip: db }, schema, idbtrans) {
    const storeNames = idbtrans.db.objectStoreNames;
    for (let i = 0; i < storeNames.length; ++i) {
        const storeName = storeNames[i];
        const store = idbtrans.objectStore(storeName);
        db._hasGetAll = 'getAll' in store;
        for (let j = 0; j < store.indexNames.length; ++j) {
            const indexName = store.indexNames[j];
            const keyPath = store.index(indexName).keyPath;
            const dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
            if (schema[storeName]) {
                const indexSpec = schema[storeName].idxByName[dexieName];
                if (indexSpec) {
                    indexSpec.name = indexName;
                    delete schema[storeName].idxByName[dexieName];
                    schema[storeName].idxByName[indexName] = indexSpec;
                }
            }
        }
    }
    if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
        _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
        db._hasGetAll = false;
    }
}
function parseIndexSyntax(primKeyAndIndexes) {
    return primKeyAndIndexes.split(',').map((index, indexNum) => {
        index = index.trim();
        const name = index.replace(/([&*]|\+\+)/g, "");
        const keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
        return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0);
    });
}

class Version {
    _parseStoresSpec(stores, outSchema) {
        keys(stores).forEach(tableName => {
            if (stores[tableName] !== null) {
                var indexes = parseIndexSyntax(stores[tableName]);
                var primKey = indexes.shift();
                if (primKey.multi)
                    throw new exceptions.Schema("Primary key cannot be multi-valued");
                indexes.forEach(idx => {
                    if (idx.auto)
                        throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                    if (!idx.keyPath)
                        throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                });
                outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
            }
        });
    }
    stores(stores) {
        const db = this.db;
        this._cfg.storesSource = this._cfg.storesSource ?
            extend(this._cfg.storesSource, stores) :
            stores;
        const versions = db._versions;
        const storesSpec = {};
        let dbschema = {};
        versions.forEach(version => {
            extend(storesSpec, version._cfg.storesSource);
            dbschema = (version._cfg.dbschema = {});
            version._parseStoresSpec(storesSpec, dbschema);
        });
        db._dbSchema = dbschema;
        removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
        setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
        db._storeNames = keys(dbschema);
        return this;
    }
    upgrade(upgradeFunction) {
        this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
        return this;
    }
}

function createVersionConstructor(db) {
    return makeClassConstructor(Version.prototype, function Version(versionNumber) {
        this.db = db;
        this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
        };
    });
}

function getDbNamesTable(indexedDB, IDBKeyRange) {
    let dbNamesDB = indexedDB["_dbNamesDB"];
    if (!dbNamesDB) {
        dbNamesDB = indexedDB["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB,
            IDBKeyRange,
        });
        dbNamesDB.version(1).stores({ dbnames: "name" });
    }
    return dbNamesDB.table("dbnames");
}
function hasDatabasesNative(indexedDB) {
    return indexedDB && typeof indexedDB.databases === "function";
}
function getDatabaseNames({ indexedDB, IDBKeyRange, }) {
    return hasDatabasesNative(indexedDB)
        ? Promise.resolve(indexedDB.databases()).then((infos) => infos
            .map((info) => info.name)
            .filter((name) => name !== DBNAMES_DB))
        : getDbNamesTable(indexedDB, IDBKeyRange).toCollection().primaryKeys();
}
function _onDatabaseCreated({ indexedDB, IDBKeyRange }, name) {
    !hasDatabasesNative(indexedDB) &&
        name !== DBNAMES_DB &&
        getDbNamesTable(indexedDB, IDBKeyRange).put({ name }).catch(nop);
}
function _onDatabaseDeleted({ indexedDB, IDBKeyRange }, name) {
    !hasDatabasesNative(indexedDB) &&
        name !== DBNAMES_DB &&
        getDbNamesTable(indexedDB, IDBKeyRange).delete(name).catch(nop);
}

function vip(fn) {
    return newScope(function () {
        PSD.letThrough = true;
        return fn();
    });
}

function idbReady() {
    var isSafari = !navigator.userAgentData &&
        /Safari\//.test(navigator.userAgent) &&
        !/Chrom(e|ium)\//.test(navigator.userAgent);
    if (!isSafari || !indexedDB.databases)
        return Promise.resolve();
    var intervalId;
    return new Promise(function (resolve) {
        var tryIdb = function () { return indexedDB.databases().finally(resolve); };
        intervalId = setInterval(tryIdb, 100);
        tryIdb();
    }).finally(function () { return clearInterval(intervalId); });
}

function dexieOpen(db) {
    const state = db._state;
    const { indexedDB } = db._deps;
    if (state.isBeingOpened || db.idbdb)
        return state.dbReadyPromise.then(() => state.dbOpenError ?
            rejection(state.dbOpenError) :
            db);
    debug && (state.openCanceller._stackHolder = getErrorWithStack());
    state.isBeingOpened = true;
    state.dbOpenError = null;
    state.openComplete = false;
    const openCanceller = state.openCanceller;
    function throwIfCancelled() {
        if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed('db.open() was cancelled');
    }
    let resolveDbReady = state.dbReadyResolve,
    upgradeTransaction = null, wasCreated = false;
    return DexiePromise.race([openCanceller, (typeof navigator === 'undefined' ? DexiePromise.resolve() : idbReady()).then(() => new DexiePromise((resolve, reject) => {
            throwIfCancelled();
            if (!indexedDB)
                throw new exceptions.MissingAPI();
            const dbName = db.name;
            const req = state.autoSchema ?
                indexedDB.open(dbName) :
                indexedDB.open(dbName, Math.round(db.verno * 10));
            if (!req)
                throw new exceptions.MissingAPI();
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db._fireOnBlocked);
            req.onupgradeneeded = wrap(e => {
                upgradeTransaction = req.transaction;
                if (state.autoSchema && !db._options.allowEmptyDB) {
                    req.onerror = preventDefault;
                    upgradeTransaction.abort();
                    req.result.close();
                    const delreq = indexedDB.deleteDatabase(dbName);
                    delreq.onsuccess = delreq.onerror = wrap(() => {
                        reject(new exceptions.NoSuchDatabase(`Database ${dbName} doesnt exist`));
                    });
                }
                else {
                    upgradeTransaction.onerror = eventRejectHandler(reject);
                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                    wasCreated = oldVer < 1;
                    db._novip.idbdb = req.result;
                    runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
                }
            }, reject);
            req.onsuccess = wrap(() => {
                upgradeTransaction = null;
                const idbdb = db._novip.idbdb = req.result;
                const objectStoreNames = slice(idbdb.objectStoreNames);
                if (objectStoreNames.length > 0)
                    try {
                        const tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
                        if (state.autoSchema)
                            readGlobalSchema(db, idbdb, tmpTrans);
                        else {
                            adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                            if (!verifyInstalledSchema(db, tmpTrans)) {
                                console.warn(`Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.`);
                            }
                        }
                        generateMiddlewareStacks(db, tmpTrans);
                    }
                    catch (e) {
                    }
                connections.push(db);
                idbdb.onversionchange = wrap(ev => {
                    state.vcFired = true;
                    db.on("versionchange").fire(ev);
                });
                idbdb.onclose = wrap(ev => {
                    db.on("close").fire(ev);
                });
                if (wasCreated)
                    _onDatabaseCreated(db._deps, dbName);
                resolve();
            }, reject);
        }))]).then(() => {
        throwIfCancelled();
        state.onReadyBeingFired = [];
        return DexiePromise.resolve(vip(() => db.on.ready.fire(db.vip))).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
                let remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
                state.onReadyBeingFired = [];
                return DexiePromise.resolve(vip(() => remainders(db.vip))).then(fireRemainders);
            }
        });
    }).finally(() => {
        state.onReadyBeingFired = null;
        state.isBeingOpened = false;
    }).then(() => {
        return db;
    }).catch(err => {
        state.dbOpenError = err;
        try {
            upgradeTransaction && upgradeTransaction.abort();
        }
        catch (_a) { }
        if (openCanceller === state.openCanceller) {
            db._close();
        }
        return rejection(err);
    }).finally(() => {
        state.openComplete = true;
        resolveDbReady();
    });
}

function awaitIterator(iterator) {
    var callNext = result => iterator.next(result), doThrow = error => iterator.throw(error), onSuccess = step(callNext), onError = step(doThrow);
    function step(getNext) {
        return (val) => {
            var next = getNext(val), value = next.value;
            return next.done ? value :
                (!value || typeof value.then !== 'function' ?
                    isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) :
                    value.then(onSuccess, onError));
        };
    }
    return step(callNext)();
}

function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
    var i = arguments.length;
    if (i < 2)
        throw new exceptions.InvalidArgument("Too few arguments");
    var args = new Array(i - 1);
    while (--i)
        args[i - 1] = arguments[i];
    scopeFunc = args.pop();
    var tables = flatten(args);
    return [mode, tables, scopeFunc];
}
function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
    return DexiePromise.resolve().then(() => {
        const transless = PSD.transless || PSD;
        const trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
        const zoneProps = {
            trans: trans,
            transless: transless
        };
        if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
        }
        else {
            trans.create();
        }
        const scopeFuncIsAsync = isAsyncFunction(scopeFunc);
        if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
        }
        let returnValue;
        const promiseFollowed = DexiePromise.follow(() => {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
                if (scopeFuncIsAsync) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue.then(decrementor, decrementor);
                }
                else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                    returnValue = awaitIterator(returnValue);
                }
            }
        }, zoneProps);
        return (returnValue && typeof returnValue.then === 'function' ?
            DexiePromise.resolve(returnValue).then(x => trans.active ?
                x
                : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")))
            : promiseFollowed.then(() => returnValue)).then(x => {
            if (parentTransaction)
                trans._resolve();
            return trans._completion.then(() => x);
        }).catch(e => {
            trans._reject(e);
            return rejection(e);
        });
    });
}

function pad(a, value, count) {
    const result = isArray(a) ? a.slice() : [a];
    for (let i = 0; i < count; ++i)
        result.push(value);
    return result;
}
function createVirtualIndexMiddleware(down) {
    return {
        ...down,
        table(tableName) {
            const table = down.table(tableName);
            const { schema } = table;
            const indexLookup = {};
            const allVirtualIndexes = [];
            function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
                const keyPathAlias = getKeyPathAlias(keyPath);
                const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
                const keyLength = keyPath == null ? 0 : typeof keyPath === 'string' ? 1 : keyPath.length;
                const isVirtual = keyTail > 0;
                const virtualIndex = {
                    ...lowLevelIndex,
                    isVirtual,
                    keyTail,
                    keyLength,
                    extractKey: getKeyExtractor(keyPath),
                    unique: !isVirtual && lowLevelIndex.unique
                };
                indexList.push(virtualIndex);
                if (!virtualIndex.isPrimaryKey) {
                    allVirtualIndexes.push(virtualIndex);
                }
                if (keyLength > 1) {
                    const virtualKeyPath = keyLength === 2 ?
                        keyPath[0] :
                        keyPath.slice(0, keyLength - 1);
                    addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
                }
                indexList.sort((a, b) => a.keyTail - b.keyTail);
                return virtualIndex;
            }
            const primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
            indexLookup[":id"] = [primaryKey];
            for (const index of schema.indexes) {
                addVirtualIndexes(index.keyPath, 0, index);
            }
            function findBestIndex(keyPath) {
                const result = indexLookup[getKeyPathAlias(keyPath)];
                return result && result[0];
            }
            function translateRange(range, keyTail) {
                return {
                    type: range.type === 1  ?
                        2  :
                        range.type,
                    lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                    lowerOpen: true,
                    upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                    upperOpen: true
                };
            }
            function translateRequest(req) {
                const index = req.query.index;
                return index.isVirtual ? {
                    ...req,
                    query: {
                        index,
                        range: translateRange(req.query.range, index.keyTail)
                    }
                } : req;
            }
            const result = {
                ...table,
                schema: {
                    ...schema,
                    primaryKey,
                    indexes: allVirtualIndexes,
                    getIndexByKeyPath: findBestIndex
                },
                count(req) {
                    return table.count(translateRequest(req));
                },
                query(req) {
                    return table.query(translateRequest(req));
                },
                openCursor(req) {
                    const { keyTail, isVirtual, keyLength } = req.query.index;
                    if (!isVirtual)
                        return table.openCursor(req);
                    function createVirtualCursor(cursor) {
                        function _continue(key) {
                            key != null ?
                                cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
                                req.unique ?
                                    cursor.continue(cursor.key.slice(0, keyLength)
                                        .concat(req.reverse
                                        ? down.MIN_KEY
                                        : down.MAX_KEY, keyTail)) :
                                    cursor.continue();
                        }
                        const virtualCursor = Object.create(cursor, {
                            continue: { value: _continue },
                            continuePrimaryKey: {
                                value(key, primaryKey) {
                                    cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
                                }
                            },
                            primaryKey: {
                                get() {
                                    return cursor.primaryKey;
                                }
                            },
                            key: {
                                get() {
                                    const key = cursor.key;
                                    return keyLength === 1 ?
                                        key[0] :
                                        key.slice(0, keyLength);
                                }
                            },
                            value: {
                                get() {
                                    return cursor.value;
                                }
                            }
                        });
                        return virtualCursor;
                    }
                    return table.openCursor(translateRequest(req))
                        .then(cursor => cursor && createVirtualCursor(cursor));
                }
            };
            return result;
        }
    };
}
const virtualIndexMiddleware = {
    stack: "dbcore",
    name: "VirtualIndexMiddleware",
    level: 1,
    create: createVirtualIndexMiddleware
};

function getObjectDiff(a, b, rv, prfx) {
    rv = rv || {};
    prfx = prfx || '';
    keys(a).forEach((prop) => {
        if (!hasOwn(b, prop)) {
            rv[prfx + prop] = undefined;
        }
        else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
                const apTypeName = toStringTag(ap);
                const bpTypeName = toStringTag(bp);
                if (apTypeName !== bpTypeName) {
                    rv[prfx + prop] = b[prop];
                }
                else if (apTypeName === 'Object') {
                    getObjectDiff(ap, bp, rv, prfx + prop + '.');
                }
                else if (ap !== bp) {
                    rv[prfx + prop] = b[prop];
                }
            }
            else if (ap !== bp)
                rv[prfx + prop] = b[prop];
        }
    });
    keys(b).forEach((prop) => {
        if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop];
        }
    });
    return rv;
}

function getEffectiveKeys(primaryKey, req) {
    if (req.type === 'delete')
        return req.keys;
    return req.keys || req.values.map(primaryKey.extractKey);
}

const hooksMiddleware = {
    stack: "dbcore",
    name: "HooksMiddleware",
    level: 2,
    create: (downCore) => ({
        ...downCore,
        table(tableName) {
            const downTable = downCore.table(tableName);
            const { primaryKey } = downTable.schema;
            const tableMiddleware = {
                ...downTable,
                mutate(req) {
                    const dxTrans = PSD.trans;
                    const { deleting, creating, updating } = dxTrans.table(tableName).hook;
                    switch (req.type) {
                        case 'add':
                            if (creating.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'put':
                            if (creating.fire === nop && updating.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'delete':
                            if (deleting.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'deleteRange':
                            if (deleting.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => deleteRange(req), true);
                    }
                    return downTable.mutate(req);
                    function addPutOrDelete(req) {
                        const dxTrans = PSD.trans;
                        const keys = req.keys || getEffectiveKeys(primaryKey, req);
                        if (!keys)
                            throw new Error("Keys missing");
                        req = req.type === 'add' || req.type === 'put' ?
                            { ...req, keys } :
                            { ...req };
                        if (req.type !== 'delete')
                            req.values = [...req.values];
                        if (req.keys)
                            req.keys = [...req.keys];
                        return getExistingValues(downTable, req, keys).then(existingValues => {
                            const contexts = keys.map((key, i) => {
                                const existingValue = existingValues[i];
                                const ctx = { onerror: null, onsuccess: null };
                                if (req.type === 'delete') {
                                    deleting.fire.call(ctx, key, existingValue, dxTrans);
                                }
                                else if (req.type === 'add' || existingValue === undefined) {
                                    const generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
                                    if (key == null && generatedPrimaryKey != null) {
                                        key = generatedPrimaryKey;
                                        req.keys[i] = key;
                                        if (!primaryKey.outbound) {
                                            setByKeyPath(req.values[i], primaryKey.keyPath, key);
                                        }
                                    }
                                }
                                else {
                                    const objectDiff = getObjectDiff(existingValue, req.values[i]);
                                    const additionalChanges = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
                                    if (additionalChanges) {
                                        const requestedValue = req.values[i];
                                        Object.keys(additionalChanges).forEach(keyPath => {
                                            if (hasOwn(requestedValue, keyPath)) {
                                                requestedValue[keyPath] = additionalChanges[keyPath];
                                            }
                                            else {
                                                setByKeyPath(requestedValue, keyPath, additionalChanges[keyPath]);
                                            }
                                        });
                                    }
                                }
                                return ctx;
                            });
                            return downTable.mutate(req).then(({ failures, results, numFailures, lastResult }) => {
                                for (let i = 0; i < keys.length; ++i) {
                                    const primKey = results ? results[i] : keys[i];
                                    const ctx = contexts[i];
                                    if (primKey == null) {
                                        ctx.onerror && ctx.onerror(failures[i]);
                                    }
                                    else {
                                        ctx.onsuccess && ctx.onsuccess(req.type === 'put' && existingValues[i] ?
                                            req.values[i] :
                                            primKey
                                        );
                                    }
                                }
                                return { failures, results, numFailures, lastResult };
                            }).catch(error => {
                                contexts.forEach(ctx => ctx.onerror && ctx.onerror(error));
                                return Promise.reject(error);
                            });
                        });
                    }
                    function deleteRange(req) {
                        return deleteNextChunk(req.trans, req.range, 10000);
                    }
                    function deleteNextChunk(trans, range, limit) {
                        return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit })
                            .then(({ result }) => {
                            return addPutOrDelete({ type: 'delete', keys: result, trans }).then(res => {
                                if (res.numFailures > 0)
                                    return Promise.reject(res.failures[0]);
                                if (result.length < limit) {
                                    return { failures: [], numFailures: 0, lastResult: undefined };
                                }
                                else {
                                    return deleteNextChunk(trans, { ...range, lower: result[result.length - 1], lowerOpen: true }, limit);
                                }
                            });
                        });
                    }
                }
            };
            return tableMiddleware;
        },
    })
};
function getExistingValues(table, req, effectiveKeys) {
    return req.type === "add"
        ? Promise.resolve([])
        : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
}

function getFromTransactionCache(keys, cache, clone) {
    try {
        if (!cache)
            return null;
        if (cache.keys.length < keys.length)
            return null;
        const result = [];
        for (let i = 0, j = 0; i < cache.keys.length && j < keys.length; ++i) {
            if (cmp(cache.keys[i], keys[j]) !== 0)
                continue;
            result.push(clone ? deepClone(cache.values[i]) : cache.values[i]);
            ++j;
        }
        return result.length === keys.length ? result : null;
    }
    catch (_a) {
        return null;
    }
}
const cacheExistingValuesMiddleware = {
    stack: "dbcore",
    level: -1,
    create: (core) => {
        return {
            table: (tableName) => {
                const table = core.table(tableName);
                return {
                    ...table,
                    getMany: (req) => {
                        if (!req.cache) {
                            return table.getMany(req);
                        }
                        const cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                        if (cachedResult) {
                            return DexiePromise.resolve(cachedResult);
                        }
                        return table.getMany(req).then((res) => {
                            req.trans["_cache"] = {
                                keys: req.keys,
                                values: req.cache === "clone" ? deepClone(res) : res,
                            };
                            return res;
                        });
                    },
                    mutate: (req) => {
                        if (req.type !== "add")
                            req.trans["_cache"] = null;
                        return table.mutate(req);
                    },
                };
            },
        };
    },
};

function isEmptyRange(node) {
    return !("from" in node);
}
const RangeSet = function (fromOrTree, to) {
    if (this) {
        extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
    }
    else {
        const rv = new RangeSet();
        if (fromOrTree && ("d" in fromOrTree)) {
            extend(rv, fromOrTree);
        }
        return rv;
    }
};
props(RangeSet.prototype, {
    add(rangeSet) {
        mergeRanges(this, rangeSet);
        return this;
    },
    addKey(key) {
        addRange(this, key, key);
        return this;
    },
    addKeys(keys) {
        keys.forEach(key => addRange(this, key, key));
        return this;
    },
    [iteratorSymbol]() {
        return getRangeSetIterator(this);
    }
});
function addRange(target, from, to) {
    const diff = cmp(from, to);
    if (isNaN(diff))
        return;
    if (diff > 0)
        throw RangeError();
    if (isEmptyRange(target))
        return extend(target, { from, to, d: 1 });
    const left = target.l;
    const right = target.r;
    if (cmp(to, target.from) < 0) {
        left
            ? addRange(left, from, to)
            : (target.l = { from, to, d: 1, l: null, r: null });
        return rebalance(target);
    }
    if (cmp(from, target.to) > 0) {
        right
            ? addRange(right, from, to)
            : (target.r = { from, to, d: 1, l: null, r: null });
        return rebalance(target);
    }
    if (cmp(from, target.from) < 0) {
        target.from = from;
        target.l = null;
        target.d = right ? right.d + 1 : 1;
    }
    if (cmp(to, target.to) > 0) {
        target.to = to;
        target.r = null;
        target.d = target.l ? target.l.d + 1 : 1;
    }
    const rightWasCutOff = !target.r;
    if (left && !target.l) {
        mergeRanges(target, left);
    }
    if (right && rightWasCutOff) {
        mergeRanges(target, right);
    }
}
function mergeRanges(target, newSet) {
    function _addRangeSet(target, { from, to, l, r }) {
        addRange(target, from, to);
        if (l)
            _addRangeSet(target, l);
        if (r)
            _addRangeSet(target, r);
    }
    if (!isEmptyRange(newSet))
        _addRangeSet(target, newSet);
}
function rangesOverlap(rangeSet1, rangeSet2) {
    const i1 = getRangeSetIterator(rangeSet2);
    let nextResult1 = i1.next();
    if (nextResult1.done)
        return false;
    let a = nextResult1.value;
    const i2 = getRangeSetIterator(rangeSet1);
    let nextResult2 = i2.next(a.from);
    let b = nextResult2.value;
    while (!nextResult1.done && !nextResult2.done) {
        if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
            return true;
        cmp(a.from, b.from) < 0
            ? (a = (nextResult1 = i1.next(b.from)).value)
            : (b = (nextResult2 = i2.next(a.from)).value);
    }
    return false;
}
function getRangeSetIterator(node) {
    let state = isEmptyRange(node) ? null : { s: 0, n: node };
    return {
        next(key) {
            const keyProvided = arguments.length > 0;
            while (state) {
                switch (state.s) {
                    case 0:
                        state.s = 1;
                        if (keyProvided) {
                            while (state.n.l && cmp(key, state.n.from) < 0)
                                state = { up: state, n: state.n.l, s: 1 };
                        }
                        else {
                            while (state.n.l)
                                state = { up: state, n: state.n.l, s: 1 };
                        }
                    case 1:
                        state.s = 2;
                        if (!keyProvided || cmp(key, state.n.to) <= 0)
                            return { value: state.n, done: false };
                    case 2:
                        if (state.n.r) {
                            state.s = 3;
                            state = { up: state, n: state.n.r, s: 0 };
                            continue;
                        }
                    case 3:
                        state = state.up;
                }
            }
            return { done: true };
        },
    };
}
function rebalance(target) {
    var _a, _b;
    const diff = (((_a = target.r) === null || _a === void 0 ? void 0 : _a.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
    const r = diff > 1 ? "r" : diff < -1 ? "l" : "";
    if (r) {
        const l = r === "r" ? "l" : "r";
        const rootClone = { ...target };
        const oldRootRight = target[r];
        target.from = oldRootRight.from;
        target.to = oldRootRight.to;
        target[r] = oldRootRight[r];
        rootClone[r] = oldRootRight[l];
        target[l] = rootClone;
        rootClone.d = computeDepth(rootClone);
    }
    target.d = computeDepth(target);
}
function computeDepth({ r, l }) {
    return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
}

const observabilityMiddleware = {
    stack: "dbcore",
    level: 0,
    create: (core) => {
        const dbName = core.schema.name;
        const FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
        return {
            ...core,
            table: (tableName) => {
                const table = core.table(tableName);
                const { schema } = table;
                const { primaryKey } = schema;
                const { extractKey, outbound } = primaryKey;
                const tableClone = {
                    ...table,
                    mutate: (req) => {
                        const trans = req.trans;
                        const mutatedParts = trans.mutatedParts || (trans.mutatedParts = {});
                        const getRangeSet = (indexName) => {
                            const part = `idb://${dbName}/${tableName}/${indexName}`;
                            return (mutatedParts[part] ||
                                (mutatedParts[part] = new RangeSet()));
                        };
                        const pkRangeSet = getRangeSet("");
                        const delsRangeSet = getRangeSet(":dels");
                        const { type } = req;
                        let [keys, newObjs] = req.type === "deleteRange"
                            ? [req.range]
                            : req.type === "delete"
                                ? [req.keys]
                                : req.values.length < 50
                                    ? [[], req.values]
                                    : [];
                        const oldCache = req.trans["_cache"];
                        return table.mutate(req).then((res) => {
                            if (isArray(keys)) {
                                if (type !== "delete")
                                    keys = res.results;
                                pkRangeSet.addKeys(keys);
                                const oldObjs = getFromTransactionCache(keys, oldCache);
                                if (!oldObjs && type !== "add") {
                                    delsRangeSet.addKeys(keys);
                                }
                                if (oldObjs || newObjs) {
                                    trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                                }
                            }
                            else if (keys) {
                                const range = { from: keys.lower, to: keys.upper };
                                delsRangeSet.add(range);
                                pkRangeSet.add(range);
                            }
                            else {
                                pkRangeSet.add(FULL_RANGE);
                                delsRangeSet.add(FULL_RANGE);
                                schema.indexes.forEach(idx => getRangeSet(idx.name).add(FULL_RANGE));
                            }
                            return res;
                        });
                    },
                };
                const getRange = ({ query: { index, range }, }) => {
                    var _a, _b;
                    return [
                        index,
                        new RangeSet((_a = range.lower) !== null && _a !== void 0 ? _a : core.MIN_KEY, (_b = range.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY),
                    ];
                };
                const readSubscribers = {
                    get: (req) => [primaryKey, new RangeSet(req.key)],
                    getMany: (req) => [primaryKey, new RangeSet().addKeys(req.keys)],
                    count: getRange,
                    query: getRange,
                    openCursor: getRange,
                };
                keys(readSubscribers).forEach(method => {
                    tableClone[method] = function (req) {
                        const { subscr } = PSD;
                        if (subscr) {
                            const getRangeSet = (indexName) => {
                                const part = `idb://${dbName}/${tableName}/${indexName}`;
                                return (subscr[part] ||
                                    (subscr[part] = new RangeSet()));
                            };
                            const pkRangeSet = getRangeSet("");
                            const delsRangeSet = getRangeSet(":dels");
                            const [queriedIndex, queriedRanges] = readSubscribers[method](req);
                            getRangeSet(queriedIndex.name || "").add(queriedRanges);
                            if (!queriedIndex.isPrimaryKey) {
                                if (method === "count") {
                                    delsRangeSet.add(FULL_RANGE);
                                }
                                else {
                                    const keysPromise = method === "query" &&
                                        outbound &&
                                        req.values &&
                                        table.query({
                                            ...req,
                                            values: false,
                                        });
                                    return table[method].apply(this, arguments).then((res) => {
                                        if (method === "query") {
                                            if (outbound && req.values) {
                                                return keysPromise.then(({ result: resultingKeys }) => {
                                                    pkRangeSet.addKeys(resultingKeys);
                                                    return res;
                                                });
                                            }
                                            const pKeys = req.values
                                                ? res.result.map(extractKey)
                                                : res.result;
                                            if (req.values) {
                                                pkRangeSet.addKeys(pKeys);
                                            }
                                            else {
                                                delsRangeSet.addKeys(pKeys);
                                            }
                                        }
                                        else if (method === "openCursor") {
                                            const cursor = res;
                                            const wantValues = req.values;
                                            return (cursor &&
                                                Object.create(cursor, {
                                                    key: {
                                                        get() {
                                                            delsRangeSet.addKey(cursor.primaryKey);
                                                            return cursor.key;
                                                        },
                                                    },
                                                    primaryKey: {
                                                        get() {
                                                            const pkey = cursor.primaryKey;
                                                            delsRangeSet.addKey(pkey);
                                                            return pkey;
                                                        },
                                                    },
                                                    value: {
                                                        get() {
                                                            wantValues && pkRangeSet.addKey(cursor.primaryKey);
                                                            return cursor.value;
                                                        },
                                                    },
                                                }));
                                        }
                                        return res;
                                    });
                                }
                            }
                        }
                        return table[method].apply(this, arguments);
                    };
                });
                return tableClone;
            },
        };
    },
};
function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
    function addAffectedIndex(ix) {
        const rangeSet = getRangeSet(ix.name || "");
        function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
        }
        const addKeyOrKeys = (key) => ix.multiEntry && isArray(key)
            ? key.forEach(key => rangeSet.addKey(key))
            : rangeSet.addKey(key);
        (oldObjs || newObjs).forEach((_, i) => {
            const oldKey = oldObjs && extractKey(oldObjs[i]);
            const newKey = newObjs && extractKey(newObjs[i]);
            if (cmp(oldKey, newKey) !== 0) {
                if (oldKey != null)
                    addKeyOrKeys(oldKey);
                if (newKey != null)
                    addKeyOrKeys(newKey);
            }
        });
    }
    schema.indexes.forEach(addAffectedIndex);
}

class Dexie$1 {
    constructor(name, options) {
        this._middlewares = {};
        this.verno = 0;
        const deps = Dexie$1.dependencies;
        this._options = options = {
            addons: Dexie$1.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            ...options
        };
        this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
        };
        const { addons, } = options;
        this._dbSchema = {};
        this._versions = [];
        this._storeNames = [];
        this._allTables = {};
        this.idbdb = null;
        this._novip = this;
        const state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true
        };
        state.dbReadyPromise = new DexiePromise(resolve => {
            state.dbReadyResolve = resolve;
        });
        state.openCanceller = new DexiePromise((_, reject) => {
            state.cancelOpen = reject;
        });
        this._state = state;
        this.name = name;
        this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
        this.on.ready.subscribe = override(this.on.ready.subscribe, subscribe => {
            return (subscriber, bSticky) => {
                Dexie$1.vip(() => {
                    const state = this._state;
                    if (state.openComplete) {
                        if (!state.dbOpenError)
                            DexiePromise.resolve().then(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else if (state.onReadyBeingFired) {
                        state.onReadyBeingFired.push(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else {
                        subscribe(subscriber);
                        const db = this;
                        if (!bSticky)
                            subscribe(function unsubscribe() {
                                db.on.ready.unsubscribe(subscriber);
                                db.on.ready.unsubscribe(unsubscribe);
                            });
                    }
                });
            };
        });
        this.Collection = createCollectionConstructor(this);
        this.Table = createTableConstructor(this);
        this.Transaction = createTransactionConstructor(this);
        this.Version = createVersionConstructor(this);
        this.WhereClause = createWhereClauseConstructor(this);
        this.on("versionchange", ev => {
            if (ev.newVersion > 0)
                console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`);
            else
                console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`);
            this.close();
        });
        this.on("blocked", ev => {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                console.warn(`Dexie.delete('${this.name}') was blocked`);
            else
                console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${ev.oldVersion / 10}`);
        });
        this._maxKey = getMaxKey(options.IDBKeyRange);
        this._createTransaction = (mode, storeNames, dbschema, parentTransaction) => new this.Transaction(mode, storeNames, dbschema, this._options.chromeTransactionDurability, parentTransaction);
        this._fireOnBlocked = ev => {
            this.on("blocked").fire(ev);
            connections
                .filter(c => c.name === this.name && c !== this && !c._state.vcFired)
                .map(c => c.on("versionchange").fire(ev));
        };
        this.use(virtualIndexMiddleware);
        this.use(hooksMiddleware);
        this.use(observabilityMiddleware);
        this.use(cacheExistingValuesMiddleware);
        this.vip = Object.create(this, { _vip: { value: true } });
        addons.forEach(addon => addon(this));
    }
    version(versionNumber) {
        if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type(`Given version is not a positive number`);
        versionNumber = Math.round(versionNumber * 10) / 10;
        if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
        this.verno = Math.max(this.verno, versionNumber);
        const versions = this._versions;
        var versionInstance = versions.filter(v => v._cfg.version === versionNumber)[0];
        if (versionInstance)
            return versionInstance;
        versionInstance = new this.Version(versionNumber);
        versions.push(versionInstance);
        versions.sort(lowerVersionFirst);
        versionInstance.stores({});
        this._state.autoSchema = false;
        return versionInstance;
    }
    _whenReady(fn) {
        return (this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip)) ? fn() : new DexiePromise((resolve, reject) => {
            if (this._state.openComplete) {
                return reject(new exceptions.DatabaseClosed(this._state.dbOpenError));
            }
            if (!this._state.isBeingOpened) {
                if (!this._options.autoOpen) {
                    reject(new exceptions.DatabaseClosed());
                    return;
                }
                this.open().catch(nop);
            }
            this._state.dbReadyPromise.then(resolve, reject);
        }).then(fn);
    }
    use({ stack, create, level, name }) {
        if (name)
            this.unuse({ stack, name });
        const middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
        middlewares.push({ stack, create, level: level == null ? 10 : level, name });
        middlewares.sort((a, b) => a.level - b.level);
        return this;
    }
    unuse({ stack, name, create }) {
        if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(mw => create ? mw.create !== create :
                name ? mw.name !== name :
                    false);
        }
        return this;
    }
    open() {
        return dexieOpen(this);
    }
    _close() {
        const state = this._state;
        const idx = connections.indexOf(this);
        if (idx >= 0)
            connections.splice(idx, 1);
        if (this.idbdb) {
            try {
                this.idbdb.close();
            }
            catch (e) { }
            this._novip.idbdb = null;
        }
        state.dbReadyPromise = new DexiePromise(resolve => {
            state.dbReadyResolve = resolve;
        });
        state.openCanceller = new DexiePromise((_, reject) => {
            state.cancelOpen = reject;
        });
    }
    close() {
        this._close();
        const state = this._state;
        this._options.autoOpen = false;
        state.dbOpenError = new exceptions.DatabaseClosed();
        if (state.isBeingOpened)
            state.cancelOpen(state.dbOpenError);
    }
    delete() {
        const hasArguments = arguments.length > 0;
        const state = this._state;
        return new DexiePromise((resolve, reject) => {
            const doDelete = () => {
                this.close();
                var req = this._deps.indexedDB.deleteDatabase(this.name);
                req.onsuccess = wrap(() => {
                    _onDatabaseDeleted(this._deps, this.name);
                    resolve();
                });
                req.onerror = eventRejectHandler(reject);
                req.onblocked = this._fireOnBlocked;
            };
            if (hasArguments)
                throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
            if (state.isBeingOpened) {
                state.dbReadyPromise.then(doDelete);
            }
            else {
                doDelete();
            }
        });
    }
    backendDB() {
        return this.idbdb;
    }
    isOpen() {
        return this.idbdb !== null;
    }
    hasBeenClosed() {
        const dbOpenError = this._state.dbOpenError;
        return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
    }
    hasFailed() {
        return this._state.dbOpenError !== null;
    }
    dynamicallyOpened() {
        return this._state.autoSchema;
    }
    get tables() {
        return keys(this._allTables).map(name => this._allTables[name]);
    }
    transaction() {
        const args = extractTransactionArgs.apply(this, arguments);
        return this._transaction.apply(this, args);
    }
    _transaction(mode, tables, scopeFunc) {
        let parentTransaction = PSD.trans;
        if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1)
            parentTransaction = null;
        const onlyIfCompatible = mode.indexOf('?') !== -1;
        mode = mode.replace('!', '').replace('?', '');
        let idbMode, storeNames;
        try {
            storeNames = tables.map(table => {
                var storeName = table instanceof this.Table ? table.name : table;
                if (typeof storeName !== 'string')
                    throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                return storeName;
            });
            if (mode == "r" || mode === READONLY)
                idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
                idbMode = READWRITE;
            else
                throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
                if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                    if (onlyIfCompatible) {
                        parentTransaction = null;
                    }
                    else
                        throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                    storeNames.forEach(storeName => {
                        if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                            if (onlyIfCompatible) {
                                parentTransaction = null;
                            }
                            else
                                throw new exceptions.SubTransaction("Table " + storeName +
                                    " not included in parent transaction.");
                        }
                    });
                }
                if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                    parentTransaction = null;
                }
            }
        }
        catch (e) {
            return parentTransaction ?
                parentTransaction._promise(null, (_, reject) => { reject(e); }) :
                rejection(e);
        }
        const enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
        return (parentTransaction ?
            parentTransaction._promise(idbMode, enterTransaction, "lock") :
            PSD.trans ?
                usePSD(PSD.transless, () => this._whenReady(enterTransaction)) :
                this._whenReady(enterTransaction));
    }
    table(tableName) {
        if (!hasOwn(this._allTables, tableName)) {
            throw new exceptions.InvalidTable(`Table ${tableName} does not exist`);
        }
        return this._allTables[tableName];
    }
}

const symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol
    ? Symbol.observable
    : "@@observable";
class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    subscribe(x, error, complete) {
        return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
    }
    [symbolObservable]() {
        return this;
    }
}

function extendObservabilitySet(target, newSet) {
    keys(newSet).forEach(part => {
        const rangeSet = target[part] || (target[part] = new RangeSet());
        mergeRanges(rangeSet, newSet[part]);
    });
    return target;
}

function liveQuery(querier) {
    return new Observable((observer) => {
        const scopeFuncIsAsync = isAsyncFunction(querier);
        function execute(subscr) {
            if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
            }
            const exec = () => newScope(querier, { subscr, trans: null });
            const rv = PSD.trans
                ?
                    usePSD(PSD.transless, exec)
                : exec();
            if (scopeFuncIsAsync) {
                rv.then(decrementExpectedAwaits, decrementExpectedAwaits);
            }
            return rv;
        }
        let closed = false;
        let accumMuts = {};
        let currentObs = {};
        const subscription = {
            get closed() {
                return closed;
            },
            unsubscribe: () => {
                closed = true;
                globalEvents.storagemutated.unsubscribe(mutationListener);
            },
        };
        observer.start && observer.start(subscription);
        let querying = false, startedListening = false;
        function shouldNotify() {
            return keys(currentObs).some((key) => accumMuts[key] && rangesOverlap(accumMuts[key], currentObs[key]));
        }
        const mutationListener = (parts) => {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
                doQuery();
            }
        };
        const doQuery = () => {
            if (querying || closed)
                return;
            accumMuts = {};
            const subscr = {};
            const ret = execute(subscr);
            if (!startedListening) {
                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                startedListening = true;
            }
            querying = true;
            Promise.resolve(ret).then((result) => {
                querying = false;
                if (closed)
                    return;
                if (shouldNotify()) {
                    doQuery();
                }
                else {
                    accumMuts = {};
                    currentObs = subscr;
                    observer.next && observer.next(result);
                }
            }, (err) => {
                querying = false;
                observer.error && observer.error(err);
                subscription.unsubscribe();
            });
        };
        doQuery();
        return subscription;
    });
}

let domDeps;
try {
    domDeps = {
        indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
    };
}
catch (e) {
    domDeps = { indexedDB: null, IDBKeyRange: null };
}

const Dexie = Dexie$1;
props(Dexie, {
    ...fullNameExceptions,
    delete(databaseName) {
        const db = new Dexie(databaseName, { addons: [] });
        return db.delete();
    },
    exists(name) {
        return new Dexie(name, { addons: [] }).open().then(db => {
            db.close();
            return true;
        }).catch('NoSuchDatabaseError', () => false);
    },
    getDatabaseNames(cb) {
        try {
            return getDatabaseNames(Dexie.dependencies).then(cb);
        }
        catch (_a) {
            return rejection(new exceptions.MissingAPI());
        }
    },
    defineClass() {
        function Class(content) {
            extend(this, content);
        }
        return Class;
    },
    ignoreTransaction(scopeFunc) {
        return PSD.trans ?
            usePSD(PSD.transless, scopeFunc) :
            scopeFunc();
    },
    vip,
    async: function (generatorFn) {
        return function () {
            try {
                var rv = awaitIterator(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== 'function')
                    return DexiePromise.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        };
    },
    spawn: function (generatorFn, args, thiz) {
        try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== 'function')
                return DexiePromise.resolve(rv);
            return rv;
        }
        catch (e) {
            return rejection(e);
        }
    },
    currentTransaction: {
        get: () => PSD.trans || null
    },
    waitFor: function (promiseOrFunction, optionalTimeout) {
        const promise = DexiePromise.resolve(typeof promiseOrFunction === 'function' ?
            Dexie.ignoreTransaction(promiseOrFunction) :
            promiseOrFunction)
            .timeout(optionalTimeout || 60000);
        return PSD.trans ?
            PSD.trans.waitFor(promise) :
            promise;
    },
    Promise: DexiePromise,
    debug: {
        get: () => debug,
        set: value => {
            setDebug(value, value === 'dexie' ? () => true : dexieStackFrameFilter);
        }
    },
    derive: derive,
    extend: extend,
    props: props,
    override: override,
    Events: Events,
    on: globalEvents,
    liveQuery,
    extendObservabilitySet,
    getByKeyPath: getByKeyPath,
    setByKeyPath: setByKeyPath,
    delByKeyPath: delByKeyPath,
    shallowClone: shallowClone,
    deepClone: deepClone,
    getObjectDiff: getObjectDiff,
    cmp,
    asap: asap$1,
    minKey: minKey,
    addons: [],
    connections: connections,
    errnames: errnames,
    dependencies: domDeps,
    semVer: DEXIE_VERSION,
    version: DEXIE_VERSION.split('.')
        .map(n => parseInt(n))
        .reduce((p, c, i) => p + (c / Math.pow(10, i * 2))),
});
Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);

if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, updatedParts => {
        if (!propagatingLocally) {
            let event;
            if (isIEOrEdge) {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, true, true, updatedParts);
            }
            else {
                event = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
                    detail: updatedParts
                });
            }
            propagatingLocally = true;
            dispatchEvent(event);
            propagatingLocally = false;
        }
    });
    addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, ({ detail }) => {
        if (!propagatingLocally) {
            propagateLocally(detail);
        }
    });
}
function propagateLocally(updateParts) {
    let wasMe = propagatingLocally;
    try {
        propagatingLocally = true;
        globalEvents.storagemutated.fire(updateParts);
    }
    finally {
        propagatingLocally = wasMe;
    }
}
let propagatingLocally = false;

if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
        if (!propagatingLocally) {
            bc.postMessage(changedParts);
        }
    });
    bc.onmessage = (ev) => {
        if (ev.data)
            propagateLocally(ev.data);
    };
}
else if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
        try {
            if (!propagatingLocally) {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(STORAGE_MUTATED_DOM_EVENT_NAME, JSON.stringify({
                        trig: Math.random(),
                        changedParts,
                    }));
                }
                if (typeof self['clients'] === 'object') {
                    [...self['clients'].matchAll({ includeUncontrolled: true })].forEach((client) => client.postMessage({
                        type: STORAGE_MUTATED_DOM_EVENT_NAME,
                        changedParts,
                    }));
                }
            }
        }
        catch (_a) { }
    });
    addEventListener('storage', (ev) => {
        if (ev.key === STORAGE_MUTATED_DOM_EVENT_NAME) {
            const data = JSON.parse(ev.newValue);
            if (data)
                propagateLocally(data.changedParts);
        }
    });
    const swContainer = self.document && navigator.serviceWorker;
    if (swContainer) {
        swContainer.addEventListener('message', propagateMessageLocally);
    }
}
function propagateMessageLocally({ data }) {
    if (data && data.type === STORAGE_MUTATED_DOM_EVENT_NAME) {
        propagateLocally(data.changedParts);
    }
}

DexiePromise.rejectionMapper = mapError;
setDebug(debug, dexieStackFrameFilter);


//# sourceMappingURL=dexie.mjs.map

// EXTERNAL MODULE: ./lib/model.js
var model = __webpack_require__(118);
// EXTERNAL MODULE: ./lib/serve.js
var serve = __webpack_require__(775);
;// CONCATENATED MODULE: ./lib/index.js



let dbInstrance = null


/*
* expirationTime: 保存日志的天数
* isEmit: 是否在控制台打印日志
*/
class logDb  extends Dexie$1 {
    constructor(props = {}) {
         // 单例模式
        if(dbInstrance){
            return dbInstrance
        }
        const { databaseName = 'log' ,expirationTime, isEmit } = props;
        if (typeof databaseName !== 'string') {
            throw 'databaseName must be string';
        }
        super(databaseName);
        this.databaseName = databaseName;
        this.headers = [
            {label: 'ID', props: 'id'}, 
            {label: '时间戳', props: 'timeStamp' }, 
            {label: '记录时间', props: 'time'}, 
            {label: '记录内容', props: 'loggerInfo'},
            {label: '类型', props: 'logType'}, 
            {label: '最大内存限制', props: 'jsHeapSizeLimit'},
            {label: '可用内存', props: 'totalJSHeapSize'}, 
            {label: '已使用内存', props: 'usedJSHeapSize'},
        ];
        this.expirationTime = (expirationTime || 2) * 24 * 3600 * 1000; // 默认保留近2天的日志
        this.version(3).stores({
            logger: '++id, timeStamp,time',
        });
        this.logger = this.table('logger');
        this.isEmit = isEmit || true;
        this.getFilterDateLogger = model/* getFilterDateLogger.bind */.z.bind(this,this.logger)
        this.updateDatabase();
        this.socket = new serve/* default */.Z({db:this,room:10991}) // 启动在线分析
        dbInstrance = this
    }
    async updateDatabase() {
        this.getFilterDateLogger(0, new Date(Date.now() - this.expirationTime).getTime()).delete()
    }

   

    /*获取时间段内的所有数据
    * 参数说明： 
    * 不传则获取所有数据
    * 参数1： start 【日期字符串|日期对象|时间戳】开始时间，不传则从最初始开始查
    * 参数2：  end  【日期字符串|日期对象|时间戳】结束时间，不传则截止到最后一条
    */
    async get(start,end){
        const argumentList = arguments;
        let itemList;
        if(argumentList.length===0){
            itemList = await this.getFilterDateLogger().toArray() || [];
        }else{
            let startTime,endTime;
            startTime = new Date(start).getTime() || undefined
            if(end){
                endTime = new Date(end).getTime() + 999|| undefined
            }else{
                endTime = new Date(endTime+' 23:59:59').getTime() + 999 || undefined;
            }
            itemList  = await this.getFilterDateLogger(startTime,endTime).toArray() || [];
        }
       let logText = '';
       itemList.forEach((item,i)=>{
        logText += `[${i + 1}]: ${item.time} ${item.loggerInfo} \n`;
       })
        console.info(logText)
        return itemList
    }
    // 获取日期为维度的所有数据，适用于数据量少的场合
    async getDate(dateString){
        let itemList;
        if(typeof dateString === 'string'){
            const start = new Date(dateString+' 00:00:00').getTime() || undefined;
            const end = new Date(dateString+' 23:59:59').getTime() + 999 || undefined;
            itemList  = await this.getFilterDateLogger(start,end).toArray() || [];
        }else{
            itemList = await this.getFilterDateLogger().toArray() || [];
        }
        
        const dateMap = {};
        itemList.forEach(item=>{
            const date =  item.time.split(' ')[0];
            if(!dateMap[date]){ dateMap[date] = [] }
            dateMap[date].push(item);
        });
        const resultData = {};
        Object.keys(dateMap).forEach(key=>{
            var logText = '';
            dateMap[key].forEach((data,i)=>{
                logText += `[${i + 1}]: ${data.time} ${data.loggerInfo} \n`;
            });
            resultData[key] = logText;
        });

        if(typeof dateString === 'string'){
            console.info(resultData[dateString]);
            return resultData[dateString];
        }else {
            console.info(resultData);
            return resultData;
        } 
        
    }

    // 日志上传
    async upload(){
        const url = 'http://172.16.30.231:7002/logAnalysis/get'
        try{
            const data = await fetch(url,{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    name: 'CaiCai',
                    age: '26',
                })
            })
            .then(response => response.json())
            if(data.result==100){
                console.info('上传成功')
            }
        }catch{
            console.info('上传请求失败')
        }
       
    }

    // 添加日志
    log(...data) {
        if(this.isEmit){
            if(!data.length)  {
                console.info('db.log传入为空');
            }else{
                console.info.apply(null,data);
            }
        }
        const timeStamp = Date.now();
        var logType = 'log'
        if(data.length>1&&typeof data[0] === 'string'&& data[0].length<20){
            logType = data[0]
            data.splice(0,1) 
        }
        
        try{
            data.push('') // 避免data长度为1时， 以下reduce直接略过
            const loggerInfo = data.length ? (data.reduce((str = '',log)=>{
                return str = (typeof str === 'string' ? str : JSON.stringify(str))+' ' + (typeof log === 'string' ? log : JSON.stringify(log)) ;
            })) : '';

            this.logger.add({
                timeStamp,
                time: new Date(timeStamp).format('yyyy-MM-dd hh:mm:ss'),
                logType,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // 最大内存限制
                totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024, // 总内存的大小
                usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024, // JS占用内存 如果大于totalJSHeapSize 极大可能内存泄漏
                loggerInfo
                
            });
            this.socket.sendOnceLog({
                timeStamp,
                time: new Date(timeStamp).format('yyyy-MM-dd hh:mm:ss'),
                loggerInfo
            })
        }catch(err){
            console.info(err);
        }
        
    }  
}

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});