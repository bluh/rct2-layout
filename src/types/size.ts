/**
 * Describes the size of a sizable object.
 * Relative values are sizes described by a percent of the entire height or width provided by a parent object.
 * Absolute values are sizes described a fixed number of pixels.
 * These values can be mixed to create values that are absolute offsets of relative values.
 */
export type SizeDesc = {
    /**
     * Describes the size by a fixed number of pixels.
     */
    absolute?: number;

    /**
     * Describes the size by a percent of the size provided by the parent.
     */
    relative?: number;
}

/**
 * Describes the size of a sizeable object either as a relative string value ("100%"),
 * an absolute number value (10), or a mixture of the two described by providing a `SizeDesc` value
 */
export type SizeType = string | number | SizeDesc;

/**
 * Type of an object that can be resized, which has x, y, width, and height parameters
 */
export type SizableObject = Widget | Window;