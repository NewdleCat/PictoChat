// because the canvas needs to be big, we keep the internal
// pixel data seperate from the canvas's actual pixel data
let data = []
const clearData = () => {
    data = []
    for (let i=0; i<width; i++) {
        data[i] = []
    }
}
clearData()

// the brush
let brush = {
    color: 1,
    size: 1,
}

const setPixel = (x, y, value) => {
    x = Math.floor(x)
    y = Math.floor(y)

    if (x >= 0 && x < width && y >= 0 && y < height)
        data[x][y] = value
}

const getPixel = (x, y) => {
    x = Math.floor(x)
    y = Math.floor(y)

    if (x < 0 || x >= 128 || y < 0 || y >= 64) return -1
    return data[x][y]
}

const drawCircle = (x, y, radius, value) => {
    setPixel(x,y,value)
    for (let r=0; r<radius; r+=0.5) {
        for (let a=0; a<Math.PI*2; a+=Math.PI/8) {
            setPixel(x + Math.cos(a)*r, y + Math.sin(a)*r, value)
        }
    }
}

const refreshCanvas = () => {
    // fill the entire canvas with white
    ctx.fillStyle = "white"
    ctx.fillRect(0,0, editorCanvas.width, editorCanvas.height)

    const dist = (x1,y1,x2,y2) => {
        return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
    }

    // go through and fill in the black pixels
    ctx.fillStyle = "black"
    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            if (getPixel(x,y)) {
                ctx.fillRect(x*scale,y*scale, scale,scale)
            }

            // draw the user's brush cursor
            if (dist(x+0.5,y+0.5, brush.x,brush.y) <= brush.size) {
                ctx.beginPath()
                ctx.rect(x*scale,y*scale, scale,scale)
                ctx.stroke()
            }
        }
    }
}

const changeEditorMenuSelection = selection => {
    // hackily refresh the menu by removing it and re-adding it
    document.body.removeChild(document.getElementById("editorToolMenu"))
    document.body.appendChild(fromTemplate("_editorToolMenu"))
    calculateCanvasScale()

    // highlight the selected tool
    const menu = document.getElementById("editorToolMenu")
    for (const thing of menu.children) {
        if (thing.id == selection + "_editortool") {
            thing.style.color = "#4488ff"
            thing.style.borderColor = "#4488ff"
            thing.style.borderStyle = "solid"
        }
    }

    if (selection == "brush")  brush.color = 1
    if (selection == "eraser") brush.color = 0
}

// converts the canvas data to a hexidecimal string
const dataToString = () => {
    let str = ""
    for (let y=0; y<height; y++) {
        for (let x=0; x<width; x+=4) {
            let n = data[x][y] || 0
            n += (data[x+1][y] || 0)*2
            n += (data[x+2][y] || 0)*4
            n += (data[x+3][y] || 0)*8
            str += n.toString(16)
        }
    }
    // return str
    let link = window.location.href
    let title = document.getElementById("editorTitleVal").value
    
    if (title == "")
        title = "untitled"

    window.location.href = link.substring(0, link.length - 5) + "post/" + str + "/" + title
}

const editorCanvas = document.getElementById("editorCanvas")
let scale
editorCanvas.width = width*scale
editorCanvas.height = height*scale
const ctx = editorCanvas.getContext("2d")

let mousedown = false
let lastmx, lastmy

// put things on the page
const toggleEditor = () => {
    showEditor = !showEditor

    const remove = e => {
        if (e) {
            document.body.removeChild(e)
        }
    }

    if (showEditor) {
        document.getElementById("editorDiv").appendChild(fromTemplate("_dim"))
        document.getElementById("editorDiv").appendChild(editorCanvas)
        document.body.appendChild(fromTemplate("_editorPostButton"))
        document.body.appendChild(fromTemplate("_editorCloseButton"))
        document.body.appendChild(fromTemplate("_editorTitle"))
        document.body.appendChild(fromTemplate("_editorToolMenu"))

        remove(document.getElementById("editButton"))
        remove(document.getElementById("friendInput"))

        calculateCanvasScale()
    } else {
        // remove the editor components
        remove(document.getElementById("editorPostButton"))
        remove(document.getElementById("editorCloseButton"))
        remove(document.getElementById("editorTitle"))
        remove(document.getElementById("editorToolMenu"))

        // remove the editor components that are in the editorDiv
        let dim = document.getElementById("dim")
        if (dim) document.getElementById("editorDiv").removeChild(dim)
        document.getElementById("editorDiv").removeChild(editorCanvas)

        document.body.appendChild(fromTemplate("_editButton"))
        document.body.appendChild(fromTemplate("_friendInput"))

		const addFriendInput = document.getElementById("friendInput")
		if (addFriendInput) {
            addFriendInput.style.left = innerWidth - addFriendInput.clientWidth - 64 + "px"
            addFriendInput.style.top = "-64 px"
        }

        let edit = document.getElementById("editButton")
        edit.style.top = "64px"
        edit.style.left = "64px"
    }
}

// make the canvas dynamically resize to the window
const calculateCanvasScale = () => {
    scale = Math.min(Math.round((innerWidth-200)/width), 10)
    editorCanvas.style.left = innerWidth/2 - width*scale/2 + "px"
    editorCanvas.style.top = innerHeight/2 - height*scale/2 + "px"
    editorCanvas.width = width*scale
    editorCanvas.height = height*scale
    refreshCanvas()

    // put the close button in the right spot
    let close = document.getElementById("editorCloseButton")
    if (close) {
        close.style.left = innerWidth/2 + width*scale/2 - close.clientWidth/2 + "px"
        close.style.top = innerHeight/2 - height*scale/2 - close.clientHeight/2 + "px"
    }

    let title = document.getElementById("editorTitle")
    if (title) {
        title.style.width = editorCanvas.clientWidth/2 + "px"
        title.style.left = innerWidth/2 - title.clientWidth/2 + "px"
        title.style.top = innerHeight/2 - height*scale/2 - title.clientHeight - 32 + "px"
    }

    let tools = document.getElementById("editorToolMenu")
    if (tools) {
        tools.style.top = innerHeight/2 - tools.clientHeight/2 + "px"
        tools.style.height = editorCanvas.height
        tools.style.left = innerWidth/2 - width*scale/2 - tools.clientWidth - 32 + "px"
        //tools.style.width = "200px"
    }

    // put the post button in the right spot
    let post = document.getElementById("editorPostButton")
    if (post) {
        post.style.left = innerWidth/2 - post.clientWidth/2 + "px"
        post.style.top = innerHeight/2 + editorCanvas.height/2 + 16 + "px"
    }
}
calculateCanvasScale()
window.addEventListener("resize", calculateCanvasScale)

document.addEventListener("mouseup", (event) => {
    mousedown = false
})

editorCanvas.addEventListener("mousedown", (event) => {
    mousedown = true
    const mx = event.offsetX/scale
    const my = event.offsetY/scale
    brush.x = mx
    brush.y = my

    drawCircle(mx,my,brush.size,brush.color)
    refreshCanvas()
})

editorCanvas.addEventListener("mousemove", (event) => {
    const mx = event.offsetX/scale
    const my = event.offsetY/scale
    brush.x = mx
    brush.y = my

    if (!lastmx) lastmx = mx
    if (!lastmy) lastmy = my

    if (mousedown) {
        // draw a line between last point and this point
        const dist = Math.sqrt((mx-lastmx)**2 + (my-lastmy)**2)
        const angle = Math.atan2(my-lastmy, mx-lastmx)
        for (let i=0; i<=dist; i++) {
            let x = lastmx + Math.cos(angle)*i
            let y = lastmy + Math.sin(angle)*i

            drawCircle(x,y,brush.size,brush.color)
        }
    }

    refreshCanvas()

    lastmx = mx
    lastmy = my
})
