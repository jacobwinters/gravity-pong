import * as dat from "./dat.gui.module.jsm";
import {Graphics} from "./graphics.jsm";
import * as input from "./input.jsm";
import physics from "./physics.jsm";
import {random, lowRandom} from "./random.jsm";
import createGame from "./setup.jsm";

const exponent = random() * 4;
const strength = 10 ** (random() + exponent * (exponent > 0 ? 1 : 2)); // Formula derived empirically
const settings = {
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
let game = createGame(settings);

// For debugging
window.game = game;
window.settings = settings;

let frames = 0;
let baseTime = performance.now();
function animationFrame(time) {
	runInput(game);
	gfx.frame(frame(game, settings), true, settings);
	while (frames <= (time - baseTime) / (1000 / 60)) {
		physics(game, settings);
		frames++;
	}
	gfx.frame(frame(game, settings), false, settings);
	requestAnimationFrame(animationFrame);
}
requestAnimationFrame(animationFrame);

function showSettings() {
	const rootGui = new dat.GUI();

	const actions = {
		reset() {
			window.game = game = createGame(settings);
		},
	};

	makeSettings(settings, rootGui);
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
