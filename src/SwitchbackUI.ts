/** Describes the direction of the SwitchbackGroup */
type SwitchbackDirection = "VERTICAL" | "HORIZONTAL";

type SwitchbackObject = SwitchbackWidget | SwitchbackGroup;

interface SizeProps {
    absolute?: number;

    relative?: number;
}

type SizeType = string | number | SizeProps;

class UniqueNameGenerator {
    static next: number = 0;

    static getNext(name?: string) {
        const result = (name || "") + this.next;
        this.next += 1;
        return result;
    }
}

interface BoxModelProps {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

/**
 * Used to describe a Widget's margin or padding
 */
export class BoundingBox implements BoxModelProps {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;

    constructor(props: BoxModelProps) {
        this.top = props.top;
        this.bottom = props.bottom;
        this.left = props.left;
        this.right = props.right;
    }

    getTop() {
        return this.top || 0;
    }

    getBottom() {
        return this.bottom || 0;
    }

    getLeft() {
        return this.left || 0;
    }

    getRight() {
        return this.right || 0;
    }
}


/**
 * Describes the default padding on a Group Box widget
 */
export const defaultGroupBoxPadding = new BoundingBox({ top: 12, bottom: 4, left: 4, right: 4 });

/** Describes the properties that can be given to a SwitchbackWidget to initialize it */
export interface SwitchbackWidgetProps {
    /**
     * If present, the base OpenRCT2 object this Widget will represent.
     * 
     * If not present, this Widget describes a object that does not render (a Group or Spacer)
     */
    base?: Widget;

    /**
     * The height of this object, either as a number for an absolute pixel-based size, or a string in the form "[value]%" for a relative percent-based size
     */
    height: SizeType;

    /**
     * The width of this object, either as a number for an absolute pixel-based size, or a string in the form "[value]%" for a relative percent-based size
     */
    width: SizeType;

    /**
     * If present, describes the number of pixels surrounding the outside of this object.
     */
    margin?: BoundingBox;
}

/**
 * Wrapper containing a base OpenRCT2 object, which records the position and size details of the object.
 * 
 * Interactions with this object will carry down to the underlying base object.
 */
export class SwitchbackWidget {
    /**
     * The base OpenRCT2 object this Widget represents.
     * SwitchbackWidget with an empty base are either a Group (if the object has children) or a Spacer (if there are no children)
     */
    base?: Widget | Window;

    private windowBase: Widget | Window;

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
     * Describes the height of the Widget either as a relative or absolute value, depending on the value of the heightType property
     */
    height: SizeProps;

    /**
     * Describes the width of the Widget either as a relative or absolute value, depending on the value of the widthType property
     */
    width: SizeProps;

    /**
     * Describes the actual height of the base Widget object
     */
    baseHeight: number;

    /**
     * Describes the actual width of the base Widget object
     */
    baseWidth: number;

    /**
     * If present, describes the number of pixels surrounding the outside of this object.
     */
    margin: BoundingBox;

    /**
     * Callback called when the Widget resizes.
     */
    onResize: (this: SwitchbackWidget) => void;

    constructor(props: SwitchbackWidgetProps) {
        if (props.base) {
            props.base.name = props.base.name || UniqueNameGenerator.getNext("SWBase");
            this.name = props.base.name;
        } else {
            this.name = UniqueNameGenerator.getNext("SWBaseless");
        }
        this.base = props.base;
        this.setHeight(props.height || 0);
        this.setWidth(props.width || 0);
        this.margin = props.margin || new BoundingBox({});
    }

    /**
     * Change the target height of this Widget.
     * 
     * This won't actually change the size of the Widget until apply() is called on the parent Window to recalculate the layout.
     * @param value New height value. Use a number for an absolute size, "xxx%" for a relative size, or a combination described by the SizeProps type.
     */
    setHeight(value: number | string | SizeProps) {
        if (typeof value === "string") {
            const matches = value.match(/(\d{1,3})%/);

            if (!matches || matches.length === 0) {
                throw TypeError(`Height value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.height = {
                absolute: null,
                relative: parsedValue
            }
        } else if (typeof value === "number") {
            this.height = {
                absolute: value,
                relative: null
            }
        } else {
            this.height = value;
        }
    }

    /**
     * Change the target width of this Widget.
     * 
     * This won't actually change the size of the Widget until apply() is called on the parent Window to recalculate the layout.
     * @param value New width value. Use a number for an absolute size, "xxx%" for a relative size, or a combination described by the SizeProps type.
     */
    setWidth(value: number | string | SizeProps) {
        if (typeof value === "string") {
            const matches = value.match(/(\d{1,3})%/);

            if (!matches || matches.length === 0) {
                throw TypeError(`Width value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.width = {
                absolute: null,
                relative: parsedValue
            }
        } else if (typeof value === "number") {
            this.width = {
                absolute: value,
                relative: null
            }
        } else {
            this.width = value;
        }
    }

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

    changeWidgetSize(x: number, y: number, height: number, width: number) {
        const widget = this.getWidget();
        widget.x = x;
        widget.y = y;
        widget.height = height;
        widget.width = width;
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number) {
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

        if (this.base) {
            this.changeWidgetSize(
                newX + this.margin.getLeft(),
                newY + this.margin.getTop(),
                newHeight - (this.margin.getTop() + this.margin.getBottom()),
                newWidth - (this.margin.getLeft() + this.margin.getRight()));
        }

        return {
            newHeight,
            newWidth
        }
    }
}

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

export class SwitchbackGroup extends SwitchbackWidget {
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
    children: SwitchbackObject[];

    constructor(props: SwitchbackGroupProps) {
        super(<SwitchbackWidgetProps>props);

        this.direction = props.direction;
        this.padding = props.padding || new BoundingBox({});
        this.children = [];
    }

    /**
     * Adds a child to this SwitchbackGroup
     * @param child The SwitchbackGroup or SwitchbackWidget to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChild(child: SwitchbackObject) {
        this.children.push(child);
        return this;
    }

    /**
     * Adds multiple children to this SwitchbackGroup at once
     * @param children The array of SwitchbackGroups or SwitchbackWidgets to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChildren(children: SwitchbackObject[]) {
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
            newHeight = resizedWidget.newHeight;
            newWidth = resizedWidget.newWidth;
        }

        const childrenHeight = newHeight - (this.padding.getTop() + this.padding.getBottom());
        const childrenWidth = newWidth - (this.padding.getLeft() + this.padding.getRight());

        if (this.children) {
            var sequenceX = newX + this.padding.getLeft();
            var sequenceY = newY + this.padding.getTop();
            this.children.forEach(child => {
                const newChildSize = child.reactToParentSizeChange(sequenceX, sequenceY, childrenHeight, childrenWidth);
                if (this.direction === "HORIZONTAL") {
                    sequenceX += newChildSize.newWidth;
                } else {
                    sequenceY += newChildSize.newHeight;
                }
            });
        }

        return {
            newHeight,
            newWidth
        }
    }
}

export class SwitchbackTab {
    image: number | ImageAnimation;

    widgets: SwitchbackWidget[];

    constructor(image?: number | ImageAnimation) {
        this.image = image;
    }

    /**
     * Adds a child to this SwitchbackTab
     * @param child The SwitchbackGroup or SwitchbackWidget to add
     * @returns The SwitchbackTab, allowing for chaining
     */
    addChild(child: SwitchbackObject) {
        this.widgets.push(child);
        return this;
    }

    /**
     * Adds multiple children to this SwitchbackTab at once
     * @param children The array of SwitchbackGroups or SwitchbackWidgets to add
     * @returns The SwitchbackTab, allowing for chaining
     */
    addChildren(children: SwitchbackObject[]) {
        this.widgets.push(...children);
        return this;
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

    padding?: BoundingBox;
}

export class SwitchbackWindow extends SwitchbackGroup {
    base: Window;

    children: SwitchbackGroup[];

    tabs: SwitchbackTab[];

    private theirOnUpdate: () => void;

    private thisWindowDesc: WindowDesc;

    constructor(props: SwitchbackWindowProps) {
        const superProps: SwitchbackGroupProps = {
            direction: props.direction || "VERTICAL",
            width: props.width,
            height: props.height,
            padding: props.padding || new BoundingBox({ top: 16, bottom: 16, left: 4, right: 4 })
        };
        super(superProps);

        this.theirOnUpdate = props.onUpdate || (() => { });
        props.onUpdate = this.onWindowUpdate.bind(this);

        this.thisWindowDesc = props;
    }

    /**
     * Adds a SwitchbackGroup to this Window
     * @param child The SwitchbackGroup to add
     * @returns The SwitchbackWindow, allowing for chaining
     */
    addChild(child: SwitchbackGroup) {
        return super.addChild(child);
    }

    addChildren(children: SwitchbackGroup[]) {
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
        if(this.children.length > 0 && this.tabs.length === 0){
            return this.getChildrenFlatRecurse(this.children);
        }else if(this.children.length === 0 && this.tabs.length > 0){
            const result = [];
            this.tabs.forEach(tab => {
                tab.widgets && result.push(...this.getChildrenFlatRecurse(tab.widgets));
            });
            return result;
        }else{
            throw new Error("Window cannot have both children and tabs. Either a window is composed of widgets and groups as children, or tabs as children");
        }
    }

    private getChildrenFlatRecurse(children: SwitchbackObject[]) {
        const result: SwitchbackObject[] = [];
        children.forEach(child => {
            result.push(child);
            if (child instanceof SwitchbackGroup && child.children) {
                result.push(...this.getChildrenFlatRecurse(child.children));
            }
        });
        return result;
    }

    open() {
        if (this.base) {
            this.base.bringToFront();
        } else {
            const newChildren = this.getChildrenFlat();
            this.base = ui.openWindow({
                ...this.thisWindowDesc,
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
            this.base = null;
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

const defaultWidgetSize = {
    height: 16,
    width: 16,
    x: 0,
    y: 0,
}

export function createButton(title: string, name?: string) {
    return <ButtonWidget>{
        type: "button",
        text: title,
        name: name || UniqueNameGenerator.getNext("SWButton"),
        ...defaultWidgetSize
    }
}

export function createCheckbox(text?: string, name?: string) {
    return <CheckboxWidget>{
        type: "checkbox",
        text: text,
        name: name || UniqueNameGenerator.getNext("SWCheckbox"),
        ...defaultWidgetSize
    }
}

export function createColorPicker(color?: number, name?: string) {
    return <ColourPickerWidget>{
        type: "colourpicker",
        colour: color,
        name: name || UniqueNameGenerator.getNext("SWColorPicker"),
        ...defaultWidgetSize
    }
}

export function createDropDown(items?: string[], selectedIndex?: number, name?: string) {
    return <DropdownWidget>{
        type: "dropdown",
        items: items,
        selectedIndex: selectedIndex,
        name: name || UniqueNameGenerator.getNext("SWDropDown"),
        ...defaultWidgetSize
    }
}

export function createGroupBox(text?: string, name?: string) {
    return <GroupBoxWidget>{
        type: "groupbox",
        text: text,
        name: name || UniqueNameGenerator.getNext("SWGroupBox"),
        ...defaultWidgetSize
    }
}

export function createLabel(text?: string, textAlign?: TextAlignment, name?: string) {
    return <LabelWidget>{
        type: "label",
        text: text,
        textAlign: textAlign,
        name: name || UniqueNameGenerator.getNext("SWLabel"),
        ...defaultWidgetSize
    }
}

export function createListView(scrollbars?: ScrollbarType, isStriped?: boolean, showColumnHeaders?: boolean, columns?: ListViewColumn[], items?: string[] | ListViewItem[], selectedCell?: RowColumn, canSelect?: boolean, name?: string) {
    return <ListView>{
        type: "listview",
        scrollbars: scrollbars,
        isStriped: isStriped,
        showColumnHeaders: showColumnHeaders,
        columns: columns,
        items: items,
        selectedCell: selectedCell,
        canSelect: canSelect,
        name: name || UniqueNameGenerator.getNext("SWListView"),
        ...defaultWidgetSize
    }
}

export function createSpinner(text?: string, name?: string) {
    return <SpinnerWidget>{
        type: "spinner",
        text: text,
        name: name || UniqueNameGenerator.getNext("SWSpinner"),
        ...defaultWidgetSize
    }
}

export function createTextBox(text?: string, name?: string) {
    return <TextBoxWidget>{
        type: "textbox",
        text: text,
        name: name || UniqueNameGenerator.getNext("SWTextBox"),
        ...defaultWidgetSize
    }
}

export function createViewport(viewport?: Viewport, name?: string) {
    return <ViewportWidget>{
        type: "viewport",
        viewport: viewport,
        name: name || UniqueNameGenerator.getNext("SWViewport"),
        ...defaultWidgetSize
    }
}