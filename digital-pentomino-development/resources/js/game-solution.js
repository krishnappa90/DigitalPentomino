class Solutions {

    static getGamesFromSolutionsConfig(boardname) {
        let gameArray = [];

        //loop over solutionsConfig to find currently active Board
        let tempArray = [];
        for (let boardType in solutionsConfig) {
            //check which board has active status
            if (boardType == boardname) {
                tempArray = solutionsConfig[boardType]["solutionsArray"];
            }
        }

        for (let i = 0; i < tempArray.length; i++) {
            let line = tempArray[i];

            let game = this.getGameFromString(line, boardname);
            gameArray.push(game);
        }

        return gameArray;
    }

    /*  */
    /*TODO: Move to gameLoader class */
    static getGameFromString(gameString, boardname) {

        let rows = gameString.split(" ");
        let height = rows.length;
        let width = rows[0].length;
        let boardStartCoords = UtilitiesClass.getBoardStartCoords(boardname);
        //console.log("Initialize game with height: " + height + " and width: " + width);
        let game = new Game(new Board(boardStartCoords, [height, width]));

        //prepare pentominos for the board
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

        let pentos = [X, T, L, U, N, F, I, P, Z, V, W, Y];

        pentos.forEach(pento => {

            let hasNextOp = true;
            let opsAmount = 0;

            while (hasNextOp) {
                //getMatrixRep for current element
                let matrixRep = pento.getMatrixRepresentation();
                //console.log(matrixRep);

                let boardRep = this.normalizeBoard(gameString, pento.name);
                //console.log(boardRep);

                let position = this.findInParent(matrixRep, boardRep);
                if (position != null) {
                    //console.log("Center of piece " + pento.name + " found: " + position);
                    //console.log("Placing element" + pento.name + " on board...");
                    position[0] += boardStartCoords[0];
                    position[1] += boardStartCoords[1];
                    game.placePentomino(pento, position[0], position[1]);
                    hasNextOp = false;
                } else {
                    //try with different rotate/flip of same pento until all 10 possibilites are reached
                    hasNextOp = this.doNextOperationOnPento(pento, opsAmount);
                    opsAmount = opsAmount + 1;
                }
            }

        });

        return game;
    }


    static doNextOperationOnPento(pentomino, x) {

        switch (x) {
            case 0:
                pentomino.rotateClkWise();
                return true;
                break;
            case 1:
                pentomino.mirrorV();
                return true;
                break;
            case 2:
                pentomino.mirrorV();
                return true;
                break;
            case 3:
                pentomino.rotateClkWise();
                return true;
                break;
            case 4:
                pentomino.mirrorV();
                return true;
                break;
            case 5:
                pentomino.mirrorV();
                return true;
                break;
            case 6:
                pentomino.rotateClkWise();
                return true;
                break;
            case 7:
                pentomino.mirrorV();
                return true;
                break;
            case 8:
                pentomino.mirrorV();
                return true;
                break;
            case 9:
                pentomino.rotateClkWise();
                return true;
                break;
            case 10:
                pentomino.mirrorV();
                return true;
                break;
            case 11:
                pentomino.mirrorV();
                return false;
                break;
            default:
                // console.log("Strange behavior in findingNextOp...");
                return false;
                break;
        }

    }


    static findInParent(smallMatrix, bigMatrix) {
        let centerPosition = [0, 0];

        let a = bigMatrix;
        let b = smallMatrix;

        //iterate over bigger matrix
        for (let i = 0; i < a.length - b.length + 1; i++) {
            for (let j = 0; j < a[0].length - b[0].length + 1; j++) {
                if (a[i][j] == b[0][0]) {
                    let flag = true;
                    for (let k = 0; k < b.length; k++) {
                        for (let l = 0; l < b[0].length; l++) {
                            if (a[i + k][j + l] != b[k][l]) {
                                flag = false;
                                break;
                            }
                        }
                    }
                    if (flag) {
                        centerPosition = [i, j];
                        return centerPosition;
                    }
                }
            }
        }
        return null;
    }


    static normalizeBoard(gameString, element) {
        let rows = gameString.split(" ");
        let height = rows.length;
        let width = rows[0].length;

        // IMPORTANT: normalized board will have +2 height and +2 width to include borders for check
        let nBoard = Array(height + 4).fill(0).map(() => new Array(width + 4).fill(0));
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let stringElement = rows[i][j];
                if (stringElement == element) {
                    nBoard[i + 2][j + 2] = 1;
                }
            }
        }

        return nBoard;
    }


    static transform(someString, element) {
        //e.g. take "FFIIIIILFFPPUULFXPPPULXXXYUULLXYYYY" and "X" as input
        let resultString = '';

        for (var i = 0; i < someString.length; i++) {
            let stringElement = someString[i];
            if (stringElement == element) {
                resultString += '1'
            } else {
                resultString += '0'
            }
        }

        return resultString;
    }

}