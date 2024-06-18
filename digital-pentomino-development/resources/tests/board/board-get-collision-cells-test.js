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

describe('Board.getCollisionCells()', function () {

    it('should return a list of all colliding cells', function () {
        assert.strictEqual(board.getCollisionCells().length, 2);
        assert.deepEqual(board.getCollisionCells(), [
            {
                "cell": [3, 3],
                "pentominos": ['F', 'T']
            },
            {
                "cell": [4, 1],
                "pentominos": ['F', 'I']
            }
        ]);
    });

    it('should return an empty list if no collision occured', function () {
        // TODO
    });
});
