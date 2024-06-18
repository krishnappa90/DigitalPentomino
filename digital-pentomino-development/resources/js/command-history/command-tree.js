if (typeof require != 'undefined') {
    Command = require('./command-node.js');
    CommandPath = require('./command-path.js');
}

const UNDO = 1;
const REDO = 1 << 1;
const SearchStrategy = { "Top2Bottom": 1, "BottomUp": 1 << 1 };
Object.freeze(SearchStrategy);

class CommandTree {
    constructor() {
        this._rootCmdNode = undefined;
        this._currentCmdNode = undefined;
        this._lastComandNode = undefined;
    }

    Clean() {
        this._rootCmdNode = undefined;
        this._currentCmdNode = undefined;
        this._lastComandNode = undefined;
    }

    _insert(current, parent, command) {
        if (current == undefined) {
            current = new CommandNode(command);
            if (parent == undefined) {
                return current;
            } else {
                parent.AddChild(current);
                this._currentCmdNode = current;
                return parent;
            }
        }

        parent = current;
        if (current == this._currentCmdNode) {
            current = new CommandNode(command);
            this._currentCmdNode = current;
            parent.AddChild(current);
            return parent;
        }

        if (current.Children().length != 0) {
            current = current.ChildTopNode();
        }
        else {
            current = undefined;
        }

        current = this._insert(current, parent, command);

        return parent == current.Parent() ? parent : current;
    }

    Insert(command) {

        if (this._currentCmdNode == undefined &&
            this._rootCmdNode != undefined) {
            this._currentCmdNode = this._rootCmdNode;
        }

        if (this._currentCmdNode != undefined &&
            this._currentCmdNode != this._lastComandNode) {
            let newCommand = new CommandNode(command);
            this._currentCmdNode.AddChild(newCommand);
            this._currentCmdNode = newCommand;
            this._lastComandNode = this.TreeRightMost(this._rootCmdNode);
            return this._currentCmdNode;

        }

        this._rootCmdNode = this._insert(this._rootCmdNode, this._rootCmdNode, command);
        if (this._currentCmdNode == undefined) {
            this._currentCmdNode = this._rootCmdNode;
        }
        this._lastComandNode = this._currentCmdNode;

        return this._currentCmdNode;
    }

    SearchCmdNode(current, key) {
        if (current == undefined) {
            return undefined;
        }

        if (current.Key() == key) {
            return current;
        }

        let retNode = undefined;
        for (let indx = 0; indx < current.Children().length; ++indx) {

            let childs = current.Children();
            retNode = this.SearchCmdNode(
                childs[indx],
                key);

            if (retNode != undefined) {
                return retNode;
            }
        }

        return retNode;
    }

    TreeRightMost(currNode) {
        if (currNode == undefined) {
            return undefined;
        }

        let retNode = this.TreeRightMost(currNode.ChildTopNode());
        if (retNode == undefined) {
            return currNode;
        }

        return retNode;
    }

    NodeCount(currentNode = this._rootCmdNode) {
        if (currentNode == undefined) {
            return 0;
        }

        for (let indx = 0; indx < currentNode.Children().length; ++indx) {
            let childs = currentNode.Children();
            return (1 + this.NodeCount(childs[indx]));
        }

        return 1;
    }

    GetNodePath(currNode, key) {
        if (currNode == undefined) {
            return undefined;
        }

        if (currNode.Key() == key) {
            return [currNode];
        }

        let childs = currNode.Children();
        let retNodes = [];
        for (let iter = 0; iter < childs.length; ++iter) {
            let node = this.GetNodePath(childs[iter], key);

            if (node.length != 0) {
                retNodes.push(currNode);
            }
            retNodes = [...retNodes, ...node];
        }

        return retNodes;
    }

/**
 * For every two key in the tree, it finds the order type.
 */
    GetSequeneType(currNode, startKey, endKey) {
        if (currNode == undefined) {
            return undefined;
        }

        if (startKey == endKey) {
            return SearchStrategy.Top2Bottom;
        }

        if (currNode.Key() == startKey) {
            return SearchStrategy.Top2Bottom;
        }

        if (currNode.Key() == endKey) {
            return SearchStrategy.BottomUp;
        }
        let seqType = 0;
        for (let indx = 0; indx < currNode.Children().length; ++indx) {
            let childs = currNode.Children();
            seqType = this.GetSequeneType(
                childs[indx],
                startKey,
                endKey
            );
            if (seqType != 0) {
                return seqType;
            }
        }
        return seqType;
    }

    /**
     * Find the top parents branch next node, to remember
     * Redo operations
     * 
     * @param {*} currNode 
     * @returns 
     */
    NextBranchNode(currNode) {
        if (currNode == undefined) {
            return undefined;
        }
        if (currNode.Key() == currNode.Parent().Key()) {
            return undefined;
        }

        let siblings = currNode.Siblings();
        if (siblings.length > 1) {
            for (let iter = 0; iter < siblings.length; ++iter) {
                if (currNode.Key() == siblings[iter].Key() &&
                    this.NodePosition(currNode) != NodeOrder.Last) {
                    return siblings[iter + 1];
                }
            }
        }

        return this.NextBranchNode(currNode.Parent());
    }

    /**
     * Find the top parents branch previous node, to remember
     * undo operations
     * 
     * Can be achieved this by in place check
     * 
     * @param {*} currNode 
     * @returns 
     */

    PrevBranchNode(currNode) {
        if (currNode == undefined) {
            return undefined;
        }
        if (currNode.Key() == currNode.Parent().Key()) {
            return undefined;
        }

        let siblings = currNode.Siblings();
        if (siblings.length > 1) {
            for (let iter = 0; iter < siblings.length; ++iter) {
                if (currNode.Key() == siblings[iter].Key() &&
                    (this.NodePosition(currNode) != NodeOrder.First)) {
                    return siblings[iter - 1];
                }
            }
        }

        return this.PrevBranchNode(currNode.Parent());
    }

    /**
     * very recent branch leaf node
     * @param {} head 
     * @returns 
     */

    LeafNode(head) {
        if (head == undefined) {
            return undefined;
        }

        let siblings = head.Children();
        if (siblings.length == 0) {
            return head;
        }
        else if (siblings.length >= 1) {
            return this.LeafNode(head.ChildTopNode());
        }

    }

    /**
     *  Current branch top node
     * 
     * @param {*} leaf 
     * @returns 
     */
    TopNode(leaf) {
        if (leaf == undefined) {
            return undefined;
        }
        if (leaf.Key() == leaf.Parent().Key()) {
            return undefined;
        }


        let siblings = leaf.Parent().Children();
        if (siblings.length > 1) {
            return leaf;
        }
        else if (siblings.length <= 1) {
            return this.TopNode(leaf.Parent());
        }
    }

    /**
     * Find the node order among the siblings
     * 
     */
    NodePosition(current) {
        if (current == undefined) {
            return NodeOrder.Unknown;
        }

        let siblings = current.Parent().Children();
        for (let iter = 0; iter < siblings.length; ++iter) {
            if (current.Key() == siblings[iter].Key()) {
                if (iter == 0) {
                    return NodeOrder.First;
                }
                else if (iter == (siblings.length - 1)) {
                    return NodeOrder.Last;
                }
                else {
                    return NodeOrder.Middle;
                }
            }
        }
    }

    PositionCurrent(cmdKey) {
        if (cmdKey == undefined) {
            this._currentCmdNode = undefined;
            return;
        }
        this._currentCmdNode = this.SearchCmdNode(this._rootCmdNode, cmdKey);
    }

    isEmpty() {
        return this.isAtRoot() && this.isAtLeaf();
    }

    isAtRoot() {
        return this._currentCmdNode === this._rootCmdNode;
    }

    isAtLeaf() {
        return this._currentCmdNode.getChildren().length === 0;
    }

    Root() {
        return this._rootCmdNode;
    }

    Current() {
        return this._currentCmdNode;
    }

    Leaf() {
        return this._lastComandNode;
    }

    CmdSequences(startKey, endKey) {
        let startPath = this.GetNodePath(this._rootCmdNode, startKey);
        let endPath = this.GetNodePath(this._rootCmdNode, endKey);
        let sIndx = 0,
            eIndx = 0,
            parentIndx = -1;
        let parent = undefined;
        while (sIndx != startPath.length ||
            eIndx != endPath.length) {
            if (sIndx == eIndx &&
                startPath[sIndx] == endPath[eIndx]) {
                sIndx++;
                eIndx++;
            }
            else {
                parentIndx = eIndx;

                if ((startPath[sIndx - 1].ChildTopNode() == endPath[sIndx]) ||
                    (endPath[eIndx - 1].ChildTopNode() == startPath[eIndx])
                ) {
                    parentIndx = (parentIndx != 0) ? parentIndx - 1 : 0;
                }
                break;
            }
        }

        let startBranch = [];
        for (let indx = startPath.length - 1; indx > parentIndx; indx--) {
            startBranch.push(startPath[indx].Command());
        }

        let endBranch = [];
        for (let indx = parentIndx; indx < endPath.length; indx++) {
            endBranch.push(endPath[indx].Command());
        }


        let sequnceType = this.GetSequeneType(this._rootCmdNode, startKey, endKey);
        if (sequnceType == SearchStrategy.BottomUp) {
            endBranch = endBranch.reverse();
        }

        let retCmds = [];
        retCmds = [...startBranch, ...endBranch];
        return {
            seqType: sequnceType,
            commands: retCmds
        };
    }

    CollectCmdSequences(
        currNode,
        startKey,
        endKey,
        searchType) {


        if (currNode == undefined) {
            return undefined;
        }

        if (startKey == endKey) {
            return {
                seqType: SearchStrategy.Top2Bottom,
                commands: [this.SearchCmdNode(currNode, startKey).Command()]
            };
        }

        if (currNode.Key() == startKey) {
            searchType |= SearchStrategy.Top2Bottom;
            if ((SearchStrategy.BottomUp & searchType) != 0) {
                return {
                    seqType: SearchStrategy.BottomUp,
                    commands: [currNode.Command()]
                };
            }
        }

        if (currNode.Key() == endKey) {
            searchType |= SearchStrategy.BottomUp;
            if ((SearchStrategy.Top2Bottom & searchType) != 0) {
                return {
                    seqType: SearchStrategy.Top2Bottom,
                    commands: [currNode.Command()]
                };
            }
        }

        let retObj = {
            seqType: 0,
            commands: []
        };

        let searchValue = searchType;
        for (let indx = 0; indx < currNode.Children().length; ++indx) {
            let childs = currNode.Children();
            let cmdObj = this.CollectCmdSequences(
                childs[indx],
                startKey,
                endKey,
                searchValue
            );


            if (searchType) {
                if (!retObj.commands.find(cmd => cmd._pentomino === currNode.Command()._pentomino)) {
                    retObj.commands.push(currNode.Command());
                }
            } else {
                searchValue = cmdObj.seqType;
            }

            retObj.seqType = cmdObj.seqType;
            retObj.commands = [...retObj.commands, ...cmdObj.commands];


        }

        if (searchType &&
            retObj.seqType == 0) {
            retObj.seqType = searchType;
            retObj.commands.push(currNode.Command());
        }


        return retObj;
    }

    MoveUp() {

        if (this._currentCmdNode == undefined) {
            if (this._rootCmdNode == undefined) {
                console.error("Command Tree is Emty: Game is not Started");
                return;
            }
        }

        if (this._currentCmdNode.Key() === this._currentCmdNode.Parent().Key()) {
            return;
        }

        let current = this._currentCmdNode;
        let sibling = current.Parent().Children();
        if (sibling.length > 1) {
            this._currentCmdNode = this.PrevBranchNode(this._currentCmdNode);
        }
        else {
            this._currentCmdNode = this._currentCmdNode.Parent();
        }
    }


    MoveDown() {
        let current = undefined;
        if (this._currentCmdNode == undefined) {
            if (this._rootCmdNode == undefined) {
                console.error("Command Tree is Emty: Game is not Started");
                return;
            }
            else {
                this._currentCmdNode = this._rootCmdNode;
            }
        }

        if (this._currentCmdNode.Children().length == 0) {
            let branchNode = this.NextBranchNode(this._currentCmdNode);
            if (branchNode != undefined) {
                this._currentCmdNode = branchNode;
            } else {
                console.log("Redo not possible");
            }
            return;
        }
        else {
            this._currentCmdNode = this._currentCmdNode.Children()[0];
            return;
        }
    }

    CollectCmdKeySequences(
        currNode,
        startKey,
        endKey,
        searchType) {


        if (currNode == undefined) {
            return undefined;
        }

        if (currNode.Key() == startKey) {
            searchType |= SearchStrategy.Top2Bottom;
            if ((SearchStrategy.BottomUp & searchType) != 0) {
                return [currNode._key];
            }
        }

        if (currNode.Key() == endKey) {
            searchType |= SearchStrategy.BottomUp;
            if ((SearchStrategy.Top2Bottom & searchType) != 0) {
                return [currNode._key];
            }
        }
        let cmdKeySeq = [];
        for (let indx = 0; indx < currNode.Children().length; ++indx) {

            let childs = currNode.Children();
            let commandKeys = this.CollectCmdKeySequences(
                childs[indx],
                startKey,
                endKey,
                searchType
            );

            if (commandKeys.length != 0) {
                if (!cmdKeySeq.find(key => key === currNode._key)) {
                    cmdKeySeq.push(currNode._key);
                }
                commandKeys.forEach(cmdKey => {
                    cmdKeySeq.push(cmdKey);
                });
            }
        }

        if (cmdKeySeq.length == 0) {
            cmdKeySeq.push(currNode._key);
        }

        return cmdKeySeq;
    }
}
if (typeof module != 'undefined') {
    module.exports = CommandHistoryTree;
}
