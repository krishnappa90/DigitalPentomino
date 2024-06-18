if (typeof require != 'undefined') {
    Pentomino = require('./pentomino.js');
    Config = require('./config.js');
}


class PD {

    constructor() {
        /**
         * Front-end interface always call FrontController instead of GameController.
         */
        var fController = new FrontController();
        this.gameController = fController.controller;
        this.loadBoard("board_6x10");
    }

    rotateClkWise() {
        this.visual.rotateClkWise();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    rotateAntiClkWise() {
        this.visual.rotateAntiClkWise();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    flipH() {
        this.visual.flipH();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    flipV() {
        this.visual.flipV();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    reset() {
        this.visual.reset();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    /**
    * Returns all boards with configurations and solutions
    */
    getAllBoards() {
        let boardsWithConfig = [];
        if (baseConfigs != undefined && solutionsConfig != undefined) {
            if (baseConfigs.hasOwnProperty("boards")) {
                baseConfigs.boards.forEach(board => {
                    if (solutionsConfig.hasOwnProperty(board)) {
                        boardsWithConfig.push(board);
                    }
                });
            } else {
                throw new Error("Error in configuration: Could not find any boards");
            }
        } else {
            throw new Error("Error in configuration: Could not find basic game configurations");
        }
        return boardsWithConfig;
    }

    loadBoard(board, loadType) {
        let gameObject = UtilitiesClass.getGameUISettings(board);
        this.boardName = board; // HACK: To be changed later. This needs to be obtained from the backend. 
        this.boardSize = gameObject.boardSize;
        this.boardShape = gameObject.boardShape;
        this.gameHeight = gameObject.gameHeight;
        this.gameWidth = gameObject.gameWidth;
        this.blockedCells = gameObject.blockedCells;
        this.gameCellPattern = gameObject.gameCellPattern;

        this.boardStartX = Math.floor((this.gameHeight - this.boardSize[0]) / 2);
        this.boardStartY = Math.floor((this.gameWidth - this.boardSize[1]) / 2);

        [this.boardStartX, this.boardStartY] = UtilitiesClass.getBoardStartCoords(board);

        if (loadType == "Snapshot") {
            this.visual.reload(pd);
        }
        else {
            this.gameController.createGame(
                [this.boardStartX, this.boardStartY],
                this.boardSize,
                this.boardShape,
                this.blockedCells,
                board);
            this.visual = new Visual(this);
            if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
                this.visual.showNumberOfPossibleSolutions();
            }
        }




    }

    hints() {
        return this.gameController.getHint();
    }

    callHintAI() {
        this.visual.callHintAI();
    }

    callSplitBoard() {
        this.visual.callSplitBoard();
    }

    prefillBoard() {
        this.visual.prefillBoard();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }
    importfile() {
        let import_data = localStorage.getItem('IMPORT_FILE');
        let json = JSON.parse(import_data);
        let pentomino_arr = json.pentominos;
        let board = json.boardName;
        let gameObject = UtilitiesClass.getGameUISettings(board);
        this.boardName = board;
        this.boardSize = gameObject.boardSize;
        this.boardShape = gameObject.boardShape;
        this.gameHeight = gameObject.gameHeight;
        this.gameWidth = gameObject.gameWidth;
        this.blockedCells = gameObject.blockedCells;
        this.gameCellPattern = gameObject.gameCellPattern;
        this.boardStartX = Math.floor((this.gameHeight - this.boardSize[0]) / 2);
        this.boardStartY = Math.floor((this.gameWidth - this.boardSize[1]) / 2);
        [this.boardStartX, this.boardStartY] = UtilitiesClass.getBoardStartCoords(board);
        this.gameController.createGame(
            [this.boardStartX, this.boardStartY],
            this.boardSize,
            this.boardShape,
            this.blockedCells,
            board);
        this.visual = new Visual(this);

        let pent_list = this.gameController.getAllPentominoes();
        pent_list.forEach((pentomino) => {
            for (let i = 0; i < pentomino_arr.length; i++) {
                let name = pentomino_arr[i].name;
                let sRepr = pentomino_arr[i].sRepr;
                let pos = pentomino_arr[i].position;

                if (name == pentomino.name) {
                    pentomino.sRepr = sRepr;
                    if (typeof pos === 'undefined') {
                        console.log("position not defined");
                    }
                    else {
                        this.visual.removeFromTray(pentomino);
                        this.visual.placePentomino(pentomino, pos[0], pos[1]);
                    }
                    break;
                }
            }
        });
        this.visual.reload(pd);

        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    exportfile() {
        let board = this.gameController.getName();
        let pent_list = this.gameController.getAllPentominoes();
        var pentomino_arr = [];
        pent_list.forEach((pentomino) => {
            var jsonObj = {};
            let pen_name = pentomino.name;
            let sRepr = pentomino.sRepr;
            let pen_pos = this.gameController.getPositionOfPentomino(pentomino);
            if (typeof pen_pos === 'undefined') {
                console.log("Position not defined");
            }
            else {
                jsonObj = { "name": pen_name, "sRepr": sRepr, "position": pen_pos }
                pentomino_arr.push(jsonObj);
            }
        });
        var json = { "boardName": board, "pentominos": pentomino_arr };
        var export_data = JSON.stringify(json);
        console.log("ExportData:", export_data);
        var blob = new Blob([export_data], { type: "application/json;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var elem = document.createElement("a");
        var filename = "PentominoGameSaved"
        elem.href = url;
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }


    undo() {
        this.visual.undo();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    redo() {
        this.visual.redo();
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.visual.showNumberOfPossibleSolutions();
        }
    }

    replay(startState, targetState) {
        this.visual.replay(startState, targetState);
    }

    getGameState(type) {
        return this.visual.getCmdState(type);
    }

    getAllGameStates() {
        return this.visual.getGameStates();
    }

}


// this.ui.load();
