let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game');
let GameController = require('../../js/game-controller');

let T = new Pentomino('T');
let L = new Pentomino('L');
let F = new Pentomino('F');
let X = new Pentomino('X');

let game = new Game(new Board(7, 7));
let gameController = new GameController();
gameController.setGame(game);

gameController.placePentomino(T, 3, 3);
gameController.movePentominoToPosition(T, 2, 4);
let cm1 = gameController.movePentominoToPosition(T, -1, 50);
gameController.undo();
let cm2 = gameController.movePentominoToPosition(T, 3, 5);
gameController.undo();

describe('GameController', function () {
    describe('#getPossibleRedoCommands()', function () {
        it('should return redo commands', function () {
            let redoCommands = gameController.getPossibleRedoCommands();
            assert.strictEqual(redoCommands.length, 2);
            assert.ok(redoCommands[0] === cm1 && redoCommands[1] === cm2
                || redoCommands[0] === cm2 && redoCommands[1] === cm1);
        });

        it('should return an empty list if no possible redo commands exist', function () {
            gameController.redo(gameController.getPossibleRedoCommands()[0]);
            let redoCommands = gameController.getPossibleRedoCommands();
            assert.strictEqual(redoCommands.length, 0);
        });
    });
});
