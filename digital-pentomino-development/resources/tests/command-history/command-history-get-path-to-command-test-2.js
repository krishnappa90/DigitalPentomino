let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game');
let GameController = require('../../js/game-controller');

let T = new Pentomino('T');
let L = new Pentomino('L');
let F = new Pentomino('F');
let X = new Pentomino('X');

let gameController = new GameController();
gameController.setGame(new Game(new Board(10, 10)));

// First branch
let placeTCommand = gameController.placePentomino(T, 2, 2);
let placeLCommand = gameController.placePentomino(L, 0, 0);
let placeFCommand = gameController.placePentomino(F, -50, 2);
gameController.movePentominoToPosition(T, 0, 0);
gameController.undo();
let moveFCommand = gameController.movePentominoToPosition(F, 5, 7);
gameController.mirrorPentominoH(L);

// Second branch
gameController.jumpToBeginning();
gameController.placePentomino(F, 4, 5);
gameController.placePentomino(L, 1, 1);
gameController.placePentomino(T, 10, 3);

// Third branch
gameController.jumpToBeginning();
gameController.placePentomino(L, 2, 2);
gameController.placePentomino(T, 0, 0);
gameController.placePentomino(F, -50, 2);
gameController.movePentominoToPosition(T, -1, -4);
gameController.undo();
gameController.movePentominoToPosition(L, 18, -1000);
gameController.movePentominoToPosition(F, -4, 3);
gameController.undo();
gameController.movePentominoToPosition(T, 7, 4);
gameController.undo();

let history = gameController.getHistory();
let commandPath = history.getPathToCommand(moveFCommand);

describe('CommandHistory', function () {
    describe('#getPathToCommand()', function () {

        it('should calculate necessary redo-operations', function () {
            assert.strictEqual(commandPath.getStart(), history.getLastCommand());
            assert.strictEqual(commandPath.getNumOfUndoCommands(), 4);
            assert.strictEqual(commandPath.getRedoCommands().length, 4);

            assert.strictEqual(commandPath.getRedoCommands()[0], placeTCommand);
            assert.strictEqual(commandPath.getRedoCommands()[1], placeLCommand);
            assert.strictEqual(commandPath.getRedoCommands()[2], placeFCommand);
            assert.strictEqual(commandPath.getRedoCommands()[3], moveFCommand);
        });
    });
});
