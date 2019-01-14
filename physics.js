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

const objectBallForcesForType = {
	bumper(bumper, ball, {ball: ballSettings}) {
		if (v.distance(bumper.pos, ball.pos) < bumper.radius + ballSettings.radius) {
			ball.vel = v.add(ball.vel, v.setLength(v.sub(ball.pos, bumper.pos), bumper.strength));
			bumper.active = 5;
		}
	},
	gravityBody({pos, exponent, normalLength, strength}, ball, settings) {
		const force = gravityForceBetween(ball.pos, pos, exponent, normalLength, strength);
		ball.vel = v.add(ball.vel, force);
	},
	block(block, ball, {ball: ballSettings}) {
		if (v.distance(ball.pos, block.pos) < block.radius + ballSettings.radius) {
			block.broken = true;
			const blockSurfaceNormalAngle = v.theta(v.sub(ball.pos, block.pos));
			const angleOfIncidence = Math.PI + v.theta(ball.vel) - blockSurfaceNormalAngle;
			const reflectedAngle = blockSurfaceNormalAngle - angleOfIncidence;
			ball.vel = v.setTheta(ball.vel, reflectedAngle);
		}
	},
};

function objectBallForces(object, ball, settings) {
	objectBallForcesForType[object.type](object, ball, settings);
}

const processObjectForType = {
	bumper(bumper, settings) {
		bumper.active = Math.max(0, bumper.active - 1);
	},
	gravityBody(gravityBody, settings) {},
	block(block, settings) {
		return block.broken;
	},
};

function processObject(object, settings) {
	return processObjectForType[object.type](object, settings);
}

export default function physics({scores, balls, paddles, objects}, settings) {
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
	for (let i = objects.length - 1; i >= 0; i--) {
		for (const ball of balls) {
			objectBallForces(objects[i], ball, settings);
		}
		if (processObject(objects[i], settings)) {
			objects.splice(i, 1);
		}
	}
}
