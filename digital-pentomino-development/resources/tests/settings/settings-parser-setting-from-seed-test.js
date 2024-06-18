let assert = require('chai').assert;

let SettingsParser = require('../../js/settings/settings-parser.js');

let settingsSchemaBoolean = {
    hinting: {
        type: "object",
        title: "Hinting",
        "properties": {
            skillTeaching: {
                type: 'boolean',
                title: 'Skill Teaching'
            }
        }
    }
};

let settingBoolean = {
    hinting: {
        skillTeaching: true
    }
};

let settingsSchemaString = {
    hinting: {
        type: "object",
        title: "Hinting",
        "properties": {
            hintingStrategy: {
                "type": "string",
                "enum": ["full", "partial", "another"],
                "title": "Hinting Strategy",
                "description": "Please pick a hinting strategy"
            }
        }
    }
};

let settingString = {
    hinting: {
        hintingStrategy: "full"
    }
};

let settingsSchemaNumber = {
    hinting: {
        type: "object",
        title: "Hinting",
        "properties": {
            euclideanPrefillingDistance: {
                type: "number",
                title: "Prefilling: Euclidian Prefilling Distance",
                decimals: 2,
                maximum: 10.5,
                minimum: 1.0
            }
        }
    }
};

let settingNumber = {
    hinting: {
        euclideanPrefillingDistance: 4.5
    }
};

let settingsSchemaInteger = {
    hinting: {
        type: "object",
        title: "Hinting",
        "properties": {
            startLevel: {
                type: "integer",
                title: "Id of start level",
                maximum: 5,
                minimum: 3
            }
        }
    }
};

let settingInteger = {
    hinting: {
        startLevel: 4
    }
};

let settingsSchemaMixed = {
    hinting: {
        type: "object",
        title: "Hinting",
        "properties": {
            skillTeaching: {
                type: 'boolean',
                title: 'Skill Teaching'
            },
            startLevel: {
                type: "integer",
                title: "Id of start level",
                maximum: 5,
                minimum: 3
            },
            euclideanPrefillingDistance: {
                type: "number",
                title: "Prefilling: Euclidian Prefilling Distance",
                decimals: 2,
                maximum: 10.5,
                minimum: 1.0
            },
            hintingStrategy: {
                "type": "string",
                "enum": ["full", "partial", "another"],
                "title": "Hinting Strategy",
                "description": "Please pick a hinting strategy"
            }
        }
    }
};

let settingsMixed = {
    hinting: {
        skillTeaching: true,
        startLevel: 5,
        euclideanPrefillingDistance: 3.66,
        hintingStrategy: "another"
    }
};

describe('SettingsParser.parseSettingsFromSeed(schema, values)', function() {

    it('should generate settings from schema which contains entry of type boolean', function () {
        assert.deepEqual(SettingsParser.parseSettingsFromSeed(settingsSchemaBoolean, "1"), settingBoolean);
    });

    it('should generate settings from schema which contains string entry', function () {
        assert.deepEqual(SettingsParser.parseSettingsFromSeed(settingsSchemaString, "0"), settingString);
    });

    it('should generate settings from schema which contains number entry', function () {
        assert.deepEqual(SettingsParser.parseSettingsFromSeed(settingsSchemaNumber, "350"), settingNumber);
    });

    it('should generate settings from schema which contains integer entry', function () {
        assert.deepEqual(SettingsParser.parseSettingsFromSeed(settingsSchemaInteger, "1"), settingInteger);
    });

    it('should generate settings from schema that combines several types', function () {
        assert.deepEqual(SettingsParser.parseSettingsFromSeed(settingsSchemaMixed, "122662"), settingsMixed);
    });
});
