const express = require('express');
const hafas = require('oebb-hafas')('feldkirch-depboard');
const app = express();
const port = 3000;

const STATION_ID = '894306';

app.use(express.static('web'));

app.get('/getdep', async (req, res) => {
    try {
        const dep = await hafas.departures(STATION_ID, { duration: 1440, results: 10 });
        let ret = dep.filter(dep => dep.line && dep.direction)
            .map(dep => {
                const now = new Date();
                const deptime = new Date(dep.when || dep.plannedWhen);
                let min = Math.floor((deptime - now) / 60000);
                let asd = min;

                if(min > 40) {
                    min = `${deptime.getHours()}:${deptime.getMinutes()}`;
                    if(deptime.getMinutes() < 10) {
                        min = `${deptime.getHours()}:0${deptime.getMinutes()}`;
                    }
                }

                if(now > deptime) {
                    min = -1;
                }

                return {
                    line: dep.line.name.slice(4,7),
                    destination: dep.direction,
                    minutes: min,
                    mm: asd
                };
            })
            .sort((a, b) => a.mm - b.mm)
            .filter(dep => dep.minutes != -1);        

        let lastline = 0;
        let lastmin = -1;
        
        ret = ret.filter((r) => {
            if(r.mm === lastmin && r.line === lastline) {
                return false;
            }
            lastline = r.line;
            lastmin = r.mm;
            return true;
        });

        ret = ret.slice(0, 2);

        console.log("Departures:");
        console.log(ret);

        res.json(ret);


    } catch (error) {
        console.error("error fetching data", error);
        res.status(500).json({ error: 'error fetching data' });
    }
});

app.listen(port, () => {
    console.log(`running at http://localhost:${port}`);
});