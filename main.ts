function showCellDiagram(a: number, b: number) {
    basic.clearScreen()
    let x = cellAt(a, b)
    if ((x & 8) == 8) led.plot(2, 0)
    if ((x & 4) == 4) led.plot(4, 2)
    if ((x & 2) == 2) led.plot(2, 4)
    if ((x & 1) == 1) led.plot(0, 2)
}
function drawGrid() {
    for (let i = 0; i <= mazeWidth; i++) {
        nokialcd.plot(Plots.Line, i * scale, 0, i * scale, maxY, true)
    }
    for (let j = 0; j <= mazeHeight; j++) {
        nokialcd.plot(Plots.Line, 0, j * scale, maxX, j * scale, true)
    }
}
function updateWalls(i: number, j: number) {
    let cell = maze[cellNumber(i, j)]
    if ((cell & 8) == 0) unplotTopWall(i, j)
    if ((cell & 4) == 0) unplotRightWall(i, j)
    if ((cell & 2) == 0) unplotBottomWall(i, j)
    if ((cell & 1) == 0) unplotLeftWall(i, j)
}
function drawMaze() {
    drawGrid()
    for (let k = 0; k <= mazeWidth - 1; k++) {
        for (let l = 0; l <= mazeHeight - 1; l++) {
            updateWalls(k, l)
        }
    }
}
function cellNumber(i: number, j: number): number {
    return i + j * mazeWidth
}
function cellAt(i: number, j: number): number {
    return maze[cellNumber(i, j)]
}
function randomWiggle() {
    do {
        dir = Math.randomRange(0, 3)
    } while ((freeDirs & WALL_BITS[dir]) == 0)
}
function randomBreakOut() {
    if (cellCount < 3) {
        for (let a = 0; a <= mazeWidth - 1; a++) {
            for (let b = 0; b <= mazeHeight - 1; b++) {
                if ((availableDirections(a, b) != 0) && (!cellIsFree(a, b))) {
                    xpos = a
                    ypos = b
                }
            }
        }
        freeDirs = availableDirections(xpos, ypos)
    } else {
        do {
            getRandomLocation()
            freeDirs = availableDirections(xpos, ypos)
        } while ((freeDirs == 0) || cellIsFree(xpos, ypos))
    }
}
function calculateFramePosition() {
    //    idealX = Math.constrain(fx - 8, 0, leds16x9.worldFrameMaxX())
    //   idealY = Math.constrain(fy - 4, 0, leds16x9.worldFrameMaxY())
    //    leds16x9.worldPositionFrame(idealX, idealY)
}
function getRandomLocation() {
    xpos = Math.randomRange(0, mazeWidth - 1)
    ypos = Math.randomRange(0, mazeHeight - 1)
}
function cellIsFree(i: number, j: number): boolean {
    return (cellAt(i, j) == 0b1111)
}
function availableDirections(i: number, j: number): number {
    let ad = 0b0000
    if (i > 0) {
        if (cellIsFree(i - 1, j)) ad |= WALL_BITS[LEFT]
    }
    if (i < (mazeWidth - 1)) {
        if (cellIsFree(i + 1, j)) ad |= WALL_BITS[RIGHT]
    }
    if (j > 0) {
        if (cellIsFree(i, j - 1)) ad |= WALL_BITS[UP]
    }
    if (j < (mazeHeight - 1)) {
        if (cellIsFree(i, j + 1)) ad |= WALL_BITS[DOWN]
    }
    return ad
}
function moveToNextCell() {
    maze[cellNumber(xpos, ypos)] &= ~WALL_BITS[dir]
    xpos += DX[dir]
    ypos += DY[dir]
    maze[cellNumber(xpos, ypos)] &= ~OPP_BITS[dir]
}
function makeOpenings() {

    entrance = Math.randomRange(0, mazeHeight - 1)
    exit = Math.randomRange(0, mazeHeight - 1)
    maze[cellNumber(0, entrance)] &= ~WALL_BITS[LEFT]
    maze[cellNumber(mazeWidth - 1, exit)] &= ~WALL_BITS[RIGHT]
    updateWalls(0, entrance)
    updateWalls(mazeWidth - 1, exit)
}
function createMaze() {
    cellCount = mazeWidth * mazeHeight
    //    leds16x9.worldPositionFrame(0, 0)
    drawGrid()
    nokialcd.show()
    do {
        getRandomLocation()
        freeDirs = availableDirections(xpos, ypos)
    } while (freeDirs == 0)
    randomWiggle()
    while (cellCount > 1) {
        freeDirs = availableDirections(xpos, ypos)
        if (freeDirs != 0) {
            if ((Math.randomRange(0, 10) < wiggleFactor) || (freeDirs & WALL_BITS[dir]) == 0) {
                randomWiggle()
            }
        } else {
            randomBreakOut()
            randomWiggle()
        }
        updateWalls(xpos, ypos)
        moveToNextCell()
        updateWalls(xpos, ypos)
        nokialcd.show()
        basic.pause(100)
        cellCount += - 1
    }
    makeOpenings()
}
function showWall(dir: number) {
    if (dir == NONE) return
    y = Math.trunc(fx / scale)
    z = Math.trunc(fy / scale)
    if ((maze[myCurrentCell(fx, fy)] & WALL_BITS[dir]) != 0) {
        switch (dir) {
            case LEFT: { plotLeftWall(y, z); break }
            case RIGHT: { plotRightWall(y, z); break }
            case DOWN: { plotBottomWall(y, z); break }
            case UP: { plotTopWall(y, z); break }
        }
    }
}
function unplotTopWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale + 1, j * scale, (i + 1) * scale - 1, j * scale, false)
}
function unplotRightWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, (i + 1) * scale, j * scale + 1, (i + 1) * scale, (j + 1) * scale - 1, false)
}
function unplotBottomWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale + 1, (j + 1) * scale, (i + 1) * scale - 1, (j + 1) * scale, false)
}
function plotTopWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale, j * scale, (i + 1) * scale, j * scale, true)
}
function unplotLeftWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale, j * scale + 1, i * scale, (j + 1) * scale - 1, false)
}
function plotRightWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, (i + 1) * scale, j * scale, (i + 1) * scale, (j + 1) * scale, true)
}
function plotBottomWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale, (j + 1) * scale, (i + 1) * scale, (j + 1) * scale, true)
}
function plotLeftWall(i: number, j: number) {
    nokialcd.plot(Plots.Line, i * scale, j * scale, i * scale, (j + 1) * scale, true)
}
function getJoystick(): number {
    let jX = (pins.map(pins.analogReadPin(AnalogPin.P1), 100, 900, 0, 4) >> 1) - 1
    if (jX == 0) {
        let jY = 1 - (pins.map(pins.analogReadPin(AnalogPin.P0), 100, 900, 0, 4) >> 1)
        if (jY < 0) return UP
        if (jY > 0) return DOWN
    } else {
        if (jX < 0) return LEFT
        if (jX > 0) return RIGHT
    }
    return NONE
}
function undrawMe() {
    //    nokialcd.pixel(fx, fy, false)
    nokialcd.plot(Plots.Box, fx, fy, fx + scale - 2, fy + scale - 2, false)
}
function drawMe() {
    nokialcd.plot(Plots.Box, fx, fy, fx + scale - 2, fy + scale - 2, true)
    //    nokialcd.pixel(fx, fy, true)
}
function isAtCellWall(x: number, y: number): boolean {
    return ((x % scale == 0) || (y % scale == 0))
}
function myCurrentCell(x: number, y: number): number {
    let cx = Math.trunc(x / scale)
    let cy = Math.trunc(y / scale)
    return cellNumber(cx, cy)
}
function toWallGrid(dir: number): boolean {
    switch (dir) {
        case UP: {
            if ((fy - 1) % scale == 0) return true
            break
        }
        case DOWN: {
            if ((fy + 1) % scale == 0) return true
            break
        }
        case LEFT: {
            if ((fx - 1) % scale == 0) return true
            break
        }
        case RIGHT: {
            if ((fx + 1) % scale == 0) return true
            break
        }
    }
    return false
}
function canMove(dir: number): boolean {
    if ((dir == NONE) || ((fx + DX[dir] * scaleMoveFactor) < 1)) return false
    if (((fx - 1) % scale == 0) && ((fy - 1) % scale == 0)) {
        return !(WALL_BITS[dir] & maze[myCurrentCell(fx, fy)])
    } else {
        return true
    }
}
function game2() {
    let state = 0
    while (true) {
        basic.pause(cyclepause)
        if (state == 0) {
            dir = getJoystick()
            if (canMove(dir)) {
                undrawMe()
                fx += DX[dir] * scaleMoveFactor
                fy += DY[dir] * scaleMoveFactor
                state = (state + 1) % movecycle
            } else {
                showWall(dir)
            }
        } else {
            if (dir != NONE) {
                undrawMe()
                fx += DX[dir] * scaleMoveFactor
                fy += DY[dir] * scaleMoveFactor
                state = (state + 1) % movecycle
            }
        }
        calculateFramePosition()
        drawMe()
        nokialcd.show()
    }
}
function game1() {
    let state = 0
    while (true) {
        basic.pause(cyclepause)
        if (state == 0) {
            dir = getJoystick()
            if (canMove(dir)) {
                undrawMe()
                fx += DX[dir] * scaleMoveFactor
                fy += DY[dir] * scaleMoveFactor
                state = (state + 1) % movecycle
            }
        } else {
            if (dir != NONE) {
                undrawMe()
                fx += DX[dir] * scaleMoveFactor
                fy += DY[dir] * scaleMoveFactor
                state = (state + 1) % movecycle
            }
        }
        calculateFramePosition()
        drawMe()
        nokialcd.show()
    }
}
function calcscalefactor() {
    switch (scale) {
        case 2: {
            scaleMoveFactor = 2
            cyclepause = 100
            break
        }
        case 3: {
            scaleMoveFactor = 1
            cyclepause = 40
            break
        }
        case 5: {
            scaleMoveFactor = 1
            cyclepause = 40
            break
        }
        default: {
            scaleMoveFactor = 2
            cyclepause = 100
            break
        }
    }
    movecycle = scale / scaleMoveFactor
}
const LEFT = 0
const DOWN = 1
const RIGHT = 2
const UP = 3
const NONE = 4
const DX = [-1, 0, 1, 0, 0]
const DY = [0, 1, 0, -1, 0]
const WALL_BITS = [1, 2, 4, 8, 0]
const OPP_BITS = [4, 8, 1, 2, 0]
let z = 0
let y = 0
let idealY = 0
let idealX = 0
let maxY = 0
let maxX = 0
let cellCount = 0
let fy = 0
let fx = 0
let dir = 0
let freeDirs = 0
let ypos = 0
let xpos = 0
let scale = 0
let scaleMoveFactor = 0
let movecycle = 0
let cyclepause = 0
let mazeWidth = 0
let mazeHeight = 0
let exit = 0
let entrance = 0
let wiggleFactor = 4
scale = 5
calcscalefactor()
mazeWidth = Math.trunc(83 / scale)
mazeHeight = Math.trunc(47 / scale)
cellCount = mazeWidth * mazeHeight
let mazeSize = mazeWidth * mazeHeight
maxX = mazeWidth * scale
maxY = mazeHeight * scale
let maze: Buffer = pins.createBuffer(mazeWidth * mazeHeight)
maze.fill(15)
basic.forever(function () {
    createMaze()
    drawMaze()
    fx = 0 * scale + 1
    fy = entrance * scale + 1
    calculateFramePosition()
    drawMe()
    nokialcd.show()
    basic.pause(2000)
    if (input.buttonIsPressed(Button.A)) {
        game1()
    } else {
        nokialcd.clear()
        nokialcd.show()
        game2()
    }
})
