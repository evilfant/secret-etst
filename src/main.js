const DATA_URL = '/data.json'
const VERTICAL_PADDING_PERCENT = 0.05
const HORIZONTAL_PADDING_PERCENT = 0.05
const LABEL_WIDTH = 100

const CHART_WIDTH = 1200
const CHART_HEIGHT = 250
const TIME_WIDTH = CHART_WIDTH
const TIME_HEIGHT = 100


const main = async () => {
    const data = await getData(DATA_URL)

    const chartScene = new Scene(document.getElementById('chart'), CHART_WIDTH, CHART_HEIGHT)
    const timeScene = new Scene(document.getElementById('time'), TIME_WIDTH, TIME_HEIGHT)

    drawChart(chartScene, data)
    drawTime(timeScene, data)
}

const getData = async url => {
    const data = await fetchData(url)
    const [minValue, maxValue] = getValueBounds(data)
    const [minTime, maxTime] = getTimeBounds(data)

    return {
        records: data,
        meta: {
            timeBounds: {
                min: minTime,
                max: maxTime,
            },
            valueBounds: {
                min: minValue,
                max: maxValue,
            },
        }
    }
}

const fetchData = async url => {
    const response = await fetch(url)

    return response.json()
}

const getTimeBounds = data => {
    const [, timeStart] = data[0]
    const [, timeEnd] = data[data.length - 1]

    return [timeStart, timeEnd]
}

const getValueBounds = data => {
    let min = data[0][0]
    let max = data[0][0]

    for (const [val] of data) {
        if (val < min) {
            min = val
        }

        if (val > max) {
            max = val
        }
    }

    return [min, max]
}

const drawChart = (scene, data) => {
    const yDiff = data.meta.valueBounds.max - data.meta.valueBounds.min
    const verticalPadding = yDiff * VERTICAL_PADDING_PERCENT
    const yRange = yDiff + verticalPadding * 2
    const yScale = scene.height / yRange

    const xDiff = data.meta.timeBounds.max - data.meta.timeBounds.min
    const horizontalPadding = xDiff * HORIZONTAL_PADDING_PERCENT
    const xRange = xDiff + horizontalPadding * 2
    const xScale = scene.width / xRange

    const points = data.records.map(([value, time]) => ([time * xScale, value * yScale]))
    scene.setTransform(1, 0, 0, -1, -(data.meta.timeBounds.min - horizontalPadding) * xScale, (yDiff + verticalPadding) * yScale)

    const xAxis = new Line(
        [
            [(data.meta.timeBounds.min - horizontalPadding) * xScale, 0],
            [(data.meta.timeBounds.max + horizontalPadding) * xScale, 0],
        ],
        'black',
        1,
    )
    scene.add(xAxis)

    const chart = new Line(points, 'green', 1)
    scene.add(chart)

    scene.render()
}

const drawTime = (scene, data) => {
    const xDiff = data.meta.timeBounds.max - data.meta.timeBounds.min
    const horizontalPadding = xDiff * HORIZONTAL_PADDING_PERCENT
    const xRange = xDiff + horizontalPadding * 2
    const xScale = scene.width / xRange

    scene.setTransform(1, 0, 0, 1, -(data.meta.timeBounds.min - horizontalPadding) * xScale, 0)

    const totalLabels = Math.floor(xDiff / (LABEL_WIDTH / xScale))
    const timeShift = Math.floor(xDiff / totalLabels)

    const y = Math.floor(scene.height / 2)

    for (let time = data.meta.timeBounds.min; time <= data.meta.timeBounds.max; time += timeShift) {
        const x = time * xScale
        const label = new Label(timestampToText(time), [x, y])
        const line = new Line([[x, 0], [x, 10]])
        scene.add(label)
        scene.add(line)
    }

    scene.render()
}

const timestampToText = time => {
    const date = new Date(time * 1000)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
}

class Scene {
    shapes = []

    constructor(canvas, width, height) {
        this.canvas = canvas
        this.context = this.canvas.getContext('2d')
        this.canvas.width = width
        this.canvas.height = height
    }

    get width() {
        return this.canvas.width
    }

    get height() {
        return this.canvas.height
    }

    add(shape) {
        this.shapes.push(shape)
    }

    render() {
        this.clear()
        this.shapes.forEach(shape => {
            this.context.save()
            shape.render(this.context)
            this.context.restore()
        })
    }

    clear() {
        this.context.save()
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.restore()
    }

    setTransform(...args) {
        this.context.setTransform(...args)
    }
}

class Shape {
    render(context) {
        throw new Error(`Override ${this.constructor.name}.render method`)
    }
}

class Line extends Shape {
    constructor(points, color = 'black', lineWidth = 1) {
        super()
        this.points = points
        this.color = color
        this.lineWidth = lineWidth
    }

    render(context) {
        if (this.points.length === 0) {
            return
        }

        context.strokeStyle = this.color
        context.lineWidth = this.lineWidth
        context.beginPath()
        context.moveTo(this.points[0][0], this.points[0][1])

        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i][0], this.points[i][1])
        }

        context.stroke()
    }
}

class Label extends Shape {
    constructor(text, position, color = 'black', style = '14px serif') {
        super()
        this.text = text
        this.position = position
        this.color = color
        this.style = style
    }

    render(context) {
        context.font = this.style
        context.fillStyle = this.color
        context.fillText(this.text, this.position[0], this.position[1])
    }
}



main()
