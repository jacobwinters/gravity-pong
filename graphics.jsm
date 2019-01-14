import {random, randomChance} from "./random.jsm";
import images from "./images.jsm";
export {images};

const image = new Image();
image.src = "images.png";

export class Graphics {
	constructor(canvas) {
		this.ctx = canvas.getContext("2d", {alpha: false});
		this.hue = 0;
	}

	frame(drawFrame, doingBg, settings) {
		this.doingBg = doingBg;
		if (doingBg) {
			this.setScale(settings);
			this.ctx.fillStyle = this.ctx.strokeStyle = this.ctx.shadowColor = `hsl(${(this.hue += 30)}, 100%, 50%)`;
		} else {
			this.ctx.restore();
			// Alpha .5 makes trails fade too quickly, but alpha .25 never fully erases them
			this.ctx.fillStyle = `rgba(0, 0, 0, ${this.hue % 360 === 0 ? 0.5 : 0.25})`;
			this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this.ctx.save();
			if (randomChance(10)) {
				this.ctx.translate(this.transformLength(random() * 5), this.transformLength(random() * 5));
			} else {
				this.ctx.translate(this.transformLength(random()), this.transformLength(random()));
			}
			this.ctx.fillStyle = this.ctx.strokeStyle = "#fff";
		}
		this.ctx.imageSmoothingEnabled = false;
		drawFrame(this);
	}

	setScale(settings) {
		// The + 100 makes a margin so objects on the sides aren't cut in half
		const sceneWidth = settings.field.width * 2 + 100,
			sceneHeight = settings.field.height * 2 + 100;
		const {width: screenWidth, height: screenHeight} = document.body.getBoundingClientRect();
		const sceneScaleMax = Math.min(screenWidth / sceneWidth, screenHeight / sceneHeight);
		this.sceneScale = sceneScaleMax > 1 ? 1 + (sceneScaleMax - 1) * 0.25 : sceneScaleMax;
		const pixelWidth = this.transformLength(sceneWidth),
			pixelHeight = this.transformLength(sceneHeight);
		if (this.ctx.canvas.width !== pixelWidth) {
			this.ctx.canvas.width = pixelWidth;
			this.ctx.canvas.style.width = `${pixelWidth / devicePixelRatio}px`;
		}
		if (this.ctx.canvas.height !== pixelHeight) {
			this.ctx.canvas.height = pixelHeight;
			this.ctx.canvas.style.height = `${pixelHeight / devicePixelRatio}px`;
		}
	}

	drawBall(x, y, radius) {
		this.ctx.beginPath();
		this.ctx.arc(this.transformX(x), this.transformY(y), this.transformLength(radius), 0, 2 * Math.PI);
		this.ctx.fill();
	}

	drawPaddle(x, y, width, height) {
		this.ctx.fillRect(this.transformX(x - width / 2), this.transformY(y + height / 2), this.transformLength(width), this.transformLength(height));
	}

	drawObject({pos: [x, y], radius, active}) {
		this.ctx.beginPath();
		this.ctx.arc(this.transformX(x), this.transformY(y), this.transformLength(radius), 0, 2 * Math.PI);
		if (!this.doingBg && active) {
			this.ctx.stroke();
		} else {
			this.ctx.fill();
		}
	}

	drawImage({x: srcX, y: srcY, width: srcWidth, height: srcHeight}, x, y, scale) {
		if (image.complete) {
			if (this.doingBg) this.ctx.shadowOffsetY = 1000000;
			this.ctx.drawImage(
				image,
				srcX,
				srcY,
				srcWidth,
				srcHeight,
				this.transformX(x) - this.transformLength(srcWidth / 2 * scale),
				this.transformY(y) - this.transformLength(srcHeight / 2 * scale) + (this.doingBg ? -1000000 : 0),
				this.transformLength(srcWidth * scale),
				this.transformLength(srcHeight * scale)
			);
			if (this.doingBg) this.ctx.shadowOffsetY = 0;
		}
	}

	drawScore(score, y) {
		const string = score.toString();
		const basePosition = Math.max(-2, 2 - string.length);
		for (let i = 0; i < string.length; i++) {
			this.drawImage(images[string[i]], (i + basePosition) * 4 * 8, y, 8);
		}
	}

	transformX(x) {
		return ~~(this.ctx.canvas.width / 2 + x * devicePixelRatio * this.sceneScale);
	}

	transformY(y) {
		return ~~(this.ctx.canvas.height / 2 - y * devicePixelRatio * this.sceneScale);
	}

	transformLength(length) {
		return ~~(length * devicePixelRatio * this.sceneScale);
	}
}
