$(".resultBox").slideUp(); // Start with the result box closed
    
// Handling Operations which do not need a result to be shown
$("#search").on('keyup', (key) => {
    // When a query is submitted
    if(key.originalEvent.key === "Enter") {
        let text = $("#search").val(); // Get the query

        // If it is quit, then quit the app
        if(text.trim().toLowerCase() === "quit") {
        window.backend.quit();
        }
    }
});

// Whenever the search bar is being edited
$("#search").on('input', ()=>{
    let text = $("#search").val(); // Get the text entered

    // If text is not empty
    if(text.length > 0) {
        // Show the result box
        $(".resultBox").slideDown();
    }
    if(text.length == 0) {
        // Else close the result box
        $('.resultBox').slideUp();
    }

    // Clear all the results from the previous query
    $(".resultBox").empty();

    // Generate a new set of results:

    // Launching an application
    let launch_app = generate_result("./assets/application.png", `Launch Program ${text}`);
    launch_app.addEventListener('click', () => {
        window.backend.launchApp(text);
        resClicked();
    });
    // Check if the app is installed
    // window.backend.checkInstalled(text).then((res) => {
    //     if(res) {
    //     $('.resultBox').append(launch_app);
    //     }
    // });
    $('.resultBox').append(launch_app);

    // google search
    let google_search = generate_result("./assets/google.png", `Search in google for ${text}`);
    google_search.addEventListener('click', () => {window.backend.webSearch(text); resClicked()});
    $(".resultBox").append(google_search);
});

// If the search loses focus, close the result box
function resClicked() {
$(".resultBox").slideUp();
$("#search").val("");
}

// Generates results for queries
function generate_result(icon, text) {
    // Each Result is a div with an icon and corresponding text
    let res = document.createElement('button');
    res.className = "result";

    let img = document.createElement('img');
    img.className = "resimg";
    img.src = icon;

    let p = document.createElement('p');
    p.innerHTML = text;

    res.appendChild(img);
    res.appendChild(p);

    return res;
}

// The User should be able to change focus to element of the result options by pressing the down and up arrow keys
// Move focus down to the next child by pressing down arrow
$(document).on('keyup', (key) => {

    let results = $('.resultBox').children(".result"); // Get all results

    if(key.originalEvent.key === "ArrowDown") {
        
        if($(document.activeElement).attr('id')=='search') {
            // If searhc bar is active, move focus to first result element
            results[0].focus();
        } else if (document.activeElement.childNodes[1].innerHTML==results[results.length-1].childNodes[1].innerHTML) {
            // If last result is active move focus bck to search bar
            $("#search").focus();
        } else {
            // Else move focus to next result
            $(document.activeElement).next().focus();
        }
    }
});

// Move focus up to the previous child by pressing up arrow
$(document).on('keyup', (key) => {

    let results = $('.resultBox').children(".result"); // Get all results

    if(key.originalEvent.key === "ArrowUp") {
        
        if($(document.activeElement).attr('id')=='search') {
            // If searhc bar is active, move focus to first result element
            results[results.length-1].focus();
        } else if (document.activeElement.childNodes[1].innerHTML==results[0].childNodes[1].innerHTML) {
            // If last result is active move focus bck to search bar
            $("#search").focus();
        } else {
            // Else move focus to next result
            $(document.activeElement).prev().focus();
        }
    }
});