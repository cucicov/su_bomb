"use strict";
// puzzle https://codepen.io/DonKarlssonSan/pen/vgKoyE
exports.__esModule = true;
// @ts-ignore
var p5_1 = require("p5");
var loadHandlers = [];
window = {
    performance: performance,
    document: {
        hasFocus: function () { return true; }
    },
    // screen: {},
    addEventListener: function (e, handler) {
        if (e === "load") {
            loadHandlers.push(handler);
        }
        else {
            console.warn("p5.js tried to added an event listener for '".concat(e, "'"));
        }
    },
    removeEventListener: function () { }
};
document = window.document;
screen = window.screen;
// Without a setup function p5.js will not declare global functions
// window.setup = () => {
//   window.noCanvas();
//   window.noLoop();
// };
importScripts("/p5.js");
// Initialize p5.js
for (var _i = 0, loadHandlers_1 = loadHandlers; _i < loadHandlers_1.length; _i++) {
    var handler = loadHandlers_1[_i];
    handler();
}
postMessage({ color: "green" });
onmessage = function (msg) {
    if (msg.data === "getRandomColor") {
        // p5.js places all of its global declarations on window
        postMessage({
            color: window.random([
                "red",
                "limegreen",
                "blue",
                "magenta",
                "yellow",
                "cyan"
            ])
        });
    }
};
var sketch = function (p) {
    var Piece = /** @class */ (function () {
        function Piece(pos, img, i) {
            this.pos = pos;
            this.img = img;
            this.i = i;
            this.width = img.width;
            this.height = img.height;
        }
        Piece.prototype.draw = function () {
            p.image(this.img, this.pos.x, this.pos.y);
        };
        Piece.prototype.hits = function (hitpos) {
            if (hitpos.x > this.pos.x &&
                hitpos.x < this.pos.x + this.width &&
                hitpos.y > this.pos.y &&
                hitpos.y < this.pos.y + this.height) {
                return true;
            }
            return false;
        };
        return Piece;
    }());
    var Puzzle = /** @class */ (function () {
        function Puzzle(x, y, img, side) {
            this.x = x;
            this.y = y;
            this.img = img;
            this.side = side;
            this.isDragging = false;
            this.canPlay = true;
            this.pieces = [];
            this.width = img.width;
            this.height = img.height;
            this.w = this.width / side;
            this.h = this.height / side;
            this.initializeCenterBackground();
            this.placePieces();
        }
        // public setNewRocket(rocketImg2: p55.Image) {
        //   this.img = rocketImg;
        // }
        Puzzle.prototype.placePieces = function () {
            // let ts = p.millis();
            // while(p.millis() - ts < 400) {
            //   console.log('timeout!!!!');
            // }
            console.log(this.img);
            for (var y = 0; y < this.side; y++) {
                for (var x = 0; x < this.side; x++) {
                    var img = p.createImage(this.w, this.h);
                    img.copy(this.img, this.w * x, this.h * y, this.w, this.h, 0, 0, this.w, this.h);
                    var pos = this.randomPos(this.w, this.h);
                    var index = x + y * this.side;
                    this.pieces.push(new Piece(pos, img, index));
                }
            }
        };
        Puzzle.prototype.randomPos = function (marginRight, marginBottom) {
            return p.createVector(p.random(0, p.windowWidth - marginRight), p.random(0, p.windowHeight - marginBottom));
        };
        Puzzle.prototype.draw = function () {
            p.stroke(255, 255 - p.round((255 / listOfNews.length) * countNews), 0);
            p.strokeWeight(10);
            p.rect(this.x - 1, this.y - 1, this.width + 1, this.height + 1);
            p.image(this.hole1, this.x - 1, this.y - 1);
            p.noFill();
            this.pieces.forEach(function (r) { return r.draw(); });
            // stop game
            if (isGameOver) {
                this.canPlay = false;
            }
        };
        Puzzle.prototype.initializeCenterBackground = function () {
            this.hole1 = p.loadImage(getHoleImage());
        };
        Puzzle.prototype.initializeNewRocket = function () {
            this.img = getRocketImage();
        };
        Puzzle.prototype.mousePressed = function (x, y) {
            var _this = this;
            if (this.canPlay) {
                var m_1 = p.createVector(x, y);
                var index_1;
                this.pieces.forEach(function (p, i) {
                    if (p.hits(m_1)) {
                        _this.clickOffset = p5_1["default"].Vector.sub(p.pos, m_1);
                        _this.isDragging = true;
                        _this.dragPiece = p;
                        index_1 = i;
                    }
                });
                if (this.isDragging) {
                    this.putOnTop(index_1);
                }
            }
        };
        Puzzle.prototype.mouseDragged = function (x, y) {
            if (this.isDragging) {
                var m = p.createVector(x, y);
                this.dragPiece.pos.set(m).add(this.clickOffset);
            }
        };
        Puzzle.prototype.mouseReleased = function () {
            if (this.isDragging) {
                this.isDragging = false;
                this.snapTo(this.dragPiece);
                this.checkEndGame();
            }
        };
        Puzzle.prototype.putOnTop = function (index) {
            this.pieces.splice(index, 1);
            this.pieces.push(this.dragPiece);
        };
        Puzzle.prototype.snapTo = function (p) {
            var dx = this.w / 2;
            var dy = this.h / 2;
            var x2 = this.x + this.width;
            var y2 = this.y + this.height;
            for (var y = this.y; y < y2; y += this.h) {
                for (var x = this.x; x < x2; x += this.w) {
                    if (this.shouldSnapToX(p, x, dx, dy, y2)) {
                        p.pos.x = x;
                    }
                    if (this.shouldSnapToY(p, y, dx, dy, x2)) {
                        p.pos.y = y;
                    }
                }
            }
        };
        Puzzle.prototype.shouldSnapToX = function (p, x, dx, dy, y2) {
            return this.isOnGrid(p.pos.x, x, dx) && this.isInsideFrame(p.pos.y, this.y, y2 - this.h, dy);
        };
        Puzzle.prototype.shouldSnapToY = function (p, y, dx, dy, x2) {
            return this.isOnGrid(p.pos.y, y, dy) && this.isInsideFrame(p.pos.x, this.x, x2 - this.w, dx);
        };
        Puzzle.prototype.isOnGrid = function (actualPos, gridPos, d) {
            return actualPos > gridPos - d && actualPos < gridPos + d;
        };
        Puzzle.prototype.isInsideFrame = function (actualPos, frameStart, frameEnd, d) {
            return actualPos > frameStart - d && actualPos < frameEnd + d;
        };
        Puzzle.prototype.checkEndGame = function () {
            var _this = this;
            var nrCorrectNeeded = this.side * this.side;
            var nrCorrect = 0;
            this.pieces.forEach(function (pc) {
                var correctIndex = pc.i;
                var actualIndex = p.round((pc.pos.x - _this.x) / _this.w + (pc.pos.y - _this.y) / _this.h * _this.side);
                // console.log("Indexes: " + actualIndex + ":" + correctIndex);
                if (actualIndex === correctIndex) {
                    nrCorrect += 1;
                }
            });
            if (nrCorrect === nrCorrectNeeded) {
                // decrease news appearance timeout
                if (news_timeout > 5500) {
                    news_timeout = news_timeout * timerDecreaseCoef;
                }
                console.log("Good Job! " + news_timeout);
                //increase news number
                if (countNews > 1) {
                    listOfNews.splice(countNews - 1, 1);
                    countNews--;
                }
                // increase rockets number
                if (rocketsCompleted < totalRockets) {
                    rocketsCompleted++;
                    if (rocketsCompleted == totalRockets) {
                        isGameOver = true;
                        isWin = true;
                    }
                }
                // load new rocket
                this.pieces = [];
                this.initializeCenterBackground();
                this.initializeNewRocket();
                this.placePieces();
                this.canPlay = true;
                console.log("Rockets completed: " + rocketsCompleted);
                scoreElement.remove();
                scoreElement = p.createElement("h1", rocketsCompleted + "/" + totalRockets);
            }
            else {
                console.log("Right places: " + nrCorrect);
            }
        };
        return Puzzle;
    }());
    var puzzle;
    var imgCb;
    var img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20;
    var winImg, loseImg;
    var listOfNews = [];
    var countNews;
    var news_timeout;
    var rocketsCompleted;
    var totalRockets;
    var timerDecreaseCoef;
    var scoreElement;
    var alphaNewNews;
    var timer;
    var isGameOver;
    var isWin;
    var triggerNews;
    var rockets = [];
    var rocketBgs = [];
    p.preload = function () {
        imgCb = p.loadImage("https://proiectb.org/su/rocket1.jpg");
    };
    p.setup = function () {
        news_timeout = 10000; // originally 15000
        alphaNewNews = 0;
        isGameOver = false;
        isWin = false;
        timer = new /** @class */ (function () {
            function Timer() {
                this.minutes = 0;
                this.seconds = 0;
                this.millis = 0;
            }
            return Timer;
        }());
        p.createCanvas(p.windowWidth, p.windowHeight);
        totalRockets = 4;
        timerDecreaseCoef = 0.8; // originally 0.95
        rocketsCompleted = 0;
        scoreElement = p.createElement("h1", rocketsCompleted + "/" + totalRockets);
        img1 = p.loadImage('https://proiectb.org/su/img1.JPG');
        img2 = p.loadImage('https://proiectb.org/su/img2.JPG');
        img3 = p.loadImage('https://proiectb.org/su/img3.JPG');
        img4 = p.loadImage('https://proiectb.org/su/img4.JPG');
        img5 = p.loadImage('https://proiectb.org/su/img5.JPG');
        img6 = p.loadImage('https://proiectb.org/su/img6.JPG');
        img7 = p.loadImage('https://proiectb.org/su/img7.JPG');
        img8 = p.loadImage('https://proiectb.org/su/img8.JPG');
        // img9 = p.loadImage('https://proiectb.org/su/img9.JPG');
        // img10 = p.loadImage('https://proiectb.org/su/img10.JPG');
        // img11 = p.loadImage('https://proiectb.org/su/img11.JPG');
        // img12 = p.loadImage('https://proiectb.org/su/img12.JPG');
        // img13 = p.loadImage('https://proiectb.org/su/img13.JPG');
        // img14 = p.loadImage('https://proiectb.org/su/img14.JPG');
        // img15 = p.loadImage('https://proiectb.org/su/img15.JPG');
        // img16 = p.loadImage('https://proiectb.org/su/img16.JPG');
        // img17 = p.loadImage('https://proiectb.org/su/img17.JPG');
        // img18 = p.loadImage('https://proiectb.org/su/img18.JPG');
        // img19 = p.loadImage('https://proiectb.org/su/img19.JPG');
        // img20 = p.loadImage('https://proiectb.org/su/img20.JPG');
        winImg = p.loadImage('https://proiectb.org/su/win.png');
        loseImg = p.loadImage('https://proiectb.org/su/lose.png');
        countNews = 2;
        listOfNews = [img1, img2, img3, img4, img5, img6, img7, img8,
            // img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20, img15, img16, img17, img18, img19, img20
        ];
        rocketBgs = ["https://proiectb.org/su/rocket1_bg.jpg",
            "https://proiectb.org/su/rocket2_bg.jpg",
            "https://proiectb.org/su/rocket3_bg.jpg",
            "https://proiectb.org/su/rocket4_bg.jpg",
            // "https://proiectb.org/su/rocket1_bg.jpg",
            // "https://proiectb.org/su/rocket2_bg.jpg",
            // "https://proiectb.org/su/rocket3_bg.jpg",
            // "https://proiectb.org/su/rocket4_bg.jpg",
            // "https://proiectb.org/su/rocket1_bg.jpg",
            // "https://proiectb.org/su/rocket2_bg.jpg",
            // "https://proiectb.org/su/rocket3_bg.jpg",
            // "https://proiectb.org/su/rocket4_bg.jpg",
            // "https://proiectb.org/su/rocket1_bg.jpg",
            // "https://proiectb.org/su/rocket2_bg.jpg",
            // "https://proiectb.org/su/rocket3_bg.jpg",
            // "https://proiectb.org/su/rocket4_bg.jpg",
            // "https://proiectb.org/su/rocket1_bg.jpg",
            // "https://proiectb.org/su/rocket2_bg.jpg",
            // "https://proiectb.org/su/rocket3_bg.jpg",
            // "https://proiectb.org/su/rocket4_bg.jpg",
            // "https://proiectb.org/su/rocket1_bg.jpg",
            // "https://proiectb.org/su/rocket2_bg.jpg",
            // "https://proiectb.org/su/rocket3_bg.jpg",
            // "https://proiectb.org/su/rocket4_bg.jpg",
        ];
        rockets = [p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            p.loadImage("https://proiectb.org/su/rocket4.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket4.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket4.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket4.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket4.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket1.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket2.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket3.jpg"),
            // p.loadImage("https://proiectb.org/su/rocket4.jpg")
        ];
        var x0 = p.windowWidth / 2 - imgCb.width / 2;
        var y0 = p.windowHeight / 2 - imgCb.height / 2;
        puzzle = new Puzzle(x0, y0, imgCb, 3);
    };
    p.draw = function () {
        p.background(123);
        // display timer
        p.fill(255, 255 - p.round((255 / listOfNews.length) * countNews), 0);
        p.noStroke();
        p.textSize(44);
        p.text(timer.minutes + ":" + timer.seconds + ":" + timer.millis, p.windowWidth - 200, 30, 70, 80);
        // while game NOT OVER.
        if (!isGameOver) {
            timer.minutes = p.floor(p.millis() / 60000);
            timer.seconds = p.floor((p.millis() / 1000) % 60);
            timer.millis = p.millis() % 1000;
            // console.log(news_timeout + ":" + p.millis() % news_timeout);
            // mechanism to trigger news onyl once per cycle of timeout.
            var currentTimeout = p.millis() % news_timeout;
            if (triggerNews && currentTimeout > news_timeout - 500) {
                console.log("TRIGGER increase news");
                if (countNews < listOfNews.length) {
                    countNews++;
                    // reset new news alpha
                    alphaNewNews = 0;
                    // game over if max news reached.
                    if (countNews == listOfNews.length) {
                        isGameOver = true;
                    }
                }
                triggerNews = false;
            }
            // reset trigger when timout starts from 0
            if (currentTimeout > 0 && currentTimeout < 500) {
                triggerNews = true;
            }
        }
        // increase new news alpha
        if (alphaNewNews < 255) {
            alphaNewNews++;
        }
        var bottomOffset = 50;
        //draw new news
        if (countNews > 1) { // hack workaround ??
            p.tint(255, alphaNewNews);
            var newIndex = countNews - 1;
            bottomOffset += listOfNews[newIndex].height;
            p.image(listOfNews[newIndex], 50, p.height - bottomOffset);
            bottomOffset += 50;
            p.tint(255, 255);
        }
        // draw news
        for (var i = countNews - 2; i > 0; i--) {
            bottomOffset += listOfNews[i].height;
            p.image(listOfNews[i], 50, p.height - bottomOffset);
            bottomOffset += 50;
        }
        puzzle.draw();
        if (isGameOver) { //GAME OVER
            p.fill(p.color(0, 0, 0, 170));
            p.rect(0, 0, p.windowWidth, p.windowHeight);
            if (isWin) {
                p.image(winImg, this.windowWidth / 2 - winImg.width / 2, this.windowHeight / 2 - winImg.height / 2);
                p.fill(p.color(0, 255, 70, 255));
                p.text(timer.minutes + ":" + timer.seconds + ":" + timer.millis, p.windowWidth / 2 - 70, 130, 70, 80);
            }
            else {
                p.image(loseImg, this.windowWidth / 2 - loseImg.width / 2, this.windowHeight / 2 - loseImg.height / 2);
            }
        }
    };
    p.mousePressed = function () {
        puzzle.mousePressed(p.mouseX, p.mouseY);
    };
    p.mouseDragged = function () {
        puzzle.mouseDragged(p.mouseX, p.mouseY);
    };
    p.mouseReleased = function () {
        puzzle.mouseReleased();
    };
    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
    p.keyPressed = function () {
        if (p.keyCode === p.LEFT_ARROW) {
            listOfNews.splice(countNews - 1, 1);
            countNews--;
            console.log('countNews=' + countNews);
        }
        else if (p.keyCode === p.RIGHT_ARROW) {
            if (countNews < listOfNews.length) {
                countNews++;
            }
            console.log('countNews=' + countNews);
        }
    };
    function getHoleImage() {
        return rocketBgs[rocketsCompleted];
    }
    function getRocketImage() {
        return rockets[rocketsCompleted];
    }
};
new p5_1["default"](sketch);
