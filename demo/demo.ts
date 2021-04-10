import * as SwitchbackUI from "../src/SwitchbackUI";

function main(){
    if(!ui){
        return;
    }

    const newWindow = new SwitchbackUI.SwitchbackWindow({
        classification: "Switchback",
        title: "Switchback Demo",
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

    console.log('Creating Layout');

    newWindow.addChild(
        new SwitchbackUI.SwitchbackGroup({
            direction: "VERTICAL",
            height: "75%",
            width: "75%"
        })
            .addChild(new SwitchbackUI.SwitchbackWidget({
                base: btn1,
                height: 20,
                width: "100%"
            }))
            .addChild(new SwitchbackUI.SwitchbackWidget({
                base: btn2,
                height: "15%",
                width: 100
            }))
    );

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