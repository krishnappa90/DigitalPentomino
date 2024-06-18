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
gameController.movePentominoToPosition(T, -1, 50);

describe('GameController', function () {
    describe('#undo()', function () {
        it('should undo moving a pentomino to another position', function () {
            assert.strictEqual(gameController.isUndoPossible(), true);
            gameController.undo();
            assert.deepEqual(gameController.getPositionOfPentomino(T), [2, 4]);

            assert.strictEqual(gameController.isUndoPossible(), true);
            gameController.undo();
            assert.deepEqual(gameController.getPositionOfPentomino(T), [3, 3]);
        });

        it('should undo placing a pentomino piece to the board', function () {
            assert.strictEqual(gameController.isUndoPossible(), true);
            gameController.undo();
            assert.strictEqual(gameController._game.isPlacedInGame(T), false);
        });

        it('should fail if there is no command to undo', function () {
            assert.strictEqual(gameController.isUndoPossible(), false);
            assert.throws(() => gameController.undo());
            assert.strictEqual(gameController._game.isPlacedInGame(T), false);
        });
    });
});
