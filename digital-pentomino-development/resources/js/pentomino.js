"use strict";

const I_COLS = 5;
const I_ROWS = 5;
const COL_ANCHOR = 2;
const ROW_ANCHOR = 2;

class Pentomino {
    constructor(sPentominoType) {
        this.name = sPentominoType;
        this.iRows = I_ROWS;
        this.iCols = I_COLS;
        this.colAnchor = COL_ANCHOR;
        this.rowAnchor = ROW_ANCHOR;
        this.sRepr = '';
        this.trayPosition = -1;
        this.inTray = 1;
        switch (sPentominoType) {
            case 'F':
                this.color = this.setPentominoColors(0);
                this.trayPosition = 0;
                this.sRepr = '0000000110011000010000000';
                break;
            case 'L':
                this.color = this.setPentominoColors(1);
                this.trayPosition = 1;
                this.sRepr = '0010000100001000011000000';
                break;
            case 'N':
                this.color = this.setPentominoColors(2);
                this.trayPosition = 2;
                this.sRepr = '0010000100011000100000000';
                break;
            case 'P':
                this.color = this.setPentominoColors(3);
                this.trayPosition = 3;
                this.sRepr = '0000001100011000100000000';
                break;
            case 'Y':
                this.color = this.setPentominoColors(4);
                this.trayPosition = 4;
                this.sRepr = '0000000000001001111000000';
                break;
            case 'T':
                this.color = this.setPentominoColors(5);
                this.trayPosition = 5;
                this.sRepr = '0000001110001000010000000';
                break;
            case 'U':
                this.color = this.setPentominoColors(6);
                this.trayPosition = 6;
                this.sRepr = '0000001010011100000000000';
                break;
            case 'V':
                this.color = this.setPentominoColors(7);
                this.trayPosition = 7;
                this.sRepr = '0000001000010000111000000';
                break;
            case 'W':
                this.color = this.setPentominoColors(8);
                this.trayPosition = 8;
                this.sRepr = '0000001000011000011000000';
                break;
            case 'Z':
                this.color = this.setPentominoColors(9);
                this.trayPosition = 9;
                this.sRepr = '0000001100001000011000000';
                break;
            case 'I':
                this.color = this.setPentominoColors(10);
                this.trayPosition = 10;
                this.sRepr = '0010000100001000010000100';
                break;
            case 'X':
                this.color = this.setPentominoColors(11);
                this.trayPosition = 11;
                this.sRepr = '0000000100011100010000000';
                break;
            default:
                throw 'Unexpected Pentomino Type: \'' + sPentominoType + '\'';
        }
    }

    setPentominoColors(colorNumber) {
        let themeStyle = SettingsSingleton.getInstance().getSettings().theming.theme;
        let colorsArrayDefault = ['#cc2828', '#cccc28', '#7acc28', '#28cc28', '#cc28cc', '#28cc7a', '#28cccc', '#287acc', '#2828cc', '#cc287a', '#cc7a28', '#7a28cc'];
        //Dynamic configuring of colors
        if (themeStyle == 'blackAndWhiteTheme') {
            return '#3e3d3d';
        }
        else {
            // return '#3e3d3d';
            return colorsArrayDefault[colorNumber];
        }
    }


    getMatrixPosition([anchorRow, anchorCol], [row, col]) {
        return [
            row - anchorRow + this.rowAnchor,
            col - anchorCol + this.colAnchor
        ];
    }

    getCoordinatePosition([anchorRow, anchorCol], [relRow, relCol]) {
        return [
            relRow + anchorRow - this.rowAnchor,
            relCol + anchorCol - this.colAnchor
        ];
    }

    /**
     * Gets anchor position if pentomino is the specified relative position is located at the specified coordinate position.
     * @param coordinateRow
     * @param coordinateCol
     * @param relRow
     * @param relCol
     * @returns {*[]}
     */
    getAnchorPosition([coordinateRow, coordinateCol], [relRow, relCol]) {
        let [rowDiff, colDiff] = [this.rowAnchor - relRow, this.colAnchor - relCol];
        return [coordinateRow + rowDiff, coordinateCol + colDiff];
    }

    matrixPositionIsValid(row, col) {
        return !(row < 0
            || row >= this.iRows
            || col < 0
            || col >= this.iCols);
    }

    getCharAtMatrixPosition(relRow, relCol) {
        return this.sRepr.charAt(relRow * this.iCols + relCol);
    }

    rotateClkWise() {
        let aNewRepr = [];

        for (let i = this.iCols; i > 0; --i) {
            for (let j = this.iRows; j > 0; --j) {
                aNewRepr.push(this.sRepr[this.iCols * j - i]);
            }
        }

        this.sRepr = aNewRepr.join("");
    }

    rotateAntiClkWise() {
        let aNewRepr = [];

        for (let i = 1; i <= this.iCols; ++i) {
            for (let j = 1; j <= this.iRows; ++j) {
                aNewRepr.push(this.sRepr[this.iCols * j - i]);
            }
        }

        this.sRepr = aNewRepr.join("");
    }

    mirrorH() {
        let aNewRepr = [];

        for (let i = this.iRows - 1; i >= 0; --i) {
            for (let j = 0; j < this.iCols; ++j) {
                aNewRepr.push(this.sRepr[this.iCols * i + j]);
            }
        }

        this.sRepr = aNewRepr.join("");
    }

    mirrorV() {
        let aNewRepr = [];

        for (let i = 1; i <= this.iRows; ++i) {
            for (let j = 1; j <= this.iRows; ++j) {
                aNewRepr.push(this.sRepr[this.iRows * i - j]);
            }
        }

        this.sRepr = aNewRepr.join("");
    }

    getMatrixRepresentation() {
        let aPentomino = Array(5).fill(0).map(() => new Array(5).fill(0));
        for (let i = 0; i < this.iRows; ++i) {
            for (let j = 0; j < this.iCols; ++j) {
                aPentomino[i][j] = parseInt(this.sRepr[i * this.iCols + j]);
            }
        }

        return aPentomino;
    }

    display() {
        let aTemp = '';
        for (let i = 0; i < this.iRows; ++i) {
            aTemp = '|';
            for (let j = 0; j < this.iCols; ++j)
                aTemp = aTemp.concat(this.sRepr[i * this.iCols + j]);
            console.log(aTemp.concat('|'));
        }
    }

    updateTrayValue(value) {
        this.inTray = value;
        return this;
    }

    getRelPentominoPositions() {
        let positions = [];
        for (let row = 0; row < this.iRows; row++) {
            for (let col = 0; col < this.iCols; col++) {
                if (this.getCharAtMatrixPosition(row, col) === '1') {
                    positions.push([row, col]);
                }
            }
        }
        return positions;
    }

    static getDistinctPentominoStates(pentomino) {
        let pentominoStates = [];
        let generatorPentomino = new Pentomino(pentomino.name);
        Pentomino.addRotationPentominoStates(generatorPentomino, pentominoStates);
        generatorPentomino.mirrorV();
        Pentomino.addRotationPentominoStates(generatorPentomino, pentominoStates);
        return pentominoStates;
    }

    static addRotationPentominoStates(pentomino, pentominoStates) {
        for (let i = 0; i < 4; i++) {
            if (pentominoStates.find(p => p.sRepr === pentomino.sRepr) === undefined) {
                let p1 = new Pentomino(pentomino.name);
                Object.assign(p1, pentomino);
                pentominoStates.push(p1);
            }

            if (i < 3) {
                pentomino.rotateClkWise();
            }
        }
    }

    static getNumOfRotationsMirrors(currentPento, goalPento, numRotations) {
        if (currentPento.sRepr === goalPento.sRepr) {
            return [numRotations, 0];
        }

        if (numRotations > 3) {
            return null;
        }

        let currentPentoCopy = Object.assign(new Pentomino(goalPento.name), currentPento);
        currentPentoCopy.rotateClkWise();
        let result = this.getNumOfRotationsMirrors(currentPentoCopy, goalPento, new Number(numRotations) + 1);
        if (!(result === null)) {
            return result;
        }

        let currentPentoCopy2 = Object.assign(new Pentomino(goalPento.name), currentPento);
        currentPentoCopy2.mirrorH();
        if (currentPentoCopy2.sRepr === goalPento.sRepr) {
            return [numRotations, 1];
        } else {
            return null;
        }
    }
}

if (typeof module != 'undefined') {
    module.exports = Pentomino;
}
