// https://docs.deno.com/runtime/tutorials/how_to_with_npm/express

import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from 'https://code.agentscript.org/models/HelloModel.js'
import express from "npm:express@4.18.2"
import cors from "npm:cors@2.8.5"  // You might need to adjust the version or import method for Deno

const app = express() // https://expressjs.com/en/api.html#app.use
app.use(express.json())  // Make sure Express can parse JSON body data
app.use(cors())  // Use CORS with default settings: allows all origins

const model = new Model()
model.setup()
util.repeat(500, model.step)

const props = `Props: /props /sample /step /turtles /links /patches 
  /createturtles/number /storedata /getdata`

app.get("/", (req, res) => {
  res.send(props)
})
app.get("/sample", (req, res) => {
  res.send(JSON.stringify(util.sampleModel(model)))
})
app.get("/step", (req, res) => {
  model.step()
  res.send(JSON.stringify(util.sampleModel(model)))
})
app.get("/turtles", (req, res) => {
  const ts = model.turtles.map(t => ({
    id: t.id, x: t.x, y: t.y, z: t.z, theta: t.theta 
  }))
  res.send(JSON.stringify(ts))
})
app.get("/links", (req, res) => {
  const ls = model.links.map(l => ({
    end0: l.end0.id, end1: l.end1.id
  }))
  res.send(JSON.stringify(ls))
})
app.get("/patches", (req, res) => {
  const ps = model.patches.map(p => ({
    id: p.id, 
    neighbors: p.neighbors.map(n => n.id), 
    neighbors4: p.neighbors4.map(n4 => n4.id)
  }))
  res.send(JSON.stringify(ps))
})
app.get("/props", (req, res) => {
  const props = `Props: /step /turtles /links /patches 
  /createturtles/number /storedata /getdata`
  res.send(props)
})
app.get('/createturtles/:number', (req, res) => {
    const number = parseInt(req.params.number, 10)
    if (isNaN(number) || number < 1) {
      res.status(400).send('Invalid number of turtles')
    } else {
      const turtles = model.turtles.create(number)
      res.json(turtles)
    }
})

const kv = await Deno.openKv()
kv.set(['mydata'], {}) // debug: reset every deploy
app.put('/storedata', async (req, res) => {
    const data = req.body
    console.log('data', data)
    try {
        await kv.set(['mydata'], data) 
        res.status(200).send('Data stored successfully')
    } catch (error) {
        res.status(500).send('Failed to store data')
    }
})
app.get("/getdata", async (req, res) => {
  const result = await kv.get(['mydata'])
  console.log('result', result.value)
  res.send(result.value)
})

app.listen(8000)
