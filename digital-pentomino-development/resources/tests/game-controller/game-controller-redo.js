let assert = require('chai').assert;

let Pentomino = require('../../js/pentomino.js');
let Board = require('../../js/board.js');
let Game = require('../../js/game');
let GameController = require('../../js/game-controller');

let T = new Pentomino('T');
let L = new Pentomino('L');
let F = new Pentomino('F');
let X = new Pentomino('X');

let game = new Game(new Board(7, 7));
let gameController = new GameController();
gameController.setGame(game);

gameController.placePentomino(T, 3, 3);
gameController.movePentominoToPosition(T, 2, 4);
let cm1 = gameController.movePentominoToPosition(T, -1, 50);
gameController.undo();
let cm2 = gameController.movePentominoToPosition(T, 3, 5);
gameController.undo();

describe('GameController', function () {
    describe('#redo()', function () {
        it('should redo a specific command', function () {
            let redoCommands = gameController.getPossibleRedoCommands();
            let redoCommand = redoCommands.find(c => c._row === -1 && c._col === 50);
            assert.ok(!(redoCommand === undefined));
            gameController.redo(redoCommand);
            assert.deepEqual(gameController.getPositionOfPentomino(T), [-1, 50]);
        });
    });
});
