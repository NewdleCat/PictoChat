const width = 128
const height = 64
const scale = 8

// 1 is black, 0 is white

// because the canvas needs to be big, we keep the internal
// pixel data seperate from the canvas's actual pixel data
const data = []
for (let i=0; i<width; i++) {
    data[i] = []
}

const setPixel = (x, y, value) => {
    x = Math.floor(x)
    y = Math.floor(y)

    data[x][y] = value
}

const getPixel = (x, y) => {
    return data[Math.floor(x)][Math.floor(y)]
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

const canvas = document.createElement("canvas")
canvas.id = "editor"
canvas.width = width*scale
canvas.height = height*scale
canvas.style.border = "dashed"
document.getElementsByTagName("body")[0].appendChild(canvas)
const ctx = canvas.getContext("2d")

let mousedown = false
let lastmx, lastmy

document.addEventListener("mouseup", (event) => {
    mousedown = false
})

canvas.addEventListener("mousedown", (event) => {
    mousedown = true
    const mx = event.offsetX/scale
    const my = event.offsetY/scale
    setPixel(mx,my,true)
    refreshCanvas()
})

canvas.addEventListener("mousemove", (event) => {
    const mx = event.offsetX/scale
    const my = event.offsetY/scale

    if (!lastmx)
        lastmx = mx
    if (!lastmy)
        lastmy = my

    if (mousedown) {
        // draw a line between last point and this point
        const dist = Math.sqrt((mx-lastmx)**2 + (my-lastmy)**2)
        const angle = Math.atan2(my-lastmy, mx-lastmx)
        for (let i=0; i<=dist; i++) {
            let x = lastmx + Math.cos(angle)*i
            let y = lastmy + Math.sin(angle)*i
            setPixel(x,y,true)
        }

        refreshCanvas()
    }

    lastmx = mx
    lastmy = my
})
