import Row from "./layout/Row";
import {Sortable, Plugins} from "@shopify/draggable";
import {move} from "./Helpers/Array";
import Icon from "./layout/Icon";
import DOM from "./Helpers/DOM";
import {EventEmitter} from 'events';
import Toolbox from "./Toolbox";
import I18n from "./i18n/i18n";
import Theme from "./theme/Theme";
import {Container, inject, injectable} from "inversify";
import TYPES from "./types";
import Column from "./layout/Column";

@injectable()
export default class Workspace extends EventEmitter {
    /**
     * The sortable instance that takes care of sorting controls within/between columns
     * @type {Sortable}
     */
    private readonly controlSortable: Sortable = new Sortable([], {
        draggable: ".feditor-control",
        handle: ".feditor-control-drag",
        swapAnimation: {
            duration: 200,
            easingFunction: 'ease-in-out'
        },
        plugins: [Plugins.SwapAnimation]
    }).on("sortable:stop", function (e) {
        const oldCol = e.oldContainer.column as Column;
        const newCol = e.newContainer.column as Column;

        if (e.oldContainer === e.newContainer) {
            if (e.oldIndex !== e.newIndex)
                move(newCol.controls, e.oldIndex, e.newIndex);
        } else {
            oldCol.controls.splice(e.oldIndex, 1);
            newCol.controls.splice(e.newIndex, 0, e.data.dragEvent.data.originalSource.control);
        }
    });

    /** The instance's DOM */
    readonly dom: HTMLElement[];

    /**
     * The sortable instance that takes care of sorting columns within/between rows
     * @type {Sortable}
     */
    private readonly columnSortable: Sortable = new Sortable([], {
        draggable: ".feditor-column",
        handle: ".feditor-column-drag",
        swapAnimation: {
            duration: 200,
            easingFunction: 'ease-in-out',
            horizontal: true
        },
        plugins: [Plugins.SwapAnimation]
    }).on("sortable:stop", function (e) {
        const newRow = e.newContainer.row as Row;
        const oldRow = e.oldContainer.row as Row;

        if (e.oldContainer === e.newContainer) {
            if (e.oldIndex !== e.newIndex)
                move(newRow.columns, e.oldIndex, e.newIndex);
        } else {
            oldRow.columns.splice(e.oldIndex, 1);
            newRow.columns.splice(e.newIndex, 0, e.data.dragEvent.data.originalSource.column);
        }
    });
    /**
     * The sortable instance that takes care of sorting rows
     * @type {Sortable}
     */
    private readonly rowSortable: Sortable = new Sortable([], {
        draggable: ".feditor-row",
        handle: ".feditor-row-drag",
        swapAnimation: {
            duration: 200,
            easingFunction: 'ease-in-out'
        },
        plugins: [Plugins.SwapAnimation]
    }).on("sortable:stop", function (e) {
        if (e.oldIndex !== e.newIndex)
            move(e.newContainer.workspace.data.rows, e.oldIndex, e.newIndex);
    });

    private readonly workspaceContainer: Container;
    private readonly data: any;

    /** HTMLElement of the left-hand menu */
    private menu: HTMLElement;
    private rows: Row[] = [];

    /**
     * Creates an instance of Workspace. The workspace is the container for the form layout and controls
     * (i.e. rows > columns > controls)
     * @param {FormrEditor} editor
     * @param {Toolbox} toolbox
     * @param {Theme} theme
     * @param {Theme} i18n
     * @param container
     * @param {Object} [data]
     */
    constructor(
        @inject(TYPES.Toolbox) readonly toolbox: Toolbox,
        @inject(TYPES.Theme) private readonly theme: Theme,
        @inject(TYPES.I18n) private readonly i18n: I18n,
        @inject(TYPES.Container) private readonly container: Container,
        @inject(TYPES.Data) data: any = null) {

        super();

        this.dom = this.buildDom();
        this.rowSortable.addContainer(this.dom[1]);
        this.rows = [];

        (this.dom as any).workspace = this;

        if (data) {
            this.Data = data;
        } else {
            //Add the first row and give it a column
            const row = this.addRow();
            row.addCol();
        }

    }

    /**
     * Gets the collection of rows currently in the instance
     * @returns {Row[]} A collection of rows
     */
    get Rows(): Row[] {
        return this.rows;
    }

    /**
     * Returns an object containing the data necessary to re-create the current form's state in either another editor
     * or a renderer.
     * @returns {{rows: []}}
     */
    get Data(): any {
        const data = {
            rows: []
        };

        for (const row of this.rows)
            data.rows.push(row.getData());

        return data;
    }

    /**
     * Sets the data for the instance
     * @param {any} data - The data to load
     */
    set Data(data: any) {
        this.clear();

        if (data.rows) {
            for (const row of data.rows)
                this.addRow(null, row);
        }
    }

    //TODO evaluate if this should be done like this. Maybe better to have the workspace query the plugins itself
    /**
     * Adds the given buttons to left menu bar
     * @param buttons
     */
    addButtons(buttons: HTMLElement[]): void {
        DOM.appendChildren(this.menu, buttons);
    }

    /**
     * Clears all controls, columns and rows from the instance
     */
    clear(): void {
        for (const row of this.rows) {
            row.dispose();
            this.columnSortable.removeContainer(row.dom);
        }

        this.rows = [];
    }



    /**
     * Adds a row to this instance of workspace
     * @param {Number} [index] - The index at which to insert the new row
     * @param {Object} [data] - Optional data to use for building the row
     * @returns {Row} - The newly created row
     */
    addRow(index = null, data = null): Row {
        const row = this.container.get<Row>(TYPES.Row);

        row.on('colAdded', (col, row): void => this.controlSortable.addContainer(col.dom));
        row.on('colRemoved', (col, row): void => this.controlSortable.removeContainer(col.dom));
        row.on('delete', (): void => this.removeRow(row));

        if (data)
            row.setData(data);

        this.emit("rowAdding", row);

        if (index == null) {
            this.rows.push(row);
            this.dom[1].appendChild(row.dom);
        } else {
            this.rows.splice(index, 0, row);
            this.dom[1].children[index].before(row.dom);
        }

        //row.addCol();
        this.columnSortable.addContainer(row.dom);

        this.emit("rowAdded", row);

        return row;
    }

    /**
     * Removes a row from this instance of workspace.
     * @param {Number|Row} [row] - Either the index of the row to be removed or the instance of the row itself.
     * if null, the last row will be removed
     */
    removeRow(row: Row = null): void {
        let rowIndex;

        if (row == null) {
            rowIndex = this.rows.length - 1;
            row = this.rows[rowIndex];
        } else if (typeof (row) == "number") {
            rowIndex = row;
            row = this.rows[row];
        } else if (row instanceof Row)
            rowIndex = this.rows.indexOf(row);

        this.emit("rowRemoving", row);

        row.dispose();
        this.columnSortable.removeContainer(row.dom);
        this.rows.splice(rowIndex, 1);

        this.emit("rowRemoved", row);
    }

    //Methods
    /**
     * Creates the dom structure for the instance
     * @returns {HTMLElement} Instance DOM
     */
    private buildDom(): HTMLElement[] {
        const elem = DOM.createElement({tag: "div", attrs: {id: "feditor-workspace"}, classes: ["feditor-workspace"]});
        const buttonsContainer = DOM.createElement({tag: "div"});
        const buttons = this.menu = DOM.createElement({tag: "div", classes: ["feditor-workspace-buttons"]});

        const addRowButton = DOM.createElement({
            tag: "div",
            classes: ["feditor-button-vertical"],
            attrs: {id: "feditor-add-row-button"},
            content: [
                Icon.getIcon("addRow"),
                {tag: "div", classes: ["feditor-button-tooltip"], content: this.i18n.localize("Add Row")}]
        });
        addRowButton.onclick = () => this.addRow();

        DOM.appendChildren(buttons, addRowButton);

        buttonsContainer.appendChild(buttons);

        return [buttonsContainer, elem];
    }
}