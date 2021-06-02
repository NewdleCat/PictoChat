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
	console.log(profile_name)
	axios.post(add_friend_url, {username: profile_name})
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
