/**
 * Array utility functions for safe array operations
 */

/**
 * Ensures the input is an array. If not, converts it to an array or returns empty array.
 * @param input - The input to check/convert
 * @returns A guaranteed array
 */
export function ensureArray<T>(input: any): T[] {
  if (Array.isArray(input)) {
    return input
  }
  
  if (input === null || input === undefined) {
    return []
  }
  
  if (typeof input === 'object') {
    return Object.values(input)
  }
  
  return [input]
}

/**
 * Safe map function that handles non-array inputs gracefully
 * @param input - The input to map over
 * @param mapFn - The map function
 * @returns The mapped array or empty array if input is not mappable
 */
export function safeMap<T, U>(input: any, mapFn: (item: T, index: number) => U): U[] {
  const array = ensureArray<T>(input)
  return array.map(mapFn)
}

/**
 * Checks if a value can be safely used with .map()
 * @param input - The input to check
 * @returns true if the input is safely mappable
 */
export function isMappable(input: any): input is any[] {
  return Array.isArray(input)
}

/**
 * Gets array length safely, returns 0 for non-arrays
 * @param input - The input to check
 * @returns The length of the array or 0
 */
export function safeLength(input: any): number {
  if (Array.isArray(input)) {
    return input.length
  }
  return 0
}

/**
 * Safely accesses array item by index
 * @param input - The array or array-like object
 * @param index - The index to access
 * @param defaultValue - Default value if index is out of bounds or input is not an array
 * @returns The array item or default value
 */
export function safeGet<T>(input: any, index: number, defaultValue?: T): T | undefined {
  const array = ensureArray<T>(input)
  return array[index] !== undefined ? array[index] : defaultValue
}