import FormElement from "./FormElement";
import DOM from "../Helpers/DOM";
import * as lodash from "lodash";
import {inject} from "inversify";
import TYPES from "../types";
import Theme from "../theme/Theme";
import I18n from "../i18n/i18n";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Choices = require("choices.js");

export class Option {

    public label: string;
    public value: string = null;
    public selected: boolean = false;

    constructor(
        label: string,
        value: string = label,
        selected = false) {

        this.label = label;
        this.value = value ? value : label;
        this.selected = selected ? true : false;
    }

}

export default abstract class OptionControl extends FormElement {
    options: Option[] = [];

    label: HTMLLabelElement;
    input: HTMLInputElement;
    help: HTMLElement;
    /**
     * Default attributes, theming, etc we need for the label element
     */
    private commonLabelConfig = {
        tag: "label",
        attrs: {
            for: `${this.name}_${this.id}`,
        },
        classes: this.theme?.getClasses("formr-label"),
        events: {
            onclick: (e): void => e.preventDefault()
        }
    };
    private editorLabelConfig = {
        attrs: {
            contentEditable: true,
        },
        classes: this.theme?.getClasses("feditor-label"),
        content: this.i18n?.localize(this.config.name)
    };
    private rendererLabelConfig = {
        classes: this.theme?.getClasses("frenderer-label")
    };
    /**
     * Default attributes, theming, etc we need for the input element
     */
    private commonInputConfig = {
        tag: "div",
        attrs: {
            id: `${this.name}_${this.id}`
        }
    };
    /**
     * Default attributes, theming, etc we need for the help element
     */
    private commonHelpConfig = {
        tag: "small",
        classes: this.theme?.getClasses("formr-help")
    };
    private editorHelpConfig = {
        tag: "small",
        content: this.i18n?.localize("Help Text"),
        attrs: {contentEditable: true},
        classes: this.theme?.getClasses("feditor-help")
    };
    private rendererHelpConfig = {
        classes: this.theme?.getClasses("frenderer-help")
    };

    constructor(@inject(TYPES.Theme) theme: Theme,
                @inject(TYPES.I18n) i18n: I18n,
                @inject("data") data: any = null) {
        super(theme, i18n, data);

        this.options = data?.options.map(opt => new Option(opt.label, opt.value, opt.selected)) ?? [];
    }

    /**
     * Returns an element suitable to be added to the editor surface
     * @returns {HTMLElement}
     */
    getEditorDom(): HTMLElement {
        //Container to wrap various form components I.E. label, input, help text...
        const container = super.getEditorDom();

        this.label = DOM.createElement(lodash.merge(this.commonLabelConfig, this.editorLabelConfig, this.config.label));
        this.input = DOM.createElement(lodash.merge(this.commonInputConfig, this.config.input));
        this.help = DOM.createElement(lodash.merge(this.commonHelpConfig, this.editorHelpConfig, this.config.help));

        DOM.appendChildren(container, [this.label, this.input, this.help]);

        return container;
    }

    getRendererDom(): HTMLElement {
        const container = super.getRendererDom();

        this.label = DOM.createElement(lodash.merge(this.commonLabelConfig, this.rendererLabelConfig, this.config.label));
        this.input = DOM.createElement(lodash.merge(this.commonInputConfig, this.config.input));
        this.help = DOM.createElement(lodash.merge(this.commonHelpConfig, this.rendererHelpConfig, this.config.help));

        DOM.appendChildren(container, [this.label, this.input, this.help]);

        return container;
    }

    getConfigurationDom(): HTMLElement[] {
        const labelEditor = DOM.createElement({
            tag: "div",
            classes: ["feditor-cfg-item"],
            content: [
                {tag: "label", content: "Label:"},
                {
                    tag: "input",
                    attrs: {type: "text", value: this.label.innerText},
                    events: {oninput: e => this.label.innerText = (e.target as HTMLInputElement).value}
                }
            ]
        });

        const helpEditor = DOM.createElement({
            tag: "div",
            classes: ["feditor-cfg-item"],
            content: [
                {tag: "label", content: "Help Text:"},
                {
                    tag: "input",
                    attrs: {type: "text", value: this.help.innerText},
                    events: {oninput: e => this.help.innerText = (e.target as HTMLInputElement).value}
                }
            ]
        });

        const optionEditor = DOM.createElement({
            tag: "div",
            classes: ["feditor-cfg-item"],
            content: [
                {tag: "label", attrs: {'for': `${this.id}_optionEditor`}, content: "Options:"},
                {
                    tag: "input",
                    attrs: {type: "text"},
                    events: {
                        onchange: (e): void => {
                            this.options = (e.target as HTMLInputElement).value
                                .split(',')
                                .map(opt => new Option(opt));
                        this.refresh();
                        }
                    }
                }
            ]
        });

        const optionEditorInput = optionEditor.childNodes[1] as HTMLInputElement;

        new Choices(optionEditorInput, {
            items: this.options.map(x => x.label),
            duplicateItemsAllowed: false,
            editItems: true
        });

        return [labelEditor, helpEditor, optionEditor];
    }

    public get Data(): any {
        return lodash.merge(super.Data, {
            label: {content: this.label.innerHTML},
            options: this.options,
            help: {content: this.help.innerHTML}
        });
    }

    public get UserData(): any {
        return {input: {content: this.options}};
    }

    public get Value(): any {
        return this.input.value;
    }
}