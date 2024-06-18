
class Cell {
    constructor(pentomino, zIndex = 0) {
        this._pentomino = pentomino;
        this._next = undefined;
        this._zindex = zIndex ;
    }
}

class Block {
    constructor(blockId) {
        this._id = blockId * 12;
        this._cell = undefined;
        this._cellCounter = 0;
    }

    add(pentomino) {

        if (this._cell == undefined) {
            this._cell = new Cell(pentomino);
            this._cellCounter = 1;
            return;
        }

        let itr = 1;
        let currCell = this._cell;
        while (currCell._next != undefined) {
            currCell = currCell._next;
            ++itr;
        }
        currCell._next = new Cell(pentomino, currCell._zindex + 10);
        ++this._cellCounter;
        // console.log('currCell--->', currCell ,  'zindex-->', currCell._zindex );
        // console.log('currecell.next-->', currCell._next ,  'zindex-->', currCell._next._zindex);
        // console.log('in add');
        // console.log('currCell-->', currCell._pentomino);
    }

    remove(pentomino) {

        let itr = 1;
        let currCell = this._cell;
        let prevCell = currCell;
        while (currCell != undefined) {

            if (currCell._pentomino == pentomino) {
                break;
            }

            prevCell = currCell;
            currCell = currCell._next;
            ++itr;
        }

        if (currCell == undefined) {
            console.error("Empty Block");
            return;
        }

        if (currCell == prevCell) {
            this._cell = currCell._next;
        } else {
            prevCell._next = currCell._next;
        }



        --this._cellCounter;
    }

    getIndex(pentomino) {
        let itr = 0;
        let currCell = this._cell;
        while (currCell != undefined) {

            if (currCell._pentomino == pentomino) {
                break;
            }

            currCell = currCell._next;
            ++itr;
        }

        if (currCell != undefined) {
            return currCell._zindex;
        }
    }
}

class OverlapBlock {
    constructor() {
        /**
         *  [0] : L->P->T
         *   ------------
         *  [6] : N->W->W
         */
        this._Blocks = [];
        /**
         *  [0] :  L - 0
         *  [1] :  T - 0
         *   ------------
         *  [11] : N - 2
         */
        this._pentominoInBlock = [];
        this.initialize();
    }

    initialize() {
        let pentominos = [
            'F', 'I', 'L', 'N', 'P', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z'];

        let BlockNumber = 12;

        for (var i = 0; i < BlockNumber; i++) {
            this._Blocks.push(new Block(i));
        }
        pentominos.forEach((item, index) => {
            this._Blocks[index].add(item);
            this._pentominoInBlock.push({
                name: item,
                block: this._Blocks[index]
            });
        }, this);
    }

    getBlock(pentomino) {
        let currBlock;
        this._pentominoInBlock.findIndex((item) => {
            if (item.name == pentomino) {
                currBlock = item.block;
                return;
            }
        }, this);
        if (currBlock == undefined) {
            console.error("Block not found in Pentomino Block list");
        }
        return currBlock
    }

    updateBlockList(pentomino, block) {
        this._pentominoInBlock = this._pentominoInBlock.map((item) => {
            if (item.name == pentomino) {
                item.block = block;
            }
            return item;
        }, this);
    }

    add(pentominoObj, collidePentomino) {

        let currBlock = this.getBlock(pentominoObj.name);
        currBlock.remove(pentominoObj.name);

        let targetBlock = this.getBlock(collidePentomino);
        targetBlock.add(pentominoObj.name);

        this.updateBlockList(pentominoObj.name, targetBlock);

    }

    findEmptyBlock() {

        for (let i = 0; i < this._Blocks.length; ++i) {
            if (this._Blocks[i]._cellCounter == 0) {
                return this._Blocks[i];
            }
        }

        return undefined;
    }

    remove(pentominoObj) {

        let currBlock = this.getBlock(pentominoObj.name);
        if (currBlock._cellCounter >= 2) {
            currBlock.remove(pentominoObj.name);
            let targetBlock = this.findEmptyBlock();
            targetBlock.add(pentominoObj.name);
            this.updateBlockList(pentominoObj.name, targetBlock);
        }
    }

    getZIndex(pentominoObj) {
        let currBlock = this.getBlock(pentominoObj.name);
        let zIndex = currBlock.getIndex(pentominoObj.name);
        return zIndex;
    }
}