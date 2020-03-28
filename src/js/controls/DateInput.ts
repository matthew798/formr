import InputControl from "./InputControl";

export default class DateInput extends InputControl {
    static config = {
        name: "Date Input",
        icon: "dateField",
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
                type: "date"
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