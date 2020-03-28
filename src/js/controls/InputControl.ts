import FormElement from "./FormElement";
import DOM from "../Helpers/DOM";
import * as lodash from "lodash";

/**
 * An InputControl represents a form element composed of a <label>, <input> and an optional <small> help text
 */
export default abstract class InputControl extends FormElement {
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
        tag: "input",
        attrs: {
            id: `${this.name}_${this.id}`
        },
        classes: this.theme?.getClasses("formr-input")
    };

    private editorInputConfig = {
        classes: this.theme?.getClasses("feditor-input")
    };

    private rendererInputConfig = {
        classes: this.theme?.getClasses("frenderer-input"),
        events: {oninput: e => {this.emit("input", (e.target as HTMLInputElement).value)}}
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

    /** @type {HTMLLabelElement} */
    label: HTMLLabelElement;

    /** @type {HTMLInputElement} */
    input: HTMLInputElement;

    /** @type {HTMLElement} */
    help: HTMLElement;

    /**
     * Returns an element suitable to be added to the editor surface
     * @returns {HTMLElement}
     */
    getEditorDom(): HTMLElement {
        const container = super.getEditorDom();

        this.label = DOM.createElement(lodash.merge(this.commonLabelConfig, this.editorLabelConfig, this.config.label));
        this.input = DOM.createElement(lodash.merge(this.commonInputConfig, this.editorInputConfig, this.config.input));
        this.help = DOM.createElement(lodash.merge(this.commonHelpConfig, this.editorHelpConfig, this.config.help));

        DOM.appendChildren(container, [this.label, this.input, this.help]);

        return container;
    }

    getRendererDom(): HTMLElement {
        const container = super.getRendererDom();

        this.label = DOM.createElement(lodash.merge(this.commonLabelConfig, this.rendererLabelConfig, this.config.label));
        this.input = DOM.createElement(lodash.merge(this.commonInputConfig, this.rendererInputConfig, this.config.input));
        this.help = DOM.createElement(lodash.merge(this.commonHelpConfig, this.rendererHelpConfig, this.config.help));

        DOM.appendChildren(container, [this.label, this.input, this.help]);

        return container;
    }

    getConfigurationDom(): HTMLElement[] {
        const labelEditor = DOM.createElement({
            tag: "div",
            classes: ["feditor-cfg-item"],
            content: [
                {tag: "label", styles: {'margin-top:': '10px'}, content: "Label:"},
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
                {tag: "label", styles: {'margin-top:': '10px'}, content: "Help Text:"},
                {
                    tag: "input",
                    attrs: {type: "text", value: this.help.innerText},
                    events: {oninput: e => this.help.innerText = (e.target as HTMLInputElement).value}
                }
            ]
        });

        return [labelEditor, helpEditor];
    }

    public get Data(): any{
        return lodash.merge(super.Data, {
            label: {content: this.label.innerHTML},
            help: {content: this.help.innerHTML}
        });
    }

    public get UserData(): any{
        return {input: {attrs: {value: this.input.value}}}
    }

    public get Value(): any{
        return this.input.value;
    }
}