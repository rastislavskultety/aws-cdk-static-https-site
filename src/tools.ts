
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!isObject(target[key])) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Helper to set default properties or override existing properties.
 * @param props - current properties
 * @param propsDefaults - defaults and overrides
 * @param deepMerge - when true then nested objects are merged as well, otherways only the root level is merged.
 * @returns properties with merged defaults and overrides.
 */
export function makeProps<T>(props: T, propsDefaults?: { defaults?: any; overrides?: any }, deepMerge: boolean = false): T {
  if (propsDefaults) {
    const fn = deepMerge ? mergeDeep : Object.assign;
    return fn({}, propsDefaults.defaults, props, propsDefaults.overrides);
  }
  return props;
}

/**
 * Logical exclusive or function
 * @param a - first parameter
 * @param b - second parameter
 * @returns a exclusive or b
 */
export function xor(a: any, b: any): boolean {
  return !!(a ? !b : b);
}
