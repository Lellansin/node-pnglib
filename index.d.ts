declare const Buffer

type ColorString = string
type ColorArr = number[]
type RGBA = ColorString | ColorArr

declare class NodePnglib {
    constructor(
        width: number,
        height: number,
        /** Color depth of the png, default to 8. */
        depth?: number,
        /** For example: [1, 1, 1, 1], 'blue', 'transparent' or 'rgba(1, 1, 1, 1)', default to [0, 0, 0, 0]. */
        backgroundColor?: RGBA
    )

    index(x: number, y: number): number

    color(rgba: RGBA)

    setBgColor(rgba: RGBA): number

    setPixel(x: number, y: number, rgba: RGBA): void

    getBase64(): string

    getBuffer(): Buffer

    deflate(): Buffer
}

declare namespace NodePnglib {
    export type Color = RGBA
}

export = NodePnglib
