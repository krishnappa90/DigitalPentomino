/**
 * This utility class is used to parse the seed from the url/Qr-code to a Settings-object and back.
 * The seed contains all information in the settings-object in one string.
 * The settings-object contains all values of the game-settings in a plain two-level javascript-object.
 *
 * All parsing is based on the settings-schema defined in {@link SettingsSchema}.
 *
 * Central methods:
 * - {@link SettingsParser#parseSettingsFromSeed} parses settings-object to seed string
 * - {@link SettingsParser#parseSettingsToSeed} parses seed to settings-object
 * - ({@link SettingsParser#createDefaultSettingsObject} generates empty settings object)
 */
class SettingsParser {

    // --- --- --- Seed To Settings --- --- ---
    /**
     * Uses schema and seed to generate settings object
     * @param schema
     * @param seed
     * @returns {object | null}
     */
    static parseSettingsFromSeed(schema, seed) {
        let settings = {};
        let visibility = new SettingsVisibility();

        settings.teachersMode = seed[0] === "1";

        let remainingSeed = String(seed.substr(1, seed.length));

        let lastElement;

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            settings[heading] = {};
            let settingsEntry = settings[heading];
            for (let key in subSettings) {
                let schemaEntry = subSettings[key];

                switch (schemaEntry.type) {
                    case "string":
                        if (heading === "prefilling" && settings.hasOwnProperty("prefilling") &&
                            settings.prefilling.hasOwnProperty("prefillingStrategy")) {
                            let strat = settings.prefilling.prefillingStrategy;
                            schemaEntry.enumText = schemaEntry._enumText[strat];
                        }
                        lastElement = SettingsParser.parseStringFromSeed(schemaEntry, remainingSeed, settingsEntry, key, seed);
                        break;
                    case "number":
                        lastElement = SettingsParser.parseNumberFromSeed(schemaEntry, remainingSeed, settingsEntry, key, seed);
                        break;
                    case "integer":
                        lastElement = SettingsParser.parseIntegerFromSeed(schemaEntry, remainingSeed, settingsEntry, key, seed);
                        break;
                    case "boolean":
                        lastElement = SettingsParser.parseBooleanFromSeed(schemaEntry, remainingSeed, settingsEntry, key, seed);
                        break;
                    case "custom":
                        let customSettingsEntry = CustomSettingsEntrySingleton.getInstance().get(heading, key);
                        lastElement = customSettingsEntry.parseFromSeed(schemaEntry, remainingSeed, settingsEntry, key, seed);
                        break;
                    case "array":
                    case "object":
                        throw new Error("Unsupported type: " + schemaEntry.type);
                    default:
                        throw new Error("Unknown type: " + schemaEntry.type);
                }

                if (lastElement === null) {
                    return null;
                }

                // console.log(remainingSeed.substr(0, lastElement + 2) + "_" + remainingSeed.substr(lastElement + 2, remainingSeed.length) + ": " + heading + "." + key);
                remainingSeed = remainingSeed.substr(lastElement + 1, remainingSeed.length);

                switch (remainingSeed[0]) {
                    case "0":
                        visibility.setVisible(heading, key, false);
                        break;
                    case "1":
                        visibility.setVisible(heading, key, true);
                        break;
                    default:
                        console.error(heading + "." + key + ": Unknown visibility qualifier: " + remainingSeed[0]);
                        return null;
                }

                remainingSeed = remainingSeed.substr(1, remainingSeed.length);
            }
        }

        settings.visibility = visibility;

        SettingsParser.applyNumericalLanguageRepr(settings);
        return settings;
    }

    static parseBooleanFromSeed(schemaEntry, remainingSeed, settings, key, seed) {
        if (remainingSeed.length < 1) {
            console.warn("Parsing seed " + seed + " key '" + key + "' encountered empty seed");
            return null;
        }

        if (remainingSeed[0] === "0") {
            settings[key] = false;
        } else if (remainingSeed[0] === "1") {
            settings[key] = true;
        } else {
            console.warn("Parsing seed " + seed + ": Key '" + key + "' expected boolean value. Actual: " + remainingSeed[0]);
            return null;
        }

        return 0;
    }

    static parseStringFromSeed(schemaEntry, remainingSeed, settings, key, seed) {
        let numOfDigits = SettingsParser.getNumOfDigits(schemaEntry.enum.length);
        if (remainingSeed.length < numOfDigits) {
            console.warn("Parsing seed " + seed + " key '" + key + "' encountered too short seed");
            return null;
        }

        let subStr = remainingSeed.substr(0, numOfDigits);
        let index = parseInt(subStr, 10);
        if (isNaN(index) || index < 0) {
            console.warn("Parsing seed " + seed + " key '" + key + "' expected string enum index. Actual: " + subStr);
            return null;
        }
        if (index > schemaEntry.enum.length) {
            console.warn("Parsing seed " + seed + " key '" + key + "' index " + index + " out of enum bound. enum: '" + schemaEntry.enum + "'");
            return null;
        }
        settings[key] = schemaEntry.enum[index];
        return numOfDigits - 1;
    }

    static parseIntegerFromSeed(schemaEntry, remainingSeed, settings, key, seed) {
        let minimum = schemaEntry.minimum;
        let maximum = schemaEntry.maximum;
        let numOfDigits = SettingsParser.getNumOfDigits(maximum - minimum);
        if (remainingSeed.length < numOfDigits) {
            console.warn("Parsing seed " + seed + " key '" + key + "' encountered too short seed. Expected length: " + numOfDigits);
            return null;
        }
        let subStr = remainingSeed.substr(0, numOfDigits);
        let seedValue = parseInt(subStr);
        if (isNaN(seedValue) || seedValue < 0) {
            console.warn("Parsing seed " + seed + " key '" + key + "' expected unsigned integer. Actual: " + subStr);
            return null;
        }
        let actualValue = seedValue + minimum;
        if (actualValue > maximum) {
            console.warn("Parsing seed " + seed + " key '" + key + "' expected value below " + maximum + ". Actual: " + actualValue + " Raw data: " + subStr);
            return null;
        }
        settings[key] = actualValue;
        return numOfDigits - 1;
    }

    static parseNumberFromSeed(schemaEntry, remainingSeed, settings, key, seed) {
        let minimum = schemaEntry.minimum;
        let maximum = schemaEntry.maximum;

        let numOfPreDecimals = SettingsParser.getNumOfDigits(maximum - minimum);
        let numOfDecimals = schemaEntry.decimals;
        if (numOfDecimals === 0) {
            return SettingsParser.parseIntegerFromSeed(schemaEntry, remainingSeed, settings, key, seed);
        }
        let entryLength = numOfPreDecimals + numOfDecimals;
        if (remainingSeed.length < entryLength) {
            console.warn("Parsing seed " + seed + " key '" + key + "' encountered too short seed. Expected length: " + entryLength);
            return null;
        }
        let subStr = remainingSeed.substr(0, entryLength);
        let valueStr = SettingsParser.insertCharAtPosition(subStr, ".", numOfPreDecimals);
        let seedValue = parseFloat(valueStr);
        if (isNaN(seedValue) || seedValue < 0) {
            console.warn("Parsing seed " + seed + " key '" + key + "' expected unsigned number. Actual: " + valueStr + ". Raw data: " + subStr);
            return null;
        }
        let actualValue = seedValue + minimum;
        if (actualValue > maximum) {
            console.warn("Parsing seed " + seed + " key '" + key + "' expected value below " + maximum + ". Actual: " + actualValue + " (Raw data: " + subStr + ")");
            return null;
        }
        settings[key] = actualValue;

        return entryLength - 1;
    }

    static insertCharAtPosition(strA, strB, pos) {
        return [strA.slice(0, pos), strB, strA.slice(pos)].join('');
    }

    // --- --- --- Settings To Seed --- --- ---
    /**
     * Takes as input the settings schema and an actual instance and returns a seed
     * @param schema
     * @param settings
     */
    static parseSettingsToSeed(schema, settings) {
        SettingsParser.revertNumericalLanguageRepr(settings);

        let seed = (settings.teachersMode ? 1 : 2).toString();

        let visibility = settings.visibility;

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            for (let key in subSettings) {
                let schemaEntry = subSettings[key];
                let settingsValue = settings[heading][key];

                switch (schemaEntry.type) {
                    case "string":
                        seed += SettingsParser.parseStringToSeed(schemaEntry, settingsValue);
                        break;
                    case "number":
                        seed += SettingsParser.parseNumberToSeed(schemaEntry, settingsValue);
                        break;
                    case "integer":
                        seed += SettingsParser.parseIntegerToSeed(schemaEntry, settingsValue);
                        break;
                    case "boolean":
                        seed += SettingsParser.parseBooleanToSeed(schemaEntry, settingsValue);
                        break;
                    case "custom":
                        let customSettingsEntry = CustomSettingsEntrySingleton.getInstance().get(heading, key);
                        seed += customSettingsEntry.parseSettingsToSeed(schemaEntry, settingsValue);
                        break;
                    case "array": case "object":
                        throw new Error("Unsupported type: " + schemaEntry.type);
                    default:
                        throw new Error("Unknown type: " + schemaEntry.type);
                }

                seed += visibility.isVisible(heading, key) === true ? 1 : 0;
                // console.log(seed + ": " + heading + "." + key);
            }
        }

        SettingsParser.applyNumericalLanguageRepr(settings);

        return seed;
    }

    static parseStringToSeed(schemaEntry, settingsValue) {
        let possibleValues = schemaEntry.enum;
        if (possibleValues === undefined) {
            throw new Error("Parse Error: settings schema entry " + schemaEntry + " is of type string but doesn't have a minimum entry");
        }
        return possibleValues.findIndex(v => v === settingsValue);
    }

    static parseNumberToSeed(schemaEntry, settingsValue) {
        let minimum = schemaEntry.minimum;
        if (minimum === undefined) {
            throw new Error("Settings schema entry " + schemaEntry + " is of type number but doesn't have a minimum entry");
        }
        let maximum = schemaEntry.maximum;
        if (maximum === undefined) {
            throw new Error("Settings schema entry " + schemaEntry + " is of type number but doesn't have a maximum entry");
        }
        let numOfDecimals = schemaEntry.decimals;
        if (numOfDecimals === undefined) {
            throw new Error("Settings schema entry " + schemaEntry + " is of type number but doesn't have a maximum decimals");
        }

        let seedValue = settingsValue - minimum;

        return seedValue.toFixed(numOfDecimals).split(".").join("");
    }

    static parseIntegerToSeed(schemaEntry, settingsValue) {
        let minimum = schemaEntry.minimum;
        if (minimum === undefined) {
            throw new Error("Settings schema entry " + schemaEntry + " is of type integer but doesn't have a minimum entry");
        }
        let maximum = schemaEntry.maximum;
        if (maximum === undefined) {
            throw new Error("Settings schema entry " + schemaEntry + " is of type integer but doesn't have a maximum entry");
        }
        return StartPosSettingsEntry.pad(settingsValue - minimum, SettingsParser.getNumOfDigits(maximum - minimum));
    }

    static parseBooleanToSeed(schemaEntry, settingsValue) {
        return settingsValue === true ? 1 : 0;
    }

    // --- --- --- Create Empty Settings Object --- --- ---
    /**
     * Creates a new {@link Settings} object based on the default values in {@link SettingsSchema}.
     * @param schema
     * @returns {{}}
     */
    static createDefaultSettingsObject(schema) {
        let settings = {};
        settings.visibility = new SettingsVisibility();
        settings.teachersMode = true;
        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            settings[heading] = {};
            for (let key in subSettings) {
                settings[heading][key] = schema[heading].properties[key].default;
                let headingVisible = schema[heading].pupilModeVisibleOnDefault;
                let subheadingVisible = schema[heading].properties[key].pupilModeVisibleOnDefault;
                let isVisible = !(headingVisible === false) && !(subheadingVisible === false)
                    && !(headingVisible === undefined && subheadingVisible === undefined);
                settings.visibility.setVisible(heading, key, isVisible);
            }
        }
        SettingsParser.applyNumericalLanguageRepr(settings);
        return settings;
    }

    // --- --- --- Language Representation Transformation --- --- ---
    static applyNumericalLanguageRepr(settings) {
        let selectedLanguage = settings.general.language;
        let selectedLanguageNum = null;
        if (selectedLanguage === "en") {
            selectedLanguageNum = baseConfigs.languages.ENGLISH;
        } else if (selectedLanguage === "de") {
            selectedLanguageNum = baseConfigs.languages.GERMAN;
        }

        if (!(selectedLanguageNum === null)) settings.general.language = selectedLanguageNum;
    }

    static revertNumericalLanguageRepr(settings) {
        let selectedLangNum = settings.general.language;
        let selectedLang = null;
        if (selectedLangNum === baseConfigs.languages.ENGLISH) {
            selectedLang = "en";
        } else if (selectedLangNum === baseConfigs.languages.GERMAN) {
            selectedLang = "de";
        }
        if (!(selectedLang === null)) settings.general.language = selectedLang;
    }

    // --- --- --- Compare Settings Object --- --- ---
    static compareSettings(schema, settingsA, settingsB) {
        let result = [];

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            for (let key in subSettings) {
                if (settingsB === null || settingsA === null || !(settingsA[heading][key] === settingsB[heading][key])) {
                    result.push({
                        heading: heading,
                        key: key
                    });
                }
            }
        }
        return result;
    }

    // --- --- --- Helper --- --- ---
    static getNumOfDigits(number) {
        return Math.floor(Math.log10(number) + 1);
    }
}

if (typeof module != 'undefined') {
    module.exports = SettingsParser;
}
