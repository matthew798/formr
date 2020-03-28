import OptionControl, {Option} from "./OptionControl";
import DOM from "../Helpers/DOM";

export default class RadioGroup extends OptionControl {
    static config = {
        name: "Radio Group",
        icon: "radioGroup",
        isConfigurable: true,
        label: {
            classes: [],
            attrs: {},
            styles: {}
        },
        input: {
            tag: "div",
            styles: {}
        },
        help: {
            classes: [],
            attrs: {},
            styles: {}
        }
    };

    getEditorDom(): HTMLElement {
        const dom = super.getEditorDom();

        DOM.appendChildren(this.input, this.options.map(opt => { return {
            tag: "div",
            classes: this.theme?.getClasses("formr-radio-group"),
            content: [{
                tag: "input",
                attrs: {type: "radio", name: `${this.id}-radio-group`, value: opt.value || opt.label, checked: opt.selected},
                classes: this.theme?.getClasses("formr-radio"),
                events: {oninput: (e): void => {opt.selected = (e.target as HTMLInputElement).checked;}}
            }, {
                tag: "label",
                attrs: {for: `${this.id}-radio-group`, contenteditable: true},
                classes: this.theme?.getClasses("formr-radio-label"),
                events: {oninput: (e): void => this.options[this.options.indexOf(opt)].label = e.target.innerText},
                content: opt.label
            }]
        }}));

        return dom;
    }

    getRendererDom(): HTMLElement {
        const dom = super.getRendererDom();

        DOM.appendChildren(this.input, this.options.map(opt => { return {
            tag: "div",
            classes: this.theme?.getClasses("formr-radio-group"),
            content: [{
                tag: "input",
                attrs: {type: "radio", name: `${this.id}-radio-group`, value: opt.value || opt.label, checked: opt.selected},
                classes: this.theme?.getClasses("formr-radio"),
                events: {oninput: (e): void => {opt.selected = (e.target as HTMLInputElement).checked;}}
            }, {
                tag: "label",
                attrs: {for: `${this.id}-radio-group`},
                classes: this.theme?.getClasses("formr-radio-label"),
                content: opt.label
            }]
        }}));

        return dom;
    }

    public get Value(): any{
        return (this.dom.querySelector('input:checked') as HTMLOptionElement)?.value;
    }
}