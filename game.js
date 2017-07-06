(function(){
    function Game(canvasId, config){
        if(Game.instance_){
            return this;
        }
        Game.instance_ = this;

        this.canvas = document.getElementById(canvasId);
        this.canvasCtx = this.canvas.getContext('2d');

        this.config = config || Game.config;

        this.canvas.width = this.config.WIDTH;
        this.canvas.height = this.config.HEIGHT;

        this.running = false;

        this.frameReq = null;

        this.init();
    };

    window['Game'] = Game;

    Game.config = {
        WIDTH: 400,
        HEIGHT: 400,
        GRIDSIZE: 10,
        TILECOUNTX: 40,
        TILECOUNTY: 40,
    };

    Game.events = {
        KEYDOWN: 'keydown'
    };

    Game.keyCodes = {
        LEFT: {37: 1},
        UP: {38: 1},
        RIGHT: {39: 1},
        DOWN: {40: 1},
        SPACE: {32: 1},
        ENTER: {13: 1},
        ESC: {27: 1}
    };

    // Right: +ive X, LEFT: -ive X, Down: +ive Y, Up: -ive Y
    Game.inputState = {
        X: 1,
        Y: 0,
        PROCESSED: false
    };

    Game.prototype = {
        init: function(){
            this.canvasCtx.fillStyle = 'grey';
            this.canvasCtx.fillRect(0, 0,
                this.canvas.width, this.canvas.height);

            this.snake = new Snake(this.canvas);
            this.food = new Food(this.canvas);

            this.startListeners();

            this.frameReqId =
            window.requestAnimationFrame(this.update.bind(this));
        },
        update: function(){
            if(this.running){
                this.canvasCtx.fillRect(0, 0,
                    this.canvas.width, this.canvas.height);

                this.food.update();

                if(!Game.inputState.PROCESSED && this.snake.displaced){
                    if(this.snake.vx * Game.inputState.X == 0)
                        this.snake.vx = Game.inputState.X * Snake.config.SPEED;
                    if(this.snake.vy * Game.inputState.Y == 0)
                        this.snake.vy = Game.inputState.Y * Snake.config.SPEED;
                    this.snake.displaced = false;
                    Game.inputState.PROCESSED = true;
                }

                this.snake.update(this.food);
            }

            this.frameReqId =
            window.requestAnimationFrame(this.update.bind(this));
        },
        stopGame: function(){},
        handleEvent: function(evt){
            // making Game class itself as event handler
            return (function(evt, events){
                switch(evt.type){
                    case events.KEYDOWN:
                        this.onKeyDown(evt);
                        break;
                    default:
                        console.log('Unhandled event');
                        break;
                }
            }.bind(this))(evt, Game.events)
        },
        onKeyDown: function(evt){
            if(Game.keyCodes.LEFT[evt.keyCode] && Game.inputState.PROCESSED){
                Game.inputState.X = -1;
                Game.inputState.Y = 0;
                Game.inputState.PROCESSED = false;
            }
            if(Game.keyCodes.RIGHT[evt.keyCode] && Game.inputState.PROCESSED){
                Game.inputState.X = 1;
                Game.inputState.Y = 0;
                Game.inputState.PROCESSED = false;
            }
            if(Game.keyCodes.UP[evt.keyCode] && Game.inputState.PROCESSED){
                Game.inputState.X = 0;
                Game.inputState.Y = -1;
                Game.inputState.PROCESSED = false;
            }
            if(Game.keyCodes.DOWN[evt.keyCode] && Game.inputState.PROCESSED){
                Game.inputState.X = 0;
                Game.inputState.Y = 1;
                Game.inputState.PROCESSED = false;
            }
            if(Game.keyCodes.ENTER[evt.keyCode]){
                this.running = true;
            }
            if(Game.keyCodes.SPACE[evt.keyCode]){
                this.running = !this.running;
            }
            if(Game.keyCodes.ESC[evt.keyCode]){
                this.running = false;
                window.cancelAnimationFrame(this.frameReqId);
            }
        },
        startListeners: function(){
            document.addEventListener(Game.events.KEYDOWN, this);
        },
        stopListeners: function(){
            document.removeEventListener(Game.events.KEYDOWN, this);
        }
    };

    function Snake(canvas, config){
        this.canvasCtx = canvas.getContext('2d');

        this.config = config || Snake.config;

        // list to hold coordinates for each tile of snake
        this.tail = [];
        //this.length = Snake.config.MINLENGTH;
        this.length = 10;

        // head x and y position
        this.headX = canvas.width / 2 / Game.config.GRIDSIZE;
        this.headY = canvas.height / 2 / Game.config.GRIDSIZE;

        // head x and y for head tile
        this.tileHeadX;
        this.tileHeadY;

        // x and y velocity of snake
        this.vx = this.config.SPEED;
        this.vy = 0;

        // track whether snake moved due to previous input
        this.displaced = false;

        this.init();
    };

    Snake.config = {
        COLOR: 'black',
        SPEED: 0.3,
        MINLENGTH: 5
    };

    Snake.prototype = {
        init: function(){
            for(var index = this.length - 1; index >= 0; --index){
                this.tail.push({
                    x: this.headX - index,
                    y: this.headY
                });
            }
        },
        update: function(food){
            var oldX = this.headX;
            var oldY = this.headY;

            this.tileHeadX = Math.floor(this.headX);
            this.tileHeadY = Math.floor(this.headY);

            this.headX += this.vx;
            this.headY += this.vy;

            var newHead = false;

            if(Math.abs(Math.floor(oldX + this.vx) - Math.floor(oldX)) >= 1){
                this.tileHeadX = Math.floor(oldX + this.vx);
                newHead = true;
                this.displaced = true;
            }
            if(Math.abs(Math.floor(oldY + this.vy) - Math.floor(oldY)) >= 1){
                this.tileHeadY = Math.floor(oldY + this.vy);
                newHead = true;
                this.displaced = true;
            }

            // Wraping
            if(this.tileHeadX < 0){
                this.tileHeadX = this.headX = Game.config.TILECOUNTX - 1;
            }
            if(this.tileHeadX > Game.config.TILECOUNTX - 1){
                this.tileHeadX = this.headX = 0;
            }
            if(this.tileHeadY < 0){
                this.tileHeadY = this.headY = Game.config.TILECOUNTY - 1;
            }
            if(this.tileHeadY > Game.config.TILECOUNTY - 1){
                this.tileHeadY = this.headY =  0;
            }

            if(newHead){
                this.tail.push({x: this.tileHeadX, y: this.tileHeadY});
            }

            // Collision with self
            // Collision can only happen for tiles after 3rd position
            for(var index = 0; index < this.tail.length - 4; ++index){
                if(this.tail[index].x == this.tileHeadX &&
                    this.tail[index].y == this.tileHeadY){
                    // collision detected, penalise by setting tail length to
                    // default length
                    this.length = Snake.config.MINLENGTH;
                }
            }

            // Food is waiting
            if(this.tileHeadX == food.x && this.tileHeadY == food.y){
                ++this.length;
                food.randomize = true;
                food.update();
            }

            while(this.tail.length != this.length){
                this.tail.shift();
            }
            this.draw();
        },
        draw: function(){
            this.canvasCtx.save()
            var tcx = Game.config.TILECOUNTX;
            var tcy = Game.config.TILECOUNTY;
            var gs = Game.config.GRIDSIZE;
            this.canvasCtx.fillStyle = 'black';
            for(var index = 0; index < this.length; ++index){
                this.canvasCtx.fillRect(this.tail[index].x * gs,
                    this.tail[index].y * gs,
                    gs - 2,
                    gs - 2);
            }
            this.canvasCtx.restore();
        }
    };

    function Food(canvas){
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');

        this.x = Math.floor(Math.random() * Game.config.TILECOUNTX);
        this.y = Math.floor(Math.random() * Game.config.TILECOUNTY);
        this.randomize = false;
    };

    Food.config = {
        COLOR: 'red'
    };

    Food.prototype = {
        update: function(){
            // better randomize logic required
            if(this.randomize){
                this.x = Math.floor(Math.random() * Game.config.TILECOUNTX);
                this.y = Math.floor(Math.random() * Game.config.TILECOUNTY);
                this.randomize = false;
            }
            this.draw();
        },
        draw: function(){
            this.canvasCtx.save();
            var gs = Game.config.GRIDSIZE;
            this.canvasCtx.fillStyle = Food.config.COLOR;
            this.canvasCtx.fillRect(this.x * gs,
                this.y * gs,
                gs - 2, gs - 2);
            this.canvasCtx.restore();
        }
    };
})();

function onDocumentLoad(){
    new Game('game-canvas');
};

document.addEventListener('DOMContentLoaded', onDocumentLoad);
