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

async function transcribe() {
  let file = document.getElementById("input").files[0];
  let byteArray = await file.arrayBuffer();

  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processResponse(xhttp.responseText);
    }
  };
  xhttp.open("POST", "http://99.240.239.86:10000/transcribe", true);
  xhttp.setRequestHeader('Content-type', 'video/mp4');
  // xhttp.setRequestHeader('Content-type', 'application/binary');
  // xhttp.send(byteArrayAsString);
  xhttp.send(byteArray);
}