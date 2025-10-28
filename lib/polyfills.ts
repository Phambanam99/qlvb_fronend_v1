/**
 * Polyfills cho các trình duyệt cũ (IE11, Safari cũ, v.v.)
 * Import file này trong app/layout.tsx
 */

// Polyfill cho String.prototype.includes
if (!String.prototype.includes) {
  String.prototype.includes = function (search: string, start?: number) {
    'use strict';

    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill cho Array.prototype.includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement: any, fromIndex?: number) {
    'use strict';

    const O = Object(this);
    const len = parseInt(O.length, 10) || 0;

    if (len === 0) {
      return false;
    }

    const n = parseInt(fromIndex, 10) || 0;
    let k: number;

    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }

    while (k < len) {
      const currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }

    return false;
  };
}

// Polyfill cho Array.from
if (!Array.from) {
  Array.from = (function () {
    const toStr = Object.prototype.toString;
    const isCallable = function (fn: any) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    const toInteger = function (value: any) {
      const number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    const maxSafeInteger = Math.pow(2, 53) - 1;
    const toLength = function (value: any) {
      const len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(arrayLike: any, mapFn?: any, thisArg?: any) {
      const C = this;
      const items = Object(arrayLike);

      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      const mapFunction = arguments.length > 1 ? mapFn : undefined;
      let T;
      if (typeof mapFunction !== 'undefined') {
        if (!isCallable(mapFunction)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = thisArg;
        }
      }

      const len = toLength(items.length);
      const A = isCallable(C) ? Object(new C(len)) : new Array(len);
      let k = 0;
      let kValue;

      while (k < len) {
        kValue = items[k];
        if (mapFunction) {
          A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }

      A.length = len;
      return A;
    };
  })();
}

// Polyfill cho Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function (target: any, ...sources: any[]) {

    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];

      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }

    return to;
  };
}

// Polyfill cho Object.values
if (!Object.values) {
  Object.values = function (obj: any) {
    const res = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        res.push(obj[key]);
      }
    }
    return res;
  };
}

// Polyfill cho Object.entries
if (!Object.entries) {
  Object.entries = function (obj: any) {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
}

// Polyfill cho Promise.finally
if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
  Promise.prototype.finally = function (onFinally?: () => void) {
    return this.then(
      (value) => Promise.resolve(onFinally && onFinally()).then(() => value),
      (reason) =>
        Promise.resolve(onFinally && onFinally()).then(() => {
          throw reason;
        })
    );
  };
}

// Polyfill cho Number.isNaN
if (!Number.isNaN) {
  Number.isNaN = function (value: any) {
    return typeof value === 'number' && isNaN(value);
  };
}

// Polyfill cho Number.isFinite
if (!Number.isFinite) {
  Number.isFinite = function (value: any) {
    return typeof value === 'number' && isFinite(value);
  };
}

// Polyfill cho startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search: string, pos?: number) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}

// Polyfill cho endsWith
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search: string, thisLen?: number) {
    if (thisLen === undefined || thisLen > this.length) {
      thisLen = this.length;
    }
    return this.substring(thisLen - search.length, thisLen) === search;
  };
}

// Polyfill cho Array.prototype.find
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate: (value: any, index: number, obj: any[]) => boolean, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    const list = Object(this);
    const length = list.length >>> 0;
    let i = 0;

    while (i < length) {
      const value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
      i++;
    }

    return undefined;
  };
}

// Polyfill cho Array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (predicate: (value: any, index: number, obj: any[]) => boolean, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    const list = Object(this);
    const length = list.length >>> 0;
    let i = 0;

    while (i < length) {
      const value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
      i++;
    }

    return -1;
  };
}

// Console polyfill cho IE
if (typeof window !== 'undefined' && typeof console === 'undefined') {
  (window as any).console = {
    log: function () {},
    warn: function () {},
    error: function () {},
    info: function () {},
    debug: function () {},
  };
}

// RequestAnimationFrame polyfill
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (function () {
    return (
      (window as any).webkitRequestAnimationFrame ||
      (window as any).mozRequestAnimationFrame ||
      function (callback: FrameRequestCallback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
}

// CancelAnimationFrame polyfill
if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (function () {
    return (
      (window as any).webkitCancelAnimationFrame ||
      (window as any).mozCancelAnimationFrame ||
      function (id: number) {
        window.clearTimeout(id);
      }
    );
  })();
}

// CustomEvent polyfill cho IE
if (typeof window !== 'undefined' && typeof (window as any).CustomEvent !== 'function') {
  function CustomEvent(event: string, params: any) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  (window as any).CustomEvent = CustomEvent;
}

// Export empty object để có thể import
export {};
