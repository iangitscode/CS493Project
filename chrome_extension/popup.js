// Update the relevant fields with the new data.
const setDOMInfo = info => {
  document.getElementById('numVideos').textContent = 'Total number of videos: ' + info.numVideos;
  if (info.numVideos > 0) {
    for (video in info.videos) {
      let transcribeButton = document.createElement("button");
       transcribeButton.addEventListener("click", () => {
         getTranscription(video);
       });
       transcribeButton.classList.add("transcribeButton");
       transcribeButton.innerText="Transcribe Video";
       let transcribeContainer = document.getElementById('transcribe-container');
       transcribeContainer.appendChild(transcribeButton);
    }
  }
};

function getTranscription(videoElement) {
  // Do stuff with the video element here
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called
        //    from the receiving end (content script).
        setDOMInfo);
  });
});
