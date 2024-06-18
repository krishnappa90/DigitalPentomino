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
board.placePentomino(X, 5, 5);

board.display();

describe('Board.getCollisionPentominoesOfPentomino()', function () {

    it('should return a list of the colliding pentominoes', function () {
        assert.strictEqual(board.getCollisionPentominoesOfPentomino(F).length, 2);
        assert.includeDeepMembers(board.getCollisionPentominoesOfPentomino(F), [T, I]);
    });

    it('should return an empty list if no collision occured', function () {
        assert.strictEqual(board.getCollisionPentominoesOfPentomino(X).length, 0);
    });
});
