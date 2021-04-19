import * as SwitchbackUI from "../src/SwitchbackUI";

function main(){
    if(!ui){
        return;
    }

    console.log('Creating Window');

    const newWindow = new SwitchbackUI.SwitchbackWindow({
        classification: "Switchback",
        title: "Switchback Demo",
        direction: "HORIZONTAL",
        height: 300,
        minHeight: 200,
        maxHeight: 400,
        width: 350,
        minWidth: 300,
        maxWidth: 500
    });

    console.log('Creating Widgets');

    const gBox1 = SwitchbackUI.createGroupBox("Relative Width Buttons:");

    const gBox1_Btn1 = SwitchbackUI.createButton("100% - 40px");

    const gBox1_Btn2 = SwitchbackUI.createButton("40px");

    const gBox2 = SwitchbackUI.createGroupBox("Relative Height Buttons:");

    const gBox2_Btn1 = SwitchbackUI.createButton("50%");

    const gBox2_Btn2 = SwitchbackUI.createButton("50%");

    const gBox3 = SwitchbackUI.createGroupBox("Padding Example:");

    const gBox3_Btn1 = SwitchbackUI.createButton("Button affected by padding");

    const gBox4 = SwitchbackUI.createGroupBox("Margin Example:");

    const gBox4_Btn1 = SwitchbackUI.createButton("Top margin");

    const gBox4_Btn2 = SwitchbackUI.createButton("Bottom margin");

    const gBox5 = SwitchbackUI.createGroupBox("Widgets:");

    console.log('Creating Layout');

    newWindow.addChildren([
        new SwitchbackUI.SwitchbackGroup({
            direction: "VERTICAL",
            height: "100%",
            width: {
                relative: 100,
                absolute: -75
            },
            padding: {
                right: 10
            }
        })
            .addChildren([
                new SwitchbackUI.SwitchbackGroup({
                    base: gBox1,
                    direction: "HORIZONTAL",
                    height: "25%",
                    width: "100%",
                    padding: SwitchbackUI.defaultGroupBoxPadding
                })
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox1_Btn1,
                        height: "100%",
                        width: {
                            absolute: -40,
                            relative: 100
                        }
                    }))
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox1_Btn2,
                        height: "100%",
                        width: 40
                    })),
                new SwitchbackUI.SwitchbackGroup({
                    base: gBox2,
                    direction: "VERTICAL",
                    height: "25%",
                    width: "100%",
                    padding: SwitchbackUI.defaultGroupBoxPadding
                })
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox2_Btn1,
                        height: "50%",
                        width: "100%"
                    }))
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox2_Btn2,
                        height: "50%",
                        width: "100%"
                    })),
                new SwitchbackUI.SwitchbackGroup({
                    base: gBox3,
                    direction: "VERTICAL",
                    height: "25%",
                    width: "100%",
                    padding: SwitchbackUI.boundingBox(20, 20, 20, 20)
                })
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox3_Btn1,
                        height: "100%",
                        width: "100%"
                    })),
                new SwitchbackUI.SwitchbackGroup({
                    base: gBox4,
                    direction: "HORIZONTAL",
                    height: "25%",
                    width: "100%",
                    padding: SwitchbackUI.defaultGroupBoxPadding
                })
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox4_Btn1,
                        height: "100%",
                        width: "50%",
                        margin: SwitchbackUI.boundingBox(10, 0, 0, 0)
                    }))
                    .addChild(new SwitchbackUI.SwitchbackWidget({
                        base: gBox4_Btn2,
                        height: "100%",
                        width: "50%",
                        margin: SwitchbackUI.boundingBox(0, 10, 0, 0)
                    }))
            ]),
        new SwitchbackUI.SwitchbackGroup({
            base: gBox5,
            direction: "VERTICAL",
            height: "100%",
            width: 75,
            padding: SwitchbackUI.defaultGroupBoxPadding
        })
    ]);

    console.log('Applying Layout');

    newWindow.apply();

    // context.setInterval(() => newWindow.open(), 1000);

}

registerPlugin({
    main: main,
    version: "1.0.0",
    authors: "Me",
    licence: "MIT",
    name: "demo",
    type: "local"
})