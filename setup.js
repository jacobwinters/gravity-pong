import {random} from "./random.js";

function spawnBall({range, velocity, velocityRange}) {
	return {
		pos: [random() * range, random() * range],
		vel: [velocity[0] + random() * velocityRange[0], velocity[1] + random() * velocityRange[1]],
	};
}

function spawnPaddle(sideSign, {distanceFromEdge}, {height: fieldHeight}) {
	return {
		pos: [0, sideSign * (fieldHeight - distanceFromEdge)],
		vel: [0, 0],
	};
}

export default function createGame(settings) {
	const game = {
		scores: [0, 0],
		balls: [],
		paddles: [],
		objects: [],
	};
	for (let i = 0; i < settings.ball.spawn.count; i++) {
		game.balls.push(spawnBall(settings.ball.spawn));
	}
	if (false) {
		for (let i = 1; i < 10; i++) {
			if (i !== 5) {
				game.objects.push({
					type: "bumper",
					pos: [(i - 5) * 50, random() * 10],
					radius: 10,
					strength: 5,
					active: 0,
				});
			}
		}
	}
	if (false) {
		for (let i = 1; i < 10; i++) {
			if (i !== 5) {
				game.objects.push({
					type: "block",
					pos: [(i - 5) * 50, random() * 10],
					radius: 10,
				});
			}
		}
	}
	if (false) {
		game.objects.push({
			type: "gravityBody",
			pos: [random() * 250, random() * 200],
			strength: -100,
			exponent: 2,
			normalLength: 0,
			radius: 10,
		});
	}
	game.paddles.push(spawnPaddle(-1, settings.paddle, settings.field));
	game.paddles.push(spawnPaddle(1, settings.paddle, settings.field));
	return game;
}
