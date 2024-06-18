/**
 * This class is the main driver for the UI related stuff of the application.
 *
 */


const UIProperty = {
    "TrayCSSLeft": 0,
    "TrayHeight": 10,
    "WindowWidth": 100,
    "Sidebar": 0
}
Object.freeze(UIProperty);

const CommandTypes = { "Original": 1, "Shadow": 2, "None": 3 };
Object.freeze(CommandTypes);

const CommandSeq = { "Forward": 1, "Backward": 2 };
Object.freeze(CommandSeq);

function updateCommandAttr(cmdType, cmdSeq) {
    return {
        "cmdType": cmdType,
        "cmdSeq": cmdSeq
    }
}

const cmdAttrDefault = updateCommandAttr(CommandTypes.Original, CommandSeq.Forward);
 //var currentAppliedTheme = SettingsSingleton.getInstance().getSettings().theming.theme;
 //console.log("currentAppliedTheme--->", currentAppliedTheme);
// switch(currentAppliedTheme){
//     case "default":
//         break;

//     case "dayTheme":
//         break;
// }
var alternateColor = ["#77C9D4", "#57B390", "#015249"];
const backGroundColor = '#eceaea';

let lastHintedPentName = null;
let splitPartition = [];
let piecesSelectedForPartition = [];
let styleBlocks;
let splitCounter = -1;
let randomCell;
let count = 0;
let wrongActions = false;
let timeperiod = false;
let highContrastPieceColor = "#000000";
class Visual {

    constructor(pd, type = "reload") {
        this.pd = pd;
        this.gameController = pd.gameController;
        this.boardX = pd.boardStartX;
        this.boardY = pd.boardStartY;
        this.pieces = this.gameController.getAllPentominoes();
        this.selected = false;
        this.replayRunning = false;
        this.overlapBlock = new OverlapBlock();

        this.renderBoard();
        this.renderPieces();
        this.disablePrefillButton(false);
        this.initalizeListeners();
    }

    reload(pd) {
        this.boardX = pd.boardStartX;
        this.boardY = pd.boardStartY;
        this.pieces = this.gameController.getAllPentominoes();
        this.selected = false;
        this.replayRunning = false;
        this.overlapBlock = new OverlapBlock();

        this.renderBoard();
        this.renderPieces();
        let pentominosInGameArea = this.gameController.getPentominoesInGmArea();
        pentominosInGameArea.forEach((pentomino) => {
            this.positionPiece(pentomino);
        });
    }

    getBoard() {
        return this.gameController.getName();
    }

    isBlockCell(posX, posY) {
        var bCellsFnd = false;
        if (this.pd.blockedCells != undefined) {
            this.pd.blockedCells.forEach(function (cells) {
                if (cells[0] + this.boardX == posX && cells[1] + this.boardY == posY) {
                    bCellsFnd = true;
                }
            }, this);
        }

        return bCellsFnd;
    }

    isPentominoInBlockCells(pentomino) {
        var [pX, pY] = this.gameController.getPositionOfPentomino(pentomino);
        var pMatrix = pentomino.getMatrixRepresentation();

        for (let i = 0; i < pentomino.iRows; ++i) {
            for (let j = 0; j < pentomino.iCols; ++j) {
                if (pMatrix[i][j] === 1) {
                    let px = (pX - 2) + i;
                    let py = (pY - 2) + j;
                    if (this.isBlockCell(px, py)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    isCollision(pentomino) {
        let collisionPentominoes = this.gameController.getCollisionOfPentominoes(pentomino);
        if (collisionPentominoes.length != 0) {
            return true;
        } else {
            return false;
        }
    }

    placePentomino(pentomino, posX, posY, cmdProperty = cmdAttrDefault) {
        this.gameController.placePentomino(pentomino, posX, posY, cmdProperty);
        if (SettingsSingleton.getInstance().getSettings().general.enableAudio) {
            let audio = new Audio('resources/audio/snap.wav');
            audio.play();
        }
        this.positionPiece(pentomino);
        if (cmdProperty.cmdType != CommandTypes.Shadow) {
            this.checkIfGameWon();
            if (this.gameController.getOperationCount() == 1) {
                this.saveGameImage(SnapshotType.Original_Auto);
            }
        }
    }

    checkIfGameWon() {
        if (this.gameController.game()._board.isSolved()) {
            this.showGameSolved();
            if (SettingsSingleton.getInstance().getSettings().general.enableAudio) {
                document.getElementById("audioTukaScream").play();
            }
        }
    }
    numberofPlacedPentominos() {
        let NumberOfPentominoes = this.gameController.game()._board._pentominoes.length;
        return NumberOfPentominoes;
    }

    removeFromTray(pentomino) {
        if (pentomino.inTray == 0) {
            return;
        }
        this.gameController.removeFromTray(pentomino);
    }

    movePentominoToTray(pentomino, cmdProperty = cmdAttrDefault) {
        this.gameController.addToTray(pentomino);
        this.gameController.removePentomino(pentomino, cmdProperty);
        this.positionPiece(pentomino);
    }

    reset() {
        this.gameController.resetGame();
        this.pieces = this.gameController.getAllPentominoes();
        this.pd.visual.disableManipulations();
        this.renderPieces();
        this.undoSplit();
        let splitButton = document.getElementById("splitBoardimg");
        if (splitButton.classList.contains("splitbuttonimg")) {
            splitButton.classList.remove("splitbuttonimg");
        }
    }

    renderBoard() {
        let fieldHTML = document.getElementById('field');
        let out = '';
        let heightField = document.getElementById('field').clientHeight;
        let widthField = document.getElementById('field').clientWidth;

        let width = 100 / baseConfigs.gameWidth;
        let height = 100 / baseConfigs.gameHeight;

        /*The field consists of divs. Each div saves in its id field its resepective coorinates*/
        for (var row = 0; row < baseConfigs.gameHeight; row++) {
            for (var col = 0; col < baseConfigs.gameWidth; col++) {

                var isBoard = true;   //indicate where on the field the board is
                var blockedCell = false;
                //Check for blocked elements
                if (col < this.pd.boardStartY) isBoard = false;
                if (col >= this.pd.boardStartY + this.gameController.getBoardSize()[1]) isBoard = false;
                if (row < this.pd.boardStartX) isBoard = false;
                if (row >= this.pd.boardStartX + this.gameController.getBoardSize()[0]) isBoard = false;
                //Ashwini: For Blocking the cells
                if (this.pd.blockedCells != undefined) {
                    var gameCellPattern = this.pd.gameCellPattern;
                    for (var arr = 0; arr < this.pd.blockedCells.length; arr++) {
                        if (row == this.pd.blockedCells[arr][0] + this.pd.boardStartX &&
                            col == this.pd.blockedCells[arr][1] + this.pd.boardStartY) {
                            blockedCell = true;
                            break;
                        }
                    }

                    let fieldTop = (row * width) + 10 + 'vw';
                    let fieldLeft = (col * width) + 'vw';

                    if (blockedCell && gameCellPattern == 'blockedCell')
                        out += '<div class="gamearea ' + ((isBoard) ? 'boardarea blockedcell' : '') + '" id="field_' + row + ',' + col + '" title="' + row + ',' + col + '" style="left:' + fieldLeft + ';top:' + fieldTop + ';width:' + width + 'vw;height:' + width + 'vw;"></div>';
                    else if (blockedCell && gameCellPattern == 'gamearea')
                        out += '<div class="gamearea" id="field_' + row + ',' + col + '" title="' + row + ',' + col + '" style="left:' + fieldLeft + ';top:' + fieldTop + ';width:' + width + 'vw;height:' + width + 'vw;"></div>';
                    else
                        out += '<div class="gamearea ' + ((isBoard) ? 'boardarea' : '') + '" id="field_' + row + ',' + col + '" title="' + row + ',' + col + '" style="left:' + fieldLeft + ';top:' + fieldTop + ';width:' + width + 'vw;height:' + width + 'vw;"></div>';
                }
                else
                    out += '<div class="gamearea ' + ((isBoard) ? 'boardarea' : '') + '" id="field_' + row + ',' + col + '" title="' + row + ',' + col + '" style="left:' + fieldLeft + ';top:' + fieldTop + ';width:' + width + 'vw;height:' + width + 'vw;"></div>';   //'+col+','+row+'
            }
        }

        fieldHTML.innerHTML = out;
    }

    /**
     * Create the visual representations of the pieces
     * */

    renderPieces() {

        //TODO: Check whether in the innerHTML approach is good here!

        /**
         * Thoughts: It is okay if renderPieces is only called at the start of a game and pice
         * updates are handeled differently.
         *
         * If this function should also handle updates, it should rather check whether elements
         * already exist and update their respective properties instead of creating the pieces
         * again and again.
        */

        let pieceArea = document.getElementById('piecearea');
        let trayArea = document.getElementById('tray');
        let trayout = '';
        let out = '';
        var width = UIProperty.WindowWidth / this.pd.gameWidth;
        this.pieces.forEach(piece => {
            let bitMap = piece.getMatrixRepresentation();

            /**
             * this are the bouding boxes into which the piece itself is "painted" setting
             * to display:none avoids the appearing for a split second before positioning
             *
            */
            trayout += '<div class="trayPosition" id="tray_' + piece.trayPosition + '" style="width:' + (5 * width) + 'vw;height:' + (5 * width) + 'vw;display:block;z-index:0;"></div>';
            out += '<div class="piece" id="piece_' + piece.name + '" style="width:' + (5 * width) + 'vw;height:' + (5 * width) + 'vw;display:none;z-index:0;">';

            //this "paints" the bitmap of the pice into the bounding box
            for (var i in bitMap) {
                var row = bitMap[i];
                for (var j in row) {
                    var set = bitMap[i][j];
                    let bmLeft = (j * width) + 'vw';
                    let bmTop = (i * width) + 'vw';
                    out += '<div style="display:block;position:fixed;top:' + bmTop + ';left:' + bmLeft + ';width:' + width + 'vw;height:' + width + 'vw;' + ((set) ? 'background:' + piece.color : '') + '" class="' + ((set) ? 'bmPoint' : 'bmAround') + '"></div>';
                }
            }
            out += '</div>';

            //positioning the pieces has to happen after the elements are created
            //TODO: this is a disadvantage of chosing the innerHTML approach.

            setTimeout(function (that, piece) {
                that.positionPiece(piece);
            }, 0, this, piece);

        });

        trayArea.innerHTML = trayout;
        pieceArea.innerHTML = out;
        this.pieces.forEach(piece => {
            let trayElement = document.getElementById('tray_' + piece.trayPosition);

            let widthVW = UIProperty.TrayCSSLeft + (piece.trayPosition) * 7.2;
            let magnification = 8 / (5 * width);
            trayElement.style.left = widthVW + 'vw';
            trayElement.style.top = '.7vw';
            trayElement.style.transformOrigin = 'top';
            trayElement.style.setProperty("--magnification", magnification);
            trayElement.style.setProperty("--rotationX", "0deg");
            trayElement.style.setProperty("--rotationY", "0deg");
            trayElement.style.setProperty("--rotationZ", "0deg");
        });

    }

    positionPiece(piece) {

        var width = UIProperty.WindowWidth / this.pd.gameWidth;
        var htmlElement = document.getElementById('piece_' + piece.name);

        if (piece.inTray) {
            var widthVW = 100 / 12 * piece.trayPosition; //UIProperty.TrayCSSLeft + (piece.trayPosition) * width;
            var magnification = 8 / (5 * width);
            htmlElement.style.left = widthVW + 'vw';
            htmlElement.style.top = '' + 0.1 * UIProperty.TrayHeight + 'vw'; //position pieces in tray around 20% from top
            htmlElement.style.transformOrigin = 'left top';
            htmlElement.style.setProperty("--magnification", magnification);
            htmlElement.style.setProperty("--rotationX", "0deg");
            htmlElement.style.setProperty("--rotationY", "0deg");
            htmlElement.style.setProperty("--rotationZ", "0deg");

            if (piecesSelectedForPartition.length != 0 && splitCounter <= 1) {
                let containsDisplayedPieceName = piecesSelectedForPartition.indexOf(piece.name);
                if (containsDisplayedPieceName === -1) {
                    htmlElement.style.display = 'none';

                }
                else if (containsDisplayedPieceName >= 0) {
                    htmlElement.style.display = 'block';
                }
            }


        }
        else {
            var bCellsFnd = this.isPentominoInBlockCells(piece);
            var collisonFnd = this.isCollision(piece);
            if (collisonFnd) {
                let collisonPentomino = this.gameController.getCollisionOfPentominoes(piece).pop();
                this.overlapBlock.add(piece, collisonPentomino);
                if (SettingsSingleton.getInstance().getSettings().general.enableAudio) {
                    let audio = new Audio('resources/audio/collision.mp3');
                    audio.play();
                }
            }
            else {
                this.overlapBlock.remove(piece);
            }

            var offset = (bCellsFnd || collisonFnd) ? true : false;
            let [positionY, positionX] = this.gameController.getPositionOfPentomino(piece);
            let left = undefined;
            let top = undefined;
            if (offset) {
                left = UIProperty.Sidebar + width * (positionX - 2) + (width / 8);
                top = UIProperty.TrayHeight + width * (positionY - 2) - (width / 8);
            }
            else {
                left = UIProperty.Sidebar + width * (positionX - 2);
                top = UIProperty.TrayHeight + width * (positionY - 2);
            }

            htmlElement.style.zIndex = this.overlapBlock.getZIndex(piece);
            htmlElement.style.left = left + 'vw';
            htmlElement.style.top = top + 'vw';
            htmlElement.style.transformOrigin = 'center';
            htmlElement.style.setProperty("--magnification", 1);

            //code for adding pieceWrapper for resolving the zindex issue on ipad. Important, do not modify.
            let wrapper = "pieceWrapper_" + piece.name;
            if (!$('#piece_' + piece.name).parent().attr('#' + wrapper)) {
                let wrapperClassString = "<div class = 'pieceWrapper' id = " + wrapper + "></div>";
                if ($(htmlElement).parent().attr('class') != 'pieceWrapper') {
                    $(htmlElement).wrap(wrapperClassString);
                }
                let pieceWrapper = document.getElementById(wrapper);
                pieceWrapper.style.zIndex = this.overlapBlock.getZIndex(piece);
            }
        }
        if (htmlElement.style.getPropertyValue("--rotationX") === "") {
            htmlElement.style.setProperty("--rotationX", "0deg");
            htmlElement.style.setProperty("--rotationY", "0deg");
            htmlElement.style.setProperty("--rotationZ", "0deg");

        }

        //making the element visible (see remark in renderPieces)
        htmlElement.style.display = 'block';

        if (piecesSelectedForPartition.length != 0 && splitCounter <= 1) {
            let containsDisplayedPieceName = piecesSelectedForPartition.indexOf(piece.name);
            if (containsDisplayedPieceName === -1) {
                htmlElement.style.display = 'none';
            }
            else if (containsDisplayedPieceName >= 0) {
                htmlElement.style.display = 'block';
            }
        }
    }

    select(piece, x, y) {
        this.selected = piece;
        if (piece.inTray) {
            this.disableManipulations();
        }
        else if ($("#modalFormContainerID").is(":visible")) {
            this.disableManipulations();
        }
        else {
            this.showManipulations(piece, x, y);
        }
    }

    deleteSelection() {
        if (!this.selected) return;
        this.selected = false;
        this.pd.visual.disableManipulations();
    }


    hexToRgb(hex) {
        var rgbFormat = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return rgbFormat ? {
            r: parseInt(rgbFormat[1], 16),
            g: parseInt(rgbFormat[2], 16),
            b: parseInt(rgbFormat[3], 16)
        } : null;
    }

    //Enable or Disable manipulation buttons

    showManipulations(piece, x, y) {
        let clientRect = document.getElementById("piece_" + piece.name).getBoundingClientRect();
        let [x1Position, y1Position] = [clientRect.x + clientRect.width / 2, clientRect.y + clientRect.height / 2];
        let [x2Position, y2Position] = [clientRect.right + clientRect.width / 2, clientRect.bottom + clientRect.height / 2];
        let width = UIProperty.WindowWidth / this.pd.gameWidth;
        let gameWidth = document.getElementById("game").clientWidth;
        let gameHeight = document.getElementById("game").clientHeight;

        if (gameHeight > gameWidth) {
            document.documentElement.style.setProperty('--heightB', '36vw');
        }
        else {
            document.documentElement.style.setProperty('--heightB', '43vh');
        }

        let pieceMan = document.getElementById('pieceManipulation').querySelectorAll("[class^='buttonInside']");
        for (let i = 0; i < pieceMan.length; i++) {
            let colorR = this.hexToRgb(this.selected.color).r;
            let colorG = this.hexToRgb(this.selected.color).g;
            let colorB = this.hexToRgb(this.selected.color).b;
            pieceMan[i].style.background = "rgba(" + [colorR, colorG, colorB, 0.7].join(',') + ")";
        }

        if ((x + 280 > gameWidth)) {
            /* Right Most Manipulation Button */
            if ((y1Position > 0) && (y1Position < gameHeight)) {
                document.getElementById('pieceManipulation').style.left = 'calc(' + x1Position + 'px - ' + (width * -.09) + 'vw)';
                document.getElementById('pieceManipulation').style.top = 'calc(' + y2Position + 'px - ' + (width * 2) + 'vw)';
                document.getElementById('pieceManipulation').style.display = 'block';
                document.documentElement.style.setProperty("--rotateV", "-133deg");
                document.documentElement.style.setProperty("--rotateH", "-98deg");
                document.documentElement.style.setProperty("--buttonRotC", "28deg");
                document.documentElement.style.setProperty("--buttonRotB", "63deg");
                document.documentElement.style.setProperty("--buttonRotA", "98deg");
                document.documentElement.style.setProperty("--buttonRotD", "133deg");
            }
        } else if ((x > 0) && (x < 170)) {
            /* Left Most Manipulation Button */
            document.getElementById('pieceManipulation').style.left = 'calc(' + x1Position + 'px - ' + (width * -0.09) + 'vw)';
            document.getElementById('pieceManipulation').style.top = 'calc(' + y2Position + 'px - ' + (width * 2) + 'vw)';
            document.getElementById('pieceManipulation').style.display = 'block';
            document.documentElement.style.setProperty("--rotateV", "168deg");
            document.documentElement.style.setProperty("--rotateH", "128deg");
            document.documentElement.style.setProperty("--buttonRotC", "-48deg");
            document.documentElement.style.setProperty("--buttonRotB", "-88deg");
            document.documentElement.style.setProperty("--buttonRotA", "-128deg");
            document.documentElement.style.setProperty("--buttonRotD", "-168deg");
        }
        else {
            document.getElementById('pieceManipulation').style.left = 'calc(' + x1Position + 'px - ' + (width * 0.05) + 'vw)';
            document.getElementById('pieceManipulation').style.top = 'calc(' + y2Position + 'px - ' + (width * 2) + 'vw)';
            document.getElementById('pieceManipulation').style.display = 'block';
            document.documentElement.style.setProperty("--rotateV", "-108deg");
            document.documentElement.style.setProperty("--rotateH", "-148deg");
            document.documentElement.style.setProperty("--buttonRotD", "108deg");
            document.documentElement.style.setProperty("--buttonRotA", "148deg");
            document.documentElement.style.setProperty("--buttonRotB", "188deg");
            document.documentElement.style.setProperty("--buttonRotC", "228deg");
        }

    }

    disableManipulations() {
        document.getElementById('pieceManipulation').style.display = 'none';
    }

    blockPartition() {
        let partitionedArray = splitPartition[splitCounter]
        let piecesDisplayed = [];
        for (let i = 0; i < partitionedArray.length; i++) {
            piecesDisplayed.push(partitionedArray[i][0].name);
        }
        this.pieces.forEach(piece => {
            let containsDisplayedPieceName = piecesDisplayed.indexOf(piece.name)
            if (containsDisplayedPieceName >= 0) {
                document.getElementById('piece_' + piece.name).classList.add("disabledbutton");
            }
        });


    }
    // 	save(piece) {
    // 		console.log("insave::",piece)
    // 	  	localStorage.setItem('piece',piece);
    // 	}

    // load() {
    //   let piece2 = localStorage.getItem('piece');
    //   document.getElementById('operations').style.display='block';
    //   console.log("getting state::",piece2)
    // }


    //initialize input listeners.
    initalizeListeners() {

        var that = this;
        let onpointerdownX = "";
        let onpointerdownY = "";

        /**
         * pointer events generalize mouse and touch events the events are registered on
         * the document object in order to avoid problems of losing objects when moving
         * too fast (which can happen in mouse interaction). Ad differnt things have to
         * happen in relation to different kinds of objects and in different states of
         * the application this basically becomes a big state automaton.
         *
         */

        document.onpointerdown = function (event) {//clicking or moving begins
            var elements = document.elementsFromPoint(event.clientX, event.clientY);
            onpointerdownX = event.clientX;
            onpointerdownY = event.clientY;

            //close seedbar
            if (!event.target.matches('.seed') && !event.target.matches('.cSeedBtn')) {
                closeSeeding();
            }

            //check if a button is clicked
            let buttonOverPiece = false;
            let settingsEnabled = false;
            for (let j in elements) {
                let precheck = elements[j].className;
                if (precheck.startsWith('icon-')) {
                    buttonOverPiece = true;
                }
                if (precheck == 'settings-popup') {
                    settingsEnabled = true;
                }
            }

            for (var i in elements) {
                var check = elements[i].className;
                //if button is clicked, forget the rest

                if (check !== 'bmPoint') continue;

                if (buttonOverPiece) continue;

                if (settingsEnabled) continue;

                /**
                 * As soon as we have a bmPoint(an element of a piece),we determine the bounding box
                 * and the piece object itself and save those into a global variable "currentlyMoving"
                 * which we access during movement and at the end of movement.
                 */

                var piece = elements[i * 1 + 1].id.split('_')[1];
                if (!piece) return;
                var container = elements[i * 1 + 1];       //For some strange reason, i is a String, using *1 to convert it
                var piece = that.pieces.find(p => { return p.name === piece; });
                window.currentlyMoving = [container, piece];
                break;
            }
            return;

        }

        /**
         * move an object in case a drag operation stared on a piece (see above)
         */

        document.onpointermove = function (event) {

            if (window.currentlyMoving) {
                var x = event.clientX;
                var y = event.clientY;
                var container = window.currentlyMoving[0];
                //resize object to full size while moving and attach their center to the pointer
                var width = UIProperty.WindowWidth / that.pd.gameWidth;
                //set new style for left and top value of element, BUT do not cross borders
                var gameWidth = document.getElementById("game").clientWidth;
                var gameHeight = document.getElementById("game").clientHeight;
                var trayHeight = document.getElementById("tray").clientHeight;
                var fieldHeight = document.getElementById("field").clientHeight;
                var functionsHeight = document.getElementById("functions_navbar").clientHeight;
                that.disableManipulations();

                var diff = gameHeight - (fieldHeight + trayHeight);

                //TODO: Add handling of borders
                if ((x > 0) && (x < gameWidth)) {
                    if ((y > 0) && (y < (gameHeight - functionsHeight))) {

                        container.style.left = 'calc(' + x + 'px - ' + (width * 2.5) + 'vw)';
                        container.style.top = 'calc(' + y + 'px - ' + (width * 2.5) + 'vw)';
                        container.style.transformOrigin = '50% 50%';
                        container.style.zIndex = 100;
                        container.parentNode.style.zIndex = 100;
                        container.style.setProperty("--magnification", 1);
                    }
                }
            }
        }

        /**
         * this is called when mouse key is released or fingers are removed from the screen
         */
        document.onpointerup = function (event) {
            /**
             * this is called when mouse key is released or fingers are removed from the screen
             * in case of just a click operation (not move operation) piece should not move
             */

            if (onpointerdownX == event.clientX &&
                onpointerdownY == event.clientY &&
                window.currentlyMoving) {
                let data_ = window.currentlyMoving;
                window.currentlyMoving = false;
                that.positionPiece(data_[1]);
                that.select(data_[1], event.clientX, event.clientY);
                return;
            }
            let pentominoList = that.gameController.getAllPentominoes();
            if (window.currentlyMoving) {

                /*  In case an object was in the process of being moved, this changes the movement.
                    which means it is determined, where it was moved to and then the backend is informed
                    about that movement (which in turn  repositions the element so it snaps to the grid)
                */
                var data = window.currentlyMoving;
                let trayPos = 0;
                let flagCheckPartitionSolved = false;
                let pentominoList = that.gameController.getAllPentominoes();
                window.currentlyMoving = false;
                var elements = document.elementsFromPoint(event.clientX, event.clientY); //determine the target
                for (let i in elements) {
                    let element = elements[i];

                    if (element.className == 'trayPosition') {
                        this.trayPos = element.id.split('_')[1];
                    }
                }
                for (var i in elements) {
                    var element = elements[i];
                    var id = element.id;
                    /**
                     * when piece is moved back to tray reset Pentomio inTray variable to 1 and place the
                     * piece in Tray */
                    if (id == 'tray') {
                        let piece = data[1];
                        let newPos = Number(this.trayPos);
                        let trayOverlapFlag = that.isTrayOverlap(pentominoList, newPos);
                        let minEmptyPos;
                        let totalCount = pentominoList.length;
                        let emptyTrayList = that.getEmptyTrayPos(pentominoList);
                        if (piece.inTray == 1) {
                            emptyTrayList.push(piece.trayPosition);
                        }
                        let arr = [];
                        emptyTrayList.forEach((l_rec) => {
                            arr.push(Math.abs(l_rec - newPos));
                        });

                        let closest = arr.indexOf(Math.min.apply(null, arr));
                        if (emptyTrayList.length != 0) {
                            minEmptyPos = Math.min.apply(null, emptyTrayList);
                        }
                        pentominoList.forEach((pentomino) => {
                            let tempTrayPos = Number(pentomino.trayPosition);

                            if (pentomino.inTray == 1 && tempTrayPos >= newPos && tempTrayPos <= emptyTrayList[closest] && trayOverlapFlag == true) {
                                pentomino.trayPosition = tempTrayPos + 1;
                                that.positionPiece(pentomino);
                                pentominoList.forEach((pent) => {
                                    let tempTrayPos1 = Number(pent.trayPosition);
                                    if (pent.inTray == 0 && (tempTrayPos + 1) == tempTrayPos1) {
                                        pent.trayPosition = Number(piece.trayPosition);
                                    }
                                });
                            }
                            else if (pentomino.inTray == 1 && tempTrayPos <= newPos && tempTrayPos >= emptyTrayList[closest] && trayOverlapFlag == true) {
                                pentomino.trayPosition = tempTrayPos - 1;
                                that.positionPiece(pentomino);
                                pentominoList.forEach((pent) => {
                                    let tempTrayPos1 = Number(pent.trayPosition);
                                    if (pent.inTray == 0 && (tempTrayPos - 1) == tempTrayPos1) {
                                        pent.trayPosition = Number(piece.trayPosition);
                                    }
                                });
                            }
                            else if (pentomino.inTray == 0 && tempTrayPos == newPos) {
                                pentomino.trayPosition = Number(piece.trayPosition);
                            }

                        });

                        piece.trayPosition = newPos;
                        that.positionPiece(piece);
                        that.movePentominoToTray(piece);
                        that.disableManipulations();
                    }

                    if (id.split('_')[0] == 'field') {
                        var coords = (id.split('_')[1].split(','));
                        that.removeFromTray(data[1]);
                        that.placePentomino(data[1], coords[0], coords[1]);
                        var selectedPiece = document.getElementById('piece_' + data[1].name);
                        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
                            that.showNumberOfPossibleSolutions();
                        }
                        /**
                         * make this the selected element which activates manipulation GUI data[1].select();
                         *
                         * TODO: Make buttons disappear/appear if nothing/something is selected
                         */
                        that.select(data[1], event.clientX, event.clientY);
                        flagCheckPartitionSolved = that.checkPartitionSolved();
                        if (flagCheckPartitionSolved) {
                            that.blockPartition();
                            that.displayPartitionFromL2R();
                        }

                        return;
                    }
                }
            } else {
                // In case nothing was moving, this becomes an unselect operation
                var elements = document.elementsFromPoint(event.clientX, event.clientY);
                for (var i in elements) {
                    var element = elements[i];
                    if (element.id == 'functions_navbar' || element.id.startsWith('insideWrapper')) return; //do not unselect if operations have been applied to the functions panel
                }
                that.deleteSelection();
            }
        }
    }
    isTrayOverlap(pentominoList, pos) {
        let overlapFlag = false;
        pentominoList.forEach((pentomino) => {
            if (pentomino.trayPosition == pos) {
                if (pentomino.inTray == 1) {
                    overlapFlag = true;
                }
                else {
                    overlapFlag = true;
                }
            }
        });
        return overlapFlag;
    }

    getEmptyTrayPos(pentominoList) {
        let emptyTrayList = [];
        let l_count = 0;

        pentominoList.forEach((pentomino) => {
            if (pentomino.inTray == 0) {
                emptyTrayList.push(pentomino.trayPosition);
                l_count = l_count + 1;
            }
        });

        return emptyTrayList;
    }

    updateDOMWithPentomino(piece) {
        let isColorSplitActive = document.querySelector(".splitbuttonimg") !== null &&
        SettingsSingleton.getInstance().getSettings().splitPartition.splitStrategy == "color";
        let oldPieceDiv = document.getElementById("piece_" + piece.name);
        let pieceBitMap = piece.getMatrixRepresentation();
        let width = UIProperty.WindowWidth / this.pd.gameWidth;
        let newDiv = document.createElement("div");
        let out = '<div class="piece" id="piece_' + piece.name + '" style="width:' + (5 * width) + 'vw;height:' + (5 * width) + 'vw;display:block;z-index:0;">';

        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                let set = pieceBitMap[i][j];
                out += '<div style="display:block;float:left;width:' + width + 'vw;height:' + width + 'vw;' + ((set) ? 'background:' + ((isColorSplitActive) ? piece.alternateColor : piece.color) : '') + '" class="' + ((set) ? 'bmPoint' : 'bmAround') + '"></div>';
            }
        }

        newDiv.innerHTML = out;
        let correctDiv = newDiv.firstElementChild;
        correctDiv.style.setProperty("left", oldPieceDiv.style.left);
        correctDiv.style.setProperty("top", oldPieceDiv.style.top);
        correctDiv.style.setProperty("transformOrigin", oldPieceDiv.style.transformOrigin);
        correctDiv.style.setProperty("--magnification", oldPieceDiv.style.getPropertyValue("--magnification"));
        correctDiv.style.setProperty("--rotationX", "0deg");
        correctDiv.style.setProperty("--rotationY", "0deg");
        correctDiv.style.setProperty("--rotationZ", "0deg");
        oldPieceDiv.replaceWith(correctDiv);
    }

    rotateClkWise(cmdProperty = cmdAttrDefault) {
        let piece = this.selected;
        if (piece) {
            let pieceDiv = document.getElementById("piece_" + piece.name);
            let flipped = pieceDiv.getAttribute("flipped") * 1;
            let currentRot = pieceDiv.style.getPropertyValue("--rotationZ").split(/(-?\d+)/)[1] * 1; //converts string value to int
            let newRot = flipped ? currentRot - 90 : currentRot + 90;
            // Update the backend
            this.gameController.rotatePentominoClkWise(piece, cmdProperty);
            this.positionPiece(piece);
            pieceDiv.style.setProperty("--rotationZ", newRot.toString() + "deg");
            if (cmdProperty.cmdType != CommandTypes.Shadow) {
                this.checkIfGameWon();
            }
        }

        setTimeout(function (that, piece) {
            that.updateDOMWithPentomino(piece);
        }, 200, this, piece);
    }

    rotateAntiClkWise(cmdProperty = cmdAttrDefault) {
        let piece = this.selected;
        if (piece) {
            let pieceDiv = document.getElementById("piece_" + piece.name);
            let flipped = pieceDiv.getAttribute("flipped") * 1;
            let currentRot = pieceDiv.style.getPropertyValue("--rotationZ").split(/(-?\d+)/)[1] * 1; //converts string value to int
            let newRot = flipped ? currentRot + 90 : currentRot - 90;
            // Update the backend
            this.gameController.rotatePentominoAntiClkWise(piece, cmdProperty);
            this.positionPiece(piece);
            pieceDiv.style.setProperty("--rotationZ", newRot.toString() + "deg");
            if (cmdProperty.cmdType != CommandTypes.Shadow) {
                this.checkIfGameWon();
            }
        }

        setTimeout(function (that, piece) {
            that.updateDOMWithPentomino(piece);
        }, 200, this, piece);
    }

    flipH(cmdProperty = cmdAttrDefault) {
        let piece = this.selected;
        if (!piece) return

        let pieceDiv = document.getElementById("piece_" + piece.name);
        let flipped = pieceDiv.getAttribute("flipped") * 1;
        let currentRot = pieceDiv.style.getPropertyValue("--rotationX").split(/(-?\d+)/)[1] * 1; //converts string value to int
        let newRot = currentRot + 180;
        pieceDiv.style.setProperty("--rotationX", newRot.toString() + "deg");
        this.gameController.mirrorPentominoH(piece, cmdProperty)
        this.positionPiece(piece);
        pieceDiv.setAttribute("flipped", 1 - flipped);
        if (cmdProperty.cmdType != CommandTypes.Shadow) {
            this.checkIfGameWon();
        }

        setTimeout(function (that, piece) {
            that.updateDOMWithPentomino(piece);
        }, 200, this, piece);
    }

    flipV(cmdProperty = cmdAttrDefault) {
        let piece = this.selected;
        if (!piece) return

        let pieceDiv = document.getElementById("piece_" + piece.name);
        let flipped = pieceDiv.getAttribute("flipped") * 1;
        let currentRot = pieceDiv.style.getPropertyValue("--rotationY").split(/(-?\d+)/)[1] * 1; //converts string value to int
        let newRot = currentRot + 180;
        // Update the backend
        this.gameController.mirrorPentominoV(piece, cmdProperty);
        this.positionPiece(piece);
        pieceDiv.style.setProperty("--rotationY", newRot.toString() + "deg");
        pieceDiv.setAttribute("flipped", 1 - flipped);
        if (cmdProperty.cmdType != CommandTypes.Shadow) {
            this.checkIfGameWon();
        }

        setTimeout(function (that, piece) {
            that.updateDOMWithPentomino(piece);
        }, 200, this, piece);
    }

    showNumberOfPossibleSolutions() {
        let speechBubbleText = document.getElementById("speechBubbleText");
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        //Fill solutions label text
        let labelPossibleSolutions = document.getElementById("labelNumberSolutions");
        if (this.gameController.game()._board.isSolved()) {
            speechBubbleText.innerText = strings.speechbubbleTexts.Solved[lang];
            if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                this.speakBot(strings.speechbubbleTexts.Solved[lang]);
            }
            return;
        }
        if(SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions){
            if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                labelPossibleSolutions.innerText = strings.numberOfPossibleSolutions[lang] + ': ' + this.gameController.getPossibleSolutions().length;
            }
        }else{
            document.getElementById("labelNumberSolutions").innerHTML = " none ";
        }
        //Fill speech bubble text
        speechBubbleText.innerText = strings.numberOfPossibleSolutions[lang] + ': ' + this.gameController.getPossibleSolutions().length;
        if (SettingsSingleton.getInstance().getSettings().autohinting.enableAutoHinting) {
            if ((this.gameController.getPossibleSolutions().length) === 0) {
                count += 1;
                //check if number of wrongg moves is greater than the value configured in settings
                if (count > SettingsSingleton.getInstance().getSettings().autohinting.numberOfWrongMoves) {
                    this.autoHintWrongMoves();
                }
            }
        }
    }

    getSplitStatus() {
        return document.querySelector(".splitbuttonimg") !== null;
    }

    callHintAI() {
        let hint = pd.gameController.getHint(this.getSplitStatus(), piecesSelectedForPartition);
        //disable hint button until hint is finished
        let hintButton = document.getElementById('hintButton');
        hintButton.disabled = true;
        //Always show place command in case of non-exact hints:
        let commandNumber = 0;
        if (!SettingsSingleton.getInstance().getSettings().hinting.exactHints) {
            let hasPlaceCommand = this.checkHintCommandsForPlaceCommand(hint.getCommands());
            if (hasPlaceCommand[0]) {
                commandNumber = hasPlaceCommand[1];
            }
        }
        let hintCommand = hint.getCommands()[commandNumber];
        let hintinPen = hintCommand._pentomino;
        if (SettingsSingleton.getInstance().getSettings().general.enableAudio) {
            let audio = new Audio('resources/audio/hinting.mp3');
            audio.play();
        }
        if ((SettingsSingleton.getInstance().getSettings().hinting.typeOfHints === "Visual")) {
            this.indicateHint(hint, commandNumber);
        }
        // if((SettingsSingleton.getInstance().getSettings().hinting.typeOfHints === "Textual" )){
        //      pd.visual.hintText(hint);
        // }
        if ((SettingsSingleton.getInstance().getSettings().hinting.typeOfHints === "Visual and textual")) {
            pd.visual.hintText(hint);
            this.indicateHint(hint, commandNumber);
        }
        setTimeout(function () {
            hintButton.disabled = false;
        }, 1000);
    }

    hintText(hint) {
        hint = pd.gameController.getHint(this.getSplitStatus(), piecesSelectedForPartition);
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        let commandNumber = 0;
        let hintCommand = hint.getCommands()[commandNumber];
        let timeoutFrame = 1000;
        let r;
        let x = window.matchMedia("(max-width: 860px)");
        //possible command names (place, remove, moveToPosition, rotateClkWise, rotateAntiClkWise, mirrorH, mirrorV)
        let hintSkill = hint._skill;
        let hintName = hintCommand._name;
        r = document.getElementById("speechBubbleText");
        switch (hintName) {
            case "Remove":
                this.text = strings.speechbubbleTexts.removePentomino[lang] + " pentomino " + hintCommand._pentomino.name;
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "MoveToPosition":
                this.text = strings.speechbubbleTexts.move[lang] + " pentomino " + hintCommand._pentomino.name + strings.speechbubbleTexts.MoveToPosition[lang] + " " + "[" + hintCommand._row + "," + hintCommand._col + "]";
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "Place":
                this.text = strings.speechbubbleTexts.place[lang] + " pentomino " + hintCommand._pentomino.name + " " + strings.speechbubbleTexts.atPosition[lang] + " " + "[" + hintCommand._nextPosition[0] + "," + hintCommand._nextPosition[1] + "]";
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "RotateClkWise":
                this.text = strings.speechbubbleTexts.rotate[lang] + " pentomino " + hintCommand._pentomino.name + " " + strings.speechbubbleTexts.clockwise[lang];
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "RotateAntiClkWise":
                this.text = strings.speechbubbleTexts.rotate[lang] + " pentomino " + hintCommand._pentomino.name + " " + strings.speechbubbleTexts.antiClockwise[lang];
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "MirrorH":
                this.text = strings.speechbubbleTexts.mirror[lang] + " pentomino " + hintCommand._pentomino.name + " " + strings.speechbubbleTexts.horizontal[lang];
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            case "MirrorV":
                this.text = strings.speechbubbleTexts.mirror[lang] + " pentomino " + hintCommand._pentomino.name + " " + strings.speechbubbleTexts.vertical[lang];
                if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
                    this.speakBot(this.text);
                }
                document.getElementById("speechBubbleText").textContent = this.text;
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerText = this.text;
                }
                break;
            default:
                this.text = "Error - unknown command with name '" + hintName + "'";
                throw new Error("Error: unknown command with name " + hintName);
        }
    }


    autoHintWrongMoves() {
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        //set flag values for wrongActions and time period to set the delay separately
        wrongActions = true;
        timeperiod = false;
        if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
             pd.visual.speakBot(strings.speechbubbleTexts.iHaveAHint[lang]);
         }
        if (!(SettingsSingleton.getInstance().getSettings().autohinting.wrongMoves)) {
            return;
        }
        //start bird animation
        document.getElementById('birdContainer').classList.add("anim");
        //Speech bubble asks show the hint or ignore
        //this function call configures auto hints
        pd.visual.configureAutoHints();
        //stop bird animation
        setTimeout(function () {
            document.getElementById('birdContainer').classList.remove("anim");
            count = 0;
        }, 20000);
    }

    //in case hint type is set to only textual, in autohint section, this function is called
    //on the click of showhint button
    showTextualHint() {
        let hint = pd.gameController.getHint(this.getSplitStatus(), piecesSelectedForPartition);
        this.hintText(hint);
    }

    //ignore button in case of autohint
    ignore() {
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        document.getElementById('speechBubbleText').textContent = strings.numberOfPossibleSolutions[lang] + ': ' + this.gameController.getPossibleSolutions().length;
        if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
            document.getElementById("labelNumberSolutions").innerText = strings.numberOfPossibleSolutions[lang] + ': ' + this.gameController.getPossibleSolutions().length;
        }
    }

   //in case hint type is set to visual and textual, in autohint section, this function is called
   //on the click of showhint button
    bothAutoHint() {
        let hint = pd.gameController.getHint(this.getSplitStatus(), piecesSelectedForPartition);
        this.callHintAI();
        this.hintText(hint);
    }

    //in case hint type is set to visual, in autohint section, this function is called
    //on the click of showhint button
    visualAutoHint() {
        this.callHintAI();
    }


 //this function configures autohint based on both time period and wrong actions.
    configureAutoHints() {
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        let speechBubbleText = document.getElementById('speechBubbleText');
        let hint = pd.gameController.getHint(this.getSplitStatus(), piecesSelectedForPartition);
        let delayForIhaveAHint = this.delayForIhaveAHint(wrongActions, timeperiod);
        let delayShowHintOrIgnore = this.delayShowHintOrIgnore(wrongActions, timeperiod);
        console.log(delayForIhaveAHint, delayShowHintOrIgnore);
        //Speech bubble says : I have a hint
        setTimeout(function () {
            // if (SettingsSingleton.getInstance().getSettings().speech.enableSpeech) {
            //     pd.visual.speakBot(strings.speechbubbleTexts.iHaveAHint[lang]);
            // }
            speechBubbleText.textContent = strings.speechbubbleTexts.iHaveAHint[lang];
            if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                document.getElementById("labelNumberSolutions").innerText = strings.speechbubbleTexts.iHaveAHint[lang];
            }
        }, delayForIhaveAHint);
        //checks if visual hints are enabled.
        //If enabled => the user can click on the button on the speech bubble to get the hint
        //checks if visual hints are enabled
        if ((SettingsSingleton.getInstance().getSettings().autohinting.typeOfHints === "Visual")) {
            //Speech bubble asks show the hint or ignore
            setTimeout(function () {
                speechBubbleText.innerHTML = '<button id="showVisualHint" name="showVisualHint" onclick="pd.visual.visualAutoHint()" ></button>' + '<button id="hideVisualHint" name="hideVisualHint" onclick="pd.visual.ignore()">Ignore</button>';
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerHTML = '<button id="showVisualHint" name="showVisualHint" onclick="pd.visual.visualAutoHint()" ></button>' + '<button id="hideVisualHint" name="hideVisualHint" onclick="pd.visual.ignore()">Ignore</button>';
                }
                document.querySelector("#showVisualHint").innerHTML = strings.speechbubbleTexts.showHint[lang];
                document.querySelector("#hideVisualHint").innerHTML = strings.speechbubbleTexts.ignore[lang];
            }, delayShowHintOrIgnore);
        }
        //checks if Textual hints are enabled.
        //If enabled => the user automatically gets a textul hint
        // else if ((SettingsSingleton.getInstance().getSettings().autohinting.typeOfHints === "Textual")) {
        //     //Speech bubble says : I have a hint
        //     setTimeout(function () {
        //         speechBubbleText.textContent = strings.speechbubbleTexts.iHaveAHint[lang];
        //         if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
        //             document.getElementById("labelNumberSolutions").innerText = strings.speechbubbleTexts.iHaveAHint[lang];
        //         }
        //     }, 3000);
        //     //Speech bubble automatically shows textual hint
        //     //Speech bubble asks show the hint or ignore
        //     //Here the teacher can either show the buttons or just set for automatic textual hints display
        //     setTimeout(function () {
        //         if (SettingsSingleton.getInstance().getSettings().autohinting.showOrHideButtonsForTextualHints) {
        //             speechBubbleText.innerHTML = '<button id="showTextualHint" name="showTextualHint" onclick="pd.visual.showTextualHint()"></button>' + '<button id="hideTextualHint" name="hideTextualHint" onclick="pd.visual.ignore()"></button>';
        //             if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
        //                 document.getElementById("labelNumberSolutions").innerHTML = '<button id="showTextualHint" name="showTextualHint" onclick="pd.visual.showTextualHint()"></button>' + '<button id="hideTextualHint" name="hideTextualHint" onclick="pd.visual.ignore()"></button>';
        //             }
        //             document.querySelector("#showTextualHint").innerHTML = strings.speechbubbleTexts.showHint[lang];
        //             document.querySelector("#hideTextualHint").innerHTML = strings.speechbubbleTexts.ignore[lang];
        //         } else {
        //             pd.visual.hintText(hint);
        //         }
        //     }, 5000);
        // }
        else if ((SettingsSingleton.getInstance().getSettings().autohinting.typeOfHints === "Visual and textual")) {
            //Speech bubble asks show the hint or ignore
            setTimeout(function () {
                speechBubbleText.innerHTML = '<button id="showBothHint" name="showBothHint" onclick="pd.visual.bothAutoHint()"></button>' + '<button id="hideBothHint" name="hideBothHint" onclick="pd.visual.ignore()"></button>';
                if (!(SettingsSingleton.getInstance().getSettings().general.enableBird)) {
                    document.getElementById("labelNumberSolutions").innerHTML = '<button id="showBothHint" name="showBothHint" onclick="pd.visual.bothAutoHint()"></button>' + '<button id="hideBothHint" name="hideBothHint" onclick="pd.visual.ignore()"></button>';
                }
                document.querySelector("#showBothHint").innerHTML = strings.speechbubbleTexts.showHint[lang];
                document.querySelector("#hideBothHint").innerHTML = strings.speechbubbleTexts.ignore[lang];
            }, 5000);
        }
    }

   //separate delay time for both kinds of auto hints
    delayForIhaveAHint(wrongActions, timeperiod){
        let delayForIhaveAHint;
        if(delayForIhaveAHint === undefined){
            if(timeperiod){
                delayForIhaveAHint = 3000;
            }
            else if(wrongActions){
                delayForIhaveAHint = 100;
            }
            return delayForIhaveAHint;
        }
    }

    delayShowHintOrIgnore(wrongActions, timeperiod){
        let delayShowHintOrIgnore;
        if(timeperiod === true){
            delayShowHintOrIgnore = 5000;
        }

        else if(wrongActions === true){
            delayShowHintOrIgnore = 400;
        }
        return delayShowHintOrIgnore;
    }


    //end of configure autohints function

    resize(arr, newSize) {
        let partionLength = 0;
        let counter = 0;
        if (splitPartition.length != 0) {
            while (splitPartition.length === 0) {
                arr.pop();
            }
        }
        partionLength = splitPartition.length;
        splitCounter = -1;
        while (partionLength < newSize) {
            splitPartition.push(arr[counter]);
            counter++;
            partionLength++;
        }
    }

    splitTheBoard() {
        let splitCategory = SettingsSingleton.getInstance().getSettings().splitPartition.splitStrategy;
        switch (splitCategory) {
            case "color":
                this.undoSplit();
                this.splitBoardViaColor();
                break;
            case "left-to-right":
                this.readyForSplitting();
                this.splitBoardLtoR();
                break;
        }
    }

    readyForSplitting() {
        this.reset();
        this.undoSplit();
        if (!splitButton.classList.contains("splitbuttonimg")) {
            splitButton.classList.add("splitbuttonimg");
        }
    }

    splitBoardViaColor() {
        let partitionedArray = pd.gameController.splitByColor();
        this.displayPartitionByColor(partitionedArray, alternateColor);
    }

    splitBoardLtoR() {
        let partitionedArray = pd.gameController.splitFromLeftToRight();
        this.resize(partitionedArray, partitionedArray.length)
        let styleElement = document.querySelector('.boardarea');
        let styleValue = window.getComputedStyle(styleElement);
        styleBlocks = styleValue.backgroundColor;
        this.displayPartitionFromL2R();
    }

    undoSplit() {
        Array.prototype.forEach.call(document.getElementsByClassName("gamearea boardarea"), function (element) {
            if (!element.classList.contains("blockedcell")) {
                element.style.backgroundColor = "";
                element.style.opacity = "";
            }
        });
        this.pieces.forEach(piece => {
            Array.prototype.forEach.call(document.getElementById('piece_' + piece.name).getElementsByClassName("bmPoint"), function (element) {
                //Piece colors can be changed for High contrast theme
                if(localStorage.getItem('style') == "blackAndWhiteTheme"){
                    element.style.background = highContrastPieceColor;
                }
                else
                element.style.background = piece.color ;
            });
        });
        this.pieces.forEach(piece => {
            document.getElementById('piece_' + piece.name).style.display = 'block';
        });
        piecesSelectedForPartition = [];
        splitPartition = [];
        splitCounter = -1;
        this.unblockPartition();
        this.pd.gameController.clearIsSplitActiveFlag();
    }

    displayPartitionByColor(partitionedArray, alternateColor) {
        for (var i = 0; i < partitionedArray.length; i++) {
            for (var j = 0; j < partitionedArray[i].length; j++) {
                if (partitionedArray[i][j][1]) {
                    let fieldValue = partitionedArray[i][j][1];
                    for (var k = 0; k < fieldValue.length; k++) {
                        let fieldID = document.getElementById("field_" + fieldValue[k][0] + "," + fieldValue[k][1]);
                        fieldID.style.background = alternateColor[i];
                        fieldID.style.opacity = .7;
                    }
                }
                var piece = partitionedArray[i][j][0];
                this.pieces.filter(p => p.name == piece.name)[0].alternateColor = alternateColor[i];
                piece.alternateColor = alternateColor[i];
                Array.prototype.forEach.call(document.getElementById('piece_' + piece.name).getElementsByClassName("bmPoint"), function (element) {
                    element.style.background = alternateColor[i];
                });
            }
        }
    }

    displayPartitionFromL2R() {
        splitCounter++;
        if (splitPartition.length > splitCounter) {
            let partitionedArray = splitPartition[splitCounter]
            let piecesDisplayed = [];
            for (let i = 0; i < partitionedArray.length; i++) {
                for (let j = 0; j < partitionedArray[i][1].length; j++) {
                    let fieldValue = partitionedArray[i][1];
                    let fieldID = document.getElementById("field_" + fieldValue[j][0] + "," + fieldValue[j][1]);
                    fieldID.style.background = "#77C9D4";
                    fieldID.style.opacity = .5;
                }
                piecesDisplayed.push(partitionedArray[i][0].name);
            }
            for (let elm = 0; elm < piecesDisplayed.length; elm++) {
                piecesSelectedForPartition.push(piecesDisplayed[elm]);
            }

            this.pieces.forEach(piece => {
                let containsDisplayedPieceName = piecesDisplayed.indexOf(piece.name)
                if (containsDisplayedPieceName === -1) {
                    if (!document.getElementById('piece_' + piece.name).classList.contains('disabledbutton')) {
                        document.getElementById('piece_' + piece.name).style.display = 'none';
                    }
                }
                else if (containsDisplayedPieceName >= 0) {
                    document.getElementById('piece_' + piece.name).style.display = 'block';
                }
            });
        }

    }


    unblockPartition() {
        Array.prototype.forEach.call(document.getElementsByClassName("gamearea boardarea"), function (element) {
            if (!element.classList.contains("blockedcell")) {
                element.style.background = backGroundColor;
                element.style.opacity = "";
            }
        });
        this.pieces.forEach(piece => {
            Array.prototype.forEach.call(document.getElementById('piece_' + piece.name).getElementsByClassName("bmPoint"), function (element) {
                element.style.display = 'block';
            });

            if (document.getElementById('piece_' + piece.name).classList.contains('disabledbutton')) {
                document.getElementById('piece_' + piece.name).classList.remove("disabledbutton");
            }

        });


    }

    checkPartitionSolved() {
        let piecesDisplayed = [];
        let partitionCheck = false;

        if (!splitPartition) {
            return false;
        }

        if (splitPartition.length === 0) {
            return false;
        }

        let partitionedArray = splitPartition[splitCounter]

        if (!partitionedArray) {
            return false;
        }
        for (let i = 0; i < partitionedArray.length; i++) {
            piecesDisplayed.push(partitionedArray[i][0].name);
        }

        let temp = [];
        for (let i = 0; i < piecesDisplayed.length; i++) {
            temp.push(false);
        }

        this.pieces.forEach(piece => {
            if (this.gameController.isPlacedOnBoard(piece)) {
                let containsDisplayedPieceName = piecesDisplayed.indexOf(piece.name)
                if (containsDisplayedPieceName >= 0) {
                    let result = this.pd.gameController.partitionHasUnoccupiedPosition(piece);
                    temp[containsDisplayedPieceName] = result;
                    let checker = temp.every(v => v === true);
                    if (checker) {
                        partitionCheck = true;
                        if (this.checkIfGameWon()) {
                            this.unblockPartition();
                        }
                        return partitionCheck;
                    }
                }
            }

        });
        return partitionCheck;
    }


    blinkCells(cells) {
        let menu = [];
        let boardColor = document.getElementsByClassName("boardarea");
        let color = "#f9f9f9";
        for (let i = 0; i < cells.length; i++) {
            let fv = document.getElementById("field_" + cells[i][0] + "," + cells[i][1]);
            color = window.getComputedStyle(fv).backgroundColor;
            fv.style.background = color + "url(resources/images/icons/warning.png) center center";
            fv.style.backgroundSize = "cover";
            menu.push(fv);
        }

        let blinkInterval;
        let counter = 0;
        clearInterval(blinkInterval);
        blinkInterval = setInterval(function () {
            for (let j = 0; j < menu.length; j++) {
                if (counter % 2 === 0) {
                    color = menu[j].style.backgroundColor;
                    menu[j].style.background = color;
                } else {
                    color = menu[j].style.backgroundColor;
                    menu[j].style.background = color + "url(resources/images/icons/warning.png) center center";
                    menu[j].style.backgroundSize = "cover";
                }
            }
            counter++;
            if (counter > 4) {
                clearInterval(blinkInterval);
            }
        }, 500);
    }

    checkHintCommandsForPlaceCommand(hintCommands) {
        for (let i = 0; i < hintCommands.length; i++) {
            if (hintCommands[i].Name() == "Place") {
                return [true, i];
            }
        }

        return [false, null];
    }

    indicateHint(hint, commandNumber) {
        let timeoutFrame = 1000;
        //possible command names (place, remove, moveToPosition, rotateClkWise, rotateAntiClkWise, mirrorH, mirrorV)
        let hintCommand = hint.getCommands()[commandNumber];
        let hintSkill = hint._skill;
        let hintName = hintCommand._name;
        let hintinPen = hintCommand._pentomino;
        let pentominoColor = hintinPen.color;
        let clientRect = document.getElementById("piece_" + hintinPen.name).getBoundingClientRect();
        let [posX, posY] = [clientRect.x + clientRect.width / 2, clientRect.y + clientRect.height / 2];
        let currentPenHintName = hintinPen.name;
        //let currentPenHintNaame = this.selected.name;
        if (!(currentPenHintName === lastHintedPentName)) {
            let maxPartialHintingCells = SettingsSingleton.getInstance().getSettings().hinting.maxPartialHintingCells;
            randomCell = Math.floor(Math.random() * (maxPartialHintingCells)) + 1;
            lastHintedPentName = currentPenHintName;
        }

        let cmdProperty = updateCommandAttr(CommandTypes.None, CommandSeq.Forward);
        let tempHintinPen = hintinPen;
        if (!SettingsSingleton.getInstance().getSettings().hinting.exactHints) {
            //tempHintinPen = new Pentomino(hintinPen.name);
            tempHintinPen = Object.assign(Object.create(Object.getPrototypeOf(hintinPen)), hintinPen);
            //do actions on pentomino copy to prepare for place hint
            for (let hintnr = 0; hintnr < commandNumber; hintnr++) {
                switch (hint.getCommands()[hintnr]._name) {
                    case "Remove": break;
                    case "Place": break;
                    case "RotateClkWise": tempHintinPen.rotateClkWise(cmdProperty); break;
                    case "RotateAntiClkWise": tempHintinPen.rotateAntiClkWise(cmdProperty); break;
                    case "MirrorH": tempHintinPen.mirrorH(cmdProperty); break;
                    case "MirrorV": tempHintinPen.mirrorV(cmdProperty); break;
                    default: throw new Error("Error on commands on pentomino copy.");
                }
            }
        }

        //indication of unoccupied cells
        //skill teaching
        if (!(hintSkill === null) && (SettingsSingleton.getInstance().getSettings().hinting.skillTeaching)) {
            //blink unoccupied cells
            this.blinkCells(hintSkill);
        }
        else {

          //if show destination is disabled, only pentomino is indicated
            if (!((SettingsSingleton.getInstance().getSettings().hinting.hintingVariants) === ("Show destination"))) {
                this.indicatePentomino(hintinPen, timeoutFrame);
            }

            switch (hintName) {
                case "Place":
                    // handle place hint
                    let hintRow = hintCommand._nextPosition[0];
                    let hintColumn = hintCommand._nextPosition[1];
                    let fieldvalue;
                    let prevBackground = [];
                    let destinationColor = "#a9a9a9";
                    //show destination position (and fade away)
                    let piecePos = this.getOccupiedPositions(tempHintinPen, hintCommand);
                    let randomCellPos = this.calculateNeighbour(piecePos, hintCommand);
                    //usage of random cell variable to indicate hinting
                    if (!((SettingsSingleton.getInstance().getSettings().hinting.hintingVariants) === ("Show pentominoes"))) {
                        switch (SettingsSingleton.getInstance().getSettings().hinting.hintingStrategy) {
                            case "partial":
                                switch (SettingsSingleton.getInstance().getSettings().hinting.partialHintingStragety) {
                                    case "random":
                                        //piecePos = filtered;
                                        for (let i = 0; i < randomCell; i++) {
                                            fieldvalue = document.getElementById("field_" + piecePos[i][0] + "," + piecePos[i][1]);
                                            prevBackground[i] = fieldvalue.style.background;
                                            if (SettingsSingleton.getInstance().getSettings().hinting.hintingVariants === ("Show destination")) {
                                                fieldvalue.style.background = destinationColor;
                                            }
                                            else {
                                                fieldvalue.style.background = pentominoColor;
                                            }
                                            this.hide(piecePos, prevBackground, timeoutFrame);
                                        }
                                        break;
                                    case "mostOccupiedCells":
                                        let mostCells = this.mostNeigh(hintinPen, piecePos, hintCommand);
                                        let cellsToIndicate = this.cellsToIndicate(piecePos, mostCells, hintCommand);
                                        for (let i = 0; i < cellsToIndicate.length; i++) {
                                            fieldvalue = document.getElementById("field_" + cellsToIndicate[i][0] + "," + cellsToIndicate[i][1]);
                                            prevBackground[i] = fieldvalue.style.background;
                                            if (SettingsSingleton.getInstance().getSettings().hinting.hintingVariants === ("Show destination")) {
                                                fieldvalue.style.background = destinationColor;
                                            }
                                            else {
                                                fieldvalue.style.background = pentominoColor;
                                            }
                                            this.hideMostOccupiedNeighbors(cellsToIndicate, prevBackground, timeoutFrame);
                                        }
                                        break;
                                    default:
                                        throw new Error("Unknown partial hinting strategy");
                                }
                                break;
                            case "full":
                                for (let i = 0; i < 5; i++) {
                                    fieldvalue = document.getElementById("field_" + piecePos[i][0] + "," + piecePos[i][1]);
                                    prevBackground[i] = fieldvalue.style.background;
                                    if (SettingsSingleton.getInstance().getSettings().hinting.hintingVariants === ("Show destination")) {
                                        fieldvalue.style.background = destinationColor;
                                    }
                                    else {
                                        fieldvalue.style.background = pentominoColor;
                                    }
                                    this.hide(piecePos, prevBackground, timeoutFrame);
                                }
                                break;
                            case "area":
                                let areaPos = this.indicateAreaCells(hintinPen, hintCommand)[0];
                                for (let i = 0; i < areaPos.length; i++) {
                                    let areaPos = this.indicateAreaCells(hintinPen, hintCommand)[0];
                                    fieldvalue = document.getElementById("field_" + areaPos[i][0] + "," + areaPos[i][1]);
                                    prevBackground[i] = fieldvalue.style.background;
                                    if (SettingsSingleton.getInstance().getSettings().hinting.hintingVariants === ("Show destination")) {
                                        fieldvalue.style.background = destinationColor;
                                    }
                                    else {
                                        fieldvalue.style.background = pentominoColor;
                                    }
                                }

                                this.hideArea(areaPos, prevBackground, timeoutFrame);
                                break;
                            default:
                                console.error("Hinting strategy unknown!");
                        }
                    }

                    break;

                case "Remove":
                    // handle remove hint
                    this.select(hintinPen, posX, posY);
                    var pen = document.getElementById("piece_" + hintinPen.name);
                    //console.log("pent",hintinPen,this.selected);
                    if (!this.selected.inTray) {
                        pen.style.opacity = '0.2';
                        setTimeout(function () {
                            pen.style.opacity = '1';
                        }, timeoutFrame);
                    }
                    break;

                case "RotateClkWise":
                    // handle rotateClkWise hint
                    this.select(hintinPen, posX, posY);
                    if (!this.selected.inTray) {
                        this.rotateClkWise(cmdProperty);
                        var that = this;
                        setTimeout(function (that) {
                            that.rotateAntiClkWise(cmdProperty);
                        }, timeoutFrame, that);
                    }
                    break;

                case "RotateAntiClkWise":
                    // handle rotateAntiClkWise hint
                    this.select(hintinPen, posX, posY);
                    if (!this.selected.inTray) {
                        this.rotateAntiClkWise(cmdProperty);
                        var that = this;
                        setTimeout(function (that) {
                            that.rotateClkWise(cmdProperty);
                        }, timeoutFrame, that);
                    }
                    break;

                case "MirrorH":
                    // handle mirrorH hint
                    //select piece in the UI to flip
                    this.select(hintinPen, posX, posY);
                    if (!this.selected.inTray) {
                        this.flipH(cmdProperty);
                        var that = this;
                        setTimeout(function (that) {
                            that.flipH(cmdProperty);
                        }, timeoutFrame, that);
                    }
                    break;

                case "MirrorV":
                    // handle mirrorV hint
                    this.select(hintinPen, posX, posY);
                    if (!this.selected.inTray) {
                        this.flipV(cmdProperty);
                        var that = this;
                        setTimeout(function (that) {
                            that.flipV(cmdProperty);
                        }, timeoutFrame, that);
                    }
                    break;

                default:
                    console.error("Unknown piece action detected!");
            }
        }
    }

    indicatePentomino(pentomino, timeframe) {
        Array.prototype.forEach.call(document.getElementById("piece_" + pentomino.name).getElementsByClassName("bmPoint"), function (element) {
            element.style["box-shadow"] = "0 0 20px " + pentomino.color;
            if (pentomino.inTray) {
                //obtain and increase current scale of piece
                let htmlPiece = document.getElementById("piece_" + pentomino.name);
                let transformValue = $('#piece_' + pentomino.name).css('transform');
                let values = transformValue.split('(')[1];
                values = values.split(')')[0];
                values = values.split(',');
                let a = values[0];
                let b = values[1];
                let scale = Math.sqrt(a * a + b * b);
                document.getElementById("piece_" + pentomino.name).style.transform = "scale(" + scale * 2 + ")";
            }

            setTimeout(function () {
                element.style.removeProperty("box-shadow");
                //element.style.transform = "none";
                element.classList.remove('horizTranslate');
                document.getElementById("piece_" + pentomino.name).style.removeProperty("transform");
            }, timeframe);
        });
    }

    showGameSolved() {
        UtilitiesClass.disablePointerEventsOnModalOpen();
        let modal = document.getElementById('modalTop');
        modal.style.display = "block";
        modal.style.background = "transparent";
        let modalFormContent = document.querySelector(".modalFormContent");
        modalFormContent.style.display = "block";
        let modalFormContainerID = document.querySelector("#modalFormContainerID")
        modalFormContainerID.style.display = "block";
        let modalBodyID = document.querySelector("#modalBodyID");
        modalBodyID.style.display = "block";
        document.querySelector(".innerGrid").style.display = "none";
        template.clearContent("#modalButtonsID");
        document.querySelector(".modalFullframeContainer").style.display = "none";
        template.clearContent("#modalTitleID");
        template.clearContent("#modalBodyID");
        template.clearContent("#innerGridForm");
        template.clearContent("#filterGrid");
        let lang = SettingsSingleton.getInstance().getSettings().general.language;
        //create div for image
        let textNode1 = {
            class: "modalText",
            text: strings.showSolved.congrats[lang]
        };
        let div1 = document.createElement("div");
        let img = document.createElement("img");

        let textNode2;
        let cancelBtn;
        let playAgnBtnAttributes;
        template.attachText("#modalBodyID", textNode1);
        textNode2 = {
            class: "modalText",
            text: strings.showSolved.play[lang]
        };
        img.src = "resources/images/icons/solvedScreenBoy.ico";
        img.style.cursor = "none";
        div1.appendChild(img);
        modalBodyID.appendChild(div1);
        template.attachText("#modalBodyID", textNode2);
        cancelBtn = {
            class: "cancelBtn",
            onclick: "document.getElementById('modalTop').style.display='none'",
            textContent: strings.general.no[lang]
        };
        playAgnBtnAttributes = {
            class: "deleteBtn",
            onclick: "document.getElementById('modalTop').style.display='none'",
            textContent: strings.general.yes[lang]
        };
        let div2 = document.createElement("div");
        let text = document.createElement("h5");
        text.innerHTML = "\n";
        div2.appendChild(text);
        //attach div
        modalBodyID.appendChild(div2);

        template.attachBtn("#modalBodyID", playAgnBtnAttributes);
        template.attachBtn("#modalBodyID", cancelBtn);
        let playAgainBtn = document.querySelector(".deleteBtn");
        playAgainBtn.addEventListener("click", () => {
            pd.reset();
            UtilitiesClass.enablePointerEventsOnModalClose();
        });

        let that = this;
        let dontPlayAgainBtn = document.querySelector(".cancelBtn");
        dontPlayAgainBtn.addEventListener("click", () => {
            UtilitiesClass.enablePointerEventsOnModalClose();
            that.enablePointerEventsOnPieces();
        });
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    dist(a, b) {
        return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
    }

    cellsToIndicate(piecePos, mostCells, hintCommand) {
        let hintinPen = hintCommand._pentomino;
        let currentPenHintName = hintinPen.name;
        if (!(currentPenHintName === lastHintedPentName)) {
            let maxPartCells = SettingsSingleton.getInstance().getSettings().hinting.maxPartialHintingCells;
            randomCell = (Math.floor(Math.random() * (maxPartCells)) + 1);
            lastHintedPentName = currentPenHintName;
        }
        let X = mostCells;
        let result = piecePos.sort((a, b) => (this.dist(a, X) > this.dist(b, X)) ? 1 : ((this.dist(b, X) > this.dist(a, X)) ? -1 : 0));
        let filtered = result.splice(randomCell, result.length);
        return result;
    }

   //calculates most occupied cell to indicate in case of partial hinting
    mostNeigh(hintinPen, piecePos, hintCommand) {
        let game = this.gameController.game();
        let board = game._board;
        hintinPen = hintCommand._pentomino;
        let maxNumOccupiedCells = 0;
        //unoccupied cells
        let bestCell;
        let cellIsOccupied;
        let ab;
        for (let i = 0; i < piecePos.length; i++) {
            let counter = 0;
            ab = board._getNeighborPositions(piecePos[i][0], piecePos[i][1]);
            for (let j = 0; j < ab.length; j++) {
                if (board.positionIsValid(ab[j][0], ab[j][1])) {
                    cellIsOccupied = board.isOccupied(ab[j][0], ab[j][1]);
                    if (!(cellIsOccupied === null) && !(cellIsOccupied === hintinPen)) {
                        counter += 1;
                    }
                }
                else {
                    counter += 1;
                }
                if (counter > maxNumOccupiedCells) {
                    maxNumOccupiedCells = counter;
                    if (board.positionIsValid(ab[j][0], ab[j][1])) {
                        if (cellIsOccupied) {
                            bestCell = piecePos[i];
                        }
                    }
                    else {
                        bestCell = piecePos[i];
                    }
                }
            }
        }
        return bestCell;
    }

 // calculate neighboring cells to indicate on the partial hint
    calculateNeighbour(piecePos, hintCommand) {
        let game = this.gameController.game();
        let board = game._board;
        let neighb;
        let randomCellPos = [];
        let reduced = []
        for (let i = 0; i < piecePos.length; i++) {
            neighb = this.gameController.game()._board._getNeighborPositions(piecePos[i][0], piecePos[i][1]);
            for (let j = 0; j < neighb.length; j++) {
                if (board.positionIsValid(neighb[j][0], neighb[j][1])) {
                    if (board.isOccupied(neighb[j][0], neighb[j][1])) {
                        randomCellPos.push(piecePos[i]);
                    }
                }
                else {
                    randomCellPos.push(piecePos[i]);
                }
            }
        }
        //remove duplicate values
        reduced = [...randomCellPos.reduce((p, c) => p.set(c, true), new Map()).keys()];
        let filtered = reduced.splice(randomCell, reduced.length);
        return reduced;
    }

    //returns unique elements of an array : reference : https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    unique(arr) {
        return arr.sort().filter(function (ele, posi, ary) {
            return !posi || ele != ary[posi - 1];
        });
    }

 //area hinting : calculates area to indicate
    indicateAreaCells(piece, hintCommand) {
        let hintRow = hintCommand._nextPosition[0];
        let hintColumn = hintCommand._nextPosition[1];
        let startR;
        let startCol;
        let areaPosArray = [];
        startR = hintRow - 2;
        startCol = hintColumn - 2;
        let k = 0;
        for (let j = 0; j < 5; j++) {
            for (let l = 0; l < 5; l++) {
                let areaPos = [];
                areaPos[0] = j + startR;
                areaPos[1] = l + startCol;
                let validPosition = this.gameController.game()._board.positionIsValid(areaPos[0], areaPos[1]);
                if (validPosition) {
                    areaPosArray.push(areaPos);
                }
                k++;
            }
        }
        return [areaPosArray, null];
    }

 //hides the area
    hideArea(areaPos, prevBackground, timeoutFrame) {

        setTimeout(function () {
            for (let j = 0; j < areaPos.length; j++) {
                let fvalue = document.getElementById("field_" + areaPos[j][0] + "," + areaPos[j][1]);
                //TODO: replace with proper fadeOut animation
                fvalue.style.background = prevBackground[j];
            }
        }, timeoutFrame);
    }

//hides hints , please refer for the function call in indicatehint() function.
    hide(piecePos, prevBackground, timeoutFrame) {

        setTimeout(function () {
            for (let j = 0; j < 5; j++) {
                let fvalue = document.getElementById("field_" + piecePos[j][0] + "," + piecePos[j][1]);
                //TODO: replace with proper fadeOut animation
                fvalue.style.background = prevBackground[j];
            }
        }, timeoutFrame);
    }


//hides in case of most occupied cells
    hideMostOccupiedNeighbors(cellsToIndicate, prevBackground, timeoutFrame) {

        setTimeout(function () {
            for (let j = 0; j < cellsToIndicate.length; j++) {
                let fvalue = document.getElementById("field_" + cellsToIndicate[j][0] + "," + cellsToIndicate[j][1]);
                //TODO: replace with proper fadeOut animation
                fvalue.style.background = prevBackground[j];
            }
        }, timeoutFrame);
    }


 //fetches the occupied positions to indicate the hint
    getOccupiedPositions(piece, hintCommand) {
        let PiecePostions = [];
        let hintRow = hintCommand._nextPosition[0];
        let startRow = hintRow - 2;
        let hintColumn = hintCommand._nextPosition[1];
        let startColumn = hintColumn - 2;
        let occupiedPosArray = [];

        let pieceBitmap = piece.getMatrixRepresentation();

        //add all elements of current 5*5 overlay on board where piece matrix has 1's
        let k = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let piecePos = [];
                if (pieceBitmap[i][j] == "1") {
                    //add to occupiedPosArray
                    piecePos[0] = i + startRow;
                    piecePos[1] = j + startColumn;
                    occupiedPosArray[k] = piecePos;
                    k++;
                }
            }
        }

        return occupiedPosArray;
    }

    disablePrefillButton(bValue) {
        document.getElementById("prefillBoard").disabled = bValue;
    }

    prefillBoard() {
        this.readyForPrefilling();
        if (SettingsSingleton.getInstance().getSettings().general.enableAudio) {
            let audio = new Audio('resources/audio/prefill.mp3');
            audio.play();
        }
        let randomSolution = this.fetchRandomSolution();
        let prefillCandidates = [];
        let threshold = SettingsSingleton.getInstance().getSettings().prefilling.distanceValue;
        let scheme = SettingsSingleton.getInstance().getSettings().prefilling.prefillingStrategy;

        if (randomSolution != undefined) {
            switch (scheme) {
                case "distance":
                    prefillCandidates = this.prefillBasedOnDistance(randomSolution, threshold);
                    break;
                case "pieces":
                    prefillCandidates = this.prefillBasedOnAdjacentPieces(randomSolution, threshold);
                    break;
            }

        } else {
            this.disablePrefillButton(false);
            throw new Error("Could not find a random solution!!!"); //TODO: Need more meaningful error message here
        }
        this.pieces = prefillCandidates;
        this.renderPieces();
        // So that pieces are rendered before the button becomes enabled
        setTimeout(function (that) {
            that.disablePrefillButton(false);
        }, 100, this);

        if (SettingsSingleton.getInstance().getSettings().prefilling.fixPieces) {
            let piecesIdArray = this.pieces.filter(piece => !piece.inTray).
                map(piece => "piece_" + piece.name);
            //The pointer events to be disabled after the pieces are drawn on screen
            setTimeout(function(that) {
                that.disablePointerEventsOnPieces(piecesIdArray);
            }, 100, this);
        }

        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.showNumberOfPossibleSolutions();
        }
        this.checkIfGameWon();
    }

    getRandomElementFromArray(arrayObject) {
        if (Array.isArray(arrayObject)) {
            return arrayObject[Math.floor(Math.random() * arrayObject.length)];
        }
        return undefined;
    }

    readyForPrefilling() {
        this.reset();
        this.enablePointerEventsOnPieces();
        // Prevent clicking of button while previous prefilling is going on
        this.disablePrefillButton(true);
    }

    fetchRandomSolution() {
        let allSolutions = [];
        // Get all the games and filter solutions
        if (this.allSolutions == undefined) {
            this.gameController.getSolutions().forEach(game =>
                allSolutions.push([game._board._pentominoPositions, game._board._pentominoes]));
            this.allSolutions = allSolutions;
        }
        if (this.allSolutions.length > 0) {
            let solution = UtilitiesClass.getRandomElementFromArray(this.allSolutions);
            let ret = [];
            solution[0].every((piece, index) => ret.push([piece, solution[1][index]]));
            return ret;
        } else {
            this.disablePrefillButton(false);
            throw new Error("Solutions not found for current board!!!");
        }
    }

    /**
     * Prefills the board such that a piece does not touch more than <threshold> many
     * other pieces
     *
     * @param randomSolution
     * @param threshold
     * @returns
     */
    prefillBasedOnAdjacentPieces(randomSolution, threshold) {
        let thresholdMap = {
            "easy": 3,
            "medium": 2,
            "hard": 1,
            "extreme": 0
        };
        let currentAnchor = [];
        let piece = undefined;
        let piecePosition = undefined;
        let bOverlap = false;
        let prefillCandidates = [];
        let blockedCells = {};
        let bNearPentomino = false;
        let blockedCellsTemp = {};
        let x = 0, y = 0;
        let pickedPieces = {};

        for (let i = 0; i < randomSolution.length; ++i) {
            [piecePosition, piece] = this.getRandomPiece(randomSolution, pickedPieces);
            pickedPieces[piece.name] = 1;
            currentAnchor = [piecePosition.boardPosition[0],
            piecePosition.boardPosition[1]];
            let matrix = piece.getMatrixRepresentation();

            blockedCellsTemp = {};
            blockedCellsTemp = JSON.parse(JSON.stringify(blockedCells));
            blockedCellsTemp[piece.name] = {};
            blockedCellsTemp[piece.name].coordinates = [];
            blockedCellsTemp[piece.name].nearbyPentominos = 0;

            bOverlap = false;
            Object.keys(blockedCells).forEach(blockedPieceName => {
                bNearPentomino = false;
                for (let i = 0; i < 5; ++i) {
                    for (let j = 0; j < 5; ++j) {
                        if (matrix[i][j] == 0) continue;
                        x = i + currentAnchor[0] - 2;
                        y = j + currentAnchor[1] - 2;
                        blockedCells[blockedPieceName].coordinates.forEach(coordinates => {
                            if (coordinates[0] == x + 1 && coordinates[1] == y) bNearPentomino = true;
                            else if (coordinates[0] == x - 1 && coordinates[1] == y) bNearPentomino = true;
                            else if (coordinates[0] == x && coordinates[1] == y + 1) bNearPentomino = true;
                            else if (coordinates[0] == x && coordinates[1] == y - 1) bNearPentomino = true;
                        });
                    }
                }
                if (bNearPentomino) {
                    blockedCellsTemp[piece.name].nearbyPentominos += 1;
                    blockedCellsTemp[blockedPieceName].nearbyPentominos += 1;
                }
            });

            bOverlap = false;
            Object.keys(blockedCellsTemp).forEach(pieceName => {
                if (blockedCellsTemp[pieceName].nearbyPentominos > thresholdMap[threshold]) bOverlap = true;
            });

            if (!bOverlap) {
                for (let i = 0; i < 5; ++i) {
                    for (let j = 0; j < 5; ++j) {
                        if (matrix[i][j] == 0) continue;
                        blockedCellsTemp[piece.name].coordinates.push([i + currentAnchor[0] - 2, j + currentAnchor[1] - 2]);
                    }
                }
                blockedCells = JSON.parse(JSON.stringify(blockedCellsTemp));
                prefillCandidates.push(piece);
                this.removeFromTray(piece);
                piece.updateTrayValue(0);
                this.placePentomino(piece, currentAnchor[0], currentAnchor[1]);

            } else {
                piece = new Pentomino(piece.name);
                prefillCandidates.push(piece);
            }
        }

        return prefillCandidates;
    }

    /**
     * Fills the board with random pieces that conform to the constraint
     * that their centroids are atleast <threshold> units apart
     *
     * @param randomSolution
     * @param threshold
     *
     */
    prefillBasedOnDistance(randomSolution, threshold) {
        let thresholdMap = {
            "easy": 2,
            "medium": 3,
            "hard": 4,
            "extreme": 5
        };
        let positions = [];
        let currentAnchor = [];
        let candidateAnchor = [];
        let piece = undefined;
        let piecePosition = undefined;
        let bOverlap = false;
        let prefillCandidates = [];
        let pickedPieces = {};
        for (let i = 0; i < randomSolution.length; ++i) {
            [piecePosition, piece] = this.getRandomPiece(randomSolution, pickedPieces);
            pickedPieces[piece.name] = 1;
            currentAnchor = [piecePosition.boardPosition[0],
            piecePosition.boardPosition[1]];
            for (let j = 0; j < positions.length; ++j) {
                bOverlap = false;
                candidateAnchor = [positions[j][0], positions[j][1]];
                if (Math.sqrt(
                    Math.pow((currentAnchor[0] - candidateAnchor[0]), 2) +
                    Math.pow((currentAnchor[1] - candidateAnchor[1]), 2)) < thresholdMap[threshold]) {
                    bOverlap = true;
                    break;
                }
            }
            if (bOverlap) {
                piece = new Pentomino(piece.name);
                prefillCandidates.push(piece);
                continue;
            }
            prefillCandidates.push(piece);
            positions.push(currentAnchor);
            this.removeFromTray(piece);
            piece.updateTrayValue(0);
            this.placePentomino(piece, currentAnchor[0], currentAnchor[1]);
        }

        return prefillCandidates;
    }

    getRandomPiece(solution, pickedPieces) {
        return UtilitiesClass.getRandomElementFromArray(solution.filter(piece => !(pickedPieces[piece[0].name] == 1)));
    }

    execShadowCmd(command, seqType = CommandSeq.Forward) {
        let cmdProperty = updateCommandAttr(CommandTypes.Shadow, seqType);
        switch (command.name) {
            case "Remove":
            case "Place":
                if ((command.PosX == undefined) &&
                    (command.PosY == undefined)) {
                    if (command.Pentomino.inTray == 1) {
                        break;
                    }
                    command.Pentomino.updateTrayValue(1);
                    this.movePentominoToTray(
                        command.Pentomino,
                        cmdProperty);
                    this.positionPiece(command.Pentomino);
                }
                else {
                    command.Pentomino.inTray = 0;
                    this.placePentomino(
                        command.Pentomino,
                        command.PosX,
                        command.PosY,
                        cmdProperty);
                }

                break;

            case "RotateClkWise":
                this.selected = command.Pentomino;
                this.rotateClkWise(cmdProperty);
                break;

            case "RotateAntiClkWise":
                this.selected = command.Pentomino;
                this.rotateAntiClkWise(cmdProperty);
                break;

            case "MirrorH":
                this.selected = command.Pentomino;
                this.flipH(cmdProperty);
                break;

            case "MirrorV":
                this.selected = command.Pentomino;
                this.flipV(cmdProperty);
                break;

            default:
                //TODO: add commund related flag variable
                throw new Error("Can not undo");

        }
    }
    getCmdState(stateType) {
        if (stateType == "start") {
            return this.gameController.getStartCmdKey();
        }
        else {
            return this.gameController.getCurrentCmdKey()
        }
    }

    undo() {
        let commandSeq = this.gameController.undo();
        if (commandSeq == undefined) {
            return;
        }
        commandSeq.forEach((item) => {
            this.execShadowCmd(item);
        }, this);
        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.showNumberOfPossibleSolutions();
        }
        this.checkIfGameWon();
    }

    redo() {
        let commandSeq = this.gameController.redo();
        if (commandSeq == undefined) {
            return;
        }
        commandSeq.forEach((item) => {
            this.execShadowCmd(item);
        }, this);


        if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
            this.showNumberOfPossibleSolutions();
        }
        this.checkIfGameWon();
    }

    getGameIdByKey(key) {
        return this.gameController.getGameIdByKey(key);
    }

    getAllGameIds() {
        return this.gameController.getAllGameIds();
    }

    getImagesByGameId(gameId) {
        return this.gameController.getImagesByGameId(gameId);
    }

    getLastGameimage(gameId) {
        return this.gameController.getLastGameimage(gameId);
    }
    getCurrentGameId() {
        return this.gameController.getCurrentGameId();
    }

    saveGameImage(type = SnapshotType.Undefined) {
        type = type.toString();
        let gameCtrlr = this.gameController;
        let gameElem = document.getElementById('playarea');
        let currCmdKey = this.gameController.getCurrentCmdKey();

        let gameId = pd.visual.getCurrentGameKey();
        let img = pd.visual.getLastGameimage(gameId);
        if (img != undefined &&
            img.value == currCmdKey &&
            type == SnapshotType.Auto) {
            return;
        }

        html2canvas(gameElem).then(function (screeshot) {
            screeshot.setAttribute("class", "screenshot");
            screeshot.setAttribute("type", type);
            screeshot.value = currCmdKey;
            screeshot.style.width = '25vw';
            screeshot.style.height = '15vw';
            screeshot.style.border = "2px solid black";
            gameCtrlr.saveGameImage(screeshot);
        });

        html2canvas(gameElem).then(function (screeshot) {
            screeshot.setAttribute("class", "screenshot");
            screeshot.setAttribute("type", SnapshotType.FilterOnly);
            screeshot.value = currCmdKey;
            screeshot.style.width = '25vw';
            screeshot.style.height = '15vw';
            screeshot.style.border = "2px solid black";
            gameCtrlr.saveGameImage(screeshot);
        });

    }

    delGameAutoImages() {
        this.gameController.delGameAutoImages();
    }

    showGameImages() {
        delGameAutoImages();
        let gameImages = this.gameController.getGameImages();
        return gameImages;
    }

    deleteGameImage(key) {
        this.gameController.deleteGameImage(key);
    }

    getCurrentGameKey() {
        return this.gameController.getCurrentGameKey();
    }

    loadGame(key) {
        this.gameController.loadGame(key);
    }

    loadGameState(targetStateKey) {
        let currentCmdKey = this.gameController.getCurrentCmdKey();
        if (currentCmdKey == undefined) {
            currentCmdKey = this.gameController.getStartCmdKey();
        }
        let cmdSequences = this.gameController.getCmdSequences(currentCmdKey, targetStateKey);
        for (let indx = 0; indx < cmdSequences.length; indx++) {
            this.execShadowCmd(cmdSequences[indx], CommandTypes.Shadow);
        }
    }

    replay(startKey, targetKey) {
        this.disableManipulations();
        if (startKey.length == 0) {
            startKey = this.gameController.getStartCmdKey();
            if (startKey == undefined) {
                console.error("Game is not Started yet");
                return;
            }
        }

        if (targetKey.length == 0) {
            targetKey = this.gameController.getLastCmdKey();
            if (targetKey == undefined) {
                console.error("Game is not Started yet");
                return;
            }
        }
        this.loadGameState(startKey);
        let cmdSequences = this.gameController.getCmdSequences(startKey, targetKey);

        let timeInterval = 100;
        for (let indx = 0; indx < cmdSequences.length; indx++) {
            let command = cmdSequences[indx];
            var that = this;

            setTimeout(function (that, command, indx) {
                that.execShadowCmd(command, CommandTypes.Shadow);
                if (SettingsSingleton.getInstance().getSettings().hinting.showNumberOfPossibleSolutions) {
                    that.showNumberOfPossibleSolutions();
                }
                if (indx == (cmdSequences.length - 1)) {
                    UtilitiesClass.enablePointerEventsOnModalClose();
                }
                else {
                    UtilitiesClass.disablePointerEventsOnModalOpen();
                    that.disableManipulations();
                }
            }, timeInterval += 500, that, command, indx);
        }
        this.setReplayStatus(false);

        const pause = function (that) {
            let replayId = document.getElementById("replay");
            let replayImg = replayId.children[0];
            replayImg.setAttribute('src', 'resources/images/icons/replay.svg');
            // that.enablePointerEventsOnPieces();
        };
        setTimeout(pause, timeInterval, this);

    }

    setReplayStatus(verdict) {
        this.replayRunning = verdict;
    }

    /**
     *
     * @returns
     *  true: replay is running
     *  false: no replay
     */
    isRelayRunning() {
        return (this.replayRunning == true) ? true : false;
    }

    disablePointerEventsOnPieces(piecesIdArray) {
        piecesIdArray.forEach(function (pieceId) {
            document.getElementById(pieceId).style.pointerEvents = "none";
        });
    }

    enablePointerEventsOnPieces() {
        let pentominoes = this.gameController.getAllPentominoes();
        pentominoes.forEach(function (piece) {
            document.getElementById("piece_" + piece.name).style.pointerEvents = "auto";
        });
    }

    saveBoard(image) {
        this.gameController.saveBoard(image);
    }

    getBoards() {
        return this.gameController.getBoards();
    }


    //bot speaks in case of :
    //hintText() function
    //userinactivity() function
    //when the board is solved
    //when wrong actions are done
    speakBot(textTospeak) {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(textTospeak);
        let voices = synth.getVoices();
        let speechBubbleText = document.getElementById("speechBubbleText");
        //utter.lang = 'en-US';
        //utter.lang = 'en-IN';
        //utter.lang = 'de-DE';
        //SettingsSingleton.getInstance().getSettings().general.language === 1 ==> indicates german language
        //slang is set to german
        if (SettingsSingleton.getInstance().getSettings().general.language === 1) {
            utter.lang = 'de-DE';
            utter.voiceURI = 'Google Deutsch';
            utter.name = 'Google Deutsch';
            utter.localService = false;
            utter.default = false;
            //.speak() function is called for the bot to speak
            synth.speak(utter);
        }
        //(SettingsSingleton.getInstance().getSettings().general.language === 0)  ==> is english language
        //slang is set to UK english
        else {
            utter.lang = 'en-GB';
            utter.Local = 'true';
            utter.voiceURI = "Google UK English Female";
            utter.name = "Google UK English Female";
            //.speak() function is called for the bot to speak
            synth.speak(utter);
        }
    }


}
