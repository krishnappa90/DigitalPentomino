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

describe('SettingsParser.parseSettingsToSeed(schema, values)', function() {

    it('should parse schema which contains entry of type boolean', function () {
        assert.strictEqual(SettingsParser.parseSettingsToSeed(settingsSchemaBoolean, settingBoolean), "1");
    });

    it('should parse schema which contains string entry', function () {
        assert.strictEqual(SettingsParser.parseSettingsToSeed(settingsSchemaString, settingString), "0");
    });

    it('should parse schema which contains number entry', function () {
        assert.strictEqual(SettingsParser.parseSettingsToSeed(settingsSchemaNumber, settingNumber), "350");
    });

    it('should parse schema which contains integer entry', function () {
        assert.strictEqual(SettingsParser.parseSettingsToSeed(settingsSchemaInteger, settingInteger), "1");
    });

    it('should parse a schema that combines several types', function () {
        assert.strictEqual(SettingsParser.parseSettingsToSeed(settingsSchemaMixed, settingsMixed), "122662");
    });
});
