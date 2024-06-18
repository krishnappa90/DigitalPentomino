
class Command {
    constructor(name) {
        this._name = name;
    }

    Name() {
        return this._name;
    }
}

class PlaceCommand extends Command {
    constructor(pentomino, prevPos, nextPos) {
        super("Place");
        this._pentomino = pentomino;
        this._prevPosition = prevPos;
        this._nextPosition = nextPos;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": this._nextPosition[0],
            "PosY": this._nextPosition[1]
        };
    }

    ExecUndoValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": (this._prevPosition != undefined) ?
                this._prevPosition[0] : undefined,
            "PosY": (this._prevPosition != undefined) ?
                this._prevPosition[1] : undefined,
        };
    }

}

class RemoveCommand extends Command {
    constructor(pentomino, prevPos) {
        super("Remove");
        this._pentomino = pentomino;
        this._prevPosition = prevPos;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

    ExecUndoValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": (this._prevPosition != undefined) ?
                this._prevPosition[0] : undefined,
            "PosY": (this._prevPosition != undefined) ?
                this._prevPosition[1] : undefined,
        };
    }
}

class RotateClkWiseCommand extends Command {
    constructor(pentomino) {
        super("RotateClkWise");
        this._pentomino = pentomino;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

    ExecUndoValues() {
        return {
            "name": "RotateAntiClkWise",
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

}

class RotateAntiClkWiseCommand extends Command {
    constructor(pentomino) {
        super("RotateAntiClkWise");
        this._pentomino = pentomino;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

    ExecUndoValues() {
        return {
            "name": "RotateClkWise",
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }
}

class MirrorHCommand extends Command {
    constructor(pentomino) {
        super("MirrorH");
        this._pentomino = pentomino;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

    ExecUndoValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }
}

class MirrorVCommand extends Command {
    constructor(pentomino) {
        super("MirrorV");
        this._pentomino = pentomino;
    }

    ExecValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }

    ExecUndoValues() {
        return {
            "name": this._name,
            "Pentomino": this._pentomino,
            "PosX": undefined,
            "PosY": undefined
        };
    }
}

if (typeof module != 'undefined') {
    module.exports = Command;
}
