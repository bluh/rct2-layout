import * as SwitchbackUI from "./SwitchbackUI";

class SwitchbackRef<Type extends Widget> {
    private current?: Type;
    private widget?: SwitchbackUI.SwitchbackWidget;

    constructor() {
        this.current = null;
        this.widget = null;
    }

    setCurrent(next: SwitchbackUI.SwitchbackWidget) {
        this.widget = next;
    }

    /**
     * Gets the current object this ref is referring to. Calls "getWidget" on the respective Widget, which returns the Widget directly from the parent Window, allowing for reading & writing.
     */
    getCurrent(): Type | null {
        if(!this.widget){
            return null;
        }
        if (!this.current) {
            this.current = this.widget.getWidget() as Type;
        }
        return this.current;
    }
}

/**
 * Creates a "ref" object, which contains a reference to an Widget after it has been created.
 * 
 * The provided type allows TypeScript to understand what the underlying "current" object is.
 */
export function createRef<Type extends Widget>() {
    return new SwitchbackRef<Type>();
}

function getText(children: any[], textProp?: string) {
    if ((children.length === 1 && typeof children[0] !== "string") || children.length > 1) {
        throw new Error("Widget element must only contain at most one text child");
    }
    const childText = children[0];
    return childText || textProp || null;
}

/**
 * Creates a new SwitchbackWindow.
 */
export function Window(props: SwitchbackUI.SwitchbackWindowProps, children: any[]): SwitchbackUI.SwitchbackWindow {
    const window = new SwitchbackUI.SwitchbackWindow(props);
    if (children) {
        window.addChildren(children)
    }

    return window;
};


/**
 * Creates a new SwitchbackGroup.
 */
export function Group(props: SwitchbackUI.SwitchbackGroupProps, children: any[]): SwitchbackUI.SwitchbackGroup {
    const group = new SwitchbackUI.SwitchbackGroup(props);
    if (children) {
        group.addChildren([].concat(...children));
    }

    return group;
}


/**
 * Creates a new SwitchbackWidget.
 * Unless you're creating the base manually with any of the "createXWidget" methods exported in SwitchbackUI, you probably don't need this.
 * Create Widgets with the needed base by using the respective TSX tag (ex: \<Button\>, \<Checkbox\>)
 */
export function Widget(props: Omit<SwitchbackUI.SwitchbackWidgetProps, "base">, children: Widget | Widget[]): SwitchbackUI.SwitchbackWidget {
    var baseWidget: Widget;
    if (Array.isArray(children)) {
        if (children.length !== 1) {
            throw new Error("Widget can have only 1 child");
        }
        baseWidget = children[0]
    } else {
        baseWidget = children;
    }

    const newWidget = new SwitchbackUI.SwitchbackWidget({
        base: baseWidget,
        ...props
    });

    return newWidget;
}


type GroupBoxProps = { text?: string };

/**
 * Creates a new Group Box without a widget.
 * 
 * The main usage for this is to apply as a base to a SwitchbackGroup. It can be created as a SwitchbackWidget by placing it under a <Widget> tag in the hierarchy.
 * If that is your use case, the <GroupBoxWidget> is a shortcut to that.
 */
export function GroupBox(props: GroupBoxProps, children: any[]): Widget {
    return {
        ...props,
        ...defaultWidgetSize,
        type: "groupbox"
    } as GroupBoxWidget;
}


const defaultWidgetSize = {
    height: 16,
    width: 16,
    x: 0,
    y: 0,
}

type WidgetProps<Type extends Widget> = Omit<Type, "height" | "width" | "x" | "y" | "type"> & Omit<SwitchbackUI.SwitchbackWidgetProps, "base"> & { ref?: SwitchbackRef<any> };

function createWidget<Type extends Widget>(props: WidgetProps<Type>, type: WidgetType): SwitchbackUI.SwitchbackWidget {
    const newWidget = <Type>{
        ...props,
        ...defaultWidgetSize,
        type
    };
    const sbWidget = Widget(props, newWidget);
    if (props.ref) {
        props.ref.setCurrent(sbWidget);
    }
    return sbWidget;
}

/**
 * Creates a new SwitchbackWidget with a Button as the base.
 */
export function Button(props: WidgetProps<ButtonWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    props.text = getText(children, props.text);
    return createWidget<ButtonWidget>(props, "button");
};

/**
 * Creates a new SwitchbackWidget with a Checkbox as the base.
 */
export function Checkbox(props: WidgetProps<CheckboxWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    props.text = getText(children, props.text);
    return createWidget<CheckboxWidget>(props, "checkbox");
}

/**
 * Creates a new SwitchbackWidget with a ColorPicker as the base.
 */
export function ColorPicker(props: WidgetProps<ColourPickerWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<ColourPickerWidget>(props, "colourpicker");
}

/**
 * Creates a new SwitchbackWidget with a DropDown as the base.
 */
export function DropDown(props: WidgetProps<DropdownWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<DropdownWidget>(props, "dropdown");
}

/**
 * Creates a new SwitchbackWidget with a GroupBox as the base.
 */
export function GroupBoxWidget(props: WidgetProps<GroupBoxWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<GroupBoxWidget>(props, "groupbox");
}

/**
 * Creates a new SwitchbackWidget with a Label as the base.
 */
export function Label(props: WidgetProps<LabelWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    props.text = getText(children, props.text);
    return createWidget<LabelWidget>(props, "label");
}

/**
 * Creates a new SwitchbackWidget with a ListView as the base.
 */
export function ListView(props: WidgetProps<ListView>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<ListView>(props, "listview");
}

/**
 * Creates a new SwitchbackWidget with a Spinner as the base.
 */
export function Spinner(props: WidgetProps<SpinnerWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<SpinnerWidget>(props, "spinner");
}

/**
 * Creates a new SwitchbackWidget with a TextBox as the base.
 */
export function TextBox(props: WidgetProps<TextBoxWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    props.text = getText(children, props.text);
    return createWidget<TextBoxWidget>(props, "textbox");
}

/**
 * Creates a new SwitchbackWidget with a Viewport as the base.
 */
export function Viewport(props: WidgetProps<ViewportWidget>, children: any[]): SwitchbackUI.SwitchbackWidget {
    return createWidget<ViewportWidget>(props, "viewport");
}


type SwitchbackJSXElement = {
    (props: any, children?: any[]): SwitchbackUI.SwitchbackWidget,
}

/**
 * Interprets elements provided by TSX, calling the relevant element with the relevant props and children. Provides a Widget that may represent a SwitchbackWidget, SwitchbackGroup, or SwitchbackWindow
 */
export function SwitchbackJSX(element: SwitchbackJSXElement, props: any, ...children: any[]): SwitchbackUI.SwitchbackWidget {
    var flatChildren = children.reduce((prev, curr) => (curr instanceof Array ? [...prev, ...curr] : [...prev, curr]), []) as any[];
    var result = element(props || {}, flatChildren);
    return result;
}