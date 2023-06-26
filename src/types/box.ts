/**
 * Models an offset from top, bottom, left, and right of a space
 */
export type BoxModelProps = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

/**
 * Used to describe a Widget's margin or padding. Wraps the `BoxModelProps` type
 */
export class BoundingBox implements BoxModelProps {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;

    constructor(props?: BoxModelProps) {
        if (props) {
            this.top = props.top;
            this.bottom = props.bottom;
            this.left = props.left;
            this.right = props.right;
        }
    }

    getTop() {
        return this.top ?? 0;
    }

    getBottom() {
        return this.bottom ?? 0;
    }

    getLeft() {
        return this.left ?? 0;
    }

    getRight() {
        return this.right ?? 0;
    }
}

/**
 * Helper BoundingBox provided to describe the default padding on a Group Box widget
 */
export const defaultGroupBoxPadding = new BoundingBox({ top: 12, bottom: 4, left: 4, right: 4 });