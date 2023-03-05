const { ipcRenderer } = require("electron");
let fs = require("fs");
const filename = "log.csv";

let hours, minutes, seconds, time, start_time;

function start_button() {
    hours = document.getElementById("hours").value;
    minutes = document.getElementById("minutes").value;  
    seconds = document.getElementById("seconds").value; 

    time = (hours * 60 * 60) + (minutes * 60) + seconds * 1;
    start_time = time;

    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
    document.getElementById("update").disabled = true;
    
    startTimer();
}

function startTimer(){

    timex = setTimeout( function() {
        time--;
        
        if (time < 0) {
            let end_time_notification = new Notification("Time's up!", {
                body: "The time has expired. 1 hour has been added.",
                urgency: 'critical' 
            });
              
            stop_button();
            expired();
            clearInterval(x);
        }

        hours = Math.floor(time / (60 * 60));
        minutes = Math.floor((time % (60 * 60)) / (60));
        seconds = Math.floor(time % 60);

        document.getElementById("hours").value = hours;
        document.getElementById("minutes").value = minutes;
        document.getElementById("seconds").value = seconds;   

    startTimer(); 
    },1000);
}

function stop_button() {
    clearTimeout(timex);

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
    document.getElementById("update").disabled = false;

    let data = "";

    var date = new Date()
    var today = date.toLocaleDateString() + " " + date.toLocaleTimeString(); 

    var start_h = Math.floor(start_time / (60 * 60));
    var start_m = Math.floor((start_time % (60 * 60)) / (60));
    var start_s = Math.floor(start_time % 60);

    var diff_time = start_time - time;
    var diff_h = Math.floor(diff_time / (60 * 60));
    var diff_m = Math.floor((diff_time % (60 * 60)) / (60));
    var diff_s = Math.floor(diff_time % 60);

    data = today + "," + start_h + ":" + start_m + ":" + start_s + "," + hours + ":" + minutes + ":" + seconds + "," + diff_h + ":" + diff_m + ":" + diff_s + "\n";

    fs.appendFile(filename, data, function(err, result) {
        if (err) console.log('error', err);
    });

    history_button();
}

function expired() {
    document.getElementById("hours").value = 1;
    document.getElementById("minutes").value = 0;
    document.getElementById("seconds").value = 0;   

    time = 3600;
    start_time = time;
    // console.log(start_time);
    
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
    document.getElementById("update").disabled = true;


    startTimer();
}

function history_button() {

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) console.log('error', err);
        const content = data;

        parse_data(content); 
    });

}

function parse_data(content) {

    let arr = [];
    // console.log(content);
    content.split("\n").forEach(element => {
        arr.push(element.split(","));
    });

    arr.pop(); // remove blank newline

    let tableStr = '<thead><tr><th scope="col">Date</th><th scope="col">Start Time</th><th scope="col">End Time</th><th scope="col">Worked Time</th><th scope="col">Delete</th></tr><tbody>';

    arr.forEach((element, index) => {
        tableStr += `<tr id=line${index}>`;
        tableStr += `<th scope="row">${element[0]}</th>`;
        tableStr += `<td>${element[1]}</td>`;
        tableStr += `<td>${element[2]}</td>`;
        tableStr += `<td>${element[3]}</td>`;
        tableStr += `<td><button class="btn btn-secondary btn-sm" onclick="delete_data('line${index}')">&#x2715;</button></td>`;
        tableStr += "</tr>";
    });

    tableStr += "</tbody>";
    document.getElementById("history_table").innerHTML = tableStr;
}

function delete_data(line) {

    let value = document.getElementById(line).innerText; // 2023-01-01	6:0:0	5:59:56	0:0:4	X
    value = value.replaceAll("\t", ","); // '2023-01-01,6:0:0,5:59:56,0:0:4,X'
    value = value.slice(0,-2); // '2023-01-01,6:0:0,5:59:56,0:0:4'

    var data = fs.readFileSync(filename, 'utf-8');
    data = data.replace(`${value}\n`, '');
    fs.writeFileSync(filename, data, 'utf-8');

    history_button();
}

history_button();

