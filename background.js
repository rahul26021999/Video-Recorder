let mediaRecorder, stream;

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    console.log(message);
    if (message.data === "start") {
        console.log("startcalled");
        recordScreen();
        setTimeout(() => {
            callback({ response: "Started" });
        }, 1000);
    } else if (message.data === "stop") {
        console.log("stopcalled");
        mediaRecorder.stop();
        stopRecord();
    }
    return true;
});

async function recordScreen() {

    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    // voiceStream for recording voice with screen recording
    const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
    stream = new MediaStream(tracks);
    createRecorder();
}


function createRecorder() {
    // the stream data is stored in this array
    let recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.onstop = function() {
        saveFile(recordedChunks);
        recordedChunks = [];
    };
    mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
}

function stopRecord() {
    stream.getTracks() // get all tracks from the MediaStream
        .forEach(track => track.stop()); // stop each of them
}

function saveFile(recordedChunks) {

    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    let filename = window.prompt('Enter file name'),
        downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${filename}.webm`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(blob); // clear from memory
    document.body.removeChild(downloadLink);
}