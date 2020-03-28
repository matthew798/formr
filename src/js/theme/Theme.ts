import * as lodash from "lodash";
import {injectable} from "inversify";

@injectable()
export default class Theme {

    data: any;

    constructor(data: any) {
        this.data = data;
    }

    /**
     *
     * @param {Object} config
     * @param {String} [config.name]
     * @param {String} [config.prefix]
     * @param {Object} [config.data]
     * @returns {Promise<Theme>|Theme}
     */
    static async getTheme(config: any): Promise<Theme> {
        const data = config.data || {};

        if (config.name)
            lodash.merge(data, await Theme.fetchTheme(config.name, config.prefix));

        return new Theme(data);
    }

    /**
     *
     * @param {String} name
     * @param {String} prefix
     * @returns {Promise<Theme>}
     */
    static fetchTheme(name, prefix = ''): Promise<any> {
        const url = `${prefix.replace(/\/$/, "")}/theme.${name}.json`;
        return fetch(url)
            .then(response => {
                return response.json();
            });
    }

    getClasses(forElem: string, asString = false): string[] {
        if (!this.data[forElem])
            return [];

        if (asString)
            return this.data[forElem].toString().replace(',', ' ');
        else
            return this.data[forElem];
    }

}