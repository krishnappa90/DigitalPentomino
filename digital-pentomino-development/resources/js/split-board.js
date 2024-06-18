/**
 * This class contains specific methods for SplitBoard functionality. 
 *  
 * Important methods
 * - splitByColor
 * - splitFromLeftToRight
 *  
 */
if (typeof require != 'undefined') {
    Pentomino = require('./pentomino.js');
    Board = require('./board.js');
    Game = require('./game.js');
    Hint = require('./hint.js');
    HintAI = require('./hint-ai.js');
}

class SplitBoard {

    constructor(game) {
        this._partionedArray;
        this.count = 0;
        this.solutionForSplit;
        this.helpClass = new Help(game);
    }

    splitByColor(game) {
        let closestSolution = this.helpClass.getGameSolution(game, null, 2);        
        
        if (closestSolution == undefined) {
            closestSolution = this.helpClass.getClosestSolution(game);
        }

        let orderPieces = this._operationForSplitting(closestSolution);        
        let relativePosAndPiece = this._getRelativePositionAndPiece(closestSolution, orderPieces);
        let partionedArray = this._splitArrayIntoChunks(relativePosAndPiece);
        return partionedArray;
    }

    splitFromLeftToRight(game) {
        let closestSolution = this.helpClass.getGameSolution(game, null, 1);
        this.solutionForSplit = closestSolution;
        let orderPieces = this._operationForSplitting(closestSolution); 
        let relativePosOfPieceWithAnchorPos = this._getRelativePositionOfPieceWithAnchorPosition(closestSolution, orderPieces);
        let partitionedArray = this._splitArrayIntoChunks(relativePosOfPieceWithAnchorPos);
        this._partionedArray = partitionedArray;
        return partitionedArray;
    }

    /*Common function for SplitByColor and SplitFromLeftToRight */
    _operationForSplitting(closestSolution) {
        let pentominoAnchors = this._getPentominoesAndAnchorPos(closestSolution);
        let orderPieces = this._sortPiecesBasedOnAnchor(pentominoAnchors);
        return orderPieces; 
    }

     /** ---------------  Split Via Partition Checks- If Partition is Filled -------------*/
     /*Checks if divided partition is completely filled to navigate
      to next partition in SplitFromLeftTORight
      */
    partitionHasUnoccupiedPosition(pentomino, game) {               
        let solution = this.solutionForSplit; 
        let pentominoName = pentomino.name;
        
        let gamePentomino = game.getPentominoByName(pentominoName);
        let solutionPentomino = solution.getPentominoByName(pentominoName);        
        
        if (gamePentomino === null) {
            return !solution.isPlacedOnBoard(solutionPentomino);
        }

        if (solutionPentomino === null) {
            return !game.isPlacedOnBoard(gamePentomino);
        }

        if (!game.isPlacedOnBoard(gamePentomino))
            return !solution.isPlacedOnBoard(solutionPentomino);
        else if (solution.isPlacedOnBoard(solutionPentomino)) {
            let gamePentominoPosition = game.getPosition(gamePentomino);
            let solutionPentominoPosition = solution.getPosition(solutionPentomino);            
            return gamePentominoPosition[0] === solutionPentominoPosition[0]
                && gamePentominoPosition[1] === solutionPentominoPosition[1]
                && gamePentomino.sRepr.localeCompare(solutionPentomino.sRepr) === 0;
        } else {
            return false;
        }        
    }

    clearIsSplitActiveFlag() {
        this.helpClass.clearSplitActiveFlag();
    }

    // --- --- --- Bubble Sort --- --- ---        
    _sortPiecesBasedOnAnchor(pentominoAnchors) {
        let len = pentominoAnchors.length;
        for (let i = 0; i < len - 1; i++) {
            for (let j = 0; j < len - 1; j++) {
                if (pentominoAnchors[j][1][1] > pentominoAnchors[j + 1][1][1]) {
                    let tmp = pentominoAnchors[j];
                    pentominoAnchors[j] = pentominoAnchors[j + 1];
                    pentominoAnchors[j + 1] = tmp;
                }
            }
        }
        return pentominoAnchors;
    }

    // --- --- --- Get AnchorPosition and Pentominoes --- --- ---
    /**     
     * @param solutions
     * @returns [[pentominoes,anchorPosofPentominoes]]
     */
    _getPentominoesAndAnchorPos(closestSolution) {
        let pentominoAnchorPos = closestSolution._board._pentominoes.map(pent => {
            let solutionPentomino = closestSolution._board.getPentominoByName(pent.name);
            let pentominoAnchor = closestSolution._board.getPosition(solutionPentomino);
            return [pent.name, pentominoAnchor];
        });

        return pentominoAnchorPos;
    }

    // --- --- --- Calculate Position In Game --- --- ---
    /**        
     * @param solutions
     * @param sortedarray
     * @returns [*]
     */
    _getRelativePositionAndPiece(closestSolution, orderPieces) {
        let finalPosAndPiece = [];
        for (let i = 0; i < orderPieces.length; i++) {
            closestSolution._board._pentominoes.forEach(pent => {
                if (pent.name === orderPieces[i][0]) {
                    let solutionPentomino = closestSolution.getPentominoByName(pent.name);
                    let pentominoAnchor = closestSolution._board.getPosition(solutionPentomino);
                    let pentominoRelPositions = solutionPentomino.getRelPentominoPositions();
                    let pentominoPositions = pentominoRelPositions.map(relPosition => {
                        return solutionPentomino.getCoordinatePosition(pentominoAnchor, relPosition)
                    });                                          
                    
                    finalPosAndPiece.push([solutionPentomino, pentominoPositions]);
                }
            });
        }
        return finalPosAndPiece;
    }   


    // --- --- --- Calculate Relative Position of Pieces in the Partition  --- --- ---
    /**     
     * @param game
     * @param solutions
     * @param sortedarray
     * @returns [*]
     */
    _getRelativePositionOfPieceWithAnchorPosition(closestSolution, orderPieces) {
        let finalPosAndPiece = [];
        for (let i = 0; i < orderPieces.length; i++) {
            closestSolution._board._pentominoes.forEach(pent => {
                if (pent.name === orderPieces[i][0]) {
                    let solutionPentomino = closestSolution.getPentominoByName(pent.name);
                    let pentominoAnchor = closestSolution._board.getPosition(solutionPentomino);
                    let pentominoRelPositions = solutionPentomino.getRelPentominoPositions();
                    let pentominoPositions = pentominoRelPositions.map(relPosition => {
                        return solutionPentomino.getCoordinatePosition(pentominoAnchor, relPosition)
                    });                    
                    finalPosAndPiece.push([solutionPentomino, pentominoPositions, orderPieces[i][1]]);
                }
            });
        }
        return finalPosAndPiece;
    }

    // --- --- --- Split Array Into Chunks --- --- --- 
    /*
    Splits the board solution into three partition
    */   
    _splitArrayIntoChunks(closestSolution) {
        const numberOfSplit = 3;
        const result = [[], [], []];
        const commandSequences = Math.ceil(closestSolution.length / numberOfSplit)

        for (let element = 0; element < numberOfSplit; element++) {
            for (let i = 0; i < commandSequences; i++) {
                const value = closestSolution[i + element * commandSequences]
                if (!value) continue //avoid adding "undefined" values
                result[element].push(value);
            }
        }
        return result;
    }
}

if (typeof module != 'undefined') {
    module.exports = SplitBoard;
}
