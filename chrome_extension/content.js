function navigateVideo(time, player) {
  // This method for raw <video id="player"> tags
  player.currentTime = time;
}

function getTranscription(videoElement) {
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
      }
    };

    // let url = "https://capstonecs1.ml/transcribe_file";
    let url = "http://localhost:5000/transcribe";
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

}

/* This code is always run for every page */
// Get all <video> tags
window.addEventListener("load", () => {
  let videos = document.getElementsByTagName("video");
  for (let video of videos) {
    let transcribeButton = document.createElement("button");
    transcribeButton.addEventListener("click", () => {
      getTranscription(video);
    });
    transcribeButton.classList.add("transcribeButton");
    transcribeButton.innerText="Transcribe";

    video.parentNode.insertBefore(transcribeButton, video);

    // Make transcribe button appear on mouse hover
    let parentNode = video.parentNode;
    parentNode.addEventListener("mouseenter", function(event){
      transcribeButton.style.visibility = "visible";
    });
    parentNode.addEventListener("mouseleave", function(event){
      transcribeButton.style.visibility = "hidden";
    });
  }
}, false);
