/**
 * Produces an array with N items, the value of each item is n
 *
 * @param i: Length of the array to be generated
 */
export function range(i: number): Array<number> {
  return i ? range(i - 1).concat(i) : [];
}

/**
 * Checks whether a string provided is a data URI.
 *
 * @param {String} str String to check
 */
export const isDataURI = (str: string) => /^data:/.test(str);

export const dataURItoUint8Array = (dataURI: string) => {
  if (!isDataURI(dataURI)) {
    throw new Error('dataURItoUint8Array was provided with an argument which is not a valid data URI.');
  }

  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
};

/**
 * Throttles a function call
 *
 * @param func
 * @param limit
 */
export function throttle(func: (...arg: Array<any>) => void, limit = 1000) {
  let inThrottle = false;

  return function(...args: Array<any>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Converts SnakeCase to Camelcase
 * @param s
 */
export function toCamel(s: string) {
  const camel = s.toLowerCase().replace(/([-_][a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
