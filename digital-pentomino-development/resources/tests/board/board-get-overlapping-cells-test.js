let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');

let board = new Board(7, 7);

let T = new Pentomino('T');
let I = new Pentomino('I');
let X = new Pentomino('X');
let F = new Pentomino('F');

board.placePentomino(T, 2, 3);
board.placePentomino(I, 3, 1);
board.placePentomino(F, 4, 2);

describe('Board.getOverlappingCells()', function () {

    it('should return a list of all overlapping cells', function () {
        let overlappingCells = board.getOverlappingCells(2, 3, T, F);
        assert.deepEqual(overlappingCells,
            [
                { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 },
                { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
                { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }
            ]
        );
    });

    it('should return an empty list if no collision occurred', function () {
        // TODO
    });
});
