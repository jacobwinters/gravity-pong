const keys = {
	player1: {left: false, right: false},
	player2: {left: false, right: false},
};

export default keys;

function setKey(value) {
	return (event) => {
		switch (event.key) {
			case "ArrowLeft":
				keys.player1.left = value;
				break;
			case "ArrowRight":
				keys.player1.right = value;
				break;
			case "a":
				keys.player2.left = value;
				break;
			case "d":
				keys.player2.right = value;
				break;
		}
	};
}

document.body.addEventListener("keydown", setKey(true));

document.body.addEventListener("keyup", setKey(false));
