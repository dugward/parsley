// -------
var enteredSent;
var rootIndex;
var sentenceInfo;

// function for when button is hit or enter key
function buttonEnter() {
  document.getElementById("resultText").innerHTML = "";
  sentenceInfo = [];
  // grab info from text area and log
  enteredSent = document.getElementById("textinput").value;
  console.log(enteredSent);

  function start() {
    // client info for google api
    gapi.client
      .init({
        apiKey: "AIzaSyCUz2qp-o83_cfCW55IZ4q7Dkly4gD6pY8",
        discoveryDocs: [
          "https://language.googleapis.com/$discovery/rest?version=v1beta2",
        ],
      })
      //Send sentence to google api
      .then(function () {
        return gapi.client.language.documents.analyzeSyntax({
          document: {
            type: "PLAIN_TEXT",
            content: enteredSent,
          },
        });
      })
      .then(
        function (resp) {
          //Store the array and log
          sentenceInfo = resp.result.tokens;
          console.log(sentenceInfo);
          //mark down the index of the root
          for (let i = 0; i < sentenceInfo.length; i++) {
            if (sentenceInfo[i].dependencyEdge.label == "ROOT") {
              rootIndex = sentenceInfo[i].dependencyEdge.headTokenIndex;
            }
          }
          //add html for first element
          document.getElementById("resultText").insertAdjacentHTML('beforeend', `<span class="${sentenceInfo[0].partOfSpeech.tag}">${sentenceInfo[0].text.content}</span>`);
          //BEGIN STUFF TO ADD TO PoSSOBLE NOUN AND VERBS//
          if (sentenceInfo[0].dependencyEdge.label == "ROOT") {
            document.getElementById("resultText").lastChild.classList.add("ROOT");
          }
          if ((sentenceInfo[0].dependencyEdge.label == "NSUBJ" || sentenceInfo[0].dependencyEdge.label == "NSUBJPASS") && sentenceInfo[0].dependencyEdge.headTokenIndex == rootIndex) {
            document.getElementById("resultText").lastChild.classList.add("SUBJ");
          }
          //END STUFF TO ADD
          for (let i = 1; i < sentenceInfo.length; i++) {
            // the html for most words
            const wordEntry = ` <span class="${sentenceInfo[i].partOfSpeech.tag}">${sentenceInfo[i].text.content}</span>`;
            //constant for the html for punctuation
            const wordEntryPunct = `<span class="${sentenceInfo[i].partOfSpeech.tag}">${sentenceInfo[i].text.content}</span>`;
            if (sentenceInfo[i].partOfSpeech.tag == "PUNCT") {
              document.getElementById("resultText").insertAdjacentHTML('beforeend', wordEntryPunct);
            } else if (sentenceInfo[i].partOfSpeech.tag == "PRT" && sentenceInfo[i].dependencyEdge.label == "PS") {
              document.getElementById("resultText").removeChild(document.getElementById("resultText").lastChild);
              document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="ADJ">${sentenceInfo[i - 1].text.content}</span><span class="ADJ">${sentenceInfo[i].text.content}</span>`);
            } else if (sentenceInfo[i].partOfSpeech.tag == "DET" && (sentenceInfo[i].dependencyEdge.label == "DOBJ" || sentenceInfo[i].dependencyEdge.label == "IOBJ" || sentenceInfo[i].dependencyEdge.label == "POBJ")) {
              document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="NOUN">${sentenceInfo[i].text.content}</span>`);
            } else if (sentenceInfo[i].partOfSpeech.tag == "DET" && sentenceInfo[i].dependencyEdge.label == "NSUBJ") {
              document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="NOUN">${sentenceInfo[i].text.content}</span>`);
            } else if (sentenceInfo[i].partOfSpeech.tag == "X" && sentenceInfo[i].dependencyEdge.label == "DISCOURSE") {
              document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="DISCOURSE">${sentenceInfo[i].text.content}</span>`);
            } else {
              document.getElementById("resultText").insertAdjacentHTML('beforeend', wordEntry);
              if (sentenceInfo[i].dependencyEdge.label == "ROOT") {
                document.getElementById("resultText").lastChild.classList.add("ROOT");
              }
              if ((sentenceInfo[i].dependencyEdge.label == "NSUBJ" || sentenceInfo[i].dependencyEdge.label == "NSUBJPASS") && sentenceInfo[i].dependencyEdge.headTokenIndex == rootIndex) {
                document.getElementById("resultText").lastChild.classList.add("SUBJ");
              }
            }
          }

        },
        function (reason) {
          console.log("Error: " + reason.result.error.message);
        }
      );
  }
  gapi.load("client", start);
}

document.getElementById("checkButton").addEventListener("click", buttonEnter);
document.getElementById("textinput").addEventListener("keypress", (event) => {
  if (event.which === 13) {
    buttonEnter();
    event.preventDefault();
  }
});

document.getElementById("textinput").addEventListener("input", () => {
  document.getElementById("textinput").style.height = "auto";
  document.getElementById("textinput").style.height =
    document.getElementById("textinput").scrollHeight + "px";
});

document.getElementById("rands").addEventListener("click", () => {
  document.getElementById("rands").classList.add("active");
  document.getElementById("pos").classList.remove("active");
  document.getElementById("resultKeyPOS").style.display = "none";
  document.getElementById("resultKeyRoot").style.display = "block";
});

document.getElementById("pos").addEventListener("click", () => {
  document.getElementById("pos").classList.add("active");
  document.getElementById("rands").classList.remove("active");
  document.getElementById("resultKeyPOS").style.display = "block";
  document.getElementById("resultKeyRoot").style.display = "none";
});
