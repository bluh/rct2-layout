import * as SwitchbackUI from "./SwitchbackUI";

class BaseElementProps {
    name?: string
}

export function Window(props: SwitchbackUI.SwitchbackWindowProps, children: any[]): SwitchbackUI.SwitchbackWindow {
    const window = new SwitchbackUI.SwitchbackWindow(props);
    if (children) {
        window.addChildren(children)
    }

    return window;
};

export function Group(props: SwitchbackUI.SwitchbackGroupProps, children: any[]): SwitchbackUI.SwitchbackGroup {
    const group = new SwitchbackUI.SwitchbackGroup(props);
    if (children) {
        group.addChildren(children);
    }

    return group;
}

export function Widget(props: Omit<SwitchbackUI.SwitchbackWidgetProps, "base">, children: Widget[]): SwitchbackUI.SwitchbackWidget {
    if (!children || children.length !== 1) {
        throw new Error("Widget can have only 1 child");
    }

    const newWidget = new SwitchbackUI.SwitchbackWidget({
        base: children[0],
        ...props
    });

    return newWidget;
}

class ButtonProps extends BaseElementProps {
    text?: string
}

export function Button(props: ButtonProps, children: any): Widget {
    let text = props.text || "";
    if (typeof children === "string") {
        text = children;
    }

    return SwitchbackUI.createButton(text, props.name);
};

class CheckboxProps extends BaseElementProps {
    text?: string;
}

export function Checkbox(props: CheckboxProps, children: any): Widget {
    let text = props.text || "";
    if (typeof children === "string") {
        text = children;
    }

    return SwitchbackUI.createCheckbox(text, props.name);
}

class ColorPickerProps extends BaseElementProps {
    color?: number;
}

export function ColorPicker(props: ColorPickerProps, children: any): Widget {
    return SwitchbackUI.createColorPicker(props.color, props.name);
}

class DropDownProps extends BaseElementProps {
    items?: string[];
    selectedIndex?: number;
}

export function DropDown(props: DropDownProps, children: any): Widget {
    return SwitchbackUI.createDropDown(props.items, props.selectedIndex, props.name);
}

class GroupBoxProps extends BaseElementProps {
    text?: string;
}

export function GroupBox(props: GroupBoxProps, children: any): Widget {
    return SwitchbackUI.createGroupBox(props.text, props.name);
}

class LabelProps extends BaseElementProps {
    text?: string;
    textAlign?: TextAlignment;
}

export function Label(props: LabelProps, children: any): Widget {
    return SwitchbackUI.createLabel(props.text, props.textAlign, props.name);
}

class ListViewProps extends BaseElementProps {
    scrollbars?: ScrollbarType;
    isStriped?: boolean;
    showColumnHeaders?: boolean;
    columns?: ListViewColumn[];
    items?: string[] | ListViewItem[];
    selectedCell?: RowColumn;
    canSelect?: boolean;
}

export function ListView(props: ListViewProps, children: any): Widget {
    return SwitchbackUI.createListView(
        props.scrollbars,
        props.isStriped,
        props.showColumnHeaders,
        props.columns,
        props.items,
        props.selectedCell,
        props.canSelect
    );
}

class SpinnerProps extends BaseElementProps {
    text?: string;
}

export function Spinner(props: SpinnerProps, children: any): Widget {
    return SwitchbackUI.createSpinner(props.text, props.name);
}

class TextBoxProps extends BaseElementProps {
    text?: string;
}

export function TextBox(props: TextBoxProps, children: any): Widget {
    return SwitchbackUI.createTextBox(props.text, props.name);
}

class ViewportProps extends BaseElementProps {
    viewport?: Viewport;
}

export function Viewport(props: ViewportProps, children: any): Widget {
    return SwitchbackUI.createViewport(props.viewport, props.name);
}


type SwitchbackJSXElement = {
    (props: BaseElementProps, children?: any[]): any,
}

export function SwitchbackJSX(element: SwitchbackJSXElement, props: BaseElementProps, ...children: any[]) {
    var result = element(props, children);
    return result;
}