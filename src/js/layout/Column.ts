import FormElement from '../controls/FormElement'
import {getToken} from "../util/Token";
import Icon from "./Icon";
import DOM from "../Helpers/DOM";
import I18n from "../i18n/i18n";
import {inject, injectable} from "inversify";
import TYPES from "../types";
import Toolbox from "../Toolbox";
import {EventEmitter} from "events";

@injectable()
export default class Column extends EventEmitter {

    id: string;
    dom: HTMLElement;
    controls: FormElement[];

    /**
     *
     * @param i18n
     * @param toolbox
     * @param {Object} [data]
     */
    constructor(
        @inject(TYPES.I18n) private readonly i18n: I18n,
        @inject(TYPES.Toolbox) private readonly toolbox: Toolbox) {
        super();
        this.id = getToken();
        this.dom = this.buildDom();
        this.controls = [];
    }

    /**
     *
     * @param {FormElement} control
     */
    addControl(control: FormElement): void {
        this.emit("controlAdding", control, this);

        const controlElem = control.getEditorDom();

        this.controls.push(control);

        //prevent clicking on children from bubbling up to the column
        controlElem.onclick = (e): void => {
            e.stopPropagation();
        };

        for (const child of Array.from(controlElem.children))
            (child as HTMLElement).onclick = (e): void => {
                e.stopPropagation();
            };

        this.dom.appendChild(control.getEditorDom());

        this.emit("controlAdded", control, this);
    }

    removeControl(control = null): void {
        let controlIndex;

        if (control == null) {
            controlIndex = this.controls.length - 1;
            control = this.controls[controlIndex];
        } else if (typeof (control) == "number") {
            controlIndex = control;
            control = this.controls[control];
        } else if (control instanceof FormElement)
            controlIndex = this.controls.indexOf(control);

        this.emit("controlRemoving", control, this);

        control.dispose();
        this.controls.splice(controlIndex, 1);

        this.emit("controlRemoved", control, this);
    }

    get Data(): any {
        return this.getData();
    }

    getData(): any {
        const data = {
            id: this.id,
            controls: []
        };

        for (const control of this.controls)
            data.controls.push(control.Data);

        return data;
    }

    setData(data): void {
        if (data.id)
            this.id = data.id;

        for (const control of data.controls)
            this.addControl(this.toolbox.getControl(control.type, control));
    }

    dispose(): void {
        this.dom.outerHTML = "";
        this.dom = null;
    }

    private buildDom(): HTMLElement {
        const elem = DOM.createElement({
            tag: "div",
            attrs: {id: `feditor-column-${this.id}`},
            classes: ["feditor-column"],
            events: {
                ondragover: (e): void => e.preventDefault()
            }
        });

        (elem as any).column = this;

        const buttons = DOM.createElement({tag: "div", classes: ["feditor-column-buttons"]});

        const removeButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal"],
            content: [
                Icon.getIcon("deleteIcon"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Remove Column")}],
            events: {
                onclick: (e): void => {
                    this.emit('delete')
                }
            }
        });

        const dragButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal", "drag", "feditor-column-drag"],
            content: Icon.getIcon("multiDrag")
        });

        DOM.appendChildren(buttons, removeButton, dragButton);
        elem.appendChild(buttons);

        elem.ondrop = (e): void => {
            e.preventDefault();
            const controlType = e.dataTransfer.getData("text");
            this.addControl(this.toolbox.getControl(controlType));
        };

        return elem;
    }
}