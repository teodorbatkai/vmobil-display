let lines = document.querySelectorAll('.line');
let dests = document.querySelectorAll('.destination');
let times = document.querySelectorAll('.time');

let upperdep;
let lowerdep;

fetchdeps();

setInterval(()=>{fetchdeps();}, 10000);
setInterval(()=>{location.reload();}, 100000);

function fetchdeps(){
    fetch('/getdep').then(response => response.json()).then(data => {
        console.log(data);
        data.forEach((dep, index) => {
            lines[index].textContent = dep.line;
            dests[index].textContent = dep.destination;

            if(dep.line == 401) {
                dests[index].innerHTML = "Katzenturm <a class='via'>via Nofels</a>";
            }

            if(dep.line == 402) {
                dests[index].innerHTML = "Bahnhof <a class='via'>via LKH</a>";
            }

            if(dep.minutes == 0) {
                if(!((index === 0 && lowerdep) || (index === 1 && upperdep))) {
                    let state = true;
                    times[index].innerHTML = '&#9622;';
                    let dpint = setInterval(()=>{
                        state = !state;
                        if(state) times[index].innerHTML = '&#9629;';
                        else times[index].innerHTML = '&#9622;';
                    }, 800);
                    if(index) upperdep = dpint;
                    else lowerdep = dpint;
                }
            } else {
                if(index && upperdep) {
                    clearInterval(upperdep);
                    upperdep = null;
                }
                if(!index && lowerdep) {
                    clearInterval(lowerdep);
                    lowerdep = null;
                }
                times[index].innerHTML = dep.minutes;
            }

            if(dep.minutes.toString().length > 2){
                document.querySelectorAll('.row')[index].style.gridTemplateColumns = '40vh 1fr 70vh';
            }else{
                document.querySelectorAll('.row')[index].style.gridTemplateColumns = '40vh 1fr 20vh';
            }
        });
    });
}