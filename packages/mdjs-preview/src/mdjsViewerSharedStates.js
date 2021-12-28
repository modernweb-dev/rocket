const _sharedStates = {
  platform: 'web',
  size: 'webSmall',
  previewTheme: 'light',
  language: 'en',
  autoHeight: true,
  deviceMode: false,
  rememberSettings: false,
  edgeDistance: true,
};

/** @type {Function[]} */
let subscribeFns = [];

/**
 * @param {Function} subscribeFn
 */
export function subscribe(subscribeFn) {
  subscribeFns.push(subscribeFn);
}

/**
 * @param {Function} subscribeFn
 */
export function unSubscribe(subscribeFn) {
  subscribeFns = subscribeFns.filter(fn => fn !== subscribeFn);
}

function storeSettings() {
  for (const _sharedStateKey of Object.keys(_sharedStates)) {
    const sharedStateKey = /** @type {keyof _sharedStates} */ (_sharedStateKey);
    if (_sharedStates.rememberSettings) {
      localStorage.setItem(
        `mdjsViewerSharedStates-${sharedStateKey}`,
        _sharedStates[sharedStateKey].toString(),
      );
    } else {
      localStorage.removeItem(`mdjsViewerSharedStates-${sharedStateKey}`);
    }
  }
}

let hasGlobalStateBeenSetBefore = false;

function restoreSettings() {
  for (const _sharedStateKey of Object.keys(_sharedStates)) {
    const sharedStateKey = /** @type {keyof _sharedStates} */ (_sharedStateKey);
    const restoredValue = localStorage.getItem(`mdjsViewerSharedStates-${sharedStateKey}`);
    if (restoredValue !== null) {
      switch (sharedStateKey) {
        case 'autoHeight':
        case 'deviceMode':
        case 'rememberSettings':
        case 'edgeDistance':
          _sharedStates[sharedStateKey] = restoredValue === 'true' ? true : false;
          break;
        default:
          _sharedStates[sharedStateKey] = restoredValue;
      }
      hasGlobalStateBeenSetBefore = true;
    }
  }
}

restoreSettings();

/**
 *
 * @param {import('./MdJsPreview.js').MdJsPreview} target
 */
export function applySharedStates(target) {
  if (hasGlobalStateBeenSetBefore) {
    for (const _sharedStateKey of Object.keys(_sharedStates)) {
      const sharedStateKey = /** @type {keyof _sharedStates} */ (_sharedStateKey);
      switch (sharedStateKey) {
        case 'autoHeight':
        case 'deviceMode':
        case 'rememberSettings':
        case 'edgeDistance':
          target[sharedStateKey] = _sharedStates[sharedStateKey];
          break;
        default:
          target[sharedStateKey] = _sharedStates[sharedStateKey];
      }
    }
  } else {
    _saveToSharedStates(target);
  }
}

/**
 *
 * @param {import('./MdJsPreview.js').MdJsPreview} target
 */
function _saveToSharedStates(target) {
  let updated = false;
  for (const _sharedStateKey of Object.keys(_sharedStates)) {
    const sharedStateKey = /** @type {keyof _sharedStates} */ (_sharedStateKey);
    if (_sharedStates[sharedStateKey] !== target[sharedStateKey]) {
      switch (sharedStateKey) {
        case 'autoHeight':
        case 'deviceMode':
        case 'rememberSettings':
        case 'edgeDistance':
          _sharedStates[sharedStateKey] = target[sharedStateKey];
          break;
        default:
          _sharedStates[sharedStateKey] = target[sharedStateKey];
      }
      updated = true;
      hasGlobalStateBeenSetBefore = true;
    }
  }
  return updated;
}

/**
 *
 * @param {import('./MdJsPreview.js').MdJsPreview} target
 * @param {Function} subscribedFn
 */
export function saveToSharedStates(target, subscribedFn) {
  const updated = _saveToSharedStates(target);
  if (updated) {
    storeSettings();
    for (const subscribeFn of subscribeFns) {
      if (subscribeFn !== subscribedFn) {
        subscribeFn();
      }
    }
  }
}
