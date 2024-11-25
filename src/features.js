const { create, all } = require("mathjs"); //for solving math equations and doing calculations
const math = create(all); //initialising the mathjs
const { shell } = require("electron"); //opening links in the browser
const { exec } = require("child_process"); //for opening apps in the system
const fetch = require("node-fetch"); //to fetch data from API'S
const notifier = require("node-notifier");//for desktop notifications

//function to launch an app present in the system
function OpenApp(appName) {
  exec(appName, (error) => {
    if (error) {
      console.error(`Error launching ${appName}:`, error.message);
    } else {
      console.log(`${appName} launched successfully`);
    }
  });
}

// function to perform math calculations
function calculations(input) {
  try {
    const res = math.evaluate(input);
    return res;
  } catch (error) {
    return "Invalid math Expression";
  }
}

//function to solve a math equation
function SolveEquation(input, variable) {
  try {
    const res = math.solve(input, variable);
    return res.toString();
  } catch(error) {
    return "the Equation cannot be solved";
  }
}

//google search
function googleSearch(input) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  shell.openExternal(url); // open the search result in the browser
}

//youtube search
function youtubeSearch(input) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    input
  )}`;
  shell.openExternal(url); // open the search result in the browser
}

// function  to get the word meaning or definition(dictionary)

async function Dictionary(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    if (!response.ok) {
      throw new Error("Word not Found");
    }
    // converting our response to json format
    const data = await response.json();
    //return first meaning
    return data[0].meanings[0].definitions[0].definition;
  } catch(error) {
    return "Meaning or Definition not found";
  }
}


//function to set timer
function Timer(sec){
  setTimeout(()=>{
    notifier.notify({
      title: "Timer Alert",//title of the notification
      message: "Time's up!!",//message to show user
      sound: true, 
    });
   
  },sec*1000);
}


module.exports = {
  OpenApp,
  calculations,
  SolveEquation,
  googleSearch,
  youtubeSearch,
  Dictionary,
  Timer,
};
