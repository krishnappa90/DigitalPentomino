/**
 * This class contains all the hinting specific methods. Strategies to find hints are written in this class.
 * 
 * Important methods
 * - _calculateBestImpossibleUnoccupiedCellSpace
 * - _getNextHint
 * - _getCommandSequenceListToSolution
 *  
 */
if (typeof require != 'undefined') {
    Pentomino = require('./pentomino.js');
    Board = require('./board.js');
    Game = require('./game.js');
    Hint = require('./hint.js');
}

class HintAI {
    constructor(game, loadSolutions = false) {
        this.helpClass = new Help(game);
    }

    /** ---------------  Solutions-------------*/
    getSolutions() {
        return this.helpClass.getSolutions();
    }

    getCurrentSolutionCount(game) {
        return this.helpClass.getPossibleSolutions(game);
    }

    getHint(game, isSplitActive, piecesSelectedForPartition) {
        // let game = this._game;
        let closestSolution = this.helpClass.getGameSolution(game, isSplitActive);

        if (closestSolution !== undefined) {
            let commandSequenceList = this._getCommandSequenceListToSolution(game, closestSolution, piecesSelectedForPartition);
            let commands = this._getNextHint(game, closestSolution, commandSequenceList);
            return new Hint(commands);
        }
        else {
            // Pursue closest game state, which has at least one possible solution
            let nextClosestSolution = this.helpClass.getClosestSolution(game);

            let unoccupiedCellSpaces = game._board.getUnoccupiedCellSpaces();
            let bestImpossibleCellSpace = this._calculateBestImpossibleUnoccupiedCellSpace(game, unoccupiedCellSpaces);

            if (bestImpossibleCellSpace === null) {
                let bestUnreachableCellSpace = this._calculateBestUnreachableCellSpace(game, unoccupiedCellSpaces);

                if (bestUnreachableCellSpace === null) {
                    let commandSequenceList = this._getCommandSequenceListToSolution(game, nextClosestSolution, piecesSelectedForPartition);
                    let misplacedPentominos = this._removeWronglyPlacedPentominos(game, nextClosestSolution);
                    if (misplacedPentominos) {
                        return new Hint([misplacedPentominos]);
                    }
                    let commands = this._getNextHint(game, nextClosestSolution, commandSequenceList);
                    return new Hint(commands);
                } else {
                    let command = this._getCommandBasedOnUnreachableCellsSkill(game, nextClosestSolution, bestUnreachableCellSpace);
                    return new Hint([command], bestUnreachableCellSpace);
                }
            } else {
                let command = this._getCommandBasedOnUnoccupiedCellsSkill(game, nextClosestSolution, bestImpossibleCellSpace);
                return new Hint([command], bestImpossibleCellSpace);
            }
        }
    }

    /**
     * Returns when a pentomino is placed in wrong position. Compared with the
     * @param game
     * @param closestSolution
     */

    _removeWronglyPlacedPentominos(game, closestSolution) {
        let pentominoesOnBoard = game.getAllPentominoes().filter(p => game.isPlacedOnBoard(p));
        
        for (let i = 0; i < pentominoesOnBoard.length; ++i) {
            let isWronglyPlaced = !this.helpClass.isPerfectPentomino(game, closestSolution, pentominoesOnBoard[i].name);
            if (isWronglyPlaced) {
                return new RemoveCommand(game.getPentominoByName(pentominoesOnBoard[i].name),
                    game.getPosition(game.getPentominoByName(pentominoesOnBoard[i].name)));
            }
        }
        return null;
    }

    // --- --- --- Apply Skill --- --- ---
    _calculateBestUnreachableCellSpace(game, unoccupiedCellSpaces) {
        let bestCellSpace = null;
        let bestCellSpaceSize = -1;

        let pentominoesOutsideBoard = game.getPentominoesOutsideBoard();

        unoccupiedCellSpaces.forEach(cellSpace => {
            let i = 0;
            while (i < cellSpace.length) {
                let cell = cellSpace[i];
                let occupiedCells = this._tryToCoverCellWithPentominoes(game, cell, pentominoesOutsideBoard);

                if (!(occupiedCells === null)) {
                    occupiedCells.forEach(occupiedCell => {
                        let index = cellSpace.findIndex(cell => cell[0] === occupiedCell[0] && cell[1] === occupiedCell[1]);

                        if (!(index === -1)) {
                            cellSpace.splice(index, 1);
                            if (index <= i) {
                                i--;
                            }
                        }
                    });
                }

                i++;
            }

            if (cellSpace.length > 0) {
                let separateCellSpaces = this._getSeparateCellSpaces(cellSpace);
                let maxCellSpace = separateCellSpaces.reduce((cellSpace1, cellSpace2) => {
                    return cellSpace1.length > cellSpace2.length ? cellSpace1 : cellSpace2;
                });
                if (maxCellSpace.length > bestCellSpaceSize) {
                    bestCellSpace = maxCellSpace;
                    bestCellSpaceSize = maxCellSpace.length;
                }
            }
        });

        return bestCellSpace;
    }

    /**
     * Returns when a pentomino state is found that covers the cell. Occupied cells are returned.
     * @param game
     * @param cell
     * @param pentominoesOutsideBoard
     * @private
     */
    _tryToCoverCellWithPentominoes(game, cell, pentominoesOutsideBoard) {
        let result = null;

        pentominoesOutsideBoard.some(pentomino => {
            let board = game._board;
            let occupiedCells = this._tryToCoverCellWithPentomino(game, cell, pentomino);
            if (!(occupiedCells === null)) {
                result = occupiedCells;
                return true;
            }
            return false;
        });
        return result;
    }

    _tryToCoverCellWithPentomino(game, cell, pentomino) {
        let result = null;
        let pentominoStates = Pentomino.getDistinctPentominoStates(pentomino);
        pentominoStates.some(pentominoState => {
            let occupiedCells = this._tryToCoverCellWithPentominoState(game, cell, pentominoState);
            if (!(occupiedCells === null)) {
                result = occupiedCells;
                return true;
            }
            return false;
        });
        return result;
    }

    _tryToCoverCellWithPentominoState(game, cell, pentominoState) {
        let result = null;
        let board = game._board;
        let relPentominoPositions = pentominoState.getRelPentominoPositions();
        relPentominoPositions.some(relPentominoPosition => {
            let anchorPosition = pentominoState.getAnchorPosition(cell, relPentominoPosition);
            if (board.pentominoIsValidAtPosition(pentominoState, anchorPosition[0], anchorPosition[1])
                && game.isCollidesAtPosition(pentominoState, anchorPosition[0], anchorPosition[1]).length === 0) {
                result = pentominoState.getRelPentominoPositions().map(relPos =>
                    pentominoState.getCoordinatePosition(anchorPosition, relPos));
                return true;
            }
            return false;
        });

        return result;
    }

    _calculateBestImpossibleUnoccupiedCellSpace(game, unoccupiedCellSpaces) {
        let bestCellSpace = null;
        let bestCellSpaceSize = Number.MAX_VALUE;
        unoccupiedCellSpaces.forEach(space => {
            const PENTOMINO_SIZE = 5;
            if (space.length < bestCellSpaceSize && !(space.length % PENTOMINO_SIZE === 0)) {
                bestCellSpace = space;
                bestCellSpaceSize = space.length;
            }
        });
        return bestCellSpace;
    }

    _getCommandBasedOnUnoccupiedCellsSkill(game, closestSolution, bestImpossibleCellSpace) {
        let neighboringPentominoes = game._board.getNeighbPentominoesOfCellSpace(bestImpossibleCellSpace);
        let nonPerfectPentominoes = neighboringPentominoes.filter(p => !this.helpClass.isPerfectPentomino(game, closestSolution, p.name));
        let pentomino = nonPerfectPentominoes[0];
        return new RemoveCommand(pentomino,
            game.getPosition(pentomino));
    }

    /**
     * Tries find nonperfect pentomino neighboring unreachableCellSpace. If all neighboring pieces are perfect, it
     * just suggest to remove a piece based on _removeWronglyPlacedPentominos.
     * @param game
     * @param closestSolution
     * @param unreachableCellSpace
     * @return {RemoveCommand}
     * @private
     */
    _getCommandBasedOnUnreachableCellsSkill(game, closestSolution, unreachableCellSpace) {
        let neighboringPentominoes = game._board.getNeighbPentominoesOfCellSpace(unreachableCellSpace);
        let nonPerfectPentominoes = neighboringPentominoes.filter(p => !this.helpClass.isPerfectPentomino(game, closestSolution, p.name));

        if (!(nonPerfectPentominoes.length === 0)) {
            let pentomino = nonPerfectPentominoes[0];
            return new RemoveCommand( pentomino,
                game.getPosition(pentomino));
        } else {
            return this._removeWronglyPlacedPentominos(game, closestSolution);
        }
    }

    _getSeparateCellSpaces(cellSpace) {
        let spaces = [];

        let initSpace = [cellSpace.pop()];
        spaces.push(initSpace);

        let spaceCounter = 0;
        let spaceElementCounter = 0;
        let spaceUpperBound = 0;
        while (cellSpace.length > 0) {
            let space = spaces[spaceCounter];
            let spaceElement = space[spaceElementCounter];
            let neighborIndices = [];
            let i = 0;
            cellSpace.forEach(cell => {
                if (Board.arePositionsNeighbors(cell[0], cell[1], spaceElement[0], spaceElement[1])) {
                    space.push(cell);
                    neighborIndices.push(i);
                }
                i++;
            });
            HintAI._deleteIndicesFromArray(cellSpace, neighborIndices);

            if (neighborIndices.length === 0 && spaceElementCounter === spaceUpperBound) {
                let newSpace = [cellSpace.pop()];
                spaces.push(newSpace);
                spaceCounter++;
                spaceElementCounter = 0;
                spaceUpperBound = 0;
            } else if (neighborIndices.length === 0) {
                spaceElementCounter++;
            } else {
                // numOfNeighbors > 0
                spaceUpperBound += neighborIndices.length;
                spaceElementCounter++;
            }
        }

        return spaces;
    }

    static _deleteIndicesFromArray(array, indices) {
        indices.forEach(i => {
            array.splice(i, 1);
            indices.map(j => {
                if (j > i) return j - 1;
                else return j;
            });
        });
    }

    // --- --- --- Calculate All Command Sequences To Solution --- --- ---
    _getCommandSequenceListToSolution(game, solution, piecesSelectedForPartition) {
        let commandSequenceList = new CommandSequenceList();

        let nonPerfectPentominoes = game.getAllPentominoes().filter(p => !this.helpClass.isPerfectPentomino(game, solution, p.name));
        if(piecesSelectedForPartition.length > 0)
            nonPerfectPentominoes = nonPerfectPentominoes.filter(pentomino => piecesSelectedForPartition.indexOf(pentomino.name) >= 0);
        nonPerfectPentominoes.forEach(p => {
            commandSequenceList.addCommandSequence(p.name, this._getCommandsToPerfectPentominoState(game, solution, p));
        });

        return commandSequenceList;
    }

    /**
     * Returns the next command that, when executed, brings the game closer to the solution.
     * @param game
     * @param solution
     * @returns {null}
     */
    /*_getNextCommandsToSolution(game, solution, backtracking) {
        if (game.getAllPentominoes().length === 0) {
            throw new Error("game is empty");
        }

        let pentomino;
        if (backtracking) {
            pentomino = game.getAllPentominoes().find(p => !this._isPerfectPentomino(game, solution, p.name));
        } else {
            let pentominoesOnBoard = game.getAllPentominoes().filter(p => game.isPlacedOnBoard(p));
            pentomino = pentominoesOnBoard.find(p => !this._isPerfectPentomino(game, solution, p.name));
            if (pentomino === undefined || pentomino === null) {
                // no non perfect pentominoes inside the board
                pentomino = game.getAllPentominoes().filter(p => !game.isPlacedOnBoard(p)).find(p => !this._isPerfectPentomino(game, solution, p.name));
            }
        }

        if (pentomino === null || pentomino === undefined) {
            // TODO - handle differently
            throw new Error("All pentominoes are placed perfect");
        }

        let commands = this._getNextCommandsOfPentominoToSolution(game, solution, pentomino);

        if (commands === null || commands === undefined) {
            throw new Error("No next commands found");
        }

        // FIXME - maybe return several commands
        return commands;
    }*/

    /**
     * Returns a command of a specific pentomino, that brings the game closer to the solution
     * @param game
     * @param solution
     * @param gamePentomino
     */
    _getCommandsToPerfectPentominoState(game, solution, gamePentomino) {
        let solutionPentomino = solution.getPentominoByName(gamePentomino.name);

        if (solutionPentomino === null) {
            if (game.isPlacedOnBoard(gamePentomino)) {
                let gamePentominoPos = game.getPosition(gamePentomino);
                return [new RemoveCommand(gamePentomino,
                    [gamePentominoPos[0], gamePentominoPos[1]])];
            } else {
                throw Error("Pentomino " + gamePentomino.name + " is already placed correct.");
            }
        }

        if (game.isPlacedOnBoard(gamePentomino)) {
            if (solution.isPlacedOnBoard(solutionPentomino)) {

                if (!(gamePentomino.sRepr.localeCompare(solutionPentomino.sRepr) === 0)) {
                    // some local operations need to be performed on the pentomino
                    return this._getNextLocalCommandsOfPentominoToSolution(game, solution, gamePentomino, solutionPentomino);
                } else {
                    // pentomino needs to change position
                    let solutionPentominoPosition = solution.getPosition(solutionPentomino);

                    return [new PlaceCommand(gamePentomino,
                        game.getPosition(gamePentomino),
                        [solutionPentominoPosition[0], solutionPentominoPosition[1]])];
                }
            } else {
                // place should be outside board
                let gamePentominoPos = game.getPosition(gamePentomino);
                // FIXME - move outside and not move completely -> Eventually move to tray
                return [new RemoveCommand(gamePentomino,
                    [gamePentominoPos[0], gamePentominoPos[1]])];
            }
        } else {
            if (solution.isPlacedOnBoard(solutionPentomino)) {
                // pentomino should be on board

                if (!(gamePentomino.sRepr.localeCompare(solutionPentomino.sRepr) === 0)) {
                    // some local operations need to be performed on the pentomino
                    return this._getNextLocalCommandsOfPentominoToSolution(game, solution, gamePentomino, solutionPentomino);
                } else {
                    // pentomino needs to change position
                    let solutionPentominoPosition = solution.getPosition(solutionPentomino);
               
                    return [new PlaceCommand(gamePentomino,
                        game.getPosition(gamePentomino),
                        [solutionPentominoPosition[0], solutionPentominoPosition[1]])];
                }
            } else {
                // perfect pentomino
                throw Error("Pentomino " + gamePentomino.name + " is already placed correct.");
            }
        }
    }

    _getNextLocalCommandsOfPentominoToSolution(game, solution, gamePentomino, solutionPentomino) {
        // Correct position
        let operations = this._searchShortestWayForCorrectPentominoState(game, solution, gamePentomino, solutionPentomino, [], []);

        if (operations === null || operations === undefined) {
            throw new Error("State error: no operation sequence found to reach desired pentomino state");
        } else if (operations.length === 0) {
            throw new Error("Illegal State exception");
        } else {
            let commands = operations.map(operation => {
                switch (operation.name) {
                    case "rotateClkWise":
                        return new RotateClkWiseCommand(gamePentomino);
                    case "rotateAntiClkWise":
                        return new RotateAntiClkWiseCommand(gamePentomino);
                    case "mirrorH":
                        return new MirrorHCommand(gamePentomino);
                    case "mirrorV":
                        return new MirrorVCommand(gamePentomino);
                    default:
                        throw new Error("Unrecognized pentomino operation: '" + operations.name + "'");
                }
            });

            if (game.isPlacedOnBoard(gamePentomino)) {
                let gamePentominoPosition = game.getPosition(gamePentomino);
                let solutionPentominoPosition = solution.getPosition(solutionPentomino);
                
                if (!(solutionPentominoPosition[0] === gamePentominoPosition[0])
                    || !(solutionPentominoPosition[1] === gamePentominoPosition[1])) {
                    commands.push(new PlaceCommand(gamePentomino,
                        game.getPosition(gamePentomino),
                        [solutionPentominoPosition[0], solutionPentominoPosition[1]]));
                }
            } else {
                let solutionPentominoPosition = solution.getPosition(solutionPentomino);
                commands.push(new PlaceCommand(gamePentomino,
                    game.getPosition(gamePentomino),
                    [solutionPentominoPosition[0], solutionPentominoPosition[1]]));
            }

            return commands;
        }
    }

    _searchShortestWayForCorrectPentominoState(game, solution, gamePentomino, solutionPentomino, executedOperations, currentBestOperationPath) {
        if (gamePentomino.sRepr.localeCompare(solutionPentomino.sRepr) === 0) {
            currentBestOperationPath.length = 0;
            executedOperations.forEach(operation => currentBestOperationPath.push(operation));
            return currentBestOperationPath;
        }

        if (executedOperations.length >= 3 || (currentBestOperationPath.length > 0 && executedOperations.length >= currentBestOperationPath.length)) {
            return null;
        }

        // No finish -> search goes on
        let result = null;

        let gamePentominoRotateClkWiseCopy = this._executePentominoOperationOnCopy(
            pentomino => pentomino.rotateClkWise(), "rotateClkWise", gamePentomino, executedOperations);
        let rotateClkWiseResult = this._searchShortestWayForCorrectPentominoState(game, solution, gamePentominoRotateClkWiseCopy, solutionPentomino, executedOperations, currentBestOperationPath);
        if (!(rotateClkWiseResult === null)) result = rotateClkWiseResult;
        executedOperations.pop();

        let gamePentominoRotateAntiClkWiseCopy = this._executePentominoOperationOnCopy(
            pentomino => pentomino.rotateAntiClkWise(), "rotateAntiClkWise", gamePentomino, executedOperations);
        let rotateAntiClkWiseResult = this._searchShortestWayForCorrectPentominoState(game, solution, gamePentominoRotateAntiClkWiseCopy, solutionPentomino, executedOperations, currentBestOperationPath);
        if (!(rotateAntiClkWiseResult === null)) result = rotateAntiClkWiseResult;
        executedOperations.pop();

        let gamePentominoCopyMirrorHCopy = this._executePentominoOperationOnCopy(
            pentomino => pentomino.mirrorH(), "mirrorH", gamePentomino, executedOperations);
        let mirrorHResult = this._searchShortestWayForCorrectPentominoState(game, solution, gamePentominoCopyMirrorHCopy, solutionPentomino, executedOperations, currentBestOperationPath);
        if (!(mirrorHResult === null)) result = mirrorHResult;
        executedOperations.pop();

        let gamePentominoMirrorVCopy = this._executePentominoOperationOnCopy(
            pentomino => pentomino.mirrorV(), "mirrorV", gamePentomino, executedOperations);
        let mirrorVResult = this._searchShortestWayForCorrectPentominoState(game, solution, gamePentominoMirrorVCopy, solutionPentomino, executedOperations, currentBestOperationPath);
        if (!(mirrorVResult === null)) result = mirrorVResult;
        executedOperations.pop();

        return result;
    }

    // --- --- --- Get Best Command Sequence To Solution --- --- ---
    _getBestNextCommandsEuclid(game, closestSolution, commandSequenceList) {
        let bestNextCommands = null;
        let bestDistance = Number.MAX_VALUE;

        commandSequenceList.getAllCommandSequences().forEach(commandSequence => {
            let pentominoName = commandSequence["pentominoName"];
            let solutionPentomino = closestSolution.getPentominoByName(pentominoName);
            let solutionPosition = closestSolution.getPosition(solutionPentomino);

            let distance = Math.sqrt(Math.pow(solutionPosition[0] - closestSolution._board._boardSRows, 2)
                + Math.pow(solutionPosition[1] - closestSolution._board._boardSCols, 2));
            if (distance < bestDistance) {
                bestNextCommands = commandSequence["commands"];
                bestDistance = distance;
            }
        });

        return bestNextCommands;
    }

    _getBestNextCommandsMaxOccupiedNeighbors(game, closestSolution, commandSequenceList) {
        let bestNextCommands = null;
        let bestNumUnoccupiedNeighbors = Number.MAX_VALUE;

        commandSequenceList.getAllCommandSequences().forEach(commandSequence => {
            let pentominoName = commandSequence["pentominoName"];
            let solutionPentomino = closestSolution.getPentominoByName(pentominoName);
            let neighboringPositions = closestSolution._board._getNeighbPositionsOfPentomino(solutionPentomino);
            let numUnoccupiedNeighbors = neighboringPositions.length;
            neighboringPositions.forEach(neighboringPosition => {
                if (!game._board.positionIsValid(neighboringPosition[0], neighboringPosition[1]) ||
                    !(game._board.isOccupied(neighboringPosition[0], neighboringPosition[1]) === null)) {
                    numUnoccupiedNeighbors--;
                }
            });
            if (numUnoccupiedNeighbors < bestNumUnoccupiedNeighbors) {
                bestNextCommands = commandSequence["commands"];
                bestNumUnoccupiedNeighbors = numUnoccupiedNeighbors;
            }
        });

        return bestNextCommands;
    }

    _getBestNextCommandsMaxAdjacentEdges(game, closestSolution, commandSequenceList) {
        let bestNextCommands = null;
        let bestAdjacentPentominos = 0;
        let lockedPieceCommand = null;
        let INF = Number.MAX_SAFE_INTEGER;

        if (commandSequenceList.getAllCommandSequences().length == 0) {
            return null;
        }

        lockedPieceCommand = this._getLockedPieceCommand(game, closestSolution, commandSequenceList);
        if (lockedPieceCommand) {
            return [lockedPieceCommand, INF];
        }

        commandSequenceList.getAllCommandSequences().forEach(commandSequence => {
            let pentominoName = commandSequence["pentominoName"];
            let solutionPentomino = closestSolution.getPentominoByName(pentominoName);
            let currAdjacentPentominos = 0;
            let pentominoAnchor = closestSolution._board.getPosition(solutionPentomino);
            let pentominoRelPositions = solutionPentomino.getRelPentominoPositions();
            let pentominoPositions = pentominoRelPositions.map(relPosition => {
                return solutionPentomino.getCoordinatePosition(pentominoAnchor, relPosition)
            });

            pentominoPositions.forEach(position => {

                if (game._board.positionIsValid(position[0] + 1, position[1]) &&
                    game._board.isOccupied(position[0] + 1, position[1])) {
                    currAdjacentPentominos++;
                }
                if (game._board.positionIsValid(position[0], position[1] + 1) &&
                    game._board.isOccupied(position[0], position[1] + 1)) {
                    currAdjacentPentominos++;
                }
                if (game._board.positionIsValid(position[0] - 1, position[1]) &&
                    game._board.isOccupied(position[0] - 1, position[1])) {
                    currAdjacentPentominos++;
                }
                if (game._board.positionIsValid(position[0], position[1] - 1) &&
                    game._board.isOccupied(position[0], position[1] - 1)) {
                    currAdjacentPentominos++;
                }
            });
            if (currAdjacentPentominos > bestAdjacentPentominos) {
                bestNextCommands = commandSequence["commands"];
                bestAdjacentPentominos = currAdjacentPentominos;
            }
        });
        if (!bestNextCommands) {
            let bestNextCommandSequence = UtilitiesClass.getRandomElementFromArray(commandSequenceList.getAllCommandSequences());
            bestNextCommands = bestNextCommandSequence["commands"];
        }
        return [bestNextCommands, bestAdjacentPentominos];
    }

    _getBestNextCommandsMaxCorners(game, closestSolution, commandSequenceList) {
        let bestNextCommands = null;
        let bestAdjacentPentominos = 0;
        let lockedPieceCommand = null;
        let that = this;
        let INF = Number.MAX_SAFE_INTEGER;

        if (commandSequenceList.getAllCommandSequences().length == 0) {
            return null;
        }

        lockedPieceCommand = this._getLockedPieceCommand(game, closestSolution, commandSequenceList);
        if (lockedPieceCommand) {
            return [lockedPieceCommand, INF];
        }

        commandSequenceList.getAllCommandSequences().forEach(commandSequence => {
            let pentominoName = commandSequence["pentominoName"];
            let solutionPentomino = closestSolution.getPentominoByName(pentominoName);
            let currAdjacentPentominos = 0;
            let pentominoAnchor = closestSolution._board.getPosition(solutionPentomino);
            let pentominoRelPositions = solutionPentomino.getRelPentominoPositions();
            let pentominoPositions = pentominoRelPositions.map(relPosition => {
                return solutionPentomino.getCoordinatePosition(pentominoAnchor, relPosition)
            });

            pentominoPositions.forEach(position => {
                currAdjacentPentominos += that._getOuterCorners(position, game, pentominoName);
                currAdjacentPentominos += that._getInnerCorners(position, closestSolution, game, pentominoName);
            });
            if (currAdjacentPentominos > bestAdjacentPentominos) {
                bestNextCommands = commandSequence["commands"];
                bestAdjacentPentominos = currAdjacentPentominos;
            }
        });

        return [bestNextCommands, bestAdjacentPentominos];
    }

    _getLockedPieceCommand(game, closestSolution, commandSequenceList) {
        let pentominoName = null;
        let solutionPentomino = null;
        let emptyNeighborPos = null;

        for (const commandSequence of commandSequenceList.getAllCommandSequences()) {
            pentominoName = commandSequence["pentominoName"];
            solutionPentomino = closestSolution.getPentominoByName(pentominoName);
            emptyNeighborPos = closestSolution._board._getNeighbPositionsOfPentomino(solutionPentomino)
                .filter(neighbour => game._board.positionIsValid(neighbour[0], neighbour[1]))
                .filter(neighbour => !game._board.isOccupied(neighbour[0], neighbour[1]));
            if (emptyNeighborPos.length == 0) {
                return commandSequence["commands"];
            }
        }
        return false;
    }

    _getOuterCorners([row, column], game, pentominoName) {
        let corners = 0;
        let row1 = 0, row2 = 0, col1 = 0, col2 = 0;

        row1 = row + 1;
        col1 = column;
        row2 = row;
        col2 = column + 1;
        if ((!game._board.positionIsValid(row1, col1) || game._board.isBlockedCell(row1, col1) ||
            (game._board.isOccupied(row1, col1) && !this._isSamePentomino(row1, col1, game, pentominoName))) &&
            (!game._board.positionIsValid(row2, col2) || game._board.isBlockedCell(row2, col2) ||
            (game._board.isOccupied(row2, col2) && !this._isSamePentomino(row2, col2, game, pentominoName)))) {
            ++corners;
        }

        row1 = row;
        col1 = column + 1;
        row2 = row - 1;
        col2 = column;
        if ((!game._board.positionIsValid(row1, col1) || game._board.isBlockedCell(row1, col1) ||
            (game._board.isOccupied(row1, col1) && !this._isSamePentomino(row1, col1, game, pentominoName))) &&
            (!game._board.positionIsValid(row2, col2) || game._board.isBlockedCell(row2, col2) ||
            (game._board.isOccupied(row2, col2) && !this._isSamePentomino(row1, col1, game, pentominoName)))) {
            ++corners;
        }

        row1 = row - 1;
        col1 = column;
        row2 = row;
        col2 = column - 1;
        if ((!game._board.positionIsValid(row1, col1) || game._board.isBlockedCell(row1, col1) ||
            (game._board.isOccupied(row1, col1) && !this._isSamePentomino(row1, col1, game, pentominoName))) &&
            (!game._board.positionIsValid(row2, col2) || game._board.isBlockedCell(row2, col2) ||
            (game._board.isOccupied(row2, col2) && !this._isSamePentomino(row1, col1, game, pentominoName)))) {
            ++corners;
        }

        row1 = row;
        col1 = column - 1;
        row2 = row + 1;
        col2 = column;
        if ((!game._board.positionIsValid(row1, col1) || game._board.isBlockedCell(row1, col1) ||
            (game._board.isOccupied(row1, col1) && !this._isSamePentomino(row1, col1, game, pentominoName))) &&
            (!game._board.positionIsValid(row2, col2) || game._board.isBlockedCell(row2, col2) ||
            (game._board.isOccupied(row2, col2) && !this._isSamePentomino(row1, col1, game, pentominoName)))) {
            ++corners;
        }

        return corners;
    }

    _getInnerCorners([row, column], solutionGame, game, pentominoName) {
        let corners = 0;
        let row1 = 0, row2 = 0, col1 = 0, col2 = 0;

        row1 = row + 1;
        col1 = column;
        row2 = row;
        col2 = column + 1;
        if (this._isSamePentomino(row1, col1, solutionGame, pentominoName) &&
            this._isSamePentomino(row2, col2, solutionGame, pentominoName) &&
            game._board.isOccupied(row1, col2) &&
            !this._isSamePentomino(row1, col2, solutionGame, pentominoName)) {
            ++corners;
        }

        row1 = row;
        col1 = column + 1;
        row2 = row - 1;
        col2 = column;
        if (this._isSamePentomino(row1, col1, solutionGame, pentominoName) &&
            this._isSamePentomino(row2, col2, solutionGame, pentominoName) &&
            game._board.isOccupied(row2, col1) &&
            !this._isSamePentomino(row2, col1, solutionGame, pentominoName)) {
            ++corners;
        }

        row1 = row - 1;
        col1 = column;
        row2 = row;
        col2 = column - 1;
        if (this._isSamePentomino(row1, col1, solutionGame, pentominoName) &&
            this._isSamePentomino(row2, col2, solutionGame, pentominoName) &&
            game._board.isOccupied(row1, col2) &&
            !this._isSamePentomino(row1, col2, solutionGame, pentominoName)) {
            ++corners;
        }

        row1 = row;
        col1 = column - 1;
        row2 = row + 1;
        col2 = column;
        if (this._isSamePentomino(row1, col1, solutionGame, pentominoName) &&
            this._isSamePentomino(row2, col2, solutionGame, pentominoName) &&
            game._board.isOccupied(row2, col1) &&
            !this._isSamePentomino(row2, col1, solutionGame, pentominoName)) {
            ++corners;
        }

        return corners;
    }

    _isSamePentomino(row, col, game, pentominoName) {
        try {
            let testPento = game._board.getPentominoesAtPosition(row, col)[0];
            if(testPento.name == pentominoName) {
                return true;
            }
        } catch(error) {
            return false;
        }
        return false;
    }

    _getNextHint(game, closestSolution, commandSequenceList) {
        let bestNextCommands = null,
            objFuncValue = null;
        [bestNextCommands, objFuncValue] = this._getBestNextCommandsMaxCorners(game, closestSolution, commandSequenceList);
        if(objFuncValue < 7) {
            return this._getBestNextCommandsMaxOccupiedNeighbors(game, closestSolution, commandSequenceList);
        }
        return bestNextCommands;
    }

    // --- --- --- Helper functions --- --- ---
    _executePentominoOperationOnCopy(operation, operationName, gamePentomino, executedOperations) {
        executedOperations.push({
            "name": operationName,
            "operation": operation
        });
        let gamePentominoCopy = new Pentomino(gamePentomino.name);
        Object.assign(gamePentominoCopy, gamePentomino);
        executedOperations[executedOperations.length - 1].operation(gamePentominoCopy);

        return gamePentominoCopy;
    }

    // --- --- ---- Load Solutions --- --- ---
    _getMockSolutions() {
        let solutions = [];

        let X = new Pentomino('X');
        let T = new Pentomino('T');
        let L = new Pentomino('L');
        let U = new Pentomino('U');
        let N = new Pentomino('N');
        let F = new Pentomino('F');
        let I = new Pentomino('I');
        let P = new Pentomino('P');
        let Z = new Pentomino('Z');
        let V = new Pentomino('V');
        let W = new Pentomino('W');
        let Y = new Pentomino('Y');

        let game1 = new Game(new Board([0, 0], [5, 7]));

        game1.placePentomino(L, 3, 0);

        game1.placePentomino(F, 1, 1);
        game1.mirrorPentominoV(F);

        game1.placePentomino(I, 0, 4);
        game1.rotatePentominoClkWise(I);

        game1.placePentomino(N, 1, 3);
        game1.rotatePentominoClkWise(N);
        game1.mirrorPentominoH(N);

        game1.placePentomino(P, 4, 2);
        game1.rotatePentominoClkWise(P);

        game1.placePentomino(U, 3, 4);
        game1.rotatePentominoClkWise(U);

        game1.placePentomino(Y, 3, 5);
        game1.rotatePentominoAntiClkWise(Y);
        game1.mirrorPentominoH(Y);

        game1.display();

        let X2 = new Pentomino('X');
        let T2 = new Pentomino('T');
        let L2 = new Pentomino('L');
        let U2 = new Pentomino('U');
        let N2 = new Pentomino('N');
        let F2 = new Pentomino('F');
        let I2 = new Pentomino('I');
        let P2 = new Pentomino('P');
        let Z2 = new Pentomino('Z');
        let V2 = new Pentomino('V');
        let W2 = new Pentomino('W');
        let Y2 = new Pentomino('Y');

        let game2 = new Game(new Board([0, 0], [5, 7]));

        game2.placePentomino(L2, 3, 0);

        game2.placePentomino(I2, 0, 4);
        game2.rotatePentominoClkWise(I2);

        game2.placePentomino(F2, 1, 1);
        game2.mirrorPentominoV(F2);

        game2.placePentomino(P2, 1, 4);
        game2.rotatePentominoAntiClkWise(P2);

        game2.placePentomino(X2, 3, 2);

        game2.placePentomino(U2, 2, 6);
        game2.rotatePentominoAntiClkWise(U2);

        game2.placePentomino(Y2, 3, 4);
        game2.mirrorPentominoV(Y2);

        game2.display();

        solutions.push(game1);
        solutions.push(game2);
        return solutions;
    }
}

if (typeof module != 'undefined') {
    module.exports = HintAI;
}
