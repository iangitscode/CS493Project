
// Very basic HTTP GET request because I don't know how to upload the video yet
// This has to be a POSt with the video link or video data later, then we can just call processResponse()
function getTranscription() {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processResponse(xhttp.responseText);
    }
  };
  xhttp.open("GET", "http://localhost:5000/transcribe", true);
  xhttp.send();
}

function processResponse(response) {
  const obj = JSON.parse(response);
  let response_box = document.createElement("div");
  for (let timestamp of obj.timestamps) {
    let word_box = undefined;
    // Actual timestamp we want to create a link for
    if (timestamp.time >= 0) {
      word_box = document.createElement("a");
      word_box.addEventListener("click", () =>  {navigateVideo(timestamp.time);});
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
  document.getElementById("transcript-box").appendChild(response_box);
}

function navigateVideo(time) {
  let video = document.getElementById("video");
  video.currentTime = time;
}