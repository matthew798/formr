import InputControl from "./InputControl";

export default class ColorInput extends InputControl {

    static config = {
        name: "Color Input",
        icon: "colorField",
        tag: "input",
        isConfigurable: true,
        label: {
            classes: [],
            attrs: {},
            styles: {}
        },
        input: {
            tag: "input",
            classes: [],
            attrs: {
                type: "color"
            },
            styles: {
                padding: "0"
            }
        },
        help: {
            classes: [],
            attrs: {},
            styles: {}
        }
    };
}