const WebSocket = require('ws');
const robotize = require('../robotjs')
let uuid4 = require('uuid4');


//Intervalo de Controle De Frames
let interval = null



let sendingFrames = false

let connections = {

}

let config = {
    resolution: [1920, 1080],
    interval: 100,
    quality: 60
}


module.exports = () => {
    const wss = new WebSocket.Server({ port: 3001 });
    wss.on('connection', (ws) => {
        createAConnectionPipe(ws)
        frameSenderController(ws)
        ws.on('message', (message) => {
            const incomingMessage = JSON.parse(message)
            switch (incomingMessage.type) {
                case "checkAlive":
                    connections[incomingMessage.data.id].lossPackage = -1
                    break;
                case "changeConfig":
                    config = incomingMessage.data.config
                    console.log(config)
                    frameIntervalController("changeInterval", ws)
                    break;
                default:
                    break;
            }
            console.log('received: %s', message);
        });
    });

    console.log("rodando ws 3001")

    return wss
}

function createAConnectionPipe(ws) {
    const id = uuid4();
    connections[id] = {
        name: "none",
        ws,
        lossPackage: 0,
        intervalLossPackage: setInterval(() => {
            connections[id].ws.send(JSON.stringify({ type: "checkAlive", data: { id } }))
            connections[id].lossPackage++
            if (connections[id].lossPackage >= 5) {
                clearInterval(connections[id].intervalLossPackage)
                delete connections[id]
                console.log(id, "Desconectou")
                if (Object.keys(connections).length == 0) {
                    console.log("Parando de Streamar Frames")
                    sendingFrames = false
                }
            }
        }, 1000)
    }
    ws.send(JSON.stringify({ type: "registerConnection", data: { id, config } }))
}


function frameSenderController(ws) {
    if (!sendingFrames) {
        console.log("Começando a Streamar")
        frameIntervalController("start", ws)
        sendingFrames = true
    }
}

function frameIntervalController(state, ws = null) {
    if (state == "start") {
        interval = setInterval(() => {
            if (!sendingFrames) {
                clearInterval(interval)
            }
            else {
                robotize.getScreenRealtime(config.resolution, config.quality).then((buffer) => {
                    const keys = Object.keys(connections)
                    keys.forEach((id) => {
                        connections[id].ws.send(JSON.stringify({
                            type: "screen",
                            data: {
                                buffer
                            }
                        }))
                    })
                })
            }
        }, config.interval);
    } else if (state == "changeInterval") {
        clearInterval(interval)
        frameIntervalController("start", ws)
    } else {
        clearInterval(interval)
    }
}