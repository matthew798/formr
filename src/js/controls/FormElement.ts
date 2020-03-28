import {getToken} from "../util/Token";
import * as lodash from "lodash";
import DOM from "../Helpers/DOM";
import Icon from "../layout/Icon";
import Modal from "../layout/Modal";
import I18n from "../i18n/i18n";
import Theme from "../theme/Theme";
import {inject, injectable} from "inversify";
import TYPES from "../types";
import {EventEmitter} from "events";

//TODO Figure out how to get the DOM stored in this object rather than floating around elsewhere

@injectable()
export default abstract class FormElement extends EventEmitter {

    static config: any;

    theme: Theme;
    i18n: I18n;
    config: any;
    id: string;
    name: string;
    type: string;
    dom: HTMLElement;

    /**
     * Constructs a draggable toolbox item
     * @param {Object} data
     * @param theme
     * @param i18n
     * @param {String} data.name
     * @param {String} data.id
     * @param {Object} data.icon
     * @param {Boolean} data.isConfigurable
     */
    constructor(@inject(TYPES.Theme) theme: Theme,
                @inject(TYPES.I18n) i18n: I18n,
                @inject("data") data: any = null) {
        super();
        if (new.target.config == null)
            throw "No configuration provided.";

        if (new.target.config.name == null)
            throw "config.name cannot be null";

        this.theme = theme;
        this.i18n = i18n;
        this.config = lodash.merge({}, new.target.config, data);

        this.id = this.config.id || getToken();
        this.name = this.config.name;
        this.type = FormElement.getType(this.name);
    }

    static getType(name): string {
        return name.replace(/\s+/g, '_').toLowerCase();
    }

    /**
     * Returns an element suitable to be added to the editor surface
     * @returns {HTMLElement}
     */
    getEditorDom(): HTMLElement {
        //Container to wrap various form components I.E. label, input, help text...
        const container = DOM.createElement({
            tag: "div",
            classes: ["feditor-control"].concat(this.theme?.getClasses("formr-control"))
        });
        (container as any).control = this;

        const buttons = DOM.createElement({
            tag: "div",
            classes: ["feditor-control-buttons"].concat(this.theme?.getClasses("feditor-control-buttons"))
        });

        // Remove control button
        const removeButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal"],
            content: [
                Icon.getIcon("deleteIcon"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Remove Control")}],
            events: {onclick: (): void => (container.parentElement as any).column.removeControl(this)}
        });

        buttons.appendChild(removeButton);

        //Configure control button
        if(this.config.isConfigurable){
            const cfgButton = DOM.createElement({
                tag: "div",
                classes: ["feditor-button-horizontal"],
                attrs: {id: `cfg_${this.id}`},
                content: [
                    Icon.getIcon("wrench"),
                    {
                        tag: "div",
                        classes: ["feditor-button-tooltip"],
                        content: this.i18n.localize("Configure Control")
                    }],
                events: {onclick: (): void => Modal.show(this.name, this.getConfigurationDom())}
            });

            buttons.appendChild(cfgButton);
        }

        //Drag control button
        const dragButton = DOM.createElement({
            tag: "div",
            attrs: {id: `drag_${this.id}`},
            classes: ["feditor-button-horizontal", "drag", "feditor-control-drag"],
            content: Icon.getIcon("multiDrag")
        });

        buttons.appendChild(dragButton);

        container.appendChild(buttons);

        this.dom = container;

        return container;
    }

    getRendererDom(): HTMLElement {
        this.dom = DOM.createElement({
            tag: "div",
            classes: ["frenderer-control"].concat(this.theme?.getClasses("formr-control"))
        });
        return this.dom;
    }

    /**
     * @abstract
     */
    abstract getConfigurationDom(): HTMLElement | HTMLElement[];

    refresh(): void {
        this.dom.replaceWith(this.getEditorDom());
    }

    public get Data(): any {
        return {
            type: this.type,
            id: this.id
        };
    }

    public abstract get UserData(): any;

    public abstract get Value(): any;

    dispose(): void {
        this.dom.parentElement?.removeChild(this.dom);
    }


}