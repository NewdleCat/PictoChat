// the brush
const brush = {
    color: 1,
    size: 1,
    x: undefined,
    y: undefined,

    draw(x,y) {
        editor.setPixel(x,y,this.color)
        for (let r=0; r<this.size; r+=0.5) {
            for (let a=0; a<Math.PI*2; a+=Math.PI/8) {
                editor.setPixel(x + Math.cos(a)*r, y + Math.sin(a)*r, this.color)
            }
        }
    },
}

const editor = {
    data: [],
    scale: 1,
    canvas: document.getElementById("editorCanvas"),

    clear() {
        this.data = []
        for (let i=0; i<width; i++) this.data[i] = []
    },

    setPixel(x, y, value) {
        x = Math.floor(x)
        y = Math.floor(y)
        if (x >= 0 && x < width && y >= 0 && y < height)
            this.data[x][y] = value
    },

    getPixel(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return -1
        return this.data[x][y]
    },

    serialize() {
        let str = ""
        for (let y=0; y<height; y++) {
            for (let x=0; x<width; x+=4) {
                let n = this.data[x][y] || 0
                n += (this.data[x+1][y] || 0)*2
                n += (this.data[x+2][y] || 0)*4
                n += (this.data[x+3][y] || 0)*8
                str += n.toString(16)
            }
        }
        return str
    },

    post() {
        let link = window.location.href
        let title = document.getElementById("editorTitleVal").value
        if (title == "") {
            alert("You need to title your Picto!")
            return
        }
        window.location.href = link.substring(0, link.length - 5) + "post/" + this.serialize() + "/" + title
    },

    refresh() {
        const ctx = this.canvas.getContext("2d")
        const scale = this.scale

        // fill the entire canvas with white
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, this.canvas.width, this.canvas.height)

        const dist = (x1,y1,x2,y2) => {
            return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
        }

        //ctx.fillStyle = "lightblue"
        //for (let i=12; i<64; i+=13)
            //ctx.fillRect(0, i*this.scale, this.canvas.width, this.scale)

        // go through and fill in the black pixels
        ctx.fillStyle = "black"
        for (let x=0; x<width; x++) {
            for (let y=0; y<height; y++) {
                if (this.getPixel(x,y)) {
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
    },

    close() {
        toggleEditor()
        this.clear()
    },

    menuSelect(selection) {
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
    },
}

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
        document.getElementById("editorDiv").appendChild(editor.canvas)
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
        document.getElementById("editorDiv").removeChild(editor.canvas)

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
    editor.scale = Math.min(Math.round((innerWidth-200)/width), 10)
    editor.canvas.style.left = innerWidth/2 - width*editor.scale/2 + "px"
    editor.canvas.style.top = innerHeight/2 - height*editor.scale/2 + "px"
    editor.canvas.width = width*editor.scale
    editor.canvas.height = height*editor.scale
    editor.refresh()

    // put the close button in the right spot
    let close = document.getElementById("editorCloseButton")
    if (close) {
        close.style.left = innerWidth/2 + width*editor.scale/2 - close.clientWidth/2 + "px"
        close.style.top = innerHeight/2 - height*editor.scale/2 - close.clientHeight/2 + "px"
    }

    let title = document.getElementById("editorTitle")
    if (title) {
        title.style.width = editor.canvas.clientWidth/2 + "px"
        title.style.left = innerWidth/2 - title.clientWidth/2 + "px"
        title.style.top = innerHeight/2 - height*editor.scale/2 - title.clientHeight - 32 + "px"
    }

    let tools = document.getElementById("editorToolMenu")
    if (tools) {
        tools.style.top = innerHeight/2 - tools.clientHeight/2 + "px"
        tools.style.height = editor.canvas.height
        tools.style.left = innerWidth/2 - width*editor.scale/2 - tools.clientWidth - 32 + "px"
        //tools.style.width = "200px"
    }

    // put the post button in the right spot
    let post = document.getElementById("editorPostButton")
    if (post) {
        post.style.left = innerWidth/2 - post.clientWidth/2 + "px"
        post.style.top = innerHeight/2 + editor.canvas.height/2 + 16 + "px"
    }
}

document.addEventListener("mouseup", (event) => {
    mousedown = false
})

editor.canvas.addEventListener("mousedown", (event) => {
    mousedown = true
    const mx = event.offsetX/editor.scale
    const my = event.offsetY/editor.scale
    brush.x = mx
    brush.y = my

    brush.draw(mx,my,brush.size,brush.color)
    editor.refresh()
})

editor.canvas.addEventListener("mousemove", (event) => {
    const mx = event.offsetX/editor.scale
    const my = event.offsetY/editor.scale
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
            brush.draw(x,y,brush.size,brush.color)
        }
    }

    editor.refresh()

    lastmx = mx
    lastmy = my
})

// on startup
editor.clear()
let mousedown = false
let lastmx, lastmy
calculateCanvasScale()
window.addEventListener("resize", calculateCanvasScale)
