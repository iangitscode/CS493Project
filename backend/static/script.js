// Create the player object used to interact with the Youtube video
let player;


// Very basic HTTP GET request because I don't know how to upload the video yet
// This has to be a POSt with the video link or video data later, then we can just call processResponse()
function getTranscription() {
  let xhttp = new XMLHttpRequest();
  const video = document.getElementsByTagName("iframe");
  const url = video[0].src;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processResponse(xhttp.responseText);
    }
  };
  xhttp.open("POST", "http://localhost:5000/transcribe", true);
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send(url);
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
  // This method for raw <video id="player"> tags
  // let video = document.getElementById("player");
  // video.currentTime = time;
  player.seekTo(time, true);
}

// Asynchronously load the YouTube player API
window.onload = () => {
  var tag = document.createElement('script');
  tag.id = 'yt-player';
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

/* 
 *  Called when Youtube API is finished loading
 *  Assumes the iframe containing the embedded video has the id 'iframe-player'
 *  - id cannot be "player", there is a hidden element named "player" under the hood\
 *  - events object containing callbacks must be present
 */
function onYouTubeIframeAPIReady() {
  const JSENABLED="?enablejsapi=1";
  let iframe = document.getElementById("iframe-player");

  // Enable JS API if not set
  let url = iframe.getAttribute("src");
  if (url.indexOf(JSENABLED) < 0) {
    url += JSENABLED;
  }

  // Enable JS APi if explicitly turned off
  url = url.replace("?enablejsapi=0", JSENABLED);

  iframe.setAttribute("src", url);

  player = new YT.Player('iframe-player', {
    events: {
      'onReady': ()=>{console.log("Player ready")},
      'onStateChange': ()=>{console.log("Player state changed")}
    }
  });
}