import { SizableObject, SizeDesc } from "./size";
import { BoundingBox } from "./box";
import { SizeChangeRequest } from "./requests";

/** Describes the direction of the SwitchbackGroup */
export type SwitchbackDirection = "VERTICAL" | "HORIZONTAL";

/**
 * Type of Switchback wrapper that belongs to a window, which contains a reference to that window.
 */
export interface SwitchbackChild {
    parentWindow: Window;
}

/**
 * Type of a Switchback wrapper that contains a widget base to render. Must be a child of a parent window,
 * and must implement to `SwitchbackChild` interface.
 */
export interface SwitchbackBase extends SwitchbackChild{
    base?: SizableObject;
}

/**
 * Type of a Switchback wrapper that represents a widget that can be moved and resized. The widget does not 
 * necessarily need to have a base, and can be a blank object (a Spacer or a Tab) without one.
 */
export interface SwitchbackResizable {
    /**
     * Handles a change in the size or position of the parent object. This will calculate the new position and
     * size of the widget based on its absolute and relative values, then returns the value so the parent can
     * calculate the value of its siblings.
     * 
     * This method is called by the parent widgets and should not need to be called manually
     * @param newX New X position of the widget in pixels
     * @param newY New Y position of the widget in pixels
     * @param parentHeight The available height of the parent widget
     * @param parentWidth The available width of the parent widget
     * @returns The new height and width of the widget after padding and margins have been applied
     */
    reactToParentSizeChange: SizeChangeRequest;

    height: SizeDesc;
    width: SizeDesc;
    margin?: BoundingBox;
}

/**
 * Type of a Switchback wrapper that contains children which must conform to `SwitchbackChild`
 */
export interface SwitchbackParent<ChildObject extends SwitchbackChild> {
    children: ChildObject[];
    direction?: SwitchbackDirection;
    padding?: BoundingBox;
    addChild: (child: ChildObject) => this;
    addChildren: (child: ChildObject[]) => this;
}