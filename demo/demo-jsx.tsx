import { Button, SwitchbackJSX, Widget, Window } from "../src/SwitchbackJSX";

function main() {
  if (!ui) {
    return;
  }

  console.log('Creating Window');

  const buttonSizes = {
    height: 24,
    width: "50%"
  }

  const window = (
    <Window
      classification="demo"
      title="Switchback Demo"
      direction="VERTICAL"
      height={300}
      minHeight={200}
      maxHeight={400}
      width={350}
      minWidth={300}
      maxWidth={500}
    >
      <Widget {...buttonSizes}>
        <Button title="1 !" />
      </Widget>
      <Widget {...buttonSizes}>
        <Button title="2 !" />
      </Widget>
    </Window>
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