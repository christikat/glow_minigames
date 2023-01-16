const playerPos = {
    x: 1,
    y: 1,
    lastMove: null,
    up() {
        this.y++;
        this.lastMove = "up";
        return this
    },
    down() {
        this.y--;
        this.lastMove = "down";
        return this
    },
    left() {
        this.x--;
        this.lastMove = "left";
        return this
    },
    right() {
        this.x++
        this.lastMove = "right";
        return this
    },
    updatePos() {
        $(".player").removeClass("player");
        $(".off-path-player").removeClass("off-path-player").html("");
        
        if ($(`[data-pathx="${this.x}"][data-pathy="${this.y}"]`).hasClass("path-square")) {
            $(`[data-pathx="${this.x}"][data-pathy="${this.y}"]`).addClass("player");
            this.onPath = true;
            if (this.y == currentGridSize) {
                endPathGame(true)
            }
        } else {
            $(`[data-pathx="${this.x}"][data-pathy="${this.y}"]`).addClass("off-path-player").html(oppositeArrowIcons[this.lastMove]);
            this.onPath = false;
            this.errorsMade++;
            if (this.errorsMade >= pathLives) {
                endPathGame(false, "lives");
            }
        }
    },
    onPath: true,
    errorsMade: 0,
};

const oppositeArrowIcons = {
    up: '<i class="fa-solid fa-down-long"></i>',
    down: '<i class="fa-solid fa-up-long"></i>',
    left: '<i class="fa-solid fa-right-long"></i>',
    right: '<i class="fa-solid fa-left-long"></i>',
}

let currentGridSize, pathLives;
const maxGridSize = 31

function startPathGame(settings) {
    activeGame = "path";
    if (settings.gridSize > maxGridSize) {
        settings.gridSize = maxGridSize;
    }
    pathLives = settings.lives;

    createPathGrid(settings.gridSize);
    displayScreen("path", "start");

    $("#path-timer-bar-inner").css("width", "100%");

    generatePath(settings.gridSize, 3);
    startTimeout = setTimeout(() => {
        if (activeGame == "path") {     
            hideScreen();
            $("#path-container").show();
            $("#path-timer-bar-inner").animate({
                width: "0%",
            }, {
                duration: settings.timeLimit,
                complete: () => {
                    endPathGame(false, "time");
                }
            })
        }
    }, 4000)
}

function endPathGame(win, reason) {
    if (activeGame != "path") return;

     $("#path-timer-bar-inner").stop();
    if (win) {
        displayScreen("path", "success");
    } else {
        if (reason == "time") {
            displayScreen("path", "failTime");
        } else if(reason == "lives") {
            displayScreen("path", "failError");
        }
    }
    
    endTimeout = setTimeout(() => {
        $("#path-container").fadeOut(500, function() {
            hideScreen();
        });

        $.post(`https://${scriptName}/endGame`, JSON.stringify({success: win}));
    }, 4000)

    activeGame = null;
    playerPos.lastMove = null;
    playerPos.onPath = true;
    playerPos.errorsMade = 0;
}

function resetPath() {
    hideScreen();
    $("#path-container").hide();
    $("#path-timer-bar-inner").stop();
    playerPos.lastMove = null;
    playerPos.onPath = true;
    playerPos.errorsMade = 0;
}

// gridSize should be an odd number
function createPathGrid(gridSize) {
    let squares = gridSize * gridSize;
    let addSquare = "";
    let gridTemplate = "";

    let xPos = 1
    let yPos = gridSize

    playerPos.x = Math.ceil(gridSize/2);
    playerPos.y = 1;
    currentGridSize = gridSize
    
    $("#path-grid").empty();

    for (let i = 0; i < squares; i++) {
        addSquare += `<div class="path-grid-square" data-pathx="${xPos}" data-pathy="${yPos}" id="s${i}"></div>`
        xPos++;
        
        if (i % gridSize == 0) {
            gridTemplate += `1fr `;
        }

        if ((i + 1) % gridSize == 0) {
            yPos--;
            xPos = 1;
        }
    }

    
    $("#path-grid").append(addSquare);
    $("#path-grid").css({"grid-template-columns": gridTemplate, "grid-template-rows": gridTemplate});
}

function generatePath(gridSize, maxMove) {
    const currentCoords = {
        x: playerPos.x,
        y: playerPos.y,
        up() {this.y++},
        down() {this.y--},
        left() {this.x--},
        right() {this.x++},
    };

    $(`[data-pathx="${currentCoords.x}"][data-pathy="${currentCoords.y}"]`).addClass("path-square");

    let possibleDirections = ["up", "left", "right"]; 
    let availableDirection = null;
    let lastDirection = null;
    
    while (currentCoords.y < gridSize) {
        const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        const moveAmt = Math.floor(Math.random()*maxMove) + 1;

        // prevent from going out of bounds
        if (randomDirection == "left" && (currentCoords.x - moveAmt) <= 0) {
            if (possibleDirections.length == 1) {
                possibleDirections = ["up"]
            }
            continue;
        }
        if (randomDirection == "right" && (currentCoords.x + moveAmt) >= gridSize) {
            if (possibleDirections.length == 1) {
                possibleDirections = ["up"]
            }
            continue;
        }

        for (let i = 0; i < moveAmt; i++) {
            currentCoords[randomDirection]();
            $(`[data-pathx="${currentCoords.x}"][data-pathy="${currentCoords.y}"]`).addClass("path-square");
        }

        // prevents path from touching itself
        if (randomDirection == "up" && moveAmt == 1) {
            availableDirection  = lastDirection;
        } else {
            availableDirection = null;
        }

        lastDirection = randomDirection
        
        // if path moves right or left, only allow it to move up, if it moves up only allow it to move right/left
        if (randomDirection == "left" || randomDirection == "right") {
            possibleDirections = ["up"];
        } else {
            availableDirection ? possibleDirections = [availableDirection] : possibleDirections = ["left", "right"];
        }
    }
    playerPos.updatePos();
}


$(document).keydown(function(e) {
    e = e || window.event;
    if (activeGame != "path") {return}
    if (e.keyCode == '38' || e.keyCode == '87') {
        // up arrow & w
        if (playerPos.y != currentGridSize) {
            if (playerPos.onPath) {
                playerPos.up().updatePos();
            } else if(playerPos.lastMove == "down") {
                playerPos.up().updatePos();
            }
        }
    } else if (e.keyCode == '40' || e.keyCode == '83') {
        // down arrow & s
        if (playerPos.y != 1) {
            if (playerPos.onPath) {
                playerPos.down().updatePos();
            } else if(playerPos.lastMove == "up") {
                playerPos.down().updatePos();
            }
        }
    } else if (e.keyCode == '37' || e.keyCode == '65') {
        // left arrow & a
        if (playerPos.x != 1) {
            if (playerPos.onPath) {
                playerPos.left().updatePos();
            } else if(playerPos.lastMove == "right") {
                playerPos.left().updatePos();
            }
        }
    } else if (e.keyCode == '39' || e.keyCode == '68') {
        // right arrow & d
        if (playerPos.x != currentGridSize) {
            if (playerPos.onPath) {
                playerPos.right().updatePos();
            } else if(playerPos.lastMove == "left") {
                playerPos.right().updatePos();
            }
        }
    }
})
