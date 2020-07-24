function navigateVideo(time, player) {
  // This method for raw <video id="player"> tags
  player.currentTime = time;
}


function getTranscription(videoElement) {
  document.getElementById('transcribingMarker').textContent = 'transcribing';
  let src = "";

  // Try to get src from the video
  // First see if the video has a src attribute
  // This will either be the src or null
  src = videoElement.getAttribute("src");

  // If there are children elements, try to get a src from one of them
  for (child of videoElement.children) {
    src = src || child.src || child.getAttribute("src");
  }

  // If src is not a full path, add on the origin
  if (src.substr(0,4) != "http") {
    src = window.location.origin + src;
  }

  console.log("Src = ", src);

  // Asynchronously get the blob
  // This should be very fast because the browser should have it cached
  fetch(src)
  .then((res) => res.blob())
  .then((blob) => blob.arrayBuffer())
  .then((bytes) => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        processResponse(xhttp.responseText, videoElement);
      } else if (this.status == 502 || this.status == 500 || this.status == 503 || this.status == 504){
        handleError(xhttp);
      }
    };

    let url = "https://capstonecs1.ml/transcribe_file";
    //let url = "http://localhost:5000/transcribe";
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "video/mp4");
    xhttp.send(bytes);
  });
}

function handleError(err) {
  document.getElementById('transcribingMarker').textContent = 'failedTranscribing';
}

function processResponse(response, player) {
  const obj = JSON.parse(response);
  let response_box = document.createElement("div");
  let words = obj['alignment'][0];
  let timestamps = obj['alignment'][1];
  timestamps.forEach(function(timestamp, index) {
    let word_box = undefined;
    // Actual timestamp we want to create a link for
    if (timestamp.time >= 0) {
      word_box = document.createElement("a");
      word_box.addEventListener("click", () =>  {navigateVideo(timestamp.time, player);});
      word_box.classList.add("linked-timestamp");
    } else {
    // Do not create a link and only show the text
      word_box = document.createElement("span");
    }
    word_box.classList.add("text");

    word_box.innerText = " " + words[index];

    response_box.appendChild(word_box);
  });
  // Create a new tab and inject the transcript there
  let t = window.open();
  t.document.body.appendChild(response_box);

  // Inject CSS into the new tab
  let style = document.createElement("style");
  style.innerText = `
  .text {
    font-size: 20px;
  }

  .linked-timestamp {
    cursor: pointer;
  }

  .linked-timestamp:hover {
    color: #4660b8;
  }
  `;
  t.document.body.appendChild(style);
  document.getElementById('transcribingMarker').textContent = 'doneTranscribing';
}

/* This code is always run for every page */
// Get all <video> tags
window.addEventListener("load", () => {
  let videos = document.getElementsByTagName("video");
  for (let video of videos) {
    let transcribeButton = document.createElement("button");
    transcribeButton.addEventListener("click", function(event) {
      getTranscription(video);
      event.preventDefault();
    });
    transcribeButton.classList.add("transcribeButton");
    transcribeButton.innerText="Transcribe";

    video.parentNode.insertBefore(transcribeButton, video);

    // Make transcribe button appear on mouse hover
    let parentNode = video.parentNode;

    let transcribingMarker = document.createElement('div');
    transcribingMarker.id = 'transcribingMarker';
    let transcriptionStatus = document.createTextNode('notTranscribing');
    transcribingMarker.style.visibility = 'hidden';
    transcribingMarker.append(transcriptionStatus);
    document.body.appendChild(transcribingMarker);

    parentNode.addEventListener("mouseenter", function(event){
      transcribeButton.style.visibility = "visible";
      let transcribingMarker = document.getElementById('transcribingMarker');
      if (transcribingMarker != null && transcribingMarker.textContent == 'transcribing') {
        transcribeButton.style.background = 'yellow';
        transcribeButton.innerText="Transcribing... please wait";
      } else if (transcribingMarker != null && transcribingMarker.textContent == 'failedTranscribing') {
        transcribeButton.style.background = 'red';
        transcribeButton.innerText="Transcription failed";
      } else if (transcribingMarker != null && transcribingMarker.textContent == 'doneTranscribing') {
        transcribeButton.style.background = '#4CAF50';
        transcribeButton.innerText="Finished transcription";
      } else {
        transcribeButton.style.background = '#4CAF50';
        transcribeButton.innerText="Transcribe";
      }
    });
    parentNode.addEventListener("mouseleave", function(event){
      transcribeButton.style.visibility = "hidden";
    });
  }
}, false);
