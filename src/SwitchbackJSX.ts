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
  if(children){
    group.addChildren(children);
  }

  return group;
}

export function Widget(props: Omit<SwitchbackUI.SwitchbackWidgetProps, "base">, children: Widget[]): SwitchbackUI.SwitchbackWidget {
  if(!children || children.length !== 1){
    throw new Error("Widget can have only 1 child");
  }

  const newWidget = new SwitchbackUI.SwitchbackWidget({
    base: children[0],
    ...props
  });

  return newWidget;
}

class ButtonProps extends BaseElementProps {
  title: string
}

export function Button(props: ButtonProps, children: any): Widget {
  let text = props.title;
  if (typeof children === "string") {
    text = children;
  }

  return SwitchbackUI.createButton(text, props.name);
};

type SwitchbackJSXElement = {
  (props: BaseElementProps, children?: any[]): any,
}

export function SwitchbackJSX(element: SwitchbackJSXElement, props: BaseElementProps, ...children: any[]) {
  var result = element(props, children);
  return result;
}