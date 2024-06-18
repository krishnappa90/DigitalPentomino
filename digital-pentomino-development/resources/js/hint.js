class Hint {
    constructor(commands, skill = null) {
        this._commands = commands;
        this._skill = skill;
    }

    getSkill() {
        return this._skill;
    }

    getCommands() {
        return this._commands;
    }
}

if (typeof module != 'undefined') {
    module.exports = Hint;
}
