function navigateVideo(time, player) {
  // This method for raw <video id="player"> tags
  player.currentTime = time;
}


function getTranscription(videoElement) {
  document.getElementById('transcribingMarker').textContent = 'transcribing';
  let src = videoElement.currentSrc;

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
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "video/mp4");
    xhttp.send(bytes);
  });
}

function handleError(err) {
  document.getElementById('transcribingMarker').textContent = 'failedTranscribing';
}

function processResponse(response, player) {
  const parsed_response = JSON.parse(response);
  const MAX_BLOCK_WORD_COUNT = 150;
  let sentences = parsed_response["sentences"];
  let response_box = document.createElement("div");

  // Create a new tab and inject the transcript there
  let t = window.open();
  t.document.body.appendChild(response_box);

  // Split text into blocks of approximately equal length
  let currentBlock = document.createElement("div");
  currentBlock.classList.add("block");
  response_box.appendChild(currentBlock);
  currentBlock.style.visibility = "hidden";
  let currentWordCount = 0;

  sentences.forEach(function(sentence, sentenceIndex) {
    let words = sentence["words"];
    currentWordCount += words.length;
    words.forEach(function(word, wordIndex) {
      let word_box = undefined;
      let timestamp = word["timestamp"];
      if (timestamp >= 0) {
        word_box = document.createElement("a");
        word_box.addEventListener("click", () =>  {navigateVideo(timestamp, player);});
        word_box.classList.add("linked-timestamp");
      } else {
        // Do not create a link and only show the text
        word_box = document.createElement("span");
      }
      word_box.classList.add("text");
      word_box.innerText = " " + word["value"];

      currentBlock.appendChild(word_box);
    });

    // If after adding this sentence the currentBlock is too big, create a new one
    if (currentWordCount >= MAX_BLOCK_WORD_COUNT) {
      currentWordCount = 0;
      currentBlock.style.visibility = "visible";

      currentBlock = document.createElement("div");
      currentBlock.classList.add("block");
      response_box.appendChild(currentBlock);
      currentBlock.style.visibility = "hidden";
    }
  });

  // Flush the last block by making it visible
  currentBlock.style.visibility = "visible";

  // Inject CSS into the new tab
  let style = document.createElement("style");
  style.textContent = `
  body {
    font-family: Arial;
    font-size: 30px;
  }

  .block {
    padding: 100px 300px 0 300px;
  }

  .linked-timestamp {
    cursor: pointer;
  }

  .linked-timestamp:hover {
    color: #4660b8;
  }
  `;
  t.document.head.append(style);
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
