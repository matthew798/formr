import * as lodash from "lodash";
import {injectable} from "inversify";

@injectable()
export default class I18n {
    data: any;
    showMissing: boolean;

    constructor(data, showMissing = false) {
        this.data = data;
        this.showMissing = showMissing;
    }

    /**
     * Merges provided data with remote data and returns an i18n instance
     * @param {Object} config
     * @param {String} [config.name]
     * @param {String} [config.prefix]
     * @param {Object} [config.data]
     * @param {boolean} [showMissing]
     * @returns {Promise<I18n>|I18n}
     */
    static async getI18n(config, showMissing = false): Promise<I18n> {
        const data = config?.data || {};

        if (config?.name)
            lodash.merge(data, await I18n.fetchI18n(config.name, config.prefix));

        return new I18n(data, showMissing);
    }

    /**
     * Fetches remote I18N data
     * @param {String} name
     * @param {String} prefix
     * @returns {Promise<object>}
     */
    static async fetchI18n(name, prefix = ''): Promise<any> {
        const url = `${prefix.replace(/\/$/, "")}/${name}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw(response.statusText);
        }
        return await response.json();
    }

    localize(token): string {
        if (this.data[token])
            return this.data[token];
        else if (this.showMissing)
            return "**MISSING I18N**";

        return token;
    }
}