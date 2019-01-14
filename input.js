import keys from "./input-keyboard.js";
import touches from "./input-touchscreen.js";

const player1Inputs = [keys.player1, touches.player1];
const player2Inputs = [keys.player2, touches.player2];

function mergeInputs({left: left1, right: right1}, {left: left2, right: right2}) {
	return {left: left1 || left2, right: right1 || right2};
}

function leftRight({left, right}) {
	if (left && right) return null;
	if (left) return "left";
	if (right) return "right";
	return null;
}

export function getSinglePlayerInput() {
	const inputs = mergeInputs(player1Inputs.reduce(mergeInputs), player2Inputs.reduce(mergeInputs));
	return leftRight(inputs);
}

export function getPlayer1Input() {
	return leftRight(player1Inputs.reduce(mergeInputs));
}

export function getPlayer2Input() {
	return leftRight(player2Inputs.reduce(mergeInputs));
}
