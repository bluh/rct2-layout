import { defaultGroupBoxPadding, BoundingBox } from "../src/SwitchbackUI";
import { Button, Checkbox, ColorPicker, createRef, DropDown, Group, GroupBox, Label, ListView, Spinner, SwitchbackJSX, TextBox, Viewport, Window } from "../src/SwitchbackJSX";

function main() {
    if (!ui) {
        return;
    }

    console.log('Creating Window');

    const defaultWidgetProps = {
        width: "100%",
        height: 24,
        margin: new BoundingBox({ top: 4, bottom: 4 })
    };

    const textBoxRef = createRef<TextBoxWidget>();

    const widgets = [
        <Button {...defaultWidgetProps} onClick={() => console.log(textBoxRef.getCurrent().text)}>Button</Button>,
        <Checkbox {...defaultWidgetProps}>Checkbox</Checkbox>,
        <Group direction="HORIZONTAL" {...defaultWidgetProps}>
            <ColorPicker height="100%" width={16} colour={27} onChange={(color) => console.log(color)} />
            <Label height="100%" width={{ absolute: 100, relative: -16 }}>Label</Label>
        </Group>,
        <DropDown {...defaultWidgetProps} items={["Dropdown", "-----", "Item 1", "Item 2"]} selectedIndex={0} />,
        <Spinner {...defaultWidgetProps} text="Spinner" />,
        <TextBox {...defaultWidgetProps} ref={textBoxRef}>Text Box</TextBox>,
        <ListView {...defaultWidgetProps} height={50} scrollbars="vertical" isStriped showColumnHeaders columns={[{ header: "Header 1" }]} items={["Item 1", "Item 2", "Item 3"]} />,
        <Viewport {...defaultWidgetProps} height={30} />
    ]

    const window = (
        <Window
            classification="demo"
            title="Switchback Demo"
            direction="HORIZONTAL"
            height={300}
            minHeight={200}
            maxHeight={400}
            width={350}
            minWidth={300}
            maxWidth={500}
        >
            <Group
                direction="VERTICAL"
                height="100%"
                width={{
                    relative: 100,
                    absolute: -75
                }}
                padding={new BoundingBox({
                    right: 4
                })}
            >
                <Group
                    base={<GroupBox text="Relative Width Buttons:" />}
                    direction="HORIZONTAL"
                    height="25%"
                    width="100%"
                    padding={defaultGroupBoxPadding}
                >
                    <Button
                        height="100%"
                        width={{
                            absolute: -40,
                            relative: 100
                        }}
                        text="100% - 40px" />
                    <Button
                        height="100%"
                        width={40}
                        text="40px" />
                </Group>
                <Group
                    base={<GroupBox text="Relative Height Buttons:" />}
                    direction="VERTICAL"
                    height="25%"
                    width="100%"
                    padding={defaultGroupBoxPadding}
                >
                    <Button
                        height="50%"
                        width="100%"
                        text="50%" />
                    <Button
                        height="50%"
                        width="100%"
                        text="50%" />
                </Group>
                <Group
                    base={<GroupBox text="Padding Example:" />}
                    direction="VERTICAL"
                    height="25%"
                    width="100%"
                    padding={new BoundingBox({ top: 20, bottom: 20, left: 20, right: 20 })}
                >
                    <Button
                        height="100%"
                        width="100%"
                        text="Button affected by padding" />
                </Group>
                <Group
                    base={<GroupBox text="Margin Example:" />}
                    direction="HORIZONTAL"
                    height="25%"
                    width="100%"
                    padding={defaultGroupBoxPadding}
                >
                    <Button
                        height="100%"
                        width="50%"
                        margin={new BoundingBox({ top: 10, bottom: 0, left: 0, right: 0 })}
                        text="Top Margin" />

                    <Button
                        height="100%"
                        width="50%"
                        margin={new BoundingBox(({ top: 0, bottom: 10, left: 0, right: 0 }))}
                        text="Bottom Margin" />
                </Group>
            </Group>
            <Group
                base={<GroupBox text="Widgets:" />}
                direction="VERTICAL"
                height="100%"
                width={75}
                padding={defaultGroupBoxPadding}
            >
                {widgets}
            </Group>
        </Window >
    );


    window.apply();

}

registerPlugin({
    main: main,
    version: "1.0.0",
    authors: "Me",
    licence: "MIT",
    name: "demo",
    type: "local"
})