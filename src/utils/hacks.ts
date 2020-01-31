/**
 * Produces an array with N items, the value of each item is n
 *
 * @param i: Length of the array to be generated
 */
export function range(i: number): Array<number> {
  return i ? range(i - 1).concat(i) : [];
}

/**
 * Generates a URL from a path pattern
 *
 * @param pattern
 * @param params
 */
export function generateUrl(pattern: string, params = {}) {
  return pattern
    .replace(/\w*(:\w+\??)/g, (path, param) => {
      const key = param.replace(/[:?]/g, '');
      if (params[key] === undefined) {
        if (param.indexOf('?') < 0) {
          return path;
        } else {
          return '';
        }
      } else {
        return path.replace(param, params[key]);
      }
    })
    .replace(/\/\//, '/');
}

/**
 * Copies the text to the clipboard
 *
 * @param text
 * @param onSuccess
 * @param onError
 */
export function copyToClipboard(text: string, onSuccess: () => void, onError?: () => void) {
  // @ts-ignore:disable-next-line
  if (!navigator.clipboard) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');

      if (successful) {
        onSuccess();
      }
    } catch (err) {
      onError && onError();
    }

    document.body.removeChild(textArea);
  } else {
    // @ts-ignore:disable-next-line
    navigator.clipboard.writeText(text).then(onSuccess, onError);
  }
}

/**
 * Returns a text based on different criterias of time ago
 *
 * @param date1
 * @param date2
 * @param translations
 */
export function richDateDifference(
  date1: Date,
  date2: Date = new Date(),
  translations: { today: string; daysAgo: string; weeksAgo: string; monthsAgo: string; yearsAgo: string },
) {
  const [t2, t1] = [date2.getTime(), date1.getTime()];

  if (isNaN(t2) || isNaN(t1)) {
    return '-';
  }

  if (date1.toDateString() === date2.toDateString()) {
    return translations.today;
  }

  const inDays = Math.ceil((t2 - t1) / (24 * 3600 * 1000));

  if (inDays <= 7) {
    return `${inDays} ${translations.daysAgo}`;
  }

  if (inDays < 31) {
    const inWeeks = Math.floor((t2 - t1) / (24 * 3600 * 1000 * 7));

    return `${inWeeks} ${translations.weeksAgo}`;
  }

  const inMonths = ((d1, d2) => {
    const [d1Y, d2Y, d1M, d2M] = [d1.getFullYear(), d2.getFullYear(), d1.getMonth(), d2.getMonth()];
    return Math.ceil(d2M + 12 * d2Y - (d1M + 12 * d1Y));
  })(date1, date2);

  if (inMonths < 12) {
    return `${inMonths} ${translations.monthsAgo}`;
  }

  return `${date2.getFullYear() - date1.getFullYear()} ${translations.yearsAgo}`;
}

/**
 * Returns a string with a human readable representation of bytes
 *
 * @param bytes
 */
export function humanFileSize(bytes: number) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);

  return bytes.toFixed(1) + ' ' + units[u];
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

/**
 * Splits a array into parts of N size
 *
 * @param list
 * @param size
 */
export function chunk<T>(list: Array<T>, size: number) {
  return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
}
