let videoOutput;        // will hold video output HTML element
let net, trainingFiles; // will hold poseNet object and training files list
let poseObjects = [];   // will hold all poses calculated for a video
let continueOps = false;// flag to continue execution of program

// Wait until the page is fully loaded
// then initialize the program
window.onload = () => init();

// Initialize global variables
function init() {
    // Setup video HTML element    
    videoOutput = document.getElementById('videoOutput');
    videoOutput.playbackRate = .25; // poseNet takes a bit to calculate.  slowing the video allows it to keep up
    videoOutput.addEventListener("timeupdate", getPose);    // Add function to get the pose in the frame each time the time stamp updates
    videoOutput.addEventListener('ended', stopOps);         // Add function to stop poseNet calculations once video finishes playing

    // Make the start/stop button toggle video
    startAndStop.addEventListener('click', toggleVideo);

    // Load the posenet object
    posenet.load().then(function(loadedNet) {
        net = loadedNet;
    });

    // Gets a lits of files from the Data_Set folder
    getTrainingList();
}

function getTrainingList() {
    const filePath  =  './Data_Set/Train/train.list';
    let rawFile     =  new XMLHttpRequest();  // create a new AJAX object
    let fileText;
    
    // Open an AJAX request
    rawFile.open("GET", filePath, true);
    
    // Add file list to global variable once done
    // and the return status is 'ok'
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                fileText = rawFile.responseText;
                trainingFiles = fileText.split('\n');   // Places each line into its own array element
                trainingFiles.splice(0, 1);             // Remove first element as it is the name of the file
            }
        }
    }
    
    // Send the request
    rawFile.send();
}

// Currently main function to play video
// and start poseNet calculations [will be replaced by analyzeVideos()]
function toggleVideo() {
    let sourceElement = document.createElement('source');
    continueOps       = true;

    // Holds the url source for the video to load
    sourceElement.setAttribute('src', '../Data_Set/Train/v_JumpingJack_g01_c01.webm');

    // Add source to video, set playback to 25%
    // and add event listners
    videoOutput.appendChild(sourceElement);
    videoOutput.addEventListener("timeupdate", getPose);
    videoOutput.addEventListener('ended', stopOps);
    videoOutput.play();
}

// Function to loop through each video
// run each frame through poseNet
// and save the poses for later analysis
function analyzeVideos() {
    let sourceElement = document.createElement('source');   // Create source HTML element to hold the video's source url

    // Loop through each fileName and collect pose data
    trainingFiles.foreach(fileName => {
        sourceElement.setAttribute('src', `../Data_Set/Train/${fileName}`);
        videoOutput.appendChild(sourceElement);
        videoOutput.play();
    });
}

// Callback for when the 
// video's frame is changed
function getPose() {
    posenetCalc(videoOutput);   // calculate pose
}


// Callback to stop program
// once video is done
function stopOps() {
    continueOps = false;    // Change flag to stop program execution
}

// Runs posenet
function posenetCalc(image) {
    const imageScaleFactor    =     1;      // Size of the image to send to posenet (0.1 - 1)
    const outputStride        =     32;     // Controls accuracy at the cost of speed (8, 16, 32)
    const flipHorizontal      =     false;  // Flips image horizontally
    const poseArgs            =     [image, imageScaleFactor, flipHorizontal, outputStride];

    // Run image and arguments through pose model
    net.estimateSinglePose(...poseArgs)
        .then(poseSuccessFunc, poseErrorFunc);
}

// poseNet successfully returned a pose
function poseSuccessFunc(pose) {
    console.log('pose success: ' + JSON.stringify(pose));

    drawKeypoints(pose);
}

// An error occurred calculating pose
function poseErrorFunc(err) {
    console.log(`Error calculating pose: ${err}`);
}

// Cause program to 'sleep' for supplied milliseconds
// Not currently used **MARK FOR DELETION**
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Draws circles at keypoints on a canvas
// The keypoints are derived from the pose object
function drawKeypoints(pose) {
    let canvas     =   document.getElementById('snapShotCanvas');  // New canvas to draw on for keypoints
    let canvasCtx  =   canvas.getContext('2d');                    // Context of the new canvas
    let textPosLeft, textPosTop, arcArgs, textArgs;                // Text position for text overlay at each point

    //Clear the canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < pose.keypoints.length; j++) {
        
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        
        // Only draw an ellipse is the pose probability is bigger than 0.3
        if (keypoint.score > 0.3) {
            
            // Move text of each point up and to the right
            textPosLeft = keypoint.position.x + 10;
            textPosTop  = keypoint.position.y + 10;

            // Intermediate argument arrays
            arcArgs  = [keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI, false];
            textArgs = [keypoint.part, textPosLeft, textPosTop];

            // Context style properties
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeStyle = '#00ff00';
            
            // Start new path, draw circle for current point, and add text
            canvasCtx.fillText(...textArgs);
            canvasCtx.beginPath();
            canvasCtx.arc(...arcArgs);
            canvasCtx.stroke();
            
        }
    }

}