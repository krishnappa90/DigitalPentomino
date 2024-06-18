let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game.js');

let game = new Game(new Board(7, 7));

let T = new Pentomino('T');
let L = new Pentomino('L');
let X = new Pentomino('X');

game.placePentomino(T, 1, 3);
game.placePentomino(X, -1, -1);
game.placePentomino(L, 3, -1);

describe('Game.placePentomino(pentomino, row, col)', function () {

    it('should save piece on the board', function () {
        assert.ok(game.isPlacedOnBoard(T));
        assert.deepEqual(game.getPosition(T), [1, 3]);
    });

    it('should save pieces outside the board', function () {
        assert.ok(game.isPlacedOutsideBoard(X));
        assert.deepEqual(game.getPosition(X), [-1, -1]);
    });

    it('should save pieces, that don\'t fit completely on the board, outside the board', function () {
        assert.ok(game.isPlacedOutsideBoard(L));
        assert.deepEqual(game.getPosition(L), [3, -1]);
    });
});
