const buttons = document.querySelectorAll("button");

// Load audio files correctly using document.getElementById()
const audioPlay = document.getElementById("audioPlay");
const audioFood = document.getElementById("audioFood");
const audioStudy = document.getElementById("audioStudy");

// Function to change the text when the button is hovered
function msg(button) {
    if (button.id === "Study") {
        // No sound or message change for Study button
    } else {
        button.innerText = "Sapne Dekhna Achhi Bat hai"; 
        button.classList.add('shake'); // Add shake animation
    }
}

// Function to restore the original button text when the mouse moves away
function restoreText(button) {
    if (button.id === "Play") {
        button.innerText = "Play for lifetime";
        audioPlay.pause(); // Stop the audio
        audioPlay.currentTime = 0; // Reset audio to the start
    } else if (button.id === "Food") {
        button.innerText = "Eat unlimited Food";
        audioFood.pause();
        audioFood.currentTime = 0;
    } else if (button.id === "Study") {
        button.innerText = "Study lifetime";
        audioStudy.pause();
        audioStudy.currentTime = 0;
    }
    button.classList.remove('shake'); // Remove shake animation
}

// Adding hover and mouseout event listeners to each button
buttons.forEach((button) => {
    button.addEventListener("mouseover", () => {
        msg(button);

        // Play the corresponding sound when hovered
        if (button.id === "Play") {
            audioPlay.play();
        } else if (button.id === "Food") {
            audioFood.play();
        } else if (button.id === "Study") {
            audioStudy.play();
        }
    });

    button.addEventListener("mouseout", () => {
        restoreText(button);
    });
});
