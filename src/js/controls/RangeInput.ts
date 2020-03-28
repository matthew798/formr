import InputControl from "./InputControl";

export default class RangeInput extends InputControl {

    static config = {
        name: "Range Input",
        icon: "rangeField",
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
                type: "range"
            },
            styles: {}
        },
        help: {
            classes: [],
            attrs: {},
            styles: {}
        }
    };
}