let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');

let rows = 6;
let cols = 7;
let board = new Board(rows, cols);

let X = new Pentomino('X');
let T = new Pentomino('T');
let I = new Pentomino('I');
let L = new Pentomino('L');

board.placePentomino(T, 3, 1);
board.placePentomino(X, 4, 2);
board.placePentomino(I, 2, 6);

board.movePentominoToPosition(X, 4, 1);

describe('Board.movePentominoToPosition(pentomino, row, col)', function () {

    it('should save piece at new position', function () {
        assert.deepEqual(board.getPosition(X), [4, 1]);
    });

    it('should throw error if piece is moved outside the board', function () {
        assert.throws(() => board.movePentominoToPosition(X, -1, -1));
        assert.throws(() => board.movePentominoToPosition(X, -1, 1));
        assert.throws(() => board.movePentominoToPosition(X, 1, -1));
        assert.throws(() => board.movePentominoToPosition(X, rows, cols));
        assert.throws(() => board.movePentominoToPosition(X, rows - 1, cols - 1));
    });

    it('should throw error if piece does not exist on board', function () {
        assert.throws(() => board.movePentominoToPosition(L, 2, 2));
    });
});
