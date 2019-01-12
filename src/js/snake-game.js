let $body = $("body"),
    $gameCanvas = $("canvas#game"), gameOver = false, lostPlayersCount = 0,
    docWidth = $body.css("width").replace("px", ""),
    docHeight = $body.css("height").replace("px", ""),
    snakeSize = calcSize(),
    canvasWidth = docWidth - (docWidth % snakeSize) - snakeSize,
    canvasHeight = docHeight - (docHeight % snakeSize) - snakeSize,
    canvasVerticalSize, canvasHorizontalSize, canvasSize,
    canvasMiddleVer, canvasMiddleHor,
    freeIndexes = [], players = {
        count: 8,
        users: [
            {
                direction: "right",
                color: "blue",
                lost: false
            }
        ],
        bots: [
            {
                direction: "right",
                color: "green"
            }, {
                direction: "right",
                color: "red"
            }, {
                direction: "right",
                color: "yellow"
            }, {
                direction: "left",
                color: "orange"
            }, {
                direction: "left",
                color: "mediumSpringGreen"
            },
            {
                direction: "left",
                color: "purple"
            },
            {
                direction: "left",
                color: "crimson"
            }
        ]
    }, directions = ["right", "left", "up", "down"],
    allowedDirections = {
        right: ["up", "down"],
        left: ["up", "down"],
        up: ["right", "left"],
        down: ["right", "left"]
    };

for (let i = 0; i < 4; i++)
    $("div#" + directions[i] + "Button").on("click", function () {
        if ($.inArray(directions[i], allowedDirections[players.user.direction]) !== -1)
            players.user.direction = directions[i];
    });

$(document).ready(function () {
    if ((canvasWidth / snakeSize) % 2 === 0)
        canvasWidth -= snakeSize;
    if ((canvasHeight / snakeSize) % 2 === 0)
        canvasHeight -= snakeSize;

    canvasHorizontalSize = canvasWidth / snakeSize;
    canvasVerticalSize = canvasHeight / snakeSize;
    canvasSize = canvasHorizontalSize * canvasVerticalSize;
    canvasMiddleHor = Math.ceil(canvasHorizontalSize / 2);
    canvasMiddleVer = Math.ceil(canvasVerticalSize / 2);

    for (let i = 1; i <= canvasHorizontalSize; i++) {
        freeIndexes[i] = [];
        for (let j = 1; j <= canvasVerticalSize; j++)
            freeIndexes[i][j] = true;
    }

    $gameCanvas.attr({
        width: canvasWidth,
        height: canvasHeight
    });

    play();
});

function play() {
    players.user.x = 4;
    players.user.y = Math.floor(canvasVerticalSize / 8);
    players.cpu1.x = 4;
    players.cpu1.y = Math.floor(canvasVerticalSize / 8 * 3);
    players.cpu2.x = 4;
    players.cpu2.y = Math.floor(canvasVerticalSize / 8 * 5);
    players.cpu3.x = 4;
    players.cpu3.y = Math.floor(canvasVerticalSize / 8 * 7);
    players.cpu4.x = canvasHorizontalSize - 4;
    players.cpu4.y = Math.floor(canvasVerticalSize / 8);
    players.cpu5.x = canvasHorizontalSize - 4;
    players.cpu5.y = Math.floor(canvasVerticalSize / 8 * 3);
    players.cpu6.x = canvasHorizontalSize - 4;
    players.cpu6.y = Math.floor(canvasVerticalSize / 8 * 5);
    players.cpu7.x = canvasHorizontalSize - 4;
    players.cpu7.y = Math.floor(canvasVerticalSize / 8 * 7);

    movePlayer(players.user);
    movePlayer(players.cpu1, true);
    movePlayer(players.cpu2, true);
    movePlayer(players.cpu3, true);
    movePlayer(players.cpu4, true);
    movePlayer(players.cpu5, true);
    movePlayer(players.cpu6, true);
    movePlayer(players.cpu7, true);
}

function drawSnakeBody($canvas, xSize, ySize, boxSize, options) {
    $canvas.drawRect($.extend({
        x: (xSize - 1) * boxSize,
        y: (ySize - 1) * boxSize,
        width: boxSize,
        height: boxSize,
        fromCenter: false
    }, options));
}

function movePlayer(player, alBot = false) {
    setTimeout(function () {
        if (alBot)
            checkAvailableWays(player);
        else
            switch (player.direction) {
                case "right":
                    player.x++;
                    break;
                case "left":
                    player.x--;
                    break;
                case "up":
                    player.y--;
                    break;
                case "down":
                    player.y++;
                    break;
            }

        let x = player.x,
            y = player.y;

        if (isIndexFree(x, y) && !gameOver) {
            drawSnakeBody($gameCanvas, x, y, snakeSize, {
                fillStyle: player.color
            });
            freeIndexes[x][y] = false;
            movePlayer(player, alBot);
        } else {
            player.lost = true;
            lostPlayersCount++;
            if (lostPlayersCount + 1 === players.count || players.user.lost) {
                gameOver = true;
                if (!players.user.lost)
                    alert("You won!");
                else alert("You lost!");
            }
        }
    }, 25);
}

function checkAvailableWays(alBot, checkAllowed = false) {
    let moveInfo = [
        ["right", "x", 1],
        ["left", "x", -1],
        ["up", "y", -1],
        ["down", "y", 1]
    ], randomMove = {};

    if (randomInt(0, 1) === 0) {
        randomMove.start = 0;
        randomMove.end = 2;
        randomMove.action = 1;
    } else {
        randomMove.start = 2;
        randomMove.end = -1;
        randomMove.action = -1;
    }

    if (randomInt(0, 200) === 0)
        alBot.direction = allowedDirections[alBot.direction][randomInt(0, 1)];

    if (checkAllowed) {
        let i = randomMove.start;
        while (i !== randomMove.end) {
            for (let j = 0; j < 4; j++)
                if (allowedDirections[alBot.direction][i] === moveInfo[j][0]) {
                    let axises = {
                        x: alBot.x,
                        y: alBot.y
                    }, move = moveInfo[j];

                    axises[move[1]] += move[2];

                    if (isIndexFree(axises.x, axises.y)) {
                        alBot[move[1]] += move[2];
                        alBot.direction = moveInfo[j][0];
                        return true;
                    }
                }
            i += randomMove.action;
        }
    } else {
        for (let i = 0; i < 4; i++)
            if (moveInfo[i][0] === alBot.direction) {
                let axises = {
                    x: alBot.x,
                    y: alBot.y
                }, move = moveInfo[i];

                axises[move[1]] += move[2];

                if (isIndexFree(axises.x, axises.y)) {
                    alBot[move[1]] += move[2];
                    return true;
                } else
                    return checkAvailableWays(alBot, true);
            }
    }
}

function calcSize() {
    let winWidth = window.innerWidth,
        winHeight = window.innerHeight;

    return Math.floor(((winWidth + winHeight) / 2) / 100);
}

function isIndexFree(x, y) {
    if (typeof freeIndexes[x] === "undefined")
        return false;
    if (typeof freeIndexes[x][y] === "undefined")
        return false;

    return (freeIndexes[x][y] === true);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).keydown(function (event) {
    let convertDirectionTo;

    switch (event.key) {
        case "ArrowRight":
            convertDirectionTo = "right";
            break;
        case "ArrowLeft":
            convertDirectionTo = "left";
            break;
        case "ArrowUp":
            convertDirectionTo = "up";
            break;
        case "ArrowDown":
            convertDirectionTo = "down";
            break;
        default:
            convertDirectionTo = null;
            break;
    }

    if ($.inArray(convertDirectionTo, allowedDirections[players.user.direction]) !== -1)
        players.user.direction = convertDirectionTo;
});