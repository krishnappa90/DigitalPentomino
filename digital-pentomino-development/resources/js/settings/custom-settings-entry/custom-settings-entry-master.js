/**
 * Singleton, which can be used to access a class of type {@link CustomSettingsEntryMaster}, which manages all
 * registered custom settings entries.
 * @returns {CustomSettingsEntryMaster}
 */
const CustomSettingsEntrySingleton = (function () {
    let instance;

    function createInstance() {
        return new CustomSettingsEntryMaster();
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
 * A class which manages all custom setting entries. An entries can be added by registering a handlers in the
 * constructor. A handler is implemented by inheriting from the superclass {@link CustomSettingsEntry}.
 *
 * The singleton get be used anywhere to {@link #get} an entry by its respective name.
 */
class CustomSettingsEntryMaster {
    constructor() {
        this.customSettingsEntries = {};

        // register handlers
        this.addEntry(new StartPosSettingsEntry("boardCustomization", "initialPiecePos"));
    }

    /**
     * Adds new handler. Not to be called from outside. New entries are registered in the constructor by this function.
     * @param newEntry
     */
    addEntry(newEntry) {
        if (this.customSettingsEntries[newEntry.getName()] === undefined) {
            this.customSettingsEntries[newEntry.getName()] = newEntry;
        } else {
            console.error("Custom settings entry already defined: " + newEntry.getName());
        }
    }

    /**
     * Returns custom settings entry with the specified name.
     * @param heading
     * @param subheading
     * @returns {CustomSettingsEntry}
     */
    get(heading, subheading) {
        let name = SettingsForm.generateSettingsEntryName(heading, subheading);
        if (this.customSettingsEntries[name] === undefined) {
            console.error("Custom settings entry undefined: " + name);
        }

        return this.customSettingsEntries[name];
    }

    /**
     * returns an array of all registered custom settings entries.
     * @returns {[CustomSettingsEntry]}
     */
    getAll() {
        return Object.values(this.customSettingsEntries);
    }
}
