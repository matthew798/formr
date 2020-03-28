import FormElement from "./controls/FormElement";
import {EventEmitter} from "events";
import {Container, interfaces} from "inversify";
import FormrPlugin from "./plugins/FormrPlugin";

export default abstract class FormrContext extends EventEmitter {
    protected readonly services: Container;
    private plugins: FormrPlugin[] = [];

    protected constructor(containerOptions: interfaces.ContainerOptions = null) {
        super();

        this.services = new Container(containerOptions);
    }

    readonly Controls: FormElement[];

    loadPlugin<T extends FormrPlugin>(plugin: new () => T | [new () => T, any]): T {
        let instance;

        if (Array.isArray(plugin))
            instance = new plugin[0](this.services, plugin[1]);

        else
            instance = new plugin[0](this.services);

        this.plugins.push(instance);

        return instance;
    }
}