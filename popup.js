let start = document.getElementById('start');
let stop = document.getElementById('stop');


start.addEventListener('click', async function() {

    chrome.runtime.sendMessage({ data: "start" }, function(response) {
        console.log(response);
    });


    let node = document.createElement("p");
    node.textContent = "Started recording";
    document.body.appendChild(node);
})

stop.addEventListener('click', function() {
    chrome.runtime.sendMessage({ data: "stop" }, function(response) {
        console.log(response);
    });

    let node = document.createElement("p");
    node.textContent = "Stopped recording";
    document.body.appendChild(node);
})