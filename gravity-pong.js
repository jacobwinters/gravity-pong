import * as dat from "./dat.gui.module.js";
import {Graphics} from "./graphics.js";
import * as input from "./input.js";
import physics from "./physics.js";
import {random, lowRandom} from "./random.js";
import createGame from "./setup.js";

function createSettings() {
	const exponent = random() * 4;
	const strength = 10 ** (random() + exponent * (exponent > 0 ? 1 : 2)); // Formula derived empirically
	return {
		field: {
			width: 250,
			height: 400,
			wallForceStrength: 500,
		},
		ball: {
			spawn: {
				count: 1 + 2 * (4 + ~~(random() * 4.5)),
				range: 20 + lowRandom() * 20,
				velocity: [random(), random() + Math.sign(random()) * 3],
				velocityRange: [3, 3],
			},
			interaction: {
				exponent: exponent,
				normalLength: 5 + Math.abs(lowRandom()) * 45,
				strength: strength,
			},
			radius: 5,
			drag: 0.9999,
		},
		paddle: {
			width: 75,
			height: 10,
			distanceFromEdge: 200,
			drag: 0,
			acceleration: 5,
			strength: 500,
		},
	};
}

function runInput({paddles}) {
	paddles[0].input = input.getPlayer1Input();
	paddles[1].input = input.getPlayer2Input();
}

function frame({scores, balls, paddles, objects}, settings) {
	return (graphics) => {
		for (const ball of balls) {
			graphics.drawBall(ball.pos[0], ball.pos[1], settings.ball.radius);
		}
		for (const paddle of paddles) {
			graphics.drawPaddle(paddle.pos[0], paddle.pos[1], settings.paddle.width, settings.paddle.height);
		}
		for (const object of objects) {
			graphics.drawObject(object);
		}
		graphics.drawScore(scores[0], -100);
		graphics.drawScore(scores[1], 100);
	};
}

const gfx = new Graphics(document.getElementById("canvas"));
// Exposed globally for debugging
window.settings = createSettings();
window.game = createGame(window.settings);

let settingsOpen = false;

let frames = 0;
let baseTime = performance.now();
function animationFrame(time) {
	runInput(window.game);
	gfx.frame(frame(window.game, window.settings), true, window.settings);
	while (frames <= (time - baseTime) / (1000 / 60)) {
		physics(window.game, window.settings);
		if (window.game.balls.length === 0) {
			window.game.restartTimer--;
		}
		frames++;
	}
	if (window.game.restartTimer <= 0) {
		if (!settingsOpen) {
			window.settings = createSettings();
		}
		window.game = createGame(window.settings);
	}
	gfx.frame(frame(window.game, window.settings), false, window.settings);
	requestAnimationFrame(animationFrame);
}
requestAnimationFrame(animationFrame);

function showSettings() {
	settingsOpen = true;

	const rootGui = new dat.GUI();

	const actions = {
		reset() {
			window.game = createGame(window.settings);
		},
	};

	makeSettings(window.settings, rootGui);
	makeSettings(actions, rootGui);
	function makeSettings(obj, gui) {
		for (const property of Object.keys(obj)) {
			if (typeof obj[property] === "object") {
				makeSettings(obj[property], gui.addFolder(property));
			} else {
				gui.add(obj, property);
			}
		}
	}
}

switch (window.location.hash) {
	default:
	case "#vsLocal":
		break;
	case "#settings":
		showSettings();
		break;
}

window.addEventListener("hashchange", () => location.reload());
