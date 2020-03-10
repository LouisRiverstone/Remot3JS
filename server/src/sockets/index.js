const WebSocket = require('ws');
const robotize = require('../robotjs')
let interval = null
let interalTime = 100


module.exports = () => {
    const wss = new WebSocket.Server({ port: 3001 });
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });



        intervalController("start", ws)
    });

    console.log("rodando ws 3001")

    return wss
}


function intervalController(state, ws) {
    if (state == "start") {
        interval = setInterval(() => {
            robotize.getScreenRealtime([1280, 720], 60).then((buffer) => {
                ws.send(JSON.stringify({
                    type: "screen",
                    data: {
                        buffer
                    }
                }))
            })
        }, interalTime);
    } else if (state == "changeInterval") {
        clearInterval(interval)
        intervalController("start", ws)
    } else {
        clearInterval(interval)
    }
}