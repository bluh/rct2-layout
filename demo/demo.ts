import * as SwitchbackUI from "../src/SwitchbackUI";

function main(){
    if(!ui){
        return;
    }

    const newWindow = new SwitchbackUI.SwitchbackWindow({
        classification: "Switchback",
        title: "Switchback Demo",
        direction: "HORIZONTAL",
        height: 200,
        minHeight: 100,
        maxHeight: 300,
        width: 400,
        minWidth: 200,
        maxWidth: 600
    });

    console.log('Creating Btn1');

    const btn1:ButtonWidget = SwitchbackUI.SwitchbackWidget.CreateButton("Button 1");

    console.log('Creating Btn2');

    const btn2:ButtonWidget = SwitchbackUI.SwitchbackWidget.CreateButton("Button 2");

    console.log('Creating Btn3');

    const btn3:ButtonWidget = SwitchbackUI.SwitchbackWidget.CreateButton("Button 3");

    console.log('Creating Layout');

    newWindow.addChildren([
        new SwitchbackUI.SwitchbackGroup({
            direction: "VERTICAL",
            height: "100%",
            width: "50%"
        })
            .addChild(new SwitchbackUI.SwitchbackWidget({
                base: btn1,
                height: 20,
                width: "100%"
            }))
            .addChild(new SwitchbackUI.SwitchbackWidget({
                base: btn2,
                height: "25%",
                width: "50%"
            })),
        new SwitchbackUI.SwitchbackGroup({
            direction: "VERTICAL",
            height: "100%",
            width: "50%"
        })
            .addChild(new SwitchbackUI.SwitchbackWidget({
                base: btn3,
                height: "100%",
                width: "100%"
            }))
    ]);

    console.log('Applying Layout');

    newWindow.apply();

}

registerPlugin({
    main: main,
    version: "1.0.0",
    authors: "Me",
    licence: "MIT",
    name: "demo",
    type: "local"
})