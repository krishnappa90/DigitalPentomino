class CommandSequenceList {
    constructor() {
        this._commandSequences = [];
    }

    addCommandSequence(pentominoName, commands) {
        this._commandSequences.push({
            pentominoName: pentominoName,
            commands: commands
        });
    }

    getAllCommandSequences() {
        return this._commandSequences;
    }
}
