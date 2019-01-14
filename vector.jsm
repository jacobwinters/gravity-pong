export function add([x1, y1], [x2, y2]) {
	return [x1 + x2, y1 + y2];
}

export function sub([x1, y1], [x2, y2]) {
	return [x1 - x2, y1 - y2];
}

export function scale([x, y], scalar) {
	return [x * scalar, y * scalar];
}

export function length([x, y]) {
	return Math.hypot(x, y);
}

export function setLength(vector, scalar) {
	return scale(vector, scalar / length(vector));
}

export function distance([x1, y1], [x2, y2]) {
	return Math.hypot(x1 - x2, y1 - y2);
}

export function theta([x, y]) {
	return Math.atan2(y, x);
}

export function setTheta(vector, theta) {
	return fromPolar(length(vector), theta);
}

export function fromPolar(length, theta) {
	return [Math.cos(theta) * length, Math.sin(theta) * length];
}
