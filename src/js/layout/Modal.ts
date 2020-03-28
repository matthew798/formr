import DOM from "../Helpers/DOM";
import MicroModal from "micromodal";

export default class Modal {

    private static title: Node = null;
    private static content: Node = null;

    private static instance: HTMLElement = null;

    static get Instance(): HTMLElement {
        if (Modal.instance == null)
            Modal.instance = Modal.build();

        return Modal.instance;
    }

    /**
     * Shows the modal instance with the specified content
     * @param {String} title - The title to display in the modal header
     * @param {HTMLElement|Object|String} content - Will append the given HTML element or make one from the provided config
     */
    static show(title, content): void {
        if (Modal.instance == null)
            throw "Cannot show modal that has not been initialized. Attach 'Modal.instance' to the dom first.";

        (Modal.title as HTMLElement).innerText = title;
        (Modal.content as HTMLElement).innerHTML = "";

        DOM.appendChildren(Modal.content, content);

        MicroModal.show("feditor_modal", null);
    }

    private static build(): HTMLElement {
        const dom = DOM.createElement({
            tag: "div",
            classes: ["modal", "micromodal-slide"],
            attrs: {id: "feditor_modal", 'aria-hidden': true},
            content: {
                tag: "div",
                classes: ["modal__overlay"],
                attrs: {tabindex: -1, 'data-micromodal-close': true},
                content: {
                    tag: "div",
                    classes: ["modal__container"],
                    attrs: {role: "dialog", 'aria-modal': true, 'aria-labelledby': 'feditor_modal_title'},
                    content: [{
                        tag: "header",
                        classes: ["modal__header"],
                        content: [{
                            tag: "h2",
                            classes: ["modal__title"],
                            attrs: {id: 'feditor_modal_title'}
                        }, {
                            tag: "button",
                            classes: ["modal__close"],
                            attrs: {'aria-label': "Close Modal", 'data-micromodal-close': true}
                        }]
                    }, {
                        tag: "main",
                        classes: ["modal__content"],
                        attrs: {id: 'feditor_modal_content'},
                        content: "Test"
                    }, {
                        tag: "footer",
                        classes: ["modal__footer"],
                        content: [{
                            tag: "button",
                            classes: ["modal__btn", "modal__btn_primary"],
                            content: "Continue"
                        }, {
                            tag: "button",
                            classes: ["modal__btn"],
                            attrs: {'data-micromodal-close': true, 'aria-label': "Close the dialog"},
                            content: "Close"
                        }]
                    }]
                }
            }
        });

        Modal.title = dom.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        Modal.content = dom.childNodes[0].childNodes[0].childNodes[1];

        return dom;
    }
}