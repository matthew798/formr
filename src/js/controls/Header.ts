import StaticElement from "./StaticElement";

export default class Header extends StaticElement {
    static config = {
        name: "Header",
        icon: "header",
        tag: "h1"
    }
}