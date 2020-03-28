import InputControl from "./InputControl";
import * as lodash from "lodash";

export default class TextInput extends InputControl {

    /**
     * This is an example of all the available config fields
     * @type {{input: {classes: [], styles: {color: string}, tag: string, attrs: {type: string}}, help: {classes: [], styles: {}, attrs: {}}, isConfigurable: boolean, name: string, icon: string, label: {classes: [], styles: {}, attrs: {}}}}
     */
    static config = {
        name: "Text Input",
        icon: "textField",
        isConfigurable: true,
        label: {
            classes: [],
            attrs: {},
            styles: {}
        },
        input: {
            tag: "input",
            classes: [],
            attrs: {
                type: "text"
            },
            styles: {
                color: "grey"
            }
        },
        help: {
            classes: [],
            attrs: {},
            styles: {}
        }
    };

    get Data(): any {
        return lodash.merge(super.Data, {
            input: {
                attrs: {
                    placeholder: this.input.value
                }
            }
        });
    }
}