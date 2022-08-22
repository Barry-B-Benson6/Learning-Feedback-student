var __dirname;

var process;

function OnInput() {
    console.log("things input");
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
}

async function Setup(){

  __dirname = document.getElementById("main-section").getAttribute("data-");

  await $.get(__dirname + '/.env', function (data) {
    let parts = data.split(/\r?\n|\r|\n/g)
    var keys = [];
    var x = 0;
    parts.forEach(part =>{
      keys[x] = part.split("=")[1].replace(/"/g,'');
      x++;
    })
    process = {
      "masterKey" : keys[0],
      "apiAccessKey" : keys[1],
      "responseBin" : keys[3]
    }
  })

  console.log(JSON.stringify(process))


    
    console.log("setting up")
    var tx = document.getElementsByClassName('question-textBox');
    for (var i = 0; i < tx.length; i++) {
      tx[i].setAttribute('style', 'height:' + (tx[i].scrollHeight) + 'px;overflow-y:hidden;');
      tx[i].addEventListener("input", OnInput, false);
    }
    document.getElementById("logo").addEventListener("click", LogoClick,false)
}

function LogoClick(){
  console.log("clicked")
  window.location.assign("https://www.woodcroft.sa.edu.au/")
  //shell.openExternal("https://www.woodcroft.sa.edu.au/")
  //require('shell').openExternal("https://www.woodcroft.sa.edu.au/");
}

async function Submit(){
  let responses = []
  QuestionsDiv = document.getElementById("questions");
  var textBoxs = QuestionsDiv.getElementsByClassName("question-textBox");
  var Questions;
  await $.getJSON(__dirname + '/Questions.json', function (data) {
    Questions = data.TextAnswerQuestionList
  })
  var num = Questions.length

  var name = document.getElementById("Student-name").textContent;
  if (name === ""){
    OpenPopup();
    return;
  }

  //Get responses to questions and check that manditory one are answered
  for (var i = 0; i < num; i++){

    //check manditory
    var manditory = Questions[i].manditory
    if (textBoxs[i].textContent === "" && manditory){
      OpenPopup();
      return;
    }

    //get responses
    responses.push({
      "Question": QuestionsDiv.getElementsByClassName("question-text")[i].textContent,
      "Response": textBoxs[i].textContent
    })
  }

  //colate into an object to send to teacher
  const date = new Date();
  let response = {
    "StudentName" : name,
    "TimeSubmited" : `${date.getDate()}:${date.getMonth() + 1}:${date.getFullYear()}`,
    "QuestionsAndAnswers" : responses
  }

  console.log(JSON.stringify(response));

  //get list of responses
  let req = new XMLHttpRequest();

  //collect and resend the responses
  req.onreadystatechange = () => {
  console.log(`state changed ${req.readyState}`);
  if (req.readyState === 4) {
      //add the new response to list
      console.log(req.responseText)
      var retrieved = JSON.parse(req.responseText);
      console.log(retrieved)
      console.log(response)
      retrieved.record.responses.push(response)

      let req2 = new XMLHttpRequest();

      //send back updated list
      req2.open("PUT", "https://api.jsonbin.io/v3/b/63009faba1610e638606eccf", true);
      req2.setRequestHeader("Content-Type", "application/json");
      req2.setRequestHeader(process.masterKey, process.apiAccessKey);
      req2.send(JSON.stringify(retrieved.record));


      //after submission
      window.location.href= __dirname + "/submitted.html"
    }
  };
  req.open("GET", "https://api.jsonbin.io/v3/b/63009faba1610e638606eccf/latest", true);
  req.setRequestHeader(process.masterKey, process.apiAccessKey);
  req.send();
}

function OpenPopup(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById("popup-wrapper").style.visibility = "visible";
  document.getElementById("popup-wrapper").style.opacity = "100%";
}

function ClosePopup(){
  document.getElementById("popup-wrapper").style.visibility = "hidden";
  document.getElementById("popup-wrapper").style.opacity = "0%";
}