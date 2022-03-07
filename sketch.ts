// puzzle https://codepen.io/DonKarlssonSan/pen/vgKoyE

// @ts-ignore
import p55 from 'p5';


const sketch = function(p) {

  class Piece {
    private width: any;
    private height: any;

    constructor (public pos: p55.Vector, private img: p55.Image, public i: number) {
      this.width = img.width;
      this.height = img.height;
    }

    draw() {
      p.image(this.img, this.pos.x, this.pos.y);
    }

    hits(hitpos: p55.Vector) {
      if(hitpos.x > this.pos.x &&
          hitpos.x < this.pos.x + this.width &&
          hitpos.y > this.pos.y &&
          hitpos.y < this.pos.y + this.height) {
        return true;
      }
      return false;
    }
  }

  class Puzzle {
    private pieces: Array<Piece>;
    private dragPiece: Piece;
    private isDragging: boolean = false;
    private canPlay: boolean = true;
    private clickOffset: p55.Vector;
    private w: number;
    private h: number;
    private width: any;
    private height: any;
    private hole1: any;

    constructor(
      private x: number,
      private y: number,
      private img: p55.Image,
      private side: number) {

      this.pieces = [];
      this.width = img.width;
      this.height = img.height;
      this.w = this.width/side;
      this.h = this.height/side;

      this.initializeCenterBackground();
      this.placePieces();
    }

    // public setNewRocket(rocketImg2: p55.Image) {
    //   this.img = rocketImg;
    // }

    private placePieces() {
      // let ts = p.millis();
      // while(p.millis() - ts < 400) {
      //   console.log('timeout!!!!');
      // }
      console.log(this.img);
      for(let y = 0; y < this.side; y++) {
        for(let x = 0; x < this.side; x++) {
          let img = p.createImage(this.w, this.h);
          img.copy(this.img, this.w*x, this.h*y, this.w, this.h, 0, 0, this.w, this.h);
          let pos = this.randomPos(this.w, this.h);
          let index = x + y * this.side;
          this.pieces.push(new Piece(pos, img, index));
        }
      }
    }

    private randomPos(marginRight: number, marginBottom: number) {
      return p.createVector(
          p.random(0, p.windowWidth-marginRight),
          p.random(0, p.windowHeight-marginBottom));
    }

    public draw() {
      p.stroke(255, 255 - p.round((255/listOfNews.length) * countNews), 0);
      p.strokeWeight(10);
      p.rect(this.x-1, this.y-1, this.width+1, this.height+1);

      p.image(this.hole1, this.x-1, this.y-1);
      p.noFill();
      this.pieces.forEach(r => r.draw());

      // stop game
      if (isGameOver) {
        this.canPlay = false;
      }
    }

    public initializeCenterBackground() {
      this.hole1 = p.loadImage(getHoleImage());
    }

    public initializeNewRocket() {
      this.img = getRocketImage();
    }

    public mousePressed(x: number, y: number) {
      if(this.canPlay) {
        let m = p.createVector(x, y);
        let index: number;
        this.pieces.forEach((p, i) => {
          if(p.hits(m)) {
            this.clickOffset = p55.Vector.sub(p.pos, m);
            this.isDragging = true;
            this.dragPiece = p;
            index = i;
          }
        });
        if(this.isDragging) {
          this.putOnTop(index);
        }
      }
    }

    public mouseDragged(x: number, y: number) {
      if(this.isDragging) {
        let m = p.createVector(x, y);
        this.dragPiece.pos.set(m).add(this.clickOffset);
      }
    }

    public mouseReleased() {
      if(this.isDragging) {
        this.isDragging = false;
        this.snapTo(this.dragPiece);
        this.checkEndGame();
      }
    }

    private putOnTop(index: number) {
      this.pieces.splice(index, 1);
      this.pieces.push(this.dragPiece);
    }

    public snapTo(p: Piece) {
      let dx = this.w/2;
      let dy = this.h/2;
      let x2 = this.x + this.width;
      let y2 = this.y + this.height;
      for(let y = this.y; y < y2; y += this.h) {
        for(let x = this.x; x < x2; x += this.w) {
          if(this.shouldSnapToX(p, x, dx, dy, y2)) {
            p.pos.x = x;
          }
          if(this.shouldSnapToY(p, y, dx, dy, x2)) {
            p.pos.y = y;
          }
        }
      }
    }

    private shouldSnapToX(p, x, dx, dy, y2) {
      return this.isOnGrid(p.pos.x, x, dx) && this.isInsideFrame(p.pos.y, this.y, y2-this.h, dy)
    }

    private shouldSnapToY(p, y, dx, dy, x2) {
      return this.isOnGrid(p.pos.y, y, dy) && this.isInsideFrame(p.pos.x, this.x, x2-this.w, dx)
    }

    private isOnGrid(actualPos, gridPos, d) {
      return actualPos > gridPos - d && actualPos < gridPos + d;
    }

    private isInsideFrame(actualPos, frameStart, frameEnd, d) {
      return actualPos > frameStart - d && actualPos < frameEnd + d;
    }

    private checkEndGame() {
      let nrCorrectNeeded = this.side * this.side;
      let nrCorrect = 0;
      this.pieces.forEach(pc => {
        let correctIndex = pc.i;
        let actualIndex = p.round((pc.pos.x - this.x)/this.w + (pc.pos.y - this.y)/this.h * this.side);
        // console.log("Indexes: " + actualIndex + ":" + correctIndex);
        if(actualIndex === correctIndex) {
          nrCorrect += 1;
        }
      });
      if(nrCorrect === nrCorrectNeeded) {

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
          rocketsCompleted ++;
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

      } else {
        console.log("Right places: " + nrCorrect);
      }
    }
}

let puzzle: Puzzle;
let imgCb: p55.Image;

let img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20: p55.Image;
let winImg, loseImg: p55.Image;
let listOfNews = [];
let countNews: number;

let news_timeout: number;
let rocketsCompleted: number;
let totalRockets: number;
let timerDecreaseCoef: number;

let scoreElement: any;
let alphaNewNews: number;

let timer: any;
let isGameOver: boolean;
let isWin: boolean;

let triggerNews: boolean;

let rockets = [];
let rocketBgs = [];

  p.preload = function() {
    imgCb = p.loadImage("https://proiectb.org/su/rocket1.jpg");
  }

  p.setup = function() {

    news_timeout = 10000; // originally 15000
    alphaNewNews = 0;
    isGameOver = false;
    isWin = false;
    timer = new class Timer{minutes: number = 0; seconds: number = 0; millis: number = 0;};

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

    let x0 = p.windowWidth/2 - imgCb.width/2;
    let y0 = p.windowHeight/2 - imgCb.height/2;
    puzzle = new Puzzle(x0, y0, imgCb, 3);

  };

  p.draw = function() {

    p.background(123);

    // display timer
    p.fill(255, 255 - p.round((255/listOfNews.length) * countNews), 0);
    p.noStroke();
    p.textSize(44);
    p.text(timer.minutes + ":" + timer.seconds + ":" + timer.millis,
        p.windowWidth - 200, 30, 70, 80);

    // while game NOT OVER.
    if (!isGameOver) {
      timer.minutes = p.floor(p.millis() / 60000);
      timer.seconds = p.floor((p.millis() / 1000) % 60);
      timer.millis = p.millis() % 1000;

      // console.log(news_timeout + ":" + p.millis() % news_timeout);

      // mechanism to trigger news onyl once per cycle of timeout.
      let currentTimeout = p.millis() % news_timeout;
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

    let bottomOffset = 50;
    //draw new news
    if (countNews > 1) { // hack workaround ??
      p.tint(255, alphaNewNews);
      let newIndex: number = countNews - 1;
      bottomOffset += listOfNews[newIndex].height;
      p.image(listOfNews[newIndex], 50, p.height - bottomOffset);
      bottomOffset += 50;
      p.tint(255, 255);
    }

    // draw news
    for (let i = countNews-2; i > 0; i--) {
      bottomOffset += listOfNews[i].height;
      p.image(listOfNews[i], 50, p.height - bottomOffset);
      bottomOffset += 50;
    }

    puzzle.draw();

    if (isGameOver) { //GAME OVER
      p.fill(p.color(0, 0, 0, 170));
      p.rect(0, 0, p.windowWidth, p.windowHeight);
      if (isWin) {
        p.image(winImg, this.windowWidth / 2 - winImg.width / 2,
            this.windowHeight / 2 - winImg.height / 2);

        p.fill(p.color(0, 255, 70, 255));
        p.text(timer.minutes + ":" + timer.seconds + ":" + timer.millis,
            p.windowWidth/2 - 70, 130, 70, 80);
      } else {
        p.image(loseImg, this.windowWidth / 2 - loseImg.width / 2,
            this.windowHeight / 2 - loseImg.height / 2);
      }
    }


  };

  p.mousePressed = function() {
    puzzle.mousePressed(p.mouseX, p.mouseY);
  }

  p.mouseDragged = function() {
    puzzle.mouseDragged(p.mouseX, p.mouseY);
  }

  p.mouseReleased = function() {
    puzzle.mouseReleased();
  }

  p.windowResized = function() {
    resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.keyPressed = function() {
      if (p.keyCode === p.LEFT_ARROW) {
        listOfNews.splice(countNews-1, 1)
        countNews--;
        console.log('countNews=' + countNews);
      } else if (p.keyCode === p.RIGHT_ARROW) {
        if (countNews < listOfNews.length) {
          countNews++;
        }
        console.log('countNews=' + countNews);
      }
  }

  function getHoleImage() {
    return rocketBgs[rocketsCompleted];
  }

  function getRocketImage() {
    return rockets[rocketsCompleted];
  }
};

new p55(sketch);