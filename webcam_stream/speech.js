const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

startElem.addEventListener("click", function(evt) {
    recognition.start()
}, false);

stopElem.addEventListener("click", function(evt) {
    recognition.stop();
    document.getElementById('textbox').value = "";
}, false);

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
let finalTranscript = '';
let recognition = new window.SpeechRecognition();

recognition.interimResults = true;
recognition.maxAlternatives = 10;
recognition.continuous = true;
recognition.lang = "en";

recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
        let transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interimTranscript += transcript;
        }
    }
    document.getElementById('textbox').value = finalTranscript + interimTranscript;
    document.getElementById("textbox").scrollTop = document.getElementById("textbox").scrollHeight;
}

