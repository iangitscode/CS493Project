// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // First, validate the message's structure.
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data.
    let videos = document.getElementsByTagName("video");
    var domInfo = {
      numVideos: videos.length,
      videos: videos,
    };

    // Directly respond to the sender (popup),
    // through the specified callback.
    response(domInfo);
  }
});
