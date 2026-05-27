'use client';
!function(t){"use strict";var e,n="bippy-0.5.39",r=Object.defineProperty,i=Object.prototype.hasOwnProperty,o=()=>{},s=t=>{try{Function.prototype.toString.call(t).indexOf("^_^")>-1&&setTimeout(()=>{throw Error("React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build")})}catch{}},_=!1,c=(t=globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__)=>!!_||(t&&"function"==typeof t.inject&&(e=t.inject.toString()),!!(null==e?void 0:e.includes("(injected)"))),a=new Set,u=new Set,l=t=>{let e=new Map,i=0,_={_instrumentationIsActive:!1,_instrumentationSource:n,checkDCE:s,hasUnsupportedRendererAttached:!1,inject(t){let n=++i;return e.set(n,t),u.add(t),_._instrumentationIsActive||(_._instrumentationIsActive=!0,a.forEach(t=>t())),n},on:o,onCommitFiberRoot:o,onCommitFiberUnmount:o,onPostCommitFiberRoot:o,renderers:e,supportsFiber:!0,supportsFlight:!0};try{r(globalThis,"__REACT_DEVTOOLS_GLOBAL_HOOK__",{configurable:!0,enumerable:!0,get:()=>_,set(e){if(e&&"object"==typeof e){let n=_.renderers;_=e,n.size>0&&(n.forEach((t,n)=>{u.add(t),e.renderers.set(n,t)}),d(t))}}});let e=window.hasOwnProperty,n=!1;r(window,"hasOwnProperty",{configurable:!0,value:function(...t){try{if(!n&&"__REACT_DEVTOOLS_GLOBAL_HOOK__"===t[0])return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__=void 0,n=!0,-0}catch{}return e.apply(this,t)},writable:!0})}catch{d(t)}return _},d=t=>{t&&a.add(t);try{let e=globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!e)return;if(!e._instrumentationSource){e.checkDCE=s,e.supportsFiber=!0,e.supportsFlight=!0,e.hasUnsupportedRendererAttached=!1,e._instrumentationSource=n,e._instrumentationIsActive=!1;let t=((t=globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__)=>!(!t||!("getFiberRoots"in t)))(e);if(t||(e.on=o),e.renderers.size)return e._instrumentationIsActive=!0,void a.forEach(t=>t());let r=e.inject,i=c(e);i&&!t&&(_=!0,e.inject({scheduleRefresh(){}})&&(e._instrumentationIsActive=!0)),e.inject=t=>{let n=r(t);return u.add(t),i&&e.renderers.set(n,t),e._instrumentationIsActive=!0,a.forEach(t=>t()),n}}(e.renderers.size||e._instrumentationIsActive||c())&&(null==t||t())}catch{}},O=t=>i.call(globalThis,"__REACT_DEVTOOLS_GLOBAL_HOOK__")?(d(t),globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__):l(t);(()=>{try{typeof window<"u"&&((null==(t=window.document)?void 0:t.createElement)||"ReactNative"===(null==(e=window.navigator)?void 0:e.product))&&O()}catch{}var t,e})(),
/*! Bundled license information:

bippy/dist/rdt-hook.js:
bippy/dist/install-hook-only.js:
bippy/dist/core.js:
bippy/dist/index.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
t.init=O}({});