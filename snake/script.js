// namespace
var Game = Game || {};
var Keyboard = Keyboard || {};
var Component = Component || {};

// Keyboard map
Keyboard.Keymap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

// Keyboard events
Keyboard.ControllerEvents = function(){
  // setts
  var self = this;
  this.pressKey = null;
  this.keymap = Keyboard.Keymap;

  // keydown events
  document.onkeydown = function(event){
    self.pressKey = event.which;
  };

  // get key
  this.getKey = function(){
    return this.keymap[this.pressKey];
  };
};

// Game component stage

Component.Stage = function(canvas, conf){
  // sets
  this.keyEvent = new Keyboard.ControllerEvents();
  this.width = canvas.width;
  this.height = canvas.height;
  this.length = [];
  this.food = {};
  this.score = 0;
  this.direction = 'right';
  this.conf = {
    cw : 10,
    size : 5,
    fps : 1000
  };

  // merge conf
  if(typeof conf == 'object'){
    for(var key in conf){
      if(conf.hasOwnProperty(key)){
        this.conf[key] = conf[key];
      }
    }
  }
};

// the snake
Component.Snake = function(canvas, conf){
  // game stage
  this.stage = new Component.Stage(canvas, conf);
  // initialize Snake
  this.initSnake = function(){
    // snake conf size
    for(var i=0; i<this.stage.conf.size; i++){
      // add length to Snake
      this.stage.length.push({x:i,y:0});
    }
  };

  // call initSnake
  this.initSnake();
  // init food
  this.initFood = function(){
    // add the food
    this.stage.food = {
      x: Math.round(Math.random()*(this.stage.width - this.stage.conf.cw)/this.stage.conf.cw),
      y: Math.round(Math.random()*(this.stage.height - this.stage.conf.cw)/this.stage.conf.cw),
    };
  };

  // init food
  this.initFood();

  // restart Stage
  this.restart = function(){
    this.stage.length = [];
    this.stage.food = {};
    this.stage.score = 0;
    this.stage.direction = 'right';
    this.stage.keyEvent.pressKey = null;
    this.initSnake();
    this.initFood();
  };
};

// game draw
Game.Draw = function(context, snake){
  // draw Stage
  this.drawStage = function(){
    // check keypress and set direction
    var keyPress = snake.stage.keyEvent.getKey();
    if(typeof(keyPress) != 'undefined'){
      snake.stage.direction = keyPress;
    }

    // draw black Stage
    context.fillStyle = "black";
    context.fillRect(0,0, snake.stage.width, snake.stage.height);

    // snake position
    var nx = snake.stage.length[0].x;
    var ny = snake.stage.length[0].y;

    // add position by stage direction
    switch (snake.stage.direction) {
      case 'right':
        nx++;
        break;
      case 'left':
        nx--;
        break;
      case 'up':
        ny--;
        break;
      case 'down':
        ny++
        break;
    }

    // check collision
    if(this.collision(nx, ny) == true){
      snake.restart();
      return;
    }

    // add one for snake self collision
    // if(this.collision(nx, ny) == true)[
    //   snake.restart();
    //   return;
    // ]

    // logic for food
    if(nx == snake.stage.food.x && ny == snake.stage.food.y){
      var tail = {x:nx, y:ny};
      snake.stage.score++;
      snake.initFood();
    }
    else{
      var tail = snake.stage.length.pop();
      tail.x = nx;
      tail.y = ny;
    }
    snake.stage.length.unshift(tail);

    // draw Snake
    for(var i=0; i<snake.stage.length.length; i++){
      var cell = snake.stage.length[i];
      this.drawCell(cell.x, cell.y);
    }

    // draw food
    this.drawCell(snake.stage.food.x, snake.stage.food.y);

    // draw score
    context.fillText('Score: ' + snake.stage.score, 5, (snake.stage.height - 5));
  };

  // draw cell
  this.drawCell = function(x,y){
    context.fillStyle = 'white';
    context.beginPath();
    context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2*Math.PI, false);
    context.fill();
  };

  // check wall collision
  this.collision = function(nx,ny){
    if(nx == -1 || nx == (snake.stage.width / snake.stage.conf.cw) || ny == -1 || ny == (snake.stage.height / snake.stage.conf.cw)){
      return true;
    }
    // check for self collision
    // else if(nx == 0 || nx == (snake.stage.width / snake.stage.conf.cw) || ny == 0 || ny == (snake.stage.height / snake.stage.conf.cw)){
    //   return true;
    // }
    return false;
  }
};

// game Snake

Game.Snake = function(elementId, conf){
  var canvas = document.getElementById(elementId);
  var context = canvas.getContext("2d");
  var snake = new Component.Snake(canvas, conf);
  var gameDraw = new Game.Draw(context, snake);

  // game interval
  setInterval(function() {gameDraw.drawStage();}, snake.stage.conf.fps);
};

// window load
window.onload = function(){
  var snake = new Game.Snake('stage', {fps: 100, size: 4});
};
