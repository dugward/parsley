// -------
var enteredSent;
var rootIndex;
var sentenceInfo;
var POS = ["UNKOWN", "ADJ", "ADP", "ADV", "CONJ", "DET", "NOUN", "NUM", "PRON", "PRT", "PUNCT", "VERB", "X", "AFFIX"]

history.pushState({ pagestate: "resultsdown" }, null, "");

window.onpopstate = () => {
    if (window.history.state.pagestate == "resultsdown") {
        location.reload();
    }
};

var resultWords = document.getElementsByClassName("word");


// function for when button is hit or enter key
function buttonEnter() {
    //Hide the POS list at first.
    for (i = 0; i < document.getElementById("resultKeyPOS").children.length; i++) {
        document.getElementById("resultKeyPOS").children[i].style.display = "none";
    }
    sentenceInfo = [];
    // grab info from text area and log
    enteredSent = document.getElementById("textinput").value;
    console.log(enteredSent);
    history.pushState({ pagestate: "resultsup" }, null, "");

    function start() {
        // client info for google api
        gapi.client
            .init({
                apiKey: "AIzaSyDHUJ-trLzZU2KkIRdBLXDmp0n8TKBSqzE",
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

                    document.getElementById("resultText").innerHTML = "";
                    for (let i = 0; i < sentenceInfo.length; i++) {
                        // the html for most words
                        const wordEntry = ` <span class="word ${sentenceInfo[i].partOfSpeech.tag}">${sentenceInfo[i].text.content}</span>`;
                        //constant for the html for punctuation
                        const wordEntryPunct = `<span class="word ${sentenceInfo[i].partOfSpeech.tag}">${sentenceInfo[i].text.content}</span>`;
                        //Now adding words
                        //If it is punctuation:
                        if (sentenceInfo[i].partOfSpeech.tag == "PUNCT") {
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', wordEntryPunct);
                        }
                        // If it is several rare POS that need to be mapped to our simpler POS
                        else if (sentenceInfo[i].partOfSpeech.tag == "PRT" && sentenceInfo[i].dependencyEdge.label == "PS") {
                            document.getElementById("resultText").removeChild(document.getElementById("resultText").lastChild);
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="ADJ word">${sentenceInfo[i - 1].text.content}</span><span class="ADJ word">${sentenceInfo[i].text.content}</span>`);
                            document.getElementById("resultKeyPOS").getElementsByClassName("ADJ")[0].style.display = "block";
                            document.getElementById("resultKeyPOS").getElementsByClassName("ADJ")[0].classList.add("used");
                        } else if (sentenceInfo[i].partOfSpeech.tag == "DET" && (sentenceInfo[i].dependencyEdge.label == "DOBJ" || sentenceInfo[i].dependencyEdge.label == "IOBJ" || sentenceInfo[i].dependencyEdge.label == "POBJ" || sentenceInfo[i].dependencyEdge.label == "NSUBJ" || sentenceInfo[i].dependencyEdge.label == "NSUBJPASS")) {
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="word NOUN">${sentenceInfo[i].text.content}</span>`);
                            document.getElementById("resultKeyPOS").getElementsByClassName("NOUN")[0].style.display = "block";
                            document.getElementById("resultKeyPOS").getElementsByClassName("NOUN")[0].classList.add("used");
                        } else if (sentenceInfo[i].partOfSpeech.tag == "DET" && sentenceInfo[i].dependencyEdge.label == "NSUBJ") {
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="word NOUN">${sentenceInfo[i].text.content}</span>`);
                            document.getElementById("resultKeyPOS").getElementsByClassName("NOUN")[0].style.display = "block";
                            document.getElementById("resultKeyPOS").getElementsByClassName("NOUN")[0].classList.add("used");
                        } else if (sentenceInfo[i].partOfSpeech.tag == "X" && sentenceInfo[i].dependencyEdge.label == "DISCOURSE") {
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', ` <span class="word DISCOURSE">${sentenceInfo[i].text.content}</span>`);
                            document.getElementById("resultKeyPOS").getElementsByClassName("DISCOURSE")[0].style.display = "block";
                            document.getElementById("resultKeyPOS").getElementsByClassName("DISCOURSE")[0].classList.add("used");
                        } else {
                            document.getElementById("resultText").insertAdjacentHTML('beforeend', wordEntry);
                            document.getElementById("resultKeyPOS").getElementsByClassName(sentenceInfo[i].partOfSpeech.tag)[0].style.display = "block";
                            document.getElementById("resultKeyPOS").getElementsByClassName(sentenceInfo[i].partOfSpeech.tag)[0].classList.add("used");
                        }
                        //Change root's class to ROOT
                        if (sentenceInfo[i].dependencyEdge.label == "ROOT" || (sentenceInfo[i].dependencyEdge.headTokenIndex == rootIndex) && (sentenceInfo[i].dependencyEdge.label == "AUX" || sentenceInfo[i].dependencyEdge.label == "AUXPASS")) {
                            document.getElementById("resultText").lastChild.classList.add("ROOT");
                        }
                        //Change the subject to SUBJ
                        if ((sentenceInfo[i].dependencyEdge.label == "NSUBJ" || sentenceInfo[i].dependencyEdge.label == "NSUBJPASS") && sentenceInfo[i].dependencyEdge.headTokenIndex == rootIndex) {

                            document.getElementById("resultText").lastChild.classList.add("SUBJ");
                        }
                        //On word click, 
                        var resultWords = document.getElementsByClassName("word");
                        for (let i = 0; i < resultWords.length; i++) {
                            resultWords[i].addEventListener('click', () => {

                                //Hide all POS below that is not this POS
                                for (let j = 0; j < document.getElementById("resultKeyPOS").children.length; j++) {
                                    if (document.getElementById("resultKeyPOS").children[j].classList.contains(resultWords[i].classList[1]) != 1) {
                                        document.getElementById("resultKeyPOS").children[j].style.display = "none";
                                    }
                                }
                                //Show this POS
                                for (let j = 0; j < document.getElementById("resultKeyPOS").children.length; j++) {
                                    if (document.getElementById("resultKeyPOS").children[j].classList.contains(resultWords[i].classList[1]) == 1) {
                                        document.getElementById("resultKeyPOS").children[j].style.display = "block";
                                    }
                                };
                                //Dim all words not of this POS
                                for (let j = 0; j < document.getElementById("resultText").children.length; j++) {
                                    if (document.getElementById("resultText").children[j].classList.contains(resultWords[i].classList[1]) != 1) {
                                        document.getElementById("resultText").children[j].style.opacity = "0.25";
                                    }
                                }

                                //After a pause, show all used POS and undim all words.
                                setTimeout(() => {
                                    for (let j = 0; j < document.getElementById("resultKeyPOS").children.length; j++) {
                                        if (document.getElementById("resultKeyPOS").children[j].classList.contains("used") == 1) {
                                            document.getElementById("resultKeyPOS").children[j].style.display = "block";
                                        }
                                    };
                                    for (let j = 0; j < document.getElementById("resultText").children.length; j++) {
                                        if (document.getElementById("resultText").children[j].classList.contains(resultWords[i].classList[1]) != 1) {
                                            document.getElementById("resultText").children[j].style.opacity = "1";
                                        }
                                    }
                                }, 3000)
                            }
                            );

                        }

                        //On POS click, 
                        var keyItems = document.getElementsByClassName("keyItem");
                        for (let i = 0; i < keyItems.length; i++) {
                            keyItems[i].addEventListener('click', () => {

                                //Dim all words not of this POS
                                for (let j = 0; j < document.getElementById("resultText").children.length; j++) {
                                    if (document.getElementById("resultText").children[j].classList.contains(keyItems[i].classList[1]) != 1) {
                                        document.getElementById("resultText").children[j].style.opacity = "0.25";
                                    }
                                }

                                //After a pause, show all used POS and undim all words.
                                setTimeout(() => {

                                    for (let j = 0; j < document.getElementById("resultText").children.length; j++) {
                                        if (document.getElementById("resultText").children[j].classList.contains(keyItems[i].classList[1]) != 1) {
                                            document.getElementById("resultText").children[j].style.opacity = "1";
                                        }
                                    }
                                }, 3000)
                            }
                            );

                        }

                    }

                },
                function (reason) {
                    console.log("Error: " + reason.result.error.message);
                }
            )



    }


    gapi.load("client", start);


    //Show the result text and the POS list
    document.getElementById("resultText").style.display = "block";
    document.getElementById("resultMenu").style.display = "block";
    document.getElementById("resultKeys").style.display = "block";
    document.getElementById("resultKeyRoot").style.display = "none";
    document.getElementById("textinput").style.display = "none";
    document.getElementById("checkButton").style.display = "none";


}



//Listen for enter key or button click
document.getElementById("checkButton").addEventListener("click", buttonEnter);
document.getElementById("textinput").addEventListener("keypress", (event) => {
    if (event.which === 13) {
        buttonEnter();
        event.preventDefault();
    }
});

//Auto resize the text entry field as typing.
document.getElementById("textinput").addEventListener("input", () => {
    document.getElementById("textinput").style.height = "auto";
    document.getElementById("textinput").style.height =
        document.getElementById("textinput").scrollHeight + "px";
});

//What to do when Root & Sub is clicked.
function randsClick() {
    var words = document.getElementsByClassName("word");
    for (let i = 0; i < words.length; i++) {
        if (words[i].classList.contains("ROOT") || words[i].classList.contains("SUBJ")) {
        } else {
            words[i].style.opacity = "0.3";
        }
    }
    if (document.getElementsByClassName("SUBJ")[0].classList.contains("PRON") == 1) {
        document.getElementsByClassName("SUBJ")[0].style.backgroundColor = "var(--pistachio)";
    }
    document.getElementById("rands").classList.add("active");
    document.getElementById("pos").classList.remove("active");
    document.getElementById("resultKeyPOS").style.display = "none";
    document.getElementById("resultKeyRoot").style.display = "block";
}

//What do do when POS is clicked. 
function posClick() {
    var words = document.getElementsByClassName("word");
    for (let i = 0; i < words.length; i++) {
        words[i].style.opacity = "1";
    }
    if (document.getElementsByClassName("SUBJ")[0].classList.contains("PRON") == 1) {
        document.getElementsByClassName("SUBJ")[0].style.backgroundColor = " var(--puce)";
    }
    document.getElementById("pos").classList.add("active");
    document.getElementById("rands").classList.remove("active");
    document.getElementById("resultKeyPOS").style.display = "block";
    document.getElementById("resultKeyRoot").style.display = "none";
}

//Listen for Key menu clicks
document.getElementById("rands").addEventListener("click", randsClick);
document.getElementById("pos").addEventListener("click", posClick);

//Dim all others when hovering.

var hoverClasses = [];
var resultWords = document.getElementsByClassName("word");

