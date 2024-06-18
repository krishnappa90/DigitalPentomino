//let assert = require('chai').assert;

let HintAI = require('../../js/hint-ai.js');
let Game = require('../../js/game.js');
let Board = require('../../js/board.js');
let GameLoader = require('../../js/game-loader.js');

let garray = GameLoader.getGamesFromSolutionsConfig("board_6x10");
console.log(garray.length);
