const app = require('express')()
const http = require('http').Server(app);
const io = require('socket.io')(http);

// io.on('connection', (socket) => {
//     console.log('connected!');
// });

app.get('/thingy', function(req, res){
    res.json({foo: "bar"})
  });

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


    // let temps = {
    //     bedroom: 68+Math.round(4/100)*100,
    //     living: 68+Math.round(4/100)*100,
    //     kitchen: 68+Math.round(4/100)*100,
    //     basement: 68+Math.round(4/100)*100,
    // }

    const interval = setInterval(() => {

        // Increase each temperature at random by a value between -0.5 and 0.5,
        // making sure to always keep it between 68 and 72
        for(const room in temps){
            let val = parseFloat((Math.random()-0.5).toFixed(2));
            // console.log(val);
            if(temps[room] + val > 72 || temps[room] + val < 68 ){
                temps[room] = parseFloat((temps[room] - val).toFixed(2));
            } else {
                temps[room] = parseFloat((temps[room] + val).toFixed(2));
            } 
        }

        console.log(temps.bedroom);
        socket.emit('update', {
            timestamp: Date.now(),
            temperatures: temps
        });
    }, 1000)

    socket.on('disconnect', () => {
        clearInterval(interval);
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000');
});
