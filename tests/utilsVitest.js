import { expect } from 'vitest'

export const dir = (obj, options) =>
    console.dir(obj, { depth: null, ...options })

export const expectOrNone = (actual, expected) => {
    if (expected === undefined) expect(actual).toBeUndefined()
    else expect(actual).toBeCloseTo(expected)
}
