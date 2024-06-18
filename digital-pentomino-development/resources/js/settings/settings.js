const SettingsSingleton = (function () {
    let instance;

    function createInstance() {
        return new Settings();
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

/**
 * A singleton to access the Settings-object. The Settings-object is a simple two-level key-value pair, which
 * contains all values of the current settings. The structure of the Settings-object is defined in {@link SettingsSchema}.
 * The type of the values in the settings-object correspond to the type defined in the {@link SettingsSchema}.
 * The value of a heading and a subheading can be accessed with
 *
 * SettingsSingleton.getInstance().getSettings().heading.subheading
 *
 * A heading and its subheading form a pair which is unique in the settings object.
 */
class Settings {
    constructor() {
        let urlParams = new URLSearchParams(window.location.search);
        let querySeed = urlParams.get(baseConfigs.seedUrlParamName);
        let schema = SettingsSchemaSingleton.getInstance().createSchema();
        if (querySeed === null) {
            console.info("Url param seed not found. Use default settings object");
            this._settings = SettingsParser.createDefaultSettingsObject(schema);
        } else {
            this._settings = SettingsParser.parseSettingsFromSeed(schema, querySeed);
            if (this._settings === null) {
                console.error("Invalid seed. Use default settings object");
                this._settings = SettingsParser.createDefaultSettingsObject(schema);
            }
        }
    }

    /**
     * The settings values of the current global settings object are overwritten with the values by the new settings
     * object.
     *
     * **IMPORTANT**: Deep copy, the settings-object given as parameter will not be the new global settings object and
     * thus changes are not reflected.
     * @param settings
     */
    setSettings(settings) {
        let schema = SettingsSchemaSingleton.getInstance().getSettingsSchema();
        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            this._settings[heading] = {};
            for (let key in subSettings) {
                this._settings[heading][key] = settings[heading][key];
            }
        }
        this._settings.visibility = jQuery.extend(true, new SettingsVisibility(), settings.visibility);
        this._settings.teachersMode = settings.teachersMode;
    }

    /**
     * Get the current global settings.
     * @returns {Object|null|{}|*}
     */
    getSettings() {
        return this._settings;
    }
}
