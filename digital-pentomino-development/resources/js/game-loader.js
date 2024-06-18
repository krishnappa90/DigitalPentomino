if (typeof require != 'undefined') {
    Game = require('./game.js');
    Board = require('./board.js');
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

class GameLoader {
    /**
     * All game saving, loading operation handled in this class. It can contains different games and anytime
     * load any game from any other game states. 
     *  
     * _gameImages: all game images or snapshot taken from the games UI
     * _gameList:  storage for all game object
     * _gameLastImage: store only last game image.
     * 
     *  _game: current game
     *  _commandManager: current game command manager
     *  _hintAI: current game hint object  
     */
    constructor() {
        this._game = null;
        this._commandManager = null;
        this._hintAI = null;
        this._splitBoard = null;
        /**
         *  
         * [{
         *  name: "",
         *  game: game,
         *  img: ,
         *  key: 
         * },....]
         * 
         */
        this._gameList = {};
        this._gameImages = [];
        this._gameLastImage = {};
        this._gameBoards = [];

        /**[
         *  gameId : {
         *              cmdManager: this._commandManager
         *              hintAI: this._hintAI,
         *              game: this._game,
         *              commandKey: []
         *          },
         * ]
         * 
        */
    }

    cmdManager() {
        return this._commandManager;
    }

    hintAI() {
        return this._hintAI;
    }

    splitBoard() {
        return this._splitBoard;
    }

    getGame() {
        return this._game;
    }

    inCurrentGame(gameId) {
        return (this._game != undefined) ? (this._game.getId() == gameId) : false;
    }
    getCurrentGameCmdKey() {
        return this._game.getCmdKey();
    }

    getCurrentGameKey() {
        return this._game.getId();
    }

    getGameImages() {
        return this._gameImages;
    }

    /**
     * find the game if exist, and then find the all images for this game
     */
    getImagesByGameId(gameId) {
        if (!this._gameList.hasOwnProperty(gameId)) {
            return undefined;
        }

        let cmdKeys = this._gameList[gameId].cmdKey;
        let localImages = [];
        cmdKeys.forEach((item) => {
            this._gameImages.forEach((gameImg) => {
                if (Object.keys(gameImg) == item) {
                    localImages.push(gameImg);
                }
            });
        }, this);

        return localImages;
    }

    getAllGameIds() {
        let gameIds = [];
        for (let gameEntry in this._gameList) {
            gameIds.push(gameEntry);
        }
        return gameIds;
    }

    getLastGameimage(gameId) {
        let gameIds = this.getAllGameIds();
        if (gameIds.find(id => id === gameId)) {
            return this._gameLastImage[gameId];
        }
        else {
            console.error("Game Id:" + gameId + "not found in gameList");
            return undefined;
        }
    }

    getGames() {
        return this._gameList;
    }

    setGame(game) {
        this._game = game;
    };

    setCmdManager(cmdManager) {
        this._commandManager = cmdManager;
    }

    setHintAI(hintAI) {
        this._hintAI = hintAI;
    }

    isGameStateSaved(game) {
        let gameId = game.getId();

        if (!this._gameList.hasOwnProperty(gameId)) {
            return false;
        }

        if (this._gameList[gameId].cmdKey.length == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    getGameIdByKey(key) {
        for (let gameEntry in this._gameList) {
            if (this._gameList[gameEntry].cmdKey.find(cmdKey => cmdKey === key)) {
                return gameEntry;
            }
        }
        return undefined;
    }

    /**
     * centeral function for creating a game
     */
    createGame(boardStartXY,
        boardSizeXY,
        Boardshape,
        blockedCells,
        name) {

        boardStartXY[0] = parseInt(boardStartXY[0]);
        boardStartXY[1] = parseInt(boardStartXY[1]);

        boardSizeXY[0] = parseInt(boardSizeXY[0]);
        boardSizeXY[1] = parseInt(boardSizeXY[1]);
        let prevGameName = (this._game == null) ? null : this._game.getName();

        this.setGame(
            new Game(
                new Board(
                    boardStartXY,
                    boardSizeXY,
                    blockedCells,
                    Boardshape),
                name));

        let piecesInTray = this._game.getPentominosInTray();

        if (piecesInTray.length == 0) {
            this._game._fillUpTray();
        }
        this._commandManager = new CommandManager();

        if (prevGameName == null || prevGameName != this._game.getName()) {
            this._hintAI = new HintAI(this._game, true);
        }

        this._splitBoard = new SplitBoard(this._game);
        this.saveGame();
    }

    resetGame() {
        if (isEmpty(this._game)) {
            console.error("game object is not initialized");
            return;
        }
        let boardSettings = this._game._board.getBoardSettings();
        let boardStartXY = boardSettings.boardStartPos;
        let boardSize = boardSettings.boardSize;
        let blockCells = boardSettings.blockCells;
        let gameName = this._game.getName();
        let gameId = this._game.getId();

        if (!this.isGameStateSaved(this._game)) {
            delete this._gameList[gameId];
            this._game.reset();
            this._commandManager.Reset();
        }

        this.createGame(
            boardStartXY,
            boardSize,
            "Block",
            blockCells,
            gameName);
    }

    saveBoard(board) {
        this._gameBoards.push(board);
    }

    getBoards() {
        return this._gameBoards;
    }
    saveGame(cmdKey) {
        let gameId = this._game._id;

        let gameClone = _.cloneDeep(this._game);
        let cmdManagerClone = _.cloneDeep(this._commandManager);
        let hintAIClone = _.cloneDeep(this._hintAI);

        if (!this._gameList.hasOwnProperty(gameId)) {
            this._gameList[gameId] = {
                "game": gameClone,
                "cmdManager": cmdManagerClone,
                "hintAI": hintAIClone,
                "cmdKey": [cmdKey]
            };

            this._gameList[gameId].cmdKey = this._gameList[gameId].cmdKey.filter(
                (cmdKey) => cmdKey !== undefined);

            return true;
        }
        else {
            if (this._gameList[gameId].cmdKey.find(key => key == cmdKey)) {
                return false;
            }
            this._gameList[gameId].cmdKey.push(cmdKey);
            this._gameList[gameId].cmdManager = cmdManagerClone;
            this._gameList[gameId].hintAI = hintAIClone;

            return true;
        }
    }

    deleteGame(key) {
        if (key == undefined) {
            return;
        }

        let gameIds = Object.keys(this._gameList);
        for (let id in gameIds) {
            let gmId = gameIds[id];
            this._gameList[gmId].cmdKey = this._gameList[gmId].cmdKey.filter(item => item !== key);
            if (this._gameList[gmId].cmdKey.length == 0) {
                delete this._gameList[gmId];
                delete this._gameLastImage[gmId];
                break;
            }
        }
    }
    /** Delete game if there are all auto images*/
    delGameAutoImages() {


        let gameIds = Object.keys(this._gameList);
        for (let id in gameIds) {
            let gmId = gameIds[id];
            if (gmId == this._game.getId()) {
                continue;
            }
            let cmdKeys = this._gameList[gmId].cmdKey;
            cmdKeys.forEach((cmdKey) => {

                let img = undefined;
                for (let indx = 0; indx < this._gameImages.length; ++indx) {
                    if (Object.keys(this._gameImages[indx])[0] == cmdKey) {
                        img = (this._gameImages[indx])[cmdKey];
                        break;
                    }
                }
                if (img == undefined) {
                    return;
                }
                // let img =this._gameImages[item];
                let type = img.getAttribute('type');
                type = parseInt(type);
                if (type & SnapshotType.Auto) {
                    let key = img.value;
                    this.deleteGameImage(key);
                }


            }, this);

        }

    }

    saveGameImage(image) {
        let cmdKey = image.value;
        if (cmdKey == undefined) {
            return;
        }
        let currGameId = this._game.getId();
        let imgType = parseInt(image.getAttribute('type'));
        if (imgType == SnapshotType.FilterOnly) {
            this._gameLastImage[currGameId] = image;
            return;
        }

        let verdict = this.saveGame(cmdKey);
        if (verdict == false) {
            let img = undefined;
            for (let indx = 0; indx < this._gameImages.length; ++indx) {
                if (Object.keys(this._gameImages[indx])[0] == cmdKey) {
                    img = (this._gameImages[indx])[cmdKey];
                    if(img.getAttribute('type') == SnapshotType.Original){
                        continue;
                    }
                    img.setAttribute("type", imgType.toString());
                    break;

                }
            }
            return;
        }

        if (this._gameImages.length != 0) {
            let lastGameImg = Object.values(this._gameImages[this._gameImages.length - 1])[0];
            if (lastGameImg != undefined) {
                let lastGameImgType = parseInt(lastGameImg.getAttribute('type'));
                if (lastGameImgType == SnapshotType.Auto) {
                    this.deleteGameImage(lastGameImg.value);
                }
            }
        }

        this._gameImages.push({
            [cmdKey]: image
        });
    }

    deleteGameImage(key) {
        this._gameImages = this._gameImages.filter(
            (obj) => Object.keys(obj)[0] !== key);
        this.deleteGame(key);
    }

    loadGame(targetCmdKey) {
        let targetGameId = this.getGameIdByKey(targetCmdKey);
        if (this.inCurrentGame(targetGameId)) {
            this.loadGameState(this._commandManager.CurrentCmdKey(),
                targetCmdKey);
        }
        else {
            if (this._gameList.hasOwnProperty(targetGameId)) {
                for (let key in this._gameList[targetGameId].cmdKey) {
                    if (this._gameList[targetGameId].cmdKey[key] == targetCmdKey) {
                        this.setCmdManager(this._gameList[targetGameId].cmdManager);
                        this.setGame(this._gameList[targetGameId].game);
                        this.setHintAI(this._gameList[targetGameId].hintAI);
                        this.loadGameState(this._commandManager.CurrentCmdKey(),
                            this._commandManager.StartCmdKey());
                        this._commandManager.Undo();
                        this.loadGameState(this._commandManager.StartCmdKey(),
                            targetCmdKey);
                        break;
                    }
                }
            }
        }
    }

    jumpToGameState(cmdSequences, seqType) {

        let cmdProperty = updateCommandAttr(CommandTypes.Shadow, seqType);
        let cmdSeqLength = cmdSequences.length;

        for (let indx = 0; indx < cmdSeqLength; indx++) {

            let command = cmdSequences[indx];
            let pentomino = command.Pentomino;
            let posX = command.PosX;
            let posY = command.PosY;

            switch (command.name) {
                case "Remove":
                case "Place":
                    if ((command.PosX == undefined) &&
                        (command.PosY == undefined)) {
                        pentomino.updateTrayValue(1);
                        this._game.addToTray(pentomino);
                        this._commandManager.ExecCommand(
                            new RemoveCommand(
                                pentomino,
                                this._game.getPosition(pentomino)
                            ), cmdProperty
                        );
                    }
                    else {
                        if (this._game.isPentominiInTray(pentomino)) {
                            this._game.removeFromTray(pentomino);
                            pentomino.updateTrayValue(0);
                        }
                        this._commandManager.ExecCommand(
                            new PlaceCommand(
                                pentomino,
                                this._game.getPosition(pentomino),
                                [posX, posY]
                            ), cmdProperty);
                    }

                    break;

                case "RotateClkWise":
                    this._commandManager.ExecCommand(
                        new RotateClkWiseCommand(pentomino),
                        cmdProperty);
                    break;

                case "RotateAntiClkWise":
                    this._commandManager.ExecCommand(
                        new RotateAntiClkWiseCommand(pentomino),
                        cmdProperty);
                    break;

                case "MirrorH":
                    this._commandManager.ExecCommand(
                        new MirrorHCommand(pentomino),
                        cmdProperty);
                    break;

                case "MirrorV":
                    this._commandManager.ExecCommand(
                        new MirrorVCommand(pentomino),
                        cmdProperty);
                    break;

                default:
                    //TODO: add commund related flag variable
                    throw new Error("Can not undo");
            }
        }
    }

    cmdSequences(startStateKey, targetStateKey) {
        let seqType = this._commandManager.CmdKeySeqType(startStateKey, targetStateKey);


        let cmdSeqs = [];
        while (this._commandManager.CurrentCmdKey() != targetStateKey) {
            let commands = undefined;
            if (seqType == 2) {
                commands = this._commandManager.Undo();
            }
            else if (seqType == 1) {
                commands = this._commandManager.Redo();

            }
            else {
                console.error("Sequence not found in loadGameState(...)");
            }
            if (commands == undefined) {
                break;
            }
            commands.forEach((item) => {
                cmdSeqs.push(item);
            });
        }
        return cmdSeqs;
    }

    loadGameState(startStateKey, targetStateKey) {
        let seqType = this._commandManager.CmdKeySeqType(startStateKey, targetStateKey);
        let cmdSeqs = this.cmdSequences(startStateKey, targetStateKey);
        this.jumpToGameState(cmdSeqs, seqType);
    }

}

if (typeof module != 'undefined') {
    module.exports = GameLoader;
}
