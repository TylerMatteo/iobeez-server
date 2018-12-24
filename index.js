const app = require('express')()
const cors = require('cors');
app.use(cors());

const http = require('http').Server(app);
var io = require('socket.io')(http, {origins:'domain.com:* http://domain.com:* http://www.domain.com:*'});

// Ideally I would expose endpoints for each temperature individually but for the
// purposes of this dashboard we can lump them into the same socket
io.of('/temperature').on('connection', (socket) => {
    // Making the assumption temperatures for each room will always stay between 68 and 72
    // and never fluctuate more than a few tenths of a degree every thirty seconds
    // and are always present rounded to the nearest hundreths place

    // Initialize random temperatures for this connection
    let temps = {
        bedroom: 68+parseFloat((Math.random()*4).toFixed(2)),
        living: 68+parseFloat((Math.random()*4).toFixed(2)),
        kitchen: 68+parseFloat((Math.random()*4).toFixed(2)),
        basement: 68+parseFloat((Math.random()*4).toFixed(2)),
    }

    const interval = setInterval(() => {

        // Increase each temperature at random by a value between -0.5 and 0.5,
        // making sure to always keep it between 68 and 72
        for(const room in temps){
            let val = parseFloat((Math.random()-0.5).toFixed(2));
            if(temps[room] + val > 72 || temps[room] + val < 68 ){
                temps[room] = parseFloat((temps[room] - val).toFixed(2));
            } else {
                temps[room] = parseFloat((temps[room] + val).toFixed(2));
            } 
        }

        socket.emit('update', {
            timestamp: Date.now(),
            temperatures: temps
        });
    }, 3000)

    socket.on('disconnect', () => {
        clearInterval(interval);
    })
})

io.of('/smoke').on('connection', (socket) => {
    
    let detectors = {
        hallway: {
            id: "hallway",
            status: "inactive"
        },
        bedroom: {
            id: "bedroom",
            status: "inactive"
        },
        dining: {
            id: "dining",
            status: "inactive"
        }
    }

    socket.emit('update', detectors);

    socket.on("set_detector", (data) => {
        detectors[data.room].status = data.status;

        socket.emit('update', detectors);
    })

})

http.listen(3000, () => {
    console.log('listening on port 3000');
});
