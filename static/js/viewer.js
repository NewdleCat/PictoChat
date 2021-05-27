const toUserProfile = name => {
	let link = window.location.href
	if (profile_name == "")
    	window.location.href = link.substring(0, link.length - 5) + "index/" + name
    else
    	window.location.href = window.location.href
}	

const drawFeed = () => {
	if (document.getElementById("drawings").childElementCount > 0) {
		const parent = document.getElementById('drawings')
		while (parent.firstChild) {
			parent.removeChild(parent.lastChild);
		}
	}

	const profileName = document.getElementById("profileName")
	if (profile_name != "")
		profileName.innerHTML = profile_name + "'s profile page"

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
		user.innerHTML = `<small> created by <a onclick='toUserProfile("${image.artist}")'> ${image.artist} </a> at ${image.date} </small>`

		const heart = feedEntry.getElementsByClassName("heart")[0]
		heart.onclick = () => { axios.post(like_post_url, {id: image.id}).then((response) => { image.likes = response.data.likes; drawFeed(); }) }
		
		if (image.likes > 0)
			heart.innerHTML = image.likes
		console.log(image.likes)

		if (image.owner == "True") {
			const trash = feedEntry.getElementsByClassName("feedTrash")[0]
			trash.innerHTML = `<a class="level-item" aria-label="like"><span class="icon is-small"><i class="fa fa-trash" aria-hidden="true" onclick="deleteImage(${image.id})"></i></span> </a>`
		}

		const get = (x,y,scale) => {
			return [Math.floor(x*scale), Math.floor(y*scale), Math.ceil(scale), Math.ceil(scale)]
		}

		let x = 0
		let y = 0
		for (let i=0; i<image.data.length; i++) {
			let n = parseInt(image.data[i], 16)

			if (n >= 8) {
				n -= 8
				let [sx, sy, sw, sh] = get(x+3, y, scale)
				ctx.fillRect(sx,sy,sw,sh)
			}
			if (n >= 4) {
				n -= 4
				let [sx, sy, sw, sh] = get(x+2, y, scale)
				ctx.fillRect(sx,sy,sw,sh)
			}
			if (n >= 2) {
				n -= 2
				let [sx, sy, sw, sh] = get(x+1, y, scale)
				ctx.fillRect(sx,sy,sw,sh)
			}
			if (n >= 1) {
				n -= 1
				let [sx, sy, sw, sh] = get(x, y, scale)
				ctx.fillRect(sx,sy,sw,sh)
			}

			x += 4

			if (x >= width) {
				x = 0
				y += 1
			}
		}
	}
}

window.addEventListener("resize", drawFeed)
