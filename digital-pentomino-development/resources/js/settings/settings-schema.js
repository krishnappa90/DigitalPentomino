/**
 * Singleton to access global {@link SettingsSchema}-object.
 * @type {{getInstance: (function(): SettingsSchema)}}
 */
const SettingsSchemaSingleton = (function () {
    let instance;

    function createInstance() {
        return new SettingsSchema();
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
 * Class which can be used to create a settings-schema-object, which is the schema for the app-settings.
 * The class contains a getter to get the current settings-schema-object.
 * A new settings-schema-object is created when the language changes.
 * The default value is set in {@link baseConfigs}.
 *
 * Rules for declaring a settings schema entry:
 *  - entries of type string only with enum specified
 *  - number entries only with minimum and maximum specified
 *  - Only depth of one supported
 *  - Numbers must contain an entry 'decimals', which specifies the number of decimals
 *  - Default attribute is mandatory
 *  - Texts of enums can be defined with the enumText attribute
 */
class SettingsSchema {
    constructor() {
        this._language = baseConfigs.defaultLanguage;
        this._schema = this.createSchema();
    }

    /**
     * Returns the current settings schema or a new schema object if the language changed in the meantime.
     * @returns {{general: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {initiateActionsIfUserNotActive: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, hintingLevels: {default: string, description: string, pupilModeVisibleOnDefault: boolean, type: string, title: string, enumText: string[], enum: string[]}, language: {imgPaths: string[], default: string, type: string, title: string, enumText: string[], enum: string[]}, enableAudio: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, enableBird: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, enableBgMusic: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}}}, hinting: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {maxPartialHintingCells: {default: number, description: string, maximum: number, step: number, type: string, title: string, exclusiveMinimum: boolean, minimum: number}, showNumberOfPossibleSolutions: {default: boolean, description: string, type: string, title: string}, hintingVariants: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, partialHintingStragety: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, skillTeaching: {default: boolean, description: string, type: string, title: string}, typeOfHints: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, enableHinting: {default: boolean, description: string, type: string, title: string}, hintingStrategy: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, exactHints: {default: boolean, description: string, type: string, title: string}}}, prefilling: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {prefillingStrategy: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, distanceValue: {default: string, _enumText: {pieces: [[string], [string], [string], [string]], distance: [[string], [string], [string], [string]]}, type: string, title: string, enumText: [], enum: string[]}, fixPieces: {default: boolean, description: string, type: string, title: string}, enablePrefilling: {default: boolean, description: string, type: string, title: string}}}, speech: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {enableSpeech: {default: boolean, description: string, type: string, title: string}}}, splitPartition: {visible: boolean, advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {splitStrategy: {default: string, type: string, title: string, enumText: string[], enum: string[]}, fixPieces: {default: boolean, description: string, type: string, title: string}}}, autohinting: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {timeForNoAction: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, showOrHideButtonsForTextualHints: {default: boolean, description: string, type: string, title: string}, enableTimePeriodBasedAutoHintInAnyCase: {default: boolean, description: string, type: string, title: [string]|[string]}, typeOfHints: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, enableAutoHinting: {default: boolean, type: string, title: string}, autoHintVariants: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, numberOfWrongMoves: {default: number, description: string, maximum: number, step: number, type: string, title: string, exclusiveMinimum: boolean, minimum: number}}}, theming: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {theme: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}}}, boardCustomization: {visible: boolean, advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {initialPiecePos: {default: *, visible: boolean, description: string, type: string, title: string}, includePiecePos: {default: boolean, visible: boolean, description: string, type: string, title: string}}}}}
     */
    getSettingsSchema() {
        if(this._language == SettingsSingleton.getInstance().getSettings().general.language)
            return this._schema;
        else {
            this._language = SettingsSingleton.getInstance().getSettings().general.language;
            return this.createSchema();
        }
    }

    /**
     * Creates a new settings-schema. **IMPORTANT** Not to be called from outside for efficiency reasons.
     * @returns {{general: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {initiateActionsIfUserNotActive: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, hintingLevels: {default: string, description: string, pupilModeVisibleOnDefault: boolean, type: string, title: string, enumText: string[], enum: string[]}, language: {imgPaths: string[], default: string, type: string, title: string, enumText: string[], enum: string[]}, enableAudio: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, enableBird: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}, enableBgMusic: {default: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string}}}, hinting: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {maxPartialHintingCells: {default: number, description: string, maximum: number, step: number, type: string, title: string, exclusiveMinimum: boolean, minimum: number}, showNumberOfPossibleSolutions: {default: boolean, description: string, type: string, title: string}, hintingVariants: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, partialHintingStragety: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, skillTeaching: {default: boolean, description: string, type: string, title: string}, typeOfHints: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, enableHinting: {default: boolean, description: string, type: string, title: string}, hintingStrategy: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, exactHints: {default: boolean, description: string, type: string, title: string}}}, prefilling: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {prefillingStrategy: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, distanceValue: {default: string, _enumText: {pieces: [[string], [string], [string], [string]], distance: [[string], [string], [string], [string]]}, type: string, title: string, enumText: *[], enum: string[]}, fixPieces: {default: boolean, description: string, type: string, title: string}, enablePrefilling: {default: boolean, description: string, type: string, title: string}}}, speech: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {enableSpeech: {default: boolean, description: string, type: string, title: string}}}, splitPartition: {visible: boolean, advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {splitStrategy: {default: string, type: string, title: string, enumText: string[], enum: string[]}, fixPieces: {default: boolean, description: string, type: string, title: string}}}, autohinting: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {timeForNoAction: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, showOrHideButtonsForTextualHints: {default: boolean, description: string, type: string, title: string}, enableTimePeriodBasedAutoHintInAnyCase: {default: boolean, description: string, type: string, title: ([string]|[string])}, typeOfHints: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, enableAutoHinting: {default: boolean, type: string, title: string}, autoHintVariants: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}, numberOfWrongMoves: {default: number, description: string, maximum: number, step: number, type: string, title: string, exclusiveMinimum: boolean, minimum: number}}}, theming: {advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {theme: {default: string, description: string, type: string, title: string, enumText: string[], enum: string[]}}}, boardCustomization: {visible: boolean, advanced: boolean, pupilModeVisibleOnDefault: boolean, type: string, title: string, properties: {initialPiecePos: {default: *, visible: boolean, description: string, type: string, title: string}, includePiecePos: {default: boolean, visible: boolean, description: string, type: string, title: string}}}}}
     */
    createSchema() {
        let lang = this._language;
        let titles = strings.settings;

        let defaultBoardIndex = StartPosSettingsEntry.parseBoardNameToIndex("board_6x10");
        let boardCustomizationDefault = StartPosSettingsEntry.pad(defaultBoardIndex, StartPosSettingsEntry.getBoardNameDecimals()) +
            StartPosSettingsEntry.pad(0, BOARD_PENTOMINO_NUM_DECIMALS);

        return this._schema = {
            general: {
                "type": "object",
                "title": titles.general.title[lang],
                "advanced": false,
                "pupilModeVisibleOnDefault": true,
                "properties": {
                    language: {
                        "type": "string",
                        "title": titles.general.language.title[lang],
                        "enum": ["en", "de"],
                        "enumText": titles.general.language.enumTitles[lang],
                        "imgPaths": ["resources/images/icons/flag_of_the_united_kingdom_200px.png",
                            "resources/images/icons/flag_of_germany_200px.png"],
                        "default": "en"
                    },
                    enableAudio: {
                        "type": "boolean",
                        "title": titles.general.enableAudio.title[lang],
                        "default": false,
                        "pupilModeVisibleOnDefault": false
                    },
                    enableBgMusic: {
                        "type": "boolean",
                        "title": titles.general.enableBgMusic.title[lang],
                        "default": false,
                        "pupilModeVisibleOnDefault": false
                    },
                    enableBird: {
                        "type": "boolean",
                        "title": titles.general.enableBird.title[lang],
                        "default": true,
                        "pupilModeVisibleOnDefault": false
                    },
                    hintingLevels: {
                        "type": "string",
                        "title": titles.hinting.hintingLevels.title[lang],
                        "description": titles.hinting.hintingLevels.description[lang],
                        "enum": ["Easy", "Medium", "Difficult", "Custom"],
                        "enumText": titles.hinting.hintingLevels.enumTitles[lang],
                        "default": "Easy",
                        "pupilModeVisibleOnDefault": false
                    },
                    initiateActionsIfUserNotActive:{
                      "type": "boolean",
                      "title": titles.autohinting.initiateActionsIfUserNotActive.title[lang],
                      "description":  titles.autohinting.initiateActionsIfUserNotActive.description[lang],
                      "default": true,
                      "pupilModeVisibleOnDefault": false
                    }
                }
            },
            theming: {
                "type": "object",
                "title": titles.theming.title[lang],
                "advanced": false,
                "pupilModeVisibleOnDefault": true,
                "properties": {
                    theme: {
                        "type": "string",
                        "title": titles.theming.theme.title[lang],
                        "description": titles.theming.theme.description[lang],
                        "enum": ["default", "dayTheme", "nightTheme"],
                        "enumText": titles.theming.theme.enumTitles[lang],
                        "default": "default"
                    },
                }
            },
            boardCustomization: {
                "type": "object",
                "title": titles.boardCustomization.title[lang],
                "advanced": false,
                "pupilModeVisibleOnDefault": false,
                "visible": false,
                "properties": {
                    initialPiecePos: {
                        "visible": false,
                        "type": "custom",
                        "title": titles.boardCustomization.initialPiecePos.title[lang],
                        "description": titles.boardCustomization.initialPiecePos.description[lang],
                        "default": boardCustomizationDefault
                    },
                    includePiecePos: {
                        "visible": false,
                        "type": "boolean",
                        "title": titles.boardCustomization.includePiecePos.title[lang],
                        "description": titles.boardCustomization.includePiecePos.description[lang],
                        "default": true
                    }
                }
            },
            speech: {
                "type": "object",
                "title": titles.speech.title[lang],
                "pupilModeVisibleOnDefault": false,
                "advanced": true,
                "properties": {
                  enableSpeech:{
                    "type": "boolean",
                    "title": titles.speech.enableSpeech.title[lang],
                    "description": titles.speech.enableSpeech.description[lang],
                    "default": false
                  }
                }
            },
            autohinting: {
                "type": "object",
                "title": titles.autohinting.title[lang],
                "pupilModeVisibleOnDefault": false,
                "advanced": true,
                "properties": {
                  enableAutoHinting:{
                    "type": "boolean",
                    "title": titles.autohinting.enableAutoHinting.title[lang],
                    "description": titles.autohinting.enableAutoHinting.description[lang],
                    "default": false
                  },
                  timebased:{
                    "type": "boolean",
                    "title": titles.autohinting.autoHintVariants.timebased.title[lang],
                    "default": true
                  },
                  timeForNoAction: {
                    "type": "string",
                    "title": titles.autohinting.timeForNoAction.title[lang],
                    "enum": ["Short", "Medium", "Long"],
                    "enumText": titles.autohinting.timeForNoAction.enumTitles[lang],
                    "description": titles.autohinting.timeForNoAction.description[lang],
                    "default": "Short"
                  },
                  enableTimePeriodBasedAutoHintInAnyCase:{
                    "type": "boolean",
                    "title": titles.autohinting.enableTimePeriodBasedAutoHintInAnyCase.title[lang],
                    "description": titles.autohinting.enableTimePeriodBasedAutoHintInAnyCase.description[lang],
                    "default": true
                  },

                  wrongMoves:{
                    "type": "boolean",
                    "title": titles.autohinting.autoHintVariants.wrongMoves.title[lang],
                    "default": false
                  },
                  numberOfWrongMoves: {
                      "step": 1,
                      "type": "integer",
                      "title": titles.autohinting.numberOfWrongMoves.title[lang],
                      "description": titles.autohinting.numberOfWrongMoves.description[lang],
                      "default": 5,
                      "minimum": 5,
                      "exclusiveMinimum": false,
                      "maximum": 20
                  },
                  typeOfHints:{
                    "type": "string",
                    "title": titles.autohinting.typeOfHints.title[lang],
                    "enum": ["Visual", "Visual and textual"],
                    "enumText": titles.autohinting.typeOfHints.enumTitles[lang],
                    "description": titles.autohinting.typeOfHints.description[lang],
                    "default": "Visual"
                  }
                }
            },
            hinting: {
                "type": "object",
                "title": titles.hinting.title[lang],
                "pupilModeVisibleOnDefault": false,
                "advanced": true,
                "properties": {
                  typeOfHints:{
                    "type": "string",
                    "title": titles.hinting.typeOfHints.title[lang],
                    "enum": ["Visual","Visual and textual"],
                    "enumText": titles.hinting.typeOfHints.enumTitles[lang],
                    "description": titles.hinting.typeOfHints.description[lang],
                    "default": "Visual"
                  },
                    showNumberOfPossibleSolutions: {
                        "type": "boolean",
                        "title": titles.hinting.showNumberOfPossibleSolutions.title[lang],
                        "description": titles.hinting.showNumberOfPossibleSolutions.description[lang],
                        "default": true
                    },
                    enableHinting: {
                        "type": "boolean",
                        "title": titles.hinting.enableHinting.title[lang],
                        "description": titles.hinting.enableHinting.description[lang],
                        "default": true
                    },
                    hintingVariants: {
                        "type": "string",
                        "title": titles.hinting.hintingVariants.title[lang],
                        "description": titles.hinting.hintingVariants.description[lang],
                        "enum": ["Show pentominoes", "Show destination", "Show both"],
                        "enumText": titles.hinting.hintingVariants.enumTitles[lang],
                        "default": "Show both"
                    },
                    hintingStrategy: {
                        "type": "string",
                        "title": titles.hinting.hintingStrategy.title[lang],
                        "description": titles.hinting.hintingStrategy.description[lang],
                        "enum": ["full", "partial", "area"],
                        "enumText": titles.hinting.hintingStrategy.enumTitles[lang],
                        "default": "partial"
                    },
                    partialHintingStragety: {
                        "type": "string",
                        "title": titles.hinting.partialHintingStrategy.title[lang],
                        "description": titles.hinting.partialHintingStrategy.description[lang],
                        "enum": ["random", "mostOccupiedCells"],
                        "enumText": titles.hinting.partialHintingStrategy.enumTitles[lang],
                        "default": "mostOccupiedCells"
                    },
                    maxPartialHintingCells: {
                        "step": 1,
                        "type": "integer",
                        "title": titles.hinting.maxPartialHintingCells.title[lang],
                        "description": titles.hinting.maxPartialHintingCells.description[lang],
                        "default": 1,
                        "minimum": 1,
                        "exclusiveMinimum": false,
                        "maximum": 4
                    },
                    skillTeaching: {
                        "type": "boolean",
                        "title": titles.hinting.skillTeaching.title[lang],
                        "description": titles.hinting.skillTeaching.description[lang],
                        "default": true
                    },
                    exactHints: {
                        "type": "boolean",
                        "title": titles.hinting.exactHints.title[lang],
                        "description": titles.hinting.exactHints.description[lang],
                        "default": false
                    }
                }
            },
            prefilling: {
                "type": "object",
                "advanced": true,
                "title": titles.prefilling.title[lang],
                "pupilModeVisibleOnDefault": false,
                "properties": {
                    fixPieces : {
                        "type": "boolean",
                        "title": titles.prefilling.fixPieces.title[lang],
                        "description": titles.prefilling.fixPieces.description[lang],
                        "default": false
                    },
                    enablePrefilling: {
                        "type": "boolean",
                        "title": titles.prefilling.enablePrefilling.title[lang],
                        "description": titles.prefilling.enablePrefilling.description[lang],
                        "default": true
                    },
                    prefillingStrategy: {
                        "type": "string",
                        "title": titles.prefilling.prefillingStrategy.title[lang],
                        "description": titles.prefilling.prefillingStrategy.description[lang],
                        "enum": ["distance", "pieces"],
                        "enumText": titles.prefilling.prefillingStrategy.enumTitles[lang],
                        "default": "distance"
                    },
                    distanceValue: {
                        "type": "string",
                        "title": titles.prefilling.distanceValue.title[lang],
                        "default": "easy",
                        "enum": ["easy", "medium", "hard", "extreme"],
                        "enumText": [],
                        "_enumText": titles.prefilling.distanceValue.enumTitles
                    }
                }
            },
            splitPartition: {
                "type": "object",
                "advanced": true,
                "title": titles.splitPartition.title[lang],
                "pupilModeVisibleOnDefault": false,
                "properties": {
                    splitStrategy: {
                        "type": "string",
                        "title": titles.splitPartition.splitStrategy.title[lang],
                        "enum": ["color","left-to-right"],
                        "enumText": titles.splitPartition.splitStrategy.enumTitles[lang],
                        "default": "color"
                    }
                }
            }

        };
    }
}
