const EMPTY_CELL = ' ';

class Board {
    /**
     * It will create a default board of the defined size.
     *
     * The board class follows the following assumptions:
     *
     * - Multiple instances of the same piece inside the same board are not allowed
     * - Collisions inside the board are not allowed
     * - Only pieces can be placed, which fit exactly onto the board. That means that only those pieces are counted for collisions. All other pieces are saved in the game-object and are ignored on collisions. That means that they may overlap on the board on the frontend, but are treated as non-existing in the Board class.
     *
     * @constructor
     * @param boardRows;
     * @param boardCols;
     * @param shape; shape of the block
     */
    constructor(boardStartXY, boardSizeXY, blockedCells, boardShape = 'Block') {
        this._boardSRows = boardStartXY[0];
        this._boardSCols = boardStartXY[1];

        this._boardRows = boardSizeXY[0];
        this._boardCols = boardSizeXY[1];

        this._blockedCells = blockedCells === undefined ? [] : blockedCells;

        this._pentominoes = [];
        this._pentominoPositions = [];
    }

    reset() {
        this._pentominoes = [];
        this._pentominoPositions = [];
    }

    getBoardSettings() {
        return {
            "boardStartPos": [this._boardSRows, this._boardSCols],
            "boardSize": [this._boardRows, this._boardCols],
            "blockCells": this._blockedCells
        };
    }

    placePentomino(pentomino, row, col) {

        /**
         * Do we need that checking really? Is it not duplcate operation? Game class
         * already not decided this pentomino should placed on the board?
         */
        if (!this.pentominoIsValidAtPosition(pentomino, row, col)) {
            if (!this.positionIsValid(row, col)) {
                throw new Error("Position [" + row + "," + col + "] is outside the board");
            } else {
                throw new Error("Pentomino" + pentomino.name + " does not fit at position [" + row + "," + col + "] on the board");
            }
        }

        if (this.isPlacedOnBoard(pentomino)) {
            /**
             * This function will be called after checking that this pentomino is a valid
             * candidate for placing on board, if this piece already placed, then move
             * operation should be called.
             *
             * return from here
             */
            this.movePentominoToPosition(pentomino, row, col);
        } else {

            this._pentominoes.push(pentomino);
            this._pentominoPositions.push({
                name: pentomino.name,
                boardPosition: [row, col]
            });
        }
    }

    /**
     * Places a new or already existing pentomino piece on the board if there is no collision
     * @param pentomino the piece that should be placed
     * @param row new row position
     * @param col new col position
     * @throws Error if new position is outside the board
     * @returns {boolean} returns false if a collision occurred else true
     */
    movePentominoToPosition(pentomino, row, col) {

        if (!this.pentominoIsValidAtPosition(pentomino, row, col)) {
            if (!this.positionIsValid(row, col)) {
                throw new Error("Position [" + row + "," + col + "] is outside the board");
            } else {
                throw new Error("Pentomino" + pentomino.name + " does not fit at position [" + row + "," + col + "] on the board");
            }
        }

        /**
         * movePentomino always triggered by placePentomino() function, when placePentomino()
         * find that a piece already placed on the board, then it will call this function.
         *
         * Do we need that checking?
         *
         */
        if (!this.isPlacedOnBoard(pentomino)) {
            throw new Error("Pentomino \'" + pentomino.name + "\' does not exist on the board");
        }

        this._pentominoPositions = this._pentominoPositions.filter(
            item => item.name !== pentomino.name);

        this._pentominoPositions.push({
            name: pentomino.name,
            boardPosition: [row, col]
        });
    }

    rotatePentominoAntiClkWise(pentomino) {
        this._doLocalOperationOnPentomino(pentomino, "rotateAntiClkWise", (p) => p.rotateAntiClkWise());
    }

    rotatePentominoClkWise(pentomino) {
        this._doLocalOperationOnPentomino(pentomino, "rotateClkWise", (p) => p.rotateClkWise());
    }

    mirrorPentominoH(pentomino) {
        this._doLocalOperationOnPentomino(pentomino, "mirrorV", (p) => p.mirrorH());
    }

    mirrorPentominoV(pentomino) {
        this._doLocalOperationOnPentomino(pentomino, "mirrorV", (p) => p.mirrorV());
    }

    /**
     * Do a local operation, meaning a operation that does not change the position of the pentomino.
     * @param pentomino
     * @param operationName
     * @param operation
     */
    _doLocalOperationOnPentomino(pentomino, operationName, operation) {
        let tempPentomino = new Pentomino(pentomino.name);
        Object.assign(tempPentomino, pentomino);
        operation(tempPentomino);
        let position = this.getPosition(pentomino);

        if (!this.pentominoIsValid(tempPentomino)) {
            throw new Error("Pentomino" + pentomino.name + "does not fit at position [" + position[0] + "," + position[1] + "] " +
                "after operation" + operationName);
        }
        Object.assign(pentomino, tempPentomino);
        this.placePentomino(pentomino, position[0], position[1]);
    }

    /**
     * Removes a pentomino piece from the board
     * @param pentomino the piece that should be removed
     * @throws {Error} if the pentomino is not placed on the board
     *
     */
    removePentomino(pentomino) {
        if (!this.isPlacedOnBoard(pentomino)) {
            throw new Error("Pentomino with name '" + pentomino.name + "' is not placed on the board.");
        }
        this._pentominoPositions = this._pentominoPositions.filter(
            item => item.name !== pentomino.name);
        this._pentominoes = this._pentominoes.filter(
            item => item.name !== pentomino.name);

    }

    // --- --- --- Getter And Helper --- --- ---
    /**
     * Returns whether the pentomino piece is placed on the board
     * @param pentomino
     * @returns {boolean}
     */
    isPlacedOnBoard(pentomino) {
        return !(this._pentominoes.find(p => p.name === pentomino.name) === undefined);
    }

    /**
     * Get cached position of pentomino inside the board
     * @param pentomino
     * @throws {Error} if pentomino is not placed on the board
     * @returns {Array} [x,y]
     */
    getPosition(pentomino) {
        let boardPosition = null;
        if (!this.isPlacedOnBoard(pentomino)) {
            throw new Error("No pentomino: " + pentomino.name + " placed on the board");
        } else {
            this._pentominoPositions.find((item, index) => {
                if (item.name === pentomino.name) {
                    boardPosition = item.boardPosition;
                }
            }, this);
        }

        return boardPosition;
    }

    /**
     * Get pentomino object by name
     * @param name
     * @throws {Error} if no pentomino with this name is placed on the board
     * @returns pentomino
     */
    getPentominoByName(name) {
        for (let i = 0; i < this._pentominoes.length; i++) {
            let pentomino = this._pentominoes[i];
            if (pentomino.name === name) {
                return pentomino;
            }
        }
        return null;
    }

    /**
     * Get pentomino at the specified position
     * @param row
     * @param col
     * @throws {Error} if the position is outside the board or if there is no pentomino at this position of the board
     * @returns {Pentomino}
     */
    getPentominoesWithPosition(row, col) {
        // FIXME - return list of all pentominoes with this position
        if (!this.positionIsValid(row, col)) {
            throw new Error("Position [" + row + "," + col + "] is outside the board");
        }

        let pentomino = undefined;
        this._pentominoPositions.forEach(function (item) {
            if (item.boardPosition[0] === row && item.boardPosition[1] === col) {
                pentomino = this.getPentominoByName(item.name);
            }
        }, this);
        if (pentomino === undefined) {
            throw new Error("No pentomino at position [" + row + ", " + col + "]");
        } else {
            return pentomino;
        }
    }

    /**
     * Returns an array of all pentomino pieces occupying this cell
     * @param row
     * @param col
     * @returns {Array}
     */
    getPentominoesAtPosition(row, col) {
        if (!this.positionIsValid(row, col)) {
            throw new Error("Position [" + row + "," + col + "] is outside the board");
        }

        let result = [];
        for (let i = 0; i < this._pentominoes.length; i++) {
            let pentomino = this._pentominoes[i];
            let position = this.getPosition(pentomino);

            let matrixPosition = pentomino.getMatrixPosition(position, [row, col]);

            if (pentomino.matrixPositionIsValid(matrixPosition[0], matrixPosition[1])
                && pentomino.getCharAtMatrixPosition(matrixPosition[0], matrixPosition[1]) === '1') {
                result.push(pentomino);
            }
        }
        return result;
    }

    /**
     * Returns whether the position is inside the board
     * @param row
     * @param col
     * @returns {boolean}
     */
    positionIsValid(row, col) {

        row = parseInt(row);
        col = parseInt(col);

        return !(
            (row < this._boardSRows)
            || (row >= (this._boardRows + this._boardSRows))
            || (col < this._boardSCols)
            || (col >= (this._boardCols + this._boardSCols))
        );
    }

    /** Returns whether the pentomino will fit onto the board at the specified position
     *
     * @param pentomino
     * @param anchorRow position to check
     * @param anchorCol position to check
     * @returns {boolean}
     */
    pentominoIsValidAtPosition(pentomino, anchorRow, anchorCol) {
        for (let row = 0; row < pentomino.iRows; row++) {
            for (let col = 0; col < pentomino.iCols; col++) {
                if (pentomino.getCharAtMatrixPosition(row, col) === '1') {
                    let coordinatePosition = pentomino.getCoordinatePosition([anchorRow, anchorCol], [row, col]);
                    if (!this.positionIsValid(coordinatePosition[0], coordinatePosition[1])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    pentominoIsValid(pentomino) {
        let position = this.getPosition(pentomino);
        return this.pentominoIsValidAtPosition(pentomino, position[0], position[1]);
    }

    getUnoccupiedCellSpaces() {
        let spaces = [];

        let remainingUnoccupiedCells = this.getUnoccupiedPositions();
        if (remainingUnoccupiedCells.length === 0) {
            return [[]];
        }
        if (remainingUnoccupiedCells.length === 1) {
            return [[remainingUnoccupiedCells[0]]];
        }

        while (!(remainingUnoccupiedCells.length === 0)) {
            let initCell = remainingUnoccupiedCells[0];
            let space = [initCell];
            remainingUnoccupiedCells = remainingUnoccupiedCells.filter(cell => !(cell === initCell));
            let nextPossibleCells = this._getValidNeighborPositions(initCell[0], initCell[1]);
            this._createSpace(remainingUnoccupiedCells, nextPossibleCells, space);
            spaces.push(space);
        }

        return spaces;
    }

    _createSpace(remainingUnoccupiedCells, nextPossibleCells, space) {
        nextPossibleCells.forEach(possibleNeighbor => {
            let neighborCell = remainingUnoccupiedCells.find(cell => cell[0] === possibleNeighbor[0]
                && cell[1] === possibleNeighbor[1]);

            if (!(neighborCell === undefined)) {
                space.push(neighborCell);
                let index = remainingUnoccupiedCells.findIndex(x => x === neighborCell);
                if (index === -1) throw new Error("No cell found with [" + neighborCell[0] + "," + neighborCell[1] + "]");
                remainingUnoccupiedCells.splice(index, 1);
                this._createSpace(remainingUnoccupiedCells, this._getValidNeighborPositions(neighborCell[0], neighborCell[1]), space);
            }
        });
    }



    _getNeighborPositions(row, col) {
        let positions = [];

        positions.push([row + 1, col]);
        positions.push([row - 1, col]);
        positions.push([row, col + 1]);
        positions.push([row, col - 1]);

        return positions;
    }

    _getValidNeighborPositions(row, col) {
        let unoccupiedNeighbors = [];
        if (this.positionIsValid(row + 1, col)) {
            unoccupiedNeighbors.push([row + 1, col]);
        }
        if (this.positionIsValid(row - 1, col)) {
            unoccupiedNeighbors.push([row - 1, col]);
        }
        if (this.positionIsValid(row, col + 1)) {
            unoccupiedNeighbors.push([row, col + 1]);
        }
        if (this.positionIsValid(row, col - 1)) {
            unoccupiedNeighbors.push([row, col - 1]);
        }
        return unoccupiedNeighbors;
    }

    /**
     * Returns neighboring positions that may be invalid but are not occupied by specified pentomino
     * @param pentomino
     * @param row
     * @param col
     * @returns {[]}
     * @private
     */
    _getNeighbPosnsUnoccByPentomino(pentomino, row, col) {
        let unoccupiedNeighbors = [];
        if (!this.positionIsValid(row + 1, col) || !(this.isOccupied(row + 1, col) === pentomino)) {
            unoccupiedNeighbors.push([row + 1, col]);
        }
        if (!this.positionIsValid(row - 1, col) || !(this.isOccupied(row - 1, col) === pentomino)) {
            unoccupiedNeighbors.push([row - 1, col]);
        }
        if (!this.positionIsValid(row, col + 1) || !(this.isOccupied(row, col + 1) === pentomino)) {
            unoccupiedNeighbors.push([row, col + 1]);
        }
        if (!this.positionIsValid(row, col - 1) || !(this.isOccupied(row, col - 1) === pentomino)) {
            unoccupiedNeighbors.push([row, col - 1]);
        }
        return unoccupiedNeighbors;
    }

    /**
     * Returns neighboring positions of pentomino (could be out of the board)
     */
    _getNeighbPositionsOfPentomino(pentomino) {
        let neighborPositions = [];

        for (let row = 0; row < pentomino.iRows; row++) {
            for (let col = 0; col < pentomino.iCols; col++) {
                if (pentomino.getCharAtMatrixPosition(row, col) === '1') {
                    let position = this.getPosition(pentomino);
                    let coordinatePosition = pentomino.getCoordinatePosition(position, [row, col]);
                    let unoccupiedNeighborPositions = this._getNeighbPosnsUnoccByPentomino(pentomino, coordinatePosition[0], coordinatePosition[1]);
                    unoccupiedNeighborPositions.forEach(unoccupiedNeighborPosition => {
                        let isNewElement = neighborPositions.find(c => c[0] === unoccupiedNeighborPosition[0]
                            && c[1] === unoccupiedNeighborPosition[1]) === undefined;
                        if (isNewElement) {
                            neighborPositions.push(unoccupiedNeighborPosition);
                        }
                    });
                }
            }
        }

        return neighborPositions;
    }

    static arePositionsNeighbors(rowA, colA, rowB, colB) {
        return rowA === rowB && colA + 1 === colB
            || rowA === rowB && colA - 1 === colB
            || colA === colB && rowA + 1 === rowB
            || colA === colB && rowA - 1 === rowB;
    }

    getUnoccupiedPositions() {
        let unoccupiedPositions = [];
        for (let row = this._boardSRows; row < this._boardSRows + this._boardRows; row++) {
            for (let col = this._boardSCols; col < this._boardSCols + this._boardCols; col++) {
                if (!this.isBlockedCell(row, col) && this.isOccupied(row, col) === null) {
                    unoccupiedPositions.push([row, col]);
                }
            }
        }
        return unoccupiedPositions;
    }

    isBlockedCell(row, col) {
        return this._blockedCells.some(pos => row - this._boardSRows === pos[0] && col - this._boardSCols === pos[1]);
    }

    hasUnoccupiedPosition() {
        for (let row = this._boardSRows; row < this._boardSRows + this._boardRows; row++) {
            for (let col = this._boardSCols; col < this._boardSCols + this._boardCols; col++) {
                if (!this.isBlockedCell(row, col) && this.isOccupied(row, col) === null) {
                    return true;
                }
            }
        }
        return false;
    }

    isSolved() {
        return !this.hasUnoccupiedPosition();
    }

    isOccupied(row, col) {
        if (!this.positionIsValid(row, col)) {
            throw new Error("Position [" + row + "," + col + "] is outside the board");
        }

        let pentomino = null;
        this._pentominoes.some(p => {
            let position = this.getPosition(p);
            let matrixPosition = p.getMatrixPosition(position, [row, col]);

            if (p.matrixPositionIsValid(matrixPosition[0], matrixPosition[1])
                && p.getCharAtMatrixPosition(matrixPosition[0], matrixPosition[1]) === '1') {
                pentomino = p;
                return true;
            }
            return false;
        });
        return pentomino;
    }

    getNeighbPentominoesOfCellSpace(space) {
        let neighborPentominoes = [];

        space.forEach(cell => {
            let neighborPositions = this._getValidNeighborPositions(cell[0], cell[1]);
            neighborPositions.forEach(neighborPosition => {
                let pentomino = this.isOccupied(neighborPosition[0], neighborPosition[1]);
                if (!(pentomino === null) && neighborPentominoes.find(p => p.name === pentomino.name) === undefined) {
                    neighborPentominoes.push(pentomino);
                }
            });
        });

        return neighborPentominoes;
    }

    /**
     * Returns all pentomino objects that are currently placed on the board
     * @returns {Array}
     */
    getPentominoes() {
        return this._pentominoes;
    }

    // --- --- -- Debugging --- --- ---
    /**
     * Prints board on html document for debugging purposes.
     */
    writeToDocument() {
        // FIXME
        /*const penColor = Object.freeze({"N":'blue',
                                        "P":'Gainsboro',
                                        "T":'Teal',
                                        "L":'Fuchsia',
                                        "W":'Aqua',
                                        "X":'LightSteelBlue',
                                        "U":'Lime',
                                        "F":'Olive',
                                        "Z":'Maroon',
                                        "I":'AliceBlue',
                                        "V":'Aquamarine',
                                        'Y':"PaleGreen"
                                    });
        var body = document.getElementsByTagName('body')[0];
        var boardTB = document.createElement('table');
        var bBody = document.createElement('tbody');

        boardTB.style.width = '30%';
        boardTB.setAttribute('border', '1');
        boardTB.setAttribute('align', 'center');

        for (var i = 0; i < this._boardColls; i++) {
          var rows = document.createElement('tr');
          for (var j = 0; j < this._boardRows; j++) {
              var cells = document.createElement('td');
              cells.appendChild(document.createTextNode('-'));
              rows.appendChild(cells)
            }
            bBody.appendChild(rows);
          }

        boardTB.appendChild(bBody);
        body.appendChild(boardTB);

        this._pentominoes.forEach(function(pentomino){
            let [bx,by] = this.getPosition(pentomino);
            for(let x = bx; x < pentomino.iRows+bx; ++x){
                let cells = boardTB.rows.item(x).cells;

                for(let y=by; y < pentomino.iCols+by; ++y){
                    if(pentomino.sRepr.charAt(
                        ((x-bx+pentomino.sX)>0?(x-bx+pentomino.sX):(bx-x-pentomino.sX)) *
                        I_COLS +
                        ((y-by+pentomino.sY)>0?(y-by+pentomino.sY):(by-y+pentomino.sY)) ) === '1'){
                        if(cells.item(y).innerHTML === '-'){
                            cells.item(y).innerHTML=pentomino.name;
                            cells.item(y).style.backgroundColor = penColor[pentomino.name];
                        }else{
                            cells.item(y).innerHTML = pentomino.name+','+cells.item(y).innerHTML;
                            cells.item(y).style.backgroundColor = 'red';
                        }
                    }
                }
            }

        },this);
*/
    }

    /**
     * Prints board to console for debugging purposes.
     */
    displayTable() {
        // FIXME
        /*var board =  [];
        for(let i=0; i<this._boardColls; ++i){
            board.push(Array(this._boardRows).fill('-'));
        }
        this._pentominoes.forEach(function(pentomino){
            let [bx,by] = this.getPosition(pentomino);
            for(let x =0; x < I_ROWS; ++x){
                for(let y=0; y < I_COLS; ++y){

                    if(pentomino.sRepr.charAt(x * I_COLS + y) === '1'){
                        if(board[bx+x-pentomino.sX][by+y-pentomino.sY] === '-'){
                            board[bx+x-pentomino.sX][by+y-pentomino.sY]= pentomino.name;
                        }else{
                            board[bx+x-pentomino.sX][by+y-pentomino.sY] =
                                    board[bx+x-pentomino.sX][by+y-pentomino.sY] +','+pentomino.name;
                        }
                    }
                }
            }

        },this);
       console.table(board);
         */
    }

    display() {
        let board = [];
        for (let i = 0; i < this._boardRows; ++i) {
            board.push(Array(this._boardCols).fill('-'));
        }
        this._pentominoes.forEach(function (pentomino) {
            let [anchorRow, anchorCol] = this.getPosition(pentomino);
            for (let relRow = 0; relRow < pentomino.iRows; ++relRow) {
                for (let relCol = 0; relCol < pentomino.iCols; ++relCol) {
                    if (pentomino.getCharAtMatrixPosition(relRow, relCol) === '1') {
                        let coordinatePosition = pentomino.getCoordinatePosition([anchorRow, anchorCol], [relRow, relCol]);
                        let boardCoordX = coordinatePosition[0] - this._boardSRows;
                        let boardCoordY = coordinatePosition[1] - this._boardSCols;

                        if (board[boardCoordX][boardCoordY] === '-') {
                            board[boardCoordX][boardCoordY] = pentomino.name;
                        } else {
                            board[boardCoordX][boardCoordY] = board[boardCoordX][boardCoordY] + ',' + pentomino.name;
                        }
                    }
                }
            }

        }, this);

        console.table(board);

        /**
         * Console table is better otherwise table representation will be messy
         *
         * this below code segment should be removed
        */
        /*
        let string = '   ';
        for (let i = 0; i < board[0].length; i++) {
            string = string + i + ' ';
        }
        console.log(string);
        for (let row = 0; row < this._boardRows; ++row) {
            string = row + '|';
            for (let col = 0; col < this._boardCols; ++col) {
                string = string + ' ';
                string = string + board[row][col];
            }
            string = string + ' |';
            console.log(string);
        }*/
    }
}

if (typeof module != 'undefined') {
    module.exports = Board;
}
