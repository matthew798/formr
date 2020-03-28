import FormElement from './controls/FormElement'
import Icon from "./layout/Icon";
import DOM, {DOMConfig} from "./Helpers/DOM";
import I18n from "./i18n/i18n";
import {Container, inject, injectable} from "inversify";
import TYPES from "./types";

@injectable()
export default class Toolbox {

    readonly dom: HTMLElement;
    private readonly registeredControls: (new () => FormElement)[] | FormElement[] = [];
    private readonly controlContainer: Container;
    private box: HTMLElement;

    /**
     *
     * @param {I18n} i18n
     * @param container
     */
    constructor(
        @inject(TYPES.I18n) private readonly i18n: I18n,
        @inject(TYPES.Container) container: Container) {

        this.dom = this.buildDom();

        this.controlContainer = new Container();
        this.controlContainer.parent = container;

    }

    /**
     * Creates the dom structure for the instance
     */
    private buildDom(): HTMLElement {
        const dom = DOM.createElement(
            {
                tag: "div",
                classes: ["feditor-toolbox-container"],
                content: {
                    tag: "div",
                    classes: ["feditor-toolbox"],
                    content: {
                        tag: "div",
                        classes: ["feditor-toolbox-handle"],
                        content: Icon.getIcon("toolbox")
                    }
                }
            });

        this.box = dom.children[0] as HTMLElement;

        return dom;
    }

    /**
     * Registers the given controls. The controls will be available for placement in the workspace
     * @param {(new (any, FormrContext) => FormElement)[]} controls - Any number or {@see FormElement}s
     */
    registerControls(...controls: (new (any, FormrContext) => FormElement)[]): void {
        for (const control of controls)
            this.registerControl(control);
    }

    /**
     * Gets an instance of the requested control type
     * @param {string} type - Type key of the control
     * @param {any} data - Any data to pass to the control's constructor
     */
    getControl(type: string, data: any = null): FormElement {

        let control: FormElement;

        try{
            this.controlContainer.bind("data").toConstantValue(data);
            control = this.controlContainer.get<FormElement>(type);
        }
        finally{ this.controlContainer.unbind("data"); }

        return control;
    }

    /**
     *  Registers a single control. The control will be available for placement in the workspace
     * @param {FormElement} control - A {@see FormElement}
     */
    private registerControl(control): void {
        const elem = document.createElement("div");
        elem.classList.add("feditor-toolbox-item");

        if (control.config.icon)
            elem.innerHTML = Icon.getIcon(control.config.icon);

        elem.innerHTML += this.i18n.localize(control.config.name);

        //Make the toolbox element draggable
        elem.draggable = true;

        const type = FormElement.getType(control.config.name);

        elem.ondragstart = (e): void => {
            console.debug(`Started dragging control of type ${type}`);
            e.dataTransfer.setData("text", type);
        };

        this.controlContainer.bind<typeof control>(type).to(control);

        this.box.appendChild(elem);
    }
}