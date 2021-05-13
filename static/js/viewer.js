function removeAllChildNodes() {
	const parent = document.getElementById('drawings')
    while (parent.firstChild) {
    	parent.removeChild(parent.lastChild);
	}
}

const calculateCanvasScale = () => {
	if (document.getElementById("drawings").childElementCount > 0) {
		removeAllChildNodes()
	}
    for (const image of images) {
		const canvas = document.createElement("canvas")
		canvas.width = document.getElementById("drawings").clientWidth
		canvas.height = canvas.width/2
		let scale = canvas.width/128
		canvas.style.border = "dashed"
		document.getElementById("drawings").appendChild(canvas)
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
}
calculateCanvasScale()
window.addEventListener("resize", calculateCanvasScale)
