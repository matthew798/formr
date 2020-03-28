import * as lodash from 'lodash';

export interface DOMConfig{
    tag: string;
    classes?: string[];
    attrs?: {[k: string]: string | number | boolean};
    styles?: {[k: string]: string};
    content?: string | HTMLElement | DOMConfig | (string | HTMLElement | DOMConfig)[];
    events?: {[k: string]: EventListenerOrEventListenerObject};
}

export default class DOM{
    /**
     * Creates an element from the provided config and return it
     * @param {DOMConfig} config - Configuration data to be applied to the element
     * @returns {HTMLElement} An element ready to be appended to the dom
     */
    static createElement<T extends HTMLElement>(config: DOMConfig): T {
        const elem = document.createElement(config.tag) as T;

        if (config.classes) {
            for (const cls of config.classes)
                elem.classList.add(cls);
        }

        if (config.attrs) {
            for (const [attr, value] of Object.entries(config.attrs)){
                if(value !== false)
                    elem.setAttribute(attr, value ? value.toString() : "");
            }
        }

        if(config.styles){
            for(const [style, value] of Object.entries(config.styles))
                elem.style[style] = value;
        }

        if(config.content){
            switch (typeof(config.content)) {
                case "string":
                    elem.innerHTML += config.content;
                    break;
                case "object":
                    if (config.content instanceof Array) {
                        for (const obj of config.content)
                            if (typeof (obj) === "string")
                                elem.innerHTML += obj;
                            else if(obj instanceof HTMLElement)
                                elem.appendChild(obj);
                            else
                                elem.appendChild(this.createElement(obj));
                    } else if (config.content instanceof HTMLElement)
                        elem.appendChild(config.content);
                    else
                        elem.appendChild(this.createElement(config.content));
                    break;
                default:
                    throw "Cannot set incompatible type as content of element";
            }
        }

        if (config.events)
            for (const [evt, cb] of Object.entries(config.events)) {
                const evtName: string = evt.replace(/^on/, '');
                elem.addEventListener(evtName, cb as EventListenerOrEventListenerObject);
            }

        return elem as T;
    }

    static appendChildren(target, ...elements: any[]): void {
        for (const elem of lodash.flattenDeep(elements)) {
            if (elem instanceof HTMLElement)
                target.appendChild(elem);
            else if (typeof elem == 'object')
                target.appendChild(DOM.createElement(elem));
            else if (typeof elem == 'string')
                target.innerHtml = elem;
        }
    }
}