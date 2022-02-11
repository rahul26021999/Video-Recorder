// Client ID and API key from the Developer Console
var CLIENT_ID = '510334805135-qa12ii6oc27requ366dvscu6p0efdf6v.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCnwK0ARADlfEXceFWirmjLwUwUiQUQgVU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
let accessToken;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function getToken() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'immediate': 'true',
        'scope': SCOPES
    }).then(function(response) {
        console.log(response);
        accessToken = response.access_token;
        console.log(accessToken);
    });
}
/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        appendPre(JSON.stringify(error, null, 2));
    })
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    start.disabled = false;
    if (isSignedIn) {
        getToken();
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'inline-block';
    } else {
        accessToken = "";
        authorizeButton.style.display = 'inline-block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function uploadFileWithProgress(data) {
    const file = new Blob(recordedChunks, {
        type: 'video/mp4'
    });
    let filename = window.prompt('Enter file name');
    var metadata = {
        'name': filename, // Filename at Google Drive
        'mimeType': 'video/mp4', // mimeType at Google Drive
        //    'parents': ['### folder ID ###'], // Folder ID at Google Drive
    };

    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    var xhr = new XMLHttpRequest();
    xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'json';
    xhr.upload.onprogress = function(e) {
        console.log(e);
        var percentComplete = Math.ceil((e.loaded / e.total) * 100);
        uploadProgressContainer.style.display = "block";
        uploadProgress.style.width = percentComplete + "%";
        uploadProgress.setAttribute("aria-valuenow", percentComplete);
        uploadProgress.innerHTML = percentComplete + "%";
    };
    xhr.onload = () => {
        let result = xhr.response;
        if (result.error) {
            uploadProgressContainer.style.display = "none";
            if (result.error.code == 401) {
                recordingStatus.innerHTML = "Login Using google to upload the file";
                alert("Login Using google to upload the file");
            } else {
                recordingStatus.innerHTML = "Error while Uploading, Please Download the File";
                alert("Error while Uploading, Please Download the File");
            }
        } else if (result.id) {
            uploadProgressContainer.style.display = "none";
            recordingStatus.innerHTML = "Recording Uploaded Successfully, Creating a Shareable link for you ";
            insertPermission(result.id);
            alert("File Successfully Uploaded, Generating a Shareable link for you");
        }
        console.log(result);
    };
    xhr.send(form);
}

function insertPermission(fileId) {
    return gapi.client.drive.permissions.create({
            "fileId": fileId,
            "resource": {
                "role": "reader",
                "type": "anyone"
            }
        })
        .then(function(response) {
                var url = "https://www.googleapis.com/drive/v3/files/" + fileId + "?fields=webViewLink&key=" + API_KEY
                var xhr = new XMLHttpRequest();
                xhr.open('get', url);
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                xhr.responseType = 'json';
                xhr.onload = () => {
                    let result = xhr.response;
                    console.log("WebView Link Generated sucessfully :" + result.webViewLink);
                    recordingStatus.innerHTML = "Sucessfully Created a shareable Link";
                    shareableLinkConatiner.style.display = "inline-block";
                    shareableLink.value = result.webViewLink;
                };
                xhr.send();
                console.log("Permission created sucessfully :" + response);

            },
            function(err) { console.error("Execute error", err); });
}