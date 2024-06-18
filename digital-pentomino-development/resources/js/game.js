if (typeof require != 'undefined') {
    CommandManager = require('./command-history/command-manager.js');
    RemoveCommand = require('./command-history/commands.js');
    Pentomino = require('./pentomino');
}

class Game {
    constructor(board, name) {
        this._name = name;
        this._board = board;
        this._cmdKey = undefined;

        /**
            TODO: reconsider this tray, do we really need to store tray information.

            It is added to create and save all the pentomino when, game is loaded for
            the first time.
        */
        this._tray = [];
        this._pentominosOutside = [];
        this._pentominoOutsidePositions = [];
        this._collisions = [];
        this._id = Math.random().toString(36).slice(-10);
    }

    reset() {
        this._board.reset();
        this._tray = [];
        this._pentominosOutside = [];
        this._pentominoOutsidePositions = [];
        this._collisions = [];
    }

    updateCmdKey(cmdKey) {
        this._cmdKey = cmdKey;
    }

    getCmdKey() {
        return this._cmdKey;
    }

    getId() {
        return this._id;
    }

    /**
     * Adds new pentomino to game
     * @param pentomino
     * @param row
     * @param col
     */
    placePentomino(pentomino, row, col) {
        /**
         * Find if pentomino already placed in the board or out of the board.
         * If it is placed already in the board, and target position is not valid, 
         * then remove pentomino from the board, place out of the board
         * 
         * If it is placed already in the outside of the board, if target position
         * is valide, remove the pentomino from the outside area and place it in the
         * board
         *
         */

        let targetPosOnBoard = this._board.pentominoIsValidAtPosition(pentomino, row, col);
        if (this.isPlacedOnBoard(pentomino)) {
            if (targetPosOnBoard == true) {
                this._board.placePentomino(pentomino, row, col);
            } else {
                this.movePentominoToPosition(pentomino, row, col);
            }
        } else if (this.isPlacedOutsideBoard(pentomino)) {
            if (targetPosOnBoard == false) {
                this._placePentominoOutsideBoard(pentomino, row, col);
            } else {
                this.movePentominoToPosition(pentomino, row, col);
            }
        } else {
            if (targetPosOnBoard) {
                this._board.placePentomino(pentomino, row, col);
                /**
                 * TODO: return collision information, if this piece placement make collisions
                 * with other pentomino
                */
            } else {
                this._placePentominoOutsideBoard(pentomino, row, col);
            }
        }
        this.removeCollisionByPentomino(pentomino);
        let collisonCells = this.isCollidesAtPosition(pentomino, row, col);
        if (collisonCells.length != 0) {
            this.setCollisionCells(collisonCells);
        }
    }

    /**
     * Assumes that the pentomino already exists
     * @param pentomino
     * @param row
     * @param col
     */

    movePentominoToPosition(pentomino, row, col) {
        if (!this.isPlacedInGame(pentomino)) {
            throw new Error("Pentomino \'" + pentomino.name + "\' is not placed in the game");
        }

        let oldPentominoPositionIsOnBoard = this._board.isPlacedOnBoard(pentomino);
        let newPentominoPositionIsOnBoard = this._board.pentominoIsValidAtPosition(pentomino, row, col);

        if (oldPentominoPositionIsOnBoard) {
            if (newPentominoPositionIsOnBoard) {
                this._board.movePentominoToPosition(pentomino, row, col);
            }
            else {
                this._board.removePentomino(pentomino);
                this._placePentominoOutsideBoard(pentomino, row, col);
            }
        }
        else {
            if (newPentominoPositionIsOnBoard) {
                this._removePentominoOutsideTheBoard(pentomino);
                this._board.placePentomino(pentomino, row, col);
            }
            else {
                this._movePentominoOutsideBoardToPosition(pentomino, row, col);
            }
        }
        this.removeCollisionByPentomino(pentomino);
        let collisonCells = this.isCollidesAtPosition(pentomino, row, col);
        if (collisonCells.length != 0) {
            this.setCollisionCells(collisonCells);
        }
    }

    removePentomino(pentomino) {
        this.removeCollisionByPentomino(pentomino);
        if (this._board.isPlacedOnBoard(pentomino)) {
            this._board.removePentomino(pentomino);
        }
        else {
            if (this.isPlacedOutsideBoard(pentomino)) {
                this._removePentominoOutsideTheBoard(pentomino);
            }
            else {
                ;// throw new Error("Pentomino \'" + pentomino.name + "\' does not exist in this game.");
            }
        }
    }

    rotatePentominoClkWise(pentomino) {
        this._doLocalOperation(
            pentomino,
            p => p.rotateClkWise(),
            p => this._board.rotatePentominoClkWise(p));
    }

    rotatePentominoAntiClkWise(pentomino) {
        this._doLocalOperation(
            pentomino,
            p => p.rotateAntiClkWise(),
            p => this._board.rotatePentominoAntiClkWise(p));
    }

    mirrorPentominoH(pentomino) {
        this._doLocalOperation(
            pentomino,
            p => p.mirrorH(),
            p => this._board.mirrorPentominoH(p));

    }

    mirrorPentominoV(pentomino) {
        this._doLocalOperation(
            pentomino,
            p => p.mirrorV(),
            p => this._board.mirrorPentominoV(p));
    }

    // --- --- --- Collisions --- --- ---
    /**
    _arraynother pentomino at the specified position
     * @param pentomino
     * @param row new row position
     * @param col new col position
     * @throws {Error} if new position is outside the board
     * @returns {boolean}
     */
    isCollidesAtPosition(pentomino, row, col) {

        var collisionsCell = [];
        var pentominoes = this.getPentominoesInGmArea();
        pentominoes.forEach(function (entry) {
            if (pentomino.name === entry.name) {/** if same pentomino placed again */
                return this.getCollisionCellsOfPentomino(pentomino);
            }
            if (this.doPentominoMatricesOverlapAtPosition(row, col, pentomino, entry)) {
                let entryPosition = this.getPosition(entry);
                let pentominoPosition = [row, col];
                let overlapCells = this.getOverlappingCells(row, col, pentomino, entry);

                for (let i = 0; i < overlapCells.length; ++i) {
                    let cell = overlapCells[i];
                    let pOverlapCellMatrixPos = pentomino.getMatrixPosition(pentominoPosition, [cell.x, cell.y]);
                    let pValue = pentomino.getCharAtMatrixPosition(pOverlapCellMatrixPos[0], pOverlapCellMatrixPos[1]);
                    let eOverlapCellMatrixPos = entry.getMatrixPosition(entryPosition, [cell.x, cell.y]);
                    let eValue = entry.getCharAtMatrixPosition(eOverlapCellMatrixPos[0], eOverlapCellMatrixPos[1]);
                    if (eValue === '1' && pValue === eValue) {
                        let index = collisionsCell.findIndex(item => item.cell[0] === cell.x &&
                            item.cell[1] === cell.y);
                        if (index === -1) {
                            collisionsCell.push({
                                'cell': [cell.x, cell.y],
                                'pentominos': [pentomino.name, entry.name]
                            });
                        } else {
                            collisionsCell[index].pentominos.push(pentomino.name);
                        }
                    }
                }
            }
        }, this);

        return collisionsCell;
    }

    /**
     * Returns whether matrices of the specified pentominoes overlap at the specified position
     * @param row
     * @param col
     * @param pentominoA
     * @param pentominoB
     * @returns {boolean}
     */
    doPentominoMatricesOverlapAtPosition(row, col, pentominoA, pentominoB) {

        if (this.isPlacedInGame(pentominoB) == false) {
            return false;
        }

        let aLowestRow = row - pentominoA.rowAnchor;
        let aHighestCol = col + pentominoA.colAnchor;
        let aHighestRow = row + pentominoA.rowAnchor;
        let aLowestCol = col - pentominoA.colAnchor;

        let [p1, q1] = this.getPosition(pentominoB);
        let bLowestRow = p1 - pentominoB.rowAnchor;
        let bHighestRow = p1 + pentominoB.rowAnchor;
        let bLowestCol = q1 - pentominoB.rowAnchor;
        let bHighestCol = q1 + pentominoB.colAnchor;

        return (Math.max(aLowestRow, bLowestRow) <= Math.min(aHighestRow, bHighestRow)
            && Math.max(aLowestCol, bLowestCol) <= Math.min(aHighestCol, bHighestCol));
    }

    getOverlappingCells(row, col, pentominoA, pentominoB) {
        let cells = [];

        let aLowestRow = row - pentominoA.rowAnchor;
        let aHighestCol = col + pentominoA.colAnchor;
        let aHighestRow = row + pentominoA.rowAnchor;
        let aLowestCol = col - pentominoA.colAnchor;

        let [p1, q1] = this.getPosition(pentominoB);
        let bLowestRow = p1 - pentominoB.rowAnchor;
        let bHighestRow = p1 + pentominoB.rowAnchor;
        let bLowestCol = q1 - pentominoB.colAnchor;
        let bHighestCol = q1 + pentominoB.colAnchor;

        let bottomRow = Math.max(aLowestRow, bLowestRow);
        let topRow = Math.min(aHighestRow, bHighestRow);
        let leftCol = Math.max(aLowestCol, bLowestCol);
        let rightCol = Math.min(aHighestCol, bHighestCol);

        for (let i = bottomRow; i <= topRow; ++i) {
            for (let j = leftCol; j <= rightCol; ++j) {
                cells.push({
                    'x': i,
                    'y': j
                });
            }
        }

        return cells;
    }

    setCollisionCells(collisionCells) {
        if (this._collisions.length === 0) {
            this._collisions.push(...collisionCells);
        } else {
            collisionCells.forEach(function (element) {
                let index = this._collisions.findIndex(item => item.cell[0] === element.cell[0] &&
                    item.cell[1] === element.cell[1]);
                if (index === -1) {
                    this._collisions.push({
                        'cell': element.cell,
                        'pentominos': element.pentominos
                    });
                } else {
                    this._collisions[index].pentominos = [...new Set([...this._collisions[index].pentominos,
                    ...element.pentominos])];
                }
            }, this);
        }
    }

    removeCollisionByCells(cells) {
        this._collisions = this._collisions.filter(
            item => (item.cell[0] != cells[0]) &&
                (item.cell[1] != cells[1])
        );
    }

    removeCollisionByPentomino(pentomino) {
        this._collisions = this._collisions.map((cItem, index) => {
            cItem.pentominos = cItem.pentominos.filter(
                item => item !== pentomino.name);
            return cItem;
        }, this);

        this._collisions = this._collisions.filter(
            item => (item.pentominos.length != 1));
    }

    getCollisionCells() {
        return this._collisions;
    }

    getCollisionCellsOfPentomino(pentomino) {
        /**
         * This kind of defensive programming may cause efficiency issue. Can we use
         * logging mechanism instead? Is there anything javascript?
         *
         * https://console.spec.whatwg.org/#log
        */

        var collisionCells = [];
        this._collisions.forEach(function (element) {
            element.pentominos.forEach(item => {
                if (item === pentomino.name) {
                    let collidePentominos = element.pentominos.filter(item => (item != pentomino.name));
                    collisionCells.push({
                        'cell': element.cell,
                        'pentominos': collidePentominos
                    });
                }
            }, this);
        }, this);

        return collisionCells;
    }

    getCollisionOfPentominoes(pentomino) {

        let allCollisions = this.getCollisionCellsOfPentomino(pentomino);
        var pentominos = [];

        allCollisions.forEach(element => {
            element.pentominos.forEach(item => {
                pentominos.push(item);
            }, this);
        }, this);

        return [...new Set(pentominos)];
    }

    // --- --- --- Helper Pentomino Operations --- --- ---
    _doLocalOperation(pentomino, operation, boardOperation) {
        let tempPentomino = new Pentomino(pentomino.name);
        Object.assign(tempPentomino, pentomino);
        operation(tempPentomino);

        let oldPentominoIsOnBoard = this._board.isPlacedOnBoard(pentomino);
        let position = this.getPosition(pentomino);
        let newPentominoIsOnBoard = this._board.pentominoIsValidAtPosition(
            tempPentomino,
            position[0],
            position[1]);

        if (oldPentominoIsOnBoard && newPentominoIsOnBoard) {
            boardOperation(pentomino);
        }
        else if (oldPentominoIsOnBoard && !newPentominoIsOnBoard) {
            let position = this._board.getPosition(pentomino);
            this._board.removePentomino(pentomino);
            Object.assign(pentomino, tempPentomino);
            this._placePentominoOutsideBoard(
                pentomino,
                position[0],
                position[1]);

        }
        else if ((!oldPentominoIsOnBoard) &&
            (!newPentominoIsOnBoard)) {

            Object.assign(pentomino, tempPentomino);
        }
        else {
            // !oldPentominoIsOnBoard && newPentominoIsOnBoard
            this._removePentominoOutsideTheBoard(pentomino);
            Object.assign(pentomino, tempPentomino);
            this._board.placePentomino(pentomino, position[0], position[1]);
        }

        position = this.getPosition(pentomino);
        this.removeCollisionByPentomino(pentomino);
        let collisonCells = this.isCollidesAtPosition(pentomino, position[0], position[1]);
        if (collisonCells.length != 0) {
            this.setCollisionCells(collisonCells);
        }
    }

    _removePentominoOutsideTheBoard(pentomino) {
        this._pentominosOutside = this._pentominosOutside.filter(item => !(item.name === pentomino.name));
        this._pentominoOutsidePositions = this._pentominoOutsidePositions.filter(item => !(item.name === pentomino.name));
    }

    _placePentominoOutsideBoard(pentomino, row, col) {
        if (this.isPlacedOnBoard(pentomino)) {
            throw new Error('Pentomino \'' + pentomino.name + "\' is already in the game");
        }

        var pentominoExist = false;
        this._pentominosOutside.find((item, index) => {
            if (item.name === pentomino.name) {
                pentominoExist = true;
                let penPosition = {
                    name: pentomino.name,
                    position: [row, col]
                };
                this._pentominosOutside[index] = item;
                this._pentominoOutsidePositions[index] = penPosition;
            }
        }, this);

        if (!pentominoExist) {
            this._pentominosOutside.push(pentomino);
            this._pentominoOutsidePositions.push({
                name: pentomino.name,
                position: [row, col]
            });
        }
    }

    _movePentominoOutsideBoardToPosition(pentomino, row, col) {
        this._pentominoOutsidePositions.forEach(pentominoPosition => {
            if (pentominoPosition.name === pentomino.name) {
                pentominoPosition.position = [row, col];
            }
        });
    }

    _fillUpTray() {
        var allPentominos = [
            'F', 'I', 'L', 'N', 'P', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z'];
        allPentominos.forEach(function (pentominoType) {
            let pentomino = new Pentomino(pentominoType);
            this._tray.push(pentomino);
        }, this);

    }


    removeFromTray(pentomino) {
        this._tray = this._tray.filter(item => (item.name != pentomino.name));
    }

    addToTray(pentomino) {
        if (!this._tray.find(p => p.name === pentomino.name)) {
            this._tray.push(pentomino);
        }
    }

    isPentominiInTray(pentomino) {
        if (this._tray.find(p => p.name === pentomino.name)) {
            return true;
        }
        else {
            return false;
        }
    }
    // --- --- --- History --- --- ---
    undo() {
        return this._commandManager.undo();
    }

    isUndoPossible() {
        return this._commandManager.isUndoPossible();
    }

    redo(command) {
        return this._commandManager.redo(command);
    }

    getPossibleRedoCommands() {
        return this._commandManager.getPossibleRedoCommands();
    }

    // --- --- --- Getter and Helper --- --- ---

    getPentominoesOutsideBoard() {
        return this._pentominosOutside.concat(this._tray).filter(pentomino => {
            return this._board.getPentominoes().find(p => p.name === pentomino.name) === undefined;
        });
    }

    getAllPentominoes() {
        return this._board.getPentominoes().concat(this._pentominosOutside).concat(this._tray);
    }

    getPentominosInTray() {
        return this._tray;
    }

    getPentominoesInGmArea() {
        return this._board.getPentominoes().concat(this._pentominosOutside);
    }

    getPentominoesOnBoard() {
        return this._board.getPentominoes();
    }

    getPentominoByName(name) {
        let pentominoOnBoard = this._board.getPentominoByName(name);
        if (pentominoOnBoard === null)
            return this._getPentominoOutsideByName(name);
        else
            return pentominoOnBoard;
    }

    getPosition(pentomino) {
        let retPosition = undefined;
        if (this._board.isPlacedOnBoard(pentomino)) {
            retPosition = this._board.getPosition(pentomino);
        } else {
            retPosition = this._getOutsidePosition(pentomino);
        }

        return retPosition;
    }

    _getOutsidePosition(pentomino) {
        let outsidePosition = null;
        this._pentominoOutsidePositions.find((item, index) => {
            if (item.name === pentomino.name) {
                outsidePosition = item.position;
            }
        }, this);
        if (outsidePosition === null) {
            return undefined;
        }
        return outsidePosition;
    }

    getPentominoesAtPosition(row, col) {
        if (this._board.positionIsValid(row, col)) {
            return this._board.getPentominoesAtPosition(row, col);
        } else {
            return this._getPentominoesOutsideAtPosition(row, col);
        }
    }

    _getPentominoesOutsideAtPosition(row, col) {
        let result = [];
        for (let i = 0; i < this._pentominosOutside.length; i++) {
            let pentominoOutside = this._pentominosOutside[i];
            if (this._isPentominoOutsideAtPosition(pentominoOutside, row, col)) {
                result.push(pentominoOutside);
            }
        }
        return result;
    }

    /**
     * Checks whether the pentomino outside the board is located at the specified position
     * @param pentomino
     * @param row
     * @param col
     * @returns {boolean}
     * @private
     */
    _isPentominoOutsideAtPosition(pentomino, row, col) {
        let pentominoPosition = this._getPentominoOutsideByName(pentomino.name);
        if (pentominoPosition === null) {
            throw new Error("No pentomino with name '" + pentomino.name + "' found outside the board");
        }

        if (row < pentominoPosition[0]
            || row >= pentominoPosition[0] + pentomino.iRows
            || col < pentominoPosition[1]
            || col >= pentominoPosition[1] + pentomino.iCols) {
            return false;
        }

        let relRowToCheck = row - pentominoPosition[0];
        let relColToCheck = col - pentominoPosition[1];

        return pentomino.sRepr.charAt(relRowToCheck * pentomino.iCols + relColToCheck) === '1';
    }

    isPlacedOutsideBoard(pentomino) {
        return !(undefined === this._pentominosOutside.find(p => p.name === pentomino.name));
    }

    isPlacedOnBoard(pentomino) {
        return this._board.isPlacedOnBoard(pentomino);
    }

    isPlacedInGame(pentomino) {
        return this.isPlacedOnBoard(pentomino) || this.isPlacedOutsideBoard(pentomino);
    }

    _getPentominoOutsideByName(name) {
        for (let i = 0; i < this._pentominosOutside.length; i++) {
            let pentomino = this._pentominosOutside[i];
            if (pentomino.name === name) {
                return pentomino;
            }
        }
        return null;
    }

    getBoardSize() {
        return [this._board._boardRows, this._board._boardCols];
    }

    getBoard() {
        return this._board;
    }

    getName() {
        return this._name;
    }

    // --- --- --- Debugging --- --- ---
    display() {
        this._board.display();
        console.log("");
        let string = "Pentominoes outside the board:";
        if (this._pentominosOutside.length > 0) {
            console.log(string);
            this._pentominosOutside.forEach(p => {
                let position = this._getOutsidePosition(p);
                console.log(p.name + " [" + position[0] + "," + position[1] + "]");
            });
        } else {
            string = string + " -";
            console.log(string);
        }
    }

    writeToDocument() {
        // TODO - at least name the pieces outside the board
        this._board.writeToDocument();
    }
}

if (typeof module != 'undefined') {
    module.exports = Game;
}
