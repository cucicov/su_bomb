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

      console.log("constructor Puzzle");
      this.hole1 = p.loadImage("https://proiectb.org/su/rocket1.png");

      this.placePieces();
    }

    private placePieces() {
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
      p.rect(this.x-1, this.y-1, this.width+1, this.height+1);

      p.image(this.hole1, this.x-1, this.y-1);
      p.noFill();
      this.pieces.forEach(r => r.draw());
    }

    public mousePressed(x: number, y: number) {
      console.log("mousePressed");
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
      console.log("mouseDragged");
      if(this.isDragging) {
        let m = p.createVector(x, y);
        this.dragPiece.pos.set(m).add(this.clickOffset);
      }
    }

    public mouseReleased() {
      console.log("mouseReleased");
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
        console.log("Indexes: " + actualIndex + ":" + correctIndex);
        if(actualIndex === correctIndex) {
          nrCorrect += 1;
        }
      });
      if(nrCorrect === nrCorrectNeeded) {
        console.log("Good Job! " + news_timeout);

        // decrease news appearance timeout
        if (news_timeout > 3500) {
          news_timeout = news_timeout * 0.9;
        }
        if (countImages > 1) {
          countImages--;
          if (rocketsCompleted < totalRockets) {
            rocketsCompleted ++;
          }
        }
        this.pieces = [];
        this.hole1 = p.loadImage("https://proiectb.org/su/rocket1.png");
        this.placePieces();
        this.canPlay = true;

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
let listOfImages = [];
let countImages: number;

let news_timeout: number;
let rocketsCompleted: number;
let totalRockets: number;

let scoreElement: any;
let alphaNewNews: number;

// function preload() {
//   imgCb = loadImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/Exit_planet_dust_album_cover.jpg");
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   let x0 = windowWidth/2 - imgCb.width/2;
//   let y0 = windowHeight/2 - imgCb.height/2;
//   puzzle = new Puzzle(x0, y0, imgCb, 3);
// }

// function draw() {
//   background("white");
//   puzzle.draw();
// }

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
        listOfImages.splice(countImages-1, 1)
        countImages--;
        console.log('countImages=' + countImages);
        console.log(listOfImages);
      } else if (p.keyCode === p.RIGHT_ARROW) {
        if (countImages < listOfImages.length) {
          countImages++;
        }
        console.log('countImages=' + countImages);
      }
  }

  //
  // const CELL_COUNT = 4;
  //
  // const rect = (x: number, y: number, width: number, color: p55.Color) => {
  //
  //   const cellWidth = width / CELL_COUNT;
  //
  //   for (let col=0; col<CELL_COUNT; col++) {
  //     for (let row=0; row<CELL_COUNT; row++) {
  //       const alpha = p.noise(row, col) * 255;
  //       color.setAlpha(alpha);
  //       p.fill(color);
  //       p.rect(x + cellWidth * row, y + cellWidth * col, cellWidth, cellWidth);
  //     }
  //   }
  // }

  p.preload = function() {
    imgCb = p.loadImage("https://proiectb.org/su/rocket1.png");
  }

  p.setup = function() {

    news_timeout = 15000;

    p.createCanvas(p.windowWidth, p.windowHeight);
    totalRockets = 24;
    rocketsCompleted = 0;
    // p.noLoop();
    // p.noStroke();
    scoreElement = p.createElement("h1", rocketsCompleted + "/" + totalRockets);

    img1 = p.loadImage('https://proiectb.org/su/img1.JPG');
    img2 = p.loadImage('https://proiectb.org/su/img2.JPG');
    img3 = p.loadImage('https://proiectb.org/su/img3.JPG');
    img4 = p.loadImage('https://proiectb.org/su/img4.JPG');
    img5 = p.loadImage('https://proiectb.org/su/img5.JPG');
    img6 = p.loadImage('https://proiectb.org/su/img6.JPG');
    img7 = p.loadImage('https://proiectb.org/su/img7.JPG');
    img8 = p.loadImage('https://proiectb.org/su/img8.JPG');
    img9 = p.loadImage('https://proiectb.org/su/img9.JPG');
    img10 = p.loadImage('https://proiectb.org/su/img10.JPG');
    img11 = p.loadImage('https://proiectb.org/su/img11.JPG');
    img12 = p.loadImage('https://proiectb.org/su/img12.JPG');
    img13 = p.loadImage('https://proiectb.org/su/img13.JPG');
    img14 = p.loadImage('https://proiectb.org/su/img14.JPG');
    img15 = p.loadImage('https://proiectb.org/su/img15.JPG');
    img16 = p.loadImage('https://proiectb.org/su/img16.JPG');
    img17 = p.loadImage('https://proiectb.org/su/img17.JPG');
    img18 = p.loadImage('https://proiectb.org/su/img18.JPG');
    img19 = p.loadImage('https://proiectb.org/su/img19.JPG');
    img20 = p.loadImage('https://proiectb.org/su/img20.JPG');

    countImages = 2;
    listOfImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20];

    let x0 = p.windowWidth/2 - imgCb.width/2;
    let y0 = p.windowHeight/2 - imgCb.height/2;
    puzzle = new Puzzle(x0, y0, imgCb, 3);

  };

  p.draw = function() {

    // p.background(0);
    // const color = p.color('green');
    // rect(100, 100, 240, color);

    p.background(123);

    if (p.millis() % news_timeout > news_timeout - 10) {
      console.log("TRIGGER increase news");
      if (countImages < listOfImages.length) {
        countImages++;
      }
    }

    let bottomOffset = 50;

    // tint(255, 126);

    //draw new news
    let newIndex: number = countImages - 1;
    bottomOffset += listOfImages[newIndex].height;
    p.image(listOfImages[newIndex], 50, p.height - bottomOffset);
    bottomOffset += 50;

    // draw news
    for (let i = countImages-2; i > 0; i--) {
      bottomOffset += listOfImages[i].height;
      p.image(listOfImages[i], 50, p.height - bottomOffset);
      bottomOffset += 50;
    }

    // p.background("white");
    puzzle.draw();


  };
};

new p55(sketch);


// img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20;
// listOfImages;
// countImages;
//
// function setup() {
//   createCanvas(windowWidth, windowHeight);
//
//   img1 = loadImage('assets/img1.JPG');
//   img2 = loadImage('assets/img2.JPG');
//   img3 = loadImage('assets/img3.JPG');
//   img4 = loadImage('assets/img4.JPG');
//   img5 = loadImage('assets/img5.JPG');
//   img6 = loadImage('assets/img6.JPG');
//   img7 = loadImage('assets/img7.JPG');
//   img8 = loadImage('assets/img8.JPG');
//   img9 = loadImage('assets/img9.JPG');
//   img10 = loadImage('assets/img10.JPG');
//   img11 = loadImage('assets/img11.JPG');
//   img12 = loadImage('assets/img12.JPG');
//   img13 = loadImage('assets/img13.JPG');
//   img14 = loadImage('assets/img14.JPG');
//   img15 = loadImage('assets/img15.JPG');
//   img16 = loadImage('assets/img16.JPG');
//   img17 = loadImage('assets/img17.JPG');
//   img18 = loadImage('assets/img18.JPG');
//   img19 = loadImage('assets/img19.JPG');
//   img20 = loadImage('assets/img20.JPG');
//
//   countImages = 1;
//   listOfImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20];
// }
//
// function draw() {
//   background(220);
//
//   bottomOffset = 50;
//   for (i = countImages-1; i > 0; i--) {
//     bottomOffset += listOfImages[i].height;
//     image(listOfImages[i], 50, height - bottomOffset);
//     bottomOffset += 50;
//   }
//
// }
//
// function mousePressed(event) {
//
// }
//
// function keyPressed() {
//   if (keyCode === LEFT_ARROW) {
//     listOfImages.splice(countImages-1, 1)
//     countImages--;
//     console.log('countImages=' + countImages);
//     console.log(listOfImages);
//   } else if (keyCode === RIGHT_ARROW) {
//     if (countImages < listOfImages.length) {
//       countImages++;
//     }
//     console.log('countImages=' + countImages);
//   }
// }
//
// /*
//   Johan Karlsson (DonKarlssonSan)
// */
//
//
// class Piece {
//   constructor (public pos: p55.Vector, private img: p55.Image, public i: number) {
//     this.width = img.width;
//     this.height = img.height;
//   }
//
//   draw() {
//     image(this.img, this.pos.x, this.pos.y);
//   }
//
//   hits(hitpos: p55.Vector) {
//     if(hitpos.x > this.pos.x &&
//         hitpos.x < this.pos.x + this.width &&
//         hitpos.y > this.pos.y &&
//         hitpos.y < this.pos.y + this.height) {
//       return true;
//     }
//     return false;
//   }
// }
//
//
// class Puzzle {
//   private pieces: Array<Piece>;
//   private dragPiece: Piece;
//   private isDragging: boolean = false;
//   private canPlay: boolean = true;
//   private clickOffset: p55.Vector;
//   private w: number;
//   private h: number;
//
//   constructor(
//       private x: number,
//   private y: number,
//   private img: p55.Image,
//   private side: number) {
//
//   this.pieces = [];
//   this.width = img.width;
//   this.height = img.height;
//   this.w = this.width/side;
//   this.h = this.height/side;
//
//   this.placePieces();
// }
//
// private placePieces() {
//   for(let y = 0; y < this.side; y++) {
//     for(let x = 0; x < this.side; x++) {
//       let img = createImage(this.w, this.h);
//       img.copy(this.img, this.w*x, this.h*y, this.w, this.h, 0, 0, this.w, this.h);
//       let pos = this.randomPos(this.w, this.h);
//       let index = x + y * this.side;
//       this.pieces.push(new Piece(pos, img, index));
//     }
//   }
// }
//
// private randomPos(marginRight: number, marginBottom: number) {
//   return createVector(
//       random(0, windowWidth-marginRight),
//       random(0, windowHeight-marginBottom));
// }
//
// public draw() {
//   rect(this.x-1, this.y-1, this.width+1, this.height+1);
//   noFill();
//   this.pieces.forEach(r => r.draw());
// }
//
// public mousePressed(x: number, y: number) {
//   if(this.canPlay) {
//     let m = createVector(x, y);
//     let index: number;
//     this.pieces.forEach((p, i) => {
//       if(p.hits(m)) {
//         this.clickOffset = p55.Vector.sub(p.pos, m);
//         this.isDragging = true;
//         this.dragPiece = p;
//         index = i;
//       }
//     });
//     if(this.isDragging) {
//       this.putOnTop(index);
//     }
//   }
// }
//
// public mouseDragged(x: number, y: number) {
//   if(this.isDragging) {
//     let m = createVector(x, y);
//     this.dragPiece.pos.set(m).add(this.clickOffset);
//   }
// }
//
// public mouseReleased() {
//   if(this.isDragging) {
//     this.isDragging = false;
//     this.snapTo(this.dragPiece);
//     this.checkEndGame();
//   }
// }
//
// private putOnTop(index: number) {
//   this.pieces.splice(index, 1);
//   this.pieces.push(this.dragPiece);
// }
//
// public snapTo(p: Piece) {
//   let dx = this.w/2;
//   let dy = this.h/2;
//   let x2 = this.x + this.width;
//   let y2 = this.y + this.height;
//   for(let y = this.y; y < y2; y += this.h) {
//     for(let x = this.x; x < x2; x += this.w) {
//       if(this.shouldSnapToX(p, x, dx, dy, y2)) {
//         p.pos.x = x;
//       }
//       if(this.shouldSnapToY(p, y, dx, dy, x2)) {
//         p.pos.y = y;
//       }
//     }
//   }
// }
//
// private shouldSnapToX(p, x, dx, dy, y2) {
//   return this.isOnGrid(p.pos.x, x, dx) && this.isInsideFrame(p.pos.y, this.y, y2-this.h, dy)
// }
//
// private shouldSnapToY(p, y, dx, dy, x2) {
//   return this.isOnGrid(p.pos.y, y, dy) && this.isInsideFrame(p.pos.x, this.x, x2-this.w, dx)
// }
//
// private isOnGrid(actualPos, gridPos, d) {
//   return actualPos > gridPos - d && actualPos < gridPos + d;
// }
//
// private isInsideFrame(actualPos, frameStart, frameEnd, d) {
//   return actualPos > frameStart - d && actualPos < frameEnd + d;
// }
//
// private checkEndGame() {
//   let nrCorrectNeeded = this.side * this.side;
//   let nrCorrect = 0;
//   this.pieces.forEach(p => {
//     let correctIndex = p.i;
//     let actualIndex = (p.pos.x - this.x)/this.w + (p.pos.y - this.y)/this.h * this.side;
//     if(actualIndex === correctIndex) {
//       nrCorrect += 1;
//     }
//   });
//   if(nrCorrect === nrCorrectNeeded) {
//     let h1 = createElement("h1", "Good Job!");
//     this.canPlay = false;
//   } else {
//     console.log("Right places: " + nrCorrect);
//   }
// }
// }
//
// let puzzle: Puzzle;
// let imgCb: p55.Image;
//
// function preload() {
//   imgCb = loadImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/Exit_planet_dust_album_cover.jpg");
// }
//
// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   let x0 = windowWidth/2 - imgCb.width/2;
//   let y0 = windowHeight/2 - imgCb.height/2;
//   puzzle = new Puzzle(x0, y0, imgCb, 3);
// }
//
// function draw() {
//   background("white");
//   puzzle.draw();
// }
//
// function mousePressed() {
//   puzzle.mousePressed(mouseX, mouseY);
// }
//
// function mouseDragged() {
//   puzzle.mouseDragged(mouseX, mouseY);
// }
//
// function mouseReleased() {
//   puzzle.mouseReleased();
// }
//
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }