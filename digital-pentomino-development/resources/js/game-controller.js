
if (typeof require != 'undefined') {
    Pentomino = require('./pentomino.js');
    CommandPath = require('./command-history/command-path.js');
    CommandManager = require('./command-history/command-manager.js');
    HintAI = require('./hint-ai.js');
    SplitBoard = require('./split-board.js');
}

/**
 * This is a singleton object for game controller. If front-end call gameController
 * two times, then there will two game state, which is unexpected at all. We need
 * one instance of gameController for a running game.
 *
 * UseCases: Front-end function more often event based trigger. We can not pass
 * controller object in event based function trigger. In this case, this class can 
 * be called multiple times, but always result same instance of gameController. VOLLA :)
 *
 */

var FrontController = (function () {
    var instance;
    function getController() {
        if (instance) {
            return instance;
        }
        instance = this;
        this.controller = new GameController();
    }
    getController.getInstance = function () {
        return instance || new getController();
    }
    return getController;
}());


class GameController {
    constructor() {
        this._gameLoader = new GameLoader();
    }

    game() {
        return this._gameLoader.getGame();
    }

    // --- --- --- Set Game --- --- ---
    setGame(game) {
        this._gameLoader.setGame(game);
    };
    getName() {
        return this.game().getName();
    }
    resetGame() {
        this._gameLoader.resetGame();
    }

    createGame(boardStartXY,
        boardSizeXY,
        Boardshape,
        blockedCells,
        name) {

        this._gameLoader.createGame(boardStartXY,
            boardSizeXY,
            Boardshape,
            blockedCells,
            name);
    }
    saveBoard(image) {
        this._gameLoader.saveBoard(image);
    }

    getBoards() {
        return this._gameLoader.getBoards();
    }
    saveGameImage(image) {
        this._gameLoader.saveGameImage(image);
    }

    deleteGameImage(key) {
        this._gameLoader.deleteGameImage(key);
    }

    getGameImages() {
        return this._gameLoader.getGameImages();
    }

    getLastGameimage(gameId) {
        return this._gameLoader.getLastGameimage(gameId);
    }

    loadGame(key) {
        this._gameLoader.loadGame(key);
    }

    getCurrentGameKey() {
        return this._gameLoader.getCurrentGameKey();
    }

    cmdManager() {
        return this._gameLoader.cmdManager();
    }

    hintAI() {
        return this._gameLoader.hintAI();
    }

    splitBoard() {
        return this._gameLoader.splitBoard();
    }

    getStartCmdKey() {
        return this.cmdManager().StartCmdKey();
    }

    getLastCmdKey() {
        return this.cmdManager().LastCmdKey();
    }

    getCurrentCmdKey() {
        return this.cmdManager().CurrentCmdKey();
    }

    getOperationCount() {
        return this.cmdManager().NodeCount();
    }

    getCmdSequences(startKey, endKey) {
        if (this.cmdManager().IsKeyFound(startKey) == false) {
            throw new Error("Selected Game State Not Found :(");
        }

        if (this.cmdManager().IsKeyFound(endKey) == false) {
            throw new Error("Selected Game State Not Found :(");
        }

        return this._gameLoader.cmdSequences(startKey, endKey);
    }

    getGameIdByKey(key) {
        return this._gameLoader.getGameIdByKey(key);
    }

    getAllGameIds() {
        return this._gameLoader.getAllGameIds();
    }

    getImagesByGameId(gameId) {
        return this._gameLoader.getImagesByGameId(gameId);
    }

    getCurrentGameId() {
        return this._gameLoader.getGame().getId();
    }

    delGameAutoImages(gameId) {
        return this._gameLoader.delGameAutoImages(gameId);
    }

    exceptionHandler(pentomino) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if ((pentomino === null) ||
            (pentomino === undefined)) {

            throw new Error("Type Error: Pentomino is null or undefined");
        }

        if (!this._isOfTypePentomino(pentomino)) {
            throw new Error(
                "Type Error: Pentomino isn't an instance of the Pentomino class.");
        }
    }

    placePentomino(
        pentomino,
        row,
        col,
        cmdProperty = cmdAttrDefault) {

        row = parseInt(row);
        col = parseInt(col);
        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new PlaceCommand(pentomino,
                this.game().getPosition(pentomino),
                [row, col]),
            cmdProperty);
    }

    movePentominoToPosition(
        pentomino,
        row,
        col,
        cmdProperty = cmdAttrDefault) {

        row = parseInt(row);
        col = parseInt(col);
        this.exceptionHandler(pentomino); // TODO: Exception need to be handled properly       

        return this.cmdManager().ExecCommand(
            new MoveToPositionCommand(pentomino, row, col),
            cmdProperty);
    }

    rotatePentominoAntiClkWise(
        pentomino,
        cmdProperty = cmdAttrDefault) {

        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new RotateAntiClkWiseCommand(pentomino),
            cmdProperty);
    }

    rotatePentominoClkWise(
        pentomino,
        cmdProperty = cmdAttrDefault) {

        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new RotateClkWiseCommand(pentomino),
            cmdProperty);
    }

    mirrorPentominoH(
        pentomino,
        cmdProperty = cmdAttrDefault) {

        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new MirrorHCommand(pentomino),
            cmdProperty);
    }

    mirrorPentominoV(
        pentomino,
        cmdProperty = cmdAttrDefault) {

        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new MirrorVCommand(pentomino),
            cmdProperty);
    }

    removePentomino(
        pentomino,
        cmdProperty = cmdAttrDefault) {

        this.exceptionHandler(pentomino);

        return this.cmdManager().ExecCommand(
            new RemoveCommand(pentomino,
                this.game().getPosition(pentomino)
            ), cmdProperty);
    }

    removeFromTray(pentomino) {
        pentomino.updateTrayValue(0);
        this.game().removeFromTray(pentomino);
    }

    addToTray(pentomino) {
        pentomino.updateTrayValue(1);
        this.game().addToTray(pentomino);
    }
    // --- --- --- Hints --- --- ---
    getHint(isSplitActive, piecesSelectedForPartition) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if (this.hintAI() === null) {
            console.error("HintAI not initialized");
        }

        return this.hintAI().getHint(this.game(), isSplitActive, piecesSelectedForPartition);
    }

    getPossibleSolutions() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if (this.hintAI() === null) {
            console.error("HintAI not initialized");
        }

        return this.hintAI().getCurrentSolutionCount(this.game());
    }

    //--- --- --- Split Board --- --- --
    splitByColor() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if (this.splitBoard() === null) {
            console.error(" not initialized");
        }

        return this.splitBoard().splitByColor(this.game());
    }

    //--- --- --- Split Board V2 --- --- ---
    splitFromLeftToRight() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if (this.splitBoard() === null) {
            console.error(" not initialized");
        }

        return this.splitBoard().splitFromLeftToRight(this.game());
    }

    partitionHasUnoccupiedPosition(pentomino) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.splitBoard().partitionHasUnoccupiedPosition(pentomino, this.game());
    }

    getSolutions() {
        return this.hintAI().getSolutions();
    }

    clearIsSplitActiveFlag() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        if (this.splitBoard() === null) {
            console.error(" not initialized");
        }

        this.splitBoard().clearIsSplitActiveFlag();
    }

    // --- --- --- History --- --- ---
    jumpToCommand(command) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.game()._commandManager.jumpToCommand(command);
    }

    jumpToBeginning() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.game()._commandManager.jumpToBeginning();
    }

    executeCommandPath(commandPath, onUndo, onRedo) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        if ((commandPath === null) ||
            (commandPath === undefined)) {
            throw new Error("Reference error: commandPath is null or undefined");
        }

        this.game()._commandManager.executeCommandPath(
            commandPath,
            onUndo,
            onRedo);
    }


    undo() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.cmdManager().Undo();
    }

    redo() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.cmdManager().Redo();
    }

    isUndoPossible() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.game().isUndoPossible();
    }



    getPossibleRedoCommands() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }

        return this.game().getPossibleRedoCommands();
    }

    // --- --- --- Debugging --- --- ---
    display() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        this.game().display();
    }

    writeToDocument() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        this.game().writeToDocument();
    }

    // --- --- --- Get Information About Whether Piece Outside/Inside Board --- --- ---
    isPlacedOutsideBoard(pentomino) {
        this.exceptionHandler(pentomino);
        return this.game().isPlacedOutsideBoard(pentomino);
    }

    isPlacedOnBoard(pentomino) {
        this.exceptionHandler(pentomino);
        return this.game().isPlacedOnBoard(pentomino);
    }

    isPlacedInGame(pentomino) {
        this.exceptionHandler(pentomino);
        return this.game().isPlacedInGame(pentomino);
    }

    // --- --- --- Get Information About Collisions --- --- ---
    /**
     * Returns an array of the colliding pentominoes of a specified pentomino
     * @param pentomino
     * @returns {*}
     */
    getCollisionOfPentominoes(pentomino) {
        this.exceptionHandler(pentomino);
        return this.game().getCollisionOfPentominoes(pentomino);
    }

    /**
     * Returns the colliding cells of a specific pentomino piece
     * @param pentomino
     * @returns {*}
     */
    getCollisionCellsOfPentomino(pentomino) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.game().getCollisionCellsOfPentomino(pentomino);
    }

    /**
     * Returns an array list of all colliding cells on the board
     * @returns {*}
     */
    getCollisionCells() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.game().getCollisionCells();
    }

    // --- --- --- Get Information About The Game For Loading --- --- ---
    getBoardSize() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.game().getBoardSize();
    }

    getAllPentominoes() {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.game().getAllPentominoes();
    }

    getPentominoesInGmArea() {
        return this.game().getPentominoesInGmArea();
    }

    getPentominosInTray() {
        return this.game().getPentominosInTray();
    }

    getPositionOfPentomino(pentomino) {
        this.exceptionHandler(pentomino);
        return this.game().getPosition(pentomino);
    }

    // --- --- --- Get Information About The Game For User Interaction --- --- ---
    getPentominoesAtPosition(row, col) {
        if (this.game() === null) {
            throw new Error("Game is not set");
        }
        return this.game().getPentominoesAtPosition(row, col);
    }

    // --- --- --- Helper --- --- ---
    _isOfTypePentomino(pentomino) {
        return JSON.stringify(
            Object.getPrototypeOf(pentomino)) === JSON.stringify(Pentomino.prototype);
    }

    _isOfTypeCommandPath(commandPath) {
        return JSON.stringify(
            Object.getPrototypeOf(commandPath)) === JSON.stringify(CommandPath.prototype);
    }
}


function debug_mode(boardStartXY, boardSizeXY) {
    let gc = new GameController();
    let game = new GameLoader('Level 2');
    game.display();
}


if (typeof module != 'undefined') {
    module.exports = GameController;
}
