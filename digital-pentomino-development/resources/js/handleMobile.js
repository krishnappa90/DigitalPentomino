document.addEventListener('touchmove', function (event) {
    event = event.originalEvent || event;
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });

// Touch Handling for mobile devices
//intialize the touch events
function touchStartup() {
    var touchElement = document.getElementById("piecearea");
    touchElement.addEventListener("touchstart", touchStartHandle, false);
    touchElement.addEventListener("touchend", touchEndhandle, false);
    touchElement.addEventListener("touchmove", touchMoveHandle, false);
    touchElement.addEventListener("touchcancel", touchCancelhandle, false);
}

document.addEventListener("Mouse controls initialized ", touchStartup);
var currentTouches = [];

//when touch starts handle start function is called
function touchStartHandle(evt) {
    //console.log('In handle start function');
    evt.stopPropagation();
    // console.log('called evt stop propagation');
    evt.preventDefault();
    //console.log("touchstart.");
    //putting the ID of the HTML entity where touch controls we need to implement
    var touchElement = document.getElementById("canvas");
    var ctx = touchElement.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        //console.log("touchstart:" + i + "...");
        currentTouches.push(copyTouch(touches[i]));
        //   var color = colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);
        //  ctx.fillStyle = color;
        //ctx.fill();
        //console.log("touchstart:" + i + ".");
    }
}

function touchMoveHandle(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var touchElement = document.getElementById("canvas");
    var ctx = touchElement.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        // var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            //console.log("continuing touch "+idx);
            ctx.beginPath();
            //console.log("ctx.moveTo(" + currentTouches[idx].pageX + ", " + currentTouches[idx].pageY + ");");
            ctx.moveTo(currentTouches[idx].pageX, currentTouches[idx].pageY);
            //console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = 4;
            // ctx.strokeStyle = color;
            // ctx.stroke();

            currentTouches.splice(idx, 1, copyTouch(touches[i]));
            //console.log(".");
        } else {
            //console.log("Unable to determine which touch to continue");
        }
    }
}

function touchEndhandle(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    //console.log("touchend");
    var touchElement = document.getElementById("canvas");
    var ctx = touchElement.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        // var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = 4;
            // ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(currentTouches[idx].pageX, currentTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);
            currentTouches.splice(idx, 1);
        } else {
            //console.log("Unable to determine which touch to end");
        }
    }
}

//copying the touch objects 
function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}

//find the current position of the mouse pointer
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < currentTouches.length; i++) {
        var id = currentTouches[i].identifier;

        if (id == idToFind) {
            return i;
        }
    }
    return -1;    // not found
}

function touchCancelhandle(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    //console.log("touchcancel.");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        currentTouches.splice(idx, 1);
    }
}//end touch events