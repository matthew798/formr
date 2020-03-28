import InputControl from "./InputControl";

export default class MonthInput extends InputControl {
    static config = {
        name: "Month Input",
        icon: "monthField",
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
                type: "month"
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