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

game.placePentomino(I, 3, 3);
game.placePentomino(T, 18, -99);
game.placePentomino(L, 3, 0);
game.placePentomino(U, 4, 0);

describe('Game.rotatePentominoClkWise(pentomino)', function () {

    it('should rotate pieces inside the board', function () {
        assert.ok(game.isPlacedOnBoard(I));
        game.rotatePentominoClkWise(I);
        assert.deepEqual(I.getMatrixRepresentation(), [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ])
        assert.ok(game.isPlacedOnBoard(I));
    });

    it('should rotate pieces outside the board', function () {
        assert.ok(game.isPlacedOutsideBoard(T));
        game.rotatePentominoClkWise(T);
        assert.deepEqual(T.getMatrixRepresentation(), [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0]
        ]);
        assert.ok(game.isPlacedOutsideBoard(T));
    });

    it('should handle pieces that are outside the board after rotation', function () {
        assert.ok(game.isPlacedOnBoard(L));
        game.rotatePentominoClkWise(L);
        assert.deepEqual(L.getMatrixRepresentation(), [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ]);
        assert.ok(game.isPlacedOutsideBoard(L));
    });

    it('should handle pieces that are on the board after rotation', function () {
        assert.ok(game.isPlacedOutsideBoard(U));
        game.rotatePentominoClkWise(U);
        assert.deepEqual(U.getMatrixRepresentation(), [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]);
        assert.ok(game.isPlacedOnBoard(U));
    });
});
