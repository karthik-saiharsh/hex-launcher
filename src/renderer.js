$(".resultBox").slideUp(); // Start with the result box closed

// Handling queries which need a result to be shown after pressing enter
$("#search").on("keyup", (key) => {
  // When a query is submitted
  if (key.originalEvent.key === "Enter") {
    let text = $("#search").val(); // Get the query

    // If it is quit, then quit the app
    if (text.trim().toLowerCase() === "quit") {
      window.backend.quit();
    }
  }
});

// Whenever the search bar has been edited
$("#search").on("input", () => {
  let text = $("#search").val(); // Get the text entered

  // If text is not empty
  if (text.length > 0) {
    // Show the result box
    $(".resultBox").slideDown();
  }
  if (text.length == 0) {
    // Else close the result box
    $(".resultBox").slideUp();
  }

  // Clear all the results from the previous query
  $(".resultBox").empty();

  // Generate a new set of results:

  ///// Result Reg Ex /////

  audio_pattern = new RegExp("a:\\s*(\\d+)");
  brightness_pattern = new RegExp("b:\\s*(\\d+)");
  equation_pattern = new RegExp("eq:\\s*(.+)");
  dictionary_pattern = new RegExp("define:\\s*(.+)");
  timer_pattern = new RegExp("timer:\\s*(\\d+)\\s*([a-zA-Z])");
  google_pattern = new RegExp("g:\\s*(.+)");
  youtube_pattern = new RegExp("y:\\s*(.+)");
  launch_app_cmd = new RegExp("la:\\s*(.+)");
  math_pattern = new RegExp("m:\\s*(.+)");
  currency_pattern = new RegExp("convert:\\s*([0-9.]+)\\s*([A-Za-z]+)\\s*to\\s*([A-Za-z]+)", "i");
  alarm_pattern = new RegExp("alarm:\\s*(\\d+)\\s*:\\s*(\\d+)(.*)");
  joke_pattern = new RegExp("joke");
  poweroff_pattern = new RegExp("poweroff");
  reboot_pattern = new RegExp("reboot");
  ///// Result Reg Ex /////

  // google search
  if (google_pattern.test(text)) {
    let google_search = generate_result(
      "./assets/google.svg",
      `Search in google for "${text.match(google_pattern)[1].trimLeft()}"`
    );
    google_search.addEventListener("click", () => {
      resClicked();
      window.backend.webSearch(text.match(google_pattern)[1].trimLeft());
    });
    $(".resultBox").append(google_search);
  }

  // youtube search
  else if (youtube_pattern.test(text)) {
    let yt = generate_result(
      "./assets/youtube.svg",
      `Search in youtube for "${text.match(youtube_pattern)[1].trimLeft()}"`
    );
    yt.addEventListener("click", () => {
      resClicked();
      window.backend.openYt(text.match(youtube_pattern)[1].trimLeft());
    });
    $(".resultBox").append(yt);
  }

  // Launching an application
  // Check if the app is installed
  else if (launch_app_cmd.test(text)) {
    window.backend
      .checkInstalled(text.match(launch_app_cmd)[1].trimLeft())
      .then((res) => {
        if (res) {
          let launch_app = generate_result(
            "./assets/application.svg",
            `Launch Program "${text.match(launch_app_cmd)[1].trimLeft()}"`
          );
          launch_app.addEventListener("click", () => {
            resClicked();
            window.backend.launchApp(text.match(launch_app_cmd)[1].trimLeft());
          });
          // Clear all the results from the previous query
          $(".resultBox").empty();
          $(".resultBox").append(launch_app);
        } else {
          // Clear all the results from the previous query
          $(".resultBox").empty();
          $(".resultBox").append(
            generate_result(
              "./assets/application.svg",
              `"${text
                .match(launch_app_cmd)[1]
                .trimLeft()}" does not seem to installed on your computer`
            )
          );
        }
      });
  }


  // Alarm Functionality
  else if (alarm_pattern.test(text)) {
    hrs = parseInt(text.match(alarm_pattern)[1]);
    mins = parseInt(text.match(alarm_pattern)[2]);

    if (hrs > 24 || mins > 60) {
      $(".resultBox").append(generate_result("./assets/alarm.svg", "Invalid Time. Please Select a valid time to set alarm"));
    } else {
      alarm_result = generate_result("./assets/alarm.svg", `Set an alarm for ${hrs}:${mins}`);
      alarm_result.addEventListener('click', () => { resClicked(); window.backend.setAlarm(hrs, mins) });
      $(".resultBox").append(alarm_result);
    }


  }

  // Solving Math Expressions
  else if (math_pattern.test(text)) {
    // let yt = generate_result("./assets/calculator.svg", ``);
    window.backend
      .evaluvateFunc(text.match(math_pattern)[1].trimLeft())
      .then((res) => {
        if (res) {
          $(".resultBox").append(
            generate_result("./assets/calculator.svg", res)
          );
        }
      });
  }


  // solving math equations
  else if (equation_pattern.test(text)) {
    let [equation, variable] = text.match(equation_pattern)[0].split(" with ");
    window.backend.solveEquation(equation, variable).then((res) => {
      $(".resultBox").append(
        generate_result("./assets/equation.svg", `Solution: ${res}`)
      );
    });
  }

  //meaning of the word
  else if (dictionary_pattern.test(text)) {
    const word = text.match(dictionary_pattern)[1].trim();
    let dict_def = generate_result("./assets/Dictionary.svg", `Get meaning of ${word}`);
    dict_def.addEventListener('click', () => {
      window.backend.getDefinition(word)
        .then((definition) => {
          definitions = definition[0]['meanings'][0]['definitions']; // Get all definitions
          $(".resultBox").empty() // Clear the old result
          // Show all meanings
          for (i = 0; i < definitions.length; i++) {
            let definition = generate_result("./assets/Dictionary.svg", definitions[i]['definition']);
            $(".resultBox").append(definition);
          }
        })  
        .catch((error) => {
          const resultBox = document.querySelector(".resultBox");
          resultBox.innerHTML = '';
          const errorElement = generate_result("./assets/Dictionary.svg", `Error: ${error}`);
          resultBox.appendChild(errorElement);
        });
    });
    $(".resultBox").append(dict_def);
  }

  //timer functionality
  else if (timer_pattern.test(text)) {
    let unit = text.match(timer_pattern)[2];
    let timer_response = generate_result("./assets/timer.svg", `Set a Timer for ${text.substr(6)}`)
    let time = unit.toLowerCase() == 's' ? parseInt(text.match(timer_pattern)[1]) :
      unit.toLowerCase() == 'm' ? parseInt(text.match(timer_pattern)[1]) * 60 :
        unit.toLowerCase() == 'h' ? parseInt(text.match(timer_pattern)[1]) * 3600 :
          -1;
    if (time != -1) {
      timer_response.addEventListener('click', () => { resClicked(); window.backend.setTimer(time); });
      $(".resultBox").append(timer_response);
    } else {
      $(".resultBox").append(generate_result("./assets/timer.svg", "Enter a valid time unit (s/m/h)"));
    }
  }

  // Setting Audio 
  // Audio Control
  else if (audio_pattern.test(text)) {
    let volume = parseInt(text.match(audio_pattern)[1].replace(/[^0-9]/g, ""));
    if (!isNaN(volume) && volume >= 0 && volume <= 100) {
      let audioResult = generate_result(
        "./assets/audio.svg",
        `Set audio volume to ${volume}%`
      );
      // Add a click event listener
      audioResult.addEventListener("click", () => {
        resClicked(); // Handle the result click event
        window.backend.setAudio(volume).then((response) => {
          // Display the response in the result box
          $(".resultBox").append(generate_result("./assets/audio.svg", response));
        });
      });
      $(".resultBox").append(audioResult);
    } else {
      // error message 
      $(".resultBox").append(generate_result("./assets/audio.svg", "Invalid audio volume. Please specify a value between 0 and 100."));
    }
  }


  // Set screen brightness
  else if (brightness_pattern.test(text)) {
    let brightness = parseInt(text.match(brightness_pattern)[1].replace(/[^0-9]/g, ""));
    if (!isNaN(brightness) && brightness >= 0 && brightness <= 100) {
      let brightnessResult = generate_result(
        "./assets/brightnesssettings.svg",
        `Set brightness to ${brightness}%`
      );
      // Added a click event listener
      brightnessResult.addEventListener("click", () => {
        resClicked();
        window.backend.setBrightness(brightness).then((response) => {
          // Display the response in the result box
          $(".resultBox").append(generate_result("./assets/brightnesssettings.svg", response));
        });
      });
      $(".resultBox").append(brightnessResult);
    } else {
      // error message
      $(".resultBox").append(generate_result("./assets/brightnesssettings.svg", "Invalid brightness value. Please specify a value between 0 and 100."));
    }
  }

  // Generate a Joke
  else if (joke_pattern.test(text)) {
    joke_result = generate_result("./assets/joke.svg", "Get a Joke");
    joke_result.addEventListener('click', () => {
      $(".resultBox").empty();
      $("#search").val("");
      $.getJSON("https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun,Spooky,Christmas?blacklistFlags=nsfw,religious,political,racist,sexist,explicit", function (data) {
        if (data['type'] == "single") {
          $(".resultBox").append(generate_result("./assets/joke.svg", data['joke']));
        } else {
          $(".resultBox").append(generate_result("./assets/joke.svg", `${data['setup']}\n${data['delivery']}`));
        }
      });
    });
    $(".resultBox").append(joke_result);
  }

  // Currency Converter
  else if (currency_pattern.test(text)) {
    const matches = text.match(currency_pattern);
    const amount = parseFloat(matches[1]); // Extract amount
    const fromCurrency = matches[2].toUpperCase(); // Extract source currency
    const toCurrency = matches[3].toUpperCase(); // Extract target currency

    if (!isNaN(amount) && fromCurrency && toCurrency) {
      window.backend.convertCurrency(amount, fromCurrency, toCurrency).then((result) => {
        $(".resultBox").empty();
        $(".resultBox").append(generate_result("./assets/money.svg", result));
      });
    } else {
      $(".resultBox").append(
        generate_result("./assets/money.svg", "Invalid currency conversion query.")
      );
    }
  }

  // Power Control Options: POWEROFF
  else if(poweroff_pattern.test(text)) {
    poweroff_result = generate_result("./assets/poweroff.svg", "Shutdown the Device");
    poweroff_result.addEventListener('click', () => {window.backend.executeCommand(["poweroff", "shutdown /s"])});
    $(".resultBox").append(poweroff_result);
  }

  // Power Control Options: REBOOT
  else if(reboot_pattern.test(text)) {
    reboot_result = generate_result("./assets/reboot.svg", "Restart the Device");
    reboot_result.addEventListener('click', () => {window.backend.executeCommand(["reboot", "shutdown /r"])});
    $(".resultBox").append(reboot_result);
  }


  // If no specific regex is mentioned, just offer to search online for the query
  else {
    let google_search = generate_result(
      "./assets/search.svg",
      `Search online for "${text}"`
    );
    google_search.addEventListener("click", () => {
      resClicked();
      window.backend.webSearch(text);
    });
    $(".resultBox").append(google_search);
  }
});

// If the search loses focus, close the result box
function resClicked() {
  $(".resultBox").slideUp();
  $("#search").val("");
  $("#search").focus();
}

// Generates results for queries
function generate_result(icon, text) {
  // Each Result is a div with an icon and corresponding text
  let res = document.createElement("button");
  res.className = "result";

  let img = document.createElement("img");
  img.className = "resimg";
  img.src = icon;

  let p = document.createElement("p");
  p.innerHTML = text;

  res.appendChild(img);
  res.appendChild(p);

  return res;
}

// The User should be able to change focus to element of the result options by pressing the down and up arrow keys
// Move focus down to the next child by pressing down arrow
$(document).on("keyup", (key) => {
  let results = $(".resultBox").children(".result"); // Get all results

  if (key.originalEvent.key === "ArrowDown") {
    if ($(document.activeElement).attr("id") == "search") {
      // If searhc bar is active, move focus to first result element
      results[0].focus();
    } else if (
      document.activeElement.childNodes[1].innerHTML ==
      results[results.length - 1].childNodes[1].innerHTML
    ) {
      // If last result is active move focus bck to search bar
      $("#search").focus();
    } else {
      // Else move focus to next result
      $(document.activeElement).next().focus();
    }
  } else if (key.originalEvent.key === "ArrowUp") {
    if ($(document.activeElement).attr("id") == "search") {
      // If searhc bar is active, move focus to first result element
      results[results.length - 1].focus();
    } else if (
      document.activeElement.childNodes[1].innerHTML ==
      results[0].childNodes[1].innerHTML
    ) {
      // If last result is active move focus bck to search bar
      $("#search").focus();
    } else {
      // Else move focus to next result
      $(document.activeElement).prev().focus();
    }
  } else {
    if ($(document.activeElement).attr("id") != "search") {
      keys_to_ignore = [16, 18, 8, 39, 37, 144, 17, 91, 27, 45, 36, 35, 33, 34, 13];
      if (!keys_to_ignore.includes(key.originalEvent.keyCode)) {
        $("#search").val($("#search").val() + key.originalEvent.key);
      }
      $("#search").focus();
    }
  }
});
