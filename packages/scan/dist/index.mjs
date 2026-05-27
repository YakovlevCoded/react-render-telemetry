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
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/polyfills.ts
if (!Array.prototype.toSorted) {
  Object.defineProperty(Array.prototype, "toSorted", {
    value: function(compareFn) {
      return [...this].sort(compareFn);
    },
    writable: true,
    configurable: true
  });
}

// src/index.ts
import "bippy";

// src/core/index.ts
import { signal as signal7 } from "@preact/signals";
import {
  detectReactBuildType,
  getRDTHook,
  getType as getType5,
  isInstrumentationActive
} from "bippy";

// src/new-outlines/index.ts
import {
  didFiberCommit as didFiberCommit2,
  getDisplayName as getDisplayName5,
  getFiberId as getFiberId3,
  getNearestHostFibers,
  getTimings as getTimings3,
  getType as getType4,
  isCompositeFiber as isCompositeFiber2
} from "bippy";

// src/core/instrumentation.ts
import { signal as signal5 } from "@preact/signals";
import {
  ClassComponentTag as ClassComponentTag2,
  ForwardRefTag as ForwardRefTag2,
  FunctionComponentTag as FunctionComponentTag3,
  MemoComponentTag as MemoComponentTag3,
  SimpleMemoComponentTag as SimpleMemoComponentTag3,
  didFiberCommit,
  getDisplayName as getDisplayName4,
  getFiberId as getFiberId2,
  getMutatedHostFibers,
  getTimings as getTimings2,
  getType as getType3,
  hasMemoCache as hasMemoCache2,
  instrument,
  traverseContexts,
  traverseProps,
  traverseRenderedFibers
} from "bippy";
import { isValidElement } from "preact";

// src/core/utils.ts
import { getType } from "bippy";

// src/web/utils/constants.ts
var IS_CLIENT = typeof window !== "undefined";

// src/core/utils.ts
function descending(a, b) {
  return b - a;
}
function getComponentGroupNames(group) {
  let result = group[0].name;
  const len = group.length;
  const max = Math.min(4, len);
  for (let i = 1; i < max; i++) {
    result += `, ${group[i].name}`;
  }
  return result;
}
function getComponentGroupTotalTime(group) {
  let result = group[0].time;
  for (let i = 1, len = group.length; i < len; i++) {
    result += group[i].time;
  }
  return result;
}
function componentGroupHasForget(group) {
  for (let i = 0, len = group.length; i < len; i++) {
    if (group[i].forget) {
      return true;
    }
  }
  return false;
}
var getLabelText = (groupedAggregatedRenders) => {
  let labelText = "";
  const componentsByCount = /* @__PURE__ */ new Map();
  for (const aggregatedRender of groupedAggregatedRenders) {
    const { forget, time, aggregatedCount, name } = aggregatedRender;
    if (!componentsByCount.has(aggregatedCount)) {
      componentsByCount.set(aggregatedCount, []);
    }
    const components = componentsByCount.get(aggregatedCount);
    if (components) {
      components.push({ name, forget, time: time != null ? time : 0 });
    }
  }
  const sortedCounts = Array.from(componentsByCount.keys()).sort(descending);
  const parts = [];
  let cumulativeTime = 0;
  for (const count of sortedCounts) {
    const componentGroup = componentsByCount.get(count);
    if (!componentGroup) continue;
    let text = getComponentGroupNames(componentGroup);
    const totalTime = getComponentGroupTotalTime(componentGroup);
    const hasForget = componentGroupHasForget(componentGroup);
    cumulativeTime += totalTime;
    if (componentGroup.length > 4) {
      text += "\u2026";
    }
    if (count > 1) {
      text += ` \xD7 ${count}`;
    }
    if (hasForget) {
      text = `\u2728${text}`;
    }
    parts.push(text);
  }
  labelText = parts.join(", ");
  if (!labelText.length) return null;
  if (labelText.length > 40) {
    labelText = `${labelText.slice(0, 40)}\u2026`;
  }
  if (cumulativeTime >= 0.01) {
    labelText += ` (${Number(cumulativeTime.toFixed(2))}ms)`;
  }
  return labelText;
};
function isEqual(a, b) {
  return a === b || a !== a && b !== b;
}
var not_globally_unique_generateId = () => {
  if (!IS_CLIENT) {
    return "0";
  }
  if (window.reactScanIdCounter === void 0) {
    window.reactScanIdCounter = 0;
  }
  return `${++window.reactScanIdCounter}`;
};
var playNotificationSound = (audioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  const options = {
    type: "sine",
    freq: [
      392,
      //  523.25,
      600
      //  659.25
    ],
    duration: 0.3,
    gain: 0.12
  };
  const frequencies = options.freq;
  const timePerNote = options.duration / frequencies.length;
  frequencies.forEach((freq, i) => {
    oscillator.frequency.setValueAtTime(
      freq,
      audioContext.currentTime + i * timePerNote
    );
  });
  oscillator.type = options.type;
  gainNode.gain.setValueAtTime(options.gain, audioContext.currentTime);
  gainNode.gain.setTargetAtTime(
    0,
    audioContext.currentTime + options.duration * 0.7,
    0.05
  );
  oscillator.start();
  oscillator.stop(audioContext.currentTime + options.duration);
};

// src/web/views/inspector/timeline/utils.ts
import {
  ClassComponentTag,
  ForwardRefTag,
  FunctionComponentTag as FunctionComponentTag2,
  MemoComponentTag as MemoComponentTag2,
  SimpleMemoComponentTag as SimpleMemoComponentTag2
} from "bippy";

// src/web/views/inspector/utils.ts
import {
  FunctionComponentTag,
  getDisplayName as getDisplayName3,
  getTimings,
  isCompositeFiber,
  isHostFiber,
  traverseFiber
} from "bippy";

// src/web/views/inspector/index.tsx
import { computed, untracked, useSignalEffect } from "@preact/signals";
import { Component } from "preact";
import { useEffect as useEffect6, useRef as useRef5 } from "preact/hooks";

// src/web/components/icon/index.tsx
import { forwardRef } from "preact/compat";
import { jsx, jsxs } from "preact/jsx-runtime";
var Icon = forwardRef(({
  size = 15,
  name,
  fill = "currentColor",
  stroke = "currentColor",
  className,
  externalURL = "",
  style
}, ref) => {
  const width = Array.isArray(size) ? size[0] : size;
  const height = Array.isArray(size) ? size[1] || size[0] : size;
  const path = `${externalURL}#${name}`;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      ref,
      width: `${width}px`,
      height: `${height}px`,
      fill,
      stroke,
      className,
      style: {
        ...style,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`
      },
      children: [
        /* @__PURE__ */ jsx("title", { children: name }),
        /* @__PURE__ */ jsx("use", { href: path })
      ]
    }
  );
});

// src/web/state.ts
import { signal } from "@preact/signals";

// src/web/constants.ts
var SAFE_AREA = 24;
var COPY_FEEDBACK_DURATION_MS = 600;
var MIN_SIZE = {
  width: 550,
  height: 350,
  initialHeight: 400
};
var MIN_CONTAINER_WIDTH = 240;
var LOCALSTORAGE_KEY = "react-scan-widget-settings-v2";
var LOCALSTORAGE_COLLAPSED_KEY = "react-scan-widget-collapsed-v1";
var LOCALSTORAGE_LAST_VIEW_KEY = "react-scan-widget-last-view-v1";
var TOOLBAR_INTERACTIVE_SELECTOR = "button, a, input, textarea, select, pre, [contenteditable], [data-react-scan-selectable]";

// src/web/utils/helpers.ts
import {
  MemoComponentTag,
  SimpleMemoComponentTag,
  SuspenseComponentTag,
  getDisplayName,
  hasMemoCache
} from "bippy";

// ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}

// ../../node_modules/.pnpm/tailwind-merge@3.5.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs
var concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
var createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
var getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache2 = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache2[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache2;
      cache2 = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache2[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache2) {
        cache2[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
var createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index = 0; index < len; index++) {
      const currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
var createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index) => {
    modifierWeights.set(mod, 1e6 + index);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
var createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
var twJoin = (...classLists) => {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < classLists.length) {
    if (argument = classLists[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

// src/web/utils/helpers.ts
var cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
var isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
var throttle = (callback, delay) => {
  let lastCall = 0;
  return (e) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return callback(e);
    }
    return void 0;
  };
};
var readLocalStorage = (storageKey) => {
  if (!IS_CLIENT) return null;
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
var saveLocalStorage = (storageKey, state) => {
  if (!IS_CLIENT) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
  }
};
var removeLocalStorage = (storageKey) => {
  if (!IS_CLIENT) return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
  }
};
var LazyComponentTag = 24;
var ProfilerTag = 12;
var getExtendedDisplayName = (fiber) => {
  if (!fiber) {
    return {
      name: "Unknown",
      wrappers: [],
      wrapperTypes: []
    };
  }
  const { tag, type, elementType } = fiber;
  let name = getDisplayName(type);
  const wrappers = [];
  const wrapperTypes = [];
  if (hasMemoCache(fiber) || tag === SimpleMemoComponentTag || tag === MemoComponentTag || (type == null ? void 0 : type.$$typeof) === /* @__PURE__ */ Symbol.for("react.memo") || (elementType == null ? void 0 : elementType.$$typeof) === /* @__PURE__ */ Symbol.for("react.memo")) {
    const compiler = hasMemoCache(fiber);
    wrapperTypes.push({
      type: "memo",
      title: compiler ? "This component has been auto-memoized by the React Compiler." : "Memoized component that skips re-renders if props are the same",
      compiler
    });
  }
  if (tag === LazyComponentTag) {
    wrapperTypes.push({
      type: "lazy",
      title: "Lazily loaded component that supports code splitting"
    });
  }
  if (tag === SuspenseComponentTag) {
    wrapperTypes.push({
      type: "suspense",
      title: "Component that can suspend while content is loading"
    });
  }
  if (tag === ProfilerTag) {
    wrapperTypes.push({
      type: "profiler",
      title: "Component that measures rendering performance"
    });
  }
  if (typeof name === "string") {
    const wrapperRegex = /^(\w+)\((.*)\)$/;
    let currentName = name;
    while (wrapperRegex.test(currentName)) {
      const match = currentName.match(wrapperRegex);
      if ((match == null ? void 0 : match[1]) && (match == null ? void 0 : match[2])) {
        wrappers.unshift(match[1]);
        currentName = match[2];
      } else {
        break;
      }
    }
    name = currentName;
  }
  return {
    name: name || "Unknown",
    wrappers,
    wrapperTypes
  };
};

// src/web/utils/is-finite-non-negative.ts
var isFiniteNonNegative = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;

// src/web/utils/is-plain-object.ts
var isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

// src/web/utils/safe-area.ts
var getSafeArea = () => {
  const value = ReactScanInternals.options.value.safeArea;
  if (isFiniteNonNegative(value)) {
    return { top: value, right: value, bottom: value, left: value };
  }
  if (isPlainObject(value)) {
    const top = value.top;
    const right = value.right;
    const bottom = value.bottom;
    const left = value.left;
    return {
      top: isFiniteNonNegative(top) ? top : SAFE_AREA,
      right: isFiniteNonNegative(right) ? right : SAFE_AREA,
      bottom: isFiniteNonNegative(bottom) ? bottom : SAFE_AREA,
      left: isFiniteNonNegative(left) ? left : SAFE_AREA
    };
  }
  return {
    top: SAFE_AREA,
    right: SAFE_AREA,
    bottom: SAFE_AREA,
    left: SAFE_AREA
  };
};

// src/web/state.ts
var signalIsSettingsOpen = /* @__PURE__ */ signal(false);
var signalRefWidget = /* @__PURE__ */ signal(
  null
);
var getDefaultWidgetConfig = () => ({
  corner: "bottom-right",
  dimensions: {
    isFullWidth: false,
    isFullHeight: false,
    width: MIN_SIZE.width,
    height: MIN_SIZE.height,
    position: { x: SAFE_AREA, y: SAFE_AREA }
  },
  lastDimensions: {
    isFullWidth: false,
    isFullHeight: false,
    width: MIN_SIZE.width,
    height: MIN_SIZE.height,
    position: { x: SAFE_AREA, y: SAFE_AREA }
  },
  componentsTree: {
    width: MIN_CONTAINER_WIDTH
  }
});
var defaultWidgetConfig = getDefaultWidgetConfig();
var getInitialWidgetConfig = () => {
  var _a, _b, _c, _d, _e;
  const defaults = getDefaultWidgetConfig();
  const stored = readLocalStorage(LOCALSTORAGE_KEY);
  if (!stored) {
    saveLocalStorage(LOCALSTORAGE_KEY, {
      corner: defaults.corner,
      dimensions: defaults.dimensions,
      lastDimensions: defaults.lastDimensions,
      componentsTree: defaults.componentsTree
    });
    return defaults;
  }
  return {
    corner: (_a = stored.corner) != null ? _a : defaults.corner,
    dimensions: (_b = stored.dimensions) != null ? _b : defaults.dimensions,
    lastDimensions: (_d = (_c = stored.lastDimensions) != null ? _c : stored.dimensions) != null ? _d : defaults.lastDimensions,
    componentsTree: (_e = stored.componentsTree) != null ? _e : defaults.componentsTree
  };
};
var signalWidget = signal(getInitialWidgetConfig());
var updateDimensions = () => {
  if (!IS_CLIENT) return;
  const { dimensions } = signalWidget.value;
  const { width, height, position } = dimensions;
  const safeArea = getSafeArea();
  signalWidget.value = {
    ...signalWidget.value,
    dimensions: {
      isFullWidth: width >= window.innerWidth - safeArea.left - safeArea.right,
      isFullHeight: height >= window.innerHeight - safeArea.top - safeArea.bottom,
      width,
      height,
      position
    }
  };
};
var signalWidgetViews = signal({
  view: "none"
});
var storedCollapsed = readLocalStorage(
  LOCALSTORAGE_COLLAPSED_KEY
);
var signalWidgetCollapsed = /* @__PURE__ */ signal(storedCollapsed != null ? storedCollapsed : null);

// src/web/utils/preact/constant.ts
import {
  createElement
} from "preact";
function CONSTANT_UPDATE() {
  return false;
}
function constant(Component3) {
  function Memoed(props) {
    this.shouldComponentUpdate = CONSTANT_UPDATE;
    return createElement(Component3, props);
  }
  Memoed.displayName = `Memo(${Component3.displayName || Component3.name})`;
  Memoed.prototype.isReactComponent = true;
  Memoed._forwarded = true;
  return Memoed;
}

// src/web/views/inspector/components-tree/index.tsx
import {
  useCallback as useCallback2,
  useEffect as useEffect2,
  useMemo as useMemo2,
  useRef as useRef2,
  useState as useState2
} from "preact/hooks";

// src/web/hooks/use-virtual-list.ts
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "preact/hooks";
var useVirtualList = (options) => {
  const { count, getScrollElement, estimateSize, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const refResizeObserver = useRef();
  const refScrollElement = useRef(null);
  const refRafId = useRef(null);
  const itemHeight = estimateSize();
  const updateContainer = useCallback((entries) => {
    var _a, _b;
    if (!refScrollElement.current) return;
    const height = (_b = (_a = entries == null ? void 0 : entries[0]) == null ? void 0 : _a.contentRect.height) != null ? _b : refScrollElement.current.getBoundingClientRect().height;
    setContainerHeight(height);
  }, []);
  const debouncedUpdateContainer = useCallback(() => {
    if (refRafId.current !== null) {
      cancelAnimationFrame(refRafId.current);
    }
    refRafId.current = requestAnimationFrame(() => {
      updateContainer();
      refRafId.current = null;
    });
  }, [updateContainer]);
  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;
    refScrollElement.current = element;
    const handleScroll = () => {
      if (!refScrollElement.current) return;
      setScrollTop(refScrollElement.current.scrollTop);
    };
    updateContainer();
    if (!refResizeObserver.current) {
      refResizeObserver.current = new ResizeObserver(() => {
        debouncedUpdateContainer();
      });
    }
    refResizeObserver.current.observe(element);
    element.addEventListener("scroll", handleScroll, { passive: true });
    const mutationObserver = new MutationObserver(debouncedUpdateContainer);
    mutationObserver.observe(element, {
      attributes: true,
      childList: true,
      subtree: true
    });
    return () => {
      element.removeEventListener("scroll", handleScroll);
      if (refResizeObserver.current) {
        refResizeObserver.current.disconnect();
      }
      mutationObserver.disconnect();
      if (refRafId.current !== null) {
        cancelAnimationFrame(refRafId.current);
      }
    };
  }, [getScrollElement, updateContainer, debouncedUpdateContainer]);
  const visibleRange = useMemo(() => {
    const start2 = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    return {
      start: Math.max(0, start2 - overscan),
      end: Math.min(count, start2 + visibleCount + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, count, overscan]);
  const items = useMemo(() => {
    const virtualItems = [];
    for (let index = visibleRange.start; index < visibleRange.end; index++) {
      virtualItems.push({
        key: index,
        index,
        start: index * itemHeight
      });
    }
    return virtualItems;
  }, [visibleRange, itemHeight]);
  return {
    virtualItems: items,
    totalSize: count * itemHeight,
    scrollTop,
    containerHeight
  };
};

// src/web/utils/pin.ts
var getFiberPath = (fiber) => {
  var _a;
  const pathSegments = [];
  let currentFiber = fiber;
  while (currentFiber) {
    const elementType = currentFiber.elementType;
    const name = typeof elementType === "function" ? elementType.displayName || elementType.name : typeof elementType === "string" ? elementType : "Unknown";
    const index = currentFiber.index !== void 0 ? `[${currentFiber.index}]` : "";
    pathSegments.unshift(`${name}${index}`);
    currentFiber = (_a = currentFiber.return) != null ? _a : null;
  }
  return pathSegments.join("::");
};

// src/web/views/inspector/states.ts
import { signal as signal2 } from "@preact/signals";

// src/web/views/inspector/flash-overlay.ts
var fadeOutTimers = /* @__PURE__ */ new WeakMap();
var trackElementPosition = (element, callback) => {
  const handleScroll = callback.bind(null, element);
  document.addEventListener("scroll", handleScroll, {
    passive: true,
    capture: true
  });
  return () => {
    document.removeEventListener("scroll", handleScroll, { capture: true });
  };
};
var flashManager = {
  activeFlashes: /* @__PURE__ */ new Map(),
  create(container) {
    const existingOverlay = container.querySelector(
      ".react-scan-flash-overlay"
    );
    const overlay = existingOverlay instanceof HTMLElement ? existingOverlay : (() => {
      const newOverlay = document.createElement("div");
      newOverlay.className = "react-scan-flash-overlay";
      container.appendChild(newOverlay);
      const scrollCleanup = trackElementPosition(container, () => {
        if (container.querySelector(".react-scan-flash-overlay")) {
          this.create(container);
        }
      });
      this.activeFlashes.set(container, {
        element: container,
        overlay: newOverlay,
        scrollCleanup
      });
      return newOverlay;
    })();
    const existingTimer = fadeOutTimers.get(overlay);
    if (existingTimer) {
      clearTimeout(existingTimer);
      fadeOutTimers.delete(overlay);
    }
    requestAnimationFrame(() => {
      overlay.style.transition = "none";
      overlay.style.opacity = "0.9";
      const timerId = setTimeout(() => {
        overlay.style.transition = "opacity 150ms ease-out";
        overlay.style.opacity = "0";
        const cleanupTimer = setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          const entry = this.activeFlashes.get(container);
          if (entry == null ? void 0 : entry.scrollCleanup) {
            entry.scrollCleanup();
          }
          this.activeFlashes.delete(container);
          fadeOutTimers.delete(overlay);
        }, 150);
        fadeOutTimers.set(overlay, cleanupTimer);
      }, 300);
      fadeOutTimers.set(overlay, timerId);
    });
  },
  cleanup(container) {
    const entry = this.activeFlashes.get(container);
    if (entry) {
      const existingTimer = fadeOutTimers.get(entry.overlay);
      if (existingTimer) {
        clearTimeout(existingTimer);
        fadeOutTimers.delete(entry.overlay);
      }
      if (entry.overlay.parentNode) {
        entry.overlay.parentNode.removeChild(entry.overlay);
      }
      if (entry.scrollCleanup) {
        entry.scrollCleanup();
      }
      this.activeFlashes.delete(container);
    }
  },
  cleanupAll() {
    for (const [, entry] of this.activeFlashes) {
      this.cleanup(entry.element);
    }
  }
};

// src/web/views/inspector/states.ts
var TIMELINE_MAX_UPDATES = 1e3;
var timelineStateDefault = {
  updates: [],
  currentFiber: null,
  totalUpdates: 0,
  windowOffset: 0,
  currentIndex: 0,
  isViewingHistory: false,
  latestFiber: null,
  isVisible: false,
  playbackSpeed: 1
};
var timelineState = signal2(timelineStateDefault);
var inspectorUpdateSignal = signal2(0);
var pendingUpdates = [];
var batchTimeout = null;
var batchUpdates = () => {
  if (pendingUpdates.length === 0) return;
  const batchedUpdates = [...pendingUpdates];
  const { updates, totalUpdates, currentIndex, isViewingHistory } = timelineState.value;
  const newUpdates = [...updates];
  let newTotalUpdates = totalUpdates;
  for (const { update } of batchedUpdates) {
    if (newUpdates.length >= TIMELINE_MAX_UPDATES) {
      newUpdates.shift();
    }
    newUpdates.push(update);
    newTotalUpdates++;
  }
  const newWindowOffset = Math.max(0, newTotalUpdates - TIMELINE_MAX_UPDATES);
  let newCurrentIndex;
  if (isViewingHistory) {
    if (currentIndex === totalUpdates - 1) {
      newCurrentIndex = newUpdates.length - 1;
    } else if (currentIndex === 0) {
      newCurrentIndex = 0;
    } else {
      if (newWindowOffset === 0) {
        newCurrentIndex = currentIndex;
      } else {
        newCurrentIndex = currentIndex - 1;
      }
    }
  } else {
    newCurrentIndex = newUpdates.length - 1;
  }
  const lastUpdate = batchedUpdates[batchedUpdates.length - 1];
  timelineState.value = {
    ...timelineState.value,
    latestFiber: lastUpdate.fiber,
    updates: newUpdates,
    totalUpdates: newTotalUpdates,
    windowOffset: newWindowOffset,
    currentIndex: newCurrentIndex,
    isViewingHistory
  };
  pendingUpdates = pendingUpdates.slice(batchedUpdates.length);
};
var timelineActions = {
  showTimeline: () => {
    timelineState.value = {
      ...timelineState.value,
      isVisible: true
    };
  },
  hideTimeline: () => {
    timelineState.value = {
      ...timelineState.value,
      isVisible: false,
      currentIndex: timelineState.value.updates.length - 1
    };
  },
  updateFrame: (index, isViewingHistory) => {
    timelineState.value = {
      ...timelineState.value,
      currentIndex: index,
      isViewingHistory
    };
  },
  updatePlaybackSpeed: (speed) => {
    timelineState.value = {
      ...timelineState.value,
      playbackSpeed: speed
    };
  },
  addUpdate: (update, latestFiber) => {
    pendingUpdates.push({ update, fiber: latestFiber });
    if (!batchTimeout) {
      const processBatch = () => {
        batchUpdates();
        batchTimeout = null;
        if (pendingUpdates.length > 0) {
          batchTimeout = setTimeout(processBatch, 96);
        }
      };
      batchTimeout = setTimeout(processBatch, 96);
    }
  },
  reset: () => {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
    pendingUpdates = [];
    timelineState.value = timelineStateDefault;
  }
};

// src/web/views/inspector/components-tree/state.ts
import { signal as signal3 } from "@preact/signals";
var searchState = signal3({
  query: "",
  matches: [],
  currentMatchIndex: -1
});
var signalSkipTreeUpdate = /* @__PURE__ */ signal3(false);

// src/web/views/inspector/components-tree/index.tsx
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "preact/jsx-runtime";
var flattenTree = (nodes, depth = 0, parentPath = null) => {
  return nodes.reduce((acc, node, index) => {
    var _a, _b;
    const nodePath = node.element ? getFiberPath(node.fiber) : `${parentPath}-${index}`;
    const renderData = ((_a = node.fiber) == null ? void 0 : _a.type) ? getRenderData(node.fiber) : void 0;
    const flatNode = {
      ...node,
      depth,
      nodeId: nodePath,
      parentId: parentPath,
      fiber: node.fiber,
      renderData
    };
    acc.push(flatNode);
    if ((_b = node.children) == null ? void 0 : _b.length) {
      acc.push(...flattenTree(node.children, depth + 1, nodePath));
    }
    return acc;
  }, []);
};
var getMaxDepth = (nodes) => {
  return nodes.reduce((max, node) => Math.max(max, node.depth), 0);
};
var calculateIndentSize = (containerWidth, maxDepth) => {
  const MIN_INDENT = 0;
  const MAX_INDENT = 24;
  const MIN_TOTAL_INDENT = 24;
  if (maxDepth <= 0) return MAX_INDENT;
  const availableSpace = Math.max(0, containerWidth - MIN_CONTAINER_WIDTH);
  if (availableSpace < MIN_TOTAL_INDENT) return MIN_INDENT;
  const targetTotalIndent = Math.min(
    availableSpace * 0.3,
    maxDepth * MAX_INDENT
  );
  const baseIndent = targetTotalIndent / maxDepth;
  return Math.max(MIN_INDENT, Math.min(MAX_INDENT, baseIndent));
};
var VALID_TYPES = ["memo", "forwardRef", "lazy", "suspense"];
var parseTypeSearch = (query) => {
  const typeMatch = query.match(/\[(.*?)\]/);
  if (!typeMatch) return null;
  const typeSearches = [];
  const parts = typeMatch[1].split(",");
  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    if (trimmed) typeSearches.push(trimmed);
  }
  return typeSearches;
};
var isValidTypeSearch = (typeSearches) => {
  if (typeSearches.length === 0) return false;
  for (const search of typeSearches) {
    let isValid = false;
    for (const validType of VALID_TYPES) {
      if (validType.toLowerCase().includes(search)) {
        isValid = true;
        break;
      }
    }
    if (!isValid) return false;
  }
  return true;
};
var matchesTypeSearch = (typeSearches, wrapperTypes) => {
  if (typeSearches.length === 0) return true;
  if (!wrapperTypes.length) return false;
  for (const search of typeSearches) {
    let foundMatch = false;
    for (const wrapper of wrapperTypes) {
      if (wrapper.type.toLowerCase().includes(search)) {
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) return false;
  }
  return true;
};
var useNodeHighlighting = (node, searchValue) => {
  return useMemo2(() => {
    const { query, matches } = searchValue;
    const isMatch = matches.some((match) => match.nodeId === node.nodeId);
    const typeSearches = parseTypeSearch(query) || [];
    const searchQuery = query ? query.replace(/\[.*?\]/, "").trim() : "";
    if (!query || !isMatch) {
      return {
        highlightedText: /* @__PURE__ */ jsx2("span", { className: "truncate", children: node.label }),
        typeHighlight: false
      };
    }
    let matchesType = true;
    if (typeSearches.length > 0) {
      if (!node.fiber) {
        matchesType = false;
      } else {
        const { wrapperTypes } = getExtendedDisplayName(node.fiber);
        matchesType = matchesTypeSearch(typeSearches, wrapperTypes);
      }
    }
    let textContent = /* @__PURE__ */ jsx2("span", { className: "truncate", children: node.label });
    if (searchQuery) {
      try {
        if (searchQuery.startsWith("/") && searchQuery.endsWith("/")) {
          const pattern = searchQuery.slice(1, -1);
          const regex = new RegExp(`(${pattern})`, "i");
          const parts = node.label.split(regex);
          textContent = /* @__PURE__ */ jsx2("span", { className: "tree-node-search-highlight", children: parts.map(
            (part, index) => regex.test(part) ? /* @__PURE__ */ jsx2(
              "span",
              {
                className: cn("regex", {
                  start: regex.test(part) && index === 0,
                  middle: regex.test(part) && index % 2 === 1,
                  end: regex.test(part) && index === parts.length - 1,
                  "!ml-0": index === 1
                }),
                children: part
              },
              `${node.nodeId}-${part}`
            ) : part
          ) });
        } else {
          const lowerLabel = node.label.toLowerCase();
          const lowerQuery = searchQuery.toLowerCase();
          const index = lowerLabel.indexOf(lowerQuery);
          if (index >= 0) {
            textContent = /* @__PURE__ */ jsxs2("span", { className: "tree-node-search-highlight", children: [
              node.label.slice(0, index),
              /* @__PURE__ */ jsx2("span", { className: "single", children: node.label.slice(index, index + searchQuery.length) }),
              node.label.slice(index + searchQuery.length)
            ] });
          }
        }
      } catch {
      }
    }
    return {
      highlightedText: textContent,
      typeHighlight: matchesType && typeSearches.length > 0
    };
  }, [node.label, node.nodeId, node.fiber, searchValue]);
};
var formatTime = (time) => {
  if (time > 0) {
    if (time < 0.1 - Number.EPSILON) {
      return "< 0.1";
    }
    if (time < 1e3) {
      return Number(time.toFixed(1)).toString();
    }
    return `${(time / 1e3).toFixed(1)}k`;
  }
  return "0";
};
var TreeNodeItem = ({
  node,
  nodeIndex,
  hasChildren,
  isCollapsed,
  handleTreeNodeClick,
  handleTreeNodeToggle,
  searchValue
}) => {
  var _a, _b, _c;
  const refRenderCount = useRef2(null);
  const refPrevRenderCount = useRef2((_b = (_a = node.renderData) == null ? void 0 : _a.renderCount) != null ? _b : 0);
  const { highlightedText, typeHighlight } = useNodeHighlighting(
    node,
    searchValue
  );
  useEffect2(() => {
    var _a2;
    const currentRenderCount = (_a2 = node.renderData) == null ? void 0 : _a2.renderCount;
    const element = refRenderCount.current;
    if (!element || !refPrevRenderCount.current || !currentRenderCount || refPrevRenderCount.current === currentRenderCount) {
      return;
    }
    element.classList.remove("count-flash");
    void element.offsetWidth;
    element.classList.add("count-flash");
    refPrevRenderCount.current = currentRenderCount;
  }, [(_c = node.renderData) == null ? void 0 : _c.renderCount]);
  const renderTimeInfo = useMemo2(() => {
    if (!node.renderData) return null;
    const { selfTime, totalTime, renderCount } = node.renderData;
    if (!renderCount) {
      return null;
    }
    return /* @__PURE__ */ jsx2(
      "span",
      {
        className: cn(
          "flex items-center gap-x-0.5 ml-1.5",
          "text-[10px] text-neutral-400"
        ),
        children: /* @__PURE__ */ jsxs2(
          "span",
          {
            ref: refRenderCount,
            title: `Self time: ${formatTime(selfTime)}ms
Total time: ${formatTime(totalTime)}ms`,
            className: "count-badge",
            children: [
              "\xD7",
              renderCount
            ]
          }
        )
      }
    );
  }, [node.renderData]);
  const componentTypes = useMemo2(() => {
    if (!node.fiber) return null;
    const { wrapperTypes } = getExtendedDisplayName(node.fiber);
    const firstWrapperType = wrapperTypes[0];
    return /* @__PURE__ */ jsxs2(
      "span",
      {
        className: cn(
          "flex items-center gap-x-1",
          "text-[10px] text-neutral-400 tracking-wide",
          "overflow-hidden"
        ),
        children: [
          firstWrapperType && /* @__PURE__ */ jsxs2(Fragment, { children: [
            /* @__PURE__ */ jsx2(
              "span",
              {
                title: firstWrapperType == null ? void 0 : firstWrapperType.title,
                className: cn(
                  "rounded py-[1px] px-1",
                  "bg-neutral-700 text-neutral-300",
                  "truncate",
                  firstWrapperType.type === "memo" && "bg-[#8e61e3] text-white",
                  typeHighlight && "bg-yellow-300 text-black"
                ),
                children: firstWrapperType.type
              },
              firstWrapperType.type
            ),
            firstWrapperType.compiler && /* @__PURE__ */ jsx2("span", { className: "text-yellow-300 ml-1", children: "\u2728" })
          ] }),
          wrapperTypes.length > 1 && `\xD7${wrapperTypes.length}`,
          renderTimeInfo
        ]
      }
    );
  }, [node.fiber, typeHighlight, renderTimeInfo]);
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type: "button",
      title: node.title,
      "data-index": nodeIndex,
      className: cn(
        "flex items-center gap-x-1",
        "pl-1 pr-2",
        "w-full h-7",
        "text-left",
        "rounded",
        "cursor-pointer select-none"
      ),
      onClick: handleTreeNodeClick,
      children: [
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            "data-index": nodeIndex,
            onClick: handleTreeNodeToggle,
            className: cn("w-6 h-6 flex items-center justify-center", "text-left"),
            children: hasChildren && /* @__PURE__ */ jsx2(
              Icon,
              {
                name: "icon-chevron-right",
                size: 12,
                className: cn("transition-transform", !isCollapsed && "rotate-90")
              }
            )
          }
        ),
        highlightedText,
        componentTypes
      ]
    }
  );
};
var ComponentsTree = () => {
  const refContainer = useRef2(null);
  const refMainContainer = useRef2(null);
  const refSearchInputContainer = useRef2(null);
  const refSearchInput = useRef2(null);
  const refSelectedElement = useRef2(null);
  const refMaxTreeDepth = useRef2(0);
  const refIsHovering = useRef2(false);
  const refIsResizing = useRef2(false);
  const refResizeHandle = useRef2(null);
  const [flattenedNodes, setFlattenedNodes] = useState2([]);
  const [collapsedNodes, setCollapsedNodes] = useState2(/* @__PURE__ */ new Set());
  const [selectedIndex, setSelectedIndex] = useState2(
    void 0
  );
  const [searchValue, setSearchValue] = useState2(searchState.value);
  const visibleNodes = useMemo2(() => {
    const visible = [];
    const nodes = flattenedNodes;
    const nodeMap = new Map(nodes.map((node) => [node.nodeId, node]));
    for (const node of nodes) {
      let isVisible = true;
      let currentNode = node;
      while (currentNode.parentId) {
        const parent = nodeMap.get(currentNode.parentId);
        if (!parent) break;
        if (collapsedNodes.has(parent.nodeId)) {
          isVisible = false;
          break;
        }
        currentNode = parent;
      }
      if (isVisible) {
        visible.push(node);
      }
    }
    return visible;
  }, [collapsedNodes, flattenedNodes]);
  const ITEM_HEIGHT = 28;
  const { virtualItems, totalSize } = useVirtualList({
    count: visibleNodes.length,
    getScrollElement: () => refContainer.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5
  });
  const handleElementClick = useCallback2(
    (element) => {
      var _a;
      refIsHovering.current = true;
      (_a = refSearchInput.current) == null ? void 0 : _a.blur();
      signalSkipTreeUpdate.value = true;
      const { parentCompositeFiber } = getCompositeComponentFromElement(element);
      if (!parentCompositeFiber) return;
      Store.inspectState.value = {
        kind: "focused",
        focusedDomElement: element,
        fiber: parentCompositeFiber
      };
      const nodeIndex = visibleNodes.findIndex(
        (node) => node.element === element
      );
      if (nodeIndex !== -1) {
        setSelectedIndex(nodeIndex);
        const itemTop = nodeIndex * ITEM_HEIGHT;
        const container = refContainer.current;
        if (container) {
          const containerHeight = container.clientHeight;
          const scrollTop = container.scrollTop;
          if (itemTop < scrollTop || itemTop + ITEM_HEIGHT > scrollTop + containerHeight) {
            container.scrollTo({
              top: Math.max(0, itemTop - containerHeight / 2),
              behavior: "instant"
            });
          }
        }
      }
    },
    [visibleNodes]
  );
  const handleTreeNodeClick = useCallback2(
    (e) => {
      const target = e.currentTarget;
      const index = Number(target.dataset.index);
      if (Number.isNaN(index)) return;
      const element = visibleNodes[index].element;
      if (!element) return;
      handleElementClick(element);
    },
    [visibleNodes, handleElementClick]
  );
  const handleToggle = useCallback2((nodeId) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);
  const handleTreeNodeToggle = useCallback2(
    (e) => {
      e.stopPropagation();
      const target = e.target;
      const index = Number(target.dataset.index);
      if (Number.isNaN(index)) return;
      const nodeId = visibleNodes[index].nodeId;
      handleToggle(nodeId);
    },
    [visibleNodes, handleToggle]
  );
  const handleOnChangeSearch = useCallback2(
    (query) => {
      var _a, _b, _c, _d, _e;
      (_a = refSearchInputContainer.current) == null ? void 0 : _a.classList.remove("!border-red-500");
      const matches = [];
      if (!query) {
        searchState.value = { query, matches, currentMatchIndex: -1 };
        return;
      }
      if (query.includes("[") && !query.includes("]")) {
        if (query.length > query.indexOf("[") + 1) {
          (_b = refSearchInputContainer.current) == null ? void 0 : _b.classList.add("!border-red-500");
          return;
        }
      }
      const typeSearches = parseTypeSearch(query) || [];
      if (query.includes("[")) {
        if (!isValidTypeSearch(typeSearches)) {
          (_c = refSearchInputContainer.current) == null ? void 0 : _c.classList.add("!border-red-500");
          return;
        }
      }
      const searchQuery = query.replace(/\[.*?\]/, "").trim();
      const isRegex = /^\/.*\/$/.test(searchQuery);
      let matchesLabel = (_label) => false;
      if (searchQuery.startsWith("/") && !isRegex) {
        if (searchQuery.length > 1) {
          (_d = refSearchInputContainer.current) == null ? void 0 : _d.classList.add("!border-red-500");
          return;
        }
      }
      if (isRegex) {
        try {
          const pattern = searchQuery.slice(1, -1);
          const regex = new RegExp(pattern, "i");
          matchesLabel = (label) => regex.test(label);
        } catch {
          (_e = refSearchInputContainer.current) == null ? void 0 : _e.classList.add("!border-red-500");
          return;
        }
      } else if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        matchesLabel = (label) => label.toLowerCase().includes(lowerQuery);
      }
      for (const node of flattenedNodes) {
        let matchesSearch = true;
        if (searchQuery) {
          matchesSearch = matchesLabel(node.label);
        }
        if (matchesSearch && typeSearches.length > 0) {
          if (!node.fiber) {
            matchesSearch = false;
          } else {
            const { wrapperTypes } = getExtendedDisplayName(node.fiber);
            matchesSearch = matchesTypeSearch(typeSearches, wrapperTypes);
          }
        }
        if (matchesSearch) {
          matches.push(node);
        }
      }
      searchState.value = {
        query,
        matches,
        currentMatchIndex: matches.length > 0 ? 0 : -1
      };
      if (matches.length > 0) {
        const firstMatch = matches[0];
        const nodeIndex = visibleNodes.findIndex(
          (node) => node.nodeId === firstMatch.nodeId
        );
        if (nodeIndex !== -1) {
          const itemTop = nodeIndex * ITEM_HEIGHT;
          const container = refContainer.current;
          if (container) {
            const containerHeight = container.clientHeight;
            container.scrollTo({
              top: Math.max(0, itemTop - containerHeight / 2),
              behavior: "instant"
            });
          }
        }
      }
    },
    [flattenedNodes, visibleNodes]
  );
  const handleInputChange = useCallback2(
    (e) => {
      const target = e.currentTarget;
      if (!target) return;
      handleOnChangeSearch(target.value);
    },
    [handleOnChangeSearch]
  );
  const navigateSearch = useCallback2(
    (direction) => {
      const { matches, currentMatchIndex } = searchState.value;
      if (matches.length === 0) return;
      const newIndex = direction === "next" ? (currentMatchIndex + 1) % matches.length : (currentMatchIndex - 1 + matches.length) % matches.length;
      searchState.value = {
        ...searchState.value,
        currentMatchIndex: newIndex
      };
      const currentMatch = matches[newIndex];
      const nodeIndex = visibleNodes.findIndex(
        (node) => node.nodeId === currentMatch.nodeId
      );
      if (nodeIndex !== -1) {
        setSelectedIndex(nodeIndex);
        const itemTop = nodeIndex * ITEM_HEIGHT;
        const container = refContainer.current;
        if (container) {
          const containerHeight = container.clientHeight;
          container.scrollTo({
            top: Math.max(0, itemTop - containerHeight / 2),
            behavior: "instant"
          });
        }
      }
    },
    [visibleNodes]
  );
  const updateContainerWidths = useCallback2((width) => {
    if (refMainContainer.current) {
      refMainContainer.current.style.width = `${width}px`;
    }
    if (refContainer.current) {
      refContainer.current.style.width = `${width}px`;
      const indentSize = calculateIndentSize(width, refMaxTreeDepth.current);
      refContainer.current.style.setProperty(
        "--indentation-size",
        `${indentSize}px`
      );
    }
  }, []);
  const updateResizeDirection = useCallback2((width) => {
    if (!refResizeHandle.current) return;
    const parentWidth = signalWidget.value.dimensions.width;
    const maxWidth = Math.floor(parentWidth - MIN_CONTAINER_WIDTH / 2);
    refResizeHandle.current.classList.remove(
      "cursor-ew-resize",
      "cursor-w-resize",
      "cursor-e-resize"
    );
    if (width <= MIN_CONTAINER_WIDTH) {
      refResizeHandle.current.classList.add("cursor-w-resize");
    } else if (width >= maxWidth) {
      refResizeHandle.current.classList.add("cursor-e-resize");
    } else {
      refResizeHandle.current.classList.add("cursor-ew-resize");
    }
  }, []);
  const handleResize = useCallback2(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!refContainer.current) return;
      refContainer.current.style.setProperty("pointer-events", "none");
      refIsResizing.current = true;
      const startX = e.clientX;
      const startWidth = refContainer.current.offsetWidth;
      const parentWidth = signalWidget.value.dimensions.width;
      const maxWidth = Math.floor(parentWidth - MIN_CONTAINER_WIDTH / 2);
      updateResizeDirection(startWidth);
      const handlePointerMove = (e2) => {
        const delta = startX - e2.clientX;
        const newWidth = startWidth + delta;
        updateResizeDirection(newWidth);
        const clampedWidth = Math.min(
          maxWidth,
          Math.max(MIN_CONTAINER_WIDTH, newWidth)
        );
        updateContainerWidths(clampedWidth);
      };
      const handlePointerUp = () => {
        if (!refContainer.current) return;
        refContainer.current.style.removeProperty("pointer-events");
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        signalWidget.value = {
          ...signalWidget.value,
          componentsTree: {
            ...signalWidget.value.componentsTree,
            width: refContainer.current.offsetWidth
          }
        };
        saveLocalStorage(LOCALSTORAGE_KEY, signalWidget.value);
        refIsResizing.current = false;
      };
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [updateContainerWidths, updateResizeDirection]
  );
  useEffect2(() => {
    if (!refContainer.current) return;
    const currentWidth = refContainer.current.offsetWidth;
    updateResizeDirection(currentWidth);
    return signalWidget.subscribe(() => {
      if (!refContainer.current) return;
      updateResizeDirection(refContainer.current.offsetWidth);
    });
  }, [updateResizeDirection]);
  const onPointerLeave = useCallback2(() => {
    refIsHovering.current = false;
  }, []);
  useEffect2(() => {
    let isInitialTreeBuild = true;
    const buildTreeFromElements = (elements) => {
      const nodeMap = /* @__PURE__ */ new Map();
      const rootNodes = [];
      for (const { element, name, fiber } of elements) {
        if (!element) continue;
        let title = name;
        const { name: componentName, wrappers } = getExtendedDisplayName(fiber);
        if (componentName) {
          if (wrappers.length > 0) {
            title = `${wrappers.join("(")}(${componentName})${")".repeat(wrappers.length)}`;
          } else {
            title = componentName;
          }
        }
        nodeMap.set(element, {
          label: componentName || name,
          title,
          children: [],
          element,
          fiber
        });
      }
      for (const { element, depth } of elements) {
        if (!element) continue;
        const node = nodeMap.get(element);
        if (!node) continue;
        if (depth === 0) {
          rootNodes.push(node);
        } else {
          let parent = element.parentElement;
          while (parent) {
            const parentNode = nodeMap.get(parent);
            if (parentNode) {
              parentNode.children = parentNode.children || [];
              parentNode.children.push(node);
              break;
            }
            parent = parent.parentElement;
          }
        }
      }
      return rootNodes;
    };
    const updateTree = () => {
      const element = refSelectedElement.current;
      if (!element) return;
      const inspectableElements = getInspectableElements();
      const tree = buildTreeFromElements(inspectableElements);
      if (tree.length > 0) {
        const flattened = flattenTree(tree);
        const newMaxDepth = getMaxDepth(flattened);
        refMaxTreeDepth.current = newMaxDepth;
        updateContainerWidths(signalWidget.value.componentsTree.width);
        setFlattenedNodes(flattened);
        if (isInitialTreeBuild) {
          isInitialTreeBuild = false;
          const focusedIndex = flattened.findIndex(
            (node) => node.element === element
          );
          if (focusedIndex !== -1) {
            const itemTop = focusedIndex * ITEM_HEIGHT;
            const container = refContainer.current;
            if (container) {
              setTimeout(() => {
                container.scrollTo({
                  top: itemTop,
                  behavior: "instant"
                });
              }, 96);
            }
          }
        }
      }
    };
    const unsubscribeStore = Store.inspectState.subscribe((state) => {
      if (state.kind === "focused") {
        if (signalSkipTreeUpdate.value) {
          return;
        }
        handleOnChangeSearch("");
        refSelectedElement.current = state.focusedDomElement;
        updateTree();
      }
    });
    let rafId = 0;
    const unsubscribeUpdates = inspectorUpdateSignal.subscribe(() => {
      if (Store.inspectState.value.kind === "focused") {
        cancelAnimationFrame(rafId);
        if (refIsResizing.current) return;
        rafId = requestAnimationFrame(() => {
          signalSkipTreeUpdate.value = false;
          updateTree();
        });
      }
    });
    return () => {
      unsubscribeStore();
      unsubscribeUpdates();
      searchState.value = {
        query: "",
        matches: [],
        currentMatchIndex: -1
      };
    };
  }, []);
  useEffect2(() => {
    const handleKeyDown = (e) => {
      if (!refIsHovering.current) return;
      if (!selectedIndex) return;
      switch (e.key) {
        case "ArrowUp": {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex > 0) {
            const currentNode = visibleNodes[selectedIndex - 1];
            if (currentNode == null ? void 0 : currentNode.element) {
              handleElementClick(currentNode.element);
            }
          }
          return;
        }
        case "ArrowDown": {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex < visibleNodes.length - 1) {
            const currentNode = visibleNodes[selectedIndex + 1];
            if (currentNode == null ? void 0 : currentNode.element) {
              handleElementClick(currentNode.element);
            }
          }
          return;
        }
        case "ArrowLeft": {
          e.preventDefault();
          e.stopPropagation();
          const currentNode = visibleNodes[selectedIndex];
          if (currentNode == null ? void 0 : currentNode.nodeId) {
            handleToggle(currentNode.nodeId);
          }
          return;
        }
        case "ArrowRight": {
          e.preventDefault();
          e.stopPropagation();
          const currentNode = visibleNodes[selectedIndex];
          if (currentNode == null ? void 0 : currentNode.nodeId) {
            handleToggle(currentNode.nodeId);
          }
          return;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, visibleNodes, handleElementClick, handleToggle]);
  useEffect2(() => {
    return searchState.subscribe(setSearchValue);
  }, []);
  useEffect2(() => {
    const unsubscribe = signalWidget.subscribe((state) => {
      var _a;
      (_a = refMainContainer.current) == null ? void 0 : _a.style.setProperty("transition", "width 0.1s");
      updateContainerWidths(state.componentsTree.width);
      setTimeout(() => {
        var _a2;
        (_a2 = refMainContainer.current) == null ? void 0 : _a2.style.removeProperty("transition");
      }, 500);
    });
    return unsubscribe;
  }, []);
  return /* @__PURE__ */ jsxs2("div", { className: "react-scan-components-tree flex", children: [
    /* @__PURE__ */ jsx2(
      "div",
      {
        ref: refResizeHandle,
        onPointerDown: handleResize,
        className: "relative resize-v-line",
        children: /* @__PURE__ */ jsx2("span", { children: /* @__PURE__ */ jsx2(Icon, { name: "icon-ellipsis", size: 18 }) })
      }
    ),
    /* @__PURE__ */ jsxs2("div", { ref: refMainContainer, className: "flex flex-col h-full", children: [
      /* @__PURE__ */ jsx2("div", { className: "p-2 border-b border-[#1e1e1e]", children: /* @__PURE__ */ jsxs2(
        "div",
        {
          ref: refSearchInputContainer,
          title: `Search components by:

\u2022 Name (e.g., "Button") \u2014 Case insensitive, matches any part

\u2022 Regular Expression (e.g., "/^Button/") \u2014 Use forward slashes

\u2022 Wrapper Type (e.g., "[memo,forwardRef]"):
   - Available types: memo, forwardRef, lazy, suspense
   - Matches any part of type name (e.g., "mo" matches "memo")
   - Use commas for multiple types

\u2022 Combined Search:
   - Mix name/regex with type: "button [for]"
   - Will match components satisfying both conditions

\u2022 Navigation:
   - Enter \u2192 Next match
   - Shift + Enter \u2192 Previous match
   - Cmd/Ctrl + Enter \u2192 Select and focus match
`,
          className: cn(
            "relative",
            "flex items-center gap-x-1 px-2",
            "rounded",
            "border border-transparent",
            "focus-within:border-[#454545]",
            "bg-[#1e1e1e] text-neutral-300",
            "transition-colors",
            "whitespace-nowrap",
            "overflow-hidden"
          ),
          children: [
            /* @__PURE__ */ jsx2(Icon, { name: "icon-search", size: 12, className: " text-neutral-500" }),
            /* @__PURE__ */ jsx2("div", { className: "relative flex-1 h-7 overflow-hidden", children: /* @__PURE__ */ jsx2(
              "input",
              {
                ref: refSearchInput,
                type: "text",
                value: searchState.value.query,
                onClick: (e) => {
                  e.stopPropagation();
                  e.currentTarget.focus();
                },
                onPointerDown: (e) => {
                  e.stopPropagation();
                },
                onKeyDown: (e) => {
                  if (e.key === "Escape") {
                    e.currentTarget.blur();
                  }
                  if (searchState.value.matches.length) {
                    if (e.key === "Enter" && e.shiftKey) {
                      navigateSearch("prev");
                    } else if (e.key === "Enter") {
                      if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleElementClick(
                          searchState.value.matches[searchState.value.currentMatchIndex].element
                        );
                        e.currentTarget.focus();
                      } else {
                        navigateSearch("next");
                      }
                    }
                  }
                },
                onChange: handleInputChange,
                className: "absolute inset-y-0 inset-x-1",
                placeholder: "Component name, /regex/, or [type]"
              }
            ) }),
            searchState.value.query ? /* @__PURE__ */ jsxs2(Fragment, { children: [
              /* @__PURE__ */ jsxs2("span", { className: "flex items-center gap-x-0.5 text-xs text-neutral-500", children: [
                searchState.value.currentMatchIndex + 1,
                "|",
                searchState.value.matches.length
              ] }),
              !!searchState.value.matches.length && /* @__PURE__ */ jsxs2(Fragment, { children: [
                /* @__PURE__ */ jsx2(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.stopPropagation();
                      navigateSearch("prev");
                    },
                    className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                    children: /* @__PURE__ */ jsx2(
                      Icon,
                      {
                        name: "icon-chevron-right",
                        className: "-rotate-90",
                        size: 12
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx2(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.stopPropagation();
                      navigateSearch("next");
                    },
                    className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                    children: /* @__PURE__ */ jsx2(
                      Icon,
                      {
                        name: "icon-chevron-right",
                        className: "rotate-90",
                        size: 12
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx2(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.stopPropagation();
                    handleOnChangeSearch("");
                  },
                  className: "button rounded w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-300",
                  children: /* @__PURE__ */ jsx2(Icon, { name: "icon-close", size: 12 })
                }
              )
            ] }) : !!flattenedNodes.length && /* @__PURE__ */ jsx2("span", { className: "text-xs text-neutral-500", children: flattenedNodes.length })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx2("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsx2(
        "div",
        {
          ref: refContainer,
          onPointerLeave,
          className: "tree h-full overflow-auto will-change-transform",
          children: /* @__PURE__ */ jsx2(
            "div",
            {
              className: "relative w-full",
              style: {
                height: totalSize
              },
              children: virtualItems.map((virtualItem) => {
                var _a;
                const node = visibleNodes[virtualItem.index];
                if (!node) return null;
                const isSelected = Store.inspectState.value.kind === "focused" && node.element === Store.inspectState.value.focusedDomElement;
                const isKeyboardSelected = virtualItem.index === selectedIndex;
                return /* @__PURE__ */ jsx2(
                  "div",
                  {
                    className: cn(
                      "absolute left-0 w-full overflow-hidden",
                      "text-neutral-400 hover:text-neutral-300",
                      "bg-transparent hover:bg-[#5f3f9a]/20",
                      (isSelected || isKeyboardSelected) && "text-neutral-300 bg-[#5f3f9a]/40 hover:bg-[#5f3f9a]/40"
                    ),
                    style: {
                      top: virtualItem.start,
                      height: ITEM_HEIGHT
                    },
                    children: /* @__PURE__ */ jsx2(
                      "div",
                      {
                        className: "w-full h-full",
                        style: {
                          paddingLeft: `calc(${node.depth} * var(--indentation-size))`
                        },
                        children: /* @__PURE__ */ jsx2(
                          TreeNodeItem,
                          {
                            node,
                            nodeIndex: virtualItem.index,
                            hasChildren: !!((_a = node.children) == null ? void 0 : _a.length),
                            isCollapsed: collapsedNodes.has(node.nodeId),
                            handleTreeNodeClick,
                            handleTreeNodeToggle,
                            searchValue
                          }
                        )
                      }
                    )
                  },
                  node.nodeId
                );
              })
            }
          )
        }
      ) })
    ] })
  ] });
};

// src/web/views/inspector/what-changed.tsx
import { memo as memo2 } from "preact/compat";
import {
  useEffect as useEffect5,
  useRef as useRef4,
  useState as useState6
} from "preact/hooks";

// src/web/components/copy-to-clipboard/index.tsx
import { memo } from "preact/compat";
import { useCallback as useCallback3, useEffect as useEffect3, useState as useState3 } from "preact/hooks";
import { jsx as jsx3 } from "preact/jsx-runtime";
var CopyToClipboard = /* @__PURE__ */ memo(
  ({
    text,
    children,
    onCopy,
    className,
    iconSize = 14
  }) => {
    const [isCopied, setIsCopied] = useState3(false);
    useEffect3(() => {
      if (isCopied) {
        const timeout2 = setTimeout(() => setIsCopied(false), 600);
        return () => {
          clearTimeout(timeout2);
        };
      }
    }, [isCopied]);
    const copyToClipboard = useCallback3(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(
          () => {
            setIsCopied(true);
            onCopy == null ? void 0 : onCopy(true, text);
          },
          () => {
            onCopy == null ? void 0 : onCopy(false, text);
          }
        );
      },
      [text, onCopy]
    );
    const ClipboardIcon = /* @__PURE__ */ jsx3(
      "button",
      {
        onClick: copyToClipboard,
        type: "button",
        className: cn(
          "z-10",
          "flex items-center justify-center",
          "hover:text-dev-pink-400",
          "transition-colors duration-200 ease-in-out",
          "cursor-pointer",
          `size-[${iconSize}px]`,
          className
        ),
        children: /* @__PURE__ */ jsx3(
          Icon,
          {
            name: `icon-${isCopied ? "check" : "copy"}`,
            size: [iconSize],
            className: cn(isCopied && "text-green-500")
          }
        )
      }
    );
    if (!children) {
      return ClipboardIcon;
    }
    return children({
      ClipboardIcon,
      onClick: copyToClipboard
    });
  }
);

// src/web/views/inspector/diff-value.tsx
import { useState as useState4 } from "preact/hooks";
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "preact/jsx-runtime";
var ArrayHeader = ({
  length,
  expanded,
  onToggle,
  isNegative
}) => /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1", children: [
  /* @__PURE__ */ jsx4(
    "button",
    {
      type: "button",
      onClick: onToggle,
      className: "flex items-center p-0 opacity-50",
      children: /* @__PURE__ */ jsx4(
        Icon,
        {
          name: "icon-chevron-right",
          size: 12,
          className: cn(
            "transition-[color,transform]",
            isNegative ? "text-[#f87171]" : "text-[#4ade80]",
            expanded && "rotate-90"
          )
        }
      )
    }
  ),
  /* @__PURE__ */ jsxs3("span", { children: [
    "Array(",
    length,
    ")"
  ] })
] });
var TreeNode = ({
  value,
  path,
  isNegative
}) => {
  const [isExpanded, setIsExpanded] = useState4(false);
  const canExpand = value !== null && typeof value === "object" && !(value instanceof Date);
  if (!canExpand) {
    return /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxs3("span", { className: "text-gray-500", children: [
        path,
        ":"
      ] }),
      /* @__PURE__ */ jsx4("span", { className: "truncate", children: formatValuePreview(value) })
    ] });
  }
  const entries = Object.entries(value);
  return /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx4(
        "button",
        {
          type: "button",
          onClick: () => setIsExpanded(!isExpanded),
          className: "flex items-center p-0 opacity-50",
          children: /* @__PURE__ */ jsx4(
            Icon,
            {
              name: "icon-chevron-right",
              size: 12,
              className: cn(
                "transition-[color,transform]",
                isNegative ? "text-[#f87171]" : "text-[#4ade80]",
                isExpanded && "rotate-90"
              )
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs3("span", { className: "text-gray-500", children: [
        path,
        ":"
      ] }),
      !isExpanded && /* @__PURE__ */ jsx4("span", { className: "truncate", children: value instanceof Date ? formatValuePreview(value) : `{${Object.keys(value).join(", ")}}` })
    ] }),
    isExpanded && /* @__PURE__ */ jsx4("div", { className: "pl-5 border-l border-[#333] mt-0.5 ml-1 flex flex-col gap-0.5", children: entries.map(([key, val]) => /* @__PURE__ */ jsx4(
      TreeNode,
      {
        value: val,
        path: key,
        isNegative
      },
      key
    )) })
  ] });
};
var DiffValueView = ({
  value,
  expanded,
  onToggle,
  isNegative
}) => {
  const { value: safeValue, error } = safeGetValue(value);
  if (error) {
    return /* @__PURE__ */ jsx4("span", { className: "text-gray-500 font-italic", children: error });
  }
  const isExpandable = safeValue !== null && typeof safeValue === "object" && !(safeValue instanceof Promise);
  if (!isExpandable) {
    return /* @__PURE__ */ jsx4("span", { children: formatValuePreview(safeValue) });
  }
  if (Array.isArray(safeValue)) {
    return /* @__PURE__ */ jsxs3("div", { className: "flex flex-col gap-1 relative", children: [
      /* @__PURE__ */ jsx4(
        ArrayHeader,
        {
          length: safeValue.length,
          expanded,
          onToggle,
          isNegative
        }
      ),
      expanded && /* @__PURE__ */ jsx4("div", { className: "pl-2 border-l border-[#333] mt-0.5 ml-1 flex flex-col gap-0.5", children: safeValue.map((item, index) => /* @__PURE__ */ jsx4(
        TreeNode,
        {
          value: item,
          path: index.toString(),
          isNegative
        },
        index.toString()
      )) }),
      /* @__PURE__ */ jsx4(
        CopyToClipboard,
        {
          text: formatForClipboard(safeValue),
          className: "absolute top-0.5 right-0.5 opacity-0 transition-opacity group-hover:opacity-100 self-end",
          children: ({ ClipboardIcon }) => /* @__PURE__ */ jsx4(Fragment2, { children: ClipboardIcon })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs3("div", { className: "flex items-start gap-1 relative", children: [
    /* @__PURE__ */ jsx4(
      "button",
      {
        type: "button",
        onClick: onToggle,
        className: cn("flex items-center", "p-0 mt-0.5 mr-1", "opacity-50"),
        children: /* @__PURE__ */ jsx4(
          Icon,
          {
            name: "icon-chevron-right",
            size: 12,
            className: cn(
              "transition-[color,transform]",
              isNegative ? "text-[#f87171]" : "text-[#4ade80]",
              expanded && "rotate-90"
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsx4("div", { className: "flex-1", children: !expanded ? /* @__PURE__ */ jsx4("span", { children: formatValuePreview(safeValue) }) : /* @__PURE__ */ jsx4("div", { className: "pl-2 border-l border-[#333] mt-0.5 ml-1 flex flex-col gap-0.5", children: Object.entries(safeValue).map(([key, val]) => /* @__PURE__ */ jsx4(
      TreeNode,
      {
        value: val,
        path: key,
        isNegative
      },
      key
    )) }) }),
    /* @__PURE__ */ jsx4(
      CopyToClipboard,
      {
        text: formatForClipboard(safeValue),
        className: "absolute top-0.5 right-0.5 opacity-0 transition-opacity group-hover:opacity-100 self-end",
        children: ({ ClipboardIcon }) => /* @__PURE__ */ jsx4(Fragment2, { children: ClipboardIcon })
      }
    )
  ] });
};

// src/web/views/inspector/whats-changed/use-change-store.ts
import { useEffect as useEffect4, useRef as useRef3, useState as useState5 } from "preact/hooks";
import { getFiberId } from "bippy";
import { signal as signal4 } from "@preact/signals";
var CHANGES_QUEUE_INTERVAL = 50;
var inspectorState = signal4({
  fiber: null,
  fiberProps: { current: [], changes: /* @__PURE__ */ new Set() },
  fiberState: { current: [], changes: /* @__PURE__ */ new Set() },
  fiberContext: { current: [], changes: /* @__PURE__ */ new Set() }
});
var getContextChangesValue = (discriminated) => {
  switch (discriminated.kind) {
    case "initialized": {
      return discriminated.changes.currentValue;
    }
    case "partially-initialized": {
      return discriminated.value;
    }
  }
};
var processChanges = (changes, targetMap) => {
  for (const change of changes) {
    const existing = targetMap.get(change.name);
    if (existing) {
      targetMap.set(existing.name, {
        count: existing.count + 1,
        currentValue: change.value,
        id: existing.name,
        lastUpdated: Date.now(),
        name: existing.name,
        previousValue: change.prevValue
      });
      continue;
    }
    targetMap.set(change.name, {
      count: 1,
      currentValue: change.value,
      id: change.name,
      lastUpdated: Date.now(),
      name: change.name,
      previousValue: change.prevValue
    });
  }
};
var processContextChanges = (contextChanges, aggregatedChanges) => {
  for (const change of contextChanges) {
    const existing = aggregatedChanges.contextChanges.get(change.contextType);
    if (existing) {
      if (isEqual(getContextChangesValue(existing), change.value)) {
        continue;
      }
      if (existing.kind === "partially-initialized") {
        aggregatedChanges.contextChanges.set(change.contextType, {
          kind: "initialized",
          changes: {
            count: 1,
            currentValue: change.value,
            id: change.contextType.toString(),
            // come back to this why was this ever expected to be a number?
            lastUpdated: Date.now(),
            name: change.name,
            previousValue: existing.value
          }
        });
        continue;
      }
      aggregatedChanges.contextChanges.set(change.contextType, {
        kind: "initialized",
        changes: {
          count: existing.changes.count + 1,
          currentValue: change.value,
          id: change.contextType.toString(),
          lastUpdated: Date.now(),
          name: change.name,
          previousValue: existing.changes.currentValue
        }
      });
      continue;
    }
    aggregatedChanges.contextChanges.set(change.contextType, {
      kind: "partially-initialized",
      id: change.contextType.toString(),
      lastUpdated: Date.now(),
      name: change.name,
      value: change.value
    });
  }
};
var collapseQueue = (queue) => {
  const localAggregatedChanges = {
    contextChanges: /* @__PURE__ */ new Map(),
    propsChanges: /* @__PURE__ */ new Map(),
    stateChanges: /* @__PURE__ */ new Map()
  };
  queue.forEach((changes) => {
    processContextChanges(changes.contextChanges, localAggregatedChanges);
    processChanges(changes.stateChanges, localAggregatedChanges.stateChanges);
    processChanges(changes.propsChanges, localAggregatedChanges.propsChanges);
  });
  return localAggregatedChanges;
};
var mergeSimpleChanges = (existingChanges, incomingChanges) => {
  const mergedChanges = /* @__PURE__ */ new Map();
  existingChanges.forEach((value, key) => {
    mergedChanges.set(key, value);
  });
  incomingChanges.forEach((incomingChange, key) => {
    const existing = mergedChanges.get(key);
    if (!existing) {
      mergedChanges.set(key, incomingChange);
      return;
    }
    mergedChanges.set(key, {
      count: existing.count + incomingChange.count,
      currentValue: incomingChange.currentValue,
      id: incomingChange.id,
      lastUpdated: incomingChange.lastUpdated,
      name: incomingChange.name,
      previousValue: incomingChange.previousValue
    });
  });
  return mergedChanges;
};
var mergeContextChanges = (existing, incoming) => {
  const contextChanges = /* @__PURE__ */ new Map();
  existing.contextChanges.forEach((value, key) => {
    contextChanges.set(key, value);
  });
  incoming.contextChanges.forEach((incomingChange, key) => {
    const existingChange = contextChanges.get(key);
    if (!existingChange) {
      contextChanges.set(key, incomingChange);
      return;
    }
    if (getContextChangesValue(incomingChange) === getContextChangesValue(existingChange)) {
      return;
    }
    switch (existingChange.kind) {
      case "initialized": {
        switch (incomingChange.kind) {
          case "initialized": {
            const preInitEntryOffset = 1;
            contextChanges.set(key, {
              kind: "initialized",
              changes: {
                ...incomingChange.changes,
                // if existing was initialized, the pre-initialization done by the collapsed queue was not necessary, so we need to increment count to account for the preInit entry
                count: incomingChange.changes.count + existingChange.changes.count + preInitEntryOffset,
                currentValue: incomingChange.changes.currentValue,
                previousValue: incomingChange.changes.previousValue
                // we always want to show this value, since this will be the true state transition (if you make the previousValue the last seen currentValue, u will have weird behavior with primitive state updates)
              }
            });
            return;
          }
          case "partially-initialized": {
            contextChanges.set(key, {
              kind: "initialized",
              changes: {
                count: existingChange.changes.count + 1,
                currentValue: incomingChange.value,
                id: incomingChange.id,
                lastUpdated: incomingChange.lastUpdated,
                name: incomingChange.name,
                previousValue: existingChange.changes.currentValue
              }
            });
            return;
          }
        }
      }
      case "partially-initialized": {
        switch (incomingChange.kind) {
          case "initialized": {
            contextChanges.set(key, {
              kind: "initialized",
              changes: {
                count: incomingChange.changes.count + 1,
                currentValue: incomingChange.changes.currentValue,
                id: incomingChange.changes.id,
                lastUpdated: incomingChange.changes.lastUpdated,
                name: incomingChange.changes.name,
                previousValue: existingChange.value
              }
            });
            return;
          }
          case "partially-initialized": {
            contextChanges.set(key, {
              kind: "initialized",
              changes: {
                count: 1,
                currentValue: incomingChange.value,
                id: incomingChange.id,
                lastUpdated: incomingChange.lastUpdated,
                name: incomingChange.name,
                previousValue: existingChange.value
              }
            });
            return;
          }
        }
      }
    }
  });
  return contextChanges;
};
var mergeChanges = (existing, incoming) => {
  const contextChanges = mergeContextChanges(existing, incoming);
  const propChanges = mergeSimpleChanges(
    existing.propsChanges,
    incoming.propsChanges
  );
  const stateChanges = mergeSimpleChanges(
    existing.stateChanges,
    incoming.stateChanges
  );
  return {
    contextChanges,
    propsChanges: propChanges,
    stateChanges
  };
};
var calculateTotalChanges = (changes) => {
  return Array.from(changes.propsChanges.values()).reduce(
    (acc, change) => acc + change.count,
    0
  ) + Array.from(changes.stateChanges.values()).reduce(
    (acc, change) => acc + change.count,
    0
  ) + Array.from(changes.contextChanges.values()).filter(
    (change) => change.kind === "initialized"
  ).reduce((acc, change) => acc + change.changes.count, 0);
};
var useInspectedFiberChangeStore = (opts) => {
  const pendingChanges = useRef3({ queue: [] });
  const [aggregatedChanges, setAggregatedChanges] = useState5({
    propsChanges: /* @__PURE__ */ new Map(),
    stateChanges: /* @__PURE__ */ new Map(),
    contextChanges: /* @__PURE__ */ new Map()
  });
  const fiber = Store.inspectState.value.kind === "focused" ? Store.inspectState.value.fiber : null;
  const fiberId = fiber ? getFiberId(fiber) : null;
  useEffect4(() => {
    const interval = setInterval(() => {
      if (pendingChanges.current.queue.length === 0) return;
      setAggregatedChanges((prevAggregatedChanges) => {
        var _a;
        const queueChanges = collapseQueue(pendingChanges.current.queue);
        const merged = mergeChanges(prevAggregatedChanges, queueChanges);
        const prevTotal = calculateTotalChanges(prevAggregatedChanges);
        const newTotal = calculateTotalChanges(merged);
        const changeCount = newTotal - prevTotal;
        (_a = opts == null ? void 0 : opts.onChangeUpdate) == null ? void 0 : _a.call(opts, changeCount);
        return merged;
      });
      pendingChanges.current.queue = [];
    }, CHANGES_QUEUE_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [fiber]);
  useEffect4(() => {
    if (!fiberId) {
      return;
    }
    const listener = (change) => {
      var _a;
      (_a = pendingChanges.current) == null ? void 0 : _a.queue.push(change);
    };
    let listeners = Store.changesListeners.get(fiberId);
    if (!listeners) {
      listeners = [];
      Store.changesListeners.set(fiberId, listeners);
    }
    listeners.push(listener);
    return () => {
      var _a, _b;
      setAggregatedChanges({
        propsChanges: /* @__PURE__ */ new Map(),
        stateChanges: /* @__PURE__ */ new Map(),
        contextChanges: /* @__PURE__ */ new Map()
      });
      pendingChanges.current.queue = [];
      Store.changesListeners.set(
        fiberId,
        (_b = (_a = Store.changesListeners.get(fiberId)) == null ? void 0 : _a.filter((l) => l !== listener)) != null ? _b : []
      );
    };
  }, [fiberId]);
  useEffect4(() => {
    return () => {
      setAggregatedChanges({
        propsChanges: /* @__PURE__ */ new Map(),
        stateChanges: /* @__PURE__ */ new Map(),
        contextChanges: /* @__PURE__ */ new Map()
      });
      pendingChanges.current.queue = [];
    };
  }, [fiberId]);
  return aggregatedChanges;
};

// src/web/views/inspector/what-changed.tsx
import { getDisplayName as getDisplayName2, getType as getType2 } from "bippy";
import { Fragment as Fragment3, jsx as jsx5, jsxs as jsxs4 } from "preact/jsx-runtime";
var WhatChanged = /* @__PURE__ */ memo2(() => {
  const [isExpanded, setIsExpanded] = useState6(true);
  const aggregatedChanges = useInspectedFiberChangeStore();
  const [hasInitialized, setHasInitialized] = useState6(false);
  const hasAnyChanges = calculateTotalChanges(aggregatedChanges) > 0;
  useEffect5(() => {
    if (!hasInitialized && hasAnyChanges) {
      const timer = setTimeout(() => {
        setHasInitialized(true);
        requestAnimationFrame(() => {
          setIsExpanded(true);
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hasInitialized, hasAnyChanges]);
  const initializedContextChanges = new Map(
    Array.from(aggregatedChanges.contextChanges.entries()).filter(([, value]) => value.kind === "initialized").map(([key, value]) => [
      key,
      // oxlint-disable-next-line typescript/no-non-null-assertion
      value.kind === "partially-initialized" ? null : value.changes
    ])
  );
  const fiber = Store.inspectState.value.kind === "focused" ? Store.inspectState.value.fiber : null;
  if (!fiber) {
    return;
  }
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsx5(WhatsChangedHeader, {}),
    /* @__PURE__ */ jsxs4("div", { className: "overflow-hidden h-full flex flex-col gap-y-2", children: [
      /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-2 px-3 pt-2", children: [
        /* @__PURE__ */ jsxs4("span", { className: "text-sm font-medium text-[#888]", children: [
          "Why did",
          " ",
          /* @__PURE__ */ jsx5("span", { className: "text-[#A855F7]", children: getDisplayName2(fiber) }),
          " ",
          "render?"
        ] }),
        !hasAnyChanges && /* @__PURE__ */ jsxs4("div", { className: "text-sm text-[#737373] bg-[#1E1E1E] rounded-md p-4 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx5("div", { children: "No changes detected since selecting" }),
          /* @__PURE__ */ jsx5("div", { children: "The props, state, and context changes within your component will be reported here" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs4(
        "div",
        {
          className: cn(
            "flex flex-col gap-y-2 pl-3 relative overflow-y-auto h-full"
          ),
          children: [
            /* @__PURE__ */ jsx5(
              Section,
              {
                changes: aggregatedChanges.propsChanges,
                title: "Changed Props",
                isExpanded
              }
            ),
            /* @__PURE__ */ jsx5(
              Section,
              {
                renderName: (name) => {
                  var _a;
                  return renderStateName(
                    name,
                    (_a = getDisplayName2(getType2(fiber))) != null ? _a : "Unknown Component"
                  );
                },
                changes: aggregatedChanges.stateChanges,
                title: "Changed State",
                isExpanded
              }
            ),
            /* @__PURE__ */ jsx5(
              Section,
              {
                changes: initializedContextChanges,
                title: "Changed Context",
                isExpanded
              }
            )
          ]
        }
      )
    ] })
  ] });
});
var renderStateName = (key, componentName) => {
  if (Number.isNaN(Number(key))) {
    return key;
  }
  const n = Number.parseInt(key);
  const getOrdinalSuffix = (num) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return "th";
    }
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return /* @__PURE__ */ jsxs4("span", { className: "truncate", children: [
    /* @__PURE__ */ jsxs4("span", { className: "text-white", children: [
      n,
      getOrdinalSuffix(n),
      " hook",
      " "
    ] }),
    /* @__PURE__ */ jsxs4("span", { style: { color: "#666" }, children: [
      "called in ",
      /* @__PURE__ */ jsx5("i", { className: "text-[#A855F7] truncate", children: componentName })
    ] })
  ] });
};
var WhatsChangedHeader = memo2(() => {
  const refProps = useRef4(null);
  const refState = useRef4(null);
  const refContext = useRef4(null);
  const refStats = useRef4({
    isPropsChanged: false,
    isStateChanged: false,
    isContextChanged: false
  });
  useEffect5(() => {
    const flash = throttle(() => {
      var _a, _b, _c;
      const flashElements = [];
      if (((_a = refProps.current) == null ? void 0 : _a.dataset.flash) === "true") {
        flashElements.push(refProps.current);
      }
      if (((_b = refState.current) == null ? void 0 : _b.dataset.flash) === "true") {
        flashElements.push(refState.current);
      }
      if (((_c = refContext.current) == null ? void 0 : _c.dataset.flash) === "true") {
        flashElements.push(refContext.current);
      }
      for (const element of flashElements) {
        element.classList.remove("count-flash-white");
        void element.offsetWidth;
        element.classList.add("count-flash-white");
      }
    }, 400);
    const unsubscribe = timelineState.subscribe((state) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      if (!refProps.current || !refState.current || !refContext.current) {
        return;
      }
      const { currentIndex, updates } = state;
      const currentUpdate = updates[currentIndex];
      if (!currentUpdate || currentIndex === 0) {
        return;
      }
      flash();
      refStats.current = {
        isPropsChanged: ((_c = (_b = (_a = currentUpdate.props) == null ? void 0 : _a.changes) == null ? void 0 : _b.size) != null ? _c : 0) > 0,
        isStateChanged: ((_f = (_e = (_d = currentUpdate.state) == null ? void 0 : _d.changes) == null ? void 0 : _e.size) != null ? _f : 0) > 0,
        isContextChanged: ((_i = (_h = (_g = currentUpdate.context) == null ? void 0 : _g.changes) == null ? void 0 : _h.size) != null ? _i : 0) > 0
      };
      if (refProps.current.dataset.flash !== "true") {
        refProps.current.dataset.flash = refStats.current.isPropsChanged.toString();
      }
      if (refState.current.dataset.flash !== "true") {
        refState.current.dataset.flash = refStats.current.isStateChanged.toString();
      }
      if (refContext.current.dataset.flash !== "true") {
        refContext.current.dataset.flash = refStats.current.isContextChanged.toString();
      }
    });
    return unsubscribe;
  }, []);
  return /* @__PURE__ */ jsx5(
    "button",
    {
      type: "button",
      className: cn(
        "react-section-header",
        "overflow-hidden",
        "max-h-0",
        "transition-[max-height]"
      ),
      children: /* @__PURE__ */ jsx5("div", { className: cn("flex-1 react-scan-expandable"), children: /* @__PURE__ */ jsx5("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxs4("div", { className: "flex items-center whitespace-nowrap", children: [
        /* @__PURE__ */ jsx5("div", { className: "flex items-center gap-x-2", children: "What changed?" }),
        /* @__PURE__ */ jsxs4(
          "div",
          {
            className: cn(
              "ml-auto",
              "change-scope",
              "transition-opacity duration-300 delay-150"
            ),
            children: [
              /* @__PURE__ */ jsx5("div", { ref: refProps, children: "props" }),
              /* @__PURE__ */ jsx5("div", { ref: refState, children: "state" }),
              /* @__PURE__ */ jsx5("div", { ref: refContext, children: "context" })
            ]
          }
        )
      ] }) }) })
    }
  );
});
var identity = (x) => x;
var Section = /* @__PURE__ */ memo2(
  ({ title, changes, renderName = identity }) => {
    const [expandedFns, setExpandedFns] = useState6(/* @__PURE__ */ new Set());
    const [expandedEntries, setExpandedEntries] = useState6(/* @__PURE__ */ new Set());
    const entries = Array.from(changes.entries());
    if (changes.size === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxs4("div", { children: [
      /* @__PURE__ */ jsx5("div", { className: "text-xs text-[#888] mb-1.5", children: title }),
      /* @__PURE__ */ jsx5("div", { className: "flex flex-col gap-2", children: entries.map(([entryKey, change]) => {
        const isEntryExpanded = expandedEntries.has(String(entryKey));
        const { value: prevValue, error: prevError } = safeGetValue(
          change.previousValue
        );
        const { value: currValue, error: currError } = safeGetValue(
          change.currentValue
        );
        const diff = getObjectDiff(prevValue, currValue);
        return /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsx5(
            "button",
            {
              onClick: () => {
                setExpandedEntries((prev) => {
                  const next = new Set(prev);
                  if (next.has(String(entryKey))) {
                    next.delete(String(entryKey));
                  } else {
                    next.add(String(entryKey));
                  }
                  return next;
                });
              },
              className: "flex items-center gap-2 w-full bg-transparent border-none p-0 cursor-pointer text-white text-xs",
              children: /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-1.5 flex-1", children: [
                /* @__PURE__ */ jsx5(
                  Icon,
                  {
                    name: "icon-chevron-right",
                    size: 12,
                    className: cn(
                      "text-[#666] transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                      {
                        "rotate-90": isEntryExpanded
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs4("div", { className: "whitespace-pre-wrap break-words text-left font-medium flex items-center gap-x-1.5", children: [
                  renderName(change.name),
                  /* @__PURE__ */ jsx5(
                    CountBadge,
                    {
                      count: change.count,
                      isFunction: typeof change.currentValue === "function",
                      showWarning: diff.changes.length === 0,
                      forceFlash: true
                    }
                  )
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsx5(
            "div",
            {
              className: cn("react-scan-expandable", {
                "react-scan-expanded": isEntryExpanded
              }),
              children: /* @__PURE__ */ jsx5("div", { className: "pl-3 text-xs font-mono border-l-1 border-[#333]", children: /* @__PURE__ */ jsx5("div", { className: "flex flex-col gap-0.5", children: prevError || currError ? /* @__PURE__ */ jsx5(
                AccessError,
                {
                  currError,
                  prevError
                }
              ) : diff.changes.length > 0 ? /* @__PURE__ */ jsx5(
                DiffChange,
                {
                  change,
                  diff,
                  expandedFns,
                  renderName,
                  setExpandedFns,
                  title
                }
              ) : /* @__PURE__ */ jsx5(
                ReferenceOnlyChange,
                {
                  currValue,
                  entryKey,
                  expandedFns,
                  prevValue,
                  setExpandedFns
                }
              ) }) })
            }
          )
        ] }, entryKey);
      }) })
    ] });
  }
);
var AccessError = ({
  prevError,
  currError
}) => {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    prevError && /* @__PURE__ */ jsx5("div", { className: "text-[#f87171] bg-[#2a1515] pr-1.5 py-[3px] rounded italic", children: prevError }),
    currError && /* @__PURE__ */ jsx5("div", { className: "text-[#4ade80] bg-[#1a2a1a] pr-1.5 py-[3px] rounded italic mt-0.5", children: currError })
  ] });
};
var DiffChange = ({
  diff,
  title,
  renderName,
  change,
  expandedFns,
  setExpandedFns
}) => {
  return diff.changes.map((diffChange, i) => {
    const { value: prevDiffValue, error: prevDiffError } = safeGetValue(
      diffChange.prevValue
    );
    const { value: currDiffValue, error: currDiffError } = safeGetValue(
      diffChange.currentValue
    );
    const isFunction = typeof prevDiffValue === "function" || typeof currDiffValue === "function";
    let path;
    if (title === "Props") {
      path = diffChange.path.length > 0 ? `${renderName(String(change.name))}.${formatPath(diffChange.path)}` : void 0;
    }
    if (title === "State" && diffChange.path.length > 0) {
      path = `state.${formatPath(diffChange.path)}`;
    }
    if (!path) {
      path = formatPath(diffChange.path);
    }
    return /* @__PURE__ */ jsxs4(
      "div",
      {
        className: cn(
          "flex flex-col gap-y-1",
          i < diff.changes.length - 1 && "mb-4"
        ),
        children: [
          path && /* @__PURE__ */ jsx5("div", { className: "text-[#666] text-[10px]", children: path }),
          /* @__PURE__ */ jsxs4(
            "button",
            {
              type: "button",
              className: cn(
                "group",
                "flex items-start",
                "py-[3px] px-1.5",
                "text-left text-[#f87171] bg-[#2a1515]",
                "rounded",
                "overflow-hidden break-all",
                isFunction && "cursor-pointer"
              ),
              onClick: isFunction ? () => {
                const fnKey = `${formatPath(diffChange.path)}-prev`;
                setExpandedFns((prev) => {
                  const next = new Set(prev);
                  if (next.has(fnKey)) {
                    next.delete(fnKey);
                  } else {
                    next.add(fnKey);
                  }
                  return next;
                });
              } : void 0,
              children: [
                /* @__PURE__ */ jsx5("span", { className: "w-3 flex items-center justify-center opacity-50", children: "-" }),
                /* @__PURE__ */ jsx5("span", { className: "flex-1 whitespace-nowrap font-mono", children: prevDiffError ? /* @__PURE__ */ jsx5("span", { className: "italic text-[#f87171]", children: prevDiffError }) : isFunction ? /* @__PURE__ */ jsxs4("div", { className: "flex gap-1 items-start flex-col", children: [
                  /* @__PURE__ */ jsxs4("div", { className: "flex gap-1 items-start w-full", children: [
                    /* @__PURE__ */ jsx5("span", { className: "flex-1 max-h-40", children: formatFunctionPreview(
                      prevDiffValue,
                      expandedFns.has(`${formatPath(diffChange.path)}-prev`)
                    ) }),
                    typeof prevDiffValue === "function" && /* @__PURE__ */ jsx5(
                      CopyToClipboard,
                      {
                        text: prevDiffValue.toString(),
                        className: "opacity-0 transition-opacity group-hover:opacity-100",
                        children: ({ ClipboardIcon }) => /* @__PURE__ */ jsx5(Fragment3, { children: ClipboardIcon })
                      }
                    )
                  ] }),
                  (prevDiffValue == null ? void 0 : prevDiffValue.toString()) === (currDiffValue == null ? void 0 : currDiffValue.toString()) && /* @__PURE__ */ jsx5("div", { className: "text-[10px] text-[#666] italic", children: "Function reference changed" })
                ] }) : /* @__PURE__ */ jsx5(
                  DiffValueView,
                  {
                    value: prevDiffValue,
                    expanded: expandedFns.has(
                      `${formatPath(diffChange.path)}-prev`
                    ),
                    onToggle: () => {
                      const key = `${formatPath(diffChange.path)}-prev`;
                      setExpandedFns((prev) => {
                        const next = new Set(prev);
                        if (next.has(key)) {
                          next.delete(key);
                        } else {
                          next.add(key);
                        }
                        return next;
                      });
                    },
                    isNegative: true
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs4(
            "button",
            {
              type: "button",
              className: cn(
                "group",
                "flex items-start",
                "py-[3px] px-1.5",
                "text-left text-[#4ade80] bg-[#1a2a1a]",
                "rounded",
                "overflow-hidden break-all",
                isFunction && "cursor-pointer"
              ),
              onClick: isFunction ? () => {
                const fnKey = `${formatPath(diffChange.path)}-current`;
                setExpandedFns((prev) => {
                  const next = new Set(prev);
                  if (next.has(fnKey)) {
                    next.delete(fnKey);
                  } else {
                    next.add(fnKey);
                  }
                  return next;
                });
              } : void 0,
              children: [
                /* @__PURE__ */ jsx5("span", { className: "w-3 flex items-center justify-center opacity-50", children: "+" }),
                /* @__PURE__ */ jsx5("span", { className: "flex-1 whitespace-pre-wrap font-mono", children: currDiffError ? /* @__PURE__ */ jsx5("span", { className: "italic text-[#4ade80]", children: currDiffError }) : isFunction ? /* @__PURE__ */ jsxs4("div", { className: "flex gap-1 items-start flex-col", children: [
                  /* @__PURE__ */ jsxs4("div", { className: "flex gap-1 items-start w-full", children: [
                    /* @__PURE__ */ jsx5("span", { className: "flex-1", children: formatFunctionPreview(
                      currDiffValue,
                      expandedFns.has(`${formatPath(diffChange.path)}-current`)
                    ) }),
                    typeof currDiffValue === "function" && /* @__PURE__ */ jsx5(
                      CopyToClipboard,
                      {
                        text: currDiffValue.toString(),
                        className: "opacity-0 transition-opacity group-hover:opacity-100",
                        children: ({ ClipboardIcon }) => /* @__PURE__ */ jsx5(Fragment3, { children: ClipboardIcon })
                      }
                    )
                  ] }),
                  (prevDiffValue == null ? void 0 : prevDiffValue.toString()) === (currDiffValue == null ? void 0 : currDiffValue.toString()) && /* @__PURE__ */ jsx5("div", { className: "text-[10px] text-[#666] italic", children: "Function reference changed" })
                ] }) : /* @__PURE__ */ jsx5(
                  DiffValueView,
                  {
                    value: currDiffValue,
                    expanded: expandedFns.has(
                      `${formatPath(diffChange.path)}-current`
                    ),
                    onToggle: () => {
                      const key = `${formatPath(diffChange.path)}-current`;
                      setExpandedFns((prev) => {
                        const next = new Set(prev);
                        if (next.has(key)) {
                          next.delete(key);
                        } else {
                          next.add(key);
                        }
                        return next;
                      });
                    },
                    isNegative: false
                  }
                ) })
              ]
            }
          )
        ]
      },
      `${path}-${change.name}-${i}`
    );
  });
};
var ReferenceOnlyChange = ({
  prevValue,
  currValue,
  entryKey,
  expandedFns,
  setExpandedFns
}) => {
  return /* @__PURE__ */ jsxs4(Fragment3, { children: [
    /* @__PURE__ */ jsxs4("div", { className: "group flex gap-0.5 items-start text-[#f87171] bg-[#2a1515] py-[3px] px-1.5 rounded", children: [
      /* @__PURE__ */ jsx5("span", { className: "w-3 flex items-center justify-center opacity-50", children: "-" }),
      /* @__PURE__ */ jsx5("span", { className: "flex-1 overflow-hidden whitespace-pre-wrap font-mono", children: /* @__PURE__ */ jsx5(
        DiffValueView,
        {
          value: prevValue,
          expanded: expandedFns.has(`${String(entryKey)}-prev`),
          onToggle: () => {
            const key = `${String(entryKey)}-prev`;
            setExpandedFns((prev) => {
              const next = new Set(prev);
              if (next.has(key)) {
                next.delete(key);
              } else {
                next.add(key);
              }
              return next;
            });
          },
          isNegative: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "group flex gap-0.5 items-start text-[#4ade80] bg-[#1a2a1a] py-[3px] px-1.5 rounded mt-0.5", children: [
      /* @__PURE__ */ jsx5("span", { className: "w-3 flex items-center justify-center opacity-50", children: "+" }),
      /* @__PURE__ */ jsx5("span", { className: "flex-1 overflow-hidden whitespace-pre-wrap font-mono", children: /* @__PURE__ */ jsx5(
        DiffValueView,
        {
          value: currValue,
          expanded: expandedFns.has(`${String(entryKey)}-current`),
          onToggle: () => {
            const key = `${String(entryKey)}-current`;
            setExpandedFns((prev) => {
              const next = new Set(prev);
              if (next.has(key)) {
                next.delete(key);
              } else {
                next.add(key);
              }
              return next;
            });
          },
          isNegative: false
        }
      ) })
    ] }),
    typeof currValue === "object" && currValue !== null && /* @__PURE__ */ jsxs4("div", { className: "text-[#666] text-[10px] italic mt-1 flex items-center gap-x-1", children: [
      /* @__PURE__ */ jsx5(
        Icon,
        {
          name: "icon-triangle-alert",
          className: "text-yellow-500 mb-px",
          size: 14
        }
      ),
      /* @__PURE__ */ jsx5("span", { children: "Reference changed but objects are structurally the same" })
    ] })
  ] });
};
var CountBadge = ({
  count,
  forceFlash,
  isFunction,
  showWarning
}) => {
  const refIsFirstRender = useRef4(true);
  const refBadge = useRef4(null);
  const refPrevCount = useRef4(count);
  useEffect5(() => {
    const element = refBadge.current;
    if (!element || refPrevCount.current === count) {
      return;
    }
    element.classList.remove("count-flash");
    void element.offsetWidth;
    element.classList.add("count-flash");
    refPrevCount.current = count;
  }, [count]);
  useEffect5(() => {
    if (refIsFirstRender.current) {
      refIsFirstRender.current = false;
      return;
    }
    if (forceFlash) {
      let timer = setTimeout(() => {
        var _a;
        (_a = refBadge.current) == null ? void 0 : _a.classList.add("count-flash-white");
        timer = setTimeout(() => {
          var _a2;
          (_a2 = refBadge.current) == null ? void 0 : _a2.classList.remove("count-flash-white");
        }, 300);
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [forceFlash]);
  return /* @__PURE__ */ jsxs4("div", { ref: refBadge, className: "count-badge", children: [
    showWarning && /* @__PURE__ */ jsx5(
      Icon,
      {
        name: "icon-triangle-alert",
        className: "text-yellow-500 mb-px",
        size: 14
      }
    ),
    isFunction && /* @__PURE__ */ jsx5(Icon, { name: "icon-function", className: "text-[#A855F7] mb-px", size: 14 }),
    "x",
    count
  ] });
};

// src/web/views/inspector/index.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "preact/jsx-runtime";
var globalInspectorState = {
  lastRendered: /* @__PURE__ */ new Map(),
  expandedPaths: /* @__PURE__ */ new Set(),
  cleanup: () => {
    globalInspectorState.lastRendered.clear();
    globalInspectorState.expandedPaths.clear();
    flashManager.cleanupAll();
    resetTracking();
    timelineActions.reset();
  }
};
var InspectorErrorBoundary = class extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", {
      hasError: false,
      error: null
    });
    __publicField(this, "handleReset", () => {
      this.setState({ hasError: false, error: null });
      globalInspectorState.cleanup();
    });
  }
  static getDerivedStateFromError(e) {
    return { hasError: true, error: e };
  }
  render() {
    var _a;
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs5("div", { className: "p-4 bg-red-950/50 h-screen backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 mb-3 text-red-400 font-medium", children: [
          /* @__PURE__ */ jsx6(Icon, { name: "icon-flame", className: "text-red-500", size: 16 }),
          "Something went wrong in the inspector"
        ] }),
        /* @__PURE__ */ jsx6("div", { className: "p-3 bg-black/40 rounded font-mono text-xs text-red-300 mb-4 break-words", children: ((_a = this.state.error) == null ? void 0 : _a.message) || JSON.stringify(this.state.error) }),
        /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            onClick: this.handleReset,
            className: "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            children: "Reset Inspector"
          }
        )
      ] });
    }
    return this.props.children;
  }
};
var inspectorContainerClassName = computed(
  () => cn(
    "react-scan-inspector",
    "flex-1",
    "opacity-0",
    "overflow-y-auto overflow-x-hidden",
    "transition-opacity delay-0",
    "pointer-events-none",
    !signalIsSettingsOpen.value && "opacity-100 delay-300 pointer-events-auto"
  )
);
var Inspector = /* @__PURE__ */ constant(() => {
  const refLastInspectedFiber = useRef5(null);
  const processUpdate = (fiber) => {
    if (!fiber) return;
    refLastInspectedFiber.current = fiber;
    const { data: inspectorData, shouldUpdate } = collectInspectorData(fiber);
    if (shouldUpdate) {
      const update = {
        timestamp: Date.now(),
        fiberInfo: extractMinimalFiberInfo(fiber),
        props: inspectorData.fiberProps,
        state: inspectorData.fiberState,
        context: inspectorData.fiberContext,
        stateNames: getStateNames(fiber)
      };
      timelineActions.addUpdate(update, fiber);
    }
  };
  useSignalEffect(() => {
    const state = Store.inspectState.value;
    untracked(() => {
      var _a;
      if (state.kind !== "focused" || !state.focusedDomElement) {
        refLastInspectedFiber.current = null;
        globalInspectorState.cleanup();
        return;
      }
      if (state.kind === "focused") {
        signalIsSettingsOpen.value = false;
      }
      const { parentCompositeFiber } = getCompositeFiberFromElement(
        state.focusedDomElement,
        state.fiber
      );
      if (!parentCompositeFiber) {
        Store.inspectState.value = {
          kind: "inspect-off"
        };
        signalWidgetViews.value = {
          view: "none"
        };
        return;
      }
      const isNewComponent = ((_a = refLastInspectedFiber.current) == null ? void 0 : _a.type) !== parentCompositeFiber.type;
      if (isNewComponent) {
        refLastInspectedFiber.current = parentCompositeFiber;
        globalInspectorState.cleanup();
        processUpdate(parentCompositeFiber);
      }
    });
  });
  useSignalEffect(() => {
    inspectorUpdateSignal.value;
    untracked(() => {
      const inspectState = Store.inspectState.value;
      if (inspectState.kind !== "focused" || !inspectState.focusedDomElement) {
        refLastInspectedFiber.current = null;
        globalInspectorState.cleanup();
        return;
      }
      const { parentCompositeFiber } = getCompositeFiberFromElement(
        inspectState.focusedDomElement,
        inspectState.fiber
      );
      if (!parentCompositeFiber) {
        Store.inspectState.value = {
          kind: "inspect-off"
        };
        signalWidgetViews.value = {
          view: "none"
        };
        return;
      }
      processUpdate(parentCompositeFiber);
      if (!inspectState.focusedDomElement.isConnected) {
        refLastInspectedFiber.current = null;
        globalInspectorState.cleanup();
        Store.inspectState.value = {
          kind: "inspecting",
          hoveredDomElement: null
        };
      }
    });
  });
  useEffect6(() => {
    return () => {
      globalInspectorState.cleanup();
    };
  }, []);
  return /* @__PURE__ */ jsx6(InspectorErrorBoundary, { children: /* @__PURE__ */ jsx6("div", { className: inspectorContainerClassName, children: /* @__PURE__ */ jsx6("div", { className: "w-full h-full", children: /* @__PURE__ */ jsx6(WhatChanged, {}) }) }) });
});
var ViewInspector = /* @__PURE__ */ constant(() => {
  if (Store.inspectState.value.kind !== "focused") return null;
  return /* @__PURE__ */ jsxs5(InspectorErrorBoundary, { children: [
    /* @__PURE__ */ jsx6(Inspector, {}),
    /* @__PURE__ */ jsx6(ComponentsTree, {})
  ] });
});

// src/web/views/inspector/utils.ts
var getFiberFromElement = (element) => {
  var _a, _b, _c, _d;
  if ("__REACT_DEVTOOLS_GLOBAL_HOOK__" in window) {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!(hook == null ? void 0 : hook.renderers)) return null;
    for (const [, renderer] of Array.from(hook.renderers)) {
      try {
        const fiber = (_a = renderer.findFiberByHostInstance) == null ? void 0 : _a.call(renderer, element);
        if (fiber) return fiber;
      } catch {
      }
    }
  }
  if ("_reactRootContainer" in element) {
    const elementWithRoot = element;
    const rootContainer2 = elementWithRoot._reactRootContainer;
    return (_d = (_c = (_b = rootContainer2 == null ? void 0 : rootContainer2._internalRoot) == null ? void 0 : _b.current) == null ? void 0 : _c.child) != null ? _d : null;
  }
  for (const key in element) {
    if (key.startsWith("__reactInternalInstance$") || key.startsWith("__reactFiber")) {
      const elementWithFiber = element;
      return elementWithFiber[key];
    }
  }
  return null;
};
var getFirstStateNode = (fiber) => {
  let current = fiber;
  while (current) {
    if (current.stateNode instanceof Element) {
      return current.stateNode;
    }
    if (!current.child) {
      break;
    }
    current = current.child;
  }
  while (current) {
    if (current.stateNode instanceof Element) {
      return current.stateNode;
    }
    if (!current.return) {
      break;
    }
    current = current.return;
  }
  return null;
};
var getNearestFiberFromElement = (element) => {
  if (!element) return null;
  try {
    const fiber = getFiberFromElement(element);
    if (!fiber) return null;
    const res = getParentCompositeFiber(fiber);
    return res ? res[0] : null;
  } catch {
    return null;
  }
};
var getParentCompositeFiber = (fiber) => {
  let current = fiber;
  let prevHost = null;
  while (current) {
    if (isCompositeFiber(current)) return [current, prevHost];
    if (isHostFiber(current) && !prevHost) prevHost = current;
    current = current.return;
  }
  return null;
};
var isFiberInTree = (fiber, root) => {
  {
    const res = !!traverseFiber(root, (searchFiber) => searchFiber === fiber);
    return res;
  }
};
var getAssociatedFiberRect = async (element) => {
  const associatedFiber = getNearestFiberFromElement(element);
  if (!associatedFiber) return null;
  const stateNode = getFirstStateNode(associatedFiber);
  if (!stateNode) return null;
  const rect = await new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      var _a, _b;
      observer.disconnect();
      resolve((_b = (_a = entries[0]) == null ? void 0 : _a.boundingClientRect) != null ? _b : null);
    });
    observer.observe(stateNode);
  });
  return rect;
};
var getCompositeComponentFromElement = (element) => {
  const associatedFiber = getNearestFiberFromElement(element);
  if (!associatedFiber) return {};
  const stateNode = getFirstStateNode(associatedFiber);
  if (!stateNode) return {};
  const parentCompositeFiberInfo = getParentCompositeFiber(associatedFiber);
  if (!parentCompositeFiberInfo) {
    return {};
  }
  const [parentCompositeFiber] = parentCompositeFiberInfo;
  return {
    parentCompositeFiber
  };
};
var getCompositeFiberFromElement = (element, knownFiber) => {
  var _a, _b, _c, _d;
  if (!element.isConnected) return {};
  let fiber = knownFiber != null ? knownFiber : getNearestFiberFromElement(element);
  if (!fiber) return {};
  let curr = fiber;
  let rootFiber = null;
  let currentRootFiber = null;
  while (curr) {
    if (!curr.stateNode) {
      curr = curr.return;
      continue;
    }
    if ((_a = ReactScanInternals.instrumentation) == null ? void 0 : _a.fiberRoots.has(curr.stateNode)) {
      rootFiber = curr;
      currentRootFiber = curr.stateNode.current;
      break;
    }
    curr = curr.return;
  }
  if (!rootFiber || !currentRootFiber) return {};
  fiber = isFiberInTree(fiber, currentRootFiber) ? fiber : (_b = fiber.alternate) != null ? _b : fiber;
  if (!fiber) return {};
  if (!getFirstStateNode(fiber)) return {};
  const parentCompositeFiber = (_c = getParentCompositeFiber(fiber)) == null ? void 0 : _c[0];
  if (!parentCompositeFiber) return {};
  return {
    parentCompositeFiber: isFiberInTree(parentCompositeFiber, currentRootFiber) ? parentCompositeFiber : (_d = parentCompositeFiber.alternate) != null ? _d : parentCompositeFiber
  };
};
var getChangedPropsDetailed = (fiber) => {
  var _a, _b, _c;
  const currentProps = (_a = fiber.memoizedProps) != null ? _a : {};
  const previousProps = (_c = (_b = fiber.alternate) == null ? void 0 : _b.memoizedProps) != null ? _c : {};
  const changes = [];
  for (const key in currentProps) {
    if (key === "children") continue;
    const currentValue = currentProps[key];
    const prevValue = previousProps[key];
    if (!isEqual(currentValue, prevValue)) {
      changes.push({
        name: key,
        value: currentValue,
        prevValue,
        type: 1 /* Props */
      });
    }
  }
  return changes;
};
var nonVisualTags = /* @__PURE__ */ new Set([
  "HTML",
  "HEAD",
  "META",
  "TITLE",
  "BASE",
  "SCRIPT",
  "SCRIPT",
  "STYLE",
  "LINK",
  "NOSCRIPT",
  "SOURCE",
  "TRACK",
  "EMBED",
  "OBJECT",
  "PARAM",
  "TEMPLATE",
  "PORTAL",
  "SLOT",
  "AREA",
  "XML",
  "DOCTYPE",
  "COMMENT"
]);
var findComponentDOMNode = (fiber, excludeNonVisualTags = true) => {
  if (fiber.stateNode && "nodeType" in fiber.stateNode) {
    const element = fiber.stateNode;
    if (excludeNonVisualTags && element.tagName && nonVisualTags.has(element.tagName.toLowerCase())) {
      return null;
    }
    return element;
  }
  let child = fiber.child;
  while (child) {
    const result = findComponentDOMNode(child, excludeNonVisualTags);
    if (result) return result;
    child = child.sibling;
  }
  return null;
};
var getInspectableElements = (root = document.body) => {
  const result = [];
  const findInspectableFiber = (element) => {
    if (!element) return null;
    const { parentCompositeFiber } = getCompositeComponentFromElement(element);
    if (!parentCompositeFiber) return null;
    const componentRoot = findComponentDOMNode(parentCompositeFiber);
    return componentRoot === element ? element : null;
  };
  const traverse = (element, depth = 0) => {
    var _a;
    const inspectable = findInspectableFiber(element);
    if (inspectable) {
      const { parentCompositeFiber } = getCompositeComponentFromElement(inspectable);
      if (!parentCompositeFiber) return;
      result.push({
        element: inspectable,
        depth,
        name: (_a = getDisplayName3(parentCompositeFiber.type)) != null ? _a : "Unknown",
        fiber: parentCompositeFiber
      });
    }
    for (const child of Array.from(element.children)) {
      traverse(child, inspectable ? depth + 1 : depth);
    }
  };
  traverse(root);
  return result;
};
var formatForClipboard = (value) => {
  try {
    if (value === null) return "null";
    if (value === void 0) return "undefined";
    if (isPromise(value)) return "Promise";
    if (typeof value === "function") {
      const fnStr = value.toString();
      try {
        const formatted = fnStr.replace(/\s+/g, " ").replace(/{\s+/g, "{\n  ").replace(/;\s+/g, ";\n  ").replace(/}\s*$/g, "\n}").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").replace(/,\s+/g, ", ");
        return formatted;
      } catch {
        return fnStr;
      }
    }
    switch (true) {
      case value instanceof Date:
        return value.toISOString();
      case value instanceof RegExp:
        return value.toString();
      case value instanceof Error:
        return `${value.name}: ${value.message}`;
      case value instanceof Map:
        return JSON.stringify(Array.from(value.entries()), null, 2);
      case value instanceof Set:
        return JSON.stringify(Array.from(value), null, 2);
      case value instanceof DataView:
        return JSON.stringify(
          Array.from(new Uint8Array(value.buffer)),
          null,
          2
        );
      case value instanceof ArrayBuffer:
        return JSON.stringify(Array.from(new Uint8Array(value)), null, 2);
      case (ArrayBuffer.isView(value) && "length" in value):
        return JSON.stringify(
          Array.from(value),
          null,
          2
        );
      case Array.isArray(value):
        return JSON.stringify(value, null, 2);
      case typeof value === "object":
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  } catch {
    return String(value);
  }
};
var areFunctionsEqual = (prev, current) => {
  try {
    if (typeof prev !== "function" || typeof current !== "function") {
      return false;
    }
    return prev.toString() === current.toString();
  } catch {
    return false;
  }
};
var getObjectDiff = (prev, current, path = [], seen = /* @__PURE__ */ new WeakSet()) => {
  if (prev === current) {
    return { type: "primitive", changes: [], hasDeepChanges: false };
  }
  if (typeof prev === "function" && typeof current === "function") {
    const isSameFunction = areFunctionsEqual(prev, current);
    return {
      type: "primitive",
      changes: [
        {
          path,
          prevValue: prev,
          currentValue: current,
          sameFunction: isSameFunction
        }
      ],
      hasDeepChanges: !isSameFunction
    };
  }
  if (prev === null || current === null || prev === void 0 || current === void 0 || typeof prev !== "object" || typeof current !== "object") {
    return {
      type: "primitive",
      changes: [{ path, prevValue: prev, currentValue: current }],
      hasDeepChanges: true
    };
  }
  if (seen.has(prev) || seen.has(current)) {
    return {
      type: "object",
      changes: [{ path, prevValue: "[Circular]", currentValue: "[Circular]" }],
      hasDeepChanges: false
    };
  }
  seen.add(prev);
  seen.add(current);
  const prevObj = prev;
  const currentObj = current;
  const allKeys = /* @__PURE__ */ new Set([
    ...Object.keys(prevObj),
    ...Object.keys(currentObj)
  ]);
  const changes = [];
  let hasDeepChanges = false;
  for (const key of allKeys) {
    const prevValue = prevObj[key];
    const currentValue = currentObj[key];
    if (prevValue !== currentValue) {
      if (typeof prevValue === "object" && typeof currentValue === "object" && prevValue !== null && currentValue !== null) {
        const nestedDiff = getObjectDiff(
          prevValue,
          currentValue,
          [...path, key],
          seen
        );
        changes.push(...nestedDiff.changes);
        if (nestedDiff.hasDeepChanges) {
          hasDeepChanges = true;
        }
      } else {
        changes.push({
          path: [...path, key],
          prevValue,
          currentValue
        });
        hasDeepChanges = true;
      }
    }
  }
  return {
    type: "object",
    changes,
    hasDeepChanges
  };
};
var formatPath = (path) => {
  if (path.length === 0) return "";
  return path.reduce((acc, segment, i) => {
    if (/^\d+$/.test(segment)) {
      return `${acc}[${segment}]`;
    }
    return i === 0 ? segment : `${acc}.${segment}`;
  }, "");
};
function hackyJsFormatter(code) {
  const normalizedCode = code.replace(/\s+/g, " ").trim();
  const rawTokens = [];
  let current = "";
  for (let i = 0; i < normalizedCode.length; i++) {
    const c = normalizedCode[i];
    if (c === "=" && normalizedCode[i + 1] === ">") {
      if (current.trim()) rawTokens.push(current.trim());
      rawTokens.push("=>");
      current = "";
      i++;
      continue;
    }
    if (/[(){}[\];,<>:\?!]/.test(c)) {
      if (current.trim()) {
        rawTokens.push(current.trim());
      }
      rawTokens.push(c);
      current = "";
    } else if (/\s/.test(c)) {
      if (current.trim()) {
        rawTokens.push(current.trim());
      }
      current = "";
    } else {
      current += c;
    }
  }
  if (current.trim()) {
    rawTokens.push(current.trim());
  }
  const merged = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i];
    const n = rawTokens[i + 1];
    if (t === "(" && n === ")" || t === "[" && n === "]" || t === "{" && n === "}" || t === "<" && n === ">") {
      merged.push(t + n);
      i++;
    } else {
      merged.push(t);
    }
  }
  const arrowParamSet = /* @__PURE__ */ new Set();
  const genericSet = /* @__PURE__ */ new Set();
  function findMatchingPair(openTok, closeTok, startIndex) {
    let depth = 0;
    for (let j = startIndex; j < merged.length; j++) {
      const token = merged[j];
      if (token === openTok) depth++;
      else if (token === closeTok) {
        depth--;
        if (depth === 0) return j;
      }
    }
    return -1;
  }
  for (let i = 0; i < merged.length; i++) {
    const t = merged[i];
    if (t === "(") {
      const closeIndex = findMatchingPair("(", ")", i);
      if (closeIndex !== -1 && merged[closeIndex + 1] === "=>") {
        for (let k = i; k <= closeIndex; k++) {
          arrowParamSet.add(k);
        }
      }
    }
  }
  for (let i = 1; i < merged.length; i++) {
    const prev = merged[i - 1];
    const t = merged[i];
    if (/^[a-zA-Z0-9_$]+$/.test(prev) && t === "<") {
      const closeIndex = findMatchingPair("<", ">", i);
      if (closeIndex !== -1) {
        for (let k = i; k <= closeIndex; k++) {
          genericSet.add(k);
        }
      }
    }
  }
  let indentLevel = 0;
  const indentStr = "  ";
  const lines = [];
  let line = "";
  function pushLine() {
    if (line.trim()) {
      lines.push(line.replace(/\s+$/, ""));
    }
    line = "";
  }
  function newLine() {
    pushLine();
    line = indentStr.repeat(indentLevel);
  }
  const stack = [];
  function stackTop() {
    return stack.length ? stack[stack.length - 1] : null;
  }
  function placeToken(tok, noSpaceBefore = false) {
    if (!line.trim()) {
      line += tok;
    } else {
      if (noSpaceBefore || /^[),;:\].}>]$/.test(tok)) {
        line += tok;
      } else {
        line += ` ${tok}`;
      }
    }
  }
  for (let i = 0; i < merged.length; i++) {
    const tok = merged[i];
    const next = merged[i + 1] || "";
    if (["(", "{", "[", "<"].includes(tok)) {
      placeToken(tok);
      stack.push(tok);
      if (tok === "{") {
        indentLevel++;
        newLine();
      } else if (tok === "(" || tok === "[" || tok === "<") {
        if (arrowParamSet.has(i) && tok === "(" || genericSet.has(i) && tok === "<") {
        } else {
          const directClose = {
            "(": ")",
            "[": "]",
            "<": ">"
          }[tok];
          if (next !== directClose && next !== "()" && next !== "[]" && next !== "<>") {
            indentLevel++;
            newLine();
          }
        }
      }
    } else if ([")", "}", "]", ">"].includes(tok)) {
      const opening = stackTop();
      if (tok === ")" && opening === "(" || tok === "]" && opening === "[" || tok === ">" && opening === "<") {
        if (!(arrowParamSet.has(i) && tok === ")") && !(genericSet.has(i) && tok === ">")) {
          indentLevel = Math.max(indentLevel - 1, 0);
          newLine();
        }
      } else if (tok === "}" && opening === "{") {
        indentLevel = Math.max(indentLevel - 1, 0);
        newLine();
      }
      stack.pop();
      placeToken(tok);
      if (tok === "}") {
        newLine();
      }
    } else if (/^\(\)|\[\]|\{\}|\<\>$/.test(tok)) {
      placeToken(tok);
    } else if (tok === "=>") {
      placeToken(tok);
    } else if (tok === ";") {
      placeToken(tok, true);
      newLine();
    } else if (tok === ",") {
      placeToken(tok, true);
      const top = stackTop();
      if (!(arrowParamSet.has(i) && top === "(") && !(genericSet.has(i) && top === "<")) {
        if (top && ["{", "[", "(", "<"].includes(top)) {
          newLine();
        }
      }
    } else {
      placeToken(tok);
    }
  }
  pushLine();
  return lines.join("\n").replace(/\n\s*\n+/g, "\n").trim();
}
var formatFunctionPreview = (fn, expanded = false) => {
  try {
    const fnStr = fn.toString();
    const match = fnStr.match(
      /(?:function\s*)?(?:\(([^)]*)\)|([^=>\s]+))\s*=>?/
    );
    if (!match) return "\u0192";
    const params = match[1] || match[2] || "";
    const cleanParams = params.replace(/\s+/g, "");
    if (!expanded) {
      return `\u0192 (${cleanParams}) => ...`;
    }
    return hackyJsFormatter(fnStr);
  } catch {
    return "\u0192";
  }
};
var formatValuePreview = (value) => {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  if (typeof value === "string")
    return `"${value.length > 150 ? `${value.slice(0, 20)}...` : value}"`;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "function") return formatFunctionPreview(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `{${keys.length > 2 ? `${keys.slice(0, 2).join(", ")}, ...` : keys.join(", ")}}`;
  }
  return String(value);
};
var safeGetValue = (value) => {
  var _a;
  if (value === null || value === void 0) return { value };
  if (typeof value === "function") return { value };
  if (typeof value !== "object") return { value };
  if (isPromise(value)) {
    return { value: "Promise" };
  }
  try {
    const proto = Object.getPrototypeOf(value);
    if (proto === Promise.prototype || ((_a = proto == null ? void 0 : proto.constructor) == null ? void 0 : _a.name) === "Promise") {
      return { value: "Promise" };
    }
    return { value };
  } catch {
    return { value: null, error: "Error accessing value" };
  }
};
var isPromise = (value) => {
  return !!value && (value instanceof Promise || typeof value === "object" && "then" in value);
};
var extractMinimalFiberInfo = (fiber) => {
  var _a, _b;
  const timings = getTimings(fiber);
  return {
    displayName: getDisplayName3(fiber) || "Unknown",
    type: fiber.type,
    key: fiber.key,
    id: fiber.index,
    selfTime: (_a = timings == null ? void 0 : timings.selfTime) != null ? _a : null,
    totalTime: (_b = timings == null ? void 0 : timings.totalTime) != null ? _b : null
  };
};

// src/web/views/inspector/timeline/utils.ts
var propsTracker = /* @__PURE__ */ new Map();
var stateTracker = /* @__PURE__ */ new Map();
var contextTracker = /* @__PURE__ */ new Map();
var lastComponentType = null;
var STATE_NAME_REGEX = /\[(?<name>\w+),\s*set\w+\]/g;
var getStateNames = (fiber) => {
  var _a, _b;
  const componentSource = ((_b = (_a = fiber.type) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) || "";
  return componentSource ? Array.from(
    componentSource.matchAll(STATE_NAME_REGEX),
    (m) => {
      var _a2, _b2;
      return (_b2 = (_a2 = m.groups) == null ? void 0 : _a2.name) != null ? _b2 : "";
    }
  ) : [];
};
var resetTracking = () => {
  propsTracker.clear();
  stateTracker.clear();
  contextTracker.clear();
  lastComponentType = null;
};
var isInitialComponentUpdate = (fiber) => {
  const isNewComponent = fiber.type !== lastComponentType;
  lastComponentType = fiber.type;
  return isNewComponent;
};
var trackChange = (tracker, key, currentValue, previousValue) => {
  const existing = tracker.get(key);
  const isInitialValue = tracker === propsTracker || tracker === contextTracker;
  const hasChanged = !isEqual(currentValue, previousValue);
  if (!existing) {
    tracker.set(key, {
      count: hasChanged && isInitialValue ? 1 : 0,
      currentValue,
      previousValue,
      lastUpdated: Date.now()
    });
    return {
      hasChanged,
      count: hasChanged && isInitialValue ? 1 : isInitialValue ? 0 : 1
    };
  }
  if (!isEqual(existing.currentValue, currentValue)) {
    const newCount = existing.count + 1;
    tracker.set(key, {
      count: newCount,
      currentValue,
      previousValue: existing.currentValue,
      lastUpdated: Date.now()
    });
    return { hasChanged: true, count: newCount };
  }
  return { hasChanged: false, count: existing.count };
};
var getStateFromFiber = (fiber) => {
  if (!fiber) return {};
  if (fiber.tag === FunctionComponentTag2 || fiber.tag === ForwardRefTag || fiber.tag === SimpleMemoComponentTag2 || fiber.tag === MemoComponentTag2) {
    let memoizedState = fiber.memoizedState;
    const state = {};
    let index = 0;
    while (memoizedState) {
      if (memoizedState.queue && memoizedState.memoizedState !== void 0) {
        state[index] = memoizedState.memoizedState;
      }
      memoizedState = memoizedState.next;
      index++;
    }
    return state;
  }
  if (fiber.tag === ClassComponentTag) {
    return fiber.memoizedState || {};
  }
  return {};
};
var collectPropsChanges = (fiber) => {
  var _a;
  const currentProps = fiber.memoizedProps || {};
  const prevProps = ((_a = fiber.alternate) == null ? void 0 : _a.memoizedProps) || {};
  const current = {};
  const prev = {};
  const allProps = Object.keys(currentProps);
  for (const key of allProps) {
    if (key in currentProps) {
      current[key] = currentProps[key];
      prev[key] = prevProps[key];
    }
  }
  const changes = getChangedPropsDetailed(fiber).map((change) => ({
    name: change.name,
    value: change.value,
    prevValue: change.prevValue
  }));
  return { current, prev, changes };
};
var collectStateChanges = (fiber) => {
  const current = getStateFromFiber(fiber);
  const prev = fiber.alternate ? getStateFromFiber(fiber.alternate) : {};
  const changes = [];
  for (const [index, value] of Object.entries(current)) {
    const stateKey = fiber.tag === ClassComponentTag ? index : Number(index);
    if (fiber.alternate && !isEqual(prev[index], value)) {
      changes.push({
        name: stateKey,
        value,
        prevValue: prev[index]
      });
    }
  }
  return { current, prev, changes };
};
var collectContextChanges = (fiber) => {
  const currentContexts = getAllFiberContexts(fiber);
  const prevContexts = fiber.alternate ? getAllFiberContexts(fiber.alternate) : /* @__PURE__ */ new Map();
  const current = {};
  const prev = {};
  const changes = [];
  const seenContexts = /* @__PURE__ */ new Set();
  for (const [contextType, ctx2] of currentContexts) {
    const name = ctx2.displayName;
    const contextKey = contextType;
    if (seenContexts.has(contextKey)) continue;
    seenContexts.add(contextKey);
    current[name] = ctx2.value;
    const prevCtx = prevContexts.get(contextType);
    if (prevCtx) {
      prev[name] = prevCtx.value;
      if (!isEqual(prevCtx.value, ctx2.value)) {
        changes.push({
          name,
          value: ctx2.value,
          prevValue: prevCtx.value,
          contextType
        });
      }
    }
  }
  return { current, prev, changes };
};
var collectInspectorData = (fiber) => {
  const emptySection = () => ({
    current: [],
    changes: /* @__PURE__ */ new Set(),
    changesCounts: /* @__PURE__ */ new Map()
  });
  if (!fiber) {
    return {
      data: {
        fiberProps: emptySection(),
        fiberState: emptySection(),
        fiberContext: emptySection()
      },
      shouldUpdate: false
    };
  }
  let hasNewChanges = false;
  const isInitialUpdate = isInitialComponentUpdate(fiber);
  const propsData = emptySection();
  if (fiber.memoizedProps) {
    const { current, changes } = collectPropsChanges(fiber);
    for (const [key, value] of Object.entries(current)) {
      propsData.current.push({
        name: key,
        value: isPromise(value) ? { type: "promise", displayValue: "Promise" } : value
      });
    }
    for (const change of changes) {
      const { hasChanged, count } = trackChange(
        propsTracker,
        change.name,
        change.value,
        change.prevValue
      );
      if (hasChanged) {
        hasNewChanges = true;
        propsData.changes.add(change.name);
        propsData.changesCounts.set(change.name, count);
      }
    }
  }
  const stateData = emptySection();
  const { current: stateCurrent, changes: stateChanges } = collectStateChanges(fiber);
  for (const [index, value] of Object.entries(stateCurrent)) {
    const stateKey = fiber.tag === ClassComponentTag ? index : Number(index);
    stateData.current.push({ name: stateKey, value });
  }
  for (const change of stateChanges) {
    const { hasChanged, count } = trackChange(
      stateTracker,
      change.name,
      change.value,
      change.prevValue
    );
    if (hasChanged) {
      hasNewChanges = true;
      stateData.changes.add(change.name);
      stateData.changesCounts.set(change.name, count);
    }
  }
  const contextData = emptySection();
  const { current: contextCurrent, changes: contextChanges } = collectContextChanges(fiber);
  for (const [name, value] of Object.entries(contextCurrent)) {
    contextData.current.push({ name, value });
  }
  if (!isInitialUpdate) {
    for (const change of contextChanges) {
      const { hasChanged, count } = trackChange(
        contextTracker,
        change.name,
        change.value,
        change.prevValue
      );
      if (hasChanged) {
        hasNewChanges = true;
        contextData.changes.add(change.name);
        contextData.changesCounts.set(change.name, count);
      }
    }
  }
  if (!hasNewChanges && !isInitialUpdate) {
    propsData.changes.clear();
    stateData.changes.clear();
    contextData.changes.clear();
  }
  return {
    data: {
      fiberProps: propsData,
      fiberState: stateData,
      fiberContext: contextData
    },
    shouldUpdate: hasNewChanges || isInitialUpdate
  };
};
var fiberContextsCache = /* @__PURE__ */ new WeakMap();
var getAllFiberContexts = (fiber) => {
  var _a;
  if (!fiber) {
    return /* @__PURE__ */ new Map();
  }
  const cachedContexts = fiberContextsCache.get(fiber);
  if (cachedContexts) {
    return cachedContexts;
  }
  const contexts = /* @__PURE__ */ new Map();
  let currentFiber = fiber;
  while (currentFiber) {
    const dependencies = currentFiber.dependencies;
    if (dependencies == null ? void 0 : dependencies.firstContext) {
      let contextItem = dependencies.firstContext;
      while (contextItem) {
        const memoizedValue = contextItem.memoizedValue;
        const displayName = (_a = contextItem.context) == null ? void 0 : _a.displayName;
        if (!contexts.has(memoizedValue)) {
          contexts.set(contextItem.context, {
            value: memoizedValue,
            displayName: displayName != null ? displayName : "UnnamedContext",
            contextType: null
          });
        }
        if (contextItem === contextItem.next) {
          break;
        }
        contextItem = contextItem.next;
      }
    }
    currentFiber = currentFiber.return;
  }
  fiberContextsCache.set(fiber, contexts);
  return contexts;
};
var collectInspectorDataWithoutCounts = (fiber) => {
  const emptySection = () => ({
    current: [],
    changes: /* @__PURE__ */ new Set(),
    changesCounts: /* @__PURE__ */ new Map()
  });
  if (!fiber) {
    return {
      fiberProps: emptySection(),
      fiberState: emptySection(),
      fiberContext: emptySection()
    };
  }
  const propsData = emptySection();
  if (fiber.memoizedProps) {
    const { current: current2, changes: changes2 } = collectPropsChanges(fiber);
    for (const [key, value] of Object.entries(current2)) {
      propsData.current.push({
        name: key,
        value: isPromise(value) ? { type: "promise", displayValue: "Promise" } : value
      });
    }
    for (const change of changes2) {
      propsData.changes.add(change.name);
      propsData.changesCounts.set(change.name, 1);
    }
  }
  const stateData = emptySection();
  if (fiber.memoizedState) {
    const { current: current2, changes: changes2 } = collectStateChanges(fiber);
    for (const [key, value] of Object.entries(current2)) {
      stateData.current.push({
        name: key,
        value: isPromise(value) ? { type: "promise", displayValue: "Promise" } : value
      });
    }
    for (const change of changes2) {
      stateData.changes.add(change.name);
      stateData.changesCounts.set(change.name, 1);
    }
  }
  const contextData = emptySection();
  const { current, changes } = collectContextChanges(fiber);
  for (const [key, value] of Object.entries(current)) {
    contextData.current.push({
      name: key,
      value: isPromise(value) ? { type: "promise", displayValue: "Promise" } : value
    });
  }
  for (const change of changes) {
    contextData.changes.add(change.name);
    contextData.changesCounts.set(change.name, 1);
  }
  return {
    // data: {
    fiberProps: propsData,
    fiberState: stateData,
    fiberContext: contextData
    // },
  };
};

// src/core/instrumentation.ts
var RENDER_PHASE_STRING_TO_ENUM = {
  mount: 1 /* Mount */,
  update: 2 /* Update */,
  unmount: 4 /* Unmount */
};
var fps = 0;
var lastTime = performance.now();
var frameCount = 0;
var initedFps = false;
var updateFPS = () => {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1e3) {
    fps = frameCount;
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(updateFPS);
};
var getFPS = () => {
  if (!initedFps) {
    initedFps = true;
    updateFPS();
    fps = 60;
  }
  return fps;
};
var isValueUnstable = (prevValue, nextValue) => {
  const prevValueString = fastSerialize(prevValue);
  const nextValueString = fastSerialize(nextValue);
  return prevValueString === nextValueString && unstableTypes.includes(typeof prevValue) && unstableTypes.includes(typeof nextValue);
};
var unstableTypes = ["function", "object"];
var cache = /* @__PURE__ */ new WeakMap();
function fastSerialize(value, depth = 0) {
  var _a;
  if (depth < 0) return "\u2026";
  switch (typeof value) {
    case "function":
      return value.toString();
    case "string":
      return value;
    case "number":
    case "boolean":
    case "undefined":
      return String(value);
    case "object":
      break;
    default:
      return String(value);
  }
  if (value === null) return "null";
  if (cache.has(value)) {
    const cached = cache.get(value);
    if (cached !== void 0) {
      return cached;
    }
  }
  if (Array.isArray(value)) {
    const str2 = value.length ? `[${value.length}]` : "[]";
    cache.set(value, str2);
    return str2;
  }
  if (isValidElement(value)) {
    const type = (_a = getDisplayName4(value.type)) != null ? _a : "";
    const propCount = value.props ? Object.keys(value.props).length : 0;
    const str2 = `<${type} ${propCount}>`;
    cache.set(value, str2);
    return str2;
  }
  if (Object.getPrototypeOf(value) === Object.prototype) {
    const keys = Object.keys(value);
    const str2 = keys.length ? `{${keys.length}}` : "{}";
    cache.set(value, str2);
    return str2;
  }
  const ctor = value && typeof value === "object" ? value.constructor : void 0;
  if (ctor && typeof ctor === "function" && ctor.name) {
    const str2 = `${ctor.name}{\u2026}`;
    cache.set(value, str2);
    return str2;
  }
  const tagString = Object.prototype.toString.call(value).slice(8, -1);
  const str = `${tagString}{\u2026}`;
  cache.set(value, str);
  return str;
}
var getStateChanges = (fiber) => {
  var _a, _b;
  if (!fiber) return [];
  const changes = [];
  if (fiber.tag === FunctionComponentTag3 || fiber.tag === ForwardRefTag2 || fiber.tag === SimpleMemoComponentTag3 || fiber.tag === MemoComponentTag3) {
    let memoizedState = fiber.memoizedState;
    let prevState = (_a = fiber.alternate) == null ? void 0 : _a.memoizedState;
    let index = 0;
    while (memoizedState) {
      if (memoizedState.queue && memoizedState.memoizedState !== void 0) {
        const change = {
          type: 2 /* FunctionalState */,
          name: index.toString(),
          value: memoizedState.memoizedState,
          prevValue: prevState == null ? void 0 : prevState.memoizedState
        };
        if (!isEqual(change.prevValue, change.value)) {
          changes.push(change);
        }
      }
      memoizedState = memoizedState.next;
      prevState = prevState == null ? void 0 : prevState.next;
      index++;
    }
    return changes;
  }
  if (fiber.tag === ClassComponentTag2) {
    const change = {
      type: 3 /* ClassState */,
      name: "state",
      value: fiber.memoizedState,
      prevValue: (_b = fiber.alternate) == null ? void 0 : _b.memoizedState
    };
    if (!isEqual(change.prevValue, change.value)) {
      changes.push(change);
    }
    return changes;
  }
  return changes;
};
var lastContextId = 0;
var contextIdMap = /* @__PURE__ */ new WeakMap();
var getContextId = (contextFiber) => {
  const existing = contextIdMap.get(contextFiber);
  if (existing) {
    return existing;
  }
  lastContextId++;
  contextIdMap.set(contextFiber, lastContextId);
  return lastContextId;
};
function getContextChangesTraversal(nextValue, prevValue) {
  var _a;
  if (!nextValue || !prevValue) return;
  const nextMemoizedValue = nextValue.memoizedValue;
  const change = {
    type: 4 /* Context */,
    name: (_a = nextValue.context.displayName) != null ? _a : "Context.Provider",
    value: nextMemoizedValue,
    contextType: getContextId(nextValue.context)
    // unstable: false,
  };
  this.push(change);
}
var getContextChanges = (fiber) => {
  const changes = [];
  traverseContexts(fiber, getContextChangesTraversal.bind(changes));
  return changes;
};
var instrumentationInstances = /* @__PURE__ */ new Map();
var inited = false;
var getAllInstances = () => Array.from(instrumentationInstances.values());
function isRenderUnnecessaryTraversal(_propsName, prevValue, nextValue) {
  if (!isEqual(prevValue, nextValue) && !isValueUnstable(prevValue, nextValue)) {
    this.isRequiredChange = true;
  }
}
var isRenderUnnecessary = (fiber) => {
  if (!didFiberCommit(fiber)) return true;
  const mutatedHostFibers = getMutatedHostFibers(fiber);
  for (const mutatedHostFiber of mutatedHostFibers) {
    const state = {
      isRequiredChange: false
    };
    traverseProps(mutatedHostFiber, isRenderUnnecessaryTraversal.bind(state));
    if (state.isRequiredChange) return false;
  }
  return true;
};
var TRACK_UNNECESSARY_RENDERS = false;
var RENDER_DEBOUNCE_MS = 16;
var renderDataMap = /* @__PURE__ */ new WeakMap();
function getFiberIdentifier(fiber) {
  return String(getFiberId2(fiber));
}
function getRenderData(fiber) {
  const id = getFiberIdentifier(fiber);
  const keyMap = renderDataMap.get(getType3(fiber));
  if (keyMap) {
    return keyMap.get(id);
  }
  return void 0;
}
function setRenderData(fiber, value) {
  const type = getType3(fiber.type);
  const id = getFiberIdentifier(fiber);
  let keyMap = renderDataMap.get(type);
  if (!keyMap) {
    keyMap = /* @__PURE__ */ new Map();
    renderDataMap.set(type, keyMap);
  }
  keyMap.set(id, value);
}
var trackRender = (fiber, fiberSelfTime, fiberTotalTime, hasChanges, hasDomMutations) => {
  const currentTimestamp = Date.now();
  const existingData = getRenderData(fiber);
  if ((hasChanges || hasDomMutations) && (!existingData || currentTimestamp - (existingData.lastRenderTimestamp || 0) > RENDER_DEBOUNCE_MS)) {
    const renderData = existingData || {
      selfTime: 0,
      totalTime: 0,
      renderCount: 0,
      lastRenderTimestamp: currentTimestamp
    };
    renderData.renderCount = (renderData.renderCount || 0) + 1;
    renderData.selfTime = fiberSelfTime || 0;
    renderData.totalTime = fiberTotalTime || 0;
    renderData.lastRenderTimestamp = currentTimestamp;
    setRenderData(fiber, { ...renderData });
  }
};
var createInstrumentation = (instanceKey, config) => {
  const instrumentation = {
    // this will typically be false, but in cases where a user provides showToolbar: true, this will be true
    isPaused: signal5(!ReactScanInternals.options.value.enabled),
    fiberRoots: /* @__PURE__ */ new WeakSet()
  };
  instrumentationInstances.set(instanceKey, {
    key: instanceKey,
    config,
    instrumentation
  });
  if (!inited) {
    inited = true;
    instrument({
      name: "react-scan",
      onActive: config.onActive,
      onCommitFiberRoot(_rendererID, root) {
        instrumentation.fiberRoots.add(root);
        const allInstances = getAllInstances();
        for (const instance of allInstances) {
          instance.config.onCommitStart();
        }
        traverseRenderedFibers(
          root.current,
          (fiber, phase) => {
            const type = getType3(fiber.type);
            if (!type) return null;
            const aggregateName = getDisplayName4(type);
            if (aggregateName) {
              const t = getTimings2(fiber);
              const prev = Store.legacyReportData.get(aggregateName);
              if (prev) {
                prev.count += 1;
                prev.time = (prev.time || 0) + (t.selfTime || 0);
                if (phase === "mount") prev.mounts = (prev.mounts || 0) + 1;
              } else {
                Store.legacyReportData.set(
                  aggregateName,
                  {
                    count: 1,
                    time: t.selfTime || 0,
                    renders: [],
                    displayName: aggregateName,
                    type,
                    changes: [],
                    mounts: phase === "mount" ? 1 : 0
                  }
                );
              }
            }
            const allInstances2 = getAllInstances();
            const validInstancesIndicies = [];
            for (let i = 0, len = allInstances2.length; i < len; i++) {
              const instance = allInstances2[i];
              if (!instance.config.isValidFiber(fiber)) continue;
              validInstancesIndicies.push(i);
            }
            if (!validInstancesIndicies.length) return null;
            const changes = [];
            if (allInstances2.some((instance) => instance.config.trackChanges)) {
              const changesProps = collectPropsChanges(fiber).changes;
              const changesState = collectStateChanges(fiber).changes;
              const changesContext = collectContextChanges(fiber).changes;
              changes.push.apply(
                null,
                changesProps.map(
                  (change) => ({
                    type: 1 /* Props */,
                    name: change.name,
                    value: change.value
                  })
                )
              );
              for (const change of changesState) {
                if (fiber.tag === ClassComponentTag2) {
                  changes.push({
                    type: 3 /* ClassState */,
                    name: change.name.toString(),
                    value: change.value
                  });
                } else {
                  changes.push({
                    type: 2 /* FunctionalState */,
                    name: change.name.toString(),
                    value: change.value
                  });
                }
              }
              changes.push.apply(
                null,
                changesContext.map(
                  (change) => ({
                    type: 4 /* Context */,
                    name: change.name,
                    value: change.value,
                    contextType: Number(change.contextType)
                  })
                )
              );
            }
            const { selfTime: fiberSelfTime, totalTime: fiberTotalTime } = getTimings2(fiber);
            const fps2 = getFPS();
            const render2 = {
              phase: RENDER_PHASE_STRING_TO_ENUM[phase],
              componentName: getDisplayName4(type),
              count: 1,
              changes,
              time: fiberSelfTime,
              forget: hasMemoCache2(fiber),
              // todo: allow this to be toggle-able through toolbar
              // todo: performance optimization: if the last fiber measure was very off screen, do not run isRenderUnnecessary
              unnecessary: TRACK_UNNECESSARY_RENDERS ? isRenderUnnecessary(fiber) : null,
              didCommit: didFiberCommit(fiber),
              fps: fps2
            };
            const hasChanges = changes.length > 0;
            const hasDomMutations = getMutatedHostFibers(fiber).length > 0;
            if (phase === "update") {
              trackRender(
                fiber,
                fiberSelfTime,
                fiberTotalTime,
                hasChanges,
                hasDomMutations
              );
            }
            for (let i = 0, len = validInstancesIndicies.length; i < len; i++) {
              const index = validInstancesIndicies[i];
              const instance = allInstances2[index];
              instance.config.onRender(fiber, [render2]);
            }
          }
        );
        for (const instance of allInstances) {
          instance.config.onCommitFinish();
        }
      },
      onPostCommitFiberRoot() {
        const allInstances = getAllInstances();
        for (const instance of allInstances) {
          instance.config.onPostCommitFiberRoot();
        }
      }
    });
  }
  return instrumentation;
};

// src/web/utils/log.ts
var log = (renders) => {
  var _a;
  const logMap = /* @__PURE__ */ new Map();
  for (let i = 0, len = renders.length; i < len; i++) {
    const render2 = renders[i];
    if (!render2.componentName) continue;
    const changeLog = (_a = logMap.get(render2.componentName)) != null ? _a : [];
    renders;
    const labelText = getLabelText([
      {
        aggregatedCount: 1,
        computedKey: null,
        name: render2.componentName,
        frame: null,
        ...render2,
        changes: {
          // TODO(Alexis): use a faster reduction method
          type: render2.changes.reduce((set, change) => set | change.type, 0),
          unstable: render2.changes.some((change) => change.unstable)
        },
        phase: render2.phase,
        computedCurrent: null
      }
    ]);
    if (!labelText) continue;
    let prevChangedProps = null;
    let nextChangedProps = null;
    if (render2.changes) {
      for (let i2 = 0, len2 = render2.changes.length; i2 < len2; i2++) {
        const { name, prevValue, nextValue, unstable, type } = render2.changes[i2];
        if (type === 1 /* Props */) {
          prevChangedProps != null ? prevChangedProps : prevChangedProps = {};
          nextChangedProps != null ? nextChangedProps : nextChangedProps = {};
          prevChangedProps[`${unstable ? "\u26A0\uFE0F" : ""}${name} (prev)`] = prevValue;
          nextChangedProps[`${unstable ? "\u26A0\uFE0F" : ""}${name} (next)`] = nextValue;
        } else {
          changeLog.push({
            prev: prevValue,
            next: nextValue,
            type: type === 4 /* Context */ ? "context" : "state",
            unstable: unstable != null ? unstable : false
          });
        }
      }
    }
    if (prevChangedProps && nextChangedProps) {
      changeLog.push({
        prev: prevChangedProps,
        next: nextChangedProps,
        type: "props",
        unstable: false
      });
    }
    logMap.set(labelText, changeLog);
  }
  for (const [name, changeLog] of Array.from(logMap.entries())) {
    console.group(
      `%c${name}`,
      "background: hsla(0,0%,70%,.3); border-radius:3px; padding: 0 2px;"
    );
    for (const { type, prev, next, unstable } of changeLog) {
      console.log(`${type}:`, unstable ? "\u26A0\uFE0F" : "", prev, "!==", next);
    }
    console.groupEnd();
  }
};
var logIntro = () => {
  if (window.hideIntro) {
    window.hideIntro = void 0;
    return;
  }
  console.log(
    "%c[\xB7] %cReact Scan",
    "font-weight:bold;color:#7a68e8;font-size:20px;",
    "font-weight:bold;font-size:14px;"
  );
};

// src/new-outlines/canvas.ts
var OUTLINE_ARRAY_SIZE = 7;
var MONO_FONT = "Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace";
var INTERPOLATION_SPEED = 0.2;
var SNAP_THRESHOLD = 0.5;
var lerp = (start2, end) => {
  const delta = end - start2;
  if (Math.abs(delta) < SNAP_THRESHOLD) return end;
  return start2 + delta * INTERPOLATION_SPEED;
};
var MAX_PARTS_LENGTH = 4;
var MAX_LABEL_LENGTH = 40;
var TOTAL_FRAMES = 45;
var PRIMARY_COLOR = "115,97,230";
function sortEntry(prev, next) {
  return next[0] - prev[0];
}
function getSortedEntries(countByNames) {
  const entries = [...countByNames.entries()];
  return entries.sort(sortEntry);
}
function getLabelTextPart([count, names]) {
  let part = `${names.slice(0, MAX_PARTS_LENGTH).join(", ")} \xD7${count}`;
  if (part.length > MAX_LABEL_LENGTH) {
    part = `${part.slice(0, MAX_LABEL_LENGTH)}\u2026`;
  }
  return part;
}
var getLabelText2 = (outlines) => {
  const nameByCount = /* @__PURE__ */ new Map();
  for (const { name, count } of outlines) {
    nameByCount.set(name, (nameByCount.get(name) || 0) + count);
  }
  const countByNames = /* @__PURE__ */ new Map();
  for (const [name, count] of nameByCount) {
    const names = countByNames.get(count);
    if (names) {
      names.push(name);
    } else {
      countByNames.set(count, [name]);
    }
  }
  const partsEntries = getSortedEntries(countByNames);
  let labelText = getLabelTextPart(partsEntries[0]);
  for (let i = 1, len = partsEntries.length; i < len; i++) {
    labelText += ", " + getLabelTextPart(partsEntries[i]);
  }
  if (labelText.length > MAX_LABEL_LENGTH) {
    return `${labelText.slice(0, MAX_LABEL_LENGTH)}\u2026`;
  }
  return labelText;
};
var getAreaFromOutlines = (outlines) => {
  let area = 0;
  for (const outline of outlines) {
    area += outline.width * outline.height;
  }
  return area;
};
var updateOutlines = (activeOutlines2, outlines) => {
  for (const { id, name, count, x, y, width, height, didCommit } of outlines) {
    const outline = {
      id,
      name,
      count,
      x,
      y,
      width,
      height,
      frame: 0,
      targetX: x,
      targetY: y,
      targetWidth: width,
      targetHeight: height,
      didCommit
    };
    const key = String(outline.id);
    const existingOutline = activeOutlines2.get(key);
    if (existingOutline) {
      existingOutline.count++;
      existingOutline.frame = 0;
      existingOutline.targetX = x;
      existingOutline.targetY = y;
      existingOutline.targetWidth = width;
      existingOutline.targetHeight = height;
      existingOutline.didCommit = didCommit;
    } else {
      activeOutlines2.set(key, outline);
    }
  }
};
var updateScroll = (activeOutlines2, deltaX, deltaY) => {
  for (const outline of activeOutlines2.values()) {
    const newX = outline.x - deltaX;
    const newY = outline.y - deltaY;
    outline.targetX = newX;
    outline.targetY = newY;
  }
};
var initCanvas = (canvas2, dpr2) => {
  const ctx2 = canvas2.getContext("2d", { alpha: true });
  if (ctx2) {
    ctx2.scale(dpr2, dpr2);
  }
  return ctx2;
};
var drawCanvas = (ctx2, canvas2, dpr2, activeOutlines2) => {
  ctx2.clearRect(0, 0, canvas2.width / dpr2, canvas2.height / dpr2);
  const groupedOutlinesMap = /* @__PURE__ */ new Map();
  const rectMap = /* @__PURE__ */ new Map();
  for (const outline of activeOutlines2.values()) {
    const {
      x,
      y,
      width,
      height,
      targetX,
      targetY,
      targetWidth,
      targetHeight,
      frame
    } = outline;
    if (targetX !== x) {
      outline.x = lerp(x, targetX);
    }
    if (targetY !== y) {
      outline.y = lerp(y, targetY);
    }
    if (targetWidth !== width) {
      outline.width = lerp(width, targetWidth);
    }
    if (targetHeight !== height) {
      outline.height = lerp(height, targetHeight);
    }
    const labelKey = `${targetX != null ? targetX : x},${targetY != null ? targetY : y}`;
    const rectKey = `${labelKey},${targetWidth != null ? targetWidth : width},${targetHeight != null ? targetHeight : height}`;
    const outlines = groupedOutlinesMap.get(labelKey);
    if (outlines) {
      outlines.push(outline);
    } else {
      groupedOutlinesMap.set(labelKey, [outline]);
    }
    const alpha = 1 - frame / TOTAL_FRAMES;
    outline.frame++;
    const rect = rectMap.get(rectKey) || {
      x,
      y,
      width,
      height,
      alpha
    };
    if (alpha > rect.alpha) {
      rect.alpha = alpha;
    }
    rectMap.set(rectKey, rect);
  }
  for (const { x, y, width, height, alpha } of rectMap.values()) {
    ctx2.strokeStyle = `rgba(${PRIMARY_COLOR},${alpha})`;
    ctx2.lineWidth = 1;
    const rx = Math.round(x) + 0.5;
    const ry = Math.round(y) + 0.5;
    const rw = Math.round(width);
    const rh = Math.round(height);
    ctx2.beginPath();
    ctx2.rect(rx, ry, rw, rh);
    ctx2.stroke();
    ctx2.fillStyle = `rgba(${PRIMARY_COLOR},${alpha * 0.1})`;
    ctx2.fill();
  }
  ctx2.font = `11px ${MONO_FONT}`;
  const labelMap = /* @__PURE__ */ new Map();
  ctx2.textRendering = "optimizeSpeed";
  for (const outlines of groupedOutlinesMap.values()) {
    const first = outlines[0];
    const { x, y, frame } = first;
    const alpha = 1 - frame / TOTAL_FRAMES;
    const text = getLabelText2(outlines);
    const { width } = ctx2.measureText(text);
    const height = 11;
    labelMap.set(`${x},${y},${width},${text}`, {
      text,
      width,
      height,
      alpha,
      x,
      y,
      outlines
    });
    let labelY = y - height - 4;
    if (labelY < 0) {
      labelY = 0;
    }
    if (frame > TOTAL_FRAMES) {
      for (const outline of outlines) {
        activeOutlines2.delete(String(outline.id));
      }
    }
  }
  const sortedLabels = Array.from(labelMap.entries()).sort(
    ([_, a], [__, b]) => {
      return getAreaFromOutlines(b.outlines) - getAreaFromOutlines(a.outlines);
    }
  );
  for (const [labelKey, label] of sortedLabels) {
    if (!labelMap.has(labelKey)) continue;
    for (const [otherKey, otherLabel] of labelMap.entries()) {
      if (labelKey === otherKey) continue;
      const { x, y, width, height } = label;
      const {
        x: otherX,
        y: otherY,
        width: otherWidth,
        height: otherHeight
      } = otherLabel;
      if (x + width > otherX && otherX + otherWidth > x && y + height > otherY && otherY + otherHeight > y) {
        label.text = getLabelText2(label.outlines.concat(otherLabel.outlines));
        label.width = ctx2.measureText(label.text).width;
        labelMap.delete(otherKey);
      }
    }
  }
  for (const label of labelMap.values()) {
    const { x, y, alpha, width, height, text } = label;
    let labelY = y - height - 4;
    if (labelY < 0) {
      labelY = 0;
    }
    ctx2.fillStyle = `rgba(${PRIMARY_COLOR},${alpha})`;
    ctx2.fillRect(x, labelY, width + 4, height + 4);
    ctx2.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx2.fillText(text, x + 2, labelY + height);
  }
  return activeOutlines2.size > 0;
};

// src/new-outlines/index.ts
var workerCode = "\"use strict\";(()=>{var D=\"Menlo,Consolas,Monaco,Liberation Mono,Lucida Console,monospace\";var T=(t,n)=>{let r=n-t;return Math.abs(r)<.5?n:t+r*.2};var x=\"115,97,230\";function P(t,n){return n[0]-t[0]}function F(t){return[...t.entries()].sort(P)}function v([t,n]){let r=`${n.slice(0,4).join(\", \")} \\xD7${t}`;return r.length>40&&(r=`${r.slice(0,40)}\\u2026`),r}var $=t=>{let n=new Map;for(let{name:e,count:u}of t)n.set(e,(n.get(e)||0)+u);let r=new Map;for(let[e,u]of n){let A=r.get(u);A?A.push(e):r.set(u,[e])}let d=F(r),a=v(d[0]);for(let e=1,u=d.length;e<u;e++)a+=\", \"+v(d[e]);return a.length>40?`${a.slice(0,40)}\\u2026`:a},H=t=>{let n=0;for(let r of t)n+=r.width*r.height;return n};var N=(t,n)=>{let r=t.getContext(\"2d\",{alpha:!0});return r&&r.scale(n,n),r},X=(t,n,r,d)=>{t.clearRect(0,0,n.width/r,n.height/r);let a=new Map,e=new Map;for(let i of d.values()){let{x:o,y:c,width:l,height:g,targetX:s,targetY:f,targetWidth:h,targetHeight:m,frame:O}=i;s!==o&&(i.x=T(o,s)),f!==c&&(i.y=T(c,f)),h!==l&&(i.width=T(l,h)),m!==g&&(i.height=T(g,m));let M=`${s??o},${f??c}`,L=`${M},${h??l},${m??g}`,S=a.get(M);S?S.push(i):a.set(M,[i]);let C=1-O/45;i.frame++;let _=e.get(L)||{x:o,y:c,width:l,height:g,alpha:C};C>_.alpha&&(_.alpha=C),e.set(L,_)}for(let{x:i,y:o,width:c,height:l,alpha:g}of e.values()){t.strokeStyle=`rgba(${x},${g})`,t.lineWidth=1;let s=Math.round(i)+.5,f=Math.round(o)+.5,h=Math.round(c),m=Math.round(l);t.beginPath(),t.rect(s,f,h,m),t.stroke(),t.fillStyle=`rgba(${x},${g*.1})`,t.fill()}t.font=`11px ${D}`;let u=new Map;t.textRendering=\"optimizeSpeed\";for(let i of a.values()){let o=i[0],{x:c,y:l,frame:g}=o,s=1-g/45,f=$(i),{width:h}=t.measureText(f),m=11;u.set(`${c},${l},${h},${f}`,{text:f,width:h,height:m,alpha:s,x:c,y:l,outlines:i});let O=l-m-4;if(O<0&&(O=0),g>45)for(let M of i)d.delete(String(M.id))}let A=Array.from(u.entries()).sort(([i,o],[c,l])=>H(l.outlines)-H(o.outlines));for(let[i,o]of A)if(u.has(i))for(let[c,l]of u.entries()){if(i===c)continue;let{x:g,y:s,width:f,height:h}=o,{x:m,y:O,width:M,height:L}=l;g+f>m&&m+M>g&&s+h>O&&O+L>s&&(o.text=$(o.outlines.concat(l.outlines)),o.width=t.measureText(o.text).width,u.delete(c))}for(let i of u.values()){let{x:o,y:c,alpha:l,width:g,height:s,text:f}=i,h=c-s-4;h<0&&(h=0),t.fillStyle=`rgba(${x},${l})`,t.fillRect(o,h,g+4,s+4),t.fillStyle=`rgba(255,255,255,${l})`,t.fillText(f,o+2,h+s)}return d.size>0};var p=null,w=null,b=1,y=new Map,E=null,R=()=>{if(!w||!p)return;X(w,p,b,y)?E=requestAnimationFrame(R):E=null};self.onmessage=t=>{let{type:n}=t.data;if(n===\"init\"&&(p=t.data.canvas,b=t.data.dpr,p&&(p.width=t.data.width,p.height=t.data.height,w=N(p,b))),!(!p||!w)){if(n===\"resize\"){b=t.data.dpr,p.width=t.data.width*b,p.height=t.data.height*b,w.resetTransform(),w.scale(b,b),R();return}if(n===\"draw-outlines\"){let{data:r,names:d}=t.data,a=new Float32Array(r);for(let e=0;e<a.length;e+=7){let u=a[e+2],A=a[e+3],i=a[e+4],o=a[e+5],c=a[e+6],l={id:a[e],name:d[e/7],count:a[e+1],x:u,y:A,width:i,height:o,frame:0,targetX:u,targetY:A,targetWidth:i,targetHeight:o,didCommit:c},g=String(l.id),s=y.get(g);s?(s.count++,s.frame=0,s.targetX=u,s.targetY=A,s.targetWidth=i,s.targetHeight=o,s.didCommit=c):y.set(g,l)}E||(E=requestAnimationFrame(R));return}if(n===\"scroll\"){let{deltaX:r,deltaY:d}=t.data;for(let a of y.values()){let e=a.x-r,u=a.y-d;a.targetX=e,a.targetY=u}}}};})();\n";
var worker = null;
var canvas = null;
var ctx = null;
var dpr = 1;
var animationFrameId = null;
var activeOutlines = /* @__PURE__ */ new Map();
var blueprintMap = /* @__PURE__ */ new Map();
var blueprintMapKeys = /* @__PURE__ */ new Set();
var outlineFiber = (fiber) => {
  if (!isCompositeFiber2(fiber)) return;
  const name = typeof fiber.type === "string" ? fiber.type : getDisplayName5(fiber);
  if (!name) return;
  const blueprint = blueprintMap.get(fiber);
  const nearestFibers = getNearestHostFibers(fiber);
  const didCommit = didFiberCommit2(fiber);
  if (!blueprint) {
    blueprintMap.set(fiber, {
      name,
      count: 1,
      elements: nearestFibers.map((fiber2) => fiber2.stateNode),
      didCommit: didCommit ? 1 : 0
    });
    blueprintMapKeys.add(fiber);
  } else {
    blueprint.count++;
  }
};
var mergeRects = (rects) => {
  const firstRect = rects[0];
  if (rects.length === 1) return firstRect;
  let minX;
  let minY;
  let maxX;
  let maxY;
  for (let i = 0, len = rects.length; i < len; i++) {
    const rect = rects[i];
    minX = minX == null ? rect.x : Math.min(minX, rect.x);
    minY = minY == null ? rect.y : Math.min(minY, rect.y);
    maxX = maxX == null ? rect.x + rect.width : Math.max(maxX, rect.x + rect.width);
    maxY = maxY == null ? rect.y + rect.height : Math.max(maxY, rect.y + rect.height);
  }
  if (minX == null || minY == null || maxX == null || maxY == null) {
    return rects[0];
  }
  return new DOMRect(minX, minY, maxX - minX, maxY - minY);
};
function onIntersect(entries, observer) {
  const newEntries = [];
  for (const entry of entries) {
    const element = entry.target;
    if (!this.seenElements.has(element)) {
      this.seenElements.add(element);
      newEntries.push(entry);
    }
  }
  if (newEntries.length > 0 && this.resolveNext) {
    this.resolveNext(newEntries);
    this.resolveNext = null;
  }
  if (this.seenElements.size === this.uniqueElements.size) {
    observer.disconnect();
    this.done = true;
    if (this.resolveNext) {
      this.resolveNext([]);
    }
  }
}
var getBatchedRectMap = async function* (elements) {
  const state = {
    uniqueElements: new Set(elements),
    seenElements: /* @__PURE__ */ new Set(),
    resolveNext: null,
    done: false
  };
  const observer = new IntersectionObserver(onIntersect.bind(state));
  for (const element of state.uniqueElements) {
    observer.observe(element);
  }
  while (!state.done) {
    const entries = await new Promise(
      (resolve) => {
        state.resolveNext = resolve;
      }
    );
    if (entries.length > 0) {
      yield entries;
    }
  }
};
var SupportedArrayBuffer = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : ArrayBuffer;
var flushOutlines = async () => {
  const elements = [];
  for (const fiber of blueprintMapKeys) {
    const blueprint = blueprintMap.get(fiber);
    if (!blueprint) continue;
    for (let i = 0; i < blueprint.elements.length; i++) {
      if (!(blueprint.elements[i] instanceof Element)) {
        continue;
      }
      elements.push(blueprint.elements[i]);
    }
  }
  const rectsMap = /* @__PURE__ */ new Map();
  for await (const entries of getBatchedRectMap(elements)) {
    for (const entry of entries) {
      const element = entry.target;
      const rect = entry.intersectionRect;
      if (entry.isIntersecting && rect.width && rect.height) {
        rectsMap.set(element, rect);
      }
    }
    const blueprints = [];
    const blueprintRects = [];
    const blueprintIds = [];
    for (const fiber of blueprintMapKeys) {
      const blueprint = blueprintMap.get(fiber);
      if (!blueprint) continue;
      const rects = [];
      for (let i = 0; i < blueprint.elements.length; i++) {
        const element = blueprint.elements[i];
        const rect = rectsMap.get(element);
        if (!rect) continue;
        rects.push(rect);
      }
      if (!rects.length) continue;
      blueprints.push(blueprint);
      blueprintRects.push(mergeRects(rects));
      blueprintIds.push(getFiberId3(fiber));
    }
    if (blueprints.length > 0) {
      const arrayBuffer = new SupportedArrayBuffer(
        blueprints.length * OUTLINE_ARRAY_SIZE * 4
      );
      const sharedView = new Float32Array(arrayBuffer);
      const blueprintNames = new Array(blueprints.length);
      let outlineData;
      for (let i = 0, len = blueprints.length; i < len; i++) {
        const blueprint = blueprints[i];
        const id = blueprintIds[i];
        const { x, y, width, height } = blueprintRects[i];
        const { count, name, didCommit } = blueprint;
        if (worker) {
          const scaledIndex = i * OUTLINE_ARRAY_SIZE;
          sharedView[scaledIndex] = id;
          sharedView[scaledIndex + 1] = count;
          sharedView[scaledIndex + 2] = x;
          sharedView[scaledIndex + 3] = y;
          sharedView[scaledIndex + 4] = width;
          sharedView[scaledIndex + 5] = height;
          sharedView[scaledIndex + 6] = didCommit;
          blueprintNames[i] = name;
        } else {
          outlineData || (outlineData = new Array(blueprints.length));
          outlineData[i] = {
            id,
            name,
            count,
            x,
            y,
            width,
            height,
            didCommit
          };
        }
      }
      if (worker) {
        worker.postMessage({
          type: "draw-outlines",
          data: arrayBuffer,
          names: blueprintNames
        });
      } else if (canvas && ctx && outlineData) {
        updateOutlines(activeOutlines, outlineData);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(draw);
        }
      }
    }
  }
  for (const fiber of blueprintMapKeys) {
    blueprintMap.delete(fiber);
    blueprintMapKeys.delete(fiber);
  }
};
var draw = () => {
  if (!ctx || !canvas) return;
  const shouldContinue = drawCanvas(ctx, canvas, dpr, activeOutlines);
  if (shouldContinue) {
    animationFrameId = requestAnimationFrame(draw);
  } else {
    animationFrameId = null;
  }
};
var IS_OFFSCREEN_CANVAS_WORKER_SUPPORTED = typeof OffscreenCanvas !== "undefined" && typeof Worker !== "undefined";
var getDpr = () => {
  return Math.min(window.devicePixelRatio || 1, 2);
};
var getCanvasEl = () => {
  cleanup();
  const host = document.createElement("div");
  host.setAttribute("data-react-scan", "true");
  const shadowRoot2 = host.attachShadow({ mode: "open" });
  const canvasEl = document.createElement("canvas");
  canvasEl.style.position = "fixed";
  canvasEl.style.top = "0";
  canvasEl.style.left = "0";
  canvasEl.style.pointerEvents = "none";
  canvasEl.style.zIndex = "2147483646";
  canvasEl.setAttribute("aria-hidden", "true");
  shadowRoot2.appendChild(canvasEl);
  if (!canvasEl) return null;
  dpr = getDpr();
  canvas = canvasEl;
  const { innerWidth, innerHeight } = window;
  canvasEl.style.width = `${innerWidth}px`;
  canvasEl.style.height = `${innerHeight}px`;
  const width = innerWidth * dpr;
  const height = innerHeight * dpr;
  canvasEl.width = width;
  canvasEl.height = height;
  const workerOptOut = ReactScanInternals.options.value.useOffscreenCanvasWorker === false;
  if (IS_OFFSCREEN_CANVAS_WORKER_SUPPORTED && !window.__REACT_SCAN_EXTENSION__ && !workerOptOut) {
    try {
      const blobUrl = URL.createObjectURL(
        new Blob([workerCode], { type: "application/javascript" })
      );
      worker = new Worker(blobUrl);
      const offscreenCanvas = canvasEl.transferControlToOffscreen();
      worker.postMessage(
        {
          type: "init",
          canvas: offscreenCanvas,
          width: canvasEl.width,
          height: canvasEl.height,
          dpr
        },
        [offscreenCanvas]
      );
    } catch (error) {
      worker = null;
      if (ReactScanInternals.options.value._debug === "verbose") {
        console.warn("Failed to initialize OffscreenCanvas worker:", error);
      }
    }
  }
  if (!worker) {
    ctx = initCanvas(canvasEl, dpr);
  }
  let isResizeScheduled = false;
  window.addEventListener("resize", () => {
    if (!isResizeScheduled) {
      isResizeScheduled = true;
      setTimeout(() => {
        const width2 = window.innerWidth;
        const height2 = window.innerHeight;
        dpr = getDpr();
        canvasEl.style.width = `${width2}px`;
        canvasEl.style.height = `${height2}px`;
        if (worker) {
          worker.postMessage({
            type: "resize",
            width: width2,
            height: height2,
            dpr
          });
        } else {
          canvasEl.width = width2 * dpr;
          canvasEl.height = height2 * dpr;
          if (ctx) {
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
          }
          draw();
        }
        isResizeScheduled = false;
      });
    }
  });
  let prevScrollX = window.scrollX;
  let prevScrollY = window.scrollY;
  let isScrollScheduled = false;
  window.addEventListener("scroll", () => {
    if (!isScrollScheduled) {
      isScrollScheduled = true;
      setTimeout(() => {
        const { scrollX, scrollY } = window;
        const deltaX = scrollX - prevScrollX;
        const deltaY = scrollY - prevScrollY;
        prevScrollX = scrollX;
        prevScrollY = scrollY;
        if (worker) {
          worker.postMessage({
            type: "scroll",
            deltaX,
            deltaY
          });
        } else {
          requestAnimationFrame(
            updateScroll.bind(null, activeOutlines, deltaX, deltaY)
          );
        }
        isScrollScheduled = false;
      }, 16 * 2);
    }
  });
  setInterval(() => {
    if (blueprintMapKeys.size) {
      requestAnimationFrame(flushOutlines);
    }
  }, 16 * 2);
  shadowRoot2.appendChild(canvasEl);
  return host;
};
var hasStopped = () => {
  return globalThis.__REACT_SCAN_STOP__;
};
var cleanup = () => {
  const host = document.querySelector("[data-react-scan]");
  if (host) {
    host.remove();
  }
};
var reportRenderToListeners = (fiber) => {
  var _a, _b;
  if (isCompositeFiber2(fiber)) {
    if (ReactScanInternals.options.value.showToolbar !== false && Store.inspectState.value.kind === "focused") {
      const reportFiber = fiber;
      const { selfTime } = getTimings3(fiber);
      const displayName = getDisplayName5(fiber.type);
      const fiberId = getFiberId3(reportFiber);
      const currentData = Store.reportData.get(fiberId);
      const existingCount = (_a = currentData == null ? void 0 : currentData.count) != null ? _a : 0;
      const existingTime = (_b = currentData == null ? void 0 : currentData.time) != null ? _b : 0;
      const changes = [];
      const listeners = Store.changesListeners.get(getFiberId3(fiber));
      if (listeners == null ? void 0 : listeners.length) {
        const propsChanges = getChangedPropsDetailed(
          fiber
        ).map((change) => ({
          type: 1 /* Props */,
          name: change.name,
          value: change.value,
          prevValue: change.prevValue,
          unstable: false
        }));
        const stateChanges = getStateChanges(fiber);
        const fiberContext = getContextChanges(fiber);
        const contextChanges = fiberContext.map(
          (info) => ({
            name: info.name,
            type: 4 /* Context */,
            value: info.value,
            contextType: info.contextType
          })
        );
        listeners.forEach((listener) => {
          listener({
            propsChanges,
            stateChanges,
            contextChanges
          });
        });
      }
      const fiberData = {
        count: existingCount + 1,
        time: existingTime + selfTime || 0,
        renders: [],
        displayName,
        type: getType4(fiber.type) || null,
        changes
      };
      Store.reportData.set(fiberId, fiberData);
      needsReport = true;
    }
  }
};
var needsReport = false;
var reportInterval;
var startReportInterval = () => {
  clearInterval(reportInterval);
  reportInterval = setInterval(() => {
    if (needsReport) {
      Store.lastReportTime.value = Date.now();
      needsReport = false;
    }
  }, 50);
};
var isValidFiber = (fiber) => {
  if (ignoredProps.has(fiber.memoizedProps)) {
    return false;
  }
  return true;
};
var isInstrumentationInitialized = false;
var initReactScanInstrumentation = (setupToolbar) => {
  if (hasStopped()) return;
  if (isInstrumentationInitialized) return;
  isInstrumentationInitialized = true;
  let schedule;
  let mounted = false;
  const scheduleSetup = () => {
    if (mounted) {
      return;
    }
    if (schedule) {
      cancelAnimationFrame(schedule);
    }
    schedule = requestAnimationFrame(() => {
      mounted = true;
      const host = getCanvasEl();
      if (host) {
        document.documentElement.appendChild(host);
      }
      setupToolbar();
    });
  };
  const instrumentation = createInstrumentation("react-scan-devtools-0.1.0", {
    onCommitStart: () => {
      var _a, _b;
      (_b = (_a = ReactScanInternals.options.value).onCommitStart) == null ? void 0 : _b.call(_a);
    },
    onActive: /* @__PURE__ */ (() => {
      let didActivate = false;
      return () => {
        if (hasStopped()) return;
        if (didActivate) return;
        didActivate = true;
        scheduleSetup();
        if (!window.__REACT_SCAN_EXTENSION__) {
          globalThis.__REACT_SCAN__ = {
            ReactScanInternals
          };
        }
        startReportInterval();
        logIntro();
      };
    })(),
    onError: () => {
    },
    isValidFiber,
    onRender: (fiber, renders) => {
      var _a, _b, _c, _d, _e;
      if (isCompositeFiber2(fiber)) {
        (_b = (_a = Store).interactionListeningForRenders) == null ? void 0 : _b.call(_a, fiber, renders);
      }
      const isOverlayPaused = (_c = ReactScanInternals.instrumentation) == null ? void 0 : _c.isPaused.value;
      const isInspectorInactive = Store.inspectState.value.kind === "inspect-off" || Store.inspectState.value.kind === "uninitialized";
      const shouldFullyAbort = isOverlayPaused && isInspectorInactive;
      if (shouldFullyAbort) {
        return;
      }
      if (!isOverlayPaused) {
        outlineFiber(fiber);
      }
      if (ReactScanInternals.options.value.log) {
        log(renders);
      }
      if (Store.inspectState.value.kind === "focused") {
        inspectorUpdateSignal.value = Date.now();
      }
      if (!isInspectorInactive) {
        reportRenderToListeners(fiber);
      }
      (_e = (_d = ReactScanInternals.options.value).onRender) == null ? void 0 : _e.call(_d, fiber, renders);
    },
    onCommitFinish: () => {
      var _a, _b;
      scheduleSetup();
      (_b = (_a = ReactScanInternals.options.value).onCommitFinish) == null ? void 0 : _b.call(_a);
    },
    onPostCommitFiberRoot() {
      scheduleSetup();
    },
    trackChanges: false
  });
  ReactScanInternals.instrumentation = instrumentation;
};

// src/web/assets/css/styles.css
var styles_default = `/*! tailwindcss v4.2.4 | MIT License | https://tailwindcss.com */
@layer properties;
@layer theme, base, components, utilities;
@layer theme {
  :root, :host {
    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --color-red-300: oklch(80.8% 0.114 19.571);
    --color-red-400: oklch(70.4% 0.191 22.216);
    --color-red-500: oklch(63.7% 0.237 25.331);
    --color-red-600: oklch(57.7% 0.245 27.325);
    --color-red-950: oklch(25.8% 0.092 26.042);
    --color-yellow-300: oklch(90.5% 0.182 98.111);
    --color-yellow-500: oklch(79.5% 0.184 86.047);
    --color-green-500: oklch(72.3% 0.219 149.579);
    --color-purple-400: oklch(71.4% 0.203 305.504);
    --color-purple-500: oklch(62.7% 0.265 303.9);
    --color-purple-800: oklch(43.8% 0.218 303.724);
    --color-gray-100: oklch(96.7% 0.003 264.542);
    --color-gray-300: oklch(87.2% 0.01 258.338);
    --color-gray-400: oklch(70.7% 0.022 261.325);
    --color-gray-500: oklch(55.1% 0.027 264.364);
    --color-zinc-200: oklch(92% 0.004 286.32);
    --color-zinc-400: oklch(70.5% 0.015 286.067);
    --color-zinc-500: oklch(55.2% 0.016 285.938);
    --color-zinc-600: oklch(44.2% 0.017 285.786);
    --color-zinc-700: oklch(37% 0.013 285.805);
    --color-zinc-800: oklch(27.4% 0.006 286.033);
    --color-zinc-900: oklch(21% 0.006 285.885);
    --color-neutral-300: oklch(87% 0 0);
    --color-neutral-400: oklch(70.8% 0 0);
    --color-neutral-500: oklch(55.6% 0 0);
    --color-neutral-700: oklch(37.1% 0 0);
    --color-black: #000;
    --color-white: #fff;
    --spacing: 4px;
    --container-md: 448px;
    --text-xs: 12px;
    --text-xs--line-height: calc(1 / 0.75);
    --text-sm: 14px;
    --text-sm--line-height: calc(1.25 / 0.875);
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --tracking-wide: 0.025em;
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --blur-sm: 8px;
    --default-transition-duration: 150ms;
    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    --default-font-family: var(--font-sans);
  }
}
@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
  }
  html, :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
      -o-tab-size: 4;
         tab-size: 4;
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var(--default-font-variation-settings, normal);
    -webkit-tap-highlight-color: transparent;
  }
  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }
  abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  a {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }
  b, strong {
    font-weight: bolder;
  }
  code, kbd, samp, pre {
    font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;
    font-feature-settings: normal;
    font-variation-settings: normal;
    font-size: 1em;
  }
  small {
    font-size: 80%;
  }
  sub, sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  sub {
    bottom: -0.25em;
  }
  sup {
    top: -0.5em;
  }
  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }
  :-moz-focusring {
    outline: auto;
  }
  progress {
    vertical-align: baseline;
  }
  summary {
    display: list-item;
  }
  ol, ul, menu {
    list-style: none;
  }
  img, svg, video, canvas, audio, iframe, embed, object {
    display: block;
    vertical-align: middle;
  }
  img, video {
    max-width: 100%;
    height: auto;
  }
  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }
  :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }
  ::file-selector-button {
    margin-inline-end: 4px;
  }
  ::-moz-placeholder {
    opacity: 1;
  }
  ::placeholder {
    opacity: 1;
  }
  @supports (not (-webkit-appearance: -apple-pay-button))  or (contain-intrinsic-size: 1px) {
    ::-moz-placeholder {
      color: currentcolor;
      @supports (color: color-mix(in lab, red, red)) {
        color: color-mix(in oklab, currentcolor 50%, transparent);
      }
    }
    ::placeholder {
      color: currentcolor;
      @supports (color: color-mix(in lab, red, red)) {
        color: color-mix(in oklab, currentcolor 50%, transparent);
      }
    }
  }
  textarea {
    resize: vertical;
  }
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }
  ::-webkit-datetime-edit {
    display: inline-flex;
  }
  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }
  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }
  ::-webkit-calendar-picker-indicator {
    line-height: 1;
  }
  :-moz-ui-invalid {
    box-shadow: none;
  }
  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {
    -webkit-appearance: button;
       -moz-appearance: button;
            appearance: button;
  }
  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
    height: auto;
  }
  [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }
}
@layer utilities {
  .pointer-events-auto {
    pointer-events: auto;
  }
  .pointer-events-bounding-box {
    pointer-events: bounding-box;
  }
  .pointer-events-none {
    pointer-events: none;
  }
  .collapse {
    visibility: collapse;
  }
  .visible {
    visibility: visible;
  }
  .absolute {
    position: absolute;
  }
  .fixed {
    position: fixed;
  }
  .relative {
    position: relative;
  }
  .static {
    position: static;
  }
  .inset-0 {
    inset: calc(var(--spacing) * 0);
  }
  .inset-x-1 {
    inset-inline: calc(var(--spacing) * 1);
  }
  .inset-y-0 {
    inset-block: calc(var(--spacing) * 0);
  }
  .start {
    inset-inline-start: var(--spacing);
  }
  .end {
    inset-inline-end: var(--spacing);
  }
  .-top-1 {
    top: calc(var(--spacing) * -1);
  }
  .-top-2\\.5 {
    top: calc(var(--spacing) * -2.5);
  }
  .top-0 {
    top: calc(var(--spacing) * 0);
  }
  .top-0\\.5 {
    top: calc(var(--spacing) * 0.5);
  }
  .top-1\\/2 {
    top: calc(1 / 2 * 100%);
  }
  .top-2 {
    top: calc(var(--spacing) * 2);
  }
  .-right-1 {
    right: calc(var(--spacing) * -1);
  }
  .-right-2\\.5 {
    right: calc(var(--spacing) * -2.5);
  }
  .right-0 {
    right: calc(var(--spacing) * 0);
  }
  .right-0\\.5 {
    right: calc(var(--spacing) * 0.5);
  }
  .right-2 {
    right: calc(var(--spacing) * 2);
  }
  .right-4 {
    right: calc(var(--spacing) * 4);
  }
  .bottom-0 {
    bottom: calc(var(--spacing) * 0);
  }
  .bottom-4 {
    bottom: calc(var(--spacing) * 4);
  }
  .left-0 {
    left: calc(var(--spacing) * 0);
  }
  .left-3 {
    left: calc(var(--spacing) * 3);
  }
  .z-10 {
    z-index: 10;
  }
  .z-50 {
    z-index: 50;
  }
  .z-100 {
    z-index: 100;
  }
  .z-\\[214748365\\] {
    z-index: 214748365;
  }
  .z-\\[214748367\\] {
    z-index: 214748367;
  }
  .z-\\[124124124124\\] {
    z-index: 124124124124;
  }
  .container {
    width: 100%;
    @media (width >= 640px) {
      max-width: 640px;
    }
    @media (width >= 768px) {
      max-width: 768px;
    }
    @media (width >= 1024px) {
      max-width: 1024px;
    }
    @media (width >= 1280px) {
      max-width: 1280px;
    }
    @media (width >= 1536px) {
      max-width: 1536px;
    }
  }
  .m-\\[2px\\] {
    margin: 2px;
  }
  .mx-0\\.5 {
    margin-inline: calc(var(--spacing) * 0.5);
  }
  .mt-0\\.5 {
    margin-top: calc(var(--spacing) * 0.5);
  }
  .mt-1 {
    margin-top: calc(var(--spacing) * 1);
  }
  .mt-4 {
    margin-top: calc(var(--spacing) * 4);
  }
  .mr-0\\.5 {
    margin-right: calc(var(--spacing) * 0.5);
  }
  .mr-1 {
    margin-right: calc(var(--spacing) * 1);
  }
  .mr-1\\.5 {
    margin-right: calc(var(--spacing) * 1.5);
  }
  .mr-16 {
    margin-right: calc(var(--spacing) * 16);
  }
  .mr-auto {
    margin-right: auto;
  }
  .mb-1\\.5 {
    margin-bottom: calc(var(--spacing) * 1.5);
  }
  .mb-2 {
    margin-bottom: calc(var(--spacing) * 2);
  }
  .mb-3 {
    margin-bottom: calc(var(--spacing) * 3);
  }
  .mb-4 {
    margin-bottom: calc(var(--spacing) * 4);
  }
  .mb-px {
    margin-bottom: 1px;
  }
  .\\!ml-0 {
    margin-left: calc(var(--spacing) * 0) !important;
  }
  .ml-1 {
    margin-left: calc(var(--spacing) * 1);
  }
  .ml-1\\.5 {
    margin-left: calc(var(--spacing) * 1.5);
  }
  .ml-auto {
    margin-left: auto;
  }
  .block {
    display: block;
  }
  .contents {
    display: contents;
  }
  .flex {
    display: flex;
  }
  .hidden {
    display: none;
  }
  .inline {
    display: inline;
  }
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  .h-1 {
    height: calc(var(--spacing) * 1);
  }
  .h-4 {
    height: calc(var(--spacing) * 4);
  }
  .h-4\\/5 {
    height: calc(4 / 5 * 100%);
  }
  .h-6 {
    height: calc(var(--spacing) * 6);
  }
  .h-7 {
    height: calc(var(--spacing) * 7);
  }
  .h-8 {
    height: calc(var(--spacing) * 8);
  }
  .h-10 {
    height: calc(var(--spacing) * 10);
  }
  .h-12 {
    height: calc(var(--spacing) * 12);
  }
  .h-\\[28px\\] {
    height: 28px;
  }
  .h-\\[48px\\] {
    height: 48px;
  }
  .h-\\[50px\\] {
    height: 50px;
  }
  .h-\\[150px\\] {
    height: 150px;
  }
  .h-\\[235px\\] {
    height: 235px;
  }
  .h-\\[calc\\(100\\%-25px\\)\\] {
    height: calc(100% - 25px);
  }
  .h-\\[calc\\(100\\%-40px\\)\\] {
    height: calc(100% - 40px);
  }
  .h-\\[calc\\(100\\%-48px\\)\\] {
    height: calc(100% - 48px);
  }
  .h-\\[calc\\(100\\%-150px\\)\\] {
    height: calc(100% - 150px);
  }
  .h-\\[calc\\(100\\%-200px\\)\\] {
    height: calc(100% - 200px);
  }
  .h-fit {
    height: -moz-fit-content;
    height: fit-content;
  }
  .h-full {
    height: 100%;
  }
  .h-screen {
    height: 100vh;
  }
  .max-h-0 {
    max-height: calc(var(--spacing) * 0);
  }
  .max-h-9 {
    max-height: calc(var(--spacing) * 9);
  }
  .max-h-40 {
    max-height: calc(var(--spacing) * 40);
  }
  .min-h-9 {
    min-height: calc(var(--spacing) * 9);
  }
  .min-h-\\[48px\\] {
    min-height: 48px;
  }
  .min-h-fit {
    min-height: -moz-fit-content;
    min-height: fit-content;
  }
  .w-1 {
    width: calc(var(--spacing) * 1);
  }
  .w-1\\/2 {
    width: calc(1 / 2 * 100%);
  }
  .w-1\\/3 {
    width: calc(1 / 3 * 100%);
  }
  .w-2\\/4 {
    width: calc(2 / 4 * 100%);
  }
  .w-3 {
    width: calc(var(--spacing) * 3);
  }
  .w-4 {
    width: calc(var(--spacing) * 4);
  }
  .w-4\\/5 {
    width: calc(4 / 5 * 100%);
  }
  .w-6 {
    width: calc(var(--spacing) * 6);
  }
  .w-80 {
    width: calc(var(--spacing) * 80);
  }
  .w-\\[20px\\] {
    width: 20px;
  }
  .w-\\[72px\\] {
    width: 72px;
  }
  .w-\\[90\\%\\] {
    width: 90%;
  }
  .w-\\[calc\\(100\\%-200px\\)\\] {
    width: calc(100% - 200px);
  }
  .w-fit {
    width: -moz-fit-content;
    width: fit-content;
  }
  .w-full {
    width: 100%;
  }
  .w-px {
    width: 1px;
  }
  .w-screen {
    width: 100vw;
  }
  .max-w-md {
    max-width: var(--container-md);
  }
  .min-w-0 {
    min-width: calc(var(--spacing) * 0);
  }
  .min-w-\\[200px\\] {
    min-width: 200px;
  }
  .min-w-fit {
    min-width: -moz-fit-content;
    min-width: fit-content;
  }
  .flex-1 {
    flex: 1;
  }
  .shrink-0 {
    flex-shrink: 0;
  }
  .grow {
    flex-grow: 1;
  }
  .-translate-y-1\\/2 {
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .-translate-y-\\[200\\%\\] {
    --tw-translate-y: calc(200% * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .translate-y-0 {
    --tw-translate-y: calc(var(--spacing) * 0);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .scale-110 {
    --tw-scale-x: 110%;
    --tw-scale-y: 110%;
    --tw-scale-z: 110%;
    scale: var(--tw-scale-x) var(--tw-scale-y);
  }
  .-rotate-90 {
    rotate: calc(90deg * -1);
  }
  .rotate-90 {
    rotate: 90deg;
  }
  .rotate-180 {
    rotate: 180deg;
  }
  .transform {
    transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  }
  .animate-fade-in {
    animation: fadeIn ease-in forwards;
  }
  .cursor-default {
    cursor: default;
  }
  .cursor-e-resize {
    cursor: e-resize;
  }
  .cursor-ew-resize {
    cursor: ew-resize;
  }
  .cursor-ew-resize {
    cursor: ew-resize;
  }
  .cursor-move {
    cursor: move;
  }
  .cursor-move {
    cursor: move;
  }
  .cursor-nesw-resize {
    cursor: nesw-resize;
  }
  .cursor-nesw-resize {
    cursor: nesw-resize;
  }
  .cursor-ns-resize {
    cursor: ns-resize;
  }
  .cursor-ns-resize {
    cursor: ns-resize;
  }
  .cursor-nwse-resize {
    cursor: nwse-resize;
  }
  .cursor-nwse-resize {
    cursor: nwse-resize;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .cursor-w-resize {
    cursor: w-resize;
  }
  .\\[touch-action\\:none\\] {
    touch-action: none;
  }
  .resize {
    resize: both;
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .items-end {
    align-items: flex-end;
  }
  .items-start {
    align-items: flex-start;
  }
  .items-stretch {
    align-items: stretch;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .justify-start {
    justify-content: flex-start;
  }
  .gap-0\\.5 {
    gap: calc(var(--spacing) * 0.5);
  }
  .gap-1 {
    gap: calc(var(--spacing) * 1);
  }
  .gap-1\\.5 {
    gap: calc(var(--spacing) * 1.5);
  }
  .gap-2 {
    gap: calc(var(--spacing) * 2);
  }
  .gap-4 {
    gap: calc(var(--spacing) * 4);
  }
  .space-y-1\\.5 {
    :where(& > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 1.5) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 1.5) * calc(1 - var(--tw-space-y-reverse)));
    }
  }
  .gap-x-0\\.5 {
    -moz-column-gap: calc(var(--spacing) * 0.5);
         column-gap: calc(var(--spacing) * 0.5);
  }
  .gap-x-1 {
    -moz-column-gap: calc(var(--spacing) * 1);
         column-gap: calc(var(--spacing) * 1);
  }
  .gap-x-1\\.5 {
    -moz-column-gap: calc(var(--spacing) * 1.5);
         column-gap: calc(var(--spacing) * 1.5);
  }
  .gap-x-2 {
    -moz-column-gap: calc(var(--spacing) * 2);
         column-gap: calc(var(--spacing) * 2);
  }
  .gap-x-3 {
    -moz-column-gap: calc(var(--spacing) * 3);
         column-gap: calc(var(--spacing) * 3);
  }
  .gap-x-4 {
    -moz-column-gap: calc(var(--spacing) * 4);
         column-gap: calc(var(--spacing) * 4);
  }
  .gap-y-0\\.5 {
    row-gap: calc(var(--spacing) * 0.5);
  }
  .gap-y-1 {
    row-gap: calc(var(--spacing) * 1);
  }
  .gap-y-2 {
    row-gap: calc(var(--spacing) * 2);
  }
  .gap-y-4 {
    row-gap: calc(var(--spacing) * 4);
  }
  .divide-y {
    :where(& > :not(:last-child)) {
      --tw-divide-y-reverse: 0;
      border-bottom-style: var(--tw-border-style);
      border-top-style: var(--tw-border-style);
      border-top-width: calc(1px * var(--tw-divide-y-reverse));
      border-bottom-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
    }
  }
  .divide-zinc-800 {
    :where(& > :not(:last-child)) {
      border-color: var(--color-zinc-800);
    }
  }
  .place-self-center {
    place-self: center;
  }
  .self-end {
    align-self: flex-end;
  }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .\\!overflow-visible {
    overflow: visible !important;
  }
  .overflow-auto {
    overflow: auto;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .overflow-x-auto {
    overflow-x: auto;
  }
  .overflow-x-hidden {
    overflow-x: hidden;
  }
  .overflow-y-auto {
    overflow-y: auto;
  }
  .rounded {
    border-radius: 4px;
  }
  .rounded-full {
    border-radius: calc(infinity * 1px);
  }
  .rounded-lg {
    border-radius: var(--radius-lg);
  }
  .rounded-md {
    border-radius: var(--radius-md);
  }
  .rounded-sm {
    border-radius: var(--radius-sm);
  }
  .rounded-t-lg {
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
  }
  .rounded-t-sm {
    border-top-left-radius: var(--radius-sm);
    border-top-right-radius: var(--radius-sm);
  }
  .rounded-l-md {
    border-top-left-radius: var(--radius-md);
    border-bottom-left-radius: var(--radius-md);
  }
  .rounded-l-sm {
    border-top-left-radius: var(--radius-sm);
    border-bottom-left-radius: var(--radius-sm);
  }
  .rounded-tl-lg {
    border-top-left-radius: var(--radius-lg);
  }
  .rounded-r-md {
    border-top-right-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
  }
  .rounded-r-sm {
    border-top-right-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
  }
  .rounded-tr-lg {
    border-top-right-radius: var(--radius-lg);
  }
  .rounded-br-lg {
    border-bottom-right-radius: var(--radius-lg);
  }
  .rounded-bl-lg {
    border-bottom-left-radius: var(--radius-lg);
  }
  .border {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }
  .border-4 {
    border-style: var(--tw-border-style);
    border-width: 4px;
  }
  .border-t {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }
  .border-r {
    border-right-style: var(--tw-border-style);
    border-right-width: 1px;
  }
  .border-b {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }
  .border-l {
    border-left-style: var(--tw-border-style);
    border-left-width: 1px;
  }
  .border-l-0 {
    border-left-style: var(--tw-border-style);
    border-left-width: 0px;
  }
  .border-l-1 {
    border-left-style: var(--tw-border-style);
    border-left-width: 1px;
  }
  .border-none {
    --tw-border-style: none;
    border-style: none;
  }
  .\\!border-red-500 {
    border-color: var(--color-red-500) !important;
  }
  .border-\\[\\#1e1e1e\\] {
    border-color: #1e1e1e;
  }
  .border-\\[\\#222\\] {
    border-color: #222;
  }
  .border-\\[\\#333\\] {
    border-color: #333;
  }
  .border-\\[\\#27272A\\] {
    border-color: #27272A;
  }
  .border-transparent {
    border-color: transparent;
  }
  .border-zinc-800 {
    border-color: var(--color-zinc-800);
  }
  .bg-\\[\\#0A0A0A\\] {
    background-color: #0A0A0A;
  }
  .bg-\\[\\#1D3A66\\] {
    background-color: #1D3A66;
  }
  .bg-\\[\\#1E1E1E\\] {
    background-color: #1E1E1E;
  }
  .bg-\\[\\#1a2a1a\\] {
    background-color: #1a2a1a;
  }
  .bg-\\[\\#1e1e1e\\] {
    background-color: #1e1e1e;
  }
  .bg-\\[\\#2a1515\\] {
    background-color: #2a1515;
  }
  .bg-\\[\\#4b4b4b\\] {
    background-color: #4b4b4b;
  }
  .bg-\\[\\#5f3f9a\\] {
    background-color: #5f3f9a;
  }
  .bg-\\[\\#5f3f9a\\]\\/40 {
    background-color: color-mix(in oklab, #5f3f9a 40%, transparent);
  }
  .bg-\\[\\#6a369e\\] {
    background-color: #6a369e;
  }
  .bg-\\[\\#8e61e3\\] {
    background-color: #8e61e3;
  }
  .bg-\\[\\#7521c8\\] {
    background-color: #7521c8;
  }
  .bg-\\[\\#18181B\\] {
    background-color: #18181B;
  }
  .bg-\\[\\#18181B\\]\\/50 {
    background-color: color-mix(in oklab, #18181B 50%, transparent);
  }
  .bg-\\[\\#27272A\\] {
    background-color: #27272A;
  }
  .bg-\\[\\#44444a\\] {
    background-color: #44444a;
  }
  .bg-\\[\\#141414\\] {
    background-color: #141414;
  }
  .bg-\\[\\#214379d4\\] {
    background-color: #214379d4;
  }
  .bg-\\[\\#412162\\] {
    background-color: #412162;
  }
  .bg-\\[\\#EFD81A\\] {
    background-color: #EFD81A;
  }
  .bg-\\[\\#b77116\\] {
    background-color: #b77116;
  }
  .bg-\\[\\#b94040\\] {
    background-color: #b94040;
  }
  .bg-\\[\\#d36cff\\] {
    background-color: #d36cff;
  }
  .bg-\\[\\#efd81a6b\\] {
    background-color: #efd81a6b;
  }
  .bg-black {
    background-color: var(--color-black);
  }
  .bg-black\\/40 {
    background-color: color-mix(in srgb, #000 40%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-black) 40%, transparent);
    }
  }
  .bg-green-500\\/50 {
    background-color: color-mix(in srgb, oklch(72.3% 0.219 149.579) 50%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-green-500) 50%, transparent);
    }
  }
  .bg-green-500\\/60 {
    background-color: color-mix(in srgb, oklch(72.3% 0.219 149.579) 60%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-green-500) 60%, transparent);
    }
  }
  .bg-neutral-700 {
    background-color: var(--color-neutral-700);
  }
  .bg-purple-500 {
    background-color: var(--color-purple-500);
  }
  .bg-purple-500\\/90 {
    background-color: color-mix(in srgb, oklch(62.7% 0.265 303.9) 90%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-purple-500) 90%, transparent);
    }
  }
  .bg-purple-800 {
    background-color: var(--color-purple-800);
  }
  .bg-red-500 {
    background-color: var(--color-red-500);
  }
  .bg-red-500\\/90 {
    background-color: color-mix(in srgb, oklch(63.7% 0.237 25.331) 90%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-red-500) 90%, transparent);
    }
  }
  .bg-red-950\\/50 {
    background-color: color-mix(in srgb, oklch(25.8% 0.092 26.042) 50%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-red-950) 50%, transparent);
    }
  }
  .bg-transparent {
    background-color: transparent;
  }
  .bg-white {
    background-color: var(--color-white);
  }
  .bg-yellow-300 {
    background-color: var(--color-yellow-300);
  }
  .bg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
  .bg-zinc-900\\/30 {
    background-color: color-mix(in srgb, oklch(21% 0.006 285.885) 30%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-zinc-900) 30%, transparent);
    }
  }
  .bg-zinc-900\\/50 {
    background-color: color-mix(in srgb, oklch(21% 0.006 285.885) 50%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-zinc-900) 50%, transparent);
    }
  }
  .p-0 {
    padding: calc(var(--spacing) * 0);
  }
  .p-1 {
    padding: calc(var(--spacing) * 1);
  }
  .p-2 {
    padding: calc(var(--spacing) * 2);
  }
  .p-3 {
    padding: calc(var(--spacing) * 3);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  .p-5 {
    padding: calc(var(--spacing) * 5);
  }
  .p-6 {
    padding: calc(var(--spacing) * 6);
  }
  .px-1 {
    padding-inline: calc(var(--spacing) * 1);
  }
  .px-1\\.5 {
    padding-inline: calc(var(--spacing) * 1.5);
  }
  .px-2 {
    padding-inline: calc(var(--spacing) * 2);
  }
  .px-2\\.5 {
    padding-inline: calc(var(--spacing) * 2.5);
  }
  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }
  .px-4 {
    padding-inline: calc(var(--spacing) * 4);
  }
  .py-0\\.5 {
    padding-block: calc(var(--spacing) * 0.5);
  }
  .py-1 {
    padding-block: calc(var(--spacing) * 1);
  }
  .py-1\\.5 {
    padding-block: calc(var(--spacing) * 1.5);
  }
  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }
  .py-3 {
    padding-block: calc(var(--spacing) * 3);
  }
  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }
  .py-\\[1px\\] {
    padding-block: 1px;
  }
  .py-\\[3px\\] {
    padding-block: 3px;
  }
  .py-\\[5px\\] {
    padding-block: 5px;
  }
  .pt-0 {
    padding-top: calc(var(--spacing) * 0);
  }
  .pt-2 {
    padding-top: calc(var(--spacing) * 2);
  }
  .pt-5 {
    padding-top: calc(var(--spacing) * 5);
  }
  .pr-1 {
    padding-right: calc(var(--spacing) * 1);
  }
  .pr-1\\.5 {
    padding-right: calc(var(--spacing) * 1.5);
  }
  .pr-2 {
    padding-right: calc(var(--spacing) * 2);
  }
  .pr-2\\.5 {
    padding-right: calc(var(--spacing) * 2.5);
  }
  .pb-2 {
    padding-bottom: calc(var(--spacing) * 2);
  }
  .pl-1 {
    padding-left: calc(var(--spacing) * 1);
  }
  .pl-2 {
    padding-left: calc(var(--spacing) * 2);
  }
  .pl-2\\.5 {
    padding-left: calc(var(--spacing) * 2.5);
  }
  .pl-3 {
    padding-left: calc(var(--spacing) * 3);
  }
  .pl-5 {
    padding-left: calc(var(--spacing) * 5);
  }
  .pl-6 {
    padding-left: calc(var(--spacing) * 6);
  }
  .text-left {
    text-align: left;
  }
  .font-mono {
    font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }
  .text-\\[8px\\] {
    font-size: 8px;
  }
  .text-\\[10px\\] {
    font-size: 10px;
  }
  .text-\\[11px\\] {
    font-size: 11px;
  }
  .text-\\[13px\\] {
    font-size: 13px;
  }
  .text-\\[14px\\] {
    font-size: 14px;
  }
  .text-\\[17px\\] {
    font-size: 17px;
  }
  .leading-6 {
    --tw-leading: calc(var(--spacing) * 6);
    line-height: calc(var(--spacing) * 6);
  }
  .leading-none {
    --tw-leading: 1;
    line-height: 1;
  }
  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }
  .font-medium {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }
  .font-semibold {
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
  }
  .tracking-wide {
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .text-wrap {
    text-wrap: wrap;
  }
  .break-words {
    overflow-wrap: break-word;
  }
  .break-all {
    word-break: break-all;
  }
  .whitespace-nowrap {
    white-space: nowrap;
  }
  .whitespace-pre-wrap {
    white-space: pre-wrap;
  }
  .text-\\[\\#4ade80\\] {
    color: #4ade80;
  }
  .text-\\[\\#5a5a5a\\] {
    color: #5a5a5a;
  }
  .text-\\[\\#6E6E77\\] {
    color: #6E6E77;
  }
  .text-\\[\\#6F6F78\\] {
    color: #6F6F78;
  }
  .text-\\[\\#8E61E3\\] {
    color: #8E61E3;
  }
  .text-\\[\\#666\\] {
    color: #666;
  }
  .text-\\[\\#888\\] {
    color: #888;
  }
  .text-\\[\\#999\\] {
    color: #999;
  }
  .text-\\[\\#7346a0\\] {
    color: #7346a0;
  }
  .text-\\[\\#65656D\\] {
    color: #65656D;
  }
  .text-\\[\\#737373\\] {
    color: #737373;
  }
  .text-\\[\\#A1A1AA\\] {
    color: #A1A1AA;
  }
  .text-\\[\\#A855F7\\] {
    color: #A855F7;
  }
  .text-\\[\\#E4E4E7\\] {
    color: #E4E4E7;
  }
  .text-\\[\\#d36cff\\] {
    color: #d36cff;
  }
  .text-\\[\\#f87171\\] {
    color: #f87171;
  }
  .text-black {
    color: var(--color-black);
  }
  .text-gray-100 {
    color: var(--color-gray-100);
  }
  .text-gray-300 {
    color: var(--color-gray-300);
  }
  .text-gray-400 {
    color: var(--color-gray-400);
  }
  .text-gray-500 {
    color: var(--color-gray-500);
  }
  .text-green-500 {
    color: var(--color-green-500);
  }
  .text-neutral-300 {
    color: var(--color-neutral-300);
  }
  .text-neutral-400 {
    color: var(--color-neutral-400);
  }
  .text-neutral-500 {
    color: var(--color-neutral-500);
  }
  .text-purple-400 {
    color: var(--color-purple-400);
  }
  .text-red-300 {
    color: var(--color-red-300);
  }
  .text-red-400 {
    color: var(--color-red-400);
  }
  .text-red-500 {
    color: var(--color-red-500);
  }
  .text-white {
    color: var(--color-white);
  }
  .text-white\\/30 {
    color: color-mix(in srgb, #fff 30%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      color: color-mix(in oklab, var(--color-white) 30%, transparent);
    }
  }
  .text-white\\/70 {
    color: color-mix(in srgb, #fff 70%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      color: color-mix(in oklab, var(--color-white) 70%, transparent);
    }
  }
  .text-yellow-300 {
    color: var(--color-yellow-300);
  }
  .text-yellow-500 {
    color: var(--color-yellow-500);
  }
  .text-zinc-200 {
    color: var(--color-zinc-200);
  }
  .text-zinc-400 {
    color: var(--color-zinc-400);
  }
  .text-zinc-500 {
    color: var(--color-zinc-500);
  }
  .text-zinc-600 {
    color: var(--color-zinc-600);
  }
  .uppercase {
    text-transform: uppercase;
  }
  .italic {
    font-style: italic;
  }
  .opacity-0 {
    opacity: 0%;
  }
  .opacity-50 {
    opacity: 50%;
  }
  .opacity-100 {
    opacity: 100%;
  }
  .shadow-lg {
    --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-1 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-white\\/\\[0\\.08\\] {
    --tw-ring-color: color-mix(in srgb, #fff 8%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-ring-color: color-mix(in oklab, var(--color-white) 8%, transparent);
    }
  }
  .outline {
    outline-style: var(--tw-outline-style);
    outline-width: 1px;
  }
  .filter {
    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
  }
  .backdrop-blur-sm {
    --tw-backdrop-blur: blur(var(--blur-sm));
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .transition {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-\\[border-radius\\] {
    transition-property: border-radius;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-\\[color\\,transform\\] {
    transition-property: color,transform;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-\\[max-height\\] {
    transition-property: max-height;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-\\[opacity\\] {
    transition-property: opacity;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-all {
    transition-property: all;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-colors {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-opacity {
    transition-property: opacity;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-transform {
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-none {
    transition-property: none;
  }
  .delay-0 {
    transition-delay: 0ms;
  }
  .delay-150 {
    transition-delay: 150ms;
  }
  .delay-300 {
    transition-delay: 300ms;
  }
  .\\!duration-0 {
    --tw-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
  .duration-0 {
    --tw-duration: 0ms;
    transition-duration: 0ms;
  }
  .duration-120 {
    --tw-duration: 120ms;
    transition-duration: 120ms;
  }
  .duration-200 {
    --tw-duration: 200ms;
    transition-duration: 200ms;
  }
  .duration-300 {
    --tw-duration: 300ms;
    transition-duration: 300ms;
  }
  .ease-\\[cubic-bezier\\(0\\.25\\,0\\.1\\,0\\.25\\,1\\)\\] {
    --tw-ease: cubic-bezier(0.25,0.1,0.25,1);
    transition-timing-function: cubic-bezier(0.25,0.1,0.25,1);
  }
  .ease-in {
    --tw-ease: var(--ease-in);
    transition-timing-function: var(--ease-in);
  }
  .ease-in-out {
    --tw-ease: var(--ease-in-out);
    transition-timing-function: var(--ease-in-out);
  }
  .ease-out {
    --tw-ease: var(--ease-out);
    transition-timing-function: var(--ease-out);
  }
  .will-change-transform {
    will-change: transform;
  }
  .select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
         user-select: none;
  }
  .animation-delay-0 {
    animation-delay: 0s;
  }
  .animation-delay-100 {
    animation-delay: .1s;
  }
  .animation-delay-150 {
    animation-delay: .15s;
  }
  .animation-delay-200 {
    animation-delay: .2s;
  }
  .animation-delay-300 {
    animation-delay: .3s;
  }
  .animation-delay-500 {
    animation-delay: .5s;
  }
  .animation-delay-700 {
    animation-delay: .7s;
  }
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  .animation-duration-0 {
    animation-duration: 0s;
  }
  .animation-duration-100 {
    animation-duration: .1s;
  }
  .animation-duration-200 {
    animation-duration: .2s;
  }
  .animation-duration-300 {
    animation-duration: .3s;
  }
  .animation-duration-500 {
    animation-duration: .5s;
  }
  .animation-duration-700 {
    animation-duration: .7s;
  }
  .animation-duration-1000 {
    animation-duration: 1s;
  }
  .group-hover\\:bg-\\[\\#5b2d89\\] {
    &:is(:where(.group):hover *) {
      @media (hover: hover) {
        background-color: #5b2d89;
      }
    }
  }
  .group-hover\\:bg-\\[\\#6a6a6a\\] {
    &:is(:where(.group):hover *) {
      @media (hover: hover) {
        background-color: #6a6a6a;
      }
    }
  }
  .group-hover\\:bg-\\[\\#21437982\\] {
    &:is(:where(.group):hover *) {
      @media (hover: hover) {
        background-color: #21437982;
      }
    }
  }
  .group-hover\\:bg-\\[\\#efda1a2f\\] {
    &:is(:where(.group):hover *) {
      @media (hover: hover) {
        background-color: #efda1a2f;
      }
    }
  }
  .group-hover\\:opacity-100 {
    &:is(:where(.group):hover *) {
      @media (hover: hover) {
        opacity: 100%;
      }
    }
  }
  .peer-hover\\/bottom\\:rounded-b-none {
    &:is(:where(.peer\\/bottom):hover ~ *) {
      @media (hover: hover) {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
  .peer-hover\\/left\\:rounded-l-none {
    &:is(:where(.peer\\/left):hover ~ *) {
      @media (hover: hover) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
  .peer-hover\\/right\\:rounded-r-none {
    &:is(:where(.peer\\/right):hover ~ *) {
      @media (hover: hover) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
  .peer-hover\\/top\\:rounded-t-none {
    &:is(:where(.peer\\/top):hover ~ *) {
      @media (hover: hover) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }
  }
  .after\\:absolute {
    &::after {
      content: var(--tw-content);
      position: absolute;
    }
  }
  .after\\:inset-0 {
    &::after {
      content: var(--tw-content);
      inset: calc(var(--spacing) * 0);
    }
  }
  .after\\:top-\\[100\\%\\] {
    &::after {
      content: var(--tw-content);
      top: 100%;
    }
  }
  .after\\:left-1\\/2 {
    &::after {
      content: var(--tw-content);
      left: calc(1 / 2 * 100%);
    }
  }
  .after\\:h-\\[6px\\] {
    &::after {
      content: var(--tw-content);
      height: 6px;
    }
  }
  .after\\:w-\\[10px\\] {
    &::after {
      content: var(--tw-content);
      width: 10px;
    }
  }
  .after\\:-translate-x-1\\/2 {
    &::after {
      content: var(--tw-content);
      --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .after\\:animate-\\[fadeOut_1s_ease-out_forwards\\] {
    &::after {
      content: var(--tw-content);
      animation: fadeOut 1s ease-out forwards;
    }
  }
  .after\\:border-t-\\[6px\\] {
    &::after {
      content: var(--tw-content);
      border-top-style: var(--tw-border-style);
      border-top-width: 6px;
    }
  }
  .after\\:border-r-\\[5px\\] {
    &::after {
      content: var(--tw-content);
      border-right-style: var(--tw-border-style);
      border-right-width: 5px;
    }
  }
  .after\\:border-l-\\[5px\\] {
    &::after {
      content: var(--tw-content);
      border-left-style: var(--tw-border-style);
      border-left-width: 5px;
    }
  }
  .after\\:border-t-white {
    &::after {
      content: var(--tw-content);
      border-top-color: var(--color-white);
    }
  }
  .after\\:border-r-transparent {
    &::after {
      content: var(--tw-content);
      border-right-color: transparent;
    }
  }
  .after\\:border-l-transparent {
    &::after {
      content: var(--tw-content);
      border-left-color: transparent;
    }
  }
  .after\\:bg-purple-500\\/30 {
    &::after {
      content: var(--tw-content);
      background-color: color-mix(in srgb, oklch(62.7% 0.265 303.9) 30%, transparent);
      @supports (color: color-mix(in lab, red, red)) {
        background-color: color-mix(in oklab, var(--color-purple-500) 30%, transparent);
      }
    }
  }
  .after\\:content-\\[\\"\\"\\] {
    &::after {
      --tw-content: "";
      content: var(--tw-content);
    }
  }
  .focus-within\\:border-\\[\\#454545\\] {
    &:focus-within {
      border-color: #454545;
    }
  }
  .hover\\:bg-\\[\\#0f0f0f\\] {
    &:hover {
      @media (hover: hover) {
        background-color: #0f0f0f;
      }
    }
  }
  .hover\\:bg-\\[\\#5f3f9a\\]\\/20 {
    &:hover {
      @media (hover: hover) {
        background-color: color-mix(in oklab, #5f3f9a 20%, transparent);
      }
    }
  }
  .hover\\:bg-\\[\\#5f3f9a\\]\\/40 {
    &:hover {
      @media (hover: hover) {
        background-color: color-mix(in oklab, #5f3f9a 40%, transparent);
      }
    }
  }
  .hover\\:bg-\\[\\#18181B\\] {
    &:hover {
      @media (hover: hover) {
        background-color: #18181B;
      }
    }
  }
  .hover\\:bg-\\[\\#34343b\\] {
    &:hover {
      @media (hover: hover) {
        background-color: #34343b;
      }
    }
  }
  .hover\\:bg-red-600 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-red-600);
      }
    }
  }
  .hover\\:bg-zinc-700 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-zinc-700);
      }
    }
  }
  .hover\\:bg-zinc-800\\/50 {
    &:hover {
      @media (hover: hover) {
        background-color: color-mix(in srgb, oklch(27.4% 0.006 286.033) 50%, transparent);
        @supports (color: color-mix(in lab, red, red)) {
          background-color: color-mix(in oklab, var(--color-zinc-800) 50%, transparent);
        }
      }
    }
  }
  .hover\\:text-neutral-300 {
    &:hover {
      @media (hover: hover) {
        color: var(--color-neutral-300);
      }
    }
  }
  .hover\\:text-white {
    &:hover {
      @media (hover: hover) {
        color: var(--color-white);
      }
    }
  }
}
* {
  outline: none !important;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.3);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}
@-moz-document url-prefix() {
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
    scrollbar-width: 6px;
  }
}
button {
  &:hover {
    @media (hover: hover) {
      background-image: none;
    }
  }
  --tw-outline-style: none;
  outline-style: none;
  --tw-border-style: none;
  border-style: none;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-ease: var(--ease-out);
  transition-timing-function: var(--ease-out);
  cursor: pointer;
}
input {
  --tw-outline-style: none;
  outline-style: none;
  --tw-border-style: none;
  border-style: none;
  background-color: transparent;
  background-image: none;
  &::-moz-placeholder {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }
  &::placeholder {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }
  &::-moz-placeholder {
    color: var(--color-neutral-500);
  }
  &::placeholder {
    color: var(--color-neutral-500);
  }
  &::-moz-placeholder {
    font-style: italic;
  }
  &::placeholder {
    font-style: italic;
  }
  &:-moz-placeholder {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:placeholder-shown {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
svg {
  height: auto;
  width: auto;
  pointer-events: none;
}
.with-data-text {
  overflow: hidden;
  &::before {
    content: attr(data-text);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
#react-scan-toolbar {
  position: fixed;
  top: calc(var(--spacing) * 0);
  left: calc(var(--spacing) * 0);
  display: flex;
  flex-direction: column;
  --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;
  font-size: 13px;
  color: var(--color-white);
  background-color: var(--color-black);
  -webkit-user-select: none;
  -moz-user-select: none;
       user-select: none;
  cursor: move;
  opacity: 0%;
  z-index: 2147483678;
  animation: fadeIn ease-in forwards;
  animation-delay: .3s;
  animation-duration: .3s;
  --tw-shadow: 0 4px 12px var(--tw-shadow-color, rgba(0,0,0,0.2));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  place-self: start;
  will-change: transform;
  backface-visibility: hidden;
}
#react-scan-toolbar pre,
#react-scan-toolbar textarea,
#react-scan-toolbar input[type='text'],
#react-scan-toolbar input[type='search'],
#react-scan-toolbar [data-react-scan-selectable] {
  -webkit-user-select: text;
  -moz-user-select: text;
       user-select: text;
  cursor: text;
}
.button {
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  &:active {
    background: rgba(255, 255, 255, 0.15);
  }
}
.resize-line-wrapper {
  position: absolute;
  overflow: hidden;
}
.resize-line {
  position: absolute;
  inset: calc(var(--spacing) * 0);
  overflow: hidden;
  background-color: var(--color-black);
  transition-property: all;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  svg {
    position: absolute;
    top: calc(1 / 2 * 100%);
    left: calc(1 / 2 * 100%);
    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.resize-right,
.resize-left {
  inset-block: calc(var(--spacing) * 0);
  width: calc(var(--spacing) * 6);
  cursor: ew-resize;
  .resize-line-wrapper {
    inset-block: calc(var(--spacing) * 0);
    width: calc(1 / 2 * 100%);
  }
  &:hover {
    .resize-line {
      --tw-translate-x: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
}
.resize-right {
  right: calc(var(--spacing) * 0);
  --tw-translate-x: calc(1 / 2 * 100%);
  translate: var(--tw-translate-x) var(--tw-translate-y);
  .resize-line-wrapper {
    right: calc(var(--spacing) * 0);
  }
  .resize-line {
    border-top-right-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    --tw-translate-x: -100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.resize-left {
  left: calc(var(--spacing) * 0);
  --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
  translate: var(--tw-translate-x) var(--tw-translate-y);
  .resize-line-wrapper {
    left: calc(var(--spacing) * 0);
  }
  .resize-line {
    border-top-left-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
    --tw-translate-x: 100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.resize-top,
.resize-bottom {
  inset-inline: calc(var(--spacing) * 0);
  height: calc(var(--spacing) * 6);
  cursor: ns-resize;
  .resize-line-wrapper {
    inset-inline: calc(var(--spacing) * 0);
    height: calc(1 / 2 * 100%);
  }
  &:hover {
    .resize-line {
      --tw-translate-y: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
}
.resize-top {
  top: calc(var(--spacing) * 0);
  --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
  translate: var(--tw-translate-x) var(--tw-translate-y);
  .resize-line-wrapper {
    top: calc(var(--spacing) * 0);
  }
  .resize-line {
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
    --tw-translate-y: 100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.resize-bottom {
  bottom: calc(var(--spacing) * 0);
  --tw-translate-y: calc(1 / 2 * 100%);
  translate: var(--tw-translate-x) var(--tw-translate-y);
  .resize-line-wrapper {
    bottom: calc(var(--spacing) * 0);
  }
  .resize-line {
    border-bottom-right-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
    --tw-translate-y: -100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.react-scan-header {
  display: flex;
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 2);
       column-gap: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
  padding-left: calc(var(--spacing) * 3);
  min-height: calc(var(--spacing) * 9);
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
  border-color: #222;
  overflow: hidden;
  white-space: nowrap;
}
.react-scan-replay-button,
.react-scan-close-button {
  display: flex;
  align-items: center;
  padding: calc(var(--spacing) * 1);
  min-width: -moz-fit-content;
  min-width: fit-content;
  border-radius: 4px;
  transition-property: all;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-duration: 300ms;
  transition-duration: 300ms;
}
.react-scan-replay-button {
  position: relative;
  overflow: hidden;
  background-color: color-mix(in srgb, oklch(62.7% 0.265 303.9) 50%, transparent) !important;
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-purple-500) 50%, transparent) !important;
  }
  &:hover {
    background-color: color-mix(in srgb, oklch(62.7% 0.265 303.9) 25%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-purple-500) 25%, transparent);
    }
  }
  &.disabled {
    opacity: 50%;
    pointer-events: none;
  }
  &:before {
    content: "";
    position: absolute;
    inset: calc(var(--spacing) * 0);
    --tw-translate-x: -100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
    animation: shimmer 2s infinite;
    background: linear-gradient(
      to right,
      transparent,
      rgba(142, 97, 227, 0.3),
      transparent
    );
  }
}
.react-scan-close-button {
  background-color: color-mix(in srgb, #fff 10%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-white) 10%, transparent);
  }
  &:hover {
    background-color: color-mix(in srgb, #fff 15%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-white) 15%, transparent);
    }
  }
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.react-section-header {
  position: sticky;
  z-index: 100;
  display: flex;
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 2);
       column-gap: calc(var(--spacing) * 2);
  padding-inline: calc(var(--spacing) * 3);
  height: calc(var(--spacing) * 7);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #888;
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
  border-color: #222;
  background-color: #0a0a0a;
}
.react-scan-section {
  display: flex;
  flex-direction: column;
  padding-inline: calc(var(--spacing) * 2);
  color: #888;
  &::before {
    content: var(--tw-content);
    color: var(--color-gray-500);
  }
  &::before {
    --tw-content: attr(data-section);
    content: var(--tw-content);
  }
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
  > .react-scan-property {
    margin-left: calc(14px * -1);
  }
}
.react-scan-property {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: calc(var(--spacing) * 8);
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
  border-color: transparent;
  overflow: hidden;
}
.react-scan-property-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: calc(var(--spacing) * 7);
  max-width: 100%;
  overflow: hidden;
}
.react-scan-string {
  color: #9ecbff;
}
.react-scan-number {
  color: #79c7ff;
}
.react-scan-boolean {
  color: #56b6c2;
}
.react-scan-key {
  width: -moz-fit-content;
  width: fit-content;
  max-width: calc(var(--spacing) * 60);
  white-space: nowrap;
  color: var(--color-white);
}
.react-scan-input {
  color: var(--color-white);
  background-color: var(--color-black);
}
@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.react-scan-arrow {
  position: absolute;
  top: calc(var(--spacing) * 0);
  left: calc(var(--spacing) * 7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: calc(var(--spacing) * 7);
  width: calc(var(--spacing) * 6);
  --tw-translate-x: -100%;
  translate: var(--tw-translate-x) var(--tw-translate-y);
  z-index: 10;
  > svg {
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
}
.react-scan-nested {
  position: relative;
  overflow: hidden;
  &:before {
    content: "";
    position: absolute;
    top: calc(var(--spacing) * 0);
    left: calc(var(--spacing) * 0);
    height: 100%;
    width: 1px;
    background-color: color-mix(in srgb, oklch(55.1% 0.027 264.364) 30%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-gray-500) 30%, transparent);
    }
  }
}
.react-scan-settings {
  position: absolute;
  inset: calc(var(--spacing) * 0);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  padding-inline: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 2);
  color: #888;
  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
    --tw-duration: 300ms;
    transition-duration: 300ms;
  }
}
.react-scan-preview-line {
  position: relative;
  display: flex;
  min-height: calc(var(--spacing) * 7);
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 2);
       column-gap: calc(var(--spacing) * 2);
}
.react-scan-flash-overlay {
  position: absolute;
  inset: calc(var(--spacing) * 0);
  opacity: 0%;
  z-index: 50;
  pointer-events: none;
  transition-property: opacity;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  mix-blend-mode: multiply;
  background-color: color-mix(in srgb, oklch(62.7% 0.265 303.9) 90%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-purple-500) 90%, transparent);
  }
}
.react-scan-toggle {
  position: relative;
  display: inline-flex;
  height: calc(var(--spacing) * 6);
  width: calc(var(--spacing) * 10);
  input {
    position: absolute;
    inset: calc(var(--spacing) * 0);
    z-index: 20;
    opacity: 0%;
    cursor: pointer;
    height: 100%;
    width: 100%;
  }
  input:checked {
    + div {
      background-color: #5f3f9a;
      &::before {
        --tw-translate-x: 100%;
        translate: var(--tw-translate-x) var(--tw-translate-y);
        left: auto;
        border-color: #5f3f9a;
      }
    }
  }
  > div {
    position: absolute;
    inset: calc(var(--spacing) * 1);
    background-color: var(--color-neutral-700);
    border-radius: calc(infinity * 1px);
    pointer-events: none;
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
    --tw-duration: 300ms;
    transition-duration: 300ms;
    &:before {
      --tw-content: '';
      content: var(--tw-content);
      position: absolute;
      top: calc(1 / 2 * 100%);
      left: calc(var(--spacing) * 0);
      --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
      height: calc(var(--spacing) * 4);
      width: calc(var(--spacing) * 4);
      background-color: var(--color-white);
      border-style: var(--tw-border-style);
      border-width: 2px;
      border-color: var(--color-neutral-700);
      border-radius: calc(infinity * 1px);
      --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      transition-property: all;
      transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
      transition-duration: var(--tw-duration, var(--default-transition-duration));
      --tw-duration: 300ms;
      transition-duration: 300ms;
    }
  }
}
.react-scan-flash-active {
  opacity: 40%;
  transition-property: opacity;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-duration: 300ms;
  transition-duration: 300ms;
}
.react-scan-inspector-overlay {
  display: flex;
  flex-direction: column;
  opacity: 0%;
  transition-property: opacity;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-duration: 200ms;
  transition-duration: 200ms;
  --tw-ease: var(--ease-out);
  transition-timing-function: var(--ease-out);
  will-change: opacity;
  &.fade-out {
    opacity: 0%;
  }
  &.fade-in {
    opacity: 100%;
  }
}
.react-scan-what-changed {
  ul {
    list-style-type: disc;
    padding-left: calc(var(--spacing) * 4);
  }
  li {
    white-space: nowrap;
    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      -moz-column-gap: calc(var(--spacing) * 2);
           column-gap: calc(var(--spacing) * 2);
    }
  }
}
.count-badge {
  display: flex;
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 2);
       column-gap: calc(var(--spacing) * 2);
  padding-inline: calc(var(--spacing) * 1.5);
  padding-block: calc(var(--spacing) * 0.5);
  border-radius: 4px;
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
  color: #a855f7;
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  background-color: color-mix(in oklab, #a855f7 10%, transparent);
  transform-origin: center;
  transition-property: all;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  transition-delay: 150ms;
  --tw-duration: 300ms;
  transition-duration: 300ms;
}
.count-flash {
  animation: countFlash .3s ease-out forwards;
}
.count-flash-white {
  animation: countFlashShake .3s ease-out forwards;
  transition-delay: 500ms !important;
}
.change-scope {
  display: flex;
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 1);
       column-gap: calc(var(--spacing) * 1);
  color: #666;
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
  font-family: Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace;
  > div {
    padding-inline: calc(var(--spacing) * 1.5);
    padding-block: calc(var(--spacing) * 0.5);
    border-radius: 4px;
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
    --tw-numeric-spacing: tabular-nums;
    font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
    transform-origin: center;
    transition-property: all;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
    transition-delay: 150ms;
    --tw-duration: 300ms;
    transition-duration: 300ms;
    &[data-flash="true"] {
      background-color: color-mix(in oklab, #a855f7 10%, transparent);
      color: #a855f7;
    }
  }
}
.react-scan-slider {
  position: relative;
  min-height: calc(var(--spacing) * 6);
  > input {
    position: absolute;
    inset: calc(var(--spacing) * 0);
    opacity: 0%;
  }
  &:before {
    --tw-content: '';
    content: var(--tw-content);
    position: absolute;
    inset-inline: calc(var(--spacing) * 0);
    top: calc(1 / 2 * 100%);
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
    height: calc(var(--spacing) * 1.5);
    background-color: color-mix(in oklab, #8e61e3 40%, transparent);
    border-radius: var(--radius-lg);
    pointer-events: none;
  }
  &:after {
    --tw-content: '';
    content: var(--tw-content);
    position: absolute;
    inset-inline: calc(var(--spacing) * 0);
    inset-block: calc(var(--spacing) * -2);
    z-index: calc(10 * -1);
  }
  span {
    position: absolute;
    top: calc(1 / 2 * 100%);
    left: calc(var(--spacing) * 0);
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
    height: calc(var(--spacing) * 2.5);
    width: calc(var(--spacing) * 2.5);
    border-radius: var(--radius-lg);
    background-color: #8e61e3;
    pointer-events: none;
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
    --tw-duration: 75ms;
    transition-duration: 75ms;
  }
}
.resize-v-line {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: calc(var(--spacing) * 1);
  min-width: calc(var(--spacing) * 1);
  height: 100%;
  width: 100%;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  &:hover,
  &:active {
    > span {
      background-color: #222;
    }
    svg {
      opacity: 100%;
    }
  }
  &::before {
    --tw-content: "";
    content: var(--tw-content);
    position: absolute;
    inset: calc(var(--spacing) * 0);
    left: calc(1 / 2 * 100%);
    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
    width: 1px;
    background-color: #222;
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  > span {
    position: absolute;
    top: calc(1 / 2 * 100%);
    left: calc(1 / 2 * 100%);
    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
    height: 18px;
    width: calc(var(--spacing) * 1.5);
    border-radius: 4px;
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  svg {
    position: absolute;
    top: calc(1 / 2 * 100%);
    left: calc(1 / 2 * 100%);
    --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
    --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
    rotate: 90deg;
    color: var(--color-neutral-400);
    opacity: 0%;
    transition-property: opacity;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
    z-index: 50;
  }
}
.tree-node-search-highlight {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  span {
    padding-block: 1px;
    border-radius: var(--radius-sm);
    background-color: var(--color-yellow-300);
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
    color: var(--color-black);
  }
  .single {
    margin-right: 1px;
    padding-inline: 2px;
  }
  .regex {
    padding-inline: 2px;
  }
  .start {
    margin-left: 1px;
    border-top-left-radius: var(--radius-sm);
    border-bottom-left-radius: var(--radius-sm);
  }
  .end {
    margin-right: 1px;
    border-top-right-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
  }
  .middle {
    margin-inline: 1px;
    border-radius: var(--radius-sm);
  }
}
.react-scan-toolbar-notification {
  position: absolute;
  inset-inline: calc(var(--spacing) * 0);
  display: flex;
  align-items: center;
  -moz-column-gap: calc(var(--spacing) * 2);
       column-gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 1);
  padding-left: calc(var(--spacing) * 2);
  font-size: 10px;
  color: var(--color-neutral-300);
  background-color: color-mix(in srgb, #000 90%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-black) 90%, transparent);
  }
  transition-property: transform, translate, scale, rotate;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  &:before {
    --tw-content: '';
    content: var(--tw-content);
    position: absolute;
    inset-inline: calc(var(--spacing) * 0);
    background-color: var(--color-black);
    height: calc(var(--spacing) * 2);
  }
  &.position-top {
    top: 100%;
    --tw-translate-y: -100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
    border-bottom-right-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
    &::before {
      top: calc(var(--spacing) * 0);
      --tw-translate-y: -100%;
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  &.position-bottom {
    bottom: 100%;
    --tw-translate-y: 100%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
    &::before {
      bottom: calc(var(--spacing) * 0);
      --tw-translate-y: 100%;
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  &.is-open {
    --tw-translate-y: calc(var(--spacing) * 0);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.react-scan-header-item {
  position: absolute;
  inset: calc(var(--spacing) * 0);
  --tw-translate-y: calc(200% * -1);
  translate: var(--tw-translate-x) var(--tw-translate-y);
  transition-property: transform, translate, scale, rotate;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-duration: 300ms;
  transition-duration: 300ms;
  &.is-visible {
    --tw-translate-y: calc(var(--spacing) * 0);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
}
.react-scan-components-tree:has(.resize-v-line:hover, .resize-v-line:active)
  .tree {
  overflow: hidden;
}
.react-scan-expandable {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition-property: all;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  --tw-duration: 75ms;
  transition-duration: 75ms;
  transition-timing-function: ease-out;
  > * {
    min-height: 0;
  }
  &.react-scan-expanded {
    grid-template-rows: 1fr;
    transition-duration: 100ms;
  }
}
@property --tw-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-translate-z {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-scale-x {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-y {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-z {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-rotate-x {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-y {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-z {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-x {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-y {
  syntax: "*";
  inherits: false;
}
@property --tw-space-y-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-divide-y-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-border-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-leading {
  syntax: "*";
  inherits: false;
}
@property --tw-font-weight {
  syntax: "*";
  inherits: false;
}
@property --tw-tracking {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-ring-inset {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-offset-width {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
@property --tw-ring-offset-color {
  syntax: "*";
  inherits: false;
  initial-value: #fff;
}
@property --tw-ring-offset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-outline-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-blur {
  syntax: "*";
  inherits: false;
}
@property --tw-brightness {
  syntax: "*";
  inherits: false;
}
@property --tw-contrast {
  syntax: "*";
  inherits: false;
}
@property --tw-grayscale {
  syntax: "*";
  inherits: false;
}
@property --tw-hue-rotate {
  syntax: "*";
  inherits: false;
}
@property --tw-invert {
  syntax: "*";
  inherits: false;
}
@property --tw-opacity {
  syntax: "*";
  inherits: false;
}
@property --tw-saturate {
  syntax: "*";
  inherits: false;
}
@property --tw-sepia {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-drop-shadow-size {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-blur {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-brightness {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-contrast {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-grayscale {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-hue-rotate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-invert {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-opacity {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-saturate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-sepia {
  syntax: "*";
  inherits: false;
}
@property --tw-duration {
  syntax: "*";
  inherits: false;
}
@property --tw-ease {
  syntax: "*";
  inherits: false;
}
@property --tw-content {
  syntax: "*";
  initial-value: "";
  inherits: false;
}
@property --tw-ordinal {
  syntax: "*";
  inherits: false;
}
@property --tw-slashed-zero {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-figure {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-spacing {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-fraction {
  syntax: "*";
  inherits: false;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes countFlash {
  0% {
    background-color: rgba(168, 85, 247, 0.3);
    transform: scale(1.05);
  }
  100% {
    background-color: rgba(168, 85, 247, 0.1);
    transform: scale(1);
  }
}
@keyframes countFlashShake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px) scale(1.1);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}
@layer properties {
  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
    *, ::before, ::after, ::backdrop {
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-translate-z: 0;
      --tw-scale-x: 1;
      --tw-scale-y: 1;
      --tw-scale-z: 1;
      --tw-rotate-x: initial;
      --tw-rotate-y: initial;
      --tw-rotate-z: initial;
      --tw-skew-x: initial;
      --tw-skew-y: initial;
      --tw-space-y-reverse: 0;
      --tw-divide-y-reverse: 0;
      --tw-border-style: solid;
      --tw-leading: initial;
      --tw-font-weight: initial;
      --tw-tracking: initial;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-color: initial;
      --tw-shadow-alpha: 100%;
      --tw-inset-shadow: 0 0 #0000;
      --tw-inset-shadow-color: initial;
      --tw-inset-shadow-alpha: 100%;
      --tw-ring-color: initial;
      --tw-ring-shadow: 0 0 #0000;
      --tw-inset-ring-color: initial;
      --tw-inset-ring-shadow: 0 0 #0000;
      --tw-ring-inset: initial;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-outline-style: solid;
      --tw-blur: initial;
      --tw-brightness: initial;
      --tw-contrast: initial;
      --tw-grayscale: initial;
      --tw-hue-rotate: initial;
      --tw-invert: initial;
      --tw-opacity: initial;
      --tw-saturate: initial;
      --tw-sepia: initial;
      --tw-drop-shadow: initial;
      --tw-drop-shadow-color: initial;
      --tw-drop-shadow-alpha: 100%;
      --tw-drop-shadow-size: initial;
      --tw-backdrop-blur: initial;
      --tw-backdrop-brightness: initial;
      --tw-backdrop-contrast: initial;
      --tw-backdrop-grayscale: initial;
      --tw-backdrop-hue-rotate: initial;
      --tw-backdrop-invert: initial;
      --tw-backdrop-opacity: initial;
      --tw-backdrop-saturate: initial;
      --tw-backdrop-sepia: initial;
      --tw-duration: initial;
      --tw-ease: initial;
      --tw-content: "";
      --tw-ordinal: initial;
      --tw-slashed-zero: initial;
      --tw-numeric-figure: initial;
      --tw-numeric-spacing: initial;
      --tw-numeric-fraction: initial;
    }
  }
}
`;

// src/web/toolbar.tsx
import { Component as Component2, render } from "preact";

// src/web/widget/index.tsx
import { createContext as createContext2 } from "preact";
import { useCallback as useCallback6, useEffect as useEffect19, useRef as useRef16, useState as useState20 } from "preact/hooks";

// src/web/views/index.tsx
import { computed as computed3 } from "@preact/signals";

// src/web/widget/header.tsx
import { useSignal } from "@preact/signals";
import { useEffect as useEffect8, useRef as useRef7 } from "preact/hooks";

// src/web/hooks/use-delayed-value.ts
import { useEffect as useEffect7, useState as useState7 } from "preact/hooks";
var useDelayedValue = (value, onDelay, offDelay = onDelay) => {
  const [delayedValue, setDelayedValue] = useState7(value);
  useEffect7(() => {
    if (value === delayedValue) return;
    const delay = value ? onDelay : offDelay;
    const timeout2 = setTimeout(() => setDelayedValue(value), delay);
    return () => clearTimeout(timeout2);
  }, [value, onDelay, offDelay]);
  return delayedValue;
};

// src/web/utils/copy-focused-element.ts
import { getElementContext } from "react-grab/primitives";
var copyFocusedElement = async (element) => {
  try {
    const context = await getElementContext(element);
    const snippet = `${context.htmlPreview}${context.stackString}`;
    if (!snippet.trim()) return false;
    await navigator.clipboard.writeText(snippet);
    return true;
  } catch {
    return false;
  }
};

// src/web/utils/has-non-empty-text-selection.ts
var hasNonEmptyTextSelection = () => {
  var _a;
  const selection = (_a = window.getSelection) == null ? void 0 : _a.call(window);
  return Boolean(selection && selection.toString().length > 0);
};

// src/web/utils/is-input-like-focused.ts
var isInputLikeFocused = () => {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (active instanceof HTMLElement && active.isContentEditable) return true;
  return false;
};

// src/web/utils/is-mac.ts
var isMac = () => {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform || "";
  if (platform) return /Mac|iPhone|iPad|iPod/i.test(platform);
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// src/web/utils/is-user-react-grab-active.ts
var isUserReactGrabActive = () => typeof window !== "undefined" && Boolean(window.__REACT_GRAB__);

// src/web/views/inspector/header.tsx
import { computed as computed2, untracked as untracked2, useSignalEffect as useSignalEffect2 } from "@preact/signals";
import { useMemo as useMemo3, useRef as useRef6, useState as useState8 } from "preact/hooks";
import { Fragment as Fragment4, jsx as jsx7, jsxs as jsxs6 } from "preact/jsx-runtime";
var headerInspectClassName = computed2(
  () => cn(
    "absolute inset-0 flex items-center gap-x-2",
    "translate-y-0",
    "transition-transform duration-300",
    signalIsSettingsOpen.value && "-translate-y-[200%]"
  )
);
var HeaderInspect = () => {
  const refReRenders = useRef6(null);
  const refTiming = useRef6(null);
  const [currentFiber, setCurrentFiber] = useState8(null);
  useSignalEffect2(() => {
    const state = Store.inspectState.value;
    if (state.kind === "focused") {
      setCurrentFiber(state.fiber);
    }
  });
  useSignalEffect2(() => {
    const state = timelineState.value;
    untracked2(() => {
      var _a, _b;
      if (Store.inspectState.value.kind !== "focused") return;
      if (!refReRenders.current || !refTiming.current) return;
      const { totalUpdates, currentIndex, updates, isVisible, windowOffset } = state;
      const reRenders = Math.max(0, totalUpdates - 1);
      const headerText = isVisible ? `#${windowOffset + currentIndex} Re-render` : reRenders > 0 ? `\xD7${reRenders}` : "";
      let formattedTime;
      if (reRenders > 0 && currentIndex >= 0 && currentIndex < updates.length) {
        const time = (_b = (_a = updates[currentIndex]) == null ? void 0 : _a.fiberInfo) == null ? void 0 : _b.selfTime;
        formattedTime = time > 0 ? time < 0.1 - Number.EPSILON ? "< 0.1ms" : `${Number(time.toFixed(1))}ms` : void 0;
      }
      refReRenders.current.dataset.text = headerText ? ` \u2022 ${headerText}` : "";
      refTiming.current.dataset.text = formattedTime ? ` \u2022 ${formattedTime}` : "";
    });
  });
  const componentName = useMemo3(() => {
    if (!currentFiber) return null;
    const { name, wrappers, wrapperTypes } = getExtendedDisplayName(currentFiber);
    const title = wrappers.length ? `${wrappers.join("(")}(${name})${")".repeat(wrappers.length)}` : name != null ? name : "";
    const firstWrapperType = wrapperTypes[0];
    return /* @__PURE__ */ jsxs6("span", { title, className: "flex items-center gap-x-1", children: [
      name != null ? name : "Unknown",
      /* @__PURE__ */ jsx7(
        "span",
        {
          title: firstWrapperType == null ? void 0 : firstWrapperType.title,
          className: "flex items-center gap-x-1 text-[10px] text-purple-400",
          children: !!firstWrapperType && /* @__PURE__ */ jsxs6(Fragment4, { children: [
            /* @__PURE__ */ jsx7(
              "span",
              {
                className: cn(
                  "rounded py-[1px] px-1",
                  "truncate",
                  firstWrapperType.compiler && "bg-purple-800 text-neutral-400",
                  !firstWrapperType.compiler && "bg-neutral-700 text-neutral-300",
                  firstWrapperType.type === "memo" && "bg-[#5f3f9a] text-white"
                ),
                children: firstWrapperType.type
              },
              firstWrapperType.type
            ),
            firstWrapperType.compiler && /* @__PURE__ */ jsx7("span", { className: "text-yellow-300", children: "\u2728" })
          ] })
        }
      ),
      wrapperTypes.length > 1 && /* @__PURE__ */ jsxs6("span", { className: "text-[10px] text-neutral-400", children: [
        "\xD7",
        wrapperTypes.length - 1
      ] })
    ] });
  }, [currentFiber]);
  return /* @__PURE__ */ jsxs6("div", { className: headerInspectClassName, children: [
    componentName,
    /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-x-2 mr-auto text-xs text-[#888]", children: [
      /* @__PURE__ */ jsx7(
        "span",
        {
          ref: refReRenders,
          className: "with-data-text cursor-pointer !overflow-visible",
          title: "Click to toggle between rerenders and total renders"
        }
      ),
      /* @__PURE__ */ jsx7("span", { ref: refTiming, className: "with-data-text !overflow-visible" })
    ] })
  ] });
};

// src/web/widget/header.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "preact/jsx-runtime";
var Header = () => {
  const isInitialView = useDelayedValue(Store.inspectState.value.kind === "focused", 150, 0);
  const isCopied = useSignal(false);
  const handleClose = () => {
    signalWidgetViews.value = {
      view: "none"
    };
    Store.inspectState.value = {
      kind: "inspect-off"
    };
  };
  const handleCopy = async () => {
    const state = Store.inspectState.value;
    if (state.kind !== "focused" || !state.focusedDomElement) return;
    const didCopy = await copyFocusedElement(state.focusedDomElement);
    if (!didCopy) return;
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
      handleClose();
    }, COPY_FEEDBACK_DURATION_MS);
  };
  const refHandleCopy = useRef7(handleCopy);
  refHandleCopy.current = handleCopy;
  useEffect8(() => {
    const onKeyDown = (event) => {
      const state = Store.inspectState.value;
      if (state.kind !== "focused" || !state.focusedDomElement) return;
      if (isUserReactGrabActive()) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.shiftKey || event.altKey) return;
      if (event.key !== "c" && event.code !== "KeyC") return;
      if (isInputLikeFocused() || hasNonEmptyTextSelection()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void refHandleCopy.current();
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, []);
  const isHeaderIsNotifications = signalWidgetViews.value.view === "notifications";
  if (isHeaderIsNotifications) {
    return;
  }
  const isFocused = Store.inspectState.value.kind === "focused";
  const copyShortcutLabel = isMac() ? "\u2318C" : "Ctrl+C";
  return /* @__PURE__ */ jsxs7("div", { className: "react-scan-header", children: [
    /* @__PURE__ */ jsx8("div", { className: "relative flex-1 h-full", children: /* @__PURE__ */ jsx8("div", { className: cn("react-scan-header-item is-visible", !isInitialView && "!duration-0"), children: /* @__PURE__ */ jsx8(HeaderInspect, {}) }) }),
    isFocused && /* @__PURE__ */ jsx8(
      "button",
      {
        type: "button",
        title: `Copy element (${copyShortcutLabel})`,
        className: "react-scan-close-button",
        onClick: handleCopy,
        children: /* @__PURE__ */ jsx8(
          Icon,
          {
            name: isCopied.value ? "icon-check" : "icon-copy",
            className: cn(isCopied.value && "text-green-500")
          }
        )
      }
    ),
    /* @__PURE__ */ jsx8("button", { type: "button", title: "Close", className: "react-scan-close-button", onClick: handleClose, children: /* @__PURE__ */ jsx8(Icon, { name: "icon-close" }) })
  ] });
};

// src/web/views/toolbar/index.tsx
import { useSignalEffect as useSignalEffect3 } from "@preact/signals";
import {
  useCallback as useCallback4,
  useEffect as useEffect16,
  useLayoutEffect as useLayoutEffect2,
  useState as useState19
} from "preact/hooks";

// src/web/components/toggle/index.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "preact/jsx-runtime";
var Toggle = ({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsxs8("div", { className: cn("react-scan-toggle", className), children: [
    /* @__PURE__ */ jsx9(
      "input",
      {
        type: "checkbox",
        ...props
      }
    ),
    /* @__PURE__ */ jsx9("div", {})
  ] });
};

// src/web/widget/fps-meter.tsx
import { useEffect as useEffect9, useState as useState9 } from "preact/hooks";
import { Fragment as Fragment5, jsx as jsx10, jsxs as jsxs9 } from "preact/jsx-runtime";
var FpsMeterInner = ({ fps: fps2 }) => {
  const getColor = (fps3) => {
    if (fps3 < 30) return "#EF4444";
    if (fps3 < 50) return "#F59E0B";
    return "rgb(214,132,245)";
  };
  return /* @__PURE__ */ jsxs9(
    "div",
    {
      className: cn(
        "flex items-center gap-x-1 px-2 w-full",
        "h-6",
        "rounded-md",
        "font-mono leading-none",
        "bg-[#141414]",
        "ring-1 ring-white/[0.08]"
      ),
      children: [
        /* @__PURE__ */ jsx10(
          "div",
          {
            style: { color: getColor(fps2) },
            className: "text-sm font-semibold tracking-wide transition-colors ease-in-out w-full flex justify-center items-center",
            children: fps2
          }
        ),
        /* @__PURE__ */ jsx10("span", { className: "text-white/30 text-[11px] font-medium tracking-wide ml-auto min-w-fit", children: "FPS" })
      ]
    }
  );
};
var FPSMeter = () => {
  const [fps2, setFps] = useState9(null);
  useEffect9(() => {
    const intervalId = setInterval(() => {
      setFps(getFPS());
    }, 200);
    return () => clearInterval(intervalId);
  }, []);
  return /* @__PURE__ */ jsx10(
    "div",
    {
      className: cn(
        "flex items-center justify-end gap-x-2 px-1 ml-1 w-[72px]",
        "whitespace-nowrap text-sm text-white"
      ),
      children: fps2 === null ? /* @__PURE__ */ jsx10(Fragment5, { children: "\uFE0F" }) : /* @__PURE__ */ jsx10(FpsMeterInner, { fps: fps2 })
    }
  );
};

// src/web/views/notifications/data.ts
import { createContext } from "preact";
import { useContext } from "preact/hooks";

// src/core/notifications/event-tracking.ts
import { useSyncExternalStore } from "preact/compat";

// src/core/notifications/performance-utils.ts
var THROW_INVARIANTS = false;
var invariantError = (message) => {
  if (THROW_INVARIANTS) {
    throw new Error(message);
  }
};
var iife = (fn) => fn();
var BoundedArray = class _BoundedArray extends Array {
  constructor(capacity = 25) {
    super();
    __publicField(this, "capacity", capacity);
  }
  push(...items) {
    const result = super.push(...items);
    while (this.length > this.capacity) {
      this.shift();
    }
    return result;
  }
  // do not couple capacity with a default param, it must be explicit
  static fromArray(array, capacity) {
    const arr = new _BoundedArray(capacity);
    arr.push(...array);
    return arr;
  }
};

// src/core/notifications/interaction-store.ts
var Store2 = class {
  constructor(initialValue) {
    __publicField(this, "subscribers", /* @__PURE__ */ new Set());
    __publicField(this, "currentValue");
    this.currentValue = initialValue;
  }
  subscribe(subscriber) {
    this.subscribers.add(subscriber);
    subscriber(this.currentValue);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }
  setState(data) {
    this.currentValue = data;
    this.subscribers.forEach((subscriber) => subscriber(data));
  }
  getCurrentState() {
    return this.currentValue;
  }
};
var MAX_INTERACTION_BATCH = 150;
var interactionStore = new Store2(
  new BoundedArray(MAX_INTERACTION_BATCH)
);

// src/core/notifications/performance.ts
import {
  getDisplayName as getDisplayName6,
  getTimings as getTimings4,
  hasMemoCache as hasMemoCache3,
  isHostFiber as isHostFiber2,
  traverseFiber as traverseFiber2
} from "bippy";

// src/core/notifications/performance-store.ts
var MAX_CHANNEL_SIZE = 50;
var PerformanceEntryChannels = class {
  constructor() {
    __publicField(this, "channels", {});
  }
  publish(item, to, createIfNoChannel = true) {
    const existingChannel = this.channels[to];
    if (!existingChannel) {
      if (!createIfNoChannel) {
        return;
      }
      this.channels[to] = {
        callbacks: new BoundedArray(MAX_CHANNEL_SIZE),
        state: new BoundedArray(MAX_CHANNEL_SIZE)
      };
      this.channels[to].state.push(item);
      return;
    }
    existingChannel.state.push(item);
    existingChannel.callbacks.forEach((cb) => cb(item));
  }
  getAvailableChannels() {
    return BoundedArray.fromArray(Object.keys(this.channels), MAX_CHANNEL_SIZE);
  }
  subscribe(to, cb, dropFirst = false) {
    const defer = () => {
      if (!dropFirst) {
        this.channels[to].state.forEach((item) => {
          cb(item);
        });
      }
      return () => {
        const filtered = this.channels[to].callbacks.filter(
          (subscribed) => subscribed !== cb
        );
        this.channels[to].callbacks = BoundedArray.fromArray(
          filtered,
          MAX_CHANNEL_SIZE
        );
      };
    };
    const existing = this.channels[to];
    if (!existing) {
      this.channels[to] = {
        callbacks: new BoundedArray(MAX_CHANNEL_SIZE),
        state: new BoundedArray(MAX_CHANNEL_SIZE)
      };
      this.channels[to].callbacks.push(cb);
      return defer();
    }
    existing.callbacks.push(cb);
    return defer();
  }
  updateChannelState(channel, updater, createIfNoChannel = true) {
    const existingChannel = this.channels[channel];
    if (!existingChannel) {
      if (!createIfNoChannel) {
        return;
      }
      const state = new BoundedArray(MAX_CHANNEL_SIZE);
      const newChannel = {
        callbacks: new BoundedArray(MAX_CHANNEL_SIZE),
        state
      };
      this.channels[channel] = newChannel;
      newChannel.state = updater(state);
      return;
    }
    existingChannel.state = updater(existingChannel.state);
  }
  getChannelState(channel) {
    var _a;
    return (_a = this.channels[channel].state) != null ? _a : new BoundedArray(MAX_CHANNEL_SIZE);
  }
};
var performanceEntryChannels = new PerformanceEntryChannels();

// src/core/notifications/performance.ts
var DEFAULT_PATH_FILTERS = {
  skipProviders: true,
  skipHocs: true,
  skipContainers: true,
  skipMinified: true,
  skipUtilities: true,
  skipBoundaries: true
};
var PATH_FILTER_PATTERNS = {
  providers: [/Provider$/, /^Provider$/, /^Context$/],
  hocs: [/^with[A-Z]/, /^forward(?:Ref)?$/i, /^Forward(?:Ref)?\(/],
  containers: [/^(?:App)?Container$/, /^Root$/, /^ReactDev/],
  utilities: [
    /^Fragment$/,
    /^Suspense$/,
    /^ErrorBoundary$/,
    /^Portal$/,
    /^Consumer$/,
    /^Layout$/,
    /^Router/,
    /^Hydration/
  ],
  boundaries: [/^Boundary$/, /Boundary$/, /^Provider$/, /Provider$/]
};
var shouldIncludeInPath = (name, filters = DEFAULT_PATH_FILTERS) => {
  const patternsToCheck = [];
  if (filters.skipProviders) patternsToCheck.push(...PATH_FILTER_PATTERNS.providers);
  if (filters.skipHocs) patternsToCheck.push(...PATH_FILTER_PATTERNS.hocs);
  if (filters.skipContainers) patternsToCheck.push(...PATH_FILTER_PATTERNS.containers);
  if (filters.skipUtilities) patternsToCheck.push(...PATH_FILTER_PATTERNS.utilities);
  if (filters.skipBoundaries) patternsToCheck.push(...PATH_FILTER_PATTERNS.boundaries);
  return !patternsToCheck.some((pattern) => pattern.test(name));
};
var minifiedPatterns = [
  /^[a-z]$/,
  /^[a-z][0-9]$/,
  /^_+$/,
  /^[A-Za-z][_$]$/,
  /^[a-z]{1,2}$/
];
var isMinified = (name) => {
  var _a, _b;
  for (let i = 0; i < minifiedPatterns.length; i++) {
    if (minifiedPatterns[i].test(name)) return true;
  }
  const hasNoVowels = !/[aeiou]/i.test(name);
  const hasMostlyNumbers = ((_b = (_a = name.match(/\d/g)) == null ? void 0 : _a.length) != null ? _b : 0) > name.length / 2;
  const isSingleWordLowerCase = /^[a-z]+$/.test(name);
  const hasRandomLookingChars = /[$_]{2,}/.test(name);
  return Number(hasNoVowels) + Number(hasMostlyNumbers) + Number(isSingleWordLowerCase) + Number(hasRandomLookingChars) >= 2;
};
var getCleanComponentName = (component) => {
  const name = getDisplayName6(component);
  if (!name) return "";
  return name.replace(
    /^(?:Memo|Forward(?:Ref)?|With.*?)\((?<inner>.*?)\)$/,
    "$<inner>"
  );
};
var getInteractionPath = (initialFiber, filters = DEFAULT_PATH_FILTERS) => {
  if (!initialFiber) return [];
  const currentName = getDisplayName6(initialFiber.type);
  if (!currentName) return [];
  const stack = new Array();
  let fiber = initialFiber;
  while (fiber.return) {
    const name = getCleanComponentName(fiber.type);
    if (name && !isMinified(name) && shouldIncludeInPath(name, filters) && name.toLowerCase() !== name) {
      stack.push(name);
    }
    fiber = fiber.return;
  }
  const fullPath = new Array(stack.length);
  for (let i = 0; i < stack.length; i++) {
    fullPath[i] = stack[stack.length - i - 1];
  }
  return fullPath;
};
var getFirstNameFromAncestor = (fiber, accept = () => true) => {
  let curr = fiber;
  while (curr) {
    const currName = getDisplayName6(curr.type);
    if (currName && accept(currName)) {
      return currName;
    }
    curr = curr.return;
  }
  return null;
};
var unsubscribeTrackVisibilityChange;
var lastVisibilityHiddenAt = "never-hidden";
var trackVisibilityChange = () => {
  unsubscribeTrackVisibilityChange == null ? void 0 : unsubscribeTrackVisibilityChange();
  const onVisibilityChange = () => {
    if (document.hidden) {
      lastVisibilityHiddenAt = Date.now();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  unsubscribeTrackVisibilityChange = () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
var getInteractionType = (eventName) => {
  if (["pointerup", "click"].includes(eventName)) {
    return "pointer";
  }
  if (eventName.includes("key")) {
  }
  if (["keydown", "keyup"].includes(eventName)) {
    return "keyboard";
  }
  return null;
};
var onEntryAnimationId = null;
var setupPerformanceListener = (onEntry) => {
  trackVisibilityChange();
  const interactionMap = /* @__PURE__ */ new Map();
  const interactionTargetMap = /* @__PURE__ */ new Map();
  const processInteractionEntry = (entry) => {
    if (!entry.interactionId) return;
    if (entry.interactionId && entry.target && !interactionTargetMap.has(entry.interactionId)) {
      interactionTargetMap.set(entry.interactionId, entry.target);
    }
    if (entry.target) {
      let current = entry.target;
      while (current) {
        if (current.id === "react-scan-toolbar-root" || current.id === "react-scan-root") {
          return;
        }
        current = current.parentElement;
      }
    }
    const existingInteraction = interactionMap.get(entry.interactionId);
    if (existingInteraction) {
      if (entry.duration > existingInteraction.latency) {
        existingInteraction.entries = [entry];
        existingInteraction.latency = entry.duration;
      } else if (entry.duration === existingInteraction.latency && entry.startTime === existingInteraction.entries[0].startTime) {
        existingInteraction.entries.push(entry);
      }
    } else {
      const interactionType = getInteractionType(entry.name);
      if (!interactionType) {
        return;
      }
      const interaction = {
        id: entry.interactionId,
        latency: entry.duration,
        entries: [entry],
        target: entry.target,
        type: interactionType,
        startTime: entry.startTime,
        endTime: Date.now(),
        processingStart: entry.processingStart,
        processingEnd: entry.processingEnd,
        duration: entry.duration,
        inputDelay: entry.processingStart - entry.startTime,
        processingDuration: entry.processingEnd - entry.processingStart,
        presentationDelay: entry.duration - (entry.processingEnd - entry.startTime),
        // componentPath:
        timestamp: Date.now(),
        timeSinceTabInactive: lastVisibilityHiddenAt === "never-hidden" ? "never-hidden" : Date.now() - lastVisibilityHiddenAt,
        visibilityState: document.visibilityState,
        timeOrigin: performance.timeOrigin,
        referrer: document.referrer
      };
      interactionMap.set(interaction.id, interaction);
      if (!onEntryAnimationId) {
        onEntryAnimationId = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onEntry(interactionMap.get(interaction.id));
            onEntryAnimationId = null;
          });
        });
      }
    }
  };
  const po = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    for (let i = 0, len = entries.length; i < len; i++) {
      const entry = entries[i];
      processInteractionEntry(entry);
    }
  });
  try {
    po.observe({
      type: "event",
      buffered: true,
      durationThreshold: 16
    });
    po.observe({
      type: "first-input",
      buffered: true
    });
  } catch {
  }
  return () => po.disconnect();
};
var setupPerformancePublisher = () => {
  return setupPerformanceListener((entry) => {
    performanceEntryChannels.publish(
      {
        kind: "entry-received",
        entry
      },
      "recording"
    );
  });
};
var MAX_INTERACTION_TASKS = 25;
var tasks = new BoundedArray(MAX_INTERACTION_TASKS);
var getAssociatedDetailedTimingInteraction = (entry, activeTasks) => {
  let closestTask = null;
  for (const task of activeTasks) {
    if (task.type !== entry.type) {
      continue;
    }
    if (closestTask === null) {
      closestTask = task;
      continue;
    }
    const getAbsoluteDiff = (task2, entry2) => Math.abs(task2.startDateTime) - (entry2.startTime + entry2.timeOrigin);
    if (getAbsoluteDiff(task, entry) < getAbsoluteDiff(closestTask, entry)) {
      closestTask = task;
    }
  }
  return closestTask;
};
var listenForPerformanceEntryInteractions = (onComplete) => {
  const unsubscribe = performanceEntryChannels.subscribe(
    "recording",
    (event) => {
      const associatedDetailedInteraction = event.kind === "auto-complete-race" ? tasks.find((task) => task.interactionUUID === event.interactionUUID) : getAssociatedDetailedTimingInteraction(event.entry, tasks);
      if (!associatedDetailedInteraction) {
        return;
      }
      const completedInteraction = associatedDetailedInteraction.completeInteraction(event);
      onComplete(completedInteraction);
    }
  );
  return unsubscribe;
};
var trackDetailedTiming = ({
  onMicroTask,
  onRAF,
  onTimeout,
  abort
}) => {
  queueMicrotask(() => {
    if ((abort == null ? void 0 : abort()) === true) {
      return;
    }
    if (!onMicroTask()) {
      return;
    }
    requestAnimationFrame(() => {
      if ((abort == null ? void 0 : abort()) === true) {
        return;
      }
      if (!onRAF()) {
        return;
      }
      setTimeout(() => {
        if ((abort == null ? void 0 : abort()) === true) {
          return;
        }
        onTimeout();
      }, 0);
    });
  });
};
var getTargetInteractionDetails = (target) => {
  var _a;
  const associatedFiber = getFiberFromElement(target);
  if (!associatedFiber) {
    return;
  }
  let componentName = associatedFiber ? getDisplayName6(associatedFiber == null ? void 0 : associatedFiber.type) : "N/A";
  if (!componentName) {
    componentName = (_a = getFirstNameFromAncestor(associatedFiber, (name) => name.length > 2)) != null ? _a : "N/A";
  }
  if (!componentName) {
    return;
  }
  const componentPath = getInteractionPath(associatedFiber);
  return {
    componentPath,
    childrenTree: {},
    componentName,
    elementFiber: associatedFiber
  };
};
var setupDetailedPointerTimingListener = (kind, options) => {
  let instrumentationIdInControl = null;
  const getEvent = (info) => {
    switch (kind) {
      case "pointer": {
        if (info.phase === "start") {
          return "pointerup";
        }
        if (info.target instanceof HTMLInputElement || info.target instanceof HTMLSelectElement) {
          return "change";
        }
        return "click";
      }
      case "keyboard": {
        if (info.phase === "start") {
          return "keydown";
        }
        return "change";
      }
    }
  };
  const lastInteractionRef = {
    current: {
      kind: "uninitialized-stage",
      interactionUUID: not_globally_unique_generateId(),
      // the first interaction uses this
      stageStart: Date.now(),
      interactionType: kind
    }
  };
  const onInteractionStart = (e) => {
    var _a, _b;
    const path = e.composedPath();
    if (path.some(
      (el) => el instanceof Element && el.id === "react-scan-toolbar-root"
    )) {
      return;
    }
    if (Date.now() - lastInteractionRef.current.stageStart > 2e3) {
      lastInteractionRef.current = {
        kind: "uninitialized-stage",
        interactionUUID: not_globally_unique_generateId(),
        stageStart: Date.now(),
        interactionType: kind
      };
    }
    if (lastInteractionRef.current.kind !== "uninitialized-stage") {
      return;
    }
    const pointerUpStart = performance.now();
    (_a = options == null ? void 0 : options.onStart) == null ? void 0 : _a.call(options, lastInteractionRef.current.interactionUUID);
    const details = getTargetInteractionDetails(e.target);
    if (!details) {
      (_b = options == null ? void 0 : options.onError) == null ? void 0 : _b.call(options, lastInteractionRef.current.interactionUUID);
      return;
    }
    const fiberRenders = {};
    const stopListeningForRenders = listenForRenders(fiberRenders);
    lastInteractionRef.current = {
      ...lastInteractionRef.current,
      interactionType: kind,
      blockingTimeStart: Date.now(),
      childrenTree: details.childrenTree,
      componentName: details.componentName,
      componentPath: details.componentPath,
      fiberRenders,
      kind: "interaction-start",
      interactionStartDetail: pointerUpStart,
      stopListeningForRenders
    };
    const event = getEvent({ phase: "end", target: e.target });
    document.addEventListener(event, onLastJS, {
      once: true
    });
    requestAnimationFrame(() => {
      document.removeEventListener(event, onLastJS);
    });
  };
  document.addEventListener(
    getEvent({ phase: "start" }),
    // oxlint-disable-next-line typescript/no-explicit-any
    onInteractionStart,
    {
      capture: true
    }
  );
  const onLastJS = (e, instrumentationId, abort) => {
    var _a;
    if (lastInteractionRef.current.kind !== "interaction-start" && instrumentationId === instrumentationIdInControl) {
      if (kind === "pointer" && e.target instanceof HTMLSelectElement) {
        lastInteractionRef.current = {
          kind: "uninitialized-stage",
          interactionUUID: not_globally_unique_generateId(),
          stageStart: Date.now(),
          interactionType: kind
        };
        return;
      }
      (_a = options == null ? void 0 : options.onError) == null ? void 0 : _a.call(options, lastInteractionRef.current.interactionUUID);
      lastInteractionRef.current = {
        kind: "uninitialized-stage",
        interactionUUID: not_globally_unique_generateId(),
        stageStart: Date.now(),
        interactionType: kind
      };
      invariantError("pointer -> click");
      return;
    }
    instrumentationIdInControl = instrumentationId;
    trackDetailedTiming({
      abort,
      onMicroTask: () => {
        if (lastInteractionRef.current.kind === "uninitialized-stage") {
          return false;
        }
        lastInteractionRef.current = {
          ...lastInteractionRef.current,
          kind: "js-end-stage",
          jsEndDetail: performance.now()
        };
        return true;
      },
      onRAF: () => {
        var _a2;
        if (lastInteractionRef.current.kind !== "js-end-stage" && lastInteractionRef.current.kind !== "raf-stage") {
          (_a2 = options == null ? void 0 : options.onError) == null ? void 0 : _a2.call(options, lastInteractionRef.current.interactionUUID);
          invariantError("bad transition to raf");
          lastInteractionRef.current = {
            kind: "uninitialized-stage",
            interactionUUID: not_globally_unique_generateId(),
            stageStart: Date.now(),
            interactionType: kind
          };
          return false;
        }
        lastInteractionRef.current = {
          ...lastInteractionRef.current,
          kind: "raf-stage",
          rafStart: performance.now()
        };
        return true;
      },
      onTimeout: () => {
        var _a2;
        if (lastInteractionRef.current.kind !== "raf-stage") {
          (_a2 = options == null ? void 0 : options.onError) == null ? void 0 : _a2.call(options, lastInteractionRef.current.interactionUUID);
          lastInteractionRef.current = {
            kind: "uninitialized-stage",
            interactionUUID: not_globally_unique_generateId(),
            stageStart: Date.now(),
            interactionType: kind
          };
          invariantError("raf->timeout");
          return;
        }
        const now = Date.now();
        const timeoutStage = Object.freeze({
          ...lastInteractionRef.current,
          kind: "timeout-stage",
          blockingTimeEnd: now,
          commitEnd: performance.now()
        });
        lastInteractionRef.current = {
          kind: "uninitialized-stage",
          interactionUUID: not_globally_unique_generateId(),
          stageStart: now,
          interactionType: kind
        };
        let completed = false;
        const completeInteraction = (event) => {
          var _a3;
          completed = true;
          const latency = event.kind === "auto-complete-race" ? event.detailedTiming.commitEnd - event.detailedTiming.interactionStartDetail : event.entry.latency;
          const finalInteraction = {
            detailedTiming: timeoutStage,
            latency,
            completedAt: Date.now(),
            flushNeeded: true
          };
          (_a3 = options == null ? void 0 : options.onComplete) == null ? void 0 : _a3.call(
            options,
            timeoutStage.interactionUUID,
            finalInteraction,
            event
          );
          const newTasks = tasks.filter(
            (task2) => task2.interactionUUID !== timeoutStage.interactionUUID
          );
          tasks = BoundedArray.fromArray(newTasks, MAX_INTERACTION_TASKS);
          return finalInteraction;
        };
        const task = {
          completeInteraction,
          endDateTime: Date.now(),
          startDateTime: timeoutStage.blockingTimeStart,
          type: kind,
          interactionUUID: timeoutStage.interactionUUID
        };
        tasks.push(task);
        if (!isPerformanceEventAvailable()) {
          const newTasks = tasks.filter(
            (task2) => task2.interactionUUID !== timeoutStage.interactionUUID
          );
          tasks = BoundedArray.fromArray(newTasks, MAX_INTERACTION_TASKS);
          completeInteraction({
            kind: "auto-complete-race",
            // redundant
            detailedTiming: timeoutStage,
            interactionUUID: timeoutStage.interactionUUID
          });
        } else {
          setTimeout(() => {
            if (completed) {
              return;
            }
            completeInteraction({
              kind: "auto-complete-race",
              // redundant
              detailedTiming: timeoutStage,
              interactionUUID: timeoutStage.interactionUUID
            });
            const newTasks = tasks.filter(
              (task2) => task2.interactionUUID !== timeoutStage.interactionUUID
            );
            tasks = BoundedArray.fromArray(newTasks, MAX_INTERACTION_TASKS);
          }, 1e3);
        }
      }
    });
  };
  const onKeyPress = (e) => {
    const id = not_globally_unique_generateId();
    onLastJS(e, id, () => id !== instrumentationIdInControl);
  };
  if (kind === "keyboard") {
    document.addEventListener("keypress", onKeyPress);
  }
  return () => {
    document.removeEventListener(
      getEvent({ phase: "start" }),
      // oxlint-disable-next-line typescript/no-explicit-any
      onInteractionStart,
      {
        capture: true
      }
    );
    document.removeEventListener("keypress", onKeyPress);
  };
};
var getHostFromFiber = (fiber) => {
  var _a;
  return (_a = traverseFiber2(fiber, (node) => {
    if (isHostFiber2(node)) {
      return true;
    }
  })) == null ? void 0 : _a.stateNode;
};
var isPerformanceEventAvailable = () => {
  return "PerformanceEventTiming" in globalThis;
};
var listenForRenders = (fiberRenders) => {
  const listener = (fiber) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const displayName = getDisplayName6(fiber.type);
    if (!displayName) {
      return;
    }
    const existing = fiberRenders[displayName];
    if (!existing) {
      const parents = /* @__PURE__ */ new Set();
      const res = fiber.return && getParentCompositeFiber(fiber.return);
      const parentCompositeName = res && getDisplayName6(res[0]);
      if (parentCompositeName) {
        parents.add(parentCompositeName);
      }
      const { selfTime: selfTime2, totalTime: totalTime2 } = getTimings4(fiber);
      const newChanges2 = collectInspectorDataWithoutCounts(fiber);
      const emptySection2 = {
        current: [],
        changes: /* @__PURE__ */ new Set(),
        changesCounts: /* @__PURE__ */ new Map()
      };
      const changes = {
        fiberProps: newChanges2.fiberProps || emptySection2,
        fiberState: newChanges2.fiberState || emptySection2,
        fiberContext: newChanges2.fiberContext || emptySection2
      };
      fiberRenders[displayName] = {
        renderCount: 1,
        hasMemoCache: hasMemoCache3(fiber),
        wasFiberRenderMount: wasFiberRenderMount(fiber),
        parents,
        selfTime: selfTime2,
        totalTime: totalTime2,
        nodeInfo: [
          {
            element: getHostFromFiber(fiber),
            name: (_a = getDisplayName6(fiber.type)) != null ? _a : "Unknown",
            selfTime: getTimings4(fiber).selfTime
          }
        ],
        changes
      };
      return;
    }
    const parentType = (_c = (_b = getParentCompositeFiber(fiber)) == null ? void 0 : _b[0]) == null ? void 0 : _c.type;
    if (parentType) {
      const res = fiber.return && getParentCompositeFiber(fiber.return);
      const parentCompositeName = res && getDisplayName6(res[0]);
      if (parentCompositeName) {
        existing.parents.add(parentCompositeName);
      }
    }
    const { selfTime, totalTime } = getTimings4(fiber);
    const newChanges = collectInspectorDataWithoutCounts(fiber);
    if (!newChanges) return;
    const emptySection = {
      current: [],
      changes: /* @__PURE__ */ new Set(),
      changesCounts: /* @__PURE__ */ new Map()
    };
    existing.wasFiberRenderMount = existing.wasFiberRenderMount || wasFiberRenderMount(fiber);
    existing.hasMemoCache = existing.hasMemoCache || hasMemoCache3(fiber);
    existing.changes = {
      fiberProps: mergeSectionData(
        ((_d = existing.changes) == null ? void 0 : _d.fiberProps) || emptySection,
        newChanges.fiberProps || emptySection
      ),
      fiberState: mergeSectionData(
        ((_e = existing.changes) == null ? void 0 : _e.fiberState) || emptySection,
        newChanges.fiberState || emptySection
      ),
      fiberContext: mergeSectionData(
        ((_f = existing.changes) == null ? void 0 : _f.fiberContext) || emptySection,
        newChanges.fiberContext || emptySection
      )
    };
    existing.renderCount += 1;
    existing.selfTime += selfTime;
    existing.totalTime += totalTime;
    existing.nodeInfo.push({
      element: getHostFromFiber(fiber),
      name: (_g = getDisplayName6(fiber.type)) != null ? _g : "Unknown",
      selfTime: getTimings4(fiber).selfTime
    });
  };
  Store.interactionListeningForRenders = listener;
  return () => {
    if (Store.interactionListeningForRenders === listener) {
      Store.interactionListeningForRenders = null;
    }
  };
};
var mergeSectionData = (existing, newData) => {
  const mergedSection = {
    current: [...existing.current],
    changes: /* @__PURE__ */ new Set(),
    changesCounts: /* @__PURE__ */ new Map()
  };
  for (const value of newData.current) {
    if (!mergedSection.current.some((item) => item.name === value.name)) {
      mergedSection.current.push(value);
    }
  }
  for (const change of newData.changes) {
    if (typeof change === "string" || typeof change === "number") {
      mergedSection.changes.add(change);
      const existingCount = existing.changesCounts.get(change) || 0;
      const newCount = newData.changesCounts.get(change) || 0;
      mergedSection.changesCounts.set(change, existingCount + newCount);
    }
  }
  return mergedSection;
};
var wasFiberRenderMount = (fiber) => {
  if (!fiber.alternate) {
    return true;
  }
  const prevFiber = fiber.alternate;
  const wasMounted = prevFiber && prevFiber.memoizedState != null && prevFiber.memoizedState.element != null && prevFiber.memoizedState.isDehydrated !== true;
  const isMounted = fiber.memoizedState != null && fiber.memoizedState.element != null && fiber.memoizedState.isDehydrated !== true;
  return !wasMounted && isMounted;
};

// src/web/utils/create-store.ts
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (selectorOrListener, listener) => {
    let selector;
    let actualListener;
    if (listener) {
      selector = selectorOrListener;
      actualListener = listener;
    } else {
      actualListener = selectorOrListener;
    }
    let currentSlice = selector ? selector(state) : void 0;
    const wrappedListener = (newState, previousState) => {
      if (selector) {
        const nextSlice = selector(newState);
        const prevSlice = selector(previousState);
        if (!Object.is(currentSlice, nextSlice)) {
          currentSlice = nextSlice;
          actualListener(nextSlice, prevSlice);
        }
      } else {
        actualListener(newState, previousState);
      }
    };
    listeners.add(wrappedListener);
    return () => listeners.delete(wrappedListener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);

// src/core/notifications/event-tracking.ts
var accumulatedFiberRendersOverTask = null;
var debugEventStore = createStore()((set) => ({
  state: {
    events: []
  },
  actions: {
    addEvent: (event) => {
      set((store) => ({
        state: {
          events: [...store.state.events, event]
        }
      }));
    },
    clear: () => {
      set({
        state: {
          events: []
        }
      });
    }
  }
}));
var EVENT_STORE_CAPACITY = 200;
var toolbarEventStore = createStore()(
  (set, get) => {
    const listeners = /* @__PURE__ */ new Set();
    return {
      state: {
        events: new BoundedArray(EVENT_STORE_CAPACITY)
      },
      actions: {
        addEvent: (event) => {
          listeners.forEach((listener) => listener(event));
          const events = [...get().state.events, event];
          const applyOverlapCheckToLongRenderEvent = (longRenderEvent, onOverlap) => {
            const overlapsWith = events.find((event2) => {
              if (event2.kind === "long-render") {
                return;
              }
              if (event2.id === longRenderEvent.id) {
                return;
              }
              if (longRenderEvent.data.startAt <= event2.data.startAt && longRenderEvent.data.endAt <= event2.data.endAt && longRenderEvent.data.endAt >= event2.data.startAt) {
                return true;
              }
              if (event2.data.startAt <= longRenderEvent.data.startAt && event2.data.endAt >= longRenderEvent.data.startAt) {
                return true;
              }
              if (longRenderEvent.data.startAt <= event2.data.startAt && longRenderEvent.data.endAt >= event2.data.endAt) {
                return true;
              }
            });
            if (overlapsWith) {
              onOverlap(overlapsWith);
            }
          };
          const toRemove = /* @__PURE__ */ new Set();
          events.forEach((event2) => {
            if (event2.kind === "interaction") return;
            applyOverlapCheckToLongRenderEvent(event2, () => {
              toRemove.add(event2.id);
            });
          });
          const withRemovedEvents = events.filter(
            (event2) => !toRemove.has(event2.id)
          );
          set(() => ({
            state: {
              events: BoundedArray.fromArray(
                withRemovedEvents,
                EVENT_STORE_CAPACITY
              )
            }
          }));
        },
        addListener: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        clear: () => {
          set({
            state: {
              events: new BoundedArray(EVENT_STORE_CAPACITY)
            }
          });
        }
      }
    };
  }
);
var useToolbarEventLog = () => {
  return useSyncExternalStore(
    toolbarEventStore.subscribe,
    toolbarEventStore.getState
  );
};
var taskDirtyAt = null;
var taskDirtyOrigin = null;
var previousTrackCurrentMouseOverElementCallback = null;
var overToolbar;
var trackCurrentMouseOverToolbar = () => {
  const callback = (e) => {
    overToolbar = e.composedPath().map((path) => path.id).filter(Boolean).includes("react-scan-toolbar");
  };
  document.addEventListener("mouseover", callback);
  previousTrackCurrentMouseOverElementCallback = callback;
  return () => {
    if (previousTrackCurrentMouseOverElementCallback) {
      document.removeEventListener(
        "mouseover",
        previousTrackCurrentMouseOverElementCallback
      );
    }
  };
};
var startDirtyTaskTracking = () => {
  const onVisibilityChange = () => {
    taskDirtyAt = performance.now();
    taskDirtyOrigin = performance.timeOrigin;
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
var HIGH_SEVERITY_FPS_DROP_TIME = 150;
var framesDrawnInTheLastSecond = [];
function startLongPipelineTracking() {
  let rafHandle;
  let timeoutHandle;
  function measure() {
    let unSub = null;
    accumulatedFiberRendersOverTask = null;
    accumulatedFiberRendersOverTask = {};
    unSub = listenForRenders(accumulatedFiberRendersOverTask);
    const startOrigin = performance.timeOrigin;
    const startTime = performance.now();
    rafHandle = requestAnimationFrame(() => {
      timeoutHandle = setTimeout(() => {
        const endNow = performance.now();
        const duration = endNow - startTime;
        const endOrigin = performance.timeOrigin;
        framesDrawnInTheLastSecond.push(endNow + endOrigin);
        const framesInTheLastSecond = framesDrawnInTheLastSecond.filter(
          (frameAt) => endNow + endOrigin - frameAt <= 1e3
        );
        const fps2 = framesInTheLastSecond.length;
        framesDrawnInTheLastSecond = framesInTheLastSecond;
        const taskConsideredDirty = taskDirtyAt !== null && taskDirtyOrigin !== null ? endNow + endOrigin - (taskDirtyOrigin + taskDirtyAt) < 100 : null;
        const wasTaskInfluencedByToolbar = overToolbar !== null && overToolbar;
        if (duration > HIGH_SEVERITY_FPS_DROP_TIME && !taskConsideredDirty && document.visibilityState === "visible" && !wasTaskInfluencedByToolbar) {
          const endAt = endOrigin + endNow;
          const startAt = startTime + startOrigin;
          toolbarEventStore.getState().actions.addEvent({
            kind: "long-render",
            id: not_globally_unique_generateId(),
            data: {
              endAt,
              startAt,
              meta: {
                // oxlint-disable-next-line typescript/no-non-null-assertion
                fiberRenders: accumulatedFiberRendersOverTask,
                latency: duration,
                fps: fps2
              }
            }
          });
        }
        taskDirtyAt = null;
        taskDirtyOrigin = null;
        unSub == null ? void 0 : unSub();
        measure();
      }, 0);
    });
    return unSub;
  }
  const measureUnSub = measure();
  return () => {
    measureUnSub();
    cancelAnimationFrame(rafHandle);
    clearTimeout(timeoutHandle);
  };
}
var startTimingTracking = () => {
  const unSubPerformance = setupPerformancePublisher();
  const unSubMouseOver = trackCurrentMouseOverToolbar();
  const unSubDirtyTaskTracking = startDirtyTaskTracking();
  const unSubLongPipelineTracking = startLongPipelineTracking();
  const onComplete = async (_, finalInteraction, event) => {
    toolbarEventStore.getState().actions.addEvent({
      kind: "interaction",
      id: not_globally_unique_generateId(),
      data: {
        startAt: finalInteraction.detailedTiming.blockingTimeStart,
        endAt: performance.now() + performance.timeOrigin,
        meta: { ...finalInteraction, kind: event.kind }
        // TODO, will need interaction specific metadata here
      }
    });
    const existingCompletedInteractions = performanceEntryChannels.getChannelState("recording");
    finalInteraction.detailedTiming.stopListeningForRenders();
    if (existingCompletedInteractions.length) {
      performanceEntryChannels.updateChannelState(
        "recording",
        () => new BoundedArray(MAX_CHANNEL_SIZE)
      );
    }
  };
  const unSubDetailedPointerTiming = setupDetailedPointerTimingListener(
    "pointer",
    {
      onComplete
    }
  );
  const unSubDetailedKeyboardTiming = setupDetailedPointerTimingListener(
    "keyboard",
    {
      onComplete
    }
  );
  const unSubInteractions = listenForPerformanceEntryInteractions(
    (completedInteraction) => {
      interactionStore.setState(
        BoundedArray.fromArray(
          interactionStore.getCurrentState().concat(completedInteraction),
          MAX_INTERACTION_BATCH
        )
      );
    }
  );
  return () => {
    unSubMouseOver();
    unSubDirtyTaskTracking();
    unSubLongPipelineTracking();
    unSubPerformance();
    unSubDetailedPointerTiming();
    unSubInteractions();
    unSubDetailedKeyboardTiming();
  };
};

// src/web/views/notifications/data.ts
var getComponentName = (path) => {
  var _a;
  const filteredPath = path.filter((item) => item.length > 2);
  if (filteredPath.length === 0) {
    return (_a = path.at(-1)) != null ? _a : "Unknown";
  }
  return filteredPath.at(-1);
};
var getTotalTime = (timing) => {
  switch (timing.kind) {
    case "interaction": {
      const {
        renderTime,
        otherJSTime,
        framePreparation,
        frameConstruction,
        frameDraw
      } = timing;
      return renderTime + otherJSTime + framePreparation + frameConstruction + (frameDraw != null ? frameDraw : 0);
    }
    case "dropped-frames": {
      return timing.otherTime + timing.renderTime;
    }
  }
};
var isRenderMemoizable = (groupedFiberRender) => {
  if (groupedFiberRender.wasFiberRenderMount) {
    return false;
  }
  if (groupedFiberRender.hasMemoCache) {
    return false;
  }
  return groupedFiberRender.changes.context.length === 0 && groupedFiberRender.changes.props.length === 0 && groupedFiberRender.changes.state.length === 0;
};
var getEventSeverity = (event) => {
  const totalTime = getTotalTime(event.timing);
  switch (event.kind) {
    case "interaction": {
      if (totalTime < 200) return "low";
      if (totalTime < 500) return "needs-improvement";
      return "high";
    }
    case "dropped-frames": {
      if (totalTime < 50) return "low";
      if (totalTime < HIGH_SEVERITY_FPS_DROP_TIME) return "needs-improvement";
      return "high";
    }
  }
};
var useNotificationsContext = () => useContext(NotificationStateContext);
var NotificationStateContext = createContext(null);

// src/web/views/notifications/icons.tsx
import { jsx as jsx11, jsxs as jsxs10 } from "preact/jsx-runtime";
var ChevronRight = ({
  size = 24,
  className
}) => /* @__PURE__ */ jsx11(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: cn(["lucide lucide-chevron-right", className]),
    children: /* @__PURE__ */ jsx11("path", { d: "m9 18 6-6-6-6" })
  }
);
var Notification = ({
  className = "",
  size = 24,
  events = []
}) => {
  const hasHighSeverity = events.includes(true);
  const totalSevere = events.filter((e) => e).length;
  const displayCount = totalSevere > 99 ? ">99" : totalSevere;
  const badgeSize = hasHighSeverity ? Math.max(size * 0.6, 14) : Math.max(size * 0.4, 6);
  return /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs10(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        className: `lucide lucide-bell ${className}`,
        children: [
          /* @__PURE__ */ jsx11("path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }),
          /* @__PURE__ */ jsx11("path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" })
        ]
      }
    ),
    events.length > 0 && totalSevere > 0 && ReactScanInternals.options.value.showNotificationCount && /* @__PURE__ */ jsx11(
      "div",
      {
        className: cn([
          "absolute",
          hasHighSeverity ? "-top-2.5 -right-2.5" : "-top-1 -right-1",
          "rounded-full",
          "flex items-center justify-center",
          "text-[8px] font-medium text-white",
          "aspect-square",
          hasHighSeverity ? "bg-red-500/90" : "bg-purple-500/90"
        ]),
        style: {
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
          padding: hasHighSeverity ? "0.5px" : "0"
        },
        children: hasHighSeverity && displayCount
      }
    )
  ] });
};
var CloseIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("path", { d: "M18 6 6 18" }),
      /* @__PURE__ */ jsx11("path", { d: "m6 6 12 12" })
    ]
  }
);
var VolumeOnIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" }),
      /* @__PURE__ */ jsx11("path", { d: "M16 9a5 5 0 0 1 0 6" }),
      /* @__PURE__ */ jsx11("path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728" })
    ]
  }
);
var VolumeOffIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("path", { d: "M16 9a5 5 0 0 1 .95 2.293" }),
      /* @__PURE__ */ jsx11("path", { d: "M19.364 5.636a9 9 0 0 1 1.889 9.96" }),
      /* @__PURE__ */ jsx11("path", { d: "m2 2 20 20" }),
      /* @__PURE__ */ jsx11("path", { d: "m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" }),
      /* @__PURE__ */ jsx11("path", { d: "M9.828 4.172A.686.686 0 0 1 11 4.657v.686" })
    ]
  }
);
var ArrowLeft = ({
  size = 24,
  className
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className: cn(["lucide lucide-arrow-left", className]),
    children: [
      /* @__PURE__ */ jsx11("path", { d: "m12 19-7-7 7-7" }),
      /* @__PURE__ */ jsx11("path", { d: "M19 12H5" })
    ]
  }
);
var PointerIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("path", { d: "M14 4.1 12 6" }),
      /* @__PURE__ */ jsx11("path", { d: "m5.1 8-2.9-.8" }),
      /* @__PURE__ */ jsx11("path", { d: "m6 12-1.9 2" }),
      /* @__PURE__ */ jsx11("path", { d: "M7.2 2.2 8 5.1" }),
      /* @__PURE__ */ jsx11("path", { d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" })
    ]
  }
);
var KeyboardIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("path", { d: "M10 8h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M12 12h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M14 8h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M16 12h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M18 8h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M6 8h.01" }),
      /* @__PURE__ */ jsx11("path", { d: "M7 16h10" }),
      /* @__PURE__ */ jsx11("path", { d: "M8 12h.01" }),
      /* @__PURE__ */ jsx11("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" })
    ]
  }
);
var ClearIcon = ({
  className = "",
  size = 24
}) => {
  return /* @__PURE__ */ jsxs10(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      className,
      style: { transform: "rotate(180deg)" },
      children: [
        /* @__PURE__ */ jsx11("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx11("path", { d: "m4.9 4.9 14.2 14.2" })
      ]
    }
  );
};
var TrendingDownIcon = ({
  className = "",
  size = 24
}) => /* @__PURE__ */ jsxs10(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    children: [
      /* @__PURE__ */ jsx11("polyline", { points: "22 17 13.5 8.5 8.5 13.5 2 7" }),
      /* @__PURE__ */ jsx11("polyline", { points: "16 17 22 17 22 11" })
    ]
  }
);

// src/web/views/notifications/notifications.tsx
import { forwardRef as forwardRef2 } from "preact/compat";
import { useEffect as useEffect15, useRef as useRef13, useState as useState18 } from "preact/hooks";

// src/web/views/notifications/details-routes.tsx
import { useEffect as useEffect12, useRef as useRef10, useState as useState15 } from "preact/compat";

// src/web/views/notifications/popover.tsx
import {
  createPortal,
  useContext as useContext2,
  useEffect as useEffect10,
  useRef as useRef8,
  useState as useState10
} from "preact/compat";
import { Fragment as Fragment6, jsx as jsx12, jsxs as jsxs11 } from "preact/jsx-runtime";
var Popover = ({
  children,
  triggerContent,
  wrapperProps
}) => {
  const [popoverState, setPopoverState] = useState10("closed");
  const [elBoundingRect, setElBoundingRect] = useState10(null);
  const [viewportSize, setViewportSize] = useState10({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const triggerRef = useRef8(null);
  const popoverRef = useRef8(null);
  const portalEl = useContext2(ToolbarElementContext);
  const isHoveredRef = useRef8(false);
  useEffect10(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      updateRect();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const updateRect = () => {
    if (triggerRef.current && portalEl) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const portalRect = portalEl.getBoundingClientRect();
      const centerX = triggerRect.left + triggerRect.width / 2;
      const centerY = triggerRect.top;
      const rect = new DOMRect(
        centerX - portalRect.left,
        centerY - portalRect.top,
        triggerRect.width,
        triggerRect.height
      );
      setElBoundingRect(rect);
    }
  };
  useEffect10(() => {
    updateRect();
  }, [triggerRef.current]);
  useEffect10(() => {
    if (popoverState === "opening") {
      const timer = setTimeout(() => setPopoverState("open"), 120);
      return () => clearTimeout(timer);
    } else if (popoverState === "closing") {
      const timer = setTimeout(() => setPopoverState("closed"), 120);
      return () => clearTimeout(timer);
    }
  }, [popoverState]);
  useEffect10(() => {
    const interval = setInterval(() => {
      if (!isHoveredRef.current && popoverState !== "closed") {
        setPopoverState("closing");
      }
    }, 1e3);
    return () => clearInterval(interval);
  }, [popoverState]);
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    updateRect();
    setPopoverState("opening");
  };
  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    updateRect();
    setPopoverState("closing");
  };
  const getPopoverPosition = () => {
    var _a;
    if (!elBoundingRect || !portalEl) return { top: 0, left: 0 };
    const portalRect = portalEl.getBoundingClientRect();
    const popoverWidth = 175;
    const popoverHeight = ((_a = popoverRef.current) == null ? void 0 : _a.offsetHeight) || 40;
    const safeArea = 5;
    const viewportX = elBoundingRect.x + portalRect.left;
    const viewportY = elBoundingRect.y + portalRect.top;
    let left = viewportX;
    let top = viewportY - 4;
    if (left - popoverWidth / 2 < safeArea) {
      left = safeArea + popoverWidth / 2;
    } else if (left + popoverWidth / 2 > viewportSize.width - safeArea) {
      left = viewportSize.width - safeArea - popoverWidth / 2;
    }
    if (top - popoverHeight < safeArea) {
      top = viewportY + elBoundingRect.height + 4;
    }
    return {
      top: top - portalRect.top,
      left: left - portalRect.left
    };
  };
  const popoverPosition = getPopoverPosition();
  return /* @__PURE__ */ jsxs11(Fragment6, { children: [
    portalEl && elBoundingRect && popoverState !== "closed" && createPortal(
      /* @__PURE__ */ jsx12(
        "div",
        {
          ref: popoverRef,
          className: cn([
            "absolute z-100 bg-white text-black rounded-lg px-3 py-2 shadow-lg",
            "transition-[opacity] duration-120 ease-out",
            'after:content-[""] after:absolute after:top-[100%]',
            "after:left-1/2 after:-translate-x-1/2",
            "after:w-[10px] after:h-[6px]",
            "after:border-l-[5px] after:border-l-transparent",
            "after:border-r-[5px] after:border-r-transparent",
            "after:border-t-[6px] after:border-t-white",
            "pointer-events-none",
            popoverState === "opening" || popoverState === "closing" ? "opacity-0" : "opacity-100"
          ]),
          style: {
            top: popoverPosition.top + "px",
            left: popoverPosition.left + "px",
            transform: `translate(-50%, calc(-100% - 4px)) scale(${popoverState === "open" ? 1 : 0.97})`,
            minWidth: "175px",
            willChange: "opacity, transform"
          },
          children
        }
      ),
      portalEl
    ),
    /* @__PURE__ */ jsx12(
      "div",
      {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...wrapperProps,
        children: triggerContent
      }
    )
  ] });
};

// src/web/views/notifications/notification-tabs.tsx
import { Fragment as Fragment7, jsx as jsx13, jsxs as jsxs12 } from "preact/jsx-runtime";
var NotificationTabs = ({
  selectedEvent: _
}) => {
  const { notificationState, setNotificationState, setRoute } = useNotificationsContext();
  return /* @__PURE__ */ jsxs12(
    "div",
    {
      className: cn([
        "flex w-full justify-between items-center px-3 py-2 text-xs"
      ]),
      children: [
        /* @__PURE__ */ jsxs12(
          "div",
          {
            className: cn([
              "bg-[#18181B] flex items-center gap-x-1 p-1 rounded-sm"
            ]),
            children: [
              /* @__PURE__ */ jsx13(
                "button",
                {
                  onClick: () => {
                    setRoute({
                      route: "render-visualization",
                      routeMessage: null
                    });
                  },
                  className: cn([
                    "w-1/2 flex items-center justify-center whitespace-nowrap py-[5px] px-1 gap-x-1",
                    notificationState.route === "render-visualization" || notificationState.route === "render-explanation" ? "text-white bg-[#7521c8] rounded-sm" : "text-[#6E6E77] bg-[#18181B] rounded-sm"
                  ]),
                  children: "Ranked"
                }
              ),
              /* @__PURE__ */ jsx13(
                "button",
                {
                  onClick: () => {
                    setRoute({
                      route: "other-visualization",
                      routeMessage: null
                    });
                  },
                  className: cn([
                    "w-1/2 flex items-center justify-center whitespace-nowrap py-[5px] px-1 gap-x-1",
                    notificationState.route === "other-visualization" ? "text-white bg-[#7521c8] rounded-sm" : "text-[#6E6E77] bg-[#18181B] rounded-sm"
                  ]),
                  children: "Overview"
                }
              ),
              /* @__PURE__ */ jsx13(
                "button",
                {
                  onClick: () => {
                    setRoute({
                      route: "optimize",
                      routeMessage: null
                    });
                  },
                  className: cn([
                    "w-1/2 flex items-center justify-center whitespace-nowrap py-[5px] px-1 gap-x-1",
                    notificationState.route === "optimize" ? "text-white bg-[#7521c8] rounded-sm" : "text-[#6E6E77] bg-[#18181B] rounded-sm"
                  ]),
                  children: /* @__PURE__ */ jsx13("span", { children: "Prompts" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx13(
          Popover,
          {
            triggerContent: /* @__PURE__ */ jsx13(
              "button",
              {
                onClick: () => {
                  setNotificationState((prev) => {
                    if (prev.audioNotificationsOptions.enabled && prev.audioNotificationsOptions.audioContext.state !== "closed") {
                      prev.audioNotificationsOptions.audioContext.close();
                    }
                    const prevEnabledState = prev.audioNotificationsOptions.enabled;
                    localStorage.setItem(
                      "react-scan-notifications-audio",
                      String(!prevEnabledState)
                    );
                    const audioContext = new AudioContext();
                    if (!prev.audioNotificationsOptions.enabled) {
                      playNotificationSound(audioContext);
                    }
                    if (prevEnabledState) {
                      audioContext.close();
                    }
                    return {
                      ...prev,
                      audioNotificationsOptions: prevEnabledState ? {
                        audioContext: null,
                        enabled: false
                      } : {
                        audioContext,
                        enabled: true
                      }
                    };
                  });
                },
                className: "ml-auto",
                children: /* @__PURE__ */ jsxs12(
                  "div",
                  {
                    className: cn([
                      "flex gap-x-2 justify-center items-center text-[#6E6E77]"
                    ]),
                    children: [
                      /* @__PURE__ */ jsx13("span", { children: "Alerts" }),
                      notificationState.audioNotificationsOptions.enabled ? /* @__PURE__ */ jsx13(VolumeOnIcon, { size: 16, className: "text-[#6E6E77]" }) : /* @__PURE__ */ jsx13(VolumeOffIcon, { size: 16, className: "text-[#6E6E77]" })
                    ]
                  }
                )
              }
            ),
            children: /* @__PURE__ */ jsx13(Fragment7, { children: "Play a chime when a slowdown is recorded" })
          }
        )
      ]
    }
  );
};

// src/web/views/notifications/optimize.tsx
import { useState as useState11 } from "preact/hooks";
import { Fragment as Fragment8, jsx as jsx14, jsxs as jsxs13 } from "preact/jsx-runtime";
var formatReactData = (groupedFiberRenders) => {
  let text = "";
  const filteredFibers = groupedFiberRenders.toSorted((a, b) => b.totalTime - a.totalTime).slice(0, 30).filter((fiber) => fiber.totalTime > 5);
  filteredFibers.forEach((fiberRender) => {
    let localText = "";
    localText += "Component Name:";
    localText += fiberRender.name;
    localText += "\n";
    localText += `Rendered: ${fiberRender.count} times
`;
    localText += `Sum of self times for ${fiberRender.name} is ${fiberRender.totalTime.toFixed(0)}ms
`;
    if (fiberRender.changes.props.length > 0) {
      localText += `Changed props for all ${fiberRender.name} instances ("name:count" pairs)
`;
      fiberRender.changes.props.forEach((change) => {
        localText += `${change.name}:${change.count}x
`;
      });
    }
    if (fiberRender.changes.state.length > 0) {
      localText += `Changed state for all ${fiberRender.name} instances ("hook index:count" pairs)
`;
      fiberRender.changes.state.forEach((change) => {
        localText += `${change.index}:${change.count}x
`;
      });
    }
    if (fiberRender.changes.context.length > 0) {
      localText += `Changed context for all ${fiberRender.name} instances ("context display name (if exists):count" pairs)
`;
      fiberRender.changes.context.forEach((change) => {
        localText += `${change.name}:${change.count}x
`;
      });
    }
    text += localText;
    text += "\n";
  });
  return text;
};
var generateInteractionDataPrompt = ({
  renderTime,
  eHandlerTimeExcludingRenders,
  toRafTime,
  commitTime,
  framePresentTime,
  formattedReactData
}) => {
  return `I will provide you with a set of high level, and low level performance data about an interaction in a React App:
### High level
- react component render time: ${renderTime.toFixed(0)}ms
- how long it took to run javascript event handlers (EXCLUDING REACT RENDERS): ${eHandlerTimeExcludingRenders.toFixed(0)}ms
- how long it took from the last event handler time, to the last request animation frame: ${toRafTime.toFixed(0)}ms
	- things like prepaint, style recalculations, layerization, async web API's like observers may occur during this time
- how long it took from the last request animation frame to when the dom was committed: ${commitTime.toFixed(0)}ms
	- during this period you will see paint, commit, potential style recalcs, and other misc browser activity. Frequently high times here imply css that makes the browser do a lot of work, or mutating expensive dom properties during the event handler stage. This can be many things, but it narrows the problem scope significantly when this is high
${framePresentTime === null ? "" : `- how long it took from dom commit for the frame to be presented: ${framePresentTime.toFixed(0)}ms. This is when information about how to paint the next frame is sent to the compositor threads, and when the GPU does work. If this is high, look for issues that may be a bottleneck for operations occurring during this time`}

### Low level
We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.
${formattedReactData}`;
};
var generateInteractionOptimizationPrompt = ({
  interactionType,
  name,
  componentPath,
  time,
  renderTime,
  eHandlerTimeExcludingRenders,
  toRafTime,
  commitTime,
  framePresentTime,
  formattedReactData
}) => `You will attempt to implement a performance improvement to a user interaction in a React app. You will be provided with data about the interaction, and the slow down.

Your should split your goals into 2 parts:
- identifying the problem
- fixing the problem
	- it is okay to implement a fix even if you aren't 100% sure the fix solves the performance problem. When you aren't sure, you should tell the user to try repeating the interaction, and feeding the "Formatted Data" in the React Scan notifications optimize tab. This allows you to start a debugging flow with the user, where you attempt a fix, and observe the result. The user may make a mistake when they pass you the formatted data, so must make sure, given the data passed to you, that the associated data ties to the same interaction you were trying to debug.


Make sure to check if the user has the react compiler enabled (project dependent, configured through build tool), so you don't unnecessarily memoize components. If it is, you do not need to worry about memoizing user components

One challenge you may face is the performance problem lies in a node_module, not in user code. If you are confident the problem originates because of a node_module, there are multiple strategies, which are context dependent:
- you can try to work around the problem, knowing which module is slow
- you can determine if its possible to resolve the problem in the node_module by modifying non node_module code
- you can monkey patch the node_module to experiment and see if it's really the problem (you can modify a functions properties to hijack the call for example)
- you can determine if it's feasible to replace whatever node_module is causing the problem with a performant option (this is an extreme)

The interaction was a ${interactionType} on the component named ${name}. This component has the following ancestors ${componentPath}. This is the path from the component, to the root. This should be enough information to figure out where this component is in the user's code base

This path is the component that was clicked, so it should tell you roughly where component had an event handler that triggered a state change.

Please note that the leaf node of this path might not be user code (if they use a UI library), and they may contain many wrapper components that just pass through children that aren't relevant to the actual click. So make you sure analyze the path and understand what the user code is doing

We have a set of high level, and low level data about the performance issue.

The click took ${time.toFixed(0)}ms from interaction start, to when a new frame was presented to a user.

We also provide you with a breakdown of what the browser spent time on during the period of interaction start to frame presentation.

- react component render time: ${renderTime.toFixed(0)}ms
- how long it took to run javascript event handlers (EXCLUDING REACT RENDERS): ${eHandlerTimeExcludingRenders.toFixed(0)}ms
- how long it took from the last event handler time, to the last request animation frame: ${toRafTime.toFixed(0)}ms
	- things like prepaint, style recalculations, layerization, async web API's like observers may occur during this time
- how long it took from the last request animation frame to when the dom was committed: ${commitTime.toFixed(0)}ms
	- during this period you will see paint, commit, potential style recalcs, and other misc browser activity. Frequently high times here imply css that makes the browser do a lot of work, or mutating expensive dom properties during the event handler stage. This can be many things, but it narrows the problem scope significantly when this is high
${framePresentTime === null ? "" : `- how long it took from dom commit for the frame to be presented: ${framePresentTime.toFixed(0)}ms. This is when information about how to paint the next frame is sent to the compositor threads, and when the GPU does work. If this is high, look for issues that may be a bottleneck for operations occurring during this time`}


We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.

${formattedReactData}

You may notice components have many renders, but much fewer props/state/context changes. This normally implies most of the components could have been memoized to avoid computation

It's also important to remember if a component had no props/state/context change, and it was memoized, it would not render. So the flow should be:
- find the most expensive components
- see what's causing them to render
- determine how you can make those state/props/context not change for a large set of the renders
- once there are no more changes left, you can memoize the component so it no longer unnecessarily re-renders. 

An important thing to note is that if you see a lot of react renders (some components with very high render counts), but javascript excluding renders is much higher than render time, it is possible that the components with lots of renders run hooks like useEffect/useLayoutEffect, which run during the JS event handler period.

It's also good to note that react profiles hook times in development, and if many hooks are called (lets say 5,000 components all called a useEffect), it will have to profile every single one. And it may also be the case the comparison of the hooks dependency can be expensive, and that would not be tracked in render time.

If a node_module is the component with high renders, you can experiment to see if that component is the root issue (because of hooks). You should use the same instructions for node_module debugging mentioned previously.

`;
var generateFrameDropOptimizationPrompt = ({
  renderTime,
  otherTime,
  formattedReactData
}) => `You will attempt to implement a performance improvement to a large slowdown in a react app

Your should split your goals into 2 parts:
- identifying the problem
- fixing the problem
	- it is okay to implement a fix even if you aren't 100% sure the fix solves the performance problem. When you aren't sure, you should tell the user to try repeating the interaction, and feeding the "Formatted Data" in the React Scan notifications optimize tab. This allows you to start a debugging flow with the user, where you attempt a fix, and observe the result. The user may make a mistake when they pass you the formatted data, so must make sure, given the data passed to you, that the associated data ties to the same interaction you were trying to debug.

Make sure to check if the user has the react compiler enabled (project dependent, configured through build tool), so you don't unnecessarily memoize components. If it is, you do not need to worry about memoizing user components

One challenge you may face is the performance problem lies in a node_module, not in user code. If you are confident the problem originates because of a node_module, there are multiple strategies, which are context dependent:
- you can try to work around the problem, knowing which module is slow
- you can determine if its possible to resolve the problem in the node_module by modifying non node_module code
- you can monkey patch the node_module to experiment and see if it's really the problem (you can modify a functions properties to hijack the call for example)
- you can determine if it's feasible to replace whatever node_module is causing the problem with a performant option (this is an extreme)


We have the high level time of how much react spent rendering, and what else the browser spent time on during this slowdown

- react component render time: ${renderTime.toFixed(0)}ms
- other time: ${otherTime}ms


We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.

${formattedReactData}

You may notice components have many renders, but much fewer props/state/context changes. This normally implies most of the components could have been memoized to avoid computation

It's also important to remember if a component had no props/state/context change, and it was memoized, it would not render. So the flow should be:
- find the most expensive components
- see what's causing them to render
- determine how you can make those state/props/context not change for a large set of the renders
- once there are no more changes left, you can memoize the component so it no longer unnecessarily re-renders. 

An important thing to note is that if you see a lot of react renders (some components with very high render counts), but other time is much higher than render time, it is possible that the components with lots of renders run hooks like useEffect/useLayoutEffect, which run outside of what we profile (just react render time).

It's also good to note that react profiles hook times in development, and if many hooks are called (lets say 5,000 components all called a useEffect), it will have to profile every single one. And it may also be the case the comparison of the hooks dependency can be expensive, and that would not be tracked in render time.

If a node_module is the component with high renders, you can experiment to see if that component is the root issue (because of hooks). You should use the same instructions for node_module debugging mentioned previously.

If renders don't seem to be the problem, see if there are any expensive CSS properties being added/mutated, or any expensive DOM Element mutations/new elements being created that could cause this slowdown. 
`;
var generateFrameDropExplanationPrompt = ({
  renderTime,
  otherTime,
  formattedReactData
}) => `Your goal will be to help me find the source of a performance problem in a React App. I collected a large dataset about this specific performance problem.

We have the high level time of how much react spent rendering, and what else the browser spent time on during this slowdown

- react component render time: ${renderTime.toFixed(0)}ms
- other time (other JavaScript, hooks like useEffect, style recalculations, layerization, paint & commit and everything else the browser might do to draw a new frame after javascript mutates the DOM): ${otherTime}ms


We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.

${formattedReactData}

You may notice components have many renders, but much fewer props/state/context changes. This normally implies most of the components could have been memoized to avoid computation

It's also important to remember if a component had no props/state/context change, and it was memoized, it would not render. So a flow we can go through is:
- find the most expensive components
- see what's causing them to render
- determine how you can make those state/props/context not change for a large set of the renders
- once there are no more changes left, you can memoize the component so it no longer unnecessarily re-renders. 


An important thing to note is that if you see a lot of react renders (some components with very high render counts), but other time is much higher than render time, it is possible that the components with lots of renders run hooks like useEffect/useLayoutEffect, which run outside of what we profile (just react render time).

It's also good to note that react profiles hook times in development, and if many hooks are called (lets say 5,000 components all called a useEffect), it will have to profile every single one, and this can add significant overhead when thousands of effects ran.

If it's not possible to explain the root problem from this data, please ask me for more data explicitly, and what we would need to know to find the source of the performance problem.
`;
var generateFrameDropDataPrompt = ({
  renderTime,
  otherTime,
  formattedReactData
}) => `I will provide you with a set of high level, and low level performance data about a large frame drop in a React App:
### High level
- react component render time: ${renderTime.toFixed(0)}ms
- how long it took to run everything else (other JavaScript, hooks like useEffect, style recalculations, layerization, paint & commit and everything else the browser might do to draw a new frame after javascript mutates the DOM): ${otherTime}ms

### Low level
We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.
${formattedReactData}`;
var generateInteractionExplanationPrompt = ({
  interactionType,
  name,
  time,
  renderTime,
  eHandlerTimeExcludingRenders,
  toRafTime,
  commitTime,
  framePresentTime,
  formattedReactData
}) => `Your goal will be to help me find the source of a performance problem. I collected a large dataset about this specific performance problem.

There was a ${interactionType} on a component named ${name}. This means, roughly, the component that handled the ${interactionType} event was named ${name}.

We have a set of high level, and low level data about the performance issue.

The click took ${time.toFixed(0)}ms from interaction start, to when a new frame was presented to a user.

We also provide you with a breakdown of what the browser spent time on during the period of interaction start to frame presentation.

- react component render time: ${renderTime.toFixed(0)}ms
- how long it took to run javascript event handlers (EXCLUDING REACT RENDERS): ${eHandlerTimeExcludingRenders.toFixed(0)}ms
- how long it took from the last event handler time, to the last request animation frame: ${toRafTime.toFixed(0)}ms
	- things like prepaint, style recalculations, layerization, async web API's like observers may occur during this time
- how long it took from the last request animation frame to when the dom was committed: ${commitTime.toFixed(0)}ms
	- during this period you will see paint, commit, potential style recalcs, and other misc browser activity. Frequently high times here imply css that makes the browser do a lot of work, or mutating expensive dom properties during the event handler stage. This can be many things, but it narrows the problem scope significantly when this is high
${framePresentTime === null ? "" : `- how long it took from dom commit for the frame to be presented: ${framePresentTime.toFixed(0)}ms. This is when information about how to paint the next frame is sent to the compositor threads, and when the GPU does work. If this is high, look for issues that may be a bottleneck for operations occurring during this time`}

We also have lower level information about react components, such as their render time, and which props/state/context changed when they re-rendered.

${formattedReactData}


You may notice components have many renders, but much fewer props/state/context changes. This normally implies most of the components could have been memoized to avoid computation

It's also important to remember if a component had no props/state/context change, and it was memoized, it would not render. So a flow we can go through is:
- find the most expensive components
- see what's causing them to render
- determine how you can make those state/props/context not change for a large set of the renders
- once there are no more changes left, you can memoize the component so it no longer unnecessarily re-renders. 


An important thing to note is that if you see a lot of react renders (some components with very high render counts), but javascript excluding renders is much higher than render time, it is possible that the components with lots of renders run hooks like useEffect/useLayoutEffect, which run during the JS event handler period.

It's also good to note that react profiles hook times in development, and if many hooks are called (lets say 5,000 components all called a useEffect), it will have to profile every single one. And it may also be the case the comparison of the hooks dependency can be expensive, and that would not be tracked in render time.

If it's not possible to explain the root problem from this data, please ask me for more data explicitly, and what we would need to know to find the source of the performance problem.
`;
var getLLMPrompt = (activeTab, selectedEvent) => iife(() => {
  switch (activeTab) {
    case "data": {
      switch (selectedEvent.kind) {
        case "dropped-frames": {
          return generateFrameDropDataPrompt({
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            otherTime: selectedEvent.timing.otherTime
          });
        }
        case "interaction": {
          return generateInteractionDataPrompt({
            commitTime: selectedEvent.timing.frameConstruction,
            eHandlerTimeExcludingRenders: selectedEvent.timing.otherJSTime,
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            framePresentTime: selectedEvent.timing.frameDraw,
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            toRafTime: selectedEvent.timing.framePreparation
          });
        }
      }
    }
    case "explanation": {
      switch (selectedEvent.kind) {
        case "dropped-frames": {
          return generateFrameDropExplanationPrompt({
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            otherTime: selectedEvent.timing.otherTime
          });
        }
        case "interaction": {
          return generateInteractionExplanationPrompt({
            commitTime: selectedEvent.timing.frameConstruction,
            eHandlerTimeExcludingRenders: selectedEvent.timing.otherJSTime,
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            framePresentTime: selectedEvent.timing.frameDraw,
            interactionType: selectedEvent.type,
            name: getComponentName(selectedEvent.componentPath),
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            time: getTotalTime(selectedEvent.timing),
            toRafTime: selectedEvent.timing.framePreparation
          });
        }
      }
    }
    case "fix": {
      switch (selectedEvent.kind) {
        case "dropped-frames": {
          return generateFrameDropOptimizationPrompt({
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            otherTime: selectedEvent.timing.otherTime
          });
        }
        case "interaction": {
          return generateInteractionOptimizationPrompt({
            commitTime: selectedEvent.timing.frameConstruction,
            componentPath: selectedEvent.componentPath.join(">"),
            eHandlerTimeExcludingRenders: selectedEvent.timing.otherJSTime,
            formattedReactData: formatReactData(
              selectedEvent.groupedFiberRenders
            ),
            framePresentTime: selectedEvent.timing.frameDraw,
            interactionType: selectedEvent.type,
            name: getComponentName(selectedEvent.componentPath),
            renderTime: selectedEvent.groupedFiberRenders.reduce(
              (prev, curr) => prev + curr.totalTime,
              0
            ),
            time: getTotalTime(selectedEvent.timing),
            toRafTime: selectedEvent.timing.framePreparation
          });
        }
      }
    }
  }
});
var Optimize = ({
  selectedEvent
}) => {
  const [activeTab, setActiveTab] = useState11(
    "fix"
  );
  const [copying, setCopying] = useState11(false);
  return /* @__PURE__ */ jsxs13("div", { className: cn(["w-full h-full"]), children: [
    /* @__PURE__ */ jsxs13(
      "div",
      {
        className: cn([
          "border border-[#27272A] rounded-sm h-4/5 text-xs overflow-hidden"
        ]),
        children: [
          /* @__PURE__ */ jsx14("div", { className: cn(["bg-[#18181B] p-1 rounded-t-sm"]), children: /* @__PURE__ */ jsxs13("div", { className: cn(["flex items-center gap-x-1"]), children: [
            /* @__PURE__ */ jsx14(
              "button",
              {
                onClick: () => setActiveTab("fix"),
                className: cn([
                  "flex items-center justify-center whitespace-nowrap py-1.5 px-3 rounded-sm",
                  activeTab === "fix" ? "text-white bg-[#7521c8]" : "text-[#6E6E77] hover:text-white"
                ]),
                children: "Fix"
              }
            ),
            /* @__PURE__ */ jsx14(
              "button",
              {
                onClick: () => setActiveTab("explanation"),
                className: cn([
                  "flex items-center justify-center whitespace-nowrap py-1.5 px-3 rounded-sm",
                  activeTab === "explanation" ? "text-white bg-[#7521c8]" : "text-[#6E6E77] hover:text-white"
                ]),
                children: "Explanation"
              }
            ),
            /* @__PURE__ */ jsx14(
              "button",
              {
                onClick: () => setActiveTab("data"),
                className: cn([
                  "flex items-center justify-center whitespace-nowrap py-1.5 px-3 rounded-sm",
                  activeTab === "data" ? "text-white bg-[#7521c8]" : "text-[#6E6E77] hover:text-white"
                ]),
                children: "Data"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx14("div", { className: cn(["overflow-y-auto h-full"]), children: /* @__PURE__ */ jsx14(
            "pre",
            {
              className: cn([
                "p-2 h-full",
                "whitespace-pre-wrap break-words",
                "text-gray-300 font-mono "
              ]),
              children: getLLMPrompt(activeTab, selectedEvent)
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs13(
      "button",
      {
        onClick: async () => {
          const text = getLLMPrompt(activeTab, selectedEvent);
          await navigator.clipboard.writeText(text);
          setCopying(true);
          setTimeout(() => setCopying(false), 1e3);
        },
        className: cn([
          "mt-4 px-4 py-2 bg-[#18181B] text-[#6E6E77] rounded-sm",
          "hover:text-white transition-colors duration-200",
          "flex items-center justify-center gap-x-2 text-xs"
        ]),
        children: [
          /* @__PURE__ */ jsx14("span", { children: copying ? "Copied!" : "Copy Prompt" }),
          /* @__PURE__ */ jsx14(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: cn([
                "transition-transform duration-200",
                copying && "scale-110"
              ]),
              children: copying ? /* @__PURE__ */ jsx14("path", { d: "M20 6L9 17l-5-5" }) : /* @__PURE__ */ jsxs13(Fragment8, { children: [
                /* @__PURE__ */ jsx14("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
                /* @__PURE__ */ jsx14("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
              ] })
            }
          )
        ]
      }
    )
  ] });
};

// src/web/views/notifications/other-visualization.tsx
import { useContext as useContext3, useEffect as useEffect11, useState as useState12 } from "preact/hooks";
import { Fragment as Fragment9, jsx as jsx15, jsxs as jsxs14 } from "preact/jsx-runtime";
var getTimeData = (selectedEvent, isProduction2) => {
  switch (selectedEvent.kind) {
    // todo: push instead of conditional spread
    case "dropped-frames": {
      const timeData = [
        ...isProduction2 ? [
          {
            name: "Total Processing Time",
            time: getTotalTime(selectedEvent.timing),
            color: "bg-red-500",
            kind: "total-processing-time"
          }
        ] : [
          {
            name: "Renders",
            time: selectedEvent.timing.renderTime,
            color: "bg-purple-500",
            kind: "render"
          },
          {
            name: "JavaScript, DOM updates, Draw Frame",
            time: selectedEvent.timing.otherTime,
            color: "bg-[#4b4b4b]",
            kind: "other-frame-drop"
          }
        ]
      ];
      return timeData;
    }
    case "interaction": {
      const timeData = [
        ...!isProduction2 ? [
          {
            name: "Renders",
            time: selectedEvent.timing.renderTime,
            color: "bg-purple-500",
            kind: "render"
          }
        ] : [],
        {
          name: isProduction2 ? "React Renders, Hooks, Other JavaScript" : "JavaScript/React Hooks ",
          time: selectedEvent.timing.otherJSTime,
          color: "bg-[#EFD81A]",
          kind: "other-javascript"
        },
        {
          name: "Update DOM and Draw New Frame",
          time: getTotalTime(selectedEvent.timing) - selectedEvent.timing.renderTime - selectedEvent.timing.otherJSTime,
          color: "bg-[#1D3A66]",
          kind: "other-not-javascript"
        }
      ];
      return timeData;
    }
  }
};
var OtherVisualization = ({
  selectedEvent
}) => {
  var _a, _b;
  const [isProduction2] = useState12((_a = getIsProduction()) != null ? _a : false);
  const { notificationState } = useNotificationsContext();
  const [expandedItems, setExpandedItems] = useState12(
    ((_b = notificationState.routeMessage) == null ? void 0 : _b.name) ? [notificationState.routeMessage.name] : []
  );
  const timeData = getTimeData(selectedEvent, isProduction2);
  const root = useContext3(ToolbarElementContext);
  useEffect11(() => {
    var _a2;
    if ((_a2 = notificationState.routeMessage) == null ? void 0 : _a2.name) {
      const container = root == null ? void 0 : root.querySelector("#overview-scroll-container");
      const element = root == null ? void 0 : root.querySelector(
        `#react-scan-overview-bar-${notificationState.routeMessage.name}`
      );
      if (container && element) {
        const elementTop = element.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        const scrollOffset = elementTop - containerTop;
        container.scrollTop = container.scrollTop + scrollOffset;
      }
    }
  }, [notificationState.route]);
  useEffect11(() => {
    if (notificationState.route === "other-visualization") {
      setExpandedItems(
        (prev) => {
          var _a2;
          return ((_a2 = notificationState.routeMessage) == null ? void 0 : _a2.name) ? [notificationState.routeMessage.name] : prev;
        }
      );
    }
  }, [notificationState.route]);
  const totalTime = timeData.reduce((acc, item) => acc + item.time, 0);
  return /* @__PURE__ */ jsxs14("div", { className: "rounded-sm border border-zinc-800 text-xs", children: [
    /* @__PURE__ */ jsx15("div", { className: "p-2 border-b border-zinc-800 bg-zinc-900/50", children: /* @__PURE__ */ jsxs14("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx15("h3", { className: "text-xs font-medium", children: "What was time spent on?" }),
      /* @__PURE__ */ jsxs14("span", { className: "text-xs text-zinc-400", children: [
        "Total: ",
        totalTime.toFixed(0),
        "ms"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx15("div", { className: "divide-y divide-zinc-800", children: timeData.map((entry) => {
      const isExpanded = expandedItems.includes(entry.kind);
      return /* @__PURE__ */ jsxs14("div", { id: `react-scan-overview-bar-${entry.kind}`, children: [
        /* @__PURE__ */ jsx15(
          "button",
          {
            onClick: () => setExpandedItems(
              (prev) => prev.includes(entry.kind) ? prev.filter((item) => item !== entry.kind) : [...prev, entry.kind]
            ),
            className: "w-full px-3 py-2 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors",
            children: /* @__PURE__ */ jsxs14("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs14("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxs14("div", { className: "flex items-center gap-0.5", children: [
                  /* @__PURE__ */ jsx15(
                    "svg",
                    {
                      className: `h-4 w-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-90" : ""}`,
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx15(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M9 5l7 7-7 7"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx15("span", { className: "font-medium flex items-center text-left", children: entry.name })
                ] }),
                /* @__PURE__ */ jsxs14("span", { className: " text-zinc-400", children: [
                  entry.time.toFixed(0),
                  "ms"
                ] })
              ] }),
              /* @__PURE__ */ jsx15("div", { className: "h-1 bg-zinc-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx15(
                "div",
                {
                  className: `h-full ${entry.color} transition-all`,
                  style: {
                    width: `${entry.time / totalTime * 100}%`
                  }
                }
              ) })
            ] })
          }
        ),
        isExpanded && /* @__PURE__ */ jsx15("div", { className: "bg-zinc-900/30 border-t border-zinc-800 px-2.5 py-3", children: /* @__PURE__ */ jsx15("p", { className: " text-zinc-400 mb-4 text-xs", children: iife(() => {
          switch (selectedEvent.kind) {
            case "interaction": {
              switch (entry.kind) {
                case "render": {
                  return /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: getRenderInput(selectedEvent)
                    }
                  );
                }
                case "other-javascript": {
                  return /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: getJSInput(selectedEvent)
                    }
                  );
                }
                case "other-not-javascript": {
                  return /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: getDrawInput(selectedEvent)
                    }
                  );
                }
              }
            }
            case "dropped-frames": {
              switch (entry.kind) {
                case "total-processing-time": {
                  return /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: {
                        kind: "total-processing",
                        data: {
                          time: getTotalTime(selectedEvent.timing)
                        }
                      }
                    }
                  );
                }
                case "render": {
                  return /* @__PURE__ */ jsx15(Fragment9, { children: /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: {
                        kind: "render",
                        data: {
                          topByTime: selectedEvent.groupedFiberRenders.toSorted(
                            (a, b) => b.totalTime - a.totalTime
                          ).slice(0, 3).map((render2) => ({
                            name: render2.name,
                            percentage: render2.totalTime / getTotalTime(
                              selectedEvent.timing
                            )
                          }))
                        }
                      }
                    }
                  ) });
                }
                case "other-frame-drop": {
                  return /* @__PURE__ */ jsx15(
                    Explanation,
                    {
                      input: {
                        kind: "other"
                      }
                    }
                  );
                }
              }
            }
          }
        }) }) })
      ] }, entry.kind);
    }) })
  ] });
};
var getDrawInput = (event) => {
  const renderCount = event.groupedFiberRenders.reduce(
    (prev, curr) => prev + curr.count,
    0
  );
  const renderTime = event.timing.renderTime;
  const totalTime = getTotalTime(event.timing);
  const renderPercentage = renderTime / totalTime * 100;
  if (renderCount > 100) {
    return {
      kind: "high-render-count-update-dom-draw-frame",
      data: {
        count: renderCount,
        percentageOfTotal: renderPercentage,
        copyButton: /* @__PURE__ */ jsx15(CopyPromptButton, {})
      }
    };
  }
  return {
    kind: "update-dom-draw-frame",
    data: {
      copyButton: /* @__PURE__ */ jsx15(CopyPromptButton, {})
    }
  };
};
var CopyPromptButton = () => {
  const [copying, setCopying] = useState12(false);
  const { notificationState } = useNotificationsContext();
  return /* @__PURE__ */ jsxs14(
    "button",
    {
      onClick: async () => {
        if (!notificationState.selectedEvent) {
          return;
        }
        await navigator.clipboard.writeText(
          getLLMPrompt("explanation", notificationState.selectedEvent)
        );
        setCopying(true);
        setTimeout(() => setCopying(false), 1e3);
      },
      className: "bg-zinc-800 flex hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded gap-x-3",
      children: [
        /* @__PURE__ */ jsx15("span", { children: copying ? "Copied!" : "Copy Prompt" }),
        /* @__PURE__ */ jsx15(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: cn([
              "transition-transform duration-200",
              copying && "scale-110"
            ]),
            children: copying ? /* @__PURE__ */ jsx15("path", { d: "M20 6L9 17l-5-5" }) : /* @__PURE__ */ jsxs14(Fragment9, { children: [
              /* @__PURE__ */ jsx15("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx15("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
            ] })
          }
        )
      ]
    }
  );
};
var getRenderInput = (event) => {
  if (event.timing.renderTime / getTotalTime(event.timing) > 0.3) {
    return {
      kind: "render",
      data: {
        topByTime: event.groupedFiberRenders.toSorted((a, b) => b.totalTime - a.totalTime).slice(0, 3).map((e) => ({
          percentage: e.totalTime / getTotalTime(event.timing),
          name: e.name
        }))
      }
    };
  }
  return {
    kind: "other"
  };
};
var getJSInput = (event) => {
  const renderCount = event.groupedFiberRenders.reduce(
    (prev, curr) => prev + curr.count,
    0
  );
  if (event.timing.otherJSTime / getTotalTime(event.timing) < 0.2) {
    return {
      kind: "js-explanation-base"
    };
  }
  if (event.groupedFiberRenders.find((render2) => render2.count > 200) || event.groupedFiberRenders.reduce((prev, curr) => prev + curr.count, 0) > 500) {
    return {
      kind: "high-render-count-high-js",
      data: {
        renderCount,
        topByCount: event.groupedFiberRenders.filter((groupedRender) => groupedRender.count > 100).toSorted((a, b) => b.count - a.count).slice(0, 3)
      }
    };
  }
  if (event.timing.otherJSTime / getTotalTime(event.timing) > 0.3) {
    if (event.timing.renderTime > 0.2) {
      return {
        kind: "js-explanation-base"
      };
    }
    return {
      kind: "low-render-count-high-js",
      data: {
        renderCount
      }
    };
  }
  return {
    kind: "js-explanation-base"
  };
};
var Explanation = ({ input }) => {
  switch (input.kind) {
    case "total-processing": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsxs14("p", { children: [
              "This is the time it took to draw the entire frame that was presented to the user. To be at 60FPS, this number needs to be ",
              "<=16ms"
            ] }),
            /* @__PURE__ */ jsx15("p", { children: 'To debug the issue, check the "Ranked" tab to see if there are significant component renders' }),
            /* @__PURE__ */ jsx15("p", { children: "On a production React build, React Scan can't access the time it took for component to render. To get that information, run React Scan on a development build" }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "To understand precisely what caused the slowdown while in production, use the ",
              /* @__PURE__ */ jsx15("strong", { children: "Chrome profiler" }),
              " and analyze the function call times."
            ] }),
            /* @__PURE__ */ jsx15("p", {})
          ]
        }
      );
    }
    case "render": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "This is the time it took React to run components, and internal logic to handle the output of your component." }),
            /* @__PURE__ */ jsxs14("div", { className: cn(["flex flex-col"]), children: [
              /* @__PURE__ */ jsx15("p", { children: "The slowest components for this time period were:" }),
              input.data.topByTime.map((item) => /* @__PURE__ */ jsxs14("div", { children: [
                /* @__PURE__ */ jsx15("strong", { children: item.name }),
                ":",
                " ",
                (item.percentage * 100).toFixed(0),
                "% of total"
              ] }, item.name))
            ] }),
            /* @__PURE__ */ jsx15("p", { children: 'To view the render times of all your components, and what caused them to render, go to the "Ranked" tab' }),
            /* @__PURE__ */ jsx15("p", { children: 'The "Ranked" tab shows the render times of every component.' }),
            /* @__PURE__ */ jsx15("p", { children: "The render times of the same components are grouped together into one bar." }),
            /* @__PURE__ */ jsx15("p", { children: "Clicking the component will show you what props, state, or context caused the component to re-render." })
          ]
        }
      );
    }
    case "js-explanation-base": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "This is the period when JavaScript hooks and other JavaScript outside of React Renders run." }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "The most common culprit for high JS time is expensive hooks, like expensive callbacks inside of ",
              /* @__PURE__ */ jsx15("code", { children: "useEffect" }),
              "'s or a large number of useEffect's called, but this can also be JavaScript event handlers (",
              /* @__PURE__ */ jsx15("code", { children: "'onclick'" }),
              ", ",
              /* @__PURE__ */ jsx15("code", { children: "'onchange'" }),
              ") that performed expensive computation."
            ] }),
            /* @__PURE__ */ jsx15("p", { children: "If you have lots of components rendering that call hooks, like useEffect, it can add significant overhead even if the callbacks are not expensive. If this is the case, you can try optimizing the renders of those components to avoid the hook from having to run." }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "You should profile your app using the",
              " ",
              /* @__PURE__ */ jsx15("strong", { children: "Chrome DevTools profiler" }),
              " to learn exactly which functions took the longest to execute."
            ] })
          ]
        }
      );
    }
    case "high-render-count-high-js": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "This is the period when JavaScript hooks and other JavaScript outside of React Renders run." }),
            input.data.renderCount === 0 ? /* @__PURE__ */ jsxs14(Fragment9, { children: [
              /* @__PURE__ */ jsx15("p", { children: "There were no renders, which means nothing related to React caused this slowdown. The most likely cause of the slowdown is a slow JavaScript event handler, or code related to a Web API" }),
              /* @__PURE__ */ jsxs14("p", { children: [
                "You should try to reproduce the slowdown while profiling your website with the",
                /* @__PURE__ */ jsx15("strong", { children: "Chrome DevTools profiler" }),
                " to see exactly what functions took the longest to execute."
              ] })
            ] }) : /* @__PURE__ */ jsxs14(Fragment9, { children: [
              " ",
              /* @__PURE__ */ jsxs14("p", { children: [
                "There were ",
                /* @__PURE__ */ jsx15("strong", { children: input.data.renderCount }),
                " renders, which could have contributed to the high JavaScript/Hook time if they ran lots of hooks, like ",
                /* @__PURE__ */ jsx15("code", { children: "useEffects" }),
                "."
              ] }),
              /* @__PURE__ */ jsxs14("div", { className: cn(["flex flex-col"]), children: [
                /* @__PURE__ */ jsx15("p", { children: "You should try optimizing the renders of:" }),
                input.data.topByCount.map((item) => /* @__PURE__ */ jsxs14("div", { children: [
                  "- ",
                  /* @__PURE__ */ jsx15("strong", { children: item.name }),
                  " (rendered ",
                  item.count,
                  "x)"
                ] }, item.name))
              ] }),
              "and then checking if the problem still exists.",
              /* @__PURE__ */ jsxs14("p", { children: [
                "You can also try profiling your app using the",
                " ",
                /* @__PURE__ */ jsx15("strong", { children: "Chrome DevTools profiler" }),
                " to see exactly what functions took the longest to execute."
              ] })
            ] })
          ]
        }
      );
    }
    case "low-render-count-high-js": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "This is the period when JavaScript hooks and other JavaScript outside of React Renders run." }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "There were only ",
              /* @__PURE__ */ jsx15("strong", { children: input.data.renderCount }),
              " renders detected, which means either you had very expensive hooks like",
              " ",
              /* @__PURE__ */ jsx15("code", { children: "useEffect" }),
              "/",
              /* @__PURE__ */ jsx15("code", { children: "useLayoutEffect" }),
              ", or there is other JavaScript running during this interaction that took up the majority of the time."
            ] }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "To understand precisely what caused the slowdown, use the",
              " ",
              /* @__PURE__ */ jsx15("strong", { children: "Chrome profiler" }),
              " and analyze the function call times."
            ] })
          ]
        }
      );
    }
    case "high-render-count-update-dom-draw-frame": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "These are the calculations the browser is forced to do in response to the JavaScript that ran during the interaction." }),
            /* @__PURE__ */ jsx15("p", { children: "This can be caused by CSS updates/CSS recalculations, or new DOM elements/DOM mutations." }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "During this interaction, there were",
              " ",
              /* @__PURE__ */ jsx15("strong", { children: input.data.count }),
              " renders, which was",
              " ",
              /* @__PURE__ */ jsxs14("strong", { children: [
                input.data.percentageOfTotal.toFixed(0),
                "%"
              ] }),
              " of the time spent processing"
            ] }),
            /* @__PURE__ */ jsx15("p", { children: "The work performed as a result of the renders may have forced the browser to spend a lot of time to draw the next frame." }),
            /* @__PURE__ */ jsx15("p", { children: 'You can try optimizing the renders to see if the performance problem still exists using the "Ranked" tab.' }),
            /* @__PURE__ */ jsx15("p", { children: "If you use an AI-based code editor, you can export the performance data collected as a prompt." }),
            /* @__PURE__ */ jsx15("p", { children: input.data.copyButton }),
            /* @__PURE__ */ jsx15("p", { children: "Provide this formatted data to the model and ask it to find, or fix, what could be causing this performance problem." }),
            /* @__PURE__ */ jsx15("p", { children: 'For a larger selection of prompts, try the "Prompts" tab' })
          ]
        }
      );
    }
    case "update-dom-draw-frame": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsx15("p", { children: "These are the calculations the browser is forced to do in response to the JavaScript that ran during the interaction." }),
            /* @__PURE__ */ jsx15("p", { children: "This can be caused by CSS updates/CSS recalculations, or new DOM elements/DOM mutations." }),
            /* @__PURE__ */ jsx15("p", { children: "If you use an AI-based code editor, you can export the performance data collected as a prompt." }),
            /* @__PURE__ */ jsx15("p", { children: input.data.copyButton }),
            /* @__PURE__ */ jsx15("p", { children: "Provide this formatted data to the model and ask it to find, or fix, what could be causing this performance problem." }),
            /* @__PURE__ */ jsx15("p", { children: 'For a larger selection of prompts, try the "Prompts" tab' })
          ]
        }
      );
    }
    case "other": {
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: cn([
            "text-[#E4E4E7] text-[10px] leading-6 flex flex-col gap-y-2"
          ]),
          children: [
            /* @__PURE__ */ jsxs14("p", { children: [
              "This is the time it took to run everything other than React renders. This can be hooks like ",
              /* @__PURE__ */ jsx15("code", { children: "useEffect" }),
              ", other JavaScript not part of React, or work the browser has to do to update the DOM and draw the next frame."
            ] }),
            /* @__PURE__ */ jsxs14("p", { children: [
              "To get a better picture of what happened, profile your app using the",
              " ",
              /* @__PURE__ */ jsx15("strong", { children: "Chrome profiler" }),
              " when the performance problem arises."
            ] })
          ]
        }
      );
    }
  }
};

// src/web/views/notifications/render-bar-chart.tsx
import { useRef as useRef9, useState as useState13 } from "preact/hooks";

// src/core/notifications/outline-overlay.ts
import { signal as signal6 } from "@preact/signals";
var highlightCanvas = null;
var highlightCtx = null;
var animationFrame = null;
var HighlightStore = signal6({
  kind: "idle",
  current: null
});
var currFrame = null;
var lastFrameTime = 0;
var FADE_SPEED = 1.8;
var MAX_DELTA = 0.05;
var DEFAULT_DELTA = 1 / 60;
var drawHighlights = () => {
  if (currFrame) {
    cancelAnimationFrame(currFrame);
  }
  currFrame = requestAnimationFrame((timestamp) => {
    if (!highlightCanvas || !highlightCtx) {
      return;
    }
    const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1e3, MAX_DELTA) : DEFAULT_DELTA;
    lastFrameTime = timestamp;
    const step = FADE_SPEED * dt;
    highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    const color = "hsl(271, 76%, 53%)";
    const state = HighlightStore.value;
    const { alpha, current } = iife(() => {
      var _a, _b, _c;
      switch (state.kind) {
        case "transition": {
          const current2 = ((_a = state.current) == null ? void 0 : _a.alpha) && state.current.alpha > 0 ? state.current : state.transitionTo;
          return {
            alpha: current2 ? current2.alpha : 0,
            current: current2
          };
        }
        case "move-out": {
          return { alpha: (_c = (_b = state.current) == null ? void 0 : _b.alpha) != null ? _c : 0, current: state.current };
        }
        case "idle": {
          return { alpha: 1, current: state.current };
        }
      }
      state;
    });
    current == null ? void 0 : current.rects.forEach((rect) => {
      if (!highlightCtx) {
        return;
      }
      highlightCtx.shadowColor = color;
      highlightCtx.shadowBlur = 6;
      highlightCtx.strokeStyle = color;
      highlightCtx.lineWidth = 2;
      highlightCtx.globalAlpha = alpha;
      highlightCtx.beginPath();
      highlightCtx.rect(rect.left, rect.top, rect.width, rect.height);
      highlightCtx.stroke();
      highlightCtx.shadowBlur = 0;
      highlightCtx.beginPath();
      highlightCtx.rect(rect.left, rect.top, rect.width, rect.height);
      highlightCtx.stroke();
    });
    switch (state.kind) {
      case "move-out": {
        if (state.current.alpha === 0) {
          HighlightStore.value = {
            kind: "idle",
            current: null
          };
          lastFrameTime = 0;
          return;
        }
        if (state.current.alpha <= 0.01) {
          state.current.alpha = 0;
        }
        state.current.alpha = Math.max(0, state.current.alpha - step);
        drawHighlights();
        return;
      }
      case "transition": {
        if (state.current && state.current.alpha > 0) {
          state.current.alpha = Math.max(0, state.current.alpha - step);
          drawHighlights();
          return;
        }
        if (state.transitionTo.alpha === 1) {
          HighlightStore.value = {
            kind: "idle",
            current: state.transitionTo
          };
          lastFrameTime = 0;
          return;
        }
        state.transitionTo.alpha = Math.min(state.transitionTo.alpha + step, 1);
        drawHighlights();
      }
      case "idle": {
        lastFrameTime = 0;
        return;
      }
    }
  });
};
var handleResizeListener = null;
var createHighlightCanvas = (root) => {
  highlightCanvas = document.createElement("canvas");
  highlightCtx = highlightCanvas.getContext("2d", { alpha: true });
  if (!highlightCtx) return null;
  const dpr2 = window.devicePixelRatio || 1;
  const { innerWidth, innerHeight } = window;
  highlightCanvas.style.width = `${innerWidth}px`;
  highlightCanvas.style.height = `${innerHeight}px`;
  highlightCanvas.width = innerWidth * dpr2;
  highlightCanvas.height = innerHeight * dpr2;
  highlightCanvas.style.position = "fixed";
  highlightCanvas.style.left = "0";
  highlightCanvas.style.top = "0";
  highlightCanvas.style.pointerEvents = "none";
  highlightCanvas.style.zIndex = "2147483600";
  highlightCtx.scale(dpr2, dpr2);
  root.appendChild(highlightCanvas);
  if (handleResizeListener) {
    window.removeEventListener("resize", handleResizeListener);
  }
  const handleResize = () => {
    if (!highlightCanvas || !highlightCtx) return;
    const dpr3 = window.devicePixelRatio || 1;
    const { innerWidth: innerWidth2, innerHeight: innerHeight2 } = window;
    highlightCanvas.style.width = `${innerWidth2}px`;
    highlightCanvas.style.height = `${innerHeight2}px`;
    highlightCanvas.width = innerWidth2 * dpr3;
    highlightCanvas.height = innerHeight2 * dpr3;
    highlightCtx.scale(dpr3, dpr3);
    drawHighlights();
  };
  handleResizeListener = handleResize;
  window.addEventListener("resize", handleResize);
  HighlightStore.subscribe(() => {
    requestAnimationFrame(() => {
      drawHighlights();
    });
  });
  return cleanup2;
};
function cleanup2() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (highlightCanvas == null ? void 0 : highlightCanvas.parentNode) {
    highlightCanvas.parentNode.removeChild(highlightCanvas);
  }
  highlightCanvas = null;
  highlightCtx = null;
}

// src/web/views/notifications/render-bar-chart.tsx
import { jsx as jsx16, jsxs as jsxs15 } from "preact/jsx-runtime";
var fadeOutHighlights = () => {
  var _a, _b;
  const curr = HighlightStore.value.current ? HighlightStore.value.current : HighlightStore.value.kind === "transition" ? HighlightStore.value.transitionTo : null;
  if (!curr) {
    return;
  }
  if (HighlightStore.value.kind === "transition") {
    HighlightStore.value = {
      kind: "move-out",
      // because we want to dynamically fade this value
      current: ((_a = HighlightStore.value.current) == null ? void 0 : _a.alpha) === 0 ? (
        // we want to only start fading from transition if current is done animating out
        HighlightStore.value.transitionTo
      ) : (
        // if current doesn't exist then transition must exist
        (_b = HighlightStore.value.current) != null ? _b : HighlightStore.value.transitionTo
      )
    };
    return;
  }
  HighlightStore.value = {
    kind: "move-out",
    current: {
      alpha: 0,
      ...curr
    }
  };
};
var RenderBarChart = ({
  selectedEvent
}) => {
  const totalInteractionTime = getTotalTime(selectedEvent.timing);
  const nonRender = totalInteractionTime - selectedEvent.timing.renderTime;
  const [isProduction2] = useState13(getIsProduction());
  const events = selectedEvent.groupedFiberRenders;
  const bars = events.map((event) => ({
    event,
    kind: "render",
    totalTime: isProduction2 ? event.count : event.totalTime
  }));
  const isShowingExtraInfo = iife(() => {
    switch (selectedEvent.kind) {
      case "dropped-frames": {
        return selectedEvent.timing.renderTime / totalInteractionTime < 0.1;
      }
      case "interaction": {
        return (selectedEvent.timing.otherJSTime + selectedEvent.timing.renderTime) / totalInteractionTime < 0.2;
      }
    }
  });
  if (selectedEvent.kind === "interaction" && !isProduction2) {
    bars.push({
      kind: "other-javascript",
      totalTime: selectedEvent.timing.otherJSTime
    });
  }
  if (isShowingExtraInfo && !isProduction2) {
    if (selectedEvent.kind === "interaction") {
      bars.push({
        kind: "other-not-javascript",
        totalTime: getTotalTime(selectedEvent.timing) - selectedEvent.timing.renderTime - selectedEvent.timing.otherJSTime
      });
    } else {
      bars.push({
        kind: "other-frame-drop",
        totalTime: nonRender
      });
    }
  }
  const debouncedMouseEnter = useRef9({
    lastCallAt: null,
    timer: null
  });
  const totalBarTime = bars.reduce((prev, curr) => prev + curr.totalTime, 0);
  return /* @__PURE__ */ jsxs15("div", { className: cn(["flex flex-col h-full w-full gap-y-1"]), children: [
    iife(() => {
      if (isProduction2 && bars.length === 0) {
        return /* @__PURE__ */ jsxs15("div", { className: "flex flex-col items-center justify-center h-full text-zinc-400", children: [
          /* @__PURE__ */ jsx16("p", { className: "text-sm w-full text-left text-white mb-1.5", children: "No data available" }),
          /* @__PURE__ */ jsx16("p", { className: "text-x w-full text-lefts", children: "No data was collected during this period" })
        ] });
      }
      if (bars.length === 0) {
        return /* @__PURE__ */ jsxs15("div", { className: "flex flex-col items-center justify-center h-full text-zinc-400", children: [
          /* @__PURE__ */ jsx16("p", { className: "text-sm w-full text-left text-white mb-1.5", children: "No renders collected" }),
          /* @__PURE__ */ jsx16("p", { className: "text-x w-full text-lefts", children: "There were no renders during this period" })
        ] });
      }
    }),
    bars.toSorted((a, b) => b.totalTime - a.totalTime).map((bar) => /* @__PURE__ */ jsx16(
      RenderBar,
      {
        bars,
        bar,
        debouncedMouseEnter,
        totalBarTime,
        isProduction: isProduction2
      },
      bar.kind === "render" ? bar.event.id : bar.kind
    ))
  ] });
};
var getTransitionState = (state) => {
  if (!state.current) {
    return "fading-in";
  }
  if (state.current.alpha > 0) {
    return "fading-out";
  }
  return "fading-in";
};
var RenderBar = ({
  bar,
  debouncedMouseEnter,
  totalBarTime,
  isProduction: isProduction2,
  bars,
  depth = 0
}) => {
  const { setNotificationState, setRoute } = useNotificationsContext();
  const [isExpanded, setIsExpanded] = useState13(false);
  const isLeaf = bar.kind === "render" ? bar.event.parents.size === 0 : true;
  const parentBars = bars.filter(
    (otherBar) => otherBar.kind === "render" && bar.kind === "render" ? bar.event.parents.has(otherBar.event.name) && otherBar.event.name !== bar.event.name : false
  );
  const missingParentNames = bar.kind === "render" ? Array.from(bar.event.parents).filter(
    (parentName) => !bars.some(
      (b) => b.kind === "render" && b.event.name === parentName
    )
  ) : [];
  const handleBarClick = () => {
    if (bar.kind === "render") {
      setNotificationState((prev) => ({
        ...prev,
        selectedFiber: bar.event
      }));
      setRoute({
        route: "render-explanation",
        routeMessage: null
      });
    } else {
      setRoute({
        route: "other-visualization",
        routeMessage: {
          kind: "auto-open-overview-accordion",
          name: bar.kind
        }
      });
    }
  };
  return /* @__PURE__ */ jsxs15("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs15(
      "div",
      {
        className: cn(["w-full flex items-center relative text-xs min-w-0"]),
        children: [
          /* @__PURE__ */ jsxs15(
            "button",
            {
              onMouseLeave: () => {
                debouncedMouseEnter.current.timer && clearTimeout(debouncedMouseEnter.current.timer);
                fadeOutHighlights();
              },
              onMouseEnter: async () => {
                const highlightBars = async () => {
                  debouncedMouseEnter.current.lastCallAt = Date.now();
                  if (bar.kind !== "render") {
                    const curr = HighlightStore.value.current ? HighlightStore.value.current : HighlightStore.value.kind === "transition" ? HighlightStore.value.transitionTo : null;
                    if (!curr) {
                      HighlightStore.value = {
                        kind: "idle",
                        current: null
                      };
                      return;
                    }
                    HighlightStore.value = {
                      kind: "move-out",
                      current: {
                        alpha: 0,
                        ...curr
                      }
                    };
                    return;
                  }
                  const state = HighlightStore.value;
                  const currentState = iife(() => {
                    switch (state.kind) {
                      case "transition": {
                        return state.transitionTo;
                      }
                      case "idle":
                      case "move-out": {
                        return state.current;
                      }
                    }
                  });
                  const stateRects = [];
                  if (state.kind === "transition") {
                    const transitionState = getTransitionState(state);
                    iife(() => {
                      switch (transitionState) {
                        case "fading-in": {
                          HighlightStore.value = {
                            kind: "transition",
                            current: state.transitionTo,
                            transitionTo: {
                              rects: stateRects,
                              alpha: 0,
                              name: bar.event.name
                            }
                          };
                          return;
                        }
                        case "fading-out": {
                          HighlightStore.value = {
                            kind: "transition",
                            current: HighlightStore.value.current ? {
                              alpha: 0,
                              ...HighlightStore.value.current
                            } : null,
                            transitionTo: {
                              rects: stateRects,
                              alpha: 0,
                              name: bar.event.name
                            }
                          };
                          return;
                        }
                      }
                    });
                  } else {
                    HighlightStore.value = {
                      kind: "transition",
                      transitionTo: {
                        rects: stateRects,
                        alpha: 0,
                        name: bar.event.name
                      },
                      current: currentState ? {
                        alpha: 0,
                        ...currentState
                      } : null
                    };
                  }
                  const trueElements = bar.event.elements.filter(
                    (element) => element instanceof Element
                  );
                  for await (const entries of getBatchedRectMap(trueElements)) {
                    entries.forEach(({ boundingClientRect }) => {
                      stateRects.push(boundingClientRect);
                    });
                    drawHighlights();
                  }
                };
                if (debouncedMouseEnter.current.lastCallAt && Date.now() - debouncedMouseEnter.current.lastCallAt < 200) {
                  debouncedMouseEnter.current.timer && clearTimeout(debouncedMouseEnter.current.timer);
                  debouncedMouseEnter.current.timer = setTimeout(() => {
                    highlightBars();
                  }, 200);
                  return;
                }
                highlightBars();
              },
              onClick: handleBarClick,
              className: cn([
                "h-full w-[90%] flex items-center hover:bg-[#0f0f0f] rounded-l-md min-w-0 relative"
              ]),
              children: [
                /* @__PURE__ */ jsx16(
                  "div",
                  {
                    style: {
                      minWidth: "fit-content",
                      width: `${bar.totalTime / totalBarTime * 100}%`
                    },
                    className: cn([
                      "flex items-center rounded-sm text-white text-xs h-[28px] shrink-0",
                      bar.kind === "render" && "bg-[#412162] group-hover:bg-[#5b2d89]",
                      bar.kind === "other-frame-drop" && "bg-[#44444a] group-hover:bg-[#6a6a6a]",
                      bar.kind === "other-javascript" && "bg-[#efd81a6b] group-hover:bg-[#efda1a2f]",
                      bar.kind === "other-not-javascript" && "bg-[#214379d4] group-hover:bg-[#21437982]"
                    ])
                  }
                ),
                /* @__PURE__ */ jsx16(
                  "div",
                  {
                    className: cn([
                      "absolute inset-0 flex items-center px-2",
                      "min-w-0"
                    ]),
                    children: /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-x-2 min-w-0 w-full", children: [
                      /* @__PURE__ */ jsx16("span", { className: cn(["truncate"]), children: iife(() => {
                        switch (bar.kind) {
                          case "other-frame-drop": {
                            return "JavaScript, DOM updates, Draw Frame";
                          }
                          case "other-javascript": {
                            return "JavaScript/React Hooks";
                          }
                          case "other-not-javascript": {
                            return "Update DOM and Draw New Frame";
                          }
                          case "render": {
                            return bar.event.name;
                          }
                        }
                      }) }),
                      bar.kind === "render" && isRenderMemoizable(bar.event) && /* @__PURE__ */ jsx16(
                        "div",
                        {
                          style: {
                            lineHeight: "10px"
                          },
                          className: cn([
                            "px-1 py-0.5 bg-[#6a369e] flex items-center rounded-sm font-semibold text-[8px] shrink-0"
                          ]),
                          children: "Memoizable"
                        }
                      )
                    ] })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs15(
            "button",
            {
              onClick: () => bar.kind === "render" && !isLeaf && setIsExpanded(!isExpanded),
              className: cn([
                "flex items-center min-w-fit shrink-0 rounded-r-md h-[28px]",
                !isLeaf && "hover:bg-[#0f0f0f]",
                bar.kind === "render" && !isLeaf ? "cursor-pointer" : "cursor-default"
              ]),
              children: [
                /* @__PURE__ */ jsx16("div", { className: "w-[20px] flex items-center justify-center", children: bar.kind === "render" && !isLeaf && /* @__PURE__ */ jsx16(
                  ChevronRight,
                  {
                    className: cn(
                      "transition-transform",
                      isExpanded && "rotate-90"
                    ),
                    size: 16
                  }
                ) }),
                /* @__PURE__ */ jsxs15(
                  "div",
                  {
                    style: {
                      minWidth: isLeaf ? "fit-content" : isProduction2 ? "30px" : "60px"
                    },
                    className: "flex items-center justify-end gap-x-1",
                    children: [
                      bar.kind === "render" && /* @__PURE__ */ jsxs15("span", { className: cn(["text-[10px]"]), children: [
                        "x",
                        bar.event.count
                      ] }),
                      (bar.kind !== "render" || !isProduction2) && /* @__PURE__ */ jsxs15("span", { className: "text-[10px] text-[#7346a0] pr-1", children: [
                        bar.totalTime < 1 ? "<1" : bar.totalTime.toFixed(0),
                        "ms"
                      ] })
                    ]
                  }
                )
              ]
            }
          ),
          depth === 0 && /* @__PURE__ */ jsx16(
            "div",
            {
              className: cn([
                "absolute right-0 top-1/2 transition-none -translate-y-1/2 bg-white text-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity mr-16",
                "pointer-events-none"
              ]),
              children: "Click to learn more"
            }
          )
        ]
      }
    ),
    isExpanded && (parentBars.length > 0 || missingParentNames.length > 0) && /* @__PURE__ */ jsxs15("div", { className: "pl-3 flex flex-col gap-y-1 mt-1", children: [
      parentBars.toSorted((a, b) => b.totalTime - a.totalTime).map((parentBar, i) => /* @__PURE__ */ jsx16(
        RenderBar,
        {
          depth: depth + 1,
          bar: parentBar,
          debouncedMouseEnter,
          totalBarTime,
          isProduction: isProduction2,
          bars
        },
        i
      )),
      missingParentNames.map((parentName) => /* @__PURE__ */ jsx16("div", { className: "w-full", children: /* @__PURE__ */ jsx16("div", { className: "w-full flex items-center relative text-xs", children: /* @__PURE__ */ jsxs15("div", { className: "h-full w-full flex items-center relative", children: [
        /* @__PURE__ */ jsx16("div", { className: "flex items-center rounded-sm text-white text-xs h-[28px] w-full" }),
        /* @__PURE__ */ jsx16("div", { className: "absolute inset-0 flex items-center px-2", children: /* @__PURE__ */ jsx16("span", { className: "truncate whitespace-nowrap text-white/70 w-full", children: parentName }) })
      ] }) }) }, parentName))
    ] })
  ] });
};

// src/web/views/notifications/render-explanation.tsx
import { useLayoutEffect, useState as useState14 } from "preact/hooks";
import { Fragment as Fragment10, jsx as jsx17, jsxs as jsxs16 } from "preact/jsx-runtime";
var RenderExplanation = ({
  selectedEvent: _,
  selectedFiber
}) => {
  const { setRoute } = useNotificationsContext();
  const [tipisShown, setTipIsShown] = useState14(true);
  const [isProduction2] = useState14(getIsProduction());
  useLayoutEffect(() => {
    const res = localStorage.getItem("react-scan-tip-shown");
    const asBool = res === "true" ? true : res === "false" ? false : null;
    if (asBool === null) {
      setTipIsShown(true);
      localStorage.setItem("react-scan-tip-is-shown", "true");
      return;
    }
    if (!asBool) {
      setTipIsShown(false);
    }
  }, []);
  const isMemoizable = selectedFiber.changes.context.length === 0 && selectedFiber.changes.props.length === 0 && selectedFiber.changes.state.length === 0;
  return /* @__PURE__ */ jsxs16(
    "div",
    {
      className: cn([
        "w-full min-h-fit h-full flex flex-col py-4 pt-0 rounded-sm"
      ]),
      children: [
        /* @__PURE__ */ jsxs16("div", { className: cn(["flex items-start gap-x-4 "]), children: [
          /* @__PURE__ */ jsxs16(
            "button",
            {
              onClick: () => {
                setRoute({
                  route: "render-visualization",
                  routeMessage: null
                });
              },
              className: cn([
                "text-white hover:bg-[#34343b] flex gap-x-1 justify-center items-center mb-4 w-fit px-2.5 py-1.5 text-xs rounded-sm bg-[#18181B]"
              ]),
              children: [
                /* @__PURE__ */ jsx17(ArrowLeft, { size: 14 }),
                " ",
                /* @__PURE__ */ jsx17("span", { children: "Overview" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs16("div", { className: cn(["flex flex-col gap-y-1"]), children: [
            /* @__PURE__ */ jsx17(
              "div",
              {
                className: cn(["text-sm font-bold text-white overflow-x-hidden"]),
                children: /* @__PURE__ */ jsx17("div", { className: "flex items-center gap-x-2 truncate", children: selectedFiber.name })
              }
            ),
            /* @__PURE__ */ jsxs16("div", { className: cn(["flex gap-x-2"]), children: [
              !isProduction2 && /* @__PURE__ */ jsx17(Fragment10, { children: /* @__PURE__ */ jsxs16("div", { className: cn(["text-xs text-gray-400"]), children: [
                "\u2022 Render time: ",
                selectedFiber.totalTime.toFixed(0),
                "ms"
              ] }) }),
              /* @__PURE__ */ jsxs16("div", { className: cn(["text-xs text-gray-400 mb-4"]), children: [
                "\u2022 Renders: ",
                selectedFiber.count,
                "x"
              ] })
            ] })
          ] })
        ] }),
        tipisShown && !isMemoizable && /* @__PURE__ */ jsxs16(
          "div",
          {
            className: cn([
              "w-full mb-4 bg-[#0A0A0A] border border-[#27272A] rounded-sm overflow-hidden flex relative"
            ]),
            children: [
              /* @__PURE__ */ jsx17(
                "button",
                {
                  onClick: () => {
                    setTipIsShown(false);
                    localStorage.setItem("react-scan-tip-shown", "false");
                  },
                  className: cn([
                    "absolute right-2 top-2 rounded-sm p-1 hover:bg-[#18181B]"
                  ]),
                  children: /* @__PURE__ */ jsx17(CloseIcon, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsx17("div", { className: cn(["w-1 bg-[#d36cff]"]) }),
              /* @__PURE__ */ jsxs16("div", { className: cn(["flex-1"]), children: [
                /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn(["px-3 py-2 text-gray-100 text-xs font-semibold"]),
                    children: "How to stop renders"
                  }
                ),
                /* @__PURE__ */ jsx17("div", { className: cn(["px-3 pb-2 text-gray-400 text-[10px]"]), children: "Stop the following props, state and context from changing between renders, and wrap the component in React.memo if not already" })
              ] })
            ]
          }
        ),
        isMemoizable && /* @__PURE__ */ jsxs16(
          "div",
          {
            className: cn([
              "w-full mb-4 bg-[#0A0A0A] border border-[#27272A] rounded-sm overflow-hidden flex"
            ]),
            children: [
              /* @__PURE__ */ jsx17("div", { className: cn(["w-1 bg-[#d36cff]"]) }),
              /* @__PURE__ */ jsxs16("div", { className: cn(["flex-1"]), children: [
                /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn(["px-3 py-2 text-gray-100 text-sm font-semibold"]),
                    children: "No changes detected"
                  }
                ),
                /* @__PURE__ */ jsx17("div", { className: cn(["px-3 pb-2 text-gray-400 text-xs"]), children: "This component would not have rendered if it was memoized" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs16("div", { className: cn(["flex w-full"]), children: [
          /* @__PURE__ */ jsxs16(
            "div",
            {
              className: cn([
                "flex flex-col border border-[#27272A] rounded-l-sm overflow-hidden w-1/3"
              ]),
              children: [
                /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      "text-[14px] font-semibold px-2 py-2 bg-[#18181B] text-white flex justify-center"
                    ]),
                    children: "Changed Props"
                  }
                ),
                selectedFiber.changes.props.length > 0 ? selectedFiber.changes.props.toSorted((a, b) => b.count - a.count).map((change) => /* @__PURE__ */ jsxs16(
                  "div",
                  {
                    className: cn([
                      "flex flex-col justify-between items-center border-t overflow-x-auto border-[#27272A] px-1 py-1 text-wrap bg-[#0A0A0A] text-[10px]"
                    ]),
                    children: [
                      /* @__PURE__ */ jsx17("span", { className: cn(["text-white "]), children: change.name }),
                      /* @__PURE__ */ jsxs16(
                        "div",
                        {
                          className: cn([" text-[8px]  text-[#d36cff] pl-1 py-1 "]),
                          children: [
                            change.count,
                            "/",
                            selectedFiber.count,
                            "x"
                          ]
                        }
                      )
                    ]
                  },
                  change.name
                )) : /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      "flex items-center justify-center h-full bg-[#0A0A0A] text-[#A1A1AA] border-t border-[#27272A]"
                    ]),
                    children: "No changes"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs16(
            "div",
            {
              className: cn([
                "flex flex-col border border-[#27272A] border-l-0 overflow-hidden w-1/3"
              ]),
              children: [
                /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      " text-[14px] font-semibold px-2 py-2 bg-[#18181B] text-white flex justify-center"
                    ]),
                    children: "Changed State"
                  }
                ),
                selectedFiber.changes.state.length > 0 ? selectedFiber.changes.state.toSorted((a, b) => b.count - a.count).map((change) => /* @__PURE__ */ jsxs16(
                  "div",
                  {
                    className: cn([
                      "flex flex-col justify-between items-center border-t overflow-x-auto border-[#27272A] px-1 py-1 text-wrap bg-[#0A0A0A] text-[10px]"
                    ]),
                    children: [
                      /* @__PURE__ */ jsxs16("span", { className: cn(["text-white "]), children: [
                        "index ",
                        change.index
                      ] }),
                      /* @__PURE__ */ jsxs16(
                        "div",
                        {
                          className: cn([
                            "rounded-full  text-[#d36cff] pl-1 py-1 text-[8px]"
                          ]),
                          children: [
                            change.count,
                            "/",
                            selectedFiber.count,
                            "x"
                          ]
                        }
                      )
                    ]
                  },
                  change.index
                )) : /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      "flex items-center justify-center h-full bg-[#0A0A0A] text-[#A1A1AA] border-t border-[#27272A]"
                    ]),
                    children: "No changes"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs16(
            "div",
            {
              className: cn([
                "flex flex-col border border-[#27272A] border-l-0 rounded-r-sm overflow-hidden w-1/3"
              ]),
              children: [
                /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      " text-[14px] font-semibold px-2 py-2 bg-[#18181B] text-white flex justify-center"
                    ]),
                    children: "Changed Context"
                  }
                ),
                selectedFiber.changes.context.length > 0 ? selectedFiber.changes.context.toSorted((a, b) => b.count - a.count).map((change) => /* @__PURE__ */ jsxs16(
                  "div",
                  {
                    className: cn([
                      "flex flex-col justify-between items-center border-t  border-[#27272A] px-1 py-1 bg-[#0A0A0A] text-[10px] overflow-x-auto"
                    ]),
                    children: [
                      /* @__PURE__ */ jsx17("span", { className: cn(["text-white "]), children: change.name }),
                      /* @__PURE__ */ jsxs16(
                        "div",
                        {
                          className: cn([
                            "rounded-full text-[#d36cff] pl-1 py-1 text-[8px] text-wrap"
                          ]),
                          children: [
                            change.count,
                            "/",
                            selectedFiber.count,
                            "x"
                          ]
                        }
                      )
                    ]
                  },
                  change.name
                )) : /* @__PURE__ */ jsx17(
                  "div",
                  {
                    className: cn([
                      "flex items-center justify-center h-full bg-[#0A0A0A] text-[#A1A1AA] border-t border-[#27272A] py-2"
                    ]),
                    children: "No changes"
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
};

// src/web/views/notifications/details-routes.tsx
import { Fragment as Fragment11, jsx as jsx18, jsxs as jsxs17 } from "preact/jsx-runtime";
var DetailsRoutes = () => {
  const { notificationState, setNotificationState } = useNotificationsContext();
  const [dots, setDots] = useState15("...");
  const containerRef = useRef10(null);
  useEffect12(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);
  if (!notificationState.selectedEvent) {
    return /* @__PURE__ */ jsxs17(
      "div",
      {
        ref: containerRef,
        className: cn([
          "h-full w-full flex flex-col items-center justify-center relative py-2 px-4"
        ]),
        children: [
          /* @__PURE__ */ jsx18(
            "div",
            {
              className: cn([
                "p-2 flex justify-center items-center border-[#27272A] absolute top-0 right-0"
              ]),
              children: /* @__PURE__ */ jsx18(
                "button",
                {
                  onClick: () => {
                    signalWidgetViews.value = {
                      view: "none"
                    };
                  },
                  children: /* @__PURE__ */ jsx18(CloseIcon, { size: 18, className: "text-[#6F6F78]" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx18(
            "div",
            {
              className: cn([
                "flex flex-col items-start pt-5 bg-[#0A0A0A] p-5 rounded-sm max-w-md",
                " shadow-lg"
              ]),
              children: /* @__PURE__ */ jsxs17("div", { className: cn(["flex flex-col items-start gap-y-4"]), children: [
                /* @__PURE__ */ jsx18("div", { className: cn(["flex items-center"]), children: /* @__PURE__ */ jsxs17("span", { className: cn(["text-zinc-400 font-medium text-[17px]"]), children: [
                  "Scanning for slowdowns",
                  dots
                ] }) }),
                notificationState.events.length !== 0 && /* @__PURE__ */ jsxs17("p", { className: cn(["text-xs"]), children: [
                  "Click on an item in the",
                  " ",
                  /* @__PURE__ */ jsx18("span", { className: cn(["text-purple-400"]), children: "History" }),
                  " list to get started"
                ] }),
                /* @__PURE__ */ jsx18("p", { className: cn(["text-zinc-600 text-xs"]), children: "You don't need to keep this panel open for React Scan to record slowdowns" }),
                /* @__PURE__ */ jsx18("p", { className: cn(["text-zinc-600 text-xs"]), children: "Enable audio alerts to hear a delightful ding every time a large slowdown is recorded" }),
                /* @__PURE__ */ jsx18(
                  "button",
                  {
                    onClick: () => {
                      if (notificationState.audioNotificationsOptions.enabled) {
                        setNotificationState((prev) => {
                          var _a, _b;
                          if (((_a = prev.audioNotificationsOptions.audioContext) == null ? void 0 : _a.state) !== "closed") {
                            (_b = prev.audioNotificationsOptions.audioContext) == null ? void 0 : _b.close();
                          }
                          localStorage.setItem("react-scan-notifications-audio", "false");
                          return {
                            ...prev,
                            audioNotificationsOptions: {
                              audioContext: null,
                              enabled: false
                            }
                          };
                        });
                        return;
                      }
                      localStorage.setItem("react-scan-notifications-audio", "true");
                      const audioContext = new AudioContext();
                      playNotificationSound(audioContext);
                      setNotificationState((prev) => ({
                        ...prev,
                        audioNotificationsOptions: {
                          enabled: true,
                          audioContext
                        }
                      }));
                    },
                    className: cn([
                      "px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-sm w-full",
                      " text-sm flex items-center gap-x-2 justify-center"
                    ]),
                    children: notificationState.audioNotificationsOptions.enabled ? /* @__PURE__ */ jsx18(Fragment11, { children: /* @__PURE__ */ jsx18("span", { className: "flex items-center gap-x-1", children: "Disable audio alerts" }) }) : /* @__PURE__ */ jsx18(Fragment11, { children: /* @__PURE__ */ jsx18("span", { className: "flex items-center gap-x-1", children: "Enable audio alerts" }) })
                  }
                )
              ] })
            }
          )
        ]
      }
    );
  }
  switch (notificationState.route) {
    case "render-visualization": {
      return /* @__PURE__ */ jsx18(TabLayout, { children: /* @__PURE__ */ jsx18(RenderBarChart, { selectedEvent: notificationState.selectedEvent }) });
    }
    case "render-explanation": {
      if (!notificationState.selectedFiber) {
        throw new Error(
          "Invariant: must have selected fiber when viewing render explanation"
        );
      }
      return /* @__PURE__ */ jsx18(TabLayout, { children: /* @__PURE__ */ jsx18(
        RenderExplanation,
        {
          selectedFiber: notificationState.selectedFiber,
          selectedEvent: notificationState.selectedEvent
        }
      ) });
    }
    case "other-visualization": {
      return /* @__PURE__ */ jsx18(TabLayout, { children: /* @__PURE__ */ jsx18(
        "div",
        {
          className: cn(["flex w-full h-full flex-col overflow-y-auto"]),
          id: "overview-scroll-container",
          children: /* @__PURE__ */ jsx18(
            OtherVisualization,
            {
              selectedEvent: notificationState.selectedEvent
            }
          )
        }
      ) });
    }
    case "optimize": {
      return /* @__PURE__ */ jsx18(TabLayout, { children: /* @__PURE__ */ jsx18(Optimize, { selectedEvent: notificationState.selectedEvent }) });
    }
  }
  notificationState.route;
};
var TabLayout = ({ children }) => {
  const { notificationState } = useNotificationsContext();
  if (!notificationState.selectedEvent) {
    throw new Error(
      "Invariant: d must have selected event when viewing render explanation"
    );
  }
  return /* @__PURE__ */ jsxs17("div", { className: cn([`w-full h-full flex flex-col gap-y-2`]), children: [
    /* @__PURE__ */ jsx18("div", { className: cn(["h-[50px] w-full"]), children: /* @__PURE__ */ jsx18(NotificationTabs, { selectedEvent: notificationState.selectedEvent }) }),
    /* @__PURE__ */ jsx18(
      "div",
      {
        className: cn(["h-calc(100%-50px) flex flex-col overflow-y-auto px-3"]),
        children
      }
    )
  ] });
};

// src/web/views/notifications/notification-header.tsx
import { jsx as jsx19, jsxs as jsxs18 } from "preact/jsx-runtime";
var NotificationHeader = ({
  selectedEvent
}) => {
  const severity = getEventSeverity(selectedEvent);
  switch (selectedEvent.kind) {
    case "interaction": {
      return (
        // h-[48px] is a hack to adjust for header size
        /* @__PURE__ */ jsx19(
          "div",
          {
            className: cn([`w-full flex border-b border-[#27272A] min-h-[48px]`]),
            children: /* @__PURE__ */ jsxs18(
              "div",
              {
                className: cn([
                  "min-w-fit w-full justify-start flex items-center border-r border-[#27272A] pl-5 pr-2 text-sm gap-x-4"
                ]),
                children: [
                  /* @__PURE__ */ jsxs18("div", { className: cn(["flex items-center gap-x-2 "]), children: [
                    /* @__PURE__ */ jsx19("span", { className: cn(["text-[#5a5a5a] mr-0.5"]), children: selectedEvent.type === "click" ? "Clicked " : "Typed in " }),
                    /* @__PURE__ */ jsx19("span", { children: getComponentName(selectedEvent.componentPath) }),
                    /* @__PURE__ */ jsxs18(
                      "div",
                      {
                        className: cn([
                          "w-fit flex items-center justify-center h-fit text-white px-1 rounded-sm font-semibold text-[10px] whitespace-nowrap",
                          severity === "low" && "bg-green-500/50",
                          severity === "needs-improvement" && "bg-[#b77116]",
                          severity === "high" && "bg-[#b94040]"
                        ]),
                        children: [
                          getTotalTime(selectedEvent.timing).toFixed(0),
                          "ms processing time"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx19(
                    "div",
                    {
                      className: cn(["flex items-center gap-x-2  justify-end ml-auto"]),
                      children: /* @__PURE__ */ jsx19(
                        "div",
                        {
                          className: cn([
                            "p-2 flex justify-center items-center border-[#27272A]"
                          ]),
                          children: /* @__PURE__ */ jsx19(
                            "button",
                            {
                              onClick: () => {
                                signalWidgetViews.value = {
                                  view: "none"
                                };
                              },
                              title: "Close",
                              children: /* @__PURE__ */ jsx19(CloseIcon, { size: 18, className: "text-[#6F6F78]" })
                            }
                          )
                        }
                      )
                    }
                  )
                ]
              }
            )
          }
        )
      );
    }
    case "dropped-frames": {
      return /* @__PURE__ */ jsx19(
        "div",
        {
          className: cn([`w-full flex border-b border-[#27272A] min-h-[48px]`]),
          children: /* @__PURE__ */ jsxs18(
            "div",
            {
              className: cn([
                "min-w-fit w-full justify-start flex items-center border-r border-[#27272A] pl-5 pr-2 text-sm gap-x-4"
              ]),
              children: [
                /* @__PURE__ */ jsxs18("div", { className: cn(["flex items-center gap-x-2 "]), children: [
                  "FPS Drop",
                  /* @__PURE__ */ jsxs18(
                    "div",
                    {
                      className: cn([
                        "w-fit flex items-center justify-center h-fit text-white px-1 rounded-sm font-semibold text-[10px] whitespace-nowrap",
                        severity === "low" && "bg-green-500/50",
                        severity === "needs-improvement" && "bg-[#b77116]",
                        severity === "high" && "bg-[#b94040]"
                      ]),
                      children: [
                        "dropped to ",
                        selectedEvent.fps,
                        " FPS"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx19(
                  "div",
                  {
                    className: cn([
                      "flex items-center gap-x-2 w-2/4 justify-end ml-auto"
                    ]),
                    children: /* @__PURE__ */ jsx19(
                      "div",
                      {
                        className: cn([
                          "p-2 flex justify-center items-center border-[#27272A]"
                        ]),
                        children: /* @__PURE__ */ jsx19(
                          "button",
                          {
                            onClick: () => {
                              signalWidgetViews.value = {
                                view: "none"
                              };
                            },
                            children: /* @__PURE__ */ jsx19(CloseIcon, { size: 18, className: "text-[#6F6F78]" })
                          }
                        )
                      }
                    )
                  }
                )
              ]
            }
          )
        }
      );
    }
  }
};

// src/web/views/notifications/slowdown-history.tsx
import { useEffect as useEffect14, useRef as useRef12, useState as useState17 } from "preact/compat";

// src/web/views/notifications/collapsed-event.tsx
import { useEffect as useEffect13, useRef as useRef11, useState as useState16 } from "preact/hooks";
import { jsx as jsx20, jsxs as jsxs19 } from "preact/jsx-runtime";
var useNestedFlash = ({
  flashingItemsCount,
  totalEvents
}) => {
  const [newFlash, setNewFlash] = useState16(false);
  const flashedFor = useRef11(0);
  const lastFlashTime = useRef11(0);
  useEffect13(() => {
    if (flashedFor.current >= totalEvents) {
      return;
    }
    const now = Date.now();
    const debounceTime = 250;
    const timeSinceLastFlash = now - lastFlashTime.current;
    if (timeSinceLastFlash >= debounceTime) {
      setNewFlash(false);
      const timeout2 = setTimeout(() => {
        flashedFor.current = totalEvents;
        lastFlashTime.current = Date.now();
        setNewFlash(true);
        setTimeout(() => {
          setNewFlash(false);
        }, 2e3);
      }, 50);
      return () => clearTimeout(timeout2);
    } else {
      const delayNeeded = debounceTime - timeSinceLastFlash;
      const timeout2 = setTimeout(() => {
        setNewFlash(false);
        setTimeout(() => {
          flashedFor.current = totalEvents;
          lastFlashTime.current = Date.now();
          setNewFlash(true);
          setTimeout(() => {
            setNewFlash(false);
          }, 2e3);
        }, 50);
      }, delayNeeded);
      return () => clearTimeout(timeout2);
    }
  }, [flashingItemsCount]);
  return newFlash;
};
var CollapsedItem = ({
  item,
  shouldFlash
}) => {
  var _a, _b;
  const [expanded, setExpanded] = useState16(false);
  const severity = item.events.map(getEventSeverity).reduce((prev, curr) => {
    switch (curr) {
      case "high": {
        return "high";
      }
      case "needs-improvement": {
        return prev === "high" ? "high" : "needs-improvement";
      }
      case "low": {
        return prev;
      }
    }
  }, "low");
  const flashingItemsCount = item.events.reduce(
    (prev, curr) => shouldFlash(curr.id) ? prev + 1 : prev,
    0
  );
  const shouldFlashAgain = useNestedFlash({
    flashingItemsCount,
    totalEvents: item.events.length
  });
  return /* @__PURE__ */ jsxs19("div", { className: cn(["flex flex-col gap-y-0.5"]), children: [
    /* @__PURE__ */ jsxs19(
      "button",
      {
        onClick: () => setExpanded((expanded2) => !expanded2),
        className: cn([
          "pl-2 py-1.5  text-sm flex items-center rounded-sm hover:bg-[#18181B] relative overflow-hidden",
          shouldFlashAgain && !expanded && "after:absolute after:inset-0 after:bg-purple-500/30 after:animate-[fadeOut_1s_ease-out_forwards]"
        ]),
        children: [
          /* @__PURE__ */ jsxs19(
            "div",
            {
              className: cn([
                "w-4/5 flex items-center justify-start h-full text-xs truncate gap-x-1.5"
              ]),
              children: [
                /* @__PURE__ */ jsx20("span", { className: cn(["min-w-fit"]), children: /* @__PURE__ */ jsx20(
                  ChevronRight,
                  {
                    className: cn([
                      "text-[#A1A1AA] transition-transform",
                      expanded ? "rotate-90" : ""
                    ]),
                    size: 14
                  },
                  `chevron-${item.timestamp}`
                ) }),
                /* @__PURE__ */ jsx20("span", { className: cn(["text-xs"]), children: item.kind === "collapsed-frame-drops" ? "FPS Drops" : getComponentName((_b = (_a = item.events.at(0)) == null ? void 0 : _a.componentPath) != null ? _b : []) })
              ]
            }
          ),
          /* @__PURE__ */ jsx20(
            "div",
            {
              className: cn(["ml-auto min-w-fit flex justify-end items-center"]),
              children: /* @__PURE__ */ jsxs19(
                "div",
                {
                  style: {
                    lineHeight: "10px"
                  },
                  className: cn([
                    "w-fit flex items-center text-[10px] justify-center h-full text-white px-1 py-1 rounded-sm font-semibold",
                    severity === "low" && "bg-green-500/60",
                    severity === "needs-improvement" && "bg-[#b77116] text-[10px]",
                    severity === "high" && "bg-[#b94040]"
                  ]),
                  children: [
                    "x",
                    item.events.length
                  ]
                }
              )
            }
          )
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsx20(IndentedContent, { children: item.events.toSorted((a, b) => b.timestamp - a.timestamp).map((event) => /* @__PURE__ */ jsx20(
      SlowdownHistoryItem,
      {
        event,
        shouldFlash: shouldFlash(event.id)
      }
    )) })
  ] });
};
var IndentedContent = ({
  children
}) => /* @__PURE__ */ jsxs19("div", { className: "relative pl-6 flex flex-col gap-y-1", children: [
  /* @__PURE__ */ jsx20("div", { className: "absolute left-3 top-0 bottom-0 w-px bg-[#27272A]" }),
  children
] });

// src/web/views/notifications/slowdown-history.tsx
import { jsx as jsx21, jsxs as jsxs20 } from "preact/jsx-runtime";
var useFlashManager = (events) => {
  const prevEventsRef = useRef12([]);
  const [newEventIds, setNewEventIds] = useState17(/* @__PURE__ */ new Set());
  const isInitialMount = useRef12(true);
  useEffect14(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevEventsRef.current = events;
      return;
    }
    const currentIds = new Set(events.map((e) => e.id));
    const prevIds = new Set(prevEventsRef.current.map((e) => e.id));
    const newIds = /* @__PURE__ */ new Set();
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) {
        newIds.add(id);
      }
    });
    if (newIds.size > 0) {
      setNewEventIds(newIds);
      setTimeout(() => {
        setNewEventIds(/* @__PURE__ */ new Set());
      }, 2e3);
    }
    prevEventsRef.current = events;
  }, [events]);
  return (id) => newEventIds.has(id);
};
var useFlash = ({ shouldFlash }) => {
  const [isFlashing, setIsFlashing] = useState17(shouldFlash);
  useEffect14(() => {
    if (shouldFlash) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 1e3);
      return () => clearTimeout(timer);
    }
  }, [shouldFlash]);
  return isFlashing;
};
var SlowdownHistoryItem = ({
  event,
  shouldFlash
}) => {
  var _a, _b;
  const { notificationState, setNotificationState } = useNotificationsContext();
  const severity = getEventSeverity(event);
  const isFlashing = useFlash({ shouldFlash });
  switch (event.kind) {
    case "interaction": {
      return /* @__PURE__ */ jsxs20(
        "button",
        {
          onClick: () => {
            setNotificationState((prev) => ({
              ...prev,
              selectedEvent: event,
              route: "render-visualization",
              selectedFiber: null
            }));
          },
          className: cn([
            "pl-2 py-1.5  text-sm flex w-full items-center rounded-sm hover:bg-[#18181B] relative overflow-hidden",
            event.id === ((_a = notificationState.selectedEvent) == null ? void 0 : _a.id) && "bg-[#18181B]",
            isFlashing && "after:absolute after:inset-0 after:bg-purple-500/30 after:animate-[fadeOut_1s_ease-out_forwards]"
          ]),
          children: [
            /* @__PURE__ */ jsxs20(
              "div",
              {
                className: cn([
                  "w-4/5 flex items-center justify-start h-full gap-x-1.5"
                ]),
                children: [
                  /* @__PURE__ */ jsx21("span", { className: cn(["min-w-fit text-xs"]), children: iife(() => {
                    switch (event.type) {
                      case "click": {
                        return /* @__PURE__ */ jsx21(PointerIcon, { size: 14 });
                      }
                      case "keyboard": {
                        return /* @__PURE__ */ jsx21(KeyboardIcon, { size: 14 });
                      }
                    }
                  }) }),
                  /* @__PURE__ */ jsx21("span", { className: cn(["text-xs pr-1 truncate"]), children: getComponentName(event.componentPath) })
                ]
              }
            ),
            /* @__PURE__ */ jsx21(
              "div",
              {
                className: cn([" min-w-fit flex justify-end items-center ml-auto"]),
                children: /* @__PURE__ */ jsx21(
                  "div",
                  {
                    style: {
                      lineHeight: "10px"
                    },
                    className: cn([
                      "gap-x-0.5 w-fit flex items-end justify-center h-full text-white px-1 py-1 rounded-sm font-semibold text-[10px]",
                      severity === "low" && "bg-green-500/50",
                      severity === "needs-improvement" && "bg-[#b77116] text-[10px]",
                      severity === "high" && "bg-[#b94040]"
                    ]),
                    children: /* @__PURE__ */ jsxs20(
                      "div",
                      {
                        style: {
                          lineHeight: "10px"
                        },
                        className: cn(["text-[10px] text-white flex items-end"]),
                        children: [
                          getTotalTime(event.timing).toFixed(0),
                          "ms"
                        ]
                      }
                    )
                  }
                )
              }
            )
          ]
        }
      );
    }
    case "dropped-frames": {
      return /* @__PURE__ */ jsxs20(
        "button",
        {
          onClick: () => {
            setNotificationState((prev) => ({
              ...prev,
              selectedEvent: event,
              // explicitly force back to render-visualization since the user might get confused when they don't see the detailed view immediately when clicking the view
              route: "render-visualization",
              selectedFiber: null
            }));
          },
          className: cn([
            "pl-2 py-1.5  w-full text-sm flex items-center rounded-sm hover:bg-[#18181B] relative overflow-hidden",
            event.id === ((_b = notificationState.selectedEvent) == null ? void 0 : _b.id) && "bg-[#18181B]",
            isFlashing && "after:absolute after:inset-0 after:bg-purple-500/30 after:animate-[fadeOut_1s_ease-out_forwards]"
          ]),
          children: [
            /* @__PURE__ */ jsxs20(
              "div",
              {
                className: cn([
                  "w-4/5 flex items-center justify-start h-full text-xs truncate"
                ]),
                children: [
                  /* @__PURE__ */ jsx21(TrendingDownIcon, { size: 14, className: "mr-1.5" }),
                  " FPS Drop"
                ]
              }
            ),
            /* @__PURE__ */ jsx21(
              "div",
              {
                className: cn([" min-w-fit flex justify-end items-center ml-auto"]),
                children: /* @__PURE__ */ jsxs20(
                  "div",
                  {
                    style: {
                      lineHeight: "10px"
                    },
                    className: cn([
                      "w-fit flex items-center justify-center h-full text-white px-1 py-1 rounded-sm text-[10px] font-bold",
                      severity === "low" && "bg-green-500/60",
                      severity === "needs-improvement" && "bg-[#b77116] text-[10px]",
                      severity === "high" && "bg-[#b94040]"
                    ]),
                    children: [
                      event.fps,
                      " FPS"
                    ]
                  }
                )
              }
            )
          ]
        }
      );
    }
  }
};
var collapseEvents = (events) => {
  const newEvents = events.reduce((prev, curr) => {
    const lastEvent = prev.at(-1);
    if (!lastEvent) {
      return [
        {
          kind: "single",
          event: curr,
          timestamp: curr.timestamp
        }
      ];
    }
    switch (lastEvent.kind) {
      case "collapsed-keyboard": {
        if (curr.kind === "interaction" && curr.type === "keyboard" && // must be on the same semantic component, it would be ideal to compare on fiberId, but i digress
        curr.componentPath.join("-") === lastEvent.events[0].componentPath.join("-")) {
          const eventsWithoutLast = prev.filter((e) => e !== lastEvent);
          return [
            ...eventsWithoutLast,
            {
              kind: "collapsed-keyboard",
              events: [...lastEvent.events, curr],
              timestamp: Math.max(
                ...[...lastEvent.events, curr].map((e) => e.timestamp)
              )
            }
          ];
        }
        return [
          ...prev,
          {
            kind: "single",
            event: curr,
            timestamp: curr.timestamp
          }
        ];
      }
      case "single": {
        if (lastEvent.event.kind === "interaction" && lastEvent.event.type === "keyboard" && curr.kind === "interaction" && curr.type === "keyboard" && lastEvent.event.componentPath.join("-") === curr.componentPath.join("-")) {
          const eventsWithoutLast = prev.filter((e) => e !== lastEvent);
          return [
            ...eventsWithoutLast,
            {
              kind: "collapsed-keyboard",
              events: [lastEvent.event, curr],
              timestamp: Math.max(lastEvent.event.timestamp, curr.timestamp)
            }
          ];
        }
        if (lastEvent.event.kind === "dropped-frames" && curr.kind === "dropped-frames") {
          const eventsWithoutLast = prev.filter((e) => e !== lastEvent);
          return [
            ...eventsWithoutLast,
            {
              kind: "collapsed-frame-drops",
              events: [lastEvent.event, curr],
              timestamp: Math.max(lastEvent.event.timestamp, curr.timestamp)
            }
          ];
        }
        return [
          ...prev,
          {
            kind: "single",
            event: curr,
            timestamp: curr.timestamp
          }
        ];
      }
      case "collapsed-frame-drops": {
        if (curr.kind === "dropped-frames") {
          const eventsWithoutLast = prev.filter((e) => e !== lastEvent);
          return [
            ...eventsWithoutLast,
            {
              kind: "collapsed-frame-drops",
              events: [...lastEvent.events, curr],
              timestamp: Math.max(
                ...[...lastEvent.events, curr].map((e) => e.timestamp)
              )
            }
          ];
        }
        return [
          ...prev,
          {
            kind: "single",
            event: curr,
            timestamp: curr.timestamp
          }
        ];
      }
    }
  }, []);
  return newEvents;
};
var useLaggedEvents = (lagMs = 150) => {
  const { notificationState } = useNotificationsContext();
  const [laggedEvents, setLaggedEvents] = useState17(notificationState.events);
  useEffect14(() => {
    setTimeout(() => {
      setLaggedEvents(notificationState.events);
    }, lagMs);
  }, [notificationState.events]);
  return [laggedEvents, setLaggedEvents];
};
var SlowdownHistory = () => {
  const { notificationState, setNotificationState } = useNotificationsContext();
  const shouldFlash = useFlashManager(notificationState.events);
  const [laggedEvents, setLaggedEvents] = useLaggedEvents();
  const collapsedEvents = collapseEvents(laggedEvents).toSorted(
    (a, b) => b.timestamp - a.timestamp
  );
  return /* @__PURE__ */ jsxs20(
    "div",
    {
      className: cn([
        `w-full h-full gap-y-2 flex flex-col border-r border-[#27272A] overflow-y-auto`
      ]),
      children: [
        /* @__PURE__ */ jsxs20(
          "div",
          {
            className: cn([
              "text-sm text-[#65656D] pl-3 pr-1 w-full flex items-center justify-between"
            ]),
            children: [
              /* @__PURE__ */ jsx21("span", { children: "History" }),
              /* @__PURE__ */ jsx21(
                Popover,
                {
                  wrapperProps: {
                    className: "h-full flex items-center justify-center ml-auto"
                  },
                  triggerContent: /* @__PURE__ */ jsx21(
                    "button",
                    {
                      className: cn(["hover:bg-[#18181B] rounded-full p-2"]),
                      title: "Clear all events",
                      onClick: () => {
                        toolbarEventStore.getState().actions.clear();
                        setNotificationState((prev) => ({
                          ...prev,
                          selectedEvent: null,
                          selectedFiber: null,
                          route: prev.route === "other-visualization" ? "other-visualization" : "render-visualization"
                        }));
                        setLaggedEvents([]);
                      },
                      children: /* @__PURE__ */ jsx21(ClearIcon, { className: cn([""]), size: 16 })
                    }
                  ),
                  children: /* @__PURE__ */ jsx21("div", { className: cn(["w-full flex justify-center"]), children: "Clear all events" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs20("div", { className: cn(["flex flex-col px-1 gap-y-1"]), children: [
          collapsedEvents.length === 0 && /* @__PURE__ */ jsx21(
            "div",
            {
              className: cn([
                "flex items-center justify-center text-zinc-500 text-sm py-4"
              ]),
              children: "No Events"
            }
          ),
          collapsedEvents.map(
            (historyItem) => iife(() => {
              switch (historyItem.kind) {
                case "collapsed-keyboard": {
                  return /* @__PURE__ */ jsx21(CollapsedItem, { shouldFlash, item: historyItem });
                }
                case "single": {
                  return /* @__PURE__ */ jsx21(
                    SlowdownHistoryItem,
                    {
                      event: historyItem.event,
                      shouldFlash: shouldFlash(historyItem.event.id)
                    },
                    historyItem.event.id
                  );
                }
                case "collapsed-frame-drops": {
                  return /* @__PURE__ */ jsx21(CollapsedItem, { shouldFlash, item: historyItem });
                }
              }
            })
          )
        ] })
      ]
    }
  );
};

// src/web/views/notifications/notifications.tsx
import { Fragment as Fragment12, jsx as jsx22, jsxs as jsxs21 } from "preact/jsx-runtime";
var getGroupedFiberRenders = (fiberRenders) => {
  const res = Object.values(fiberRenders).map((render2) => ({
    id: not_globally_unique_generateId(),
    totalTime: render2.nodeInfo.reduce((prev, curr) => prev + curr.selfTime, 0),
    count: render2.nodeInfo.length,
    name: render2.nodeInfo[0].name,
    // invariant, at least one exists,
    deletedAll: false,
    parents: render2.parents,
    hasMemoCache: render2.hasMemoCache,
    wasFiberRenderMount: render2.wasFiberRenderMount,
    // it would be nice if we calculated the % of components memoizable, but this would have to be calculated downstream before it got aggregated
    elements: render2.nodeInfo.map((node) => node.element),
    changes: {
      context: render2.changes.fiberContext.current.filter(
        (change) => render2.changes.fiberContext.changesCounts.get(change.name)
      ).map((change) => {
        var _a;
        return {
          name: String(change.name),
          count: (_a = render2.changes.fiberContext.changesCounts.get(change.name)) != null ? _a : 0
        };
      }),
      props: render2.changes.fiberProps.current.filter(
        (change) => render2.changes.fiberProps.changesCounts.get(change.name)
      ).map((change) => {
        var _a;
        return {
          name: String(change.name),
          count: (_a = render2.changes.fiberProps.changesCounts.get(change.name)) != null ? _a : 0
        };
      }),
      state: render2.changes.fiberState.current.filter(
        (change) => render2.changes.fiberState.changesCounts.get(Number(change.name))
      ).map((change) => {
        var _a;
        return {
          index: change.name,
          count: (_a = render2.changes.fiberState.changesCounts.get(Number(change.name))) != null ? _a : 0
        };
      })
    }
  }));
  return res;
};
var useGarbageCollectElements = (notificationEvents) => {
  useEffect15(() => {
    const checkElementsExistence = () => {
      notificationEvents.forEach((event) => {
        if (!event.groupedFiberRenders) return;
        event.groupedFiberRenders.forEach((render2) => {
          if (render2.deletedAll) return;
          if (!render2.elements || render2.elements.length === 0) {
            render2.deletedAll = true;
            return;
          }
          const initialLength = render2.elements.length;
          render2.elements = render2.elements.filter((element) => {
            return element && element.isConnected;
          });
          if (render2.elements.length === 0 && initialLength > 0) {
            render2.deletedAll = true;
          }
        });
      });
    };
    const intervalId = setInterval(checkElementsExistence, 5e3);
    return () => {
      clearInterval(intervalId);
    };
  }, [notificationEvents]);
};
var useAppNotifications = () => {
  const log2 = useToolbarEventLog();
  const notificationEvents = [];
  useGarbageCollectElements(notificationEvents);
  log2.state.events.forEach((event) => {
    const fiberRenders = event.kind === "interaction" ? event.data.meta.detailedTiming.fiberRenders : event.data.meta.fiberRenders;
    const groupedFiberRenders = getGroupedFiberRenders(fiberRenders);
    const renderTime = groupedFiberRenders.reduce(
      (prev, curr) => prev + curr.totalTime,
      0
    );
    switch (event.kind) {
      case "interaction": {
        const { commitEnd, jsEndDetail, interactionStartDetail, rafStart } = event.data.meta.detailedTiming;
        if (jsEndDetail - interactionStartDetail - renderTime < 0) {
          invariantError("js time must be longer than render time");
        }
        const otherJSTime = Math.max(
          0,
          jsEndDetail - interactionStartDetail - renderTime
        );
        const frameDraw = Math.max(
          event.data.meta.latency - (commitEnd - interactionStartDetail),
          0
        );
        notificationEvents.push({
          componentPath: event.data.meta.detailedTiming.componentPath,
          groupedFiberRenders,
          id: event.id,
          kind: "interaction",
          memory: null,
          timestamp: event.data.startAt,
          type: event.data.meta.detailedTiming.interactionType === "keyboard" ? "keyboard" : "click",
          timing: {
            renderTime,
            kind: "interaction",
            otherJSTime,
            framePreparation: rafStart - jsEndDetail,
            frameConstruction: commitEnd - rafStart,
            frameDraw
          }
        });
        return;
      }
      case "long-render": {
        notificationEvents.push({
          kind: "dropped-frames",
          id: event.id,
          memory: null,
          timing: {
            kind: "dropped-frames",
            renderTime,
            otherTime: event.data.meta.latency
          },
          groupedFiberRenders,
          timestamp: event.data.startAt,
          fps: event.data.meta.fps
        });
        return;
      }
    }
  });
  return notificationEvents;
};
var timeout = 1e3;
var NotificationAudio = () => {
  const { notificationState, setNotificationState } = useNotificationsContext();
  const playedFor = useRef13(null);
  const debounceTimeout = useRef13(null);
  const lastPlayedTime = useRef13(0);
  const [laggedEvents] = useLaggedEvents();
  const alertEventsCount = laggedEvents.filter(
    // todo: make this configurable
    (event) => getEventSeverity(event) === "high"
  ).length;
  useEffect15(() => {
    const audioEnabledString = localStorage.getItem(
      "react-scan-notifications-audio"
    );
    if (audioEnabledString !== "false" && audioEnabledString !== "true") {
      localStorage.setItem("react-scan-notifications-audio", "false");
      return;
    }
    const audioEnabled = audioEnabledString === "false" ? false : true;
    if (audioEnabled) {
      setNotificationState((prev) => {
        if (prev.audioNotificationsOptions.enabled) {
          return prev;
        }
        return {
          ...prev,
          audioNotificationsOptions: {
            enabled: true,
            audioContext: new AudioContext()
          }
        };
      });
      return;
    }
  }, []);
  useEffect15(() => {
    const { audioNotificationsOptions } = notificationState;
    if (!audioNotificationsOptions.enabled) {
      return;
    }
    if (alertEventsCount === 0) {
      return;
    }
    if (playedFor.current && playedFor.current >= alertEventsCount) {
      return;
    }
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    const now = Date.now();
    const timeSinceLastPlay = now - lastPlayedTime.current;
    const remainingDebounceTime = Math.max(0, timeout - timeSinceLastPlay);
    debounceTimeout.current = setTimeout(() => {
      playNotificationSound(audioNotificationsOptions.audioContext);
      playedFor.current = alertEventsCount;
      lastPlayedTime.current = Date.now();
      debounceTimeout.current = null;
    }, remainingDebounceTime);
  }, [alertEventsCount]);
  useEffect15(() => {
    if (alertEventsCount !== 0) {
      return;
    }
    playedFor.current = null;
  }, [alertEventsCount]);
  useEffect15(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  return null;
};
var NotificationWrapper = forwardRef2((_, ref) => {
  var _a;
  const events = useAppNotifications();
  const [notificationState, setNotificationState] = useState18({
    detailsExpanded: false,
    events,
    filterBy: "latest",
    moreInfoExpanded: false,
    route: "render-visualization",
    selectedEvent: (_a = events.toSorted((a, b) => a.timestamp - b.timestamp).at(-1)) != null ? _a : null,
    selectedFiber: null,
    routeMessage: null,
    audioNotificationsOptions: {
      enabled: false,
      audioContext: null
    }
  });
  notificationState.events = events;
  return /* @__PURE__ */ jsxs21(
    NotificationStateContext.Provider,
    {
      value: {
        notificationState,
        setNotificationState,
        setRoute: ({ route, routeMessage }) => {
          setNotificationState((prev) => {
            const newState = { ...prev, route, routeMessage };
            switch (route) {
              case "render-visualization": {
                fadeOutHighlights();
                return {
                  ...newState,
                  selectedFiber: null
                };
              }
              case "optimize": {
                fadeOutHighlights();
                return {
                  ...newState,
                  selectedFiber: null
                };
              }
              case "other-visualization": {
                fadeOutHighlights();
                return {
                  ...newState,
                  selectedFiber: null
                };
              }
              case "render-explanation": {
                fadeOutHighlights();
                return newState;
              }
            }
            route;
          });
        }
      },
      children: [
        /* @__PURE__ */ jsx22(NotificationAudio, {}),
        /* @__PURE__ */ jsx22(Notifications, { ref })
      ]
    }
  );
});
var Notifications = forwardRef2((_, ref) => {
  var _a;
  const { notificationState } = useNotificationsContext();
  return /* @__PURE__ */ jsxs21("div", { ref, className: cn(["h-full w-full flex flex-col"]), children: [
    notificationState.selectedEvent && /* @__PURE__ */ jsxs21(
      "div",
      {
        className: cn([
          "w-full h-[48px] flex flex-col",
          notificationState.moreInfoExpanded && "h-[235px]",
          notificationState.moreInfoExpanded && notificationState.selectedEvent.kind === "dropped-frames" && "h-[150px]"
        ]),
        children: [
          /* @__PURE__ */ jsx22(NotificationHeader, { selectedEvent: notificationState.selectedEvent }),
          notificationState.moreInfoExpanded && /* @__PURE__ */ jsx22(MoreInfo, {})
        ]
      }
    ),
    /* @__PURE__ */ jsxs21(
      "div",
      {
        className: cn([
          "flex ",
          notificationState.selectedEvent ? "h-[calc(100%-48px)]" : "h-full",
          notificationState.moreInfoExpanded && "h-[calc(100%-200px)]",
          notificationState.moreInfoExpanded && ((_a = notificationState.selectedEvent) == null ? void 0 : _a.kind) === "dropped-frames" && "h-[calc(100%-150px)]"
        ]),
        children: [
          /* @__PURE__ */ jsx22("div", { className: cn(["h-full min-w-[200px]"]), children: /* @__PURE__ */ jsx22(SlowdownHistory, {}) }),
          /* @__PURE__ */ jsx22("div", { className: cn(["w-[calc(100%-200px)] h-full overflow-y-auto"]), children: /* @__PURE__ */ jsx22(DetailsRoutes, {}) })
        ]
      }
    )
  ] });
});
var MoreInfo = () => {
  const { notificationState } = useNotificationsContext();
  if (!notificationState.selectedEvent) {
    throw new Error("Invariant must have selected event for more info");
  }
  const event = notificationState.selectedEvent;
  return /* @__PURE__ */ jsx22(
    "div",
    {
      className: cn([
        "px-4 py-2 border-b border-[#27272A] bg-[#18181B]/50 h-[calc(100%-40px)]",
        event.kind === "dropped-frames" && `h-[calc(100%-25px)]`
      ]),
      children: /* @__PURE__ */ jsx22("div", { className: cn(["flex flex-col gap-y-4 h-full"]), children: iife(() => {
        switch (event.kind) {
          case "interaction": {
            return /* @__PURE__ */ jsxs21(Fragment12, { children: [
              /* @__PURE__ */ jsxs21("div", { className: cn(["flex items-center gap-x-3"]), children: [
                /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] text-xs font-medium", children: event.type === "click" ? "Clicked component location" : "Typed in component location" }),
                /* @__PURE__ */ jsx22("div", { className: "font-mono text-[#E4E4E7] flex items-center bg-[#27272A] pl-2 py-1 rounded-sm overflow-x-auto", children: event.componentPath.toReversed().map((part, i) => /* @__PURE__ */ jsxs21(Fragment12, { children: [
                  /* @__PURE__ */ jsx22(
                    "span",
                    {
                      style: {
                        lineHeight: "14px"
                      },
                      className: "text-[10px] whitespace-nowrap",
                      children: part
                    },
                    part
                  ),
                  i < event.componentPath.length - 1 && /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] mx-0.5", children: "\u2039" })
                ] })) })
              ] }),
              /* @__PURE__ */ jsxs21("div", { className: cn(["flex items-center gap-x-3"]), children: [
                /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] text-xs font-medium", children: "Total Time" }),
                /* @__PURE__ */ jsxs21("span", { className: "text-[#E4E4E7] bg-[#27272A] px-1.5 py-1 rounded-sm text-xs", children: [
                  getTotalTime(event.timing).toFixed(0),
                  "ms"
                ] })
              ] }),
              /* @__PURE__ */ jsxs21("div", { className: cn(["flex items-center gap-x-3"]), children: [
                /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] text-xs font-medium", children: "Occurred" }),
                /* @__PURE__ */ jsx22("span", { className: "text-[#E4E4E7] bg-[#27272A] px-1.5 py-1 rounded-sm text-xs", children: `${((Date.now() - event.timestamp) / 1e3).toFixed(0)}s ago` })
              ] })
            ] });
          }
          case "dropped-frames": {
            return /* @__PURE__ */ jsxs21(Fragment12, { children: [
              /* @__PURE__ */ jsxs21("div", { className: cn(["flex items-center gap-x-3"]), children: [
                /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] text-xs font-medium", children: "Total Time" }),
                /* @__PURE__ */ jsxs21("span", { className: "text-[#E4E4E7] bg-[#27272A] px-1.5 py-1 rounded-sm text-xs", children: [
                  getTotalTime(event.timing).toFixed(0),
                  "ms"
                ] })
              ] }),
              /* @__PURE__ */ jsxs21("div", { className: cn(["flex items-center gap-x-3"]), children: [
                /* @__PURE__ */ jsx22("span", { className: "text-[#6F6F78] text-xs font-medium", children: "Occurred" }),
                /* @__PURE__ */ jsx22("span", { className: "text-[#E4E4E7] bg-[#27272A] px-1.5 py-1 rounded-sm text-xs", children: `${((Date.now() - event.timestamp) / 1e3).toFixed(0)}s ago` })
              ] })
            ] });
          }
        }
      }) })
    }
  );
};

// src/web/views/toolbar/index.tsx
import { jsx as jsx23, jsxs as jsxs22 } from "preact/jsx-runtime";
var Toolbar = constant(() => {
  var _a;
  const events = useAppNotifications();
  const [laggedEvents, setLaggedEvents] = useState19(events);
  useEffect16(() => {
    const timeout2 = setTimeout(() => {
      setLaggedEvents(events);
    }, 500 + 100);
    return () => {
      clearTimeout(timeout2);
    };
  }, [events]);
  const inspectState = Store.inspectState;
  const isInspectActive = inspectState.value.kind === "inspecting";
  const isInspectFocused = inspectState.value.kind === "focused";
  const [seenEvents, setSeenEvents] = useState19([]);
  const onToggleInspect = useCallback4(() => {
    const currentState = Store.inspectState.value;
    switch (currentState.kind) {
      case "inspecting": {
        signalWidgetViews.value = {
          view: "none"
        };
        Store.inspectState.value = {
          kind: "inspect-off"
        };
        return;
      }
      case "focused": {
        signalWidgetViews.value = {
          view: "inspector"
        };
        Store.inspectState.value = {
          kind: "inspecting",
          hoveredDomElement: null
        };
        return;
      }
      // todo: auto select the root fibers first stateNode, and tell the user to select the element
      case "inspect-off": {
        signalWidgetViews.value = {
          view: "none"
        };
        Store.inspectState.value = {
          kind: "inspecting",
          hoveredDomElement: null
        };
        return;
      }
      case "uninitialized": {
        return;
      }
    }
  }, []);
  const onToggleActive = useCallback4((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ReactScanInternals.instrumentation) {
      return;
    }
    const isPaused = !ReactScanInternals.instrumentation.isPaused.value;
    ReactScanInternals.instrumentation.isPaused.value = isPaused;
    const existingLocalStorageOptions = readLocalStorage("react-scan-options");
    saveLocalStorage("react-scan-options", {
      ...existingLocalStorageOptions,
      enabled: !isPaused
    });
  }, []);
  useSignalEffect3(() => {
    const state = Store.inspectState.value;
    if (state.kind === "uninitialized") {
      Store.inspectState.value = {
        kind: "inspect-off"
      };
    }
  });
  let inspectIcon = null;
  let inspectColor = "#999";
  if (isInspectActive) {
    inspectIcon = /* @__PURE__ */ jsx23(Icon, { name: "icon-inspect" });
    inspectColor = "#8e61e3";
  } else if (isInspectFocused) {
    inspectIcon = /* @__PURE__ */ jsx23(Icon, { name: "icon-focus" });
    inspectColor = "#8e61e3";
  } else {
    inspectIcon = /* @__PURE__ */ jsx23(Icon, { name: "icon-inspect" });
    inspectColor = "#999";
  }
  useLayoutEffect2(() => {
    if (signalWidgetViews.value.view !== "notifications") {
      return;
    }
    const ids = new Set(events.map((event) => event.id));
    setSeenEvents([...ids.values()]);
  }, [events.length, signalWidgetViews.value.view]);
  return /* @__PURE__ */ jsxs22("div", { className: "flex max-h-9 min-h-9 flex-1 items-stretch overflow-hidden", children: [
    /* @__PURE__ */ jsx23("div", { className: "h-full flex items-center min-w-fit", children: /* @__PURE__ */ jsx23(
      "button",
      {
        type: "button",
        id: "react-scan-inspect-element",
        title: "Inspect element",
        onClick: onToggleInspect,
        className: "button flex items-center justify-center h-full w-full pl-3 pr-2.5",
        style: { color: inspectColor },
        children: inspectIcon
      }
    ) }),
    /* @__PURE__ */ jsx23("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsx23(
      "button",
      {
        type: "button",
        id: "react-scan-notifications",
        title: "Notifications",
        onClick: () => {
          if (Store.inspectState.value.kind !== "inspect-off") {
            Store.inspectState.value = {
              kind: "inspect-off"
            };
          }
          switch (signalWidgetViews.value.view) {
            case "inspector": {
              Store.inspectState.value = {
                kind: "inspect-off"
              };
              const ids = new Set(events.map((event) => event.id));
              setSeenEvents([...ids.values()]);
              signalWidgetViews.value = {
                view: "notifications"
              };
              return;
            }
            case "notifications": {
              signalWidgetViews.value = {
                view: "none"
              };
              return;
            }
            case "none": {
              const ids = new Set(events.map((event) => event.id));
              setSeenEvents([...ids.values()]);
              signalWidgetViews.value = {
                view: "notifications"
              };
              return;
            }
          }
        },
        className: "button flex items-center justify-center h-full pl-2.5 pr-2.5",
        style: { color: inspectColor },
        children: /* @__PURE__ */ jsx23(
          Notification,
          {
            events: laggedEvents.filter((event) => !seenEvents.includes(event.id)).map((event) => getEventSeverity(event) === "high"),
            size: 16,
            className: cn([
              "text-[#999]",
              signalWidgetViews.value.view === "notifications" && "text-[#8E61E3]"
            ])
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx23(
      Toggle,
      {
        checked: !((_a = ReactScanInternals.instrumentation) == null ? void 0 : _a.isPaused.value),
        onChange: onToggleActive,
        className: "place-self-center",
        title: "Outline Re-renders"
      }
    ),
    ReactScanInternals.options.value.showFPS && /* @__PURE__ */ jsx23(FPSMeter, {})
  ] });
});

// src/web/views/index.tsx
import { jsx as jsx24, jsxs as jsxs23 } from "preact/jsx-runtime";
var isInspecting = computed3(
  () => Store.inspectState.value.kind === "inspecting"
);
var headerClassName = computed3(
  () => cn(
    "relative",
    "flex-1",
    "flex flex-col",
    "rounded-t-lg",
    "overflow-hidden",
    "opacity-100",
    "transition-[opacity]",
    isInspecting.value && "opacity-0 duration-0 delay-0"
  )
);
var isInspectorViewOpen = computed3(
  () => signalWidgetViews.value.view === "inspector"
);
var isNotificationsViewOpen = computed3(
  () => signalWidgetViews.value.view === "notifications"
);
var Content = () => {
  return /* @__PURE__ */ jsxs23(
    "div",
    {
      className: cn(
        "flex flex-1 flex-col",
        "overflow-hidden z-10",
        "rounded-lg",
        "bg-black",
        "opacity-100",
        "transition-[border-radius]",
        "peer-hover/left:rounded-l-none",
        "peer-hover/right:rounded-r-none",
        "peer-hover/top:rounded-t-none",
        "peer-hover/bottom:rounded-b-none"
      ),
      children: [
        /* @__PURE__ */ jsxs23("div", { className: headerClassName, children: [
          /* @__PURE__ */ jsx24(Header, {}),
          /* @__PURE__ */ jsxs23(
            "div",
            {
              className: cn(
                "relative",
                "flex-1 flex",
                "text-white",
                "bg-[#0A0A0A]",
                "transition-opacity delay-150",
                "overflow-hidden",
                "border-b border-[#222]"
              ),
              children: [
                /* @__PURE__ */ jsx24(ContentView, { isOpen: isInspectorViewOpen, children: /* @__PURE__ */ jsx24(ViewInspector, {}) }),
                /* @__PURE__ */ jsx24(ContentView, { isOpen: isNotificationsViewOpen, children: /* @__PURE__ */ jsx24(NotificationWrapper, {}) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx24(Toolbar, {})
      ]
    }
  );
};
var ContentView = ({ isOpen, children }) => {
  return /* @__PURE__ */ jsx24(
    "div",
    {
      className: cn(
        "flex-1",
        "opacity-0",
        "overflow-y-auto overflow-x-hidden",
        "transition-opacity delay-0",
        "pointer-events-none",
        isOpen.value && "opacity-100 delay-150 pointer-events-auto"
      ),
      children: /* @__PURE__ */ jsx24("div", { className: "absolute inset-0 flex", children })
    }
  );
};

// src/web/views/inspector/overlay/index.tsx
import { getDisplayName as getDisplayName7 } from "bippy";
import { useEffect as useEffect17, useRef as useRef14 } from "preact/hooks";
import { Fragment as Fragment13, jsx as jsx25, jsxs as jsxs24 } from "preact/jsx-runtime";
var lerp2 = (start2, end, t) => start2 + (end - start2) * t;
var ANIMATION_CONFIG = {
  frameInterval: 1e3 / 60,
  speeds: {
    fast: 0.51,
    slow: 0.1,
    off: 0
  }
};
var OVERLAY_DPR = IS_CLIENT ? window.devicePixelRatio || 1 : 1;
var ScanOverlay = () => {
  const refCanvas = useRef14(null);
  const refEventCatcher = useRef14(null);
  const refCurrentRect = useRef14(null);
  const refCurrentLockIconRect = useRef14(null);
  const refLastHoveredElement = useRef14(null);
  const refRafId = useRef14(0);
  const refTimeout = useRef14();
  const refCleanupMap = useRef14(
    /* @__PURE__ */ new Map()
  );
  const refIsFadingOut = useRef14(false);
  const refLastFrameTime = useRef14(0);
  const drawLockIcon = (ctx2, x, y, size) => {
    ctx2.save();
    ctx2.strokeStyle = "white";
    ctx2.fillStyle = "white";
    ctx2.lineWidth = 1.5;
    const shackleWidth = size * 0.6;
    const shackleHeight = size * 0.5;
    const shackleX = x + (size - shackleWidth) / 2;
    const shackleY = y;
    ctx2.beginPath();
    ctx2.arc(
      shackleX + shackleWidth / 2,
      shackleY + shackleHeight / 2,
      shackleWidth / 2,
      Math.PI,
      0,
      false
    );
    ctx2.stroke();
    const bodyWidth = size * 0.8;
    const bodyHeight = size * 0.5;
    const bodyX = x + (size - bodyWidth) / 2;
    const bodyY = y + shackleHeight / 2;
    ctx2.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx2.restore();
  };
  const drawStatsPill = (ctx2, rect, kind, fiber) => {
    var _a;
    if (!fiber) return;
    const pillHeight = 24;
    const pillPadding = 8;
    const componentName = (_a = (fiber == null ? void 0 : fiber.type) && getDisplayName7(fiber.type)) != null ? _a : "Unknown";
    const text = componentName;
    ctx2.save();
    ctx2.font = "12px system-ui, -apple-system, sans-serif";
    const textMetrics = ctx2.measureText(text);
    const textWidth = textMetrics.width;
    const lockIconSize = kind === "locked" ? 14 : 0;
    const lockIconPadding = kind === "locked" ? 6 : 0;
    const pillWidth = textWidth + pillPadding * 2 + lockIconSize + lockIconPadding;
    const pillX = rect.left;
    const pillY = rect.top - pillHeight - 4;
    ctx2.fillStyle = "rgb(37, 37, 38, .75)";
    ctx2.beginPath();
    ctx2.roundRect(pillX, pillY, pillWidth, pillHeight, 3);
    ctx2.fill();
    if (kind === "locked") {
      const lockX = pillX + pillPadding;
      const lockY = pillY + (pillHeight - lockIconSize) / 2 + 2;
      drawLockIcon(ctx2, lockX, lockY, lockIconSize);
      refCurrentLockIconRect.current = {
        x: lockX,
        y: lockY,
        width: lockIconSize,
        height: lockIconSize
      };
    } else {
      refCurrentLockIconRect.current = null;
    }
    ctx2.fillStyle = "white";
    ctx2.textBaseline = "middle";
    const textX = pillX + pillPadding + (kind === "locked" ? lockIconSize + lockIconPadding : 0);
    ctx2.fillText(text, textX, pillY + pillHeight / 2);
    ctx2.restore();
  };
  const drawRect = (canvas2, ctx2, kind, fiber) => {
    if (!refCurrentRect.current) return;
    const rect = refCurrentRect.current;
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.strokeStyle = "rgba(142, 97, 227, 0.5)";
    ctx2.fillStyle = "rgba(173, 97, 230, 0.10)";
    if (kind === "locked") {
      ctx2.setLineDash([]);
    } else {
      ctx2.setLineDash([4]);
    }
    ctx2.lineWidth = 1;
    ctx2.fillRect(rect.left, rect.top, rect.width, rect.height);
    ctx2.strokeRect(rect.left, rect.top, rect.width, rect.height);
    drawStatsPill(ctx2, rect, kind, fiber);
  };
  const animate = (canvas2, ctx2, targetRect, kind, parentCompositeFiber, onComplete) => {
    var _a;
    const speed = ReactScanInternals.options.value.animationSpeed;
    const t = (_a = ANIMATION_CONFIG.speeds[speed]) != null ? _a : ANIMATION_CONFIG.speeds.off;
    const animationFrame2 = (timestamp) => {
      if (timestamp - refLastFrameTime.current < ANIMATION_CONFIG.frameInterval) {
        refRafId.current = requestAnimationFrame(animationFrame2);
        return;
      }
      refLastFrameTime.current = timestamp;
      if (!refCurrentRect.current) {
        cancelAnimationFrame(refRafId.current);
        return;
      }
      refCurrentRect.current = {
        left: lerp2(refCurrentRect.current.left, targetRect.left, t),
        top: lerp2(refCurrentRect.current.top, targetRect.top, t),
        width: lerp2(refCurrentRect.current.width, targetRect.width, t),
        height: lerp2(refCurrentRect.current.height, targetRect.height, t)
      };
      drawRect(canvas2, ctx2, kind, parentCompositeFiber);
      const stillMoving = Math.abs(refCurrentRect.current.left - targetRect.left) > 0.1 || Math.abs(refCurrentRect.current.top - targetRect.top) > 0.1 || Math.abs(refCurrentRect.current.width - targetRect.width) > 0.1 || Math.abs(refCurrentRect.current.height - targetRect.height) > 0.1;
      if (stillMoving) {
        refRafId.current = requestAnimationFrame(animationFrame2);
      } else {
        refCurrentRect.current = targetRect;
        drawRect(canvas2, ctx2, kind, parentCompositeFiber);
        cancelAnimationFrame(refRafId.current);
        ctx2.restore();
        onComplete == null ? void 0 : onComplete();
      }
    };
    cancelAnimationFrame(refRafId.current);
    clearTimeout(refTimeout.current);
    refRafId.current = requestAnimationFrame(animationFrame2);
    refTimeout.current = setTimeout(() => {
      cancelAnimationFrame(refRafId.current);
      refCurrentRect.current = targetRect;
      drawRect(canvas2, ctx2, kind, parentCompositeFiber);
      ctx2.restore();
      onComplete == null ? void 0 : onComplete();
    }, 1e3);
  };
  const setupOverlayAnimation = (canvas2, ctx2, targetRect, kind, parentCompositeFiber) => {
    ctx2.save();
    if (!refCurrentRect.current) {
      refCurrentRect.current = targetRect;
      drawRect(canvas2, ctx2, kind, parentCompositeFiber);
      ctx2.restore();
      return;
    }
    animate(canvas2, ctx2, targetRect, kind, parentCompositeFiber);
  };
  const drawHoverOverlay = async (overlayElement, canvas2, ctx2, kind) => {
    if (!overlayElement || !canvas2 || !ctx2) return;
    const { parentCompositeFiber } = getCompositeComponentFromElement(overlayElement);
    const targetRect = await getAssociatedFiberRect(overlayElement);
    if (!parentCompositeFiber || !targetRect) return;
    setupOverlayAnimation(canvas2, ctx2, targetRect, kind, parentCompositeFiber);
  };
  const unsubscribeAll = () => {
    for (const cleanup3 of refCleanupMap.current.values()) {
      cleanup3 == null ? void 0 : cleanup3();
    }
  };
  const cleanupCanvas = (canvas2) => {
    const ctx2 = canvas2.getContext("2d");
    if (ctx2) {
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
    refCurrentRect.current = null;
    refCurrentLockIconRect.current = null;
    refLastHoveredElement.current = null;
    canvas2.classList.remove("fade-in");
    refIsFadingOut.current = false;
  };
  const startFadeOut = (onComplete) => {
    if (!refCanvas.current || refIsFadingOut.current) return;
    const handleTransitionEnd = (e) => {
      if (!refCanvas.current || e.propertyName !== "opacity" || !refIsFadingOut.current) {
        return;
      }
      refCanvas.current.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
      cleanupCanvas(refCanvas.current);
      onComplete == null ? void 0 : onComplete();
    };
    const existingListener = refCleanupMap.current.get("fade-out");
    if (existingListener) {
      existingListener();
      refCleanupMap.current.delete("fade-out");
    }
    refCanvas.current.addEventListener("transitionend", handleTransitionEnd);
    refCleanupMap.current.set("fade-out", () => {
      var _a;
      (_a = refCanvas.current) == null ? void 0 : _a.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
    });
    refIsFadingOut.current = true;
    refCanvas.current.classList.remove("fade-in");
    requestAnimationFrame(() => {
      var _a;
      (_a = refCanvas.current) == null ? void 0 : _a.classList.add("fade-out");
    });
  };
  const startFadeIn = () => {
    if (!refCanvas.current) return;
    refIsFadingOut.current = false;
    refCanvas.current.classList.remove("fade-out");
    requestAnimationFrame(() => {
      var _a;
      (_a = refCanvas.current) == null ? void 0 : _a.classList.add("fade-in");
    });
  };
  const handleHoverableElement = (componentElement) => {
    if (componentElement === refLastHoveredElement.current) return;
    refLastHoveredElement.current = componentElement;
    if (nonVisualTags.has(componentElement.tagName)) {
      startFadeOut();
    } else {
      startFadeIn();
    }
    Store.inspectState.value = {
      kind: "inspecting",
      hoveredDomElement: componentElement
    };
  };
  const handleNonHoverableArea = () => {
    if (!refCurrentRect.current || !refCanvas.current || refIsFadingOut.current) {
      return;
    }
    startFadeOut();
  };
  const handlePointerMove = throttle((e) => {
    var _a, _b;
    const state = Store.inspectState.peek();
    if (state.kind !== "inspecting" || !refEventCatcher.current) return;
    refEventCatcher.current.style.pointerEvents = "none";
    const element = document.elementFromPoint((_a = e == null ? void 0 : e.clientX) != null ? _a : 0, (_b = e == null ? void 0 : e.clientY) != null ? _b : 0);
    refEventCatcher.current.style.removeProperty("pointer-events");
    clearTimeout(refTimeout.current);
    if (element && element !== refCanvas.current) {
      const { parentCompositeFiber } = getCompositeComponentFromElement(
        element
      );
      if (parentCompositeFiber) {
        const componentElement = findComponentDOMNode(parentCompositeFiber);
        if (componentElement) {
          handleHoverableElement(componentElement);
          return;
        }
      }
    }
    handleNonHoverableArea();
  }, 32);
  const isClickInLockIcon = (e, canvas2) => {
    const currentRect = refCurrentLockIconRect.current;
    if (!currentRect) return false;
    const rect = canvas2.getBoundingClientRect();
    const scaleX = canvas2.width / rect.width;
    const scaleY = canvas2.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const adjustedX = x / OVERLAY_DPR;
    const adjustedY = y / OVERLAY_DPR;
    return adjustedX >= currentRect.x && adjustedX <= currentRect.x + currentRect.width && adjustedY >= currentRect.y && adjustedY <= currentRect.y + currentRect.height;
  };
  const handleLockIconClick = (state) => {
    if (state.kind === "focused") {
      Store.inspectState.value = {
        kind: "inspecting",
        hoveredDomElement: state.focusedDomElement
      };
    }
  };
  const handleElementClick = (e) => {
    var _a, _b;
    const clickableElements = [
      "react-scan-inspect-element",
      "react-scan-power"
    ];
    if (e.target instanceof HTMLElement && clickableElements.includes(e.target.id)) {
      return;
    }
    const tagName = (_a = refLastHoveredElement.current) == null ? void 0 : _a.tagName;
    if (tagName && nonVisualTags.has(tagName)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const element = (_b = refLastHoveredElement.current) != null ? _b : document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;
    const clickedEl = e.composedPath().at(0);
    if (clickedEl instanceof HTMLElement && clickableElements.includes(clickedEl.id)) {
      const syntheticEvent = new MouseEvent(e.type, e);
      syntheticEvent.__reactScanSyntheticEvent = true;
      clickedEl.dispatchEvent(syntheticEvent);
      return;
    }
    const { parentCompositeFiber } = getCompositeComponentFromElement(
      element
    );
    if (!parentCompositeFiber) return;
    const componentElement = findComponentDOMNode(parentCompositeFiber);
    if (!componentElement) {
      refLastHoveredElement.current = null;
      Store.inspectState.value = {
        kind: "inspect-off"
      };
      return;
    }
    Store.inspectState.value = {
      kind: "focused",
      focusedDomElement: componentElement,
      fiber: parentCompositeFiber
    };
  };
  const handleClick = (e) => {
    if (e.__reactScanSyntheticEvent) {
      return;
    }
    const state = Store.inspectState.peek();
    const canvas2 = refCanvas.current;
    if (!canvas2 || !refEventCatcher.current) return;
    if (isClickInLockIcon(e, canvas2)) {
      e.preventDefault();
      e.stopPropagation();
      handleLockIconClick(state);
      return;
    }
    if (state.kind === "inspecting") {
      handleElementClick(e);
    }
  };
  const handleKeyDown = (e) => {
    var _a;
    if (e.key !== "Escape") return;
    const state = Store.inspectState.peek();
    const canvas2 = refCanvas.current;
    if (!canvas2) return;
    if (((_a = document.activeElement) == null ? void 0 : _a.id) === "react-scan-root") {
      return;
    }
    signalWidgetViews.value = {
      view: "none"
    };
    if (state.kind === "focused" || state.kind === "inspecting") {
      e.preventDefault();
      e.stopPropagation();
      switch (state.kind) {
        case "focused": {
          startFadeIn();
          refCurrentRect.current = null;
          refLastHoveredElement.current = state.focusedDomElement;
          Store.inspectState.value = {
            kind: "inspecting",
            hoveredDomElement: state.focusedDomElement
          };
          break;
        }
        case "inspecting": {
          startFadeOut(() => {
            signalIsSettingsOpen.value = false;
            Store.inspectState.value = {
              kind: "inspect-off"
            };
          });
          break;
        }
      }
    }
  };
  const handleStateChange = (state, canvas2, ctx2) => {
    var _a;
    (_a = refCleanupMap.current.get(state.kind)) == null ? void 0 : _a();
    if (refEventCatcher.current) {
      if (state.kind !== "inspecting") {
        refEventCatcher.current.style.pointerEvents = "none";
      }
    }
    if (refRafId.current) {
      cancelAnimationFrame(refRafId.current);
    }
    let unsubReport;
    switch (state.kind) {
      case "inspect-off":
        startFadeOut();
        return;
      case "inspecting":
        drawHoverOverlay(state.hoveredDomElement, canvas2, ctx2, "inspecting");
        break;
      case "focused":
        if (!state.focusedDomElement) return;
        if (refLastHoveredElement.current !== state.focusedDomElement) {
          refLastHoveredElement.current = state.focusedDomElement;
        }
        signalWidgetViews.value = {
          view: "inspector"
        };
        drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
        unsubReport = Store.lastReportTime.subscribe(() => {
          if (refRafId.current && refCurrentRect.current) {
            const { parentCompositeFiber } = getCompositeComponentFromElement(
              state.focusedDomElement
            );
            if (parentCompositeFiber) {
              drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
            }
          }
        });
        if (unsubReport) {
          refCleanupMap.current.set(state.kind, unsubReport);
        }
        break;
    }
  };
  const updateCanvasSize = (canvas2, ctx2) => {
    const rect = canvas2.getBoundingClientRect();
    canvas2.width = rect.width * OVERLAY_DPR;
    canvas2.height = rect.height * OVERLAY_DPR;
    ctx2.scale(OVERLAY_DPR, OVERLAY_DPR);
    ctx2.save();
  };
  const handleResizeOrScroll = () => {
    const state = Store.inspectState.peek();
    const canvas2 = refCanvas.current;
    if (!canvas2) return;
    const ctx2 = canvas2 == null ? void 0 : canvas2.getContext("2d");
    if (!ctx2) return;
    cancelAnimationFrame(refRafId.current);
    clearTimeout(refTimeout.current);
    updateCanvasSize(canvas2, ctx2);
    refCurrentRect.current = null;
    if (state.kind === "focused" && state.focusedDomElement) {
      drawHoverOverlay(state.focusedDomElement, canvas2, ctx2, "locked");
    } else if (state.kind === "inspecting" && state.hoveredDomElement) {
      drawHoverOverlay(state.hoveredDomElement, canvas2, ctx2, "inspecting");
    }
  };
  const handlePointerDown = (e) => {
    const state = Store.inspectState.peek();
    const canvas2 = refCanvas.current;
    if (!canvas2) return;
    if (state.kind === "inspecting" || isClickInLockIcon(e, canvas2)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };
  useEffect17(() => {
    const canvas2 = refCanvas.current;
    if (!canvas2) return;
    const ctx2 = canvas2 == null ? void 0 : canvas2.getContext("2d");
    if (!ctx2) return;
    updateCanvasSize(canvas2, ctx2);
    const unSubState = Store.inspectState.subscribe((state) => {
      handleStateChange(state, canvas2, ctx2);
    });
    window.addEventListener("scroll", handleResizeOrScroll, { passive: true });
    window.addEventListener("resize", handleResizeOrScroll, { passive: true });
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
      capture: true
    });
    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true
    });
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      unsubscribeAll();
      unSubState();
      window.removeEventListener("scroll", handleResizeOrScroll);
      window.removeEventListener("resize", handleResizeOrScroll);
      document.removeEventListener("pointermove", handlePointerMove, {
        capture: true
      });
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true
      });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (refRafId.current) {
        cancelAnimationFrame(refRafId.current);
      }
      clearTimeout(refTimeout.current);
    };
  }, []);
  return /* @__PURE__ */ jsxs24(Fragment13, { children: [
    /* @__PURE__ */ jsx25(
      "div",
      {
        ref: refEventCatcher,
        className: cn("fixed top-0 left-0 w-screen h-screen", "z-[214748365]"),
        style: {
          pointerEvents: "none"
        }
      }
    ),
    /* @__PURE__ */ jsx25(
      "canvas",
      {
        ref: refCanvas,
        dir: "ltr",
        className: cn(
          "react-scan-inspector-overlay",
          "fixed top-0 left-0 w-screen h-screen",
          "pointer-events-none",
          "z-[214748367]"
        )
      }
    )
  ] });
};

// src/web/widget/helpers.ts
var WindowDimensions = class {
  constructor(width, height, safeArea) {
    __publicField(this, "width", width);
    __publicField(this, "height", height);
    __publicField(this, "safeArea", safeArea);
    __publicField(this, "maxWidth");
    __publicField(this, "maxHeight");
    this.maxWidth = width - safeArea.left - safeArea.right;
    this.maxHeight = height - safeArea.top - safeArea.bottom;
  }
  rightEdge(width) {
    return this.width - width - this.safeArea.right;
  }
  bottomEdge(height) {
    return this.height - height - this.safeArea.bottom;
  }
  isFullWidth(width) {
    return width >= this.maxWidth;
  }
  isFullHeight(height) {
    return height >= this.maxHeight;
  }
};
var cachedWindowDimensions;
var safeAreaMatches = (a, b) => a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
var getWindowDimensions = () => {
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  const currentSafeArea = getSafeArea();
  if (cachedWindowDimensions && cachedWindowDimensions.width === currentWidth && cachedWindowDimensions.height === currentHeight && safeAreaMatches(cachedWindowDimensions.safeArea, currentSafeArea)) {
    return cachedWindowDimensions;
  }
  cachedWindowDimensions = new WindowDimensions(
    currentWidth,
    currentHeight,
    currentSafeArea
  );
  return cachedWindowDimensions;
};
var getOppositeCorner = (position, currentCorner, isFullScreen, isFullWidth, isFullHeight) => {
  if (isFullScreen) {
    if (position === "top-left") return "bottom-right";
    if (position === "top-right") return "bottom-left";
    if (position === "bottom-left") return "top-right";
    if (position === "bottom-right") return "top-left";
    const [vertical, horizontal] = currentCorner.split("-");
    if (position === "left") return `${vertical}-right`;
    if (position === "right") return `${vertical}-left`;
    if (position === "top") return `bottom-${horizontal}`;
    if (position === "bottom") return `top-${horizontal}`;
  }
  if (isFullWidth) {
    if (position === "left")
      return `${currentCorner.split("-")[0]}-right`;
    if (position === "right")
      return `${currentCorner.split("-")[0]}-left`;
  }
  if (isFullHeight) {
    if (position === "top")
      return `bottom-${currentCorner.split("-")[1]}`;
    if (position === "bottom")
      return `top-${currentCorner.split("-")[1]}`;
  }
  return currentCorner;
};
var calculatePosition = (corner, width, height) => {
  const isRTL = getComputedStyle(document.body).direction === "rtl";
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const safeArea = getSafeArea();
  const isMinimized = width === MIN_SIZE.width;
  const effectiveWidth = isMinimized ? width : Math.min(width, windowWidth - safeArea.left - safeArea.right);
  const effectiveHeight = isMinimized ? height : Math.min(height, windowHeight - safeArea.top - safeArea.bottom);
  let x;
  let y;
  let leftBound = safeArea.left;
  let rightBound = windowWidth - effectiveWidth - safeArea.right;
  let topBound = safeArea.top;
  let bottomBound = windowHeight - effectiveHeight - safeArea.bottom;
  const rtlRightCornerX = -safeArea.right;
  const rtlLeftCornerX = -(windowWidth - effectiveWidth - safeArea.left);
  switch (corner) {
    case "top-right":
      x = isRTL ? rtlRightCornerX : rightBound;
      y = topBound;
      break;
    case "bottom-right":
      x = isRTL ? rtlRightCornerX : rightBound;
      y = bottomBound;
      break;
    case "bottom-left":
      x = isRTL ? rtlLeftCornerX : leftBound;
      y = bottomBound;
      break;
    case "top-left":
      x = isRTL ? rtlLeftCornerX : leftBound;
      y = topBound;
      break;
    default:
      x = leftBound;
      y = topBound;
      break;
  }
  if (isMinimized) {
    if (isRTL) {
      x = Math.min(
        rtlRightCornerX,
        Math.max(x, rtlLeftCornerX)
      );
    } else {
      x = Math.max(
        leftBound,
        Math.min(x, rightBound)
      );
    }
    y = Math.max(
      topBound,
      Math.min(y, bottomBound)
    );
  }
  return { x, y };
};
var positionMatchesCorner = (position, corner) => {
  const [vertical, horizontal] = corner.split("-");
  return position !== vertical && position !== horizontal;
};
var getHandleVisibility = (position, corner, isFullWidth, isFullHeight) => {
  if (isFullWidth && isFullHeight) {
    return true;
  }
  if (!isFullWidth && !isFullHeight) {
    return positionMatchesCorner(position, corner);
  }
  if (isFullWidth) {
    return position !== corner.split("-")[0];
  }
  if (isFullHeight) {
    return position !== corner.split("-")[1];
  }
  return false;
};
var calculateBoundedSize = (currentSize, delta, isWidth) => {
  const min = isWidth ? MIN_SIZE.width : MIN_SIZE.initialHeight;
  const max = isWidth ? getWindowDimensions().maxWidth : getWindowDimensions().maxHeight;
  const newSize = currentSize + delta;
  return Math.min(Math.max(min, newSize), max);
};
var calculateNewSizeAndPosition = (position, initialSize, initialPosition, deltaX, deltaY) => {
  const isRTL = getComputedStyle(document.body).direction === "rtl";
  const safeArea = getSafeArea();
  const maxWidth = window.innerWidth - safeArea.left - safeArea.right;
  const maxHeight = window.innerHeight - safeArea.top - safeArea.bottom;
  let newWidth = initialSize.width;
  let newHeight = initialSize.height;
  let newX = initialPosition.x;
  let newY = initialPosition.y;
  if (isRTL && position.includes("right")) {
    const availableWidth = -initialPosition.x + initialSize.width - safeArea.right;
    const proposedWidth = Math.min(initialSize.width + deltaX, availableWidth);
    newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
    newX = initialPosition.x + (newWidth - initialSize.width);
  }
  if (isRTL && position.includes("left")) {
    const availableWidth = window.innerWidth - initialPosition.x - safeArea.left;
    const proposedWidth = Math.min(initialSize.width - deltaX, availableWidth);
    newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
  }
  if (!isRTL && position.includes("right")) {
    const availableWidth = window.innerWidth - initialPosition.x - safeArea.right;
    const proposedWidth = Math.min(initialSize.width + deltaX, availableWidth);
    newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
  }
  if (!isRTL && position.includes("left")) {
    const availableWidth = initialPosition.x + initialSize.width - safeArea.left;
    const proposedWidth = Math.min(initialSize.width - deltaX, availableWidth);
    newWidth = Math.min(maxWidth, Math.max(MIN_SIZE.width, proposedWidth));
    newX = initialPosition.x - (newWidth - initialSize.width);
  }
  if (position.includes("bottom")) {
    const availableHeight = window.innerHeight - initialPosition.y - safeArea.bottom;
    const proposedHeight = Math.min(
      initialSize.height + deltaY,
      availableHeight
    );
    newHeight = Math.min(
      maxHeight,
      Math.max(MIN_SIZE.initialHeight, proposedHeight)
    );
  }
  if (position.includes("top")) {
    const availableHeight = initialPosition.y + initialSize.height - safeArea.top;
    const proposedHeight = Math.min(
      initialSize.height - deltaY,
      availableHeight
    );
    newHeight = Math.min(
      maxHeight,
      Math.max(MIN_SIZE.initialHeight, proposedHeight)
    );
    newY = initialPosition.y - (newHeight - initialSize.height);
  }
  let leftBound = safeArea.left;
  let rightBound = window.innerWidth - safeArea.right - newWidth;
  let topBound = safeArea.top;
  let bottomBound = window.innerHeight - safeArea.bottom - newHeight;
  const rtlRightCornerX = -safeArea.right;
  const rtlLeftCornerX = -(window.innerWidth - newWidth - safeArea.left);
  if (isRTL) {
    newX = Math.min(
      rtlRightCornerX,
      Math.max(newX, rtlLeftCornerX)
    );
  } else {
    newX = Math.max(
      leftBound,
      Math.min(newX, rightBound)
    );
  }
  newY = Math.max(
    topBound,
    Math.min(newY, bottomBound)
  );
  return {
    newSize: { width: newWidth, height: newHeight },
    newPosition: { x: newX, y: newY }
  };
};
var getClosestCorner = (position) => {
  const windowDims = getWindowDimensions();
  const distances = {
    "top-left": Math.hypot(position.x, position.y),
    "top-right": Math.hypot(windowDims.maxWidth - position.x, position.y),
    "bottom-left": Math.hypot(position.x, windowDims.maxHeight - position.y),
    "bottom-right": Math.hypot(
      windowDims.maxWidth - position.x,
      windowDims.maxHeight - position.y
    )
  };
  let closest = "top-left";
  for (const key in distances) {
    if (distances[key] < distances[closest]) {
      closest = key;
    }
  }
  return closest;
};
var getBestCorner = (mouseX, mouseY, initialMouseX, initialMouseY, threshold = 100) => {
  const deltaX = initialMouseX !== void 0 ? mouseX - initialMouseX : 0;
  const deltaY = initialMouseY !== void 0 ? mouseY - initialMouseY : 0;
  const windowCenterX = window.innerWidth / 2;
  const windowCenterY = window.innerHeight / 2;
  const movingRight = deltaX > threshold;
  const movingLeft = deltaX < -threshold;
  const movingDown = deltaY > threshold;
  const movingUp = deltaY < -threshold;
  if (movingRight || movingLeft) {
    const isBottom = mouseY > windowCenterY;
    return movingRight ? isBottom ? "bottom-right" : "top-right" : isBottom ? "bottom-left" : "top-left";
  }
  if (movingDown || movingUp) {
    const isRight = mouseX > windowCenterX;
    return movingDown ? isRight ? "bottom-right" : "bottom-left" : isRight ? "top-right" : "top-left";
  }
  return mouseX > windowCenterX ? mouseY > windowCenterY ? "bottom-right" : "top-right" : mouseY > windowCenterY ? "bottom-left" : "top-left";
};

// src/web/widget/resize-handle.tsx
import { useCallback as useCallback5, useEffect as useEffect18, useRef as useRef15 } from "preact/hooks";
import { jsx as jsx26 } from "preact/jsx-runtime";
var ResizeHandle = ({ position }) => {
  const refContainer = useRef15(null);
  const prevWidth = useRef15(null);
  const prevHeight = useRef15(null);
  const prevCorner = useRef15(null);
  useEffect18(() => {
    const container = refContainer.current;
    if (!container) return;
    const updateVisibility = () => {
      container.classList.remove("pointer-events-none");
      const isFocused = Store.inspectState.value.kind === "focused";
      const shouldShow = signalWidgetViews.value.view !== "none";
      const isVisible = (isFocused || shouldShow) && getHandleVisibility(
        position,
        signalWidget.value.corner,
        signalWidget.value.dimensions.isFullWidth,
        signalWidget.value.dimensions.isFullHeight
      );
      if (isVisible) {
        container.classList.remove(
          "hidden",
          "pointer-events-none",
          "opacity-0"
        );
      } else {
        container.classList.add("hidden", "pointer-events-none", "opacity-0");
      }
    };
    const unsubscribeSignalWidget = signalWidget.subscribe((state) => {
      if (prevWidth.current !== null && prevHeight.current !== null && prevCorner.current !== null && state.dimensions.width === prevWidth.current && state.dimensions.height === prevHeight.current && state.corner === prevCorner.current) {
        return;
      }
      updateVisibility();
      prevWidth.current = state.dimensions.width;
      prevHeight.current = state.dimensions.height;
      prevCorner.current = state.corner;
    });
    const unsubscribeInspectState = Store.inspectState.subscribe(() => {
      updateVisibility();
    });
    return () => {
      unsubscribeSignalWidget();
      unsubscribeInspectState();
      prevWidth.current = null;
      prevHeight.current = null;
      prevCorner.current = null;
    };
  }, []);
  const handleResize = useCallback5(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const widget = signalRefWidget.value;
      if (!widget) return;
      const containerStyle = widget.style;
      const { dimensions } = signalWidget.value;
      const initialX = e.clientX;
      const initialY = e.clientY;
      const initialWidth = dimensions.width;
      const initialHeight = dimensions.height;
      const initialPosition = dimensions.position;
      signalWidget.value = {
        ...signalWidget.value,
        dimensions: {
          ...dimensions,
          isFullWidth: false,
          isFullHeight: false,
          width: initialWidth,
          height: initialHeight,
          position: initialPosition
        }
      };
      let rafId = null;
      const handlePointerMove = (e2) => {
        if (rafId) return;
        containerStyle.transition = "none";
        rafId = requestAnimationFrame(() => {
          const { newSize, newPosition } = calculateNewSizeAndPosition(
            position,
            { width: initialWidth, height: initialHeight },
            initialPosition,
            e2.clientX - initialX,
            e2.clientY - initialY
          );
          containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
          containerStyle.width = `${newSize.width}px`;
          containerStyle.height = `${newSize.height}px`;
          const maxTreeWidth = Math.floor(newSize.width - MIN_CONTAINER_WIDTH / 2);
          const currentTreeWidth = signalWidget.value.componentsTree.width;
          const newTreeWidth = Math.min(
            maxTreeWidth,
            Math.max(MIN_CONTAINER_WIDTH, currentTreeWidth)
          );
          signalWidget.value = {
            ...signalWidget.value,
            dimensions: {
              isFullWidth: false,
              isFullHeight: false,
              width: newSize.width,
              height: newSize.height,
              position: newPosition
            },
            componentsTree: {
              ...signalWidget.value.componentsTree,
              width: newTreeWidth
            }
          };
          rafId = null;
        });
      };
      const handlePointerUp = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        const { dimensions: dimensions2, corner } = signalWidget.value;
        const windowDims = getWindowDimensions();
        const isCurrentFullWidth = windowDims.isFullWidth(dimensions2.width);
        const isCurrentFullHeight = windowDims.isFullHeight(dimensions2.height);
        const isFullScreen = isCurrentFullWidth && isCurrentFullHeight;
        let newCorner = corner;
        if (isFullScreen || isCurrentFullWidth || isCurrentFullHeight) {
          newCorner = getClosestCorner(dimensions2.position);
        }
        const newPosition = calculatePosition(
          newCorner,
          dimensions2.width,
          dimensions2.height
        );
        const onTransitionEnd = () => {
          widget.removeEventListener("transitionend", onTransitionEnd);
        };
        widget.addEventListener("transitionend", onTransitionEnd);
        containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
        signalWidget.value = {
          ...signalWidget.value,
          corner: newCorner,
          dimensions: {
            isFullWidth: isCurrentFullWidth,
            isFullHeight: isCurrentFullHeight,
            width: dimensions2.width,
            height: dimensions2.height,
            position: newPosition
          },
          lastDimensions: {
            isFullWidth: isCurrentFullWidth,
            isFullHeight: isCurrentFullHeight,
            width: dimensions2.width,
            height: dimensions2.height,
            position: newPosition
          }
        };
        saveLocalStorage(LOCALSTORAGE_KEY, {
          corner: newCorner,
          dimensions: signalWidget.value.dimensions,
          lastDimensions: signalWidget.value.lastDimensions,
          componentsTree: signalWidget.value.componentsTree
        });
      };
      document.addEventListener("pointermove", handlePointerMove, {
        passive: true
      });
      document.addEventListener("pointerup", handlePointerUp);
    },
    []
  );
  const handleDoubleClick = useCallback5(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const widget = signalRefWidget.value;
      if (!widget) return;
      const containerStyle = widget.style;
      const { dimensions, corner } = signalWidget.value;
      const windowDims = getWindowDimensions();
      const isCurrentFullWidth = windowDims.isFullWidth(dimensions.width);
      const isCurrentFullHeight = windowDims.isFullHeight(dimensions.height);
      const isFullScreen = isCurrentFullWidth && isCurrentFullHeight;
      const isPartiallyMaximized = (isCurrentFullWidth || isCurrentFullHeight) && !isFullScreen;
      let newWidth = dimensions.width;
      let newHeight = dimensions.height;
      const newCorner = getOppositeCorner(
        position,
        corner,
        isFullScreen,
        isCurrentFullWidth,
        isCurrentFullHeight
      );
      if (position === "left" || position === "right") {
        newWidth = isCurrentFullWidth ? dimensions.width : windowDims.maxWidth;
        if (isPartiallyMaximized) {
          newWidth = isCurrentFullWidth ? MIN_SIZE.width : windowDims.maxWidth;
        }
      } else {
        newHeight = isCurrentFullHeight ? dimensions.height : windowDims.maxHeight;
        if (isPartiallyMaximized) {
          newHeight = isCurrentFullHeight ? MIN_SIZE.initialHeight : windowDims.maxHeight;
        }
      }
      if (isFullScreen) {
        if (position === "left" || position === "right") {
          newWidth = MIN_SIZE.width;
        } else {
          newHeight = MIN_SIZE.initialHeight;
        }
      }
      const newPosition = calculatePosition(newCorner, newWidth, newHeight);
      const newDimensions = {
        isFullWidth: windowDims.isFullWidth(newWidth),
        isFullHeight: windowDims.isFullHeight(newHeight),
        width: newWidth,
        height: newHeight,
        position: newPosition
      };
      const maxTreeWidth = Math.floor(newWidth - MIN_SIZE.width / 2);
      const currentTreeWidth = signalWidget.value.componentsTree.width;
      const defaultWidth = Math.floor(newWidth * 0.3);
      const newTreeWidth = isCurrentFullWidth ? MIN_CONTAINER_WIDTH : (position === "left" || position === "right") && !isCurrentFullWidth ? Math.min(maxTreeWidth, Math.max(MIN_CONTAINER_WIDTH, defaultWidth)) : Math.min(
        maxTreeWidth,
        Math.max(MIN_CONTAINER_WIDTH, currentTreeWidth)
      );
      requestAnimationFrame(() => {
        signalWidget.value = {
          corner: newCorner,
          dimensions: newDimensions,
          lastDimensions: dimensions,
          componentsTree: {
            ...signalWidget.value.componentsTree,
            width: newTreeWidth
          }
        };
        containerStyle.transition = "all 0.25s cubic-bezier(0, 0, 0.2, 1)";
        containerStyle.width = `${newWidth}px`;
        containerStyle.height = `${newHeight}px`;
        containerStyle.transform = `translate3d(${newPosition.x}px, ${newPosition.y}px, 0)`;
      });
      saveLocalStorage(LOCALSTORAGE_KEY, {
        corner: newCorner,
        dimensions: newDimensions,
        lastDimensions: dimensions,
        componentsTree: {
          ...signalWidget.value.componentsTree,
          width: newTreeWidth
        }
      });
    },
    []
  );
  return /* @__PURE__ */ jsx26(
    "div",
    {
      ref: refContainer,
      onPointerDown: handleResize,
      onDblClick: handleDoubleClick,
      className: cn(
        "absolute z-50",
        "flex items-center justify-center",
        "group",
        "transition-colors select-none",
        "peer",
        {
          "resize-left peer/left": position === "left",
          "resize-right peer/right z-10": position === "right",
          "resize-top peer/top": position === "top",
          "resize-bottom peer/bottom": position === "bottom"
        }
      ),
      children: /* @__PURE__ */ jsx26("span", { className: "resize-line-wrapper", children: /* @__PURE__ */ jsx26("span", { className: "resize-line", children: /* @__PURE__ */ jsx26(
        Icon,
        {
          name: "icon-ellipsis",
          size: 18,
          className: cn(
            "text-neutral-400",
            (position === "left" || position === "right") && "rotate-90"
          )
        }
      ) }) })
    }
  );
};

// src/web/widget/index.tsx
import { Fragment as Fragment14, jsx as jsx27, jsxs as jsxs25 } from "preact/jsx-runtime";
var COLLAPSED_SIZE = {
  horizontal: { width: 20, height: 48 },
  vertical: { width: 48, height: 20 }
};
var Widget = () => {
  const refWidget = useRef16(null);
  const refShouldOpen = useRef16(false);
  const refInitialMinimizedWidth = useRef16(0);
  const refInitialMinimizedHeight = useRef16(0);
  const refExpandingFromCollapsed = useRef16(false);
  const updateWidgetPosition = useCallback6((shouldSave = true) => {
    if (!refWidget.current) return;
    const { corner } = signalWidget.value;
    let newWidth;
    let newHeight;
    if (signalWidgetCollapsed.value) {
      const orientation = signalWidgetCollapsed.value.orientation || "horizontal";
      const size = COLLAPSED_SIZE[orientation];
      newWidth = size.width;
      newHeight = size.height;
    } else if (refShouldOpen.current) {
      const lastDims = signalWidget.value.lastDimensions;
      newWidth = calculateBoundedSize(lastDims.width, 0, true);
      newHeight = calculateBoundedSize(lastDims.height, 0, false);
      if (refExpandingFromCollapsed.current) {
        refExpandingFromCollapsed.current = false;
      }
    } else {
      newWidth = refInitialMinimizedWidth.current;
      newHeight = refInitialMinimizedHeight.current;
    }
    const newPosition = calculatePosition(corner, newWidth, newHeight);
    let finalPosition = newPosition;
    if (signalWidgetCollapsed.value) {
      const { corner: collapsedCorner, orientation = "horizontal" } = signalWidgetCollapsed.value;
      const size = COLLAPSED_SIZE[orientation];
      const safeArea2 = getSafeArea();
      switch (collapsedCorner) {
        case "top-left":
          finalPosition = orientation === "horizontal" ? { x: -1, y: safeArea2.top } : { x: safeArea2.left, y: -1 };
          break;
        case "bottom-left":
          finalPosition = orientation === "horizontal" ? { x: -1, y: window.innerHeight - size.height - safeArea2.bottom } : { x: safeArea2.left, y: window.innerHeight - size.height + 1 };
          break;
        case "top-right":
          finalPosition = orientation === "horizontal" ? { x: window.innerWidth - size.width + 1, y: safeArea2.top } : { x: window.innerWidth - size.width - safeArea2.right, y: -1 };
          break;
        case "bottom-right":
        default:
          finalPosition = orientation === "horizontal" ? {
            x: window.innerWidth - size.width + 1,
            y: window.innerHeight - size.height - safeArea2.bottom
          } : {
            x: window.innerWidth - size.width - safeArea2.right,
            y: window.innerHeight - size.height + 1
          };
          break;
      }
    }
    const isTooSmall = newWidth < MIN_SIZE.width || newHeight < MIN_SIZE.initialHeight;
    const shouldPersist = shouldSave && !isTooSmall;
    const container = refWidget.current;
    const containerStyle = container.style;
    let rafId = null;
    const onTransitionEnd = () => {
      updateDimensions();
      container.removeEventListener("transitionend", onTransitionEnd);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    container.addEventListener("transitionend", onTransitionEnd);
    containerStyle.transition = "all 0.25s cubic-bezier(0, 0, 0.2, 1)";
    rafId = requestAnimationFrame(() => {
      containerStyle.width = `${newWidth}px`;
      containerStyle.height = `${newHeight}px`;
      containerStyle.transform = `translate3d(${finalPosition.x}px, ${finalPosition.y}px, 0)`;
      rafId = null;
    });
    const safeArea = getSafeArea();
    const newDimensions = {
      isFullWidth: newWidth >= window.innerWidth - safeArea.left - safeArea.right,
      isFullHeight: newHeight >= window.innerHeight - safeArea.top - safeArea.bottom,
      width: newWidth,
      height: newHeight,
      position: finalPosition
    };
    signalWidget.value = {
      corner,
      dimensions: newDimensions,
      lastDimensions: refShouldOpen ? signalWidget.value.lastDimensions : newWidth > refInitialMinimizedWidth.current ? newDimensions : signalWidget.value.lastDimensions,
      componentsTree: signalWidget.value.componentsTree
    };
    if (shouldPersist) {
      saveLocalStorage(LOCALSTORAGE_KEY, {
        corner: signalWidget.value.corner,
        dimensions: signalWidget.value.dimensions,
        lastDimensions: signalWidget.value.lastDimensions,
        componentsTree: signalWidget.value.componentsTree
      });
    }
    updateDimensions();
  }, []);
  const handleDrag = useCallback6(
    (e) => {
      const target = e.target;
      if (target.closest(TOOLBAR_INTERACTIVE_SELECTOR)) {
        return;
      }
      e.preventDefault();
      if (!refWidget.current) return;
      const container = refWidget.current;
      const containerStyle = container.style;
      const { dimensions } = signalWidget.value;
      const initialMouseX = e.clientX;
      const initialMouseY = e.clientY;
      const initialX = dimensions.position.x;
      const initialY = dimensions.position.y;
      let currentX = initialX;
      let currentY = initialY;
      let rafId = null;
      let hasMoved = false;
      let lastMouseX = initialMouseX;
      let lastMouseY = initialMouseY;
      const handlePointerMove = (e2) => {
        if (rafId) return;
        hasMoved = true;
        lastMouseX = e2.clientX;
        lastMouseY = e2.clientY;
        rafId = requestAnimationFrame(() => {
          const deltaX = lastMouseX - initialMouseX;
          const deltaY = lastMouseY - initialMouseY;
          currentX = Number(initialX) + deltaX;
          currentY = Number(initialY) + deltaY;
          containerStyle.transition = "none";
          containerStyle.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
          const widgetRight = currentX + dimensions.width;
          const widgetBottom = currentY + dimensions.height;
          const outsideLeft = Math.max(0, -currentX);
          const outsideRight = Math.max(0, widgetRight - window.innerWidth);
          const outsideTop = Math.max(0, -currentY);
          const outsideBottom = Math.max(0, widgetBottom - window.innerHeight);
          const horizontalOutside = Math.min(
            dimensions.width,
            outsideLeft + outsideRight
          );
          const verticalOutside = Math.min(
            dimensions.height,
            outsideTop + outsideBottom
          );
          const areaOutside = horizontalOutside * dimensions.height + verticalOutside * dimensions.width - horizontalOutside * verticalOutside;
          const totalArea = dimensions.width * dimensions.height;
          let shouldCollapse = areaOutside > totalArea * 0.35;
          if (!shouldCollapse && ReactScanInternals.options.value.showFPS) {
            const fpsRight = currentX + dimensions.width;
            const fpsLeft = fpsRight - 100;
            const fpsFullyOutside = fpsRight <= 0 || fpsLeft >= window.innerWidth || currentY + dimensions.height <= 0 || currentY >= window.innerHeight;
            shouldCollapse = fpsFullyOutside;
          }
          if (shouldCollapse) {
            const widgetCenterX = currentX + dimensions.width / 2;
            const widgetCenterY = currentY + dimensions.height / 2;
            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;
            let targetCorner;
            if (widgetCenterX < screenCenterX) {
              targetCorner = widgetCenterY < screenCenterY ? "top-left" : "bottom-left";
            } else {
              targetCorner = widgetCenterY < screenCenterY ? "top-right" : "bottom-right";
            }
            let orientation;
            const horizontalOverflow = Math.max(outsideLeft, outsideRight);
            const verticalOverflow = Math.max(outsideTop, outsideBottom);
            orientation = horizontalOverflow > verticalOverflow ? "horizontal" : "vertical";
            signalWidget.value = {
              ...signalWidget.value,
              corner: targetCorner,
              lastDimensions: {
                ...dimensions,
                position: calculatePosition(
                  targetCorner,
                  dimensions.width,
                  dimensions.height
                )
              }
            };
            const collapsedPosition = {
              corner: targetCorner,
              orientation
            };
            signalWidgetCollapsed.value = collapsedPosition;
            saveLocalStorage(LOCALSTORAGE_COLLAPSED_KEY, collapsedPosition);
            saveLocalStorage(LOCALSTORAGE_KEY, signalWidget.value);
            updateWidgetPosition(false);
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerEnd);
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          }
          rafId = null;
        });
      };
      const handlePointerEnd = () => {
        if (!container) return;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerEnd);
        const totalDeltaX = Math.abs(lastMouseX - initialMouseX);
        const totalDeltaY = Math.abs(lastMouseY - initialMouseY);
        const totalMovement = Math.sqrt(
          totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY
        );
        if (!hasMoved || totalMovement < 60) return;
        const newCorner = getBestCorner(
          lastMouseX,
          lastMouseY,
          initialMouseX,
          initialMouseY,
          Store.inspectState.value.kind === "focused" ? 80 : 40
        );
        if (newCorner === signalWidget.value.corner) {
          containerStyle.transition = "transform 0.25s cubic-bezier(0, 0, 0.2, 1)";
          const currentPosition = signalWidget.value.dimensions.position;
          requestAnimationFrame(() => {
            containerStyle.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`;
          });
          return;
        }
        const snappedPosition = calculatePosition(
          newCorner,
          dimensions.width,
          dimensions.height
        );
        if (currentX === initialX && currentY === initialY) return;
        const onTransitionEnd = () => {
          containerStyle.transition = "none";
          updateDimensions();
          container.removeEventListener("transitionend", onTransitionEnd);
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        };
        container.addEventListener("transitionend", onTransitionEnd);
        containerStyle.transition = "transform 0.25s cubic-bezier(0, 0, 0.2, 1)";
        requestAnimationFrame(() => {
          containerStyle.transform = `translate3d(${snappedPosition.x}px, ${snappedPosition.y}px, 0)`;
        });
        signalWidget.value = {
          corner: newCorner,
          dimensions: {
            isFullWidth: dimensions.isFullWidth,
            isFullHeight: dimensions.isFullHeight,
            width: dimensions.width,
            height: dimensions.height,
            position: snappedPosition
          },
          lastDimensions: signalWidget.value.lastDimensions,
          componentsTree: signalWidget.value.componentsTree
        };
        saveLocalStorage(LOCALSTORAGE_KEY, {
          corner: newCorner,
          dimensions: signalWidget.value.dimensions,
          lastDimensions: signalWidget.value.lastDimensions,
          componentsTree: signalWidget.value.componentsTree
        });
      };
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerEnd);
    },
    []
  );
  const handleCollapsedDrag = useCallback6(
    (e) => {
      e.preventDefault();
      if (!refWidget.current || !signalWidgetCollapsed.value) return;
      const { corner: collapsedCorner, orientation = "horizontal" } = signalWidgetCollapsed.value;
      const initialMouseX = e.clientX;
      const initialMouseY = e.clientY;
      let rafId = null;
      let hasExpanded = false;
      const DRAG_THRESHOLD = 50;
      const handlePointerMove = (e2) => {
        if (hasExpanded || rafId) return;
        const deltaX = e2.clientX - initialMouseX;
        const deltaY = e2.clientY - initialMouseY;
        let shouldExpand = false;
        if (orientation === "horizontal") {
          if (collapsedCorner.endsWith("left") && deltaX > DRAG_THRESHOLD) {
            shouldExpand = true;
          } else if (collapsedCorner.endsWith("right") && deltaX < -DRAG_THRESHOLD) {
            shouldExpand = true;
          }
        } else {
          if (collapsedCorner.startsWith("top") && deltaY > DRAG_THRESHOLD) {
            shouldExpand = true;
          } else if (collapsedCorner.startsWith("bottom") && deltaY < -DRAG_THRESHOLD) {
            shouldExpand = true;
          }
        }
        if (shouldExpand) {
          hasExpanded = true;
          signalWidgetCollapsed.value = null;
          saveLocalStorage(LOCALSTORAGE_COLLAPSED_KEY, null);
          if (refInitialMinimizedWidth.current === 0 && refWidget.current) {
            requestAnimationFrame(() => {
              if (refWidget.current) {
                refWidget.current.style.width = "min-content";
                const naturalWidth = refWidget.current.offsetWidth;
                refInitialMinimizedWidth.current = naturalWidth || 300;
                const lastDims = signalWidget.value.lastDimensions;
                const targetWidth = calculateBoundedSize(
                  lastDims.width,
                  0,
                  true
                );
                const targetHeight = calculateBoundedSize(
                  lastDims.height,
                  0,
                  false
                );
                let newX = e2.clientX - targetWidth / 2;
                let newY = e2.clientY - targetHeight / 2;
                const safeArea = getSafeArea();
                newX = Math.max(
                  safeArea.left,
                  Math.min(newX, window.innerWidth - targetWidth - safeArea.right)
                );
                newY = Math.max(
                  safeArea.top,
                  Math.min(newY, window.innerHeight - targetHeight - safeArea.bottom)
                );
                signalWidget.value = {
                  ...signalWidget.value,
                  dimensions: {
                    ...signalWidget.value.dimensions,
                    position: { x: newX, y: newY }
                  }
                };
                updateWidgetPosition(true);
                const savedView = readLocalStorage(
                  LOCALSTORAGE_LAST_VIEW_KEY
                );
                signalWidgetViews.value = savedView || { view: "none" };
                setTimeout(() => {
                  if (refWidget.current) {
                    const dragEvent = new PointerEvent("pointerdown", {
                      clientX: e2.clientX,
                      clientY: e2.clientY,
                      pointerId: e2.pointerId,
                      bubbles: true
                    });
                    refWidget.current.dispatchEvent(dragEvent);
                  }
                }, 100);
              }
            });
          } else {
            updateWidgetPosition(true);
            const savedView = readLocalStorage(
              LOCALSTORAGE_LAST_VIEW_KEY
            );
            signalWidgetViews.value = savedView || { view: "none" };
          }
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerEnd);
        }
      };
      const handlePointerEnd = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerEnd);
      };
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerEnd);
    },
    []
  );
  useEffect19(() => {
    if (!refWidget.current) return;
    removeLocalStorage(LOCALSTORAGE_LAST_VIEW_KEY);
    if (!signalWidgetCollapsed.value) {
      refWidget.current.style.width = "min-content";
      refInitialMinimizedHeight.current = 36;
      refInitialMinimizedWidth.current = refWidget.current.offsetWidth;
    } else {
      refInitialMinimizedHeight.current = 36;
      refInitialMinimizedWidth.current = 0;
    }
    const safeArea = getSafeArea();
    refWidget.current.style.maxWidth = `calc(100vw - ${safeArea.left + safeArea.right}px)`;
    refWidget.current.style.maxHeight = `calc(100vh - ${safeArea.top + safeArea.bottom}px)`;
    updateWidgetPosition();
    if (Store.inspectState.value.kind !== "focused" && !signalWidgetCollapsed.value && !refExpandingFromCollapsed.current) {
      signalWidget.value = {
        ...signalWidget.value,
        dimensions: {
          isFullWidth: false,
          isFullHeight: false,
          width: refInitialMinimizedWidth.current,
          height: refInitialMinimizedHeight.current,
          position: signalWidget.value.dimensions.position
        }
      };
    }
    signalRefWidget.value = refWidget.current;
    const unsubscribeSignalWidget = signalWidget.subscribe((widget) => {
      if (!refWidget.current) return;
      const { x, y } = widget.dimensions.position;
      const { width, height } = widget.dimensions;
      const container = refWidget.current;
      requestAnimationFrame(() => {
        container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
      });
    });
    const unsubscribeSignalWidgetViews = signalWidgetViews.subscribe(
      (state) => {
        refShouldOpen.current = state.view !== "none";
        updateWidgetPosition();
        if (!signalWidgetCollapsed.value) {
          if (state.view !== "none") {
            saveLocalStorage(LOCALSTORAGE_LAST_VIEW_KEY, state);
          } else {
            removeLocalStorage(LOCALSTORAGE_LAST_VIEW_KEY);
          }
        }
      }
    );
    const unsubscribeStoreInspectState = Store.inspectState.subscribe(
      (state) => {
        refShouldOpen.current = state.kind === "focused";
        updateWidgetPosition();
      }
    );
    const handleWindowResize = () => {
      updateWidgetPosition(true);
    };
    window.addEventListener("resize", handleWindowResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      unsubscribeSignalWidgetViews();
      unsubscribeStoreInspectState();
      unsubscribeSignalWidget();
      saveLocalStorage(LOCALSTORAGE_KEY, {
        ...getDefaultWidgetConfig(),
        corner: signalWidget.value.corner
      });
    };
  }, []);
  const [_, setTriggerRender] = useState20(false);
  useEffect19(() => {
    setTriggerRender(true);
  }, []);
  const isCollapsed = signalWidgetCollapsed.value;
  let arrowRotationClass = "";
  if (isCollapsed) {
    const { orientation = "horizontal", corner } = isCollapsed;
    if (orientation === "horizontal") {
      arrowRotationClass = (corner == null ? void 0 : corner.endsWith("right")) ? "rotate-180" : "";
    } else {
      arrowRotationClass = (corner == null ? void 0 : corner.startsWith("bottom")) ? "-rotate-90" : "rotate-90";
    }
  }
  return /* @__PURE__ */ jsxs25(Fragment14, { children: [
    /* @__PURE__ */ jsx27(ScanOverlay, {}),
    /* @__PURE__ */ jsx27(ToolbarElementContext.Provider, { value: refWidget.current, children: /* @__PURE__ */ jsx27(
      "div",
      {
        id: "react-scan-toolbar",
        dir: "ltr",
        ref: refWidget,
        onPointerDown: !isCollapsed ? handleDrag : handleCollapsedDrag,
        className: cn(
          "fixed inset-0",
          isCollapsed ? (() => {
            const { orientation = "horizontal", corner } = isCollapsed;
            if (orientation === "horizontal") {
              return (corner == null ? void 0 : corner.endsWith("right")) ? "rounded-tl-lg rounded-bl-lg shadow-lg" : "rounded-tr-lg rounded-br-lg shadow-lg";
            } else {
              return (corner == null ? void 0 : corner.startsWith("bottom")) ? "rounded-tl-lg rounded-tr-lg shadow-lg" : "rounded-bl-lg rounded-br-lg shadow-lg";
            }
          })() : "rounded-lg shadow-lg",
          "flex flex-col",
          "font-mono text-[13px]",
          "user-select-none",
          "opacity-0",
          isCollapsed ? "cursor-pointer" : "cursor-move",
          "z-[124124124124]",
          "animate-fade-in animation-duration-300 animation-delay-300",
          "will-change-transform",
          "[touch-action:none]"
        ),
        style: { WebkitAppRegion: "no-drag" },
        children: isCollapsed ? /* @__PURE__ */ jsx27(
          "button",
          {
            type: "button",
            onClick: () => {
              signalWidgetCollapsed.value = null;
              saveLocalStorage(LOCALSTORAGE_COLLAPSED_KEY, null);
              if (refInitialMinimizedWidth.current === 0 && refWidget.current) {
                requestAnimationFrame(() => {
                  if (refWidget.current) {
                    refWidget.current.style.width = "min-content";
                    const naturalWidth = refWidget.current.offsetWidth;
                    refInitialMinimizedWidth.current = naturalWidth || 300;
                    updateWidgetPosition(true);
                  }
                });
              }
              const savedView = readLocalStorage(
                LOCALSTORAGE_LAST_VIEW_KEY
              );
              signalWidgetViews.value = savedView || { view: "none" };
            },
            className: "flex items-center justify-center w-full h-full text-white",
            title: "Expand toolbar",
            children: /* @__PURE__ */ jsx27(
              Icon,
              {
                name: "icon-chevron-right",
                size: 16,
                className: cn("transition-transform", arrowRotationClass)
              }
            )
          }
        ) : /* @__PURE__ */ jsxs25(Fragment14, { children: [
          /* @__PURE__ */ jsx27(ResizeHandle, { position: "top" }),
          /* @__PURE__ */ jsx27(ResizeHandle, { position: "bottom" }),
          /* @__PURE__ */ jsx27(ResizeHandle, { position: "left" }),
          /* @__PURE__ */ jsx27(ResizeHandle, { position: "right" }),
          /* @__PURE__ */ jsx27(Content, {})
        ] })
      }
    ) })
  ] });
};
var ToolbarElementContext = createContext2(null);

// src/web/components/svg-sprite/index.tsx
import { jsx as jsx28, jsxs as jsxs26 } from "preact/jsx-runtime";
var SvgSprite = () => {
  return /* @__PURE__ */ jsxs26("svg", { xmlns: "http://www.w3.org/2000/svg", style: "display: none;", children: [
    /* @__PURE__ */ jsx28("title", { children: "React Scan Icons" }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-inspect", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z" }),
      /* @__PURE__ */ jsx28("path", { d: "M5 3a2 2 0 0 0-2 2" }),
      /* @__PURE__ */ jsx28("path", { d: "M19 3a2 2 0 0 1 2 2" }),
      /* @__PURE__ */ jsx28("path", { d: "M5 21a2 2 0 0 1-2-2" }),
      /* @__PURE__ */ jsx28("path", { d: "M9 3h1" }),
      /* @__PURE__ */ jsx28("path", { d: "M9 21h2" }),
      /* @__PURE__ */ jsx28("path", { d: "M14 3h1" }),
      /* @__PURE__ */ jsx28("path", { d: "M3 9v1" }),
      /* @__PURE__ */ jsx28("path", { d: "M21 9v2" }),
      /* @__PURE__ */ jsx28("path", { d: "M3 14v1" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-focus", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z" }),
      /* @__PURE__ */ jsx28("path", { d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" })
    ] }),
    /* @__PURE__ */ jsx28("symbol", { id: "icon-next", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: /* @__PURE__ */ jsx28("path", { d: "M6 9h6V5l7 7-7 7v-4H6V9z" }) }),
    /* @__PURE__ */ jsx28("symbol", { id: "icon-previous", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: /* @__PURE__ */ jsx28("path", { d: "M18 15h-6v4l-7-7 7-7v4h6v6z" }) }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-close", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
      /* @__PURE__ */ jsx28("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-replay", viewBox: "0 0 24 24", fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
      /* @__PURE__ */ jsx28("path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }),
      /* @__PURE__ */ jsx28("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
      /* @__PURE__ */ jsx28("path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
      /* @__PURE__ */ jsx28("circle", { cx: "12", cy: "12", r: "1" }),
      /* @__PURE__ */ jsx28("path", { d: "M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-ellipsis", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("circle", { cx: "12", cy: "12", r: "1" }),
      /* @__PURE__ */ jsx28("circle", { cx: "19", cy: "12", r: "1" }),
      /* @__PURE__ */ jsx28("circle", { cx: "5", cy: "12", r: "1" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-copy", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsx28("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
    ] }),
    /* @__PURE__ */ jsx28("symbol", { id: "icon-check", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: /* @__PURE__ */ jsx28("path", { d: "M20 6 9 17l-5-5" }) }),
    /* @__PURE__ */ jsx28("symbol", { id: "icon-chevron-right", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: /* @__PURE__ */ jsx28("path", { d: "m9 18 6-6-6-6" }) }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-settings", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
      /* @__PURE__ */ jsx28("circle", { cx: "12", cy: "12", r: "3" })
    ] }),
    /* @__PURE__ */ jsx28("symbol", { id: "icon-flame", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx28("path", { d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" }) }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-function", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsx28("path", { d: "M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3" }),
      /* @__PURE__ */ jsx28("path", { d: "M9 11.2h5.7" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-triangle-alert", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
      /* @__PURE__ */ jsx28("path", { d: "M12 9v4" }),
      /* @__PURE__ */ jsx28("path", { d: "M12 17h.01" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-gallery-horizontal-end", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M2 7v10" }),
      /* @__PURE__ */ jsx28("path", { d: "M6 5v14" }),
      /* @__PURE__ */ jsx28("rect", { width: "12", height: "18", x: "10", y: "3", rx: "2" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-search", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("circle", { cx: "11", cy: "11", r: "8" }),
      /* @__PURE__ */ jsx28("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-lock", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsx28("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-lock-open", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsx28("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
    ] }),
    /* @__PURE__ */ jsxs26("symbol", { id: "icon-sanil", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", children: [
      /* @__PURE__ */ jsx28("path", { d: "M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0" }),
      /* @__PURE__ */ jsx28("circle", { cx: "10", cy: "13", r: "8" }),
      /* @__PURE__ */ jsx28("path", { d: "M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6" }),
      /* @__PURE__ */ jsx28("path", { d: "M18 3 19.1 5.2" })
    ] })
  ] });
};

// src/web/toolbar.tsx
import { Fragment as Fragment15, jsx as jsx29, jsxs as jsxs27 } from "preact/jsx-runtime";
var ToolbarErrorBoundary = class extends Component2 {
  constructor() {
    super(...arguments);
    __publicField(this, "state", { hasError: false, error: null });
    __publicField(this, "handleReset", () => {
      this.setState({ hasError: false, error: null });
    });
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    var _a;
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx29("div", { className: "fixed bottom-4 right-4 z-[124124124124]", children: /* @__PURE__ */ jsxs27("div", { className: "p-3 bg-black rounded-lg shadow-lg w-80", children: [
        /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-2 mb-2 text-red-400 text-sm font-medium", children: [
          /* @__PURE__ */ jsx29(Icon, { name: "icon-flame", className: "text-red-500", size: 14 }),
          "React Scan ran into a problem"
        ] }),
        /* @__PURE__ */ jsx29("div", { className: "p-2 bg-black rounded font-mono text-xs text-red-300 mb-3 break-words", children: ((_a = this.state.error) == null ? void 0 : _a.message) || JSON.stringify(this.state.error) }),
        /* @__PURE__ */ jsx29(
          "button",
          {
            type: "button",
            onClick: this.handleReset,
            className: "px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
            children: "Restart"
          }
        )
      ] }) });
    }
    return this.props.children;
  }
};
var createToolbar = (root) => {
  const container = document.createElement("div");
  container.id = "react-scan-toolbar-root";
  window.__REACT_SCAN_TOOLBAR_CONTAINER__ = container;
  root.appendChild(container);
  render(
    /* @__PURE__ */ jsx29(ToolbarErrorBoundary, { children: /* @__PURE__ */ jsxs27(Fragment15, { children: [
      /* @__PURE__ */ jsx29(SvgSprite, {}),
      /* @__PURE__ */ jsx29(Widget, {})
    ] }) }),
    container
  );
  const originalRemove = container.remove.bind(container);
  container.remove = () => {
    window.__REACT_SCAN_TOOLBAR_CONTAINER__ = void 0;
    if (container.hasChildNodes()) {
      render(null, container);
      render(null, container);
    }
    originalRemove();
  };
  return container;
};

// src/web/utils/check-react-grab-version.ts
import { version as REACT_GRAB_VERSION } from "react-grab/package.json";
var didRunVersionCheck = false;
var checkReactGrabVersion = () => {
  if (didRunVersionCheck) return;
  didRunVersionCheck = true;
  if (typeof window === "undefined") return;
  if (window.__REACT_GRAB__) return;
  if (!navigator.onLine) return;
  if (!REACT_GRAB_VERSION) return;
  const fetchOptions = {
    referrerPolicy: "origin",
    keepalive: true,
    priority: "low",
    cache: "no-store"
  };
  try {
    fetch(
      `https://www.react-grab.com/api/version?source=react-scan&v=${REACT_GRAB_VERSION}&t=${Date.now()}`,
      fetchOptions
    ).then((response) => response.ok ? response.text() : null).then((rawLatestVersion) => {
      if (!rawLatestVersion) return;
      const latestVersion = rawLatestVersion.trim();
      if (!/^\d+\.\d+\.\d+/.test(latestVersion)) return;
      if (latestVersion === REACT_GRAB_VERSION) return;
      console.warn(
        `[React Scan] react-grab v${REACT_GRAB_VERSION} is outdated (latest: v${latestVersion}). Update react-scan to pick up the newer react-grab.`
      );
    }).catch(() => null);
  } catch {
  }
};

// src/web/utils/parse-safe-area-option.ts
var SAFE_AREA_EDGES = ["top", "right", "bottom", "left"];
var parseSafeAreaOption = (value) => {
  if (isFiniteNonNegative(value)) {
    return { ok: true, value };
  }
  if (!isPlainObject(value)) {
    return {
      ok: false,
      error: `- safeArea must be a non-negative number or { top?, right?, bottom?, left? }. Got "${JSON.stringify(value)}"`
    };
  }
  const inset = {};
  for (const edge of SAFE_AREA_EDGES) {
    const edgeValue = value[edge];
    if (edgeValue === void 0) continue;
    if (!isFiniteNonNegative(edgeValue)) {
      return {
        ok: false,
        error: `- safeArea.${edge} must be a non-negative number. Got "${JSON.stringify(edgeValue)}"`
      };
    }
    inset[edge] = edgeValue;
  }
  return { ok: true, value: inset };
};

// package.json
var package_default = {
  name: "react-scan",
  version: "0.5.7",
  description: "Scan your React app for renders",
  keywords: [
    "react",
    "react-scan",
    "react scan",
    "render",
    "performance"
  ],
  homepage: "https://react-scan.million.dev",
  bugs: {
    url: "https://github.com/aidenybai/react-scan/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/aidenybai/react-scan.git"
  },
  license: "MIT",
  author: {
    name: "Aiden Bai",
    email: "aiden@million.dev",
    url: "https://million.dev"
  },
  scripts: {
    build: "pnpm build:css && NODE_ENV=production tsup",
    "build:copy": "pnpm build && cat dist/auto.global.js | pbcopy",
    "build:css": "postcss ./src/web/assets/css/styles.tailwind.css -o ./src/web/assets/css/styles.css",
    "dev:css": "postcss ./src/web/assets/css/styles.tailwind.css -o ./src/web/assets/css/styles.css --watch",
    "dev:tsup": "NODE_ENV=development tsup --watch",
    dev: 'pnpm run --parallel "/^dev:(css|tsup)/"',
    pack: "npm version patch && pnpm build && npm pack",
    "pack:bump": `node scripts/bump-version.mjs && pnpm run pack && echo $(pwd)/react-scan-$(node -p "require('./package.json').version").tgz | pbcopy`,
    publint: "publint",
    test: "vp test run",
    "test:watch": "vp test",
    lint: "vp lint",
    format: "vp fmt",
    typecheck: "tsc --noEmit"
  },
  exports: {
    "./package.json": "./package.json",
    ".": {
      production: {
        import: {
          types: "./dist/index.d.mts",
          "react-server": "./dist/rsc-shim.mjs",
          default: "./dist/index.mjs"
        },
        require: {
          types: "./dist/index.d.mts",
          "react-server": "./dist/rsc-shim.js",
          default: "./dist/index.mjs"
        }
      },
      development: {
        import: {
          types: "./dist/index.d.mts",
          "react-server": "./dist/rsc-shim.mjs",
          default: "./dist/index.mjs"
        },
        require: {
          types: "./dist/index.d.ts",
          "react-server": "./dist/rsc-shim.js",
          default: "./dist/index.js"
        }
      },
      default: {
        import: {
          types: "./dist/index.d.mts",
          "react-server": "./dist/rsc-shim.mjs",
          default: "./dist/index.mjs"
        },
        require: {
          types: "./dist/index.d.ts",
          "react-server": "./dist/rsc-shim.js",
          default: "./dist/index.js"
        }
      }
    },
    "./all-environments": {
      types: "./dist/core/all-environments.d.ts",
      import: "./dist/core/all-environments.mjs",
      require: "./dist/core/all-environments.js"
    },
    "./install-hook": {
      types: "./dist/install-hook.d.ts",
      import: "./dist/install-hook.mjs",
      require: "./dist/install-hook.js"
    },
    "./lite": {
      types: "./dist/lite/index.d.ts",
      import: "./dist/lite/index.mjs",
      require: "./dist/lite/index.js"
    },
    "./auto": {
      production: {
        import: {
          types: "./dist/rsc-shim.d.mts",
          "react-server": "./dist/rsc-shim.mjs",
          default: "./dist/rsc-shim.mjs"
        },
        require: {
          types: "./dist/rsc-shim.d.ts",
          "react-server": "./dist/rsc-shim.js",
          default: "./dist/rsc-shim.js"
        }
      },
      development: {
        import: {
          types: "./dist/auto.d.mts",
          "react-server": "./dist/rsc-shim.mjs",
          default: "./dist/auto.mjs"
        },
        require: {
          types: "./dist/auto.d.ts",
          "react-server": "./dist/rsc-shim.js",
          default: "./dist/auto.js"
        }
      }
    },
    "./dist/*": "./dist/*.js",
    "./dist/*.js": "./dist/*.js",
    "./dist/*.mjs": "./dist/*.mjs",
    "./react-component-name/vite": {
      types: "./dist/react-component-name/vite.d.ts",
      import: "./dist/react-component-name/vite.mjs",
      require: "./dist/react-component-name/vite.js"
    },
    "./react-component-name/webpack": {
      types: "./dist/react-component-name/webpack.d.ts",
      import: "./dist/react-component-name/webpack.mjs",
      require: "./dist/react-component-name/webpack.js"
    },
    "./react-component-name/esbuild": {
      types: "./dist/react-component-name/esbuild.d.ts",
      import: "./dist/react-component-name/esbuild.mjs",
      require: "./dist/react-component-name/esbuild.js"
    },
    "./react-component-name/rspack": {
      types: "./dist/react-component-name/rspack.d.ts",
      import: "./dist/react-component-name/rspack.mjs",
      require: "./dist/react-component-name/rspack.js"
    },
    "./react-component-name/rolldown": {
      types: "./dist/react-component-name/rolldown.d.ts",
      import: "./dist/react-component-name/rolldown.mjs",
      require: "./dist/react-component-name/rolldown.js"
    },
    "./react-component-name/rollup": {
      types: "./dist/react-component-name/rollup.d.ts",
      import: "./dist/react-component-name/rollup.mjs",
      require: "./dist/react-component-name/rollup.js"
    },
    "./react-component-name/astro": {
      types: "./dist/react-component-name/astro.d.ts",
      import: "./dist/react-component-name/astro.mjs",
      require: "./dist/react-component-name/astro.js"
    },
    "./react-component-name/loader": {
      types: "./dist/react-component-name/loader.d.ts",
      import: "./dist/react-component-name/loader.mjs",
      require: "./dist/react-component-name/loader.js"
    }
  },
  main: "dist/index.js",
  module: "dist/index.mjs",
  browser: "dist/auto.global.js",
  types: "dist/index.d.ts",
  typesVersions: {
    "*": {
      "react-component-name/vite": [
        "./dist/react-component-name/vite.d.ts"
      ],
      "react-component-name/webpack": [
        "./dist/react-component-name/webpack.d.ts"
      ],
      "react-component-name/esbuild": [
        "./dist/react-component-name/esbuild.d.ts"
      ],
      "react-component-name/rspack": [
        "./dist/react-component-name/rspack.d.ts"
      ],
      "react-component-name/rolldown": [
        "./dist/react-component-name/rolldown.d.ts"
      ],
      "react-component-name/rollup": [
        "./dist/react-component-name/rollup.d.ts"
      ],
      "react-component-name/astro": [
        "./dist/react-component-name/astro.d.ts"
      ],
      "react-component-name/loader": [
        "./dist/react-component-name/loader.d.ts"
      ]
    }
  },
  bin: "bin/cli.js",
  files: [
    "dist",
    "bin",
    "package.json",
    "README.md",
    "LICENSE",
    "auto.d.ts"
  ],
  dependencies: {
    "@babel/core": "^7.29.0",
    "@babel/types": "^7.29.0",
    "@preact/signals": "^2.9.0",
    "@rollup/pluginutils": "^5.3.0",
    bippy: "^0.5.39",
    commander: "^14.0.0",
    picocolors: "^1.1.1",
    preact: "^10.29.1",
    prompts: "^2.4.2",
    "react-doctor": "latest",
    "react-grab": "latest"
  },
  devDependencies: {
    "@esbuild-plugins/tsconfig-paths": "^0.1.2",
    "@remix-run/react": "*",
    "@tailwindcss/postcss": "^4.2.4",
    "@types/babel__core": "^7.20.5",
    "@types/prompts": "^2.4.9",
    "@types/react": "^19.2.14",
    autoprefixer: "^10.5.0",
    clsx: "^2.1.1",
    "es-module-lexer": "^2.1.0",
    esbuild: "^0.28.0",
    next: "*",
    postcss: "^8.5.13",
    "postcss-cli": "^11.0.0",
    publint: "^0.3.18",
    react: "*",
    "react-dom": "*",
    "tailwind-merge": "^3.5.0",
    tailwindcss: "^4.2.4",
    terser: "^5.46.2",
    tsup: "^8.5.1",
    vitest: "^3.0.0"
  },
  peerDependencies: {
    esbuild: ">=0.18.0",
    react: "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
  },
  peerDependenciesMeta: {
    esbuild: {
      optional: true
    }
  },
  optionalDependencies: {
    unplugin: "^3.0.0"
  },
  publishConfig: {
    access: "public"
  }
};

// src/core/index.ts
var rootContainer = null;
var shadowRoot = null;
var initRootContainer = () => {
  if (rootContainer && shadowRoot) {
    return { rootContainer, shadowRoot };
  }
  rootContainer = document.createElement("div");
  rootContainer.id = "react-scan-root";
  shadowRoot = rootContainer.attachShadow({ mode: "open" });
  const cssStyles = document.createElement("style");
  cssStyles.textContent = styles_default;
  shadowRoot.appendChild(cssStyles);
  document.documentElement.appendChild(rootContainer);
  return { rootContainer, shadowRoot };
};
var Store = {
  wasDetailsOpen: signal7(true),
  isInIframe: signal7(IS_CLIENT && window.self !== window.top),
  inspectState: signal7({
    kind: "uninitialized"
  }),
  fiberRoots: /* @__PURE__ */ new Set(),
  reportData: /* @__PURE__ */ new Map(),
  legacyReportData: /* @__PURE__ */ new Map(),
  lastReportTime: signal7(0),
  interactionListeningForRenders: null,
  changesListeners: /* @__PURE__ */ new Map()
};
var ReactScanInternals = {
  instrumentation: null,
  componentAllowList: null,
  options: signal7({
    enabled: true,
    log: false,
    showToolbar: true,
    animationSpeed: "fast",
    dangerouslyForceRunInProduction: false,
    showFPS: true,
    showNotificationCount: true,
    allowInIframe: false
  }),
  runInAllEnvironments: false,
  onRender: null,
  Store,
  version: package_default.version
};
if (IS_CLIENT && window.__REACT_SCAN_EXTENSION__) {
  window.__REACT_SCAN_VERSION__ = ReactScanInternals.version;
}
var applyLocalStorageOptions = (options) => {
  const { onCommitStart, onRender: onRender2, onCommitFinish, ...rest } = options;
  return rest;
};
var validateOptions = (options) => {
  const errors = [];
  const validOptions = {};
  for (const key in options) {
    const value = options[key];
    switch (key) {
      case "enabled":
      case "log":
      case "showToolbar":
      case "showNotificationCount":
      case "dangerouslyForceRunInProduction":
      case "showFPS":
      case "allowInIframe":
      case "useOffscreenCanvasWorker":
        if (typeof value !== "boolean") {
          errors.push(`- ${key} must be a boolean. Got "${value}"`);
        } else {
          validOptions[key] = value;
        }
        break;
      case "animationSpeed":
        if (!["slow", "fast", "off"].includes(value)) {
          errors.push(`- Invalid animation speed "${value}". Using default "fast"`);
        } else {
          validOptions[key] = value;
        }
        break;
      case "safeArea": {
        const parsed = parseSafeAreaOption(value);
        if (parsed.ok) {
          validOptions.safeArea = parsed.value;
        } else {
          errors.push(parsed.error);
        }
        break;
      }
      case "onCommitStart":
        if (typeof value !== "function") {
          errors.push(`- ${key} must be a function. Got "${value}"`);
        } else {
          validOptions.onCommitStart = value;
        }
        break;
      case "onCommitFinish":
        if (typeof value !== "function") {
          errors.push(`- ${key} must be a function. Got "${value}"`);
        } else {
          validOptions.onCommitFinish = value;
        }
        break;
      case "onRender":
        if (typeof value !== "function") {
          errors.push(`- ${key} must be a function. Got "${value}"`);
        } else {
          validOptions.onRender = value;
        }
        break;
      default:
        errors.push(`- Unknown option "${key}"`);
    }
  }
  if (errors.length > 0) {
    console.warn(`[React Scan] Invalid options:
${errors.join("\n")}`);
  }
  return validOptions;
};
var getReport = (type) => {
  if (type) {
    for (const reportData of Array.from(Store.legacyReportData.values())) {
      if (reportData.type === type) {
        return reportData;
      }
    }
    return null;
  }
  return Store.legacyReportData;
};
var setOptions = (userOptions) => {
  var _a;
  try {
    const validOptions = validateOptions(userOptions);
    if (Object.keys(validOptions).length === 0) {
      return;
    }
    const shouldInitToolbar = "showToolbar" in validOptions && validOptions.showToolbar !== void 0;
    const newOptions = {
      ...ReactScanInternals.options.value,
      ...validOptions
    };
    const { instrumentation } = ReactScanInternals;
    if (instrumentation && "enabled" in validOptions) {
      instrumentation.isPaused.value = validOptions.enabled === false;
    }
    ReactScanInternals.options.value = newOptions;
    try {
      const existing = (_a = readLocalStorage(
        "react-scan-options"
      )) == null ? void 0 : _a.enabled;
      if (typeof existing === "boolean") {
        newOptions.enabled = existing;
      }
    } catch (e) {
      if (ReactScanInternals.options.value._debug === "verbose") {
        console.error(
          "[React Scan Internal Error]",
          "Failed to create notifications outline canvas",
          e
        );
      }
    }
    saveLocalStorage(
      "react-scan-options",
      applyLocalStorageOptions(newOptions)
    );
    if (shouldInitToolbar) {
      initToolbar(!!newOptions.showToolbar);
    }
    return newOptions;
  } catch (e) {
    if (ReactScanInternals.options.value._debug === "verbose") {
      console.error(
        "[React Scan Internal Error]",
        "Failed to create notifications outline canvas",
        e
      );
    }
  }
};
var getOptions = () => ReactScanInternals.options;
var isProduction = null;
var rdtHook;
var getIsProduction = () => {
  if (isProduction === false) {
    return false;
  }
  rdtHook != null ? rdtHook : rdtHook = getRDTHook();
  const renderers = Array.from(rdtHook.renderers.values());
  if (renderers.length === 0) {
    return null;
  }
  for (const renderer of renderers) {
    const buildType = detectReactBuildType(renderer);
    if (buildType !== "production") {
      isProduction = false;
      return false;
    }
  }
  return true;
};
var start = () => {
  try {
    if (!IS_CLIENT) {
      return;
    }
    if (!ReactScanInternals.runInAllEnvironments && getIsProduction() && !ReactScanInternals.options.value.dangerouslyForceRunInProduction) {
      return;
    }
    checkReactGrabVersion();
    const localStorageOptions = readLocalStorage("react-scan-options");
    if (localStorageOptions) {
      const validLocalOptions = validateOptions(localStorageOptions);
      if (Object.keys(validLocalOptions).length > 0) {
        ReactScanInternals.options.value = {
          ...ReactScanInternals.options.value,
          ...validLocalOptions
        };
      }
    }
    const options = getOptions();
    initReactScanInstrumentation(() => {
      initToolbar(!!options.value.showToolbar);
    });
    if (IS_CLIENT) {
      setTimeout(() => {
        if (isInstrumentationActive()) return;
        console.error("[React Scan] Failed to load. Must import React Scan before React runs.");
      }, 5e3);
    }
  } catch (e) {
    if (ReactScanInternals.options.value._debug === "verbose") {
      console.error(
        "[React Scan Internal Error]",
        "Failed to create notifications outline canvas",
        e
      );
    }
  }
};
var initToolbar = (showToolbar) => {
  var _a;
  (_a = window.reactScanCleanupListeners) == null ? void 0 : _a.call(window);
  const cleanupTimingTracking = startTimingTracking();
  const cleanupOutlineCanvas = createNotificationsOutlineCanvas();
  window.reactScanCleanupListeners = () => {
    cleanupTimingTracking();
    cleanupOutlineCanvas == null ? void 0 : cleanupOutlineCanvas();
  };
  const windowToolbarContainer = window.__REACT_SCAN_TOOLBAR_CONTAINER__;
  if (!showToolbar) {
    windowToolbarContainer == null ? void 0 : windowToolbarContainer.remove();
    return;
  }
  windowToolbarContainer == null ? void 0 : windowToolbarContainer.remove();
  const { shadowRoot: shadowRoot2 } = initRootContainer();
  createToolbar(shadowRoot2);
};
var createNotificationsOutlineCanvas = () => {
  try {
    const highlightRoot = document.documentElement;
    return createHighlightCanvas(highlightRoot);
  } catch (e) {
    if (ReactScanInternals.options.value._debug === "verbose") {
      console.error(
        "[React Scan Internal Error]",
        "Failed to create notifications outline canvas",
        e
      );
    }
  }
};
var scan = (options = {}) => {
  setOptions(options);
  const isInIframe = Store.isInIframe.value;
  if (isInIframe && !ReactScanInternals.options.value.allowInIframe && !ReactScanInternals.runInAllEnvironments) {
    return;
  }
  if (options.enabled === false && options.showToolbar !== true) {
    return;
  }
  start();
};
var useScan = (options = {}) => {
  setOptions(options);
  start();
};
var onRender = (type, _onRender) => {
  const prevOnRender = ReactScanInternals.onRender;
  ReactScanInternals.onRender = (fiber, renders) => {
    prevOnRender == null ? void 0 : prevOnRender(fiber, renders);
    if (getType5(fiber.type) === type) {
      _onRender(fiber, renders);
    }
  };
};
var ignoredProps = /* @__PURE__ */ new WeakSet();
var ignoreScan = (node) => {
  if (node && typeof node === "object") {
    ignoredProps.add(node);
  }
};
export {
  ReactScanInternals,
  Store,
  getIsProduction,
  getOptions,
  getReport,
  ignoreScan,
  ignoredProps,
  onRender,
  scan,
  setOptions,
  start,
  useScan
};
