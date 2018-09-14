// This object will hold information about a person from a pose
function basicPerson() {
    
    this.nose = function() {
        this.x = 0;
        this.y = 0;
    }

    this.rightAnkle = function() {
        this.x = 0;
        this.y = 0;
    }

    this.leftAnkle = function() {
        this.x = 0;
        this.y = 0;
    }

    this.rightWrist = function() {
        this.x = 0;
        this.y = 0;
    }

    this.leftWrist = function() {
        this.x = 0;
        this.y = 0;
    }

    this.timeStamp = new Date();
}