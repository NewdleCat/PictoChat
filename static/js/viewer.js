function removeAllChildNodes() {
	const parent = document.getElementById('drawings')
    while (parent.firstChild) {
    	parent.removeChild(parent.lastChild);
	}
}

const drawFeed = () => {
	if (document.getElementById("drawings").childElementCount > 0) {
		removeAllChildNodes()
	}
    for (const image of images) {
		const feedEntry = fromTemplate("_feedEntry")
		document.getElementById("drawings").appendChild(feedEntry)

		const canvas = feedEntry.getElementsByTagName("canvas")[0]
		canvas.width  = feedEntry.clientWidth - 48
		canvas.height = canvas.width/2 
		let scale = canvas.width/128
		const ctx = canvas.getContext("2d")
		ctx.fillStyle = "black"

		const title = feedEntry.getElementsByClassName("feedEntryTitle")[0]
		title.innerHTML = `<strong> ${image.title} </strong>`

		const user = feedEntry.getElementsByClassName("feedEntryUser")[0]
		user.innerHTML = `<small> created by ${image.artist} at ${image.date} </small>`

		if (image.owner == "True")
		{
			const trash = feedEntry.getElementsByClassName("feedTrash")[0]
			trash.innerHTML = `<a class="level-item" aria-label="like"><span class="icon is-small"><i class="fa fa-trash" aria-hidden="true" onclick="deleteImage(${image.id})"></i></span> </a>`
		}

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
drawFeed()
window.addEventListener("resize", drawFeed)
