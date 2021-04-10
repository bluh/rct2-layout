/** Describes the direction of the SwitchbackGroup */ 
type SwitchbackDirection = "VERTICAL" | "HORIZONTAL";

/** Describes if a given size is "ABSOLUTE" (pixel-based), or "RELATIVE" (percent of the parent) */
type SizeType = "ABSOLUTE" | "RELATIVE";

type WidgetType = Widget;

type SwitchbackObject = SwitchbackWidget | SwitchbackGroup;

class UniqueNameGenerator{
    static next: number = 0;

    static getNext(name?:string){
        const result = (name || "") + this.next;
        this.next += 1;
        return result;
    }
}

/** Describes the properties that can be given to a SwitchbackWidget to initialize it */
export interface SwitchbackWidgetProps{
    /**
     * If present, the base OpenRCT2 object this Widget will represent.
     * 
     * If not present, describes a object that does not render (a Group or Spacer)
     */
    base?: Widget;

    /**
     * The height of this object, either as a number for an absolute pixel-based size, or a string in the form "[value]%" for a relative percent-based size
     */
    height: number | string;
    
    /**
     * The width of this object, either as a number for an absolute pixel-based size, or a string in the form "[value]%" for a relative percent-based size
     */
    width: number | string;

    /**
     * If present, describes the number of pixels surrounding this object.
     * 
     * TODO: Should probably be an object with top, bottom, left, and right properties.
     */
    padding?: number;
}

/**
 * Wrapper containing a base OpenRCT2 object, which records the position and size details of the object.
 */
export class SwitchbackWidget{
    /**
     * The base OpenRCT2 object this Widget represents.
     * SwitchbackWidget with an empty base are either a Group (if the object has children) or a Spacer (if there are no children)
     */
    base?: Widget | Window;

    baseName: string;

    /**
     * The base OpenRCT2 window object this Widget is a part of.
     */
    parentWindow: Window;
    
    /**
     * Pixels of padding around the widget.
     */
    padding?: number;

    /**
     * Describes if the height property is defined as a relative or absolute value.
     */
    heightType: SizeType;
    
    /**
     * Describes if the width property is defined as a relative or absolute value.
     */
    widthType: SizeType;
    
    /**
     * Describes the height of the object either as a relative or absolute value, depending on the value of the heightType property
     */
    height: number;
    
    /**
     * Describes the width of the object either as a relative or absolute value, depending on the value of the widthType property
     */
    width: number;
    
    /**
     * Describes the actual height of the base widget object
     */
    baseHeight: number;
    
    /**
     * Describes the actual height of the base widget object
     */
    baseWidth: number;

    onResize: (this: SwitchbackWidget) => {};

    constructor(props: SwitchbackWidgetProps){
        if(props.base){
            props.base.name = props.base.name || UniqueNameGenerator.getNext("SW");
            this.baseName = props.base.name;
        }else{
            this.baseName = UniqueNameGenerator.getNext("SWBaseless");
        }
        this.base = props.base;
        this.setHeight(props.height || 0);
        this.setWidth(props.width || 0);
        this.padding = props.padding;
    }

    setHeight(value: number | string){
        if(typeof value === "string"){
            const matches = value.match(/(\d{1,3})%/);

            if(!matches || matches.length === 0){
                throw TypeError(`Height value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.heightType = "RELATIVE";
            this.height = parsedValue;
        }else{
            this.heightType = "ABSOLUTE";
            this.height = value;
        }
    }

    setWidth(value: number | string){
        if(typeof value === "string"){
            const matches = value.match(/(\d{1,3})%/);

            if(!matches || matches.length === 0){
                throw TypeError(`Width value expected a number or a string in the form of "[value]%" (where [value] is a number), but got ${value}.`);
            }

            const parsedValue = parseInt(matches[1]);

            this.widthType = "RELATIVE";
            this.width = parsedValue;
        }else{
            this.widthType = "ABSOLUTE";
            this.width = value;
        }
    }

    getWidget(){
        if(!this.parentWindow){
            throw Error("Could not get widget: widget has not been assigned to a window.");
        }
        if(!this.base){
            throw Error("Could not get widget: has not been initialized.");
        }
        if(!this.baseName){
            throw Error("Could not get widget: widget needs a name to be found.");
        }
        return this.parentWindow.findWidget(this.baseName);
    }

    changeWidgetSize(x: number, y: number, height: number, width: number){
        const widget = this.getWidget();
        widget.x = x;
        widget.y = y;
        widget.height = height;
        widget.width = width;
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number){
        var newHeight:number, newWidth:number;
        
        if(this.heightType === "ABSOLUTE"){
            newHeight = this.height;
        }else{
            newHeight = parentHeight * (this.height / 100.0);
        }
        if(this.widthType === "ABSOLUTE"){
            newWidth = this.width;
        }else{
            newWidth = parentWidth * (this.width / 100.0);
        }

        if(this.base){
            this.changeWidgetSize(newX, newY, newHeight, newWidth);
        }

        return {
            newHeight,
            newWidth
        }
    }

    static CreateButton(title: string, name?: string){
        return <ButtonWidget>{
            type: "button",
            height: 16,
            width: 16,
            x: 16,
            y: 16,
            text: title,
            name: name || UniqueNameGenerator.getNext("SWButton")
        }
    }
}

interface SwitchbackGroupProps extends SwitchbackWidgetProps{
    /**
     * Direction this Group is going in.
     * 
     * Children of this Group will appear sequentially in this direction
     */
    direction: SwitchbackDirection;

    /**
     * If provided, describes the pixels that pad the content within the group
     * 
     * TODO: Should probably be an object with top, bottom, left, and right properties.
     */
    margin?: number;
}

export class SwitchbackGroup extends SwitchbackWidget {
    /**
     * Direction the group will display children in.
     */
    direction: SwitchbackDirection;

    margin?: number;

    children: SwitchbackObject[];
    
    constructor(props: SwitchbackGroupProps){
        super(<SwitchbackWidgetProps> props);

        this.direction = props.direction;
        this.margin = props.margin;
        this.children = [];
    }

    /**
     * Adds a child to this SwitchbackGroup
     * @param child The SwitchbackGroup or SwitchbackWidget to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChild(child: SwitchbackObject){
        this.children.push(child);
        return this;
    }

    /**
     * Adds multiple children to this SwitchbackGroup at once
     * @param children The array of SwitchbackGroups or SwitchbackWidgets to add
     * @returns The SwitchbackGroup, allowing for chaining
     */
    addChildren(children: SwitchbackObject[]){
        this.children.push(...children);
        return this;
    }

    reactToParentSizeChange(newX: number, newY: number, parentHeight: number, parentWidth: number){
        var newHeight:number, newWidth:number;
        if(this instanceof SwitchbackWindow){
            newHeight = parentHeight;
            newWidth = parentWidth;
        }else{
            const resizedWidget = super.reactToParentSizeChange(newX, newY, parentHeight, parentWidth);
            newHeight = resizedWidget.newHeight;
            newWidth = resizedWidget.newWidth;
        }

        if(this.children){
            var sequenceX = newX;
            var sequenceY = newY;
            this.children.forEach(child => {
                const newChildSize = child.reactToParentSizeChange(sequenceX, sequenceY, newHeight, newWidth);
                if(this.direction === "HORIZONTAL"){
                    sequenceX += newChildSize.newWidth;
                }else{
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

/**
 * Defines the props used to create a SwitchbackWindow.
 */
export interface SwitchbackWindowProps extends WindowDesc{
    /**
     * Initial direction of the window. All groups added to this window will sequence in this direction.
     * 
     * Defaults to "VERTICAL"
     */
    direction?: SwitchbackDirection;
}

export class SwitchbackWindow extends SwitchbackGroup{
    base: Window;

    children: SwitchbackGroup[];

    private theirOnUpdate: () => void;

    private thisWindowDesc: WindowDesc;

    constructor(props: SwitchbackWindowProps){
        const superProps:SwitchbackGroupProps = {
            direction: props.direction || "VERTICAL",
            width: props.width,
            height: props.height
        };
        super(superProps);
        
        this.theirOnUpdate = props.onUpdate || (() => {});
        props.onUpdate = this.onWindowUpdate.bind(this);

        this.thisWindowDesc = props;
    }

    /**
     * Adds a SwitchbackGroup to this Window
     * @param child The SwitchbackGroup to add
     * @returns The SwitchbackWindow, allowing for chaining
     */
    addChild(child: SwitchbackGroup){
        return super.addChild(child);
    }

    addChildren(children: SwitchbackGroup[]){
        return super.addChildren(children);
    }

    private onWindowUpdate(){
        if(this.base){
            if(this.base.width !== this.baseWidth || this.base.height !== this.baseHeight){
                this.baseWidth = this.base.width;
                this.baseHeight = this.base.height;
                // this.onResize();
                this.apply();
            }
            this.theirOnUpdate && this.theirOnUpdate();
        }
    }

    getChildrenFlat(){
        return this.getChildrenFlatRecurse(this.children);
    }

    private getChildrenFlatRecurse(children: SwitchbackObject[]){
        const result: SwitchbackObject[] = [];
        children.forEach(child => {
            result.push(child);
            if(child instanceof SwitchbackGroup){
                child.children && result.push(...this.getChildrenFlatRecurse(child.children));
            }
        });
        return result;
    }

    apply(){
        if(!this.base){
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
        }
        super.reactToParentSizeChange(0, 16, this.baseHeight, this.baseWidth);
    }
}