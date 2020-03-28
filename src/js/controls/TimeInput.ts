import InputControl from "./InputControl";

export default class TimeInput extends InputControl {
    static config = {
        name: "Time Input",
        icon: "timeField",
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
                type: "time"
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