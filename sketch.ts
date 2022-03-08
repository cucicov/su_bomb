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
      // console.log(this.img);
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

        // console.log("Good Job! " + news_timeout);

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

        // console.log("Rockets completed: " + rocketsCompleted);
        scoreElement.remove();
        scoreElement = p.createElement("h1", rocketsCompleted + "/" + totalRockets);

      } else {
        // console.log("Right places: " + nrCorrect);
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
  }

  p.setup = function() {


  };

  p.draw = function() {


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
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.keyPressed = function() {
      if (p.keyCode === p.LEFT_ARROW) {
        listOfNews.splice(countNews-1, 1)
        countNews--;
        // console.log('countNews=' + countNews);
      } else if (p.keyCode === p.RIGHT_ARROW) {
        if (countNews < listOfNews.length) {
          countNews++;
        }
        // console.log('countNews=' + countNews);
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