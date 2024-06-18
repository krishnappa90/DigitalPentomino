class UtilitiesClass {

    static getRandomElementFromArray(arrayObject) {
        if (Array.isArray(arrayObject)) {
            return arrayObject[Math.floor(Math.random() * arrayObject.length)];
        }
        return undefined;
    }

    static instr(str, keyword, occurance) {
        if (occurance == 1)
            return str.indexOf(keyword, occurance - 1);
        return str.indexOf(keyword, this.instr(str, keyword, occurance - 1) + 1);
    }

    /*
    * Returns a game object of the selected/default game that can be used to draw the board
    */
    static getGameUISettings(boardName) {
        // Dynamically deriving board parameters from solution config
        let solutString = solutionsConfig[boardName].solutionsArray[0];
        let sizeX = ((solutString.match(/ /g) || []).length) + 1;
        let sizeY = solutString.indexOf(' ');

        let boardSize = [sizeX, sizeY];
        let blockedCells = [];
        let gameCellPattern = "gamearea";

        if (solutString.includes('.')) {
            let arr = solutString.split(" ");
            for (let i = 0; i < arr.length; i++) {
                let count = ((arr[i].match(/\./g) || []).length)
                let temp = [i, arr[i].indexOf('.', 0)];

                if (count == 1) {
                    temp = [i, arr[i].indexOf('.', 0)];
                    blockedCells.push(temp);
                }
                else {
                    for (let j = 1; j <= count; j++) {
                        let temp = [i, this.instr(arr[i], '.', j)];
                        blockedCells.push(temp);
                    }
                }
            }
            gameCellPattern = "blockedCell";
        }


        //read gameWidth and gameHeight dynamically from board
        let fieldHTML = document.getElementById('field');
        let heightField = document.getElementById('field').clientHeight;
        let widthField = document.getElementById('field').clientWidth;

        //calculate needed blocks in width based on available height
        //TODO: if height > width invert!
        let blockAmountHeight = boardSize[0] + 4;
        let absHeightPerBlock = heightField / blockAmountHeight;
        let ratioFieldWidthHeight = widthField / heightField;
        let blockAmountWidth = Math.round(blockAmountHeight * ratioFieldWidthHeight);
        //check if wide enough to display full board, else increase boardWidth
        if (blockAmountWidth < boardSize[1] + 4) {
            blockAmountWidth = boardSize[1] + 4;
        }
        baseConfigs.gameHeight = blockAmountHeight;
        baseConfigs.gameWidth = blockAmountWidth;

        return {
            gameHeight: baseConfigs.gameHeight,
            gameWidth: baseConfigs.gameWidth,
            boardSize: boardSize,
            blockedCells: blockedCells || undefined,
            // boardShape: boardConfigs[boardName].boardShape || baseConfigs.boardShape
            gameCellPattern: gameCellPattern
        };
    }

    static getBoardStartCoords(boardName) {
        let gameObject = this.getGameUISettings(boardName);

        return [
            Math.floor((gameObject.gameHeight - gameObject.boardSize[0]) / 2),
            Math.floor((gameObject.gameWidth - gameObject.boardSize[1]) / 2)
        ];
    }

    static disablePointerEventsOnModalOpen() {
        document.getElementById("tray").style.pointerEvents = "none";
        document.getElementById("playarea").style.pointerEvents = "none";
    }

    static enablePointerEventsOnModalClose() {
        document.getElementById("tray").style.pointerEvents = "auto";
        document.getElementById("playarea").style.pointerEvents = "auto";
    }
}