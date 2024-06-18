let assert = require('chai').assert;

let HintAI = require('../../js/hint-ai.js');
let Game = require('../../js/game.js');
let Board = require('../../js/board.js');

let X = new Pentomino('X');
let T = new Pentomino('T');
let L = new Pentomino('L');
let U = new Pentomino('U');
let N = new Pentomino('N');
let F = new Pentomino('F');
let I = new Pentomino('I');
let P = new Pentomino('P');
let Z = new Pentomino('Z');
let V = new Pentomino('V');
let W = new Pentomino('W');
let Y = new Pentomino('Y');

let game = new Game(new Board([0, 0], [5, 7]));
game.placePentomino(X, -1, -1);
game.placePentomino(T, 4, 5);
game.placePentomino(L, 3, -1);
game.placePentomino(U, 3, -1);
game.placePentomino(N, 3, -1);
game.placePentomino(F, 1, 1);
game.placePentomino(I, 3, -1);
game.placePentomino(P, 3, -1);
game.placePentomino(Z, 3, -1);
game.placePentomino(V, 3, -1);
game.placePentomino(W, 3, -1);
game.placePentomino(Y, 3, -1);

let hintAI = new HintAI();
let hint = hintAI.getHint(game);

game.display();

console.log("Next command: " + hint.getCommand().getName() + " on pentomino '" + hint.getCommand()._pentomino.name + "'");

/*describe('HintAI.getHint(game)', function() {

    it('should TODO', function() {
        // TODO
    });
});*/
