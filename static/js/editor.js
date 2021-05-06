const width = 128
const height = 64

// because the canvas needs to be big, we keep the internal
// pixel data seperate from the canvas's actual pixel data
const data = []
for (let i=0; i<width; i++) {
    data[i] = []
}

const setPixel = (x, y, value) => {
    x = Math.floor(x)
    y = Math.floor(y)

    if (x >= 0 && x < width && y >= 0 && y < height)
        data[x][y] = value
}

const getPixel = (x, y) => {
    return data[Math.floor(x)][Math.floor(y)]
}

const drawCircle = (x, y, radius, value) => {
    for (let r=0; r<radius; r++) {
        for (let a=0; a<Math.PI*2; a+=Math.PI/8) {
            setPixel(x + Math.cos(a)*r, y + Math.sin(a)*r, value)
        }
    }
}

const refreshCanvas = () => {
    // fill the entire canvas with white
    ctx.fillStyle = "white"
    ctx.fillRect(0,0, canvas.width, canvas.height)

    // go through and fill in the black pixels
    ctx.fillStyle = "black"
    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            if (getPixel(x,y)) {
                ctx.fillRect(x*scale,y*scale, scale,scale)
            }
        }
    }
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
    window.location.href = link.substring(0, link.length - 6) + "post/" + str
}

const canvas = document.createElement("canvas")
let scale
let brushSize = 1
let brushColor = 1
canvas.id = "editor"
canvas.width = width*scale
canvas.height = height*scale
canvas.style.border = "dashed"
canvas.style.position = "relative"
document.getElementsByTagName("body")[0].appendChild(canvas)
const ctx = canvas.getContext("2d")

let mousedown = false
let lastmx, lastmy

// make the canvas dynamically resize to the window
const calculateCanvasScale = () => {
    scale = Math.min(Math.round((innerWidth-200)/width), 10)
    canvas.style.left = innerWidth/2 - width*scale/2 + "px"
    canvas.width = width*scale
    canvas.height = height*scale
    refreshCanvas()
}
calculateCanvasScale()
window.addEventListener("resize", calculateCanvasScale)

document.addEventListener("mouseup", (event) => {
    mousedown = false
})

canvas.addEventListener("mousedown", (event) => {
    mousedown = true
    const mx = event.offsetX/scale
    const my = event.offsetY/scale
    if (brushSize > 1) {
        drawCircle(x,y,brushSize,brushColor)
    } else {
        setPixel(x,y,brushColor)
    }
    refreshCanvas()
})

canvas.addEventListener("mousemove", (event) => {
    const mx = event.offsetX/scale
    const my = event.offsetY/scale

    if (!lastmx) lastmx = mx
    if (!lastmy) lastmy = my

    if (mousedown) {
        // draw a line between last point and this point
        const dist = Math.sqrt((mx-lastmx)**2 + (my-lastmy)**2)
        const angle = Math.atan2(my-lastmy, mx-lastmx)
        for (let i=0; i<=dist; i++) {
            let x = lastmx + Math.cos(angle)*i
            let y = lastmy + Math.sin(angle)*i

            if (brushSize > 1) {
                drawCircle(x,y,brushSize,brushColor)
            } else {
                setPixel(x,y,brushColor)
            }
        }

        refreshCanvas()
    }

    lastmx = mx
    lastmy = my
})
