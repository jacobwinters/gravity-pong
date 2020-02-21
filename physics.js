import * as v from "./vector.js";

const abs = Math.abs,
	sign = Math.sign;

function gravityForceBetween(pos1, pos2, exponent, normalLength, strength) {
	const differenceFromIdealDistance = v.distance(pos1, pos2) - normalLength;
	// When exponent is 2, pairs of balls tend to fly out of clusters
	// I think this is because when a pair is very close to the normal length this function gives an extremely large force
	// This disables the force when the distance is small enough
	if (abs(differenceFromIdealDistance) < 10) return [0, 0];
	const forceMagnitude = strength / abs(differenceFromIdealDistance) ** exponent;
	const force = forceMagnitude * sign(differenceFromIdealDistance);
	const forceVector = v.setLength(v.sub(pos2, pos1), force);
	return forceVector;
}

function interBallForces(ball1, ball2, {exponent, normalLength, strength}) {
	const force = gravityForceBetween(ball1.pos, ball2.pos, exponent, normalLength, strength);
	ball1.vel = v.add(ball1.vel, force);
	ball2.vel = v.sub(ball2.vel, force);
}

function processBall(ball, {drag}, {width, height, wallForceStrength}) {
	ball.pos = v.add(ball.pos, ball.vel);
	ball.vel = v.scale(ball.vel, drag);

	const distanceToWall = abs(ball.pos[0] - width);
	const wallForce = wallForceStrength / distanceToWall ** 2;
	ball.vel[0] += wallForce * sign(ball.pos[0]) * -1;

	// Prevent balls from leaving the play area
	if (abs(ball.pos[0]) > width) {
		ball.pos[0] = width * sign(ball.pos[0]);
		ball.vel[0] *= -1;
	}
	return abs(ball.pos[1]) > height ? sign(ball.pos[1]) : 0;
}

function processPaddle(paddle, {drag, acceleration}, {width: fieldWidth}) {
	paddle.pos = v.add(paddle.pos, paddle.vel);
	paddle.vel = v.scale(paddle.vel, drag);

	switch (paddle.input) {
		case "left":
			paddle.vel[0] -= acceleration;
			break;
		case "right":
			paddle.vel[0] += acceleration;
			break;
	}

	if (abs(paddle.pos[0]) > fieldWidth) {
		paddle.pos[0] = fieldWidth * sign(paddle.pos[0]);
		paddle.vel[0] = 0;
	}
}

function paddleBallForces(paddle, ball, {strength}) {
	ball.vel = v.add(ball.vel, gravityForceBetween(ball.pos, paddle.pos, 2, 0, -strength));
}

export default function physics({scores, balls, paddles}, settings) {
	// Backwards loop because we're removing elements
	for (let i = balls.length - 1; i >= 0; i--) {
		for (let j = i - 1; j >= 0; j--) {
			interBallForces(balls[i], balls[j], settings.ball.interaction);
		}
		const result = processBall(balls[i], settings.ball, settings.field);
		if (result !== 0) {
			balls.splice(i, 1);
			scores[result === 1 ? 0 : 1]++;
		}
	}
	for (const paddle of paddles) {
		for (const ball of balls) {
			paddleBallForces(paddle, ball, settings.paddle);
		}
		processPaddle(paddle, settings.paddle, settings.field);
	}
}
