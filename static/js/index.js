const width = 128
const height = 64

// automatically move over to /index if user is not explicitly on /index
let link = window.location.href
if (link.substring(link.length-5,link.length) != "index") {
	//window.location.href += "/index"
}

const fromTemplate = (template) => {
	return document.getElementById(template).content.firstElementChild.cloneNode(true)
}

const addFriend = () => {
	let link = window.location.href
	let code = document.getElementById("codeInput").value
	if (code == "") {
		return
	}
	window.location.href = link.substring(0, link.length - 5) + "add_friend/" + code
}

const deleteImage = (id) => {
    axios.post(delete_post_url, {id: id}).then((response) => {
    	window.location.href = window.location.href
    })
}

const getSearchNames = () => {
	let entry = document.getElementById("searchBar").value

	axios.post(search_bar_url, {entry: entry}).then((response) => {
		let nameList = response.data.nameList
		let res = document.getElementById("searchBarResults")
		res.innerHTML = "<ul>"
		for (const name of nameList) {
			res.innerHTML += `<li>${name}</li>`
		}
		res.innerHTML += "</ul>"
	})
}
