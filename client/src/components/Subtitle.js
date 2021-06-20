import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function Subtitle() {
  const { transcript, resetTranscript } = useSpeechRecognition();
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
    );
  }

  SpeechRecognition.startListening({
    continuous: true,
    language : 'en'
  });

  var splited = transcript.split(" ");
  var result = "";

  if (splited.length >= 12) {
    result = splited.slice(splited.length - 12).join(' ');
  } else {
    result = transcript;
  }

  //console.log("transcript : ", transcript);
  //console.log("result : ", result);

  return (
    <div>
      {result && (
        <div id="textbox" data-value="1">{result}</div>
      )}
    </div>
  );
}
export default Subtitle;