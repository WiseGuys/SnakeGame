let $body = $("body"),
    $gameCanvas = $("canvas#game"),
    gameOver = false,
    lostPlayersCount = 0,
    bodyHeight, bodyWidth,
    snakeSize = calcSize(),
    canvasWidth,
    canvasHeight,
    canvasVerticalBlockSize, canvasHorizontalBlockSize,
    canvasMiddleVer, canvasMiddleHor,
    freeIndexes = [],
    players = {
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
    },
    directions = ["right", "left", "up", "down"],
    allowedDirections = {
        right: ["up", "down"],
        left: ["up", "down"],
        up: ["right", "left"],
        down: ["right", "left"]
    };;

for (let i = 0; i < 4; i++)
    $("div#" + directions[i] + "Button").on("click", function () {
        if ($.inArray(directions[i], allowedDirections[players.users[0].direction]) !== -1)
            players.users[0].direction = directions[i];
    });

$(document).ready(function () {
    bodyHeight = document.body.clientHeight;
    bodyWidth = document.body.clientWidth;

    /*
     * Canvas sizes must be a factor of the snake size. So, reduce the extra width and height from
     * the canvas that does not fit the snake size.
     */
    canvasWidth = bodyWidth - (bodyWidth % snakeSize),
    canvasHeight = bodyHeight - (bodyHeight % snakeSize),

    /*
     * Indicates the block size of the canvas. The block sizes are actually the snake body parts. 
     * If a snake moves, it must move on the blocks and not out of them.
     */
    canvasHorizontalBlockSize = canvasWidth / snakeSize;
    canvasVerticalBlockSize = canvasHeight / snakeSize;

    // Set all indexes as free
    for (let i = 1; i <= canvasHorizontalBlockSize; i++) {
        freeIndexes[i] = [];
        for (let j = 1; j <= canvasVerticalBlockSize; j++)
            freeIndexes[i][j] = true;
    }

    $gameCanvas.attr({
        width: canvasWidth,
        height: canvasHeight
    });

    // Game start
    play();
});

function play() {
    // Set up players positions
    players.users[0].x = 4;
    players.users[0].y = Math.floor(canvasVerticalBlockSize / 8);
    players.bots[0].x = 4;
    players.bots[0].y = Math.floor(canvasVerticalBlockSize / 8 * 3);
    players.bots[1].x = 4;
    players.bots[1].y = Math.floor(canvasVerticalBlockSize / 8 * 5);
    players.bots[2].x = 4;
    players.bots[2].y = Math.floor(canvasVerticalBlockSize / 8 * 7);
    players.bots[3].x = canvasHorizontalBlockSize - 4;
    players.bots[3].y = Math.floor(canvasVerticalBlockSize / 8);
    players.bots[4].x = canvasHorizontalBlockSize - 4;
    players.bots[4].y = Math.floor(canvasVerticalBlockSize / 8 * 3);
    players.bots[5].x = canvasHorizontalBlockSize - 4;
    players.bots[5].y = Math.floor(canvasVerticalBlockSize / 8 * 5);
    players.bots[6].x = canvasHorizontalBlockSize - 4;
    players.bots[6].y = Math.floor(canvasVerticalBlockSize / 8 * 7);

    // Move all players, including users and bots
    players.users.forEach(function (player) {
        movePlayer(player);
    });
    players.bots.forEach(function (player) {
        movePlayer(player, true);
    });
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
    }, 50);
}

// Draws a snake body block
function drawSnakeBody($canvas, xSize, ySize, boxSize, options) {
    $canvas.drawRect($.extend({
        x: (xSize - 1) * boxSize,
        y: (ySize - 1) * boxSize,
        width: boxSize,
        height: boxSize,
        fromCenter: false
    }, options));
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
