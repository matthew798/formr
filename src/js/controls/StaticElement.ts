import FormElement from "./FormElement";
import DOM from "../Helpers/DOM";
import * as lodash from "lodash"

export default class StaticElement extends FormElement {

    elem: HTMLElement;
    private elementEditorOptions = {
        attrs: {
            contentEditable: true
        },
        content: this.i18n?.localize(this.config.name)
    };

    getEditorDom(): HTMLElement {
        const container = super.getEditorDom();

        const elem = DOM.createElement(lodash.merge(this.elementEditorOptions, this.config));
        this.elem = elem;

        container.appendChild(elem);

        return container;
    }

    getRendererDom(): HTMLElement {
        const container = super.getRendererDom();

        const elem = DOM.createElement(this.config);

        container.appendChild(elem);

        return container;
    }

    getConfigurationDom(): HTMLElement {
        return undefined;
    }

    public get Data(): any {
        return lodash.merge(super.Data,
            {content: this.elem.innerHTML});
    }

    public get UserData(): any{
        return null;
    }

    public get Value(): any{
        return null;
    }

    getUserData(): any {
        return null;
    }
}