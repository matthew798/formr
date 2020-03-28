import FormrPlugin from "./FormrPlugin";

export default interface EditorPlugin extends FormrPlugin {
    getMenuDom(): HTMLElement[];
}