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
gameController.setGame(new Game(new Board(6, 6)));

gameController.placePentomino(T, 3, 4);
gameController.placePentomino(L, 2, 2);
gameController.placePentomino(X, 18, -99);

let commandHistory = gameController.getHistory();
let sndLastCommand = commandHistory.getLastCommand().getParent();
let commandPath = commandHistory.getPathToCommand(sndLastCommand);

describe('CommandHistory', function () {
    describe('#getPathToCommand()', function () {

        it('should calculate necessary undo-operations', function () {
            assert.strictEqual(commandPath.getNumOfUndoCommands(), 1);
            assert.strictEqual(commandPath.getStart(), commandHistory.getLastCommand());
            assert.strictEqual(commandPath.getRedoCommands().length, 0);
        });
    });
});
