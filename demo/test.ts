function main() {
    if (!ui) {
        return;
    }


    const window = <WindowDesc>{
      classification: "WindowTest",
      height: 400,
      width: 200,
      title: "Test Window",
      tabs: [
        <WindowTabDesc>{
          image: 100,
          widgets: [
            <LabelWidget>{
              type: "label",
              height: 20,
              width: 100,
              x: 20,
              y: 100,
              text: "Hello! 1"
            }
          ]
        },
        <WindowTabDesc>{
          image: 100,
          widgets: [
            <LabelWidget>{
              type: "label",
              height: 20,
              width: 100,
              x: 20,
              y: 100,
              text: "Hello! 2"
            }
          ]
        }
      ],
      widgets: [
        <LabelWidget>{
          type: "label",
          height: 20,
          width: 100,
          x: 40,
          y: 100,
          text: "Hello! 3"
        }
      ]
    }

    ui.openWindow(window);
}

registerPlugin({
    main: main,
    version: "1.0.0",
    authors: "Me",
    licence: "MIT",
    name: "demo",
    type: "local"
})