export function random() {
	return Math.random() * 2 - 1;
}

export function lowRandom() {
	return random() * random();
}

export function randomChance(n) {
	return Math.random() < 1 / n;
}
