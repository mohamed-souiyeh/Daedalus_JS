import { Cell } from "../cell.js";
import { inputDefaults, pageIndexs } from "../configs/defaults.js";
import { debugPagesSize } from "../configs/input.config.js";
import { Corner } from "../corner.js";
import { Debuger } from "../debugger.js";
import { Wall } from "../wall.js";
import { addCanvasEventListeners } from "./Canvas.EventListeners.js";
import { LENGTH, WIDTH, addCanvasShortCutsEventListeners } from "./Canvas.ShortCuts.EventListeners.js";
import { addDebugButtonEventListeners, setDebugMode } from "./DebugButton.EventListeners.js";
import { addDelayInputEventListeners, updateDelay } from "./Delay.EventListeners.js";
import { addKeyboardEventListners } from "./Keyboard.EventListeners.js";
import { addPauseButtonEventListeners, setPauseButtonState } from "./PauseButton.EventListeners.js";
import { setupControlCenterEvents } from "./control center Events/controlCenter.setup.js";
import { initToolTips } from "./toolTips.js";
export const globals = {
    delay: inputDefaults.DELAY,
    isPaused: inputDefaults.ISPAUSED,
    debugModeOn: inputDefaults.DEBUGMODEON,
    debugBookletIsOn: inputDefaults.DEBUGBOOKLETISON,
    mouseCellPosIsLocked: inputDefaults.MOUSECELLPOSISLOCKED,
    currentdebugPageIndex: inputDefaults.DEFAULTDEBUGPAGEINDEX,
    // mazeGenerationAlgorithm: 
};
document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("canvas");
    canvas.setAttribute('tabindex', '0'); // make the canvas focusable
    const numberInput = document.getElementById('number-input');
    const incrementButton = document.getElementById('increment');
    const decrementButton = document.getElementById('decrement');
    const pauseButton = document.getElementById('pauseButton');
    const debugButton = document.getElementById('debugButton');
    const resetButton = document.getElementById('resetButton');
    const controlCenterButton = document.getElementById('controleCenterButton');
    const controlCenter = document.getElementById('control-center');
    async function initDefaultStates() {
        await updateDelay(inputDefaults.DELAY, numberInput);
        await setPauseButtonState(inputDefaults.ISPAUSED, pauseButton);
        await setDebugMode(inputDefaults.DEBUGMODEON, debugButton);
        globals.debugBookletIsOn = inputDefaults.DEBUGBOOKLETISON;
        globals.mouseCellPosIsLocked = inputDefaults.MOUSECELLPOSISLOCKED;
        globals.currentdebugPageIndex = inputDefaults.DEFAULTDEBUGPAGEINDEX;
        Debuger.d_length = debugPagesSize[globals.currentdebugPageIndex][LENGTH];
        Debuger.d_width = debugPagesSize[globals.currentdebugPageIndex][WIDTH];
        Cell.debugPage = pageIndexs.cell;
        Cell.debugPageLength = inputDefaults.CELLDEBUGPAGELENGTH;
        Cell.debugPageWidth = inputDefaults.CELLDEBUGPAGEWIDTH;
        Corner.debugPageLength = inputDefaults.CORNERDEBUGPAGELENGTH;
        Corner.debugPageWidth = inputDefaults.CORNERDEBUGPAGEWIDTH;
        Wall.debugPageLength = inputDefaults.WALLDEBUGPAGELENGTH;
        Wall.debugPageWidth = inputDefaults.WALLDEBUGPAGEWIDTH;
    }
    await initToolTips();
    await initDefaultStates();
    await addCanvasEventListeners(canvas);
    await addDelayInputEventListeners(numberInput, incrementButton, decrementButton);
    await addDebugButtonEventListeners(debugButton);
    await addPauseButtonEventListeners(pauseButton);
    await addCanvasShortCutsEventListeners(canvas);
    await addKeyboardEventListners(controlCenterButton, pauseButton, debugButton, numberInput);
    await setupControlCenterEvents(controlCenter);
});
