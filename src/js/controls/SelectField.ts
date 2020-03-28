import OptionControl, {Option} from "./OptionControl";
import DOM from "../Helpers/DOM";
import * as lodash from 'lodash';

export default class SelectField extends OptionControl {

    static config = {
        name: "Select",
        icon: "selectField",
        isConfigurable: true,
        label: {
            classes: [],
            attrs: {},
            styles: {}
        },
        input: {
            tag: "select",
            styles: {}
        },
        help: {
            classes: [],
            attrs: {},
            styles: {}
        }
    };

    setOptions(options: Option[]): void {
        this.options = options;
        this.input.innerHTML = "";

        for (const opt of options)
            this.input.appendChild(DOM.createElement({
                tag: "option",
                content: opt.label,
                attrs: {
                    value: opt.value || opt.label,
                    selected: opt.selected || false
                }
            }));
    }

    getDom(): void {
        for (const cls of this.theme?.getClasses("formr-select"))
            this.input.classList.add(cls);

        for(const opt of this.options)
            this.input.appendChild(DOM.createElement({
                tag: "option",
                attrs: { selected: opt.selected, value: opt.value},
                content: opt.label
            }));

        this.input.onchange = (e): void => {
            const options = (e.target as HTMLSelectElement).options;
            for (let i = 0; i < options.length; i++) {
                this.options[i].selected = options[i].selected;
            }
        };
    }

    getEditorDom(): HTMLElement {
        const dom = super.getEditorDom();

        this.getDom();

        return dom;
    }

    getRendererDom(): HTMLElement {
        const dom = super.getRendererDom();

        this.getDom();

        return dom;
    }

    getConfigurationDom(): HTMLElement[] {

        const multiple = DOM.createElement({
            tag: "div",
            classes: ["feditor-cfg-item"],
            content: [
                {tag: "label", attrs: {'for': `${this.id}_optionEditor`}, content: "Multiple:"}
            ]
        });

        const input = DOM.createElement({
            tag: "input",
            attrs: {type: "checkbox"},
            events: {
                onchange: e => { this.input.multiple = (e.target as HTMLInputElement).checked }
            }
        });

        if (this.input.multiple)
            input.setAttribute("checked", "");

        DOM.appendChildren(multiple, input);

        return [...super.getConfigurationDom(), multiple];
    }

    get Data(): any {
        return lodash.merge(super.Data, {input:{attrs: {multiple: this.input.multiple}}});
    }
}