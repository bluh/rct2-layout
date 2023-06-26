import { SizeDesc, SizeType, SizableObject } from "./types/size";
import { BoundingBox } from "./types/box";
import { SizeChangeResponse } from "./types/requests";
import { UniqueNameGenerator } from "./types/misc";
import { SwitchbackBase, SwitchbackChild, SwitchbackDirection, SwitchbackParent, SwitchbackResizable } from "./types/bases";
import { getChildrenFlatRecurse, isParentOf, isResizable } from "./types/utils";

// Re-exports
export { BoxModelProps, defaultGroupBoxPadding } from "./types/box";
export { BoundingBox };
export * from "./types/widgets";

/**
 * Describes the properties needed to initialize a `SwitchbackResizableWidget` object
 */
interface SwitchbackResizableWidgetProps {
    /**
     * The height of this object.
     */
    height: SizeType;

    /**
     * The width of this object.
     */
    width: SizeType;

    /**
     * If present, describes the number of pixels surrounding the outside of this object.
     */
    margin?: BoundingBox;
}

/**
 * Widget that records a height and width, and which can respond to `SizeChangeRequest` requests from a parent.
 * Each widget wrapper implements this as a base class.
 */
class SwitchbackResizableWidget implements SwitchbackResizable {
    /**
     * The height of this widget.
     */
    height: SizeDesc;

    /**
     * The width of this widget.
     */
    width: SizeDesc;

    /**
     * If present, describes the number of pixels surrounding the outside of this widget.
     */
    margin?: BoundingBox;

    constructor(props: SwitchbackResizableWidgetProps) {
        this.setHeight(props.height ?? 0);
        this.setWidth(props.width ?? 0);
        this.margin = props.margin ?? new BoundingBox();
    }


    /**
     * Change the target height of this Widget.
     * 
     * This won't actually change the size of the Widget until apply() is called on the parent Window to recalculate the layout.
     * @param value New height value. Use a number for an absolute size, "xxx%" for a relative size, or a combination described by the SizeDesc type.
     */
    setHeight(value: number | string | SizeDesc) {
        if (typeof value === "string") {
            const matches = value.match(/^(\d+(?:\.\d+)?)%$/);

            if (!matches || matches.length === 0) {
                throw TypeError(`Height value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.height = {
                relative: parsedValue
            }
        } else if (typeof value === "number") {
            this.height = {
                absolute: value
            }
        } else {
            this.height = value;
        }
    }

    /**
     * Change the target width of this Widget.
     * 
     * This won't actually change the size of the Widget until apply() is called on the parent Window to recalculate the layout.
     * @param value New width value. Use a number for an absolute size, "xxx%" for a relative size, or a combination described by the SizeDesc type.
     */
    setWidth(value: number | string | SizeDesc) {
        if (typeof value === "string") {
            const matches = value.match(/^(\d+(?:\.\d+)?)%$/);

            if (!matches || matches.length === 0) {
                throw TypeError(`Width value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.width = {
                relative: parsedValue
            }
        } else if (typeof value === "number") {
            this.width = {
                absolute: value
            }
        } else {
            this.width = value;
        }
    }

    reactToParentSizeChange(newX, newY, parentHeight, parentWidth) {
        var newHeight: number = 0;
        var newWidth: number = 0;

        if (this.height.relative) {
            newHeight = parentHeight * (this.height.relative / 100.0);
        }
        if (this.height.absolute) {
            newHeight += this.height.absolute
        }


        if (this.width.relative) {
            newWidth = parentWidth * (this.width.relative / 100.0);
        }
        if (this.width.absolute) {
            newWidth += this.width.absolute
        }

        const result: SizeChangeResponse = {
            newAbsoluteX: newX,
            newAbsoluteY: newY,
            newAbsoluteHeight: newHeight,
            newAbsoluteWidth: newWidth,
            newEffectiveX: newX + this.margin.getLeft(),
            newEffectiveY: newY + this.margin.getTop(),
            newEffectiveHeight: newHeight - (this.margin.getTop() + this.margin.getBottom()),
            newEffectiveWidth: newWidth - (this.margin.getLeft() + this.margin.getRight())
        }

        return result;
    }

}


/**
 * Describes the properties that can be given to a SwitchbackWidget to initialize it
 */
export interface SwitchbackWidgetProps extends SwitchbackResizableWidgetProps {
    /**
     * If present, the base OpenRCT2 object this Widget will represent.
     * 
     * If not present, this Widget describes a object that does not render. (a Group or Spacer)
     */
    base?: Widget;
}

/**
 * Wrapper class representing an object that has a base object that can be resized, and a child of a parent group.
 * The object *may* contain a reference to a base OpenRCT2 widget object, though it is not required.
 * This class will record the position and size details of the base widget object, and interactions with this object
 * will carry down to the underlying base object.
 */
export class SwitchbackWidget extends SwitchbackResizableWidget implements SwitchbackBase {
    /**
     * The base OpenRCT2 object this Widget represents.
     * SwitchbackWidget with an empty base are either a Group (if the object has children) or a Spacer (if there are no children)
     */
    base?: SizableObject;

    /**
     * The base widget that comes from the parent window, queried based on the name. Get the current object by calling `getWidget()`.
     */
    private windowBase: SizableObject;

    /**
     * String representing the name of the Widget.
     * If this Widget wraps a valid OpenRCT2 widget, these names should match.
     */
    name: string;

    /**
     * The base OpenRCT2 window object this Widget is a part of.
     */
    parentWindow: Window;

    /**
     * Callback called when the Widget resizes.
     */
    onResize: (this: SwitchbackWidget) => void;

    constructor(props: SwitchbackWidgetProps) {
        super(props);
        if (props.base) {
            props.base.name = props.base.name ?? UniqueNameGenerator.getNext("SWBase");
            this.name = props.base.name;
        } else {
            this.name = UniqueNameGenerator.getNext("SWBaseless");
        }
        this.base = props.base;
        this.margin = props.margin ?? new BoundingBox();
    }

    /**
     * Gets the updated widget state from the parent window. Because updates to the Widget's `base` property will not affect the
     * base object after the initial rendering, updates must be done on this updated widget base.
     * @returns The updated widget retrieved from the window.
     */
    getWidget() {
        if (!this.windowBase) {
            if (!this.parentWindow) {
                throw Error("Could not get widget: widget has not been assigned to a window.");
            }
            if (!this.base) {
                throw Error("Could not get widget: has not been initialized.");
            }
            if (!this.name) {
                throw Error("Could not get widget: widget needs a name to be found.");
            }
            this.windowBase = this.parentWindow.findWidget(this.name);
        }
        return this.windowBase;
    }

    /**
     * Changes the position and size of the widget in the parent window, using absolute pixel measurements.
     * @param x New X position of the widget in pixels
     * @param y New Y position of the widget in pixels
     * @param height New height of the widget in pixels
     * @param width New width of the widget in pixels
     */
    changeWidgetSize(x: number, y: number, height: number, width: number) {
        const widget = this.getWidget();
        widget.x = x;
        widget.y = y;
        widget.height = height;
        widget.width = width;
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number) {
        const sizeChange = super.reactToParentSizeChange(newX, newY, parentHeight, parentWidth);

        if (this.base) {
            this.changeWidgetSize(
                sizeChange.newEffectiveX,
                sizeChange.newEffectiveY,
                sizeChange.newEffectiveHeight,
                sizeChange.newEffectiveWidth
            );
        }

        return sizeChange;
    }
}

/** 
 * Describes the properties that can be given to a SwitchbackGroup to initialize it
 */
export interface SwitchbackGroupProps extends SwitchbackWidgetProps {
    /**
     * Direction this Group is going in.
     * 
     * Children of this Group will appear sequentially in this direction
     */
    direction: SwitchbackDirection;

    /**
     * If present, describes the number of pixels surrounding the inside of this object.
     * 
     * This only affects the children of this Group, so childless Groups will be unaffected by this property.
     */
    padding?: BoundingBox;
}


/**
 * Wrapper class representing an object that can contain objects as a parent, has a base that can be resized,
 * and can be a child of a parent group.
 * The object *may* contain a reference to a base OpenRCT2 widget object, though it is not required.
 * This class will record the position and size details of the base widget object, and interactions with this
 * object will carry down to the underlying base object.
 * 
 * Implements the `reactToParentSizeChange` method required for responding to resize requests from the parent object.
 */
export class SwitchbackGroup extends SwitchbackWidget implements SwitchbackParent<SwitchbackChild> {
    /**
     * Direction the group will display children in.
     */
    direction: SwitchbackDirection;

    /**
     * Pixels of padding around this Group.
     */
    padding: BoundingBox;

    /**
     * The children of this Group.
     */
    children: SwitchbackChild[];

    constructor(props: SwitchbackGroupProps) {
        super(props);

        this.direction = props.direction;
        this.padding = props.padding ?? new BoundingBox();
        this.children = [];
    }
    /**
     * Adds a child to this SwitchbackGroup
     * @param child The SwitchbackGroup or SwitchbackChild to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChild(child: SwitchbackChild) {
        this.children.push(child);
        return this;
    }

    /**
     * Adds multiple children to this SwitchbackGroup at once
     * @param children The array of SwitchbackGroups or SwitchbackChilds to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChildren(children: SwitchbackChild[]) {
        this.children.push(...children);
        return this;
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number) {
        var newHeight: number, newWidth: number;
        if (this instanceof SwitchbackWindow) {
            newHeight = parentHeight;
            newWidth = parentWidth;
        } else {
            const resizedWidget = super.reactToParentSizeChange(newX, newY, parentHeight, parentWidth);
            newHeight = resizedWidget.newAbsoluteHeight;
            newWidth = resizedWidget.newAbsoluteWidth;
        }

        const childrenHeight = newHeight - (this.padding.getTop() + this.padding.getBottom());
        const childrenWidth = newWidth - (this.padding.getLeft() + this.padding.getRight());

        if (this.children) {
            var sequenceX = newX + this.padding.getLeft();
            var sequenceY = newY + this.padding.getTop();
            this.children.forEach(child => {
                if(isResizable(child)){
                    const newChildSize = child.reactToParentSizeChange(sequenceX, sequenceY, childrenHeight, childrenWidth);
                    if (this.direction === "HORIZONTAL") {
                        sequenceX += newChildSize.newAbsoluteWidth;
                    } else {
                        sequenceY += newChildSize.newAbsoluteHeight;
                    }
                }
            });
        }

        const result: SizeChangeResponse = {
            newAbsoluteX: newX,
            newAbsoluteY: newY,
            newAbsoluteHeight: newHeight,
            newAbsoluteWidth: newWidth,
            newEffectiveX: newX + this.margin.getLeft(),
            newEffectiveY: newY + this.margin.getTop(),
            newEffectiveHeight: newHeight - (this.margin.getTop() + this.margin.getBottom()),
            newEffectiveWidth: newWidth - (this.margin.getLeft() + this.margin.getRight())
        }

        return result;
    }
}

/** Describes the properties that can be given to a SwitchbackTab to initialize it */
export interface SwitchbackTabProps extends Omit<SwitchbackResizableWidgetProps, "height" | "width"> {
    icon?: number;
    direction: SwitchbackDirection;
    padding?: BoundingBox;
}

export class SwitchbackTab extends SwitchbackResizableWidget implements SwitchbackChild, SwitchbackParent<SwitchbackBase> {
    icon?: number;
    parentWindow: Window;
    children: SwitchbackBase[];
    direction?: SwitchbackDirection;
    padding?: BoundingBox;

    constructor(props: SwitchbackTabProps) {
        const ctorProps: SwitchbackResizableWidgetProps = {
            ...props,
            height: "100%",
            width: "100%"
        }

        super(ctorProps);


        this.direction = props.direction;
        this.padding = props.padding ?? new BoundingBox();
        this.children = [];
        this.icon = props.icon;
    }

    /**
     * Adds a child to this SwitchbackTab
     * @param child The SwitchbackChild to add
     * @returns The SwitchbackTab, allowing for chaining
     */
    addChild(child: SwitchbackChild) {
        this.children.push(child);
        return this;
    }

    /**
     * Adds multiple children to this SwitchbackTab at once
     * @param children The array of SwitchbackChilds to add
     * @returns The SwitchbackTab, allowing for chaining
     */
    addChildren(children: SwitchbackChild[]) {
        this.children.push(...children);
        return this;
    }

    getChildrenFlat() {
        return getChildrenFlatRecurse(this.children);
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number) {

        const childrenHeight = parentHeight - (this.padding.getTop() + this.padding.getBottom());
        const childrenWidth = parentWidth - (this.padding.getLeft() + this.padding.getRight());

        if (this.children) {
            var sequenceX = newX + this.padding.getLeft();
            var sequenceY = newY + this.padding.getTop();
            this.children.forEach(child => {
                if(isResizable(child)){
                    const newChildSize = child.reactToParentSizeChange(sequenceX, sequenceY, childrenHeight, childrenWidth);
                    if (this.direction === "HORIZONTAL") {
                        sequenceX += newChildSize.newAbsoluteWidth;
                    } else {
                        sequenceY += newChildSize.newAbsoluteHeight;
                    }
                }
            });
        }

        const result: SizeChangeResponse = {
            newAbsoluteX: newX,
            newAbsoluteY: newY,
            newAbsoluteHeight: parentHeight,
            newAbsoluteWidth: parentWidth,
            newEffectiveX: newX + this.margin.getLeft(),
            newEffectiveY: newY + this.margin.getTop(),
            newEffectiveHeight: parentHeight - (this.margin.getTop() + this.margin.getBottom()),
            newEffectiveWidth: parentWidth - (this.margin.getLeft() + this.margin.getRight())
        }

        return result;
    }
}

/**
 * Defines the props used to create a SwitchbackWindow.
 */
export interface SwitchbackWindowProps extends WindowDesc {
    /**
     * Initial direction of the window. All groups added to this window will sequence in this direction.
     * 
     * Defaults to "VERTICAL"
     */
    direction?: SwitchbackDirection;

    /**
     * Pixels of padding around this Group.
     */
    padding?: BoundingBox;
}

export class SwitchbackWindow extends SwitchbackGroup implements SwitchbackParent<SwitchbackWidget> {
    base: Window;

    baseWidth: number;

    baseHeight: number;


    children: SwitchbackWidget[];

    private theirOnUpdate: () => void;

    private windowProps: WindowDesc;

    constructor(props: SwitchbackWindowProps) {
        const superProps: SwitchbackGroupProps = {
            direction: props.direction ?? "VERTICAL",
            width: props.width,
            height: props.height,
            padding: props.padding ?? new BoundingBox({ top: 16, bottom: 16, left: 4, right: 4 })
        };
        super(superProps);

        this.theirOnUpdate = props.onUpdate ?? (() => { });
        props.onUpdate = this.onWindowUpdate.bind(this);

        this.windowProps = props;
    }

    addChild(child: SwitchbackWidget) {
        return super.addChild(child);
    }

    addChildren(children: SwitchbackWidget[]) {
        return super.addChildren(children);
    }

    private onWindowUpdate() {
        if (this.base) {
            if (this.base.width !== this.baseWidth || this.base.height !== this.baseHeight) {
                this.baseWidth = this.base.width;
                this.baseHeight = this.base.height;
                this.apply();
            }
            this.theirOnUpdate();
        }
    }

    getChildrenFlat() {
        return getChildrenFlatRecurse(this.children);
    }

    open() {
        if (this.base) {
            this.base.bringToFront();
        } else {
            const newChildren = this.getChildrenFlat();
            this.base = ui.openWindow({
                ...this.windowProps,
                widgets: <Widget[]>newChildren.filter(v => v.base).map(v => v.base)
            })
            this.baseHeight = this.base.height;
            this.baseWidth = this.base.width;
            newChildren.forEach(child => {
                child.parentWindow = this.base
            });
            this.apply();
        }
    }

    close() {
        if (this.base) {
            this.base.close();
        }
    }

    apply() {
        if (!this.base) {
            this.open();
        } else {
            super.reactToParentSizeChange(0, 0, this.baseHeight, this.baseWidth);
        }
    }
}

export class SwitchbackTabbedWindow extends SwitchbackGroup implements SwitchbackParent<SwitchbackTab> {
    base: Window;

    baseWidth: number;

    baseHeight: number;

    children: SwitchbackTab[];

    private theirOnUpdate: () => void;

    private windowProps: WindowDesc;

    constructor(props: SwitchbackWindowProps) {
        const superProps: SwitchbackGroupProps = {
            direction: props.direction ?? "VERTICAL",
            width: props.width,
            height: props.height,
            padding: props.padding ?? new BoundingBox({ top: 46, bottom: 16, left: 4, right: 4 })
        };
        super(superProps);

        this.theirOnUpdate = props.onUpdate ?? (() => { });
        props.onUpdate = this.onWindowUpdate.bind(this);

        this.windowProps = props;
    }

    addChild(child: SwitchbackTab) {
        return super.addChild(child);
    }

    addChildren(children: SwitchbackTab[]) {
        return super.addChildren(children);
    }

    private onWindowUpdate() {
        if (this.base) {
            if (this.base.width !== this.baseWidth || this.base.height !== this.baseHeight) {
                this.baseWidth = this.base.width;
                this.baseHeight = this.base.height;
                this.apply();
            }
            this.theirOnUpdate();
        }
    }

    open() {
        if (this.base) {
            this.base.bringToFront();
        } else {
            const newTabs = this.children.map(tab => ({
                image: tab.icon,
                widgets: tab.getChildrenFlat()
            }));

            this.base = ui.openWindow({
                ...this.windowProps,
                tabs: <WindowTabDesc[]>newTabs.map(tab => ({
                    image: tab.image,
                    widgets: tab.widgets.filter(v => v.base).map(v => v.base)
                })),
                onTabChange: () => {
                    this.apply();
                },
            });
            this.baseHeight = this.base.height;
            this.baseWidth = this.base.width;
            this.children.forEach(tab => {
                tab.parentWindow = this.base;
            })
            newTabs.forEach(tab => {
                tab.widgets.forEach(child => {
                    child.parentWindow = this.base
                })
            })
            this.apply();
        }
    }

    close() {
        if (this.base) {
            this.base.close();
        }
    }

    apply() {
        if (!this.base) {
            this.open();
        } else {
            const openIndex = this.base.tabIndex;
            const tab = this.children[openIndex];

            tab.reactToParentSizeChange(
                this.padding.getLeft(),
                this.padding.getTop(),
                this.baseHeight - (this.padding.getTop() + this.padding.getBottom()),
                this.baseWidth - (this.padding.getLeft() + this.padding.getRight())
            );
        }
    }
}