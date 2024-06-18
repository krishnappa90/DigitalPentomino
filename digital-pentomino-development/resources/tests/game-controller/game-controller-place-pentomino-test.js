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
let board = new Board(6, 6);
board.placePentomino(T, 3, 4);
let game = new Game(board);
game.placePentomino(F, 18, -100);

gameController.setGame(game);
gameController.placePentomino(L, 2, 2);
gameController.placePentomino(X, 18, -99);

describe('GameController', function () {
    describe('#placePentomino(pentomino, row, col)', function () {

        it('should save piece that are placed on the board', function () {
            assert.deepEqual(gameController.getPositionOfPentomino(L), [2, 2]);
        });

        it('should save piece that are placed outside the board', function () {
            assert.deepEqual(gameController.getPositionOfPentomino(X), [18, -99]);
        });
    });
});
