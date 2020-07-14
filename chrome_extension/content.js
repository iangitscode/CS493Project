function navigateVideo(time, player) {
  // This method for raw <video id="player"> tags
  player.currentTime = time;
}

function getTranscription(videoElement) {
  let src = "";
  if (videoElement.childElementCount === 0) return;
  src = videoElement.children[0].src;
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
      }
    };

    let url = "https://capstonecs1.ml/transcribe_file";
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "video/mp4");
    xhttp.send(bytes);
  });
}

function processResponse(response, player) {
  const obj = JSON.parse(response);
  let response_box = document.createElement("div");
  for (let timestamp of obj.timestamps) {
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

    // Only add a space in front if it's a word, do not do so for punctuation
    if (timestamp.type == "pronunciation") {
      word_box.innerText = " " + timestamp.word;
    } else {
      word_box.innerText = timestamp.word;
    }

    response_box.appendChild(word_box);
  }
  // Create a new tab and inject the transcript there
  let t = window.open();
  t.document.body.appendChild(response_box);
}

/* This code is always run for every page */
// Get all <video> tags
let videos = document.getElementsByTagName("video");
for (let video of videos) {
  let transcribeButton = document.createElement("button");
  transcribeButton.addEventListener("click", () => {
    getTranscription(video);
  });
  transcribeButton.classList.add("transcribeButton");
  transcribeButton.innerText="Transcribe";

  video.parentNode.insertBefore(transcribeButton, video);
}
