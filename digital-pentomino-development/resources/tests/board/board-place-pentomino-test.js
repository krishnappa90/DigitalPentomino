let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');

let rows = 5;
let cols = 7;
let board = new Board(rows, cols);

let X = new Pentomino('X');
let T = new Pentomino('T');
let I = new Pentomino('I');
let X2 = new Pentomino('X');
let L = new Pentomino('L');

board.placePentomino(T, 3, 1);
board.placePentomino(X, 1, 5);
board.placePentomino(I, 2, 6);

describe('Board.placePentomino(pentomino, row, col)', function () {

    it('should save piece at position', function () {
        assert.deepEqual(board.getPosition(T), [3, 1]);
    });

    it('should allow overlapping of pieces', function () {
        assert.deepEqual(board.getPosition(X), [1, 5]);
        assert.deepEqual(board.getPosition(I), [2, 6]);
    });

    it('should throw error if piece is placed outside the board', function () {
        assert.throws(() => board.placePentomino(L, -1, -1));
        assert.throws(() => board.placePentomino(L, -1, 1));
        assert.throws(() => board.placePentomino(L, 1, -1));
        assert.throws(() => board.placePentomino(L, rows, cols));
        assert.throws(() => board.placePentomino(L, rows - 1, cols - 1));
    });

    it('should throw error if piece already exists on board', function () {
        assert.throws(() => board.placePentomino(X, 3, 3));
        assert.throws(() => board.placePentomino(X2, 3, 3));
    });
});
