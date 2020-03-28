import InputControl from "./InputControl";

export default class WeekInput extends InputControl {
    static config = {
        name: "Week Input",
        icon: "weekField",
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
                type: "week"
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