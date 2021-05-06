const width = 128
const height = 64

for (const image of images) {
	const scale = 2
	const canvas = document.createElement("canvas")
	canvas.width = width*scale
	canvas.height = height*scale
	canvas.style.margin = "16px"
	canvas.style.border = "dashed"
	document.getElementsByTagName("body")[0].appendChild(canvas)
	const ctx = canvas.getContext("2d")

	ctx.fillStyle = "black"
	let x = 0
	let y = 0
	for (let i=0; i<image.data.length; i++) {
		let n = parseInt(image.data[i], 16)

		if (n >= 8) {
			n -= 8
			ctx.fillRect((x+3)*scale,y*scale, scale,scale)
		}
		if (n >= 4) {
			n -= 4
			ctx.fillRect((x+2)*scale,y*scale, scale,scale)
		}
		if (n >= 2) {
			n -= 2
			ctx.fillRect((x+1)*scale,y*scale, scale,scale)
		}
		if (n >= 1) {
			n -= 1
			ctx.fillRect(x*scale,y*scale, scale,scale)
		}

		x += 4

		if (x >= width) {
			x = 0
			y += 1
		}
	}
}
