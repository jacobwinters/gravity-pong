const touches = {
	player1: {left: false, right: false},
	player2: {left: false, right: false},
};

export default touches;

function updateTouches(event) {
	touches.player1.left = touches.player1.right = false;
	touches.player2.left = touches.player2.right = false;
	for (let i = 0; i < event.touches.length; i++) {
		const touch = event.touches.item(i);
		const player = touch.clientY > document.body.clientHeight / 2 ? "player1" : "player2";
		const side = touch.clientX < document.body.clientWidth / 2 ? "left" : "right";
		touches[player][side] = true;
	}
}

document.body.addEventListener("touchstart", updateTouches);
document.body.addEventListener("touchend", updateTouches);
document.body.addEventListener("touchcancel", updateTouches);
document.body.addEventListener("touchmove", updateTouches);
