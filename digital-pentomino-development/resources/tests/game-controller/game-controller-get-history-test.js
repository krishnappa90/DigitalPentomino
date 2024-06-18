let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game');
let GameController = require('../../js/game-controller');

let T = new Pentomino('T');
let L = new Pentomino('L');
let F = new Pentomino('F');
let X = new Pentomino('X');

let gameController = new GameController();
gameController.setGame(new Game(new Board(6, 6)));

gameController.placePentomino(T, 3, 4);
gameController.placePentomino(L, 2, 2);
gameController.placePentomino(X, 18, -99);

describe('GameController', function () {
    describe('#getHistory()', function () {

        it('should return history', function () {
            // TODO - extend
            assert.ok(!(gameController.getHistory() === null));
        });
    });
});
