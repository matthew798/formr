import Toolbox from "./Toolbox";
import Workspace from "./Workspace";

import DOM from "./Helpers/DOM";
import * as Controls from "./controls/Index"
import Theme from "./theme/Theme";
import MicroModal from "micromodal";
import Modal from "./layout/Modal"
import I18n from "./i18n/i18n";

import {EventEmitter} from 'events';
import {Container, decorate, injectable} from "inversify";
import TYPES from './types';
import FormrContext from './FormrContext';
import FormElement from "./controls/FormElement";
import EditorPlugin from "./plugins/EditorPlugin";
import * as lodash from 'lodash';
import Row from "./layout/Row";
import Column from "./layout/Column";

decorate(injectable(), EventEmitter);

@injectable()
export class FormrEditor extends FormrContext {

    /**
     * Defaults for configuration options
     * @type {{maxColsPerRow: number, maxRows: number, data: {}}}
     */
    private static defaults = {
        data: {},
        maxColsPerRow: 6,
        maxRows: 0,

    };

    public promise: Promise<void>;

    private readonly container: HTMLElement;

    private toolbox: Toolbox;
    private workspace: Workspace;

    /**
     *
     * @param {HTMLElement|String} element
     * @param {Object} [config]
     * @param {Object} [config.theme]
     * @param {string} [config.theme.name]
     * @param {string} [config.theme.prefix]
     * @param {Object} [config.theme.data]
     * @param {Object} [config.i18n]
     * @param {string} [config.i18n.name]
     * @param {string} [config.i18n.prefix]
     * @param {Object} [config.i18n.data]
     * @param {Array<>} [config.plugins]
     * @param {Object} [data]
     */
    constructor(element, config, data) {
        super();

        /** Find the element to use as the container */
        if (element instanceof HTMLElement)
            this.container = element;
        else
            this.container = document.getElementById(element);

        this.emit("init");

        this.promise = this.init(config, data);
    }

    /**
     * @description Gets an of form controls currently in the editor's workspace
     * @constructor
     * @returns {FormElement[]} - An array of FormElements
     */
    get Controls(): FormElement[] {
        let controls = [];

        for (const row of this.workspace.Rows)
            for (const col of row.columns)
                controls = lodash.concat(controls, col.controls);

        return controls;
    }

    get Data(): any {
        this.emit("dataGenerating");
        const data = this.workspace.Data;
        this.emit("dataGenerated", data);

        return data;
    }

    set Data(data) {
        this.workspace.Data = data;
    }

    clear(): void {
        this.workspace.clear();
    }

    /**
     * Builds the instance's required DOM elements and appends them to the container
     */
    private buildDom(): void {
        this.container.classList.add("feditor");

        document.body.appendChild(Modal.Instance);

        //Append to the container
        DOM.appendChildren(this.container, this.workspace.dom, this.toolbox.dom);
    }

    /**
     * Initializes the instance. Creates dependencies for childrem
     * @param {Object} config - Config information passed in through the constructor
     * @param {Object} data - Any form data to be rendered
     * @returns {Promise<void>} - A promise that will resolve when the editor instance is ready to be used
     */
    private async init(config, data): Promise<void> {
        //Fetch the theme and I18n data asynchronously
        const values = await Promise.all([Theme.getTheme(config.theme), I18n.getI18n(config.i18n)]);

        //Set up DI container
        this.services.bind<FormrContext>(TYPES.Context).toConstantValue(this);
        this.services.bind<Theme>(TYPES.Theme).toConstantValue(values[0]);
        this.services.bind<I18n>(TYPES.I18n).toConstantValue(values[1]);
        this.services.bind<any>(TYPES.Data).toConstantValue(data);
        this.services.bind<Container>(TYPES.Container).toConstantValue(this.services);
        this.services.bind<Toolbox>(TYPES.Toolbox).to(Toolbox).inSingletonScope();
        this.services.bind<Workspace>(TYPES.Workspace).to(Workspace).inSingletonScope();
        this.services.bind<Row>(TYPES.Row).to(Row);
        this.services.bind<Column>(TYPES.Column).to(Column);

        //Initialize micromodal
        await MicroModal.init({
            awaitOpenAnimation: true,
            awaitCloseAnimation: true
        });

        //Make the toolbox
        this.toolbox = this.services.get<Toolbox>(TYPES.Toolbox);
        this.toolbox.registerControls(
            Controls.TextInput,
            Controls.RangeInput,
            Controls.ColorInput,
            Controls.SelectField,
            Controls.RadioGroup,
            Controls.CheckboxGroup,
            Controls.DateInput,
            Controls.TimeInput,
            Controls.WeekInput,
            Controls.MonthInput,
            Controls.Paragraph,
            Controls.Header);

        //Make the form editing area
        this.workspace = this.services.get<Workspace>(TYPES.Workspace);

        for (const plugin of config.plugins) {
            const instance = this.loadPlugin<EditorPlugin>(plugin);
            this.workspace.addButtons(instance.getMenuDom());
        }

        this.buildDom();

        this.emit("initDone");
    }
}