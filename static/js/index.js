const width = 128
const height = 64
let search_bar_url = "[[=XML(search_bar_url)]]";

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
	let link = window.location.href
	window.location.href = link.substring(0, link.length - 5) + "delete_image/" + id
}

const getSearchNames = () => {
	let temp = []
	axios.get(search_bar_url).then((response) => {
        temp = response.data.nameList
    });
    console.log(temp)
}