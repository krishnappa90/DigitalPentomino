let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game');

let T = new Pentomino('T');
let L = new Pentomino('L');
let F = new Pentomino('F');
let X = new Pentomino('X');
let I = new Pentomino('I');
let U = new Pentomino('U');

let board = new Board(6, 6);
let game = new Game(board);

game.placePentomino(T, 2, 2);
game.movePentominoToPosition(T, 3, 3);

game.placePentomino(I, -8, -800);
game.movePentominoToPosition(I, -1000, 10000);

game.placePentomino(F, 8, 133);
game.movePentominoToPosition(F, 4, 3);

game.placePentomino(U, 2, 4);
game.movePentominoToPosition(U, 5, 5);

describe('Game.movePentominoToPosition(pentomino, row, col)', function () {

    it('should handle moving pieces that are on the board', function () {
        assert.ok(game.isPlacedOnBoard(T));
        assert.deepEqual(game.getPosition(T), [3, 3]);
    });

    it('should handle moving pieces that are outside the board', function () {
        assert.ok(game.isPlacedOutsideBoard(I));
        assert.deepEqual(game.getPosition(I), [-1000, 10000]);
    });

    it('should handle moving pieces from outside the board inside the board', function () {
        assert.ok(game.isPlacedOnBoard(F));
        assert.deepEqual(game.getPosition(F), [4, 3]);
    });

    it('should handle moving pieces from inside the board outside the board', function () {
        assert.ok(game.isPlacedOutsideBoard(U));
        assert.deepEqual(game.getPosition(U), [5, 5]);
    });
});
