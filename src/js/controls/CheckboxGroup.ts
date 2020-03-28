import OptionControl, {Option} from "./OptionControl";
import DOM from "../Helpers/DOM";

export default class CheckboxGroup extends OptionControl {
    static config = {
        name: "Checkbox Group",
        icon: "checkboxGroup",
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
            classes: this.theme?.getClasses("formr-checkbox-group"),
            content: [{
                tag: "input",
                attrs: {type: "checkbox", name: `${this.id}-checkbox-group`, value: opt.value || opt.label, checked: opt.selected},
                classes: this.theme?.getClasses("formr-checkbox"),
                events: {oninput: e => opt.selected = (e.target as HTMLInputElement).checked }
            }, {
                tag: "label",
                attrs: {for: `${this.id}-checkbox-group`, contenteditable: true},
                classes: this.theme?.getClasses("formr-checkbox-label"),
                events: {onchange: e => this.options[this.options.indexOf(opt)].label = e.target.innerText},
                content: opt.label
            }]
        }}));

        return dom;
    }

    getRendererDom(): HTMLElement {
        const dom = super.getRendererDom();

        DOM.appendChildren(this.input, this.options.map(opt => { return {
            tag: "div",
            classes: this.theme?.getClasses("formr-checkbox-group"),
            content: [{
                tag: "input",
                attrs: {type: "checkbox", name: `${this.id}-checkbox-group`, value: opt.value || opt.label, checked: opt.selected},
                classes: this.theme?.getClasses("formr-checkbox"),
                events: {oninput: (e): void => {opt.selected = (e.target as HTMLInputElement).checked;}}
            }, {
                tag: "label",
                attrs: {for: `${this.id}-checkbox-group`},
                classes: this.theme?.getClasses("formr-checkbox-label"),
                content: opt.label
            }]
        }}));

        return dom;
    }
}