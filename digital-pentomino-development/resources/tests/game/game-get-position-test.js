let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game.js');

let game = new Game(new Board(7, 7));

let T = new Pentomino('T');
let I = new Pentomino('I');
let X = new Pentomino('X');

game.placePentomino(T, 1, 3);
game.placePentomino(I, 6, 3);
game.placePentomino(X, -1, -1);

describe('Game.getPosition(pentomino)', function () {

    it('should return position of pentominoes on the board', function () {
        assert.deepEqual(game.getPosition(T), [1, 3]);
        assert.deepEqual(game.getPosition(I), [6, 3]);
    });

    it('should return the position of pentominoes outside the board', function () {
        assert.deepEqual(game.getPosition(X), [-1, -1]);
    });
});
