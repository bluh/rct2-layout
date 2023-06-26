import { UniqueNameGenerator } from "./misc";

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
        name: name ?? UniqueNameGenerator.getNext("SWButton"),
        ...defaultWidgetSize
    }
}

export function createCheckbox(text?: string, name?: string) {
    return <CheckboxWidget>{
        type: "checkbox",
        text: text,
        name: name ?? UniqueNameGenerator.getNext("SWCheckbox"),
        ...defaultWidgetSize
    }
}

export function createColorPicker(color?: number, name?: string) {
    return <ColourPickerWidget>{
        type: "colourpicker",
        colour: color,
        name: name ?? UniqueNameGenerator.getNext("SWColorPicker"),
        ...defaultWidgetSize
    }
}

export function createDropDown(items?: string[], selectedIndex?: number, name?: string) {
    return <DropdownWidget>{
        type: "dropdown",
        items: items,
        selectedIndex: selectedIndex,
        name: name ?? UniqueNameGenerator.getNext("SWDropDown"),
        ...defaultWidgetSize
    }
}

export function createGroupBox(text?: string, name?: string) {
    return <GroupBoxWidget>{
        type: "groupbox",
        text: text,
        name: name ?? UniqueNameGenerator.getNext("SWGroupBox"),
        ...defaultWidgetSize
    }
}

export function createLabel(text?: string, textAlign?: TextAlignment, name?: string) {
    return <LabelWidget>{
        type: "label",
        text: text,
        textAlign: textAlign,
        name: name ?? UniqueNameGenerator.getNext("SWLabel"),
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
        name: name ?? UniqueNameGenerator.getNext("SWListView"),
        ...defaultWidgetSize
    }
}

export function createSpinner(text?: string, name?: string) {
    return <SpinnerWidget>{
        type: "spinner",
        text: text,
        name: name ?? UniqueNameGenerator.getNext("SWSpinner"),
        ...defaultWidgetSize
    }
}

export function createTextBox(text?: string, name?: string) {
    return <TextBoxWidget>{
        type: "textbox",
        text: text,
        name: name ?? UniqueNameGenerator.getNext("SWTextBox"),
        ...defaultWidgetSize
    }
}

export function createViewport(viewport?: Viewport, name?: string) {
    return <ViewportWidget>{
        type: "viewport",
        viewport: viewport,
        name: name ?? UniqueNameGenerator.getNext("SWViewport"),
        ...defaultWidgetSize
    }
}