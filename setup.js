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
		restartTimer: 60,
	};
	for (let i = 0; i < settings.ball.spawn.count; i++) {
		game.balls.push(spawnBall(settings.ball.spawn));
	}
	game.paddles.push(spawnPaddle(-1, settings.paddle, settings.field));
	game.paddles.push(spawnPaddle(1, settings.paddle, settings.field));
	return game;
}
