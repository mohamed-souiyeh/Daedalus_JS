export let mouse = {
    x: 0,
    y: 0
};
document.addEventListener("DOMContentLoaded", function () {
    // Get the select elements and the button
    let mazeAlgorithmSelect = document.getElementById("build");
    let solveAlgorithmSelect = document.getElementById("solve");
    let launchButton = document.getElementById("launch");
    let canvas = document.getElementById("canvas");
    //? window.addEventListener("resize", resizeCanvas);
    //add event listener to the mouse move event
    canvas.addEventListener("mousemove", function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
        // console.log("mouse moved", mouse);
    });
    // Add an event listener to the mazeAlgorithm select
    mazeAlgorithmSelect.addEventListener("change", function () {
        // Enable the solveAlgorithm select when a maze algorithm is selected
        solveAlgorithmSelect.disabled = false;
        checkSelections();
    });
    // Add an event listener to the solveAlgorithm select
    solveAlgorithmSelect.addEventListener("change", function () {
        checkSelections();
    });
    function checkSelections() {
        // If both selects have a value, enable the button
        if (mazeAlgorithmSelect.value && solveAlgorithmSelect.value) {
            launchButton.disabled = false;
        }
    }
    let numberInput = document.getElementById('number');
    let incrementButton = document.getElementById('increment');
    let decrementButton = document.getElementById('decrement');
    incrementButton.addEventListener('click', function () {
        numberInput.value = String(parseInt(numberInput.value) + 1 > 60 ? 60 : parseInt(numberInput.value) + 1);
    });
    decrementButton.addEventListener('click', function () {
        //FIXME - MAKE IT POSSIBL TO SET THE NUMBER TO 0 AKA FPS OFF AND THE ANIMATIONS IS STOPPED BUT PREVENT DEVISION BY IT IN THE DELTA TIME CALCULATION
        numberInput.value = String(parseInt(numberInput.value) - 1 < 1 ? 1 : parseInt(numberInput.value) - 1);
    });
});
