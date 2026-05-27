'use client';
/**
 * Copyright 2025 Aiden Bai, Million Software, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the “Software”), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lite/index.ts
var lite_exports = {};
__export(lite_exports, {
  instrument: () => instrument
});
module.exports = __toCommonJS(lite_exports);
var import_bippy5 = require("bippy");

// src/lite/constants.ts
var DEFAULT_LOCATION = "ReactScanLite";
var DEFAULT_MAX_FIBERS_PER_COMMIT = 5e3;
var DEFAULT_MIN_FIBER_ACTUAL_DURATION_MS = 0;
var REACT_TOTAL_NUM_LANES = 31;
var SCHEDULER_PRIORITY_NAMES = {
  0: "NoPriority",
  1: "Immediate",
  2: "UserBlocking",
  3: "Normal",
  4: "Low",
  5: "Idle"
};

// src/lite/create-emitter.ts
var createEmitter = (options) => {
  var _a;
  const listeners = /* @__PURE__ */ new Set();
  if (options.onEvent) listeners.add(options.onEvent);
  const endpoint = options.endpoint;
  const sessionId = options.sessionId;
  const locationPrefix = (_a = options.location) != null ? _a : DEFAULT_LOCATION;
  const canPostToEndpoint = Boolean(endpoint && sessionId);
  let isActive = true;
  let translator = null;
  const emit = (kind, partial) => {
    if (!isActive) return;
    if (listeners.size === 0 && !canPostToEndpoint) return;
    const timestamp = performance.now();
    const event = {
      kind,
      timestamp,
      ...partial
    };
    if (translator) {
      if (event.lanes != null && event.laneLabels === void 0) {
        const labels = translator.laneLabels(event.lanes);
        if (labels) event.laneLabels = labels;
      }
      if (event.priorityLevel != null && event.priorityName === void 0) {
        const name = translator.priorityName(event.priorityLevel);
        if (name) event.priorityName = name;
      }
    }
    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
      }
    }
    if (canPostToEndpoint) {
      try {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            location: `${locationPrefix}:${kind}`,
            message: kind,
            data: event,
            timestamp
          }),
          keepalive: true
        }).catch(() => {
        });
      } catch {
      }
    }
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const setLaneLabelTranslator = (next) => {
    translator = next;
  };
  const dispose = () => {
    isActive = false;
    listeners.clear();
    translator = null;
  };
  return {
    emitter: { emit, subscribe },
    control: { setLaneLabelTranslator, dispose }
  };
};

// src/lite/create-profiling-hooks.ts
var import_bippy = require("bippy");
var componentNameOf = (fiber) => {
  var _a;
  return (_a = (0, import_bippy.getDisplayName)(fiber.type)) != null ? _a : "Anonymous";
};
var createProfilingHooks = (emitter) => ({
  markCommitStarted: (lanes) => emitter.emit("commit-start", { lanes }),
  markCommitStopped: () => emitter.emit("commit-stop"),
  markRenderStarted: (lanes) => emitter.emit("render-start", { lanes }),
  markRenderYielded: () => emitter.emit("render-yield"),
  markRenderStopped: () => emitter.emit("render-stop"),
  markRenderScheduled: (lane) => emitter.emit("render-scheduled", { lanes: lane }),
  markLayoutEffectsStarted: (lanes) => emitter.emit("layout-effects-start", { lanes }),
  markLayoutEffectsStopped: () => emitter.emit("layout-effects-stop"),
  markPassiveEffectsStarted: (lanes) => emitter.emit("passive-effects-start", { lanes }),
  markPassiveEffectsStopped: () => emitter.emit("passive-effects-stop"),
  markComponentRenderStarted: (fiber) => emitter.emit("component-render-start", { componentName: componentNameOf(fiber) }),
  markComponentRenderStopped: () => emitter.emit("component-render-stop"),
  markComponentLayoutEffectMountStarted: (fiber) => emitter.emit("component-layout-effect-mount-start", {
    componentName: componentNameOf(fiber)
  }),
  markComponentLayoutEffectMountStopped: () => emitter.emit("component-layout-effect-mount-stop"),
  markComponentLayoutEffectUnmountStarted: (fiber) => emitter.emit("component-layout-effect-unmount-start", {
    componentName: componentNameOf(fiber)
  }),
  markComponentLayoutEffectUnmountStopped: () => emitter.emit("component-layout-effect-unmount-stop"),
  markComponentPassiveEffectMountStarted: (fiber) => emitter.emit("component-passive-effect-mount-start", {
    componentName: componentNameOf(fiber)
  }),
  markComponentPassiveEffectMountStopped: () => emitter.emit("component-passive-effect-mount-stop"),
  markComponentPassiveEffectUnmountStarted: (fiber) => emitter.emit("component-passive-effect-unmount-start", {
    componentName: componentNameOf(fiber)
  }),
  markComponentPassiveEffectUnmountStopped: () => emitter.emit("component-passive-effect-unmount-stop"),
  markStateUpdateScheduled: (fiber, lane) => emitter.emit("state-update", { componentName: componentNameOf(fiber), lanes: lane }),
  markForceUpdateScheduled: (fiber, lane) => emitter.emit("force-update", { componentName: componentNameOf(fiber), lanes: lane }),
  markComponentSuspended: (fiber, _wakeable, lanes) => emitter.emit("component-suspended", {
    componentName: componentNameOf(fiber),
    lanes
  }),
  markComponentErrored: (fiber, thrownValue, lanes) => {
    const message = thrownValue && typeof thrownValue === "object" && "message" in thrownValue ? String(thrownValue.message) : String(thrownValue);
    emitter.emit("component-errored", {
      componentName: componentNameOf(fiber),
      lanes,
      message
    });
  }
});

// src/lite/lane-labels.ts
var noLaneLabels = () => void 0;
var priorityNameFromLevel = (priorityLevel) => {
  if (priorityLevel == null) return void 0;
  return SCHEDULER_PRIORITY_NAMES[priorityLevel];
};
var createLaneLabelTranslator = (renderers) => {
  let laneToLabel = null;
  for (const renderer of renderers) {
    if (typeof renderer.getLaneLabelMap !== "function") continue;
    try {
      const map = renderer.getLaneLabelMap();
      if (map && map.size > 0) {
        laneToLabel = map;
        break;
      }
    } catch {
    }
  }
  if (!laneToLabel) {
    return {
      translator: { laneLabels: noLaneLabels, priorityName: priorityNameFromLevel },
      hasLaneLabelMap: false
    };
  }
  const resolvedMap = laneToLabel;
  const laneLabels = (lanes) => {
    if (lanes == null || lanes === 0) return void 0;
    const labels = [];
    let lane = 1;
    for (let index = 0; index < REACT_TOTAL_NUM_LANES; index++) {
      if (lane & lanes) {
        const label = resolvedMap.get(lane);
        if (label) labels.push(label);
      }
      lane *= 2;
    }
    return labels.length > 0 ? labels : void 0;
  };
  return {
    translator: { laneLabels, priorityName: priorityNameFromLevel },
    hasLaneLabelMap: true
  };
};

// src/lite/walk-fiber.ts
var import_bippy4 = require("bippy");

// src/lite/change-description.ts
var import_bippy2 = require("bippy");
var objectIs = Object.is;
var isCompositeTag = (tag) => tag === import_bippy2.FunctionComponentTag || tag === import_bippy2.ClassComponentTag || tag === import_bippy2.ForwardRefTag || tag === import_bippy2.MemoComponentTag || tag === import_bippy2.SimpleMemoComponentTag;
var collectChangedProps = (fiber) => {
  if (fiber.alternate === null) return [];
  const changed = [];
  (0, import_bippy2.traverseProps)(fiber, (propName, nextValue, prevValue) => {
    if (!objectIs(prevValue, nextValue)) changed.push(propName);
  });
  return changed;
};
var didAnyContextChange = (fiber) => {
  let changed = false;
  (0, import_bippy2.traverseContexts)(fiber, (nextContext, prevContext) => {
    if (!nextContext || !prevContext) return;
    if (nextContext.context !== prevContext.context) {
      changed = false;
      return true;
    }
    if (!objectIs(prevContext.memoizedValue, nextContext.memoizedValue)) {
      changed = true;
      return true;
    }
  });
  return changed;
};
var didAnyClassStateChange = (fiber) => {
  var _a;
  const previousState = (_a = fiber.alternate) == null ? void 0 : _a.memoizedState;
  const nextState = fiber.memoizedState;
  if (!previousState || !nextState || typeof previousState !== "object" || typeof nextState !== "object") {
    return previousState !== nextState;
  }
  const previousObject = previousState;
  const nextObject = nextState;
  const allKeys = /* @__PURE__ */ new Set([
    ...Object.keys(previousObject),
    ...Object.keys(nextObject)
  ]);
  for (const key of allKeys) {
    if (!objectIs(previousObject[key], nextObject[key])) return true;
  }
  return false;
};
var collectChangedHookIndices = (fiber) => {
  const indices = [];
  let index = 0;
  (0, import_bippy2.traverseState)(fiber, (nextState, prevState) => {
    if (nextState && prevState && !objectIs(prevState.memoizedState, nextState.memoizedState)) {
      indices.push(index);
    }
    index++;
  });
  return indices;
};
var getChangeDescription = (fiber, parentRendered) => {
  const tag = fiber.tag;
  if (!isCompositeTag(tag)) return null;
  if (fiber.alternate === null) {
    return {
      isFirstMount: true,
      props: null,
      state: false,
      context: false,
      hooks: [],
      parent: false
    };
  }
  if (tag === import_bippy2.ClassComponentTag) {
    return {
      isFirstMount: false,
      props: collectChangedProps(fiber),
      state: didAnyClassStateChange(fiber),
      context: didAnyContextChange(fiber),
      hooks: [],
      parent: parentRendered
    };
  }
  return {
    isFirstMount: false,
    props: collectChangedProps(fiber),
    state: false,
    context: didAnyContextChange(fiber),
    hooks: collectChangedHookIndices(fiber),
    parent: parentRendered
  };
};

// src/lite/fiber-source.ts
var import_bippy3 = require("bippy");
var import_source = require("bippy/source");
var getFiberSource = (fiber) => {
  if ((0, import_source.hasDebugSource)(fiber)) {
    return {
      fileName: fiber._debugSource.fileName,
      lineNumber: fiber._debugSource.lineNumber,
      columnNumber: fiber._debugSource.columnNumber
    };
  }
  if ((0, import_source.hasDebugStack)(fiber)) {
    try {
      const ownerStack = (0, import_source.formatOwnerStack)(fiber._debugStack.stack);
      if (ownerStack) {
        const firstFrame = (0, import_source.parseStack)(ownerStack)[0];
        if (firstFrame == null ? void 0 : firstFrame.fileName) {
          return {
            fileName: firstFrame.fileName,
            lineNumber: firstFrame.lineNumber,
            columnNumber: firstFrame.columnNumber,
            functionName: firstFrame.functionName
          };
        }
      }
    } catch {
    }
  }
  return null;
};
var getOwnerName = (fiber) => {
  const owner = fiber._debugOwner;
  if (!owner) return null;
  return (0, import_bippy3.getDisplayName)(owner.type);
};

// src/lite/walk-fiber.ts
var compositeFiberDidRender = (fiber) => {
  const actualDuration = fiber.actualDuration;
  return actualDuration != null && actualDuration > 0 && isCompositeTag(fiber.tag);
};
var walkFiber = (rootFiber, options) => {
  var _a, _b, _c, _d, _e;
  const summaries = [];
  if (!rootFiber) return summaries;
  const pendingSiblings = [];
  let currentFiber = rootFiber;
  let currentDepth = 0;
  let hasCascadingAncestor = false;
  while (currentFiber || pendingSiblings.length > 0) {
    if (summaries.length >= options.maxFibers) return summaries;
    if ((_a = options.isCancelled) == null ? void 0 : _a.call(options)) return summaries;
    if (!currentFiber) {
      const next = pendingSiblings.pop();
      currentFiber = next.fiber;
      currentDepth = next.depth;
      hasCascadingAncestor = next.hasCascadingAncestor;
      continue;
    }
    const actualDuration = currentFiber.actualDuration;
    if (actualDuration != null && actualDuration >= options.minActualDurationMs) {
      const summary = {
        name: (_b = (0, import_bippy4.getDisplayName)(currentFiber.type)) != null ? _b : "Anonymous",
        depth: currentDepth,
        tag: currentFiber.tag,
        actualDuration,
        actualStartTime: (_c = currentFiber.actualStartTime) != null ? _c : 0,
        selfBaseDuration: (_d = currentFiber.selfBaseDuration) != null ? _d : 0,
        treeBaseDuration: (_e = currentFiber.treeBaseDuration) != null ? _e : 0
      };
      if (options.includeFiberIdentity) {
        summary.fiberId = (0, import_bippy4.getFiberId)(currentFiber);
      }
      if (options.includeFiberSource) {
        summary.source = getFiberSource(currentFiber);
        summary.ownerName = getOwnerName(currentFiber);
      }
      if (options.recordChangeDescriptions) {
        summary.changeDescription = getChangeDescription(
          currentFiber,
          hasCascadingAncestor
        );
      }
      summaries.push(summary);
    }
    if (currentFiber.sibling) {
      pendingSiblings.push({
        fiber: currentFiber.sibling,
        depth: currentDepth,
        hasCascadingAncestor
      });
    }
    if (currentFiber.child) {
      if (options.recordChangeDescriptions && !hasCascadingAncestor && compositeFiberDidRender(currentFiber)) {
        hasCascadingAncestor = true;
      }
      currentFiber = currentFiber.child;
      currentDepth = currentDepth + 1;
    } else {
      currentFiber = null;
    }
  }
  return summaries;
};

// src/lite/index.ts
var noopHandle = {
  stop: () => {
  },
  isActive: () => false,
  subscribe: () => () => {
  }
};
var errorToMessage = (cause) => {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "string") return cause;
  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
};
var tryInjectProfilingHooks = (renderer, profilingHooks) => {
  const rendererWithProfiling = renderer;
  if (typeof rendererWithProfiling.injectProfilingHooks !== "function") {
    return { available: false, reason: "no-inject-method" };
  }
  try {
    rendererWithProfiling.injectProfilingHooks(profilingHooks);
    return { available: true };
  } catch (cause) {
    return { available: false, reason: "threw", error: errorToMessage(cause) };
  }
};
var isValidEndpointUrl = (candidate) => {
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
var instrument = (options = {}) => {
  var _a, _b;
  if (typeof window === "undefined") return noopHandle;
  if (window.__REACT_SCAN_LITE__) return window.__REACT_SCAN_LITE__;
  if (options.endpoint && !options.sessionId) {
    console.warn(
      "[react-scan/lite] `endpoint` requires `sessionId`; events will not be POSTed."
    );
  }
  let effectiveEndpoint = options.endpoint;
  if (effectiveEndpoint && !isValidEndpointUrl(effectiveEndpoint)) {
    console.error(
      "[react-scan/lite] `endpoint` is not a valid http(s) URL; events will not be POSTed."
    );
    effectiveEndpoint = void 0;
  }
  if (options.includeFiberTree === false && (options.recordChangeDescriptions === true || options.includeFiberSource === true || options.includeFiberIdentity === true)) {
    console.warn(
      "[react-scan/lite] `includeFiberTree: false` disables per-fiber enrichment options (`recordChangeDescriptions`, `includeFiberSource`, `includeFiberIdentity`). Remove `includeFiberTree: false` to enable them."
    );
  }
  const { emitter, control: emitterControl } = createEmitter({
    ...options,
    endpoint: effectiveEndpoint
  });
  const profilingHooks = createProfilingHooks(emitter);
  const includeFiberTree = options.includeFiberTree !== false;
  const includeProfilingHooks = options.includeProfilingHooks !== false;
  const includeLaneLabels = options.includeLaneLabels !== false;
  const maxFibers = (_a = options.maxFibersPerCommit) != null ? _a : DEFAULT_MAX_FIBERS_PER_COMMIT;
  const minActualDurationMs = (_b = options.minFiberActualDurationMs) != null ? _b : DEFAULT_MIN_FIBER_ACTUAL_DURATION_MS;
  const recordChangeDescriptions = options.recordChangeDescriptions === true;
  const includeFiberSource = options.includeFiberSource === true;
  const includeFiberIdentity = options.includeFiberIdentity === true;
  const attachedRenderers = /* @__PURE__ */ new WeakSet();
  let isStopped = false;
  const hook = (0, import_bippy5.getRDTHook)();
  let foundRealLaneLabelMap = false;
  const refreshLaneLabelTranslator = () => {
    if (!includeLaneLabels) return;
    if (foundRealLaneLabelMap) return;
    const result = createLaneLabelTranslator(
      Array.from(hook.renderers.values())
    );
    emitterControl.setLaneLabelTranslator(result.translator);
    if (result.hasLaneLabelMap) foundRealLaneLabelMap = true;
  };
  const attachOneRenderer = (renderer) => {
    if (isStopped) return;
    if (attachedRenderers.has(renderer)) return;
    attachedRenderers.add(renderer);
    const outcome = includeProfilingHooks ? tryInjectProfilingHooks(renderer, profilingHooks) : { available: false, reason: "opted-out" };
    emitter.emit("renderer-injected", {
      data: { version: renderer.version, bundleType: renderer.bundleType }
    });
    emitter.emit("profiling-hooks-status", {
      available: outcome.available,
      reason: outcome.reason,
      error: outcome.error,
      reactVersion: renderer.version,
      bundleType: renderer.bundleType
    });
    refreshLaneLabelTranslator();
  };
  const attachAllExisting = () => {
    if (isStopped) return;
    for (const renderer of Array.from(hook.renderers.values())) {
      attachOneRenderer(renderer);
    }
  };
  if (includeProfilingHooks && (0, import_bippy5.isRealReactDevtools)(hook)) {
    console.warn(
      "[react-scan/lite] React DevTools is also attached. Calling injectProfilingHooks replaces its profiling channel; the DevTools Timeline Profiler may stop receiving events while this instrumentation is active."
    );
  }
  const originalInject = hook.inject;
  const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
  const originalOnPostCommitFiberRoot = hook.onPostCommitFiberRoot;
  const originalOnCommitFiberUnmount = hook.onCommitFiberUnmount;
  const ourInject = (renderer) => {
    const rendererId = originalInject.call(hook, renderer);
    if (!isStopped) attachOneRenderer(renderer);
    return rendererId;
  };
  const ourOnCommitFiberRoot = (rendererId, root, priority, didError) => {
    if (originalOnCommitFiberRoot) {
      try {
        originalOnCommitFiberRoot.call(
          hook,
          rendererId,
          root,
          priority,
          didError
        );
      } catch {
      }
    }
    if (isStopped) return;
    const tree = includeFiberTree ? walkFiber(root.current, {
      maxFibers,
      minActualDurationMs,
      recordChangeDescriptions,
      includeFiberSource,
      includeFiberIdentity,
      isCancelled: () => isStopped
    }) : void 0;
    emitter.emit("commit", {
      rendererId,
      // HACK: bippy types `priority` as `number | void`. React actually
      // passes a Scheduler priority (1-5); narrow to `SchedulerPriorityLevel`.
      priorityLevel: priority,
      didError: didError === true ? true : void 0,
      tree
    });
  };
  const ourOnPostCommitFiberRoot = (rendererId, root) => {
    if (originalOnPostCommitFiberRoot) {
      try {
        originalOnPostCommitFiberRoot.call(hook, rendererId, root);
      } catch {
      }
    }
    if (isStopped) return;
    emitter.emit("post-commit", { rendererId });
  };
  const ourOnCommitFiberUnmount = (rendererId, fiber) => {
    if (originalOnCommitFiberUnmount) {
      try {
        originalOnCommitFiberUnmount.call(hook, rendererId, fiber);
      } catch {
      }
    }
    if (isStopped) return;
    emitter.emit("fiber-unmount", { rendererId });
  };
  hook.inject = ourInject;
  hook.onCommitFiberRoot = ourOnCommitFiberRoot;
  hook.onPostCommitFiberRoot = ourOnPostCommitFiberRoot;
  hook.onCommitFiberUnmount = ourOnCommitFiberUnmount;
  attachAllExisting();
  const handle = {
    stop: () => {
      if (isStopped) return;
      isStopped = true;
      if (hook.inject === ourInject) hook.inject = originalInject;
      if (hook.onCommitFiberRoot === ourOnCommitFiberRoot) {
        hook.onCommitFiberRoot = originalOnCommitFiberRoot;
      }
      if (hook.onPostCommitFiberRoot === ourOnPostCommitFiberRoot) {
        hook.onPostCommitFiberRoot = originalOnPostCommitFiberRoot;
      }
      if (hook.onCommitFiberUnmount === ourOnCommitFiberUnmount) {
        hook.onCommitFiberUnmount = originalOnCommitFiberUnmount;
      }
      emitterControl.dispose();
      if (window.__REACT_SCAN_LITE__ === handle) {
        delete window.__REACT_SCAN_LITE__;
      }
    },
    isActive: () => !isStopped,
    subscribe: (listener) => emitter.subscribe(listener)
  };
  window.__REACT_SCAN_LITE__ = handle;
  return handle;
};
