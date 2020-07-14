function getTranscription(videoElement) {
  // Do stuff with the video element here
}

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
