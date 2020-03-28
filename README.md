# formr
_Formr is in the very early stages of development. Please be kind, and lend a hand if you can!_

### Friendly warning to my friends writing R, this is not the repo you are looking for.

Formr is a multilingual, vanilla JS form builder and renderer. It is written in TypeScript.
Formr is influenced by the amazing work of the folks at [Draggable](https://github.com/Draggable/formeo).

## [Demo](https://matthew798.github.io/formr/demo.html)

Current Features:
- Row/column based WYSIWYG form editor
- Build forms that translate to the client's language
- Themeable
- Multilingual editor interface
- Written in TypeScript
- Requires no dependencies to be loaded
- Supported by all major browsers, and IE11 (with a few polyfills)

Future Features:
- Form logic (smart forms)
- Form validation

## Contents
- [Usage](#usage)
- [Editor Configuration](#editor-configuration)
- [Renderer Configuration](#renderer-configuration)
- [Themes](#themes)
- [I18N](#i18n)
- [Form Languages](#form-languages)
- [Plugins](#plugins)

## Usage
Start by including the necessary JS and CSS files:
```html
<link rel="stylesheet" href="/..../formr-editor.css" />
<link rel="stylesheet" href="/..../formr-renderer.css" />

<script src="../dist/js/formr.bundle.js"></script>
```

Initialize the editor:
```javascript
const editor = new Formr.Editor(container, config, data);
```
or the renderer:
```javascript
const renderer = new Formr.Renderer(container, config, data);
```
- `container` is either an `HTMLElement` or a valid selector.
- `config` is an object containing the instance configuration data
- `data` is optional, and contains form data to be pre-loaded and displayed once the instance is ready.

Both the `Editor` and the `Renderer` return a `Promise` that will `Resolve()` when the instance is ready to be used:
```javascript
await editor.promise;
await renderer.promise;
```

## Editor Configuration:
The editor is configured by passing an object via the `config` argument of the constructor.
```js
config = {
    theme: {
        name: "bootstrap", 
        prefix: "/prefix/to/theme/files/",
        data: "see themes below"
    },
    i18n: {
        name: "FR",
        prefix: "/prefix/to/i18n/files/",
        data: "see i18n below"
    },
    plugins: {
        [FormrPlugins.SuperPlugin,; {...}],
        FormrPlugins.UltraPlugin;
    }
}
```

## Renderer Configuration
The renderer is configured by passing an object via the `config` argument of the constructor.
```js
config = {
    theme: {
        name: "bootstrap", 
        prefix: "/prefix/to/theme/files/",
        data: "see themes below"
    },
    plugins: {
        [FormrPlugins.SuperPlugin,; {...}],
        FormrPlugins.UltraPlugin;
    }
}
```

Notice that both the editor and renderer share much of their configurations.

## Themes
Formr supports themes. Themes are implemented in JSON files and can either be fetched on-load, or passed in the config
of the instance, or both. If both an anonymous object and a remote file are provided, the two will be merged. 
Themes are composed of an object of key-value pairs where the `key` is the class of the element being created and the
`value` is an array of classes to be added to that element.

### Theme config object
- `name` defines the name of the file to load. ex: if name is "bootstrap", then the file "bootstrap.json" will be loaded
- `prefix` defines the path to the theme file. In the example config above, the file "/prefix/to/theme/files/bootstrap.json" will be loaded
- `data` is optional, and allows you to provide the theme data as an object directly in the configuration. This avoids an extra HTTP request, but for larger themes can be unmaintainable.

### Theme usage example:
```js
this.theme.getClasses("element-type");
```
- If a theme file or object was loaded, then the `value` (array of strings) associated with the `key` "element-type" 
will be returned
- If no language file or object was loaded, or the `key` doesn't exist, an empty array is returned.

### Example of a theme file:
```json
{
  "formr-control": ["form-group"],
  "formr-input": ["form-control"],
  "formr-help": ["form-text", "text-muted"]
}
```
When either the editor or the renderer are displayed, any elements of class `formr-control` will also have `form-group`.

## I18N
I18N is implemented the same way as themes. The `key` is the text that will be displayed in the default language (EN).
`value` is what will be displayed instead of `key`.

### I18N config object
- `name` defines the name of the file to load. ex: if name is "EN", then the file "EN.json" will be loaded
- `prefix` defines the path to the theme file. In the example config above, the file "/prefix/to/theme/files/EN.json" will be loaded
- `data` is optional, and allows you to provide the I18N data as an object directly in the configuration. This avoids an extra HTTP request, but for larger files can be unmaintainable.

### I18N usage example:
```js
this.i18n.localize("String to Localize");
```
- If a language file or object was loaded, then the `key` associated with "String to Localize" will be displayed
- If no language file or object was loaded, or the `key` doesn't exist, the `key` is displayed as-is.

### Example of a language file:
```json
{
  "Add Row": "Ajouter Rangée",
  "Change Language": "Selectionner Langue",
  "Add Column": "Ajouter Colonne"
}
```

## Multilingual Form
Formr allows you to translate your forms. This is achieved with the Translation plugin. Creating a multilingual form is
pretty simple:

1. Add the plugin to the editor's config:
```js
{
    [FormrPlugins.TranslationPlugin, {defaultLanguage: 'en', supportedLanguages: ['en', 'fr']}]
}
```
2. Design your form in the default language. The default language would be whatever language you want displayed in the
event a user requests a language that is not implemented.
3. Hover the globe icon added to the menu by the Translation plugin and select the next language you want to work on.
4. Translate your form!

Translations are stored in a `traslations` object added to the form data when you get `editor.Data`. In an effort to keep
the extra data as small as possible, only the *differences* are kept. That means that if you forget to translate an input's
label, it will show up in the default language while the rest of the form will be translated.

## Plugins
Both `FormrEditor` and `FormrRenderer` are event emitters. Plugins can subscribe to these events to influence the outcome
of certain actions.

### Editor Events
- `init` is fired before the editor's DOM is created and the config and data are loaded.
- `initDone` is fired once the editor has been applied to the DOM and is ready to use. You should *not* use this event
to determine when the editor is ready but rather `await editor.promise`.
- `dataGenerating` is fired before form data is generated. Use this event to manipulate form elements before `getData()` is called.
- `dataGenerated(data)` is fired after form data has been generated. Use this to manipulate the generated data.

### Renderer Events
- `init` is fired before the renderer's DOM is created and the config and data are loaded.
- `initDone` is fired once the renderer has been applied to the DOM and is ready to use. You should *not* use this event
to determine when the renderer is ready but rather `await renderer.promise`.
- `rendering(data)` is fired before form data is rendered. Use this to manipulate the form data before displaying it.
- `renderer` is fired after rendering. Use this to manipulate the rendered form.

### Plugin structure
Plugins can be designed 2 different ways; one plugin for both the renderer and editor, or one each. The following rules
must be respected:
- Editor plugins must `implement EditorPlugin` interface, and renderer plugins must `implement RendererPlugin`
- A plugin's constructor must accept 1 or 2 arguments. `constructor(services: Container, config: any = null)`:
    - `services` is an `Inverisy.Container` (a DI container) and can be used to fetch any of the services made available 
    to the editor. For example, a plugin could make use of the `Theme` object in the container to apply classes from the loaded theme
    - `config` is an optional anonymous object that can be used to hold arbitrary config data for your plugin. Place anything
    your plugin needs to get going in here.
    
See the `TranslationPlugin` in the source as en example.

Plugins are added to the editor/renderer by placing them in the `plugins` object of the `config`:
```js
config = {
    ...
    plugins;: {
        [PluginConstructor;: EdiotorPlugin|RendererPlugin, PluginConfig;: any;], //This plugin will be passed `PluginConfig`
        PluginConstructor //This plugin will only get the DI container
    }
}
```

### Building a plugin
If building the project with `npm run build dev|prod`, any files ending in ".Plugin.ts" in "src/plugins" will be compiled
into the `FormrPlugins` library.

If you'd rather build your plugin separately, you need only `implement` the required interfaces.

## What am I working on now?
### Form logic
Form designers will be able to define custom logic based on user input such as hiding sections, changing styling, messages, etc
### Form validation
Formr will support powerful form validation features like error messages, regex validation, remote validation, etc

## Open Source
I've benefited from the open source community since my early days learning HTML. I am committed to providing Formr completely
free of charge and with the least restrictive licence I am comfortable with. I will never charge for formr, I ask only that
if you feel formr could be better, get in touch and let me know, or better yet, submit a pull request!

Special thanks to the wonderful people at Jetbrains for supporting open source projects with their software!

![alt text](./docs/images/webstorm_logo.svg)