import Column from "./Column";
import {getToken} from "../util/Token";
import DOM from "../Helpers/DOM";
import Icon from "./Icon";
import I18n from "../i18n/i18n";
import {Container, inject, injectable} from "inversify";
import {EventEmitter} from "events";
import TYPES from "../types";
import Theme from "../theme/Theme";

@injectable()
export default class Row extends EventEmitter {

    id: string;
    dom: HTMLElement;
    columns: Column[];

    /**
     *
     * @param i18n
     * @param theme
     * @param container
     * @param {Object} [data] - Optional data to use when building the row
     */
    constructor(
        @inject(TYPES.I18n) private readonly i18n: I18n,
        @inject(TYPES.Theme) private readonly theme: Theme,
        @inject(TYPES.Container) private readonly container: Container) {
        super();

        this.id = getToken();
        this.dom = this.buildDom();
        this.columns = [];
    }

    addCol(index = null, data = null): Column {
        const col = this.container.get<Column>(TYPES.Column);

        col.on('controlAdded', (control, column) => this.emit('controlAdded', control, column, this));
        col.on('delete', (): void => this.removeCol(col));

        if (data)
            col.setData(data);

        this.emit("colAdding", col, this);

        if (index == null) {
            this.columns.push(col);
            this.dom.appendChild(col.dom);
        } else {
            this.columns.splice(index, 0, col);
            this.dom.children[index].before(col.dom);
        }

        this.dom.appendChild(col.dom);

        this.emit("colAdded", col, this);

        return col;
    }

    removeCol(col = null): void {
        let colIndex;

        if (col == null) {
            colIndex = this.columns.length - 1;
            col = this.columns[colIndex];
        } else if (typeof (col) == "number") {
            colIndex = col;
            col = this.columns[col];
        } else if (col instanceof Column)
            colIndex = this.columns.indexOf(col);

        this.emit("colRemoving", col, this);

        col.dispose();
        this.columns.splice(colIndex, 1);

        this.emit("colRemoved", col, this);

    }

    get Data(): any {
        return this.getData();
    }

    getData(): any {
        const data = {
            id: this.id,
            columns: []
        };

        for (const col of this.columns) {
            data.columns.push(col.getData());
        }

        return data;
    }

    setData(data): void {
        if (data.id)
            this.id = data.id;

        if (data && data.columns) {
            for (const col of data.columns)
                this.addCol(null, col);
        }
    }

    dispose(): void {
        this.dom.outerHTML = "";
        this.dom = null;
    }

    private buildDom(): HTMLElement {
        const elem = DOM.createElement({
            tag: "div",
            attrs: {id: `feditor-row-${this.id}`},
            classes: ["formr-row", "feditor-row"]
        });
        (elem as any).row = this;
        (elem as any).type = "row";

        const buttons = DOM.createElement({
            tag: "div",
            classes: ["feditor-row-buttons"]
        });

        const addColumnButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal"],
            content: [
                Icon.getIcon("addColumn"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Add Column")}]
        });
        addColumnButton.onclick = (): Column => this.addCol();

        const copyButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal"],
            content: [
                Icon.getIcon("copy"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Copy Row")}]
        });

        const deleteButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal"],
            content: [
                Icon.getIcon("deleteRow"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Remove Row")}],
            events: {
                onclick: (): void => {
                    this.emit('delete')
                }
            }
        });

        const dragButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-horizontal", "drag", "feditor-row-drag"],
            content: Icon.getIcon("verticalDrag")
        });

        DOM.appendChildren(buttons, addColumnButton, copyButton, deleteButton, dragButton);
        elem.appendChild(buttons);

        return elem;
    }
}