let start = document.getElementById('start');
let stop = document.getElementById('stop');
let recordTime = document.getElementById('recordTime');
let recordingStatus = document.getElementById('recordingStatus');
let uploadProgressContainer = document.getElementById('uploadProgressContainer');
let uploadProgress = document.getElementById('uploadProgress');

let recordingTools = document.getElementById('recordingTools');
let uploadRecording = document.getElementById('upload');
let resetRecording = document.getElementById('reset');
let downloadRecording = document.getElementById('download');

let shareableLinkConatiner = document.getElementById('shareableLinkConatiner');
let shareableLink = document.getElementById('shareableLink');

let recordedChunks = [];
let startTime, recordInterval;
let mediaRecorder, stream;


start.addEventListener('click', async function() {

    start.disabled = true;
    stop.disabled = false;
    await recordScreen();
    startRecordTime();
    createRecorder();

    recordingStatus.innerHTML = "Recording Started";
})


function copySharableLink() {

    /* Select the text field */
    shareableLink.select();
    shareableLink.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(shareableLink.value);

    /* Alert the copied text */
    alert("Copied the text: " + shareableLink.value);
}

function startRecordTime() {
    startTime = new Date();

    recordInterval = setInterval(function() {
        var showTime = "";
        var now = new Date();
        var hours = parseInt(Math.abs(now - startTime) / (1000 * 60 * 60) % 24);
        var minutes = parseInt(Math.abs(now.getTime() - startTime.getTime()) / (1000 * 60) % 60);
        var seconds = parseInt(Math.abs(now.getTime() - startTime.getTime()) / (1000) % 60);
        if (hours > 0) {
            hours = hours < 10 ? "0" + hours : hours;
            showTime = hours + ":";
        }
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        recordTime.innerHTML = showTime + minutes + ":" + seconds;
    }, 1000)
}

stop.addEventListener('click', function() {
    stop.disabled = true;
    start.disabled = true;
    mediaRecorder.stop();
    recordingStatus.innerHTML = "Recording Stopped";
});

uploadRecording.addEventListener('click', function() {
    if (accessToken != "") {
        recordingStatus.innerHTML = "Recording Upload Started";
        uploadFileWithProgress(recordedChunks);
    } else {
        alert("Login with google to upload the file");
    }

});
downloadRecording.addEventListener('click', function() {
    saveFile();
});
resetRecording.addEventListener('click', function() {
    recordedChunks = [];
    recordingTools.style.display = "none";
    start.disabled = false;
    stop.disabled = true;
    recordingStatus.innerHTML = "";
    recordTime.innerHTML = "00:00";
    uploadProgressContainer.style.display = "none";
    uploadProgress.style.width = 0 + "%";
    uploadProgress.setAttribute("aria-valuenow", 0);
    uploadProgress.innerHTML = 0 + "%";
    shareableLinkConatiner.style.display = "none";
    shareableLink.value = "";
});

async function recordScreen() {

    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    // voiceStream for recording voice with screen recording
    const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
    stream = new MediaStream(tracks);
}


function createRecorder() {
    // the stream data is stored in this array

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.onstop = function() {
        clearInterval(recordInterval);
        closeTracks();
        showRecordingTools();
    };
    mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
}

function showRecordingTools() {
    recordingTools.style.display = "block";
    uploadRecording.disabled = false;
    downloadRecording.disabled = false;
    resetRecording.disabled = false;
}

function closeTracks() {
    stream.getTracks() // get all tracks from the MediaStream
        .forEach(track => track.stop()); // stop each of them
}

function saveFile() {

    const blob = new Blob(recordedChunks, {
        type: 'video/mp4'
    });
    let filename = window.prompt('Enter file name');
    let downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${filename}.mp4`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(blob); // clear from memory
    document.body.removeChild(downloadLink);

    start.disabled = false;
}