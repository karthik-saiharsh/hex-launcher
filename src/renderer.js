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

  audio_pattern = new RegExp("audio:\\s*(\\d+)");
  brightness_pattern = new RegExp("brightness:\\s*(\\d+)");
  equation_pattern = new RegExp("eq:s*(.+)");
  dictionary_pattern = new RegExp("dict:s*(.+)");
  timer_pattern = new RegExp("timer:s*(.+)");
  google_pattern = new RegExp("g:s*(.+)");
  youtube_pattern = new RegExp("y:s*(.+)");
  launch_app_cmd = new RegExp("la:s*(.+)");
  math_pattern = new RegExp("m:s*(.+)");
  currency_pattern = new RegExp("convert:\\s*([0-9.]+)\\s*([A-Za-z]+)\\s*to\\s*([A-Za-z]+)", "i");

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
    let word = text.match(dictionary_pattern)[0];
    window.backend.getDefinition(word).then((definition) => {
      $(".resultBox").append(
        generate_result("./assets/Dictionary.svg", `Definition: ${definition}`)
      );
    });
  }
  //timer functionality
  else if (timer_pattern.test(text)) {
    let seconds = parseInt(text.match(timer_pattern)[0]);
    if (!isNaN(seconds)) {
      // Create a result box for the timer countdown
      let timer_result = generate_result(
        "./assets/timer.svg",
        `Timer: ${seconds} seconds`
      );
      $(".resultBox").append(timer_result);

      // Start the timer
      window.backend.setTimer(seconds);

      // Update the timer UI on each sec
      window.backend.onTimerUpdate((time) => {
        timer_result.querySelector(
          "p"
        ).innerHTML = `Timer: ${time} seconds remaining`;
      });

      // When the timer is done, update the message
      window.backend.onTimerDone(() => {
        timer_result.querySelector("p").innerHTML = "Time's up!";
      });
    }
  } 
  // Setting Audio 
  else if (audio_pattern.test(text)) {
    // Extract the audio volume 
    let audioInput = text.match(audio_pattern)[0];
    let volume = parseInt(audioInput.replace(/[^0-9]/g, "")); // Remove non-numeric characters

    // Validate volume value
    if (!isNaN(volume) && volume >= 0 && volume <= 100) {
        window.backend.setAudio(volume).then((response) => {
            $(".resultBox").append(generate_result("./assets/audio.svg", response));
        });
    } else {
        $(".resultBox").append(generate_result("./assets/audio.svg", "Invalid audio volume. Please specify a value between 0 and 100."));
    }
}

// Set screen brightness
else if (brightness_pattern.test(text)) {
    // Extract the brightness value
    let brightnessInput = text.match(brightness_pattern)[0];
    let brightness = parseInt(brightnessInput.replace(/[^0-9]/g, "")); // Remove non-numeric characters

    // Validate brightness value
    if (!isNaN(brightness) && brightness >= 0 && brightness <= 100) {
        window.backend.setBrightness(brightness).then((response) => {
            $(".resultBox").append(generate_result("./assets/brightnesssettings.svg", response));
        });
    } else {
        $(".resultBox").append(generate_result("./assets/brightnesssettings.svg", "Invalid brightness value. Please specify a value between 0 and 100."));
    }
}

else if (currency_pattern.test(text)) {
    const matches = text.match(currency_pattern);
    const amount = parseFloat(matches[1]); // Extract amount
    const fromCurrency = matches[2].toUpperCase(); // Extract source currency
    const toCurrency = matches[3].toUpperCase(); // Extract target currency

    if (!isNaN(amount) && fromCurrency && toCurrency) {
        window.backend.convertCurrency(amount, fromCurrency, toCurrency).then((result) => {
            $(".resultBox").append(generate_result("./assets/money.svg", result));
        });
    } else {
        $(".resultBox").append(
            generate_result("./assets/money.svg", "Invalid currency conversion query.")
        );
    }
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
      $("#search").val($("#search").val() + key.originalEvent.key);
      $("#search").focus();
    }
  }
});
