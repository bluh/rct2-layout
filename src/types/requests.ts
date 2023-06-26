/**
 * Response from a child object that describes the new size and position in the window based
 * on its relative/absolute sizing and the positions/heights provided by the `SizeChangeRequest`
 * parameters.
 * 
 * Absolute values describe the widget's total share of height/width and where it is before
 * padding/margin calculations.
 * 
 * Effective values describe the widget's actual values for position and height, based on
 * padding/margin calculations.
 */
export type SizeChangeResponse = {
    /**
     * New height consumed by the object
     */
    newAbsoluteHeight: number,

    /**
     * New height visually used by the object
     */
    newEffectiveHeight: number,

    /**
     * New width consumed by the object
     */
    newAbsoluteWidth: number,
    
    /**
     * New width visually consumed by the object
     */
    newEffectiveWidth: number,

    /**
     * New X position of the object
     */
    newAbsoluteX: number,

    /**
     * New X position of the object visually
     */
    newEffectiveX: number,

    /**
     * New Y position of the object
     */
    newAbsoluteY: number,
    
    /**
     * New Y position of the object visually
     */
    newEffectiveY: number
}

/**
 * Request from parent object to SizableObject to modify its size and position in the window.
 * Returns the new absolute height and width of this object
 */
export type SizeChangeRequest = (
    newX: number,
    newY: number,
    parentHeight: number,
    parentWidth: number
) => SizeChangeResponse