import * as Controls from "./controls/Index";
import DOM from "./Helpers/DOM";
import FormElement from "./controls/FormElement";
import Theme from "./theme/Theme";
import FormrContext from "./FormrContext";
import I18n from "./i18n/i18n";
import {Container} from "inversify";
import TYPES from "./types";
import RendererPlugin from "./plugins/RendererPlugin";
import * as lodash from "lodash";

/**
 * Form renderer component of the Formr library
 */
export class FormrRenderer extends FormrContext {
    private readonly controlContainer: Container;
    private element: HTMLElement;
    private theme: Theme;

    private readonly controls: FormElement[] = [];
    private data: any;


    /** The promise that will resolve when the instance is ready */
    public readonly promise: Promise<void>;


    /**
     *
     * @param {HTMLElement|string} element Element or selector to use as the container for the renderer
     * @param {any} config Configuration data
     * @param {any} [data] Form data to be preloaded
     */
    constructor(element: HTMLElement | string, config: any, data: any = null) {
        super();

        this.controlContainer = new Container();
        this.controlContainer.parent = this.services;

        /** Find the element to use as the container */
        if (element instanceof HTMLElement)
            this.element = element;
        else
            this.element = document.getElementById(element);

        this.emit("init");

        this.promise = this.init(config, data);
    }

    //#region Controls functions
    /**
     * Adds all the given controls to the registry.
     * @param {...typeof FormElement[]} controls
     */
    registerControls(...controls: (new(any, FormrContext) => FormElement)[]): void {
        for (const control of controls)
            this.registerControl(control);
    }

    //#region Initialization
    /**
     * Build the DOM for this instance
     */
    buildDom(): void {
        this.element.classList.add("frenderer");
    }

    //#endregion

    /**
     * Loads and applies form data to the instance
     * @param {any} data The form data to be loaded
     */
    loadData(data: any): void {
        this.data = data;

        this.emit("rendering", data);
        this.element.innerHTML = '';

        for (const row of data.rows) {
            const rowElem = DOM.createElement({tag: "div", classes: ["frenderer-row"]});
            this.element.appendChild(rowElem);

            for (const col of row.columns) {
                const colElem = DOM.createElement({tag: "div", classes: ["frenderer-column"]});
                rowElem.appendChild(colElem);

                for (const controlData of col.controls) {
                    this.controlContainer.bind("data").toConstantValue(controlData);
                    const control = this.controlContainer.get<FormElement>(controlData.type);
                    this.controlContainer.unbind("data");

                    control.on("input", (): void => lodash.merge(controlData, control.UserData));

                    this.controls.push(control);

                    colElem.appendChild(control.getRendererDom());
                }
            }
        }

        this.emit("rendered");
    }

    /**
     * Adds a control type to the registry.
     * @param {typeof FormElement} control
     */
    private registerControl(control): void {
        const type = FormElement.getType(control.config.name);
        this.controlContainer.bind<typeof control>(type).to(control);
    }

    /**
     * Performs any required initialization of the instance
     * @param {any} config Configuration data
     * @param {any} [data] Form data to be preloaded
     * @returns {Promise<void>} A promise that will resolve when the instance is ready to be used
     */
    private async init(config: any, data: any = null): Promise<void> {
        const values = await Promise.all([Theme.getTheme(config.theme), I18n.getI18n(config.i18n)]);

        //Set up DI container
        this.services.bind<FormrContext>(TYPES.Context).toConstantValue(this);
        this.services.bind<Theme>(TYPES.Theme).toConstantValue(values[0]);
        this.services.bind<I18n>(TYPES.I18n).toConstantValue(values[1]);
        this.services.bind<any>(TYPES.Data).toConstantValue(data);
        this.services.bind<Container>(TYPES.Container).toConstantValue(this.services);

        this.registerControls(
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

        this.buildDom();

        for (const plugin of config.plugins) {
            this.loadPlugin<RendererPlugin>(plugin);
        }

        if (data)
            this.loadData(data);

        this.emit("initDone");
    }

    public get Data(): any {
        return lodash.omitBy(this.data, lodash.isNil) ;
    }

    public get UserData(): any{
        const data = {};

        for(const ctrl of this.controls){
            const val = ctrl.Value;
            if(val != null)
                data[ctrl.id] = ctrl.Value;
        }

        return data;
    }

    getControl(type: string): FormElement {
        return this.controlContainer.get(type);
    }
}