import DOM from "../Helpers/DOM";
// @ts-ignore
import LanguageIcon from "./icons/language.svg";

import {updatedDiff} from 'deep-object-diff';
import * as lodash from 'lodash';
import I18n from "../i18n/i18n";
import {Container} from "inversify";
import TYPES from "../types";
import FormrContext from "../FormrContext";
import EditorPlugin from "./EditorPlugin";
import RendererPlugin from "./RendererPlugin";
import Theme from "../theme/Theme";

export class TranslationPlugin implements EditorPlugin, RendererPlugin {
    private readonly context: FormrContext;
    private readonly i18n: I18n;
    private readonly theme: Theme;

    private readonly defaultLang;
    private readonly supportedLangs;
    private readonly languageData = {
        "aa": "Afaraf",
        "ab": "аҧсуа бызшәа, аҧсшәа",
        "ae": "avesta",
        "af": "Afrikaans",
        "ak": "Akan",
        "am": "አማርኛ",
        "an": "aragonés",
        "ar": "العربية",
        "as": "অসমীয়া",
        "av": "авар мацӀ, магӀарул мацӀ",
        "ay": "aymar aru",
        "az": "azərbaycan dili",
        "ba": "башҡорт теле",
        "be": "беларуская мова",
        "bg": "български език",
        "bh": "भोजपुरी",
        "bi": "Bislama",
        "bm": "bamanankan",
        "bn": "বাংলা",
        "bo": "བོད་ཡིག",
        "br": "brezhoneg",
        "bs": "bosanski jezik",
        "ca": "català",
        "ce": "нохчийн мотт",
        "ch": "Chamoru",
        "co": "corsu, lingua corsa",
        "cr": "ᓀᐦᐃᔭᐍᐏᐣ",
        "cs": "čeština, český jazyk",
        "cu": "ѩзыкъ словѣньскъ",
        "cv": "чӑваш чӗлхи",
        "cy": "Cymraeg",
        "da": "dansk",
        "de": "Deutsch",
        "dv": "ދިވެހި",
        "dz": "རྫོང་ཁ",
        "ee": "Eʋegbe",
        "el": "ελληνικά",
        "en": "English",
        "eo": "Esperanto",
        "es": "Español",
        "et": "eesti, eesti keel",
        "eu": "euskara, euskera",
        "fa": "فارسی",
        "ff": "Fulfulde, Pulaar, Pular",
        "fi": "suomi, suomen kieli",
        "fj": "vosa Vakaviti",
        "fo": "føroyskt",
        "fr": "français, langue française",
        "fy": "Frysk",
        "ga": "Gaeilge",
        "gd": "Gàidhlig",
        "gl": "galego",
        "gn": "Avañe'ẽ",
        "gu": "ગુજરાતી",
        "gv": "Gaelg, Gailck",
        "ha": "(Hausa) هَوُسَ",
        "he": "עברית",
        "hi": "हिन्दी, हिंदी",
        "ho": "Hiri Motu",
        "hr": "hrvatski jezik",
        "ht": "Kreyòl ayisyen",
        "hu": "magyar",
        "hy": "Հայերեն",
        "hz": "Otjiherero",
        "ia": "Interlingua",
        "id": "Bahasa Indonesia",
        "ie": "Originally called Occidental; then Interlingue after WWII",
        "ig": "Asụsụ Igbo",
        "ii": "ꆈꌠ꒿ Nuosuhxop",
        "ik": "Iñupiaq, Iñupiatun",
        "io": "Ido",
        "is": "Íslenska",
        "it": "Italiano",
        "iu": "ᐃᓄᒃᑎᑐᑦ",
        "ja": "日本語 (にほんご)",
        "jv": "ꦧꦱꦗꦮ, Basa Jawa",
        "ka": "ქართული",
        "kg": "Kikongo",
        "ki": "Gĩkũyũ",
        "kj": "Kuanyama",
        "kk": "қазақ тілі",
        "kl": "kalaallisut, kalaallit oqaasii",
        "km": "ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ",
        "kn": "ಕನ್ನಡ",
        "ko": "한국어",
        "kr": "Kanuri",
        "ks": "कश्मीरी, كشميري‎",
        "ku": "Kurdî, كوردی‎",
        "kv": "коми кыв",
        "kw": "Kernewek",
        "ky": "Кыргызча, Кыргыз тили",
        "la": "latine, lingua latina",
        "lb": "Lëtzebuergesch",
        "lg": "Luganda",
        "li": "Limburgs",
        "ln": "Lingála",
        "lo": "ພາສາລາວ",
        "lt": "lietuvių kalba",
        "lu": "Tshiluba",
        "lv": "latviešu valoda",
        "mg": "fiteny malagasy",
        "mh": "Kajin M̧ajeļ",
        "mi": "te reo Māori",
        "mk": "македонски јазик",
        "ml": "മലയാളം",
        "mn": "Монгол хэл",
        "mr": "मराठी",
        "ms": "bahasa Melayu, بهاس ملايو‎",
        "mt": "Malti",
        "my": "ဗမာစာ",
        "na": "Dorerin Naoero",
        "nb": "Norsk bokmål",
        "nd": "isiNdebele",
        "ne": "नेपाली",
        "ng": "Owambo",
        "nl": "Nederlands, Vlaams",
        "nn": "Norsk nynorsk",
        "no": "Norsk",
        "nr": "isiNdebele",
        "nv": "Diné bizaad",
        "ny": "chiCheŵa, chinyanja",
        "oc": "occitan, lenga d'òc",
        "oj": "ᐊᓂᔑᓈᐯᒧᐎᓐ",
        "om": "Afaan Oromoo",
        "or": "ଓଡ଼ିଆ",
        "os": "ирон æвзаг",
        "pa": "ਪੰਜਾਬੀ",
        "pi": "पाऴि",
        "pl": "język polski, polszczyzna",
        "ps": "پښتو",
        "pt": "Português",
        "qu": "Runa Simi, Kichwa",
        "rm": "rumantsch grischun",
        "rn": "Ikirundi",
        "ro": "Română",
        "ru": "Русский",
        "rw": "Ikinyarwanda",
        "sa": "संस्कृतम्",
        "sc": "sardu",
        "sd": "सिन्धी, سنڌي، سندھی‎",
        "se": "Davvisámegiella",
        "sg": "yângâ tî sängö",
        "si": "සිංහල",
        "sk": "slovenčina, slovenský jazyk",
        "sl": "slovenski jezik, slovenščina",
        "sm": "gagana fa'a Samoa",
        "sn": "chiShona",
        "so": "Soomaaliga, af Soomaali",
        "sq": "Shqip",
        "sr": "српски језик",
        "ss": "SiSwati",
        "st": "Sesotho",
        "su": "Basa Sunda",
        "sv": "svenska",
        "sw": "Kiswahili",
        "ta": "தமிழ்",
        "te": "తెలుగు",
        "tg": "тоҷикӣ, toçikī, تاجیکی‎",
        "th": "ไทย",
        "ti": "ትግርኛ",
        "tk": "Türkmen, Түркмен",
        "tl": "Wikang Tagalog",
        "tn": "Setswana",
        "to": "faka Tonga",
        "tr": "Türkçe",
        "ts": "Xitsonga",
        "tt": "татар теле, tatar tele",
        "tw": "Twi",
        "ty": "Reo Tahiti",
        "ug": "ئۇيغۇرچە‎, Uyghurche",
        "uk": "Українська",
        "ur": "اردو",
        "uz": "Oʻzbek, Ўзбек, أۇزبېك‎",
        "ve": "Tshivenḓa",
        "vi": "Tiếng Việt",
        "vo": "Volapük",
        "wa": "walon",
        "wo": "Wollof",
        "xh": "isiXhosa",
        "yi": "ייִדיש",
        "yo": "Yorùbá",
        "za": "Saɯ cueŋƅ, Saw cuengh",
        "zh": "中文 (Zhōngwén), 汉语, 漢語",
        "zu": "isiZulu"
    };

    private currentLang;
    private originals = {};
    private translations = {};


    /**
     *
     * @param services
     * @param {Object} config
     * @param {string} config.defaultLanguage
     * @param {Array<string>} config.supportedLanguages
     */
    constructor(services: Container, config) {
        this.currentLang = this.defaultLang = config.defaultLanguage;
        this.supportedLangs = config.supportedLanguages;

        this.i18n = services.get<I18n>(TYPES.I18n);
        this.theme = services.get<Theme>(TYPES.Theme);
        this.context = services.get<FormrContext>(TYPES.Context);

        //Editor Events
        this.context.on("dataGenerating", () => this.onDataGenerating());
        this.context.on("dataGenerated", data => this.onDataGenerated(data));

        //Renderer Events
        this.context.on("rendering", (data): void => this.onRendering(data));

    }

    /**
     * Editor
     */

    onDataGenerating(): void {
        this.changeLanguage(this.defaultLang);
    }

    onDataGenerated(data): void {
        data.translations = this.translations;
    }

    getMenuDom(): HTMLElement[] {
        const options = [];

        for (const lang of this.supportedLangs)
            options.push(`<option value="${lang}">${this.languageData[lang]}`);

        return [DOM.createElement({
            tag: "div",
            classes: ["feditor-button-vertical"],
            content: [
                `<svg width="20" height="20"><use xlink:href="#${LanguageIcon.id}"></use></svg>`,
                {
                    tag: "div",
                    classes: ["feditor-button-submenu"],
                    content: [
                        `<div>${this.i18n.localize("Change Language")}</div>`,
                        {
                            tag: "select",
                            classes: this.theme.getClasses("formr-select"),
                            content: options,
                            events: {onchange: (e): void => this.changeLanguage((e.target as HTMLSelectElement).value)}
                        }
                    ],
                    styles: {width: "250px"}
                }]
        })];
    }

    /**
     * Renderer
     */
    onRendering(data): void {
        if (!data.translations[this.defaultLang])
            return;

        for (const row of data.rows)
            for (const col of row.columns)
                for (const control of col.controls) {
                    if (data.translations[this.defaultLang][control.id])
                        lodash.merge(control, data.translations[this.defaultLang][control.id]);
                }
    }


    changeLanguage(lang): void {
        if (lang === this.currentLang)
            return;

        for (const control of this.context.Controls) {

            if (this.currentLang === "en")
                this.originals[control.id] = control.Data;
            else {
                if (!this.translations[this.currentLang])
                    this.translations[this.currentLang] = {};

                const diff = updatedDiff(this.originals[control.id], control.Data);
                if (!lodash.isEmpty(diff))
                    this.translations[this.currentLang][control.id] = diff
            }

            if (lang === this.defaultLang) {
                lodash.merge(control.config, this.originals[control.id]);
                control.refresh();
            } else if (this.translations[lang]) {
                lodash.merge(control.config, this.translations[lang][control.id]);
                control.refresh();
            }
        }

        this.currentLang = lang;
        console.log(`Editor language is now ${lang}`);
        console.log(this.translations);
    }
}