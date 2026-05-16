/// <reference types="node" />

type ColorString = string
type ColorArray = [number, number, number, number?]
type ColorArg = ColorString | ColorArray

declare class NodePnglib {
    /**
     * Creates a new PNG canvas.
     * @param width  Width in pixels (must be >= 1)
     * @param height Height in pixels (must be >= 1)
     * @param depth  Color palette depth, default 8 (max 2^depth colors)
     * @param backgroundColor Default [0,0,0,0] (transparent black)
     * @throws if width < 1 or height < 1
     */
    constructor(
        width: number,
        height: number,
        depth?: number,
        backgroundColor?: ColorArg
    )

    /** Width in pixels. */
    readonly width: number
    /** Height in pixels. */
    readonly height: number
    /** Color depth. */
    readonly depth: number
    /** Raw internal buffer (for direct manipulation). */
    readonly buffer: Buffer
    /** Number of colors in the palette. */
    readonly pindex: number

    /**
     * Returns the buffer index for pixel (x, y).
     * Pass x=-1 to get the row filter byte.
     */
    index(x: number, y: number): number

    /**
     * Resolves a color to a palette index.
     * Adds the color to the palette if not yet seen.
     * @throws if the color string is invalid
     */
    color(rgba: ColorArg): number

    /**
     * Sets the background color (palette index 0).
     * @returns the palette index (always 0)
     */
    setBgColor(rgba: ColorArg): number

    /**
     * Sets a pixel. Out-of-bounds coordinates are silently ignored.
     */
    setPixel(x: number, y: number, rgba: ColorArg): void

    /** Returns the PNG as a Base64-encoded string. */
    getBase64(): string

    /** Returns the complete PNG as a Buffer. */
    getBuffer(): Buffer

    /** Finalizes and returns the PNG buffer (alias for getBuffer). */
    deflate(): Buffer
}

declare namespace NodePnglib {
    export type Color = ColorArg
}

export = NodePnglib
