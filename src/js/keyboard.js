// Keyboard handling to control user's snake.
$(document).keydown(function (event) {
    /*
     * Check if user entered any of the arrow keys, and extract the direction of the player to turn.
     * For example, the right arrow's event.key is ArrowRight, so extract right from that.
     */
    let newDirection = event.key.toLowerCase().replace(/(arrow)/i, "");

    /*
     * Change the direction if it's allowed. For example, don't allow to change direction from left
     * to right, because it causes the snake to go inside itself!
     */
    if ($.inArray(newDirection, allowedDirections[players.users[0].direction]) !== -1)
        players.users[0].direction = newDirection;
});
