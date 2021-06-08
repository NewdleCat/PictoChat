const brush = {
    color: 1,
    size: 1,
    x: undefined,
    y: undefined,
    down: false,
    lastx: undefined,
    lasty: undefined,
    mode: "brush",
    selection: "brush",

    drawPixel(x, y) {
        x = Math.floor(x)
        y = Math.floor(y)

        if (this.mode == "spraycan") {
            const xx = x%2
            const yy = y%2
            if ((xx && !yy) || (!xx && yy)) {
                return
            }
        }

        editor.setPixel(x, y, this.color)
    },

    drawcircle(x, y, radius) {
        this.drawPixel(x, y)
        for (let r=0; r<radius; r+=0.5) {
            for (let a=0; a<Math.PI*2; a+=Math.PI/8) {
                this.drawPixel(x + Math.cos(a)*r, y + Math.sin(a)*r)
            }
        }
    },

    drawline() {
        // draw a line between last point and this point
        const dist = Math.sqrt((this.x-this.lastx)**2 + (this.y-this.lasty)**2)
        const angle = Math.atan2(this.y-this.lasty, this.x-this.lastx)
        for (let i=0; i<=dist; i++) {
            const x = this.lastx + Math.cos(angle)*i
            const y = this.lasty + Math.sin(angle)*i
            this.drawcircle(x, y, this.size)
        }
    },

    fill() {
        const stack = []
        stack.push([this.x, this.y])
        console.log(`fill color: ${this.color}`)

        while (stack.length > 0) {
            const thing = stack.pop()
            const x = thing[0]
            const y = thing[1]
            const get = editor.getPixel(x, y)
            if (get != -1 && get != this.color) {
                console.log(`get: ${get}`)
                editor.setPixel(x, y, this.color)
                stack.push([x+1, y])
                stack.push([x-1, y])
                stack.push([x, y+1])
                stack.push([x, y-1])
            }
        }

        editor.setPixel(this.x, this.y, this.color)
    },

    draw() {
        if (!this.down) return false
        if (!this.lastx) this.lastx = this.x
        if (!this.lasty) this.lasty = this.y

        // do different things depending on mode
        if (this.mode == "brush" || this.mode == "spraycan") this.drawline()
        if (this.mode == "fill") this.fill()

        this.lastx = this.x
        this.lasty = this.y
        editor.refresh()
        return true
    },

    updatePosition() {
        this.x = Math.round(event.offsetX/editor.scale)
        this.y = Math.round(event.offsetY/editor.scale)
    },

    mousedown(event) {
        this.down = true
        this.updatePosition()
        this.lastx = undefined
        this.lasty = undefined
        if (editor.backupIndex != editor.backupMax) editor.createBackup()
        this.draw()
    },

    mouseup(event) {
        if (this.down) editor.createBackup()
        this.down = false
    },

    mousemove(event) {
        this.updatePosition()
        if (!this.draw()) editor.refresh()
    },

    keypress(event) {
        // TODO type letters
    },

    menuSelect(selection) {
        // hackily refresh the menu by removing it and re-adding it
        document.body.removeChild(document.getElementById("editorToolMenu"))
        document.body.appendChild(fromTemplate("_editorToolMenu"))
        calculateCanvasScale()

        if (selection != "palette") {
            this.selection = selection
        } else {
            // swap colors
            this.color = (this.color + 1)%2
        }

        // highlight the selected tool
        const menu = document.getElementById("editorToolMenu")
        for (const thing of menu.children) {
            if (thing.id == this.selection + "_editortool") {
                thing.style.color = "#4488ff"
                thing.style.borderColor = "#4488ff"
                thing.style.borderStyle = "solid"
            }

            if (thing.id == "palette_editortool") {
                thing.style.color = this.color ? "black" : "white"
                thing.style.textShadow = "7px 7px " + (this.color ? "white" : "black")
            }
        }

        if (selection == "brush") {
            this.mode = "brush"
            this.size = 1
        }
        if (selection == "pencil") {
            this.mode = "brush"
            this.size = 0
        }
        if (selection == "fill") {
            this.mode = "fill"
            this.size = 0
        }
        if (selection == "spraycan") {
            this.mode = "spraycan"
            this.size = 3
        }
    },
}

const editor = {
    data: [],
    scale: 1,
    canvas: document.getElementById("editorCanvas"),
    backups: [],
    backupIndex: 0,
    backupMax: 0,
    show: true,
    remixFrom: "",

    clear() {
        this.backups = []
        this.backupIndex = 0
        this.backupMax = 0
        this.data = []
        this.remixFrom = ""
        for (let x=0; x<width; x++)
            this.data[x] = []
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
        let get = this.data[x][y]
        if (get === undefined || get === null) return 0
        return get
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
        //window.location.href = link.substring(0, link.length - 5) + "post/" + this.serialize() + "/" + title
        axios.post(postUrl, {title: title, data: this.serialize(), remix: this.remixFrom}).then(() => { window.location.href = window.location.href }) 
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
                if (Math.ceil(dist(x+0.5,y+0.5, brush.x,brush.y)) <= brush.size
                || (x == brush.x && y == brush.y)) {
                    ctx.beginPath()
                    ctx.rect(x*scale,y*scale, scale,scale)
                    ctx.stroke()
                }
            }
        }
    },

    // create undo
    createBackup() {
        this.backups[this.backupIndex] = JSON.stringify(this.data)
        this.backupIndex += 1
        this.backupMax = this.backupIndex
    },

    undo() {
        if (this.backupIndex <= 0) return
        if (this.backupIndex == this.backupMax) this.backupIndex -= 1
        this.backupIndex -= 1
        this.data = JSON.parse(this.backups[this.backupIndex])
        this.refresh()
    },

    redo() {
        if (this.backupIndex >= this.backupMax-1) return
        this.backupIndex += 1
        this.data = JSON.parse(this.backups[this.backupIndex])
        this.refresh()
    },

    keypress(event) {
        if (event.ctrlKey && event.key == "z") this.undo()
        if (event.ctrlKey && event.key == "Z") this.redo()
    },

    close() {
        toggleEditor()
        this.clear()
    },
}

const vuedata = {
    showCanvas: true,
}

const vueapp = new Vue({
    el: ".vue-target",
    data: vuedata,
    methods: {},
})

// put things on the page
const toggleEditor = () => {
    editor.show = !editor.show
    vuedata.showCanvas = editor.show

    const remove = e => {
        if (e) {
            document.body.removeChild(e)
        }
    }

    if (editor.show) {
        document.getElementById("editorDiv").appendChild(editor.canvas)
        document.body.appendChild(fromTemplate("_editorPostButton"))
        document.body.appendChild(fromTemplate("_editorCloseButton"))
        document.body.appendChild(fromTemplate("_editorTitle"))
        document.body.appendChild(fromTemplate("_editorToolMenu"))

        remove(document.getElementById("editButton"))
        //remove(document.getElementById("friendInput"))
        brush.menuSelect("brush")

        calculateCanvasScale()
        console.log(editor.canvas.clientWidth)
    } else {
        // remove the editor components
        remove(document.getElementById("editorPostButton"))
        remove(document.getElementById("editorCloseButton"))
        remove(document.getElementById("editorTitle"))
        remove(document.getElementById("editorToolMenu"))

        // remove the editor components that are in the editorDiv
        //let dim = document.getElementById("dim")
        //if (dim) document.getElementById("editorDiv").removeChild(dim)
        document.getElementById("editorDiv").removeChild(editor.canvas)

        if (loggedIn) document.body.appendChild(fromTemplate("_editButton"))
        //document.body.appendChild(fromTemplate("_friendInput"))

		const addFriendInput = document.getElementById("friendInput")
		if (addFriendInput) {
            addFriendInput.style.left = innerWidth - addFriendInput.clientWidth - 64 + "px"
            addFriendInput.style.top = "-64 px"
        }

        let centered = document.getElementById("centered")
        let edit = document.getElementById("editButton")
        edit.style.top = "64px"
        let marginSize = (innerWidth - centered.clientWidth)/2
        if (marginSize < edit.clientWidth) {
            edit.style.width = marginSize + "px"
        }
        edit.style.left = (marginSize - edit.clientWidth)/2 + "px"
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

document.addEventListener("keydown", event => {
    if (event.ctrlKey && (event.key == "z" || event.key == "Z"))
        event.preventDefault()
    editor.keypress(event)
    brush.keypress(event)
}, false);
document.addEventListener("mouseup", event => brush.mouseup(event))
editor.canvas.addEventListener("mousedown", event => brush.mousedown(event))
editor.canvas.addEventListener("mousemove", event => brush.mousemove(event))
editor.clear()
editor.createBackup()
calculateCanvasScale()
toggleEditor()
drawFeed()
window.addEventListener("resize", calculateCanvasScale)
