const backgrounds = document.querySelectorAll("[data-color]");
const downloadBtn = document.querySelector(".pdf-btn");
const letter = document.querySelector(".letter");
const settingsBtn = document.querySelector(".settings-btn");
const dialog = document.getElementById("config");
const form = document.querySelector("form[method='dialog']");
const startRecord = document.getElementById("start-record");
const stopRecord = document.getElementById("stop-record");
const wordToReplace = document.getElementById("wordToReplace");
const newWord = document.getElementById("newWord");


const replaceObj = [
    { regex: /fullstop|full stop/gi, replacement: '.' },
    { regex: /comma/gi, replacement: ',' },  
    { regex: /''/gi, replacement: '' }

];


window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


const recognition = new SpeechRecognition();
recognition.interimResults = true;

let p = document.createElement("p");

letter.appendChild(p);

recognition.addEventListener("result", (e) => { 
 

    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

      p.textContent = applyReplacements(transcript);

      if (e.results[0].isFinal) {
        p = document.createElement('p');
        letter.appendChild(p);
      }

      
});





function startRecording(){
    recognition.start();
    startRecord.classList.add('active');
}








function handleUserReplace(){

    replaceObj[2].regex = new RegExp(wordToReplace.value, 'gi');
    replaceObj[2].replacement = newWord.value;

    console.table(replaceObj);


}


function applyReplacements(transcript) {
   
    replaceObj.forEach(({ regex, replacement }) => {
        transcript = transcript.replace(regex, replacement);
    });
    return transcript;
}




function updateVariables(e){
   const input = e.target;
   if(input.name === "fontSize"){
    document.documentElement.style.setProperty(`--${input.name}`, `${input.value}px`);
   }else{
    document.documentElement.style.setProperty(`--${input.name}`, input.value);
   }

}





function closeDialog(){
    setTimeout(() => {
        handleUserReplace();
    [...form.elements].forEach(input => {
        if (input.name) { 
            updateVariables({ target: input });
        }
     })
    }, 0);
  dialog.close();
}




async function downloadingPDF(){

    const { jsPDF } = window.jspdf;
    let done;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
   
    await delay(2000) // 2 secs delay so users can see the downloading animation;


  return html2canvas(letter).then(canvas => {

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        
        const divWidth = letter.offsetWidth;
        const divHeight = letter.offsetHeight;

        // Define PDF dimensions and aspect ratio
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (divHeight * pdfWidth) / divWidth;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        pdf.save('Myletter.pdf');

        return  done = true;
    });
}




async function saveAsPDF(){
    this.classList.add("active");
    this.querySelector(".tooltip").textContent = 'Downloading...';
    const result = await downloadingPDF();
    if(result){
        this.classList.remove("active");
        this.querySelector(".tooltip").textContent = 'Save as PDF';
    };
}



function activeBG(){

    backgrounds.forEach(background => background.classList.remove("active"));
    this.classList.add("active");
   if(this.classList.contains("active")){
      document.documentElement.style.setProperty("--activeBG", `${this.dataset.color}`);
   };

}




recognition.addEventListener('error', (e) =>{
    if(e.error !== 'not-allowed') return;
    alert('Please allow access to your microphone');
});

recognition.addEventListener('end', startRecording);
startRecord.addEventListener("click", startRecording);


stopRecord.addEventListener("click", () => {
    recognition.removeEventListener("end", startRecording);
    recognition.stop();
    startRecord.classList.remove("active");
});


newWord.addEventListener("input", handleUserReplace);
wordToReplace.addEventListener("input", handleUserReplace);



form.addEventListener('input', updateVariables);
form.addEventListener('mousemove', updateVariables);
form.addEventListener("reset", closeDialog);


settingsBtn.addEventListener("click", () => {dialog.showModal()});
downloadBtn.addEventListener('click', saveAsPDF);

backgrounds.forEach(background => { background.addEventListener("click", activeBG) });