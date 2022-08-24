const {app, BrowserWindow, shell} = require("electron");
const HTMLparser = require("node-html-parser");
var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
console.log("loaded")
let win = null;
var Questions = null;
require("dotenv").config();

let req = new XMLHttpRequest();
req.onreadystatechange = () => {
    console.log(`state changed ${req.readyState}`);
  if (req.readyState == 4) {
    console.log("recieved");
    Questions = JSON.parse(req.responseText).record
  var htmlContent = fs.readFileSync(__dirname + "/BasePage.html");
  fs.writeFileSync(__dirname + '/temp-html.html', htmlContent,{encoding:'utf8',flag:'w'});

  let num = 1

  Questions.TextAnswerQuestionList.forEach(question => {
    StringQuestion(question, num)
    num++
  });
  var document = HTMLparser.parse(fs.readFileSync(__dirname + "/temp-html.html"));
  document.getElementById("Question-info").getElementById("Teacher-name").innerHTML = Questions.TeacherName;
  document.getElementById("Question-info").getElementById("Quiz-name").innerHTML = Questions.FeedbackQuestionsTitle
  console.log(JSON.stringify(Questions))
  fs.writeFileSync(__dirname + "/Questions.json", JSON.stringify(Questions),{encoding:'utf8',flag:'w'})
  document.getElementById("main-section").setAttribute("data-", __dirname);
  fs.writeFileSync(__dirname + "/temp-html.html", document.toString(),{encoding:'utf8',flag:'w'})
  
  app.whenReady().then(createWindow);
}
};
req.open("GET", process.env.quizBin, true);
req.setRequestHeader(process.env.masterKey, process.env.apiAccessKey);
req.send();

const createWindow = () => {
    win = new BrowserWindow({
        show: false,
        width: 1900,
        height:1000,
        title: "Feedback",
        resizable: true,
        fullscreenable: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.maximize();
    //win.removeMenu();
    const electronLocalshortcut = require('electron-localshortcut');

    electronLocalshortcut.register(win, 'home', () => {
        win.loadFile(__dirname + "/temp-html.html")
        win.title = "Feedback"
        console.log("back");
        // Open DevTools
    });

    electronLocalshortcut.register(win, 'F11', () => {
        win.setFullScreen(true)
        console.log("fullscreen");
        // Open DevTools
    });

    electronLocalshortcut.register(win, 'Escape', () => {
        win.setFullScreen(false)
        console.log("exit-fullscreen");
        // Open DevTools
    });

    win.loadFile(__dirname + "/temp-html.html")
    win.show();
};



function StringQuestion(question, num){
    var text = question.questionText;

    var QuestionExample = HTMLparser.parse(fs.readFileSync(__dirname + "/TextQuestion.html"))

    QuestionExample.getElementsByTagName("h1").forEach(element =>{
        if (question.manditory) text += " *";
        element.innerHTML = text
    })

    QuestionExample.getElementsByTagName("span").forEach(element =>{
        element.setAttribute("id", `Question${num}`)
    })

    var FinalPage = HTMLparser.parse(fs.readFileSync(__dirname + "/temp-html.html"));

    FinalPage.getElementById("questions").innerHTML += QuestionExample.toString();
    FinalPage.getElementById("questions").setAttribute("data-", Questions.TextAnswerQuestionList.length)
    fs.writeFileSync(__dirname + "/temp-html.html", FinalPage.toString(),{encoding:'utf8',flag:'w'})
}

function GetNumQuestions(){
    return Questions.TextAnswerQuestionList.length
}