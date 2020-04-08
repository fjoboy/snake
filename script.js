(function () {
    var globalBoard;
    var globalInterface;
    var BOARD_COLOR = '#000';
    var SNAKE_COLOR = '#29cb2b';
    var APPLE_COLOR = 'maroon';
    var HEIGHT = 20;
    var WIDTH = 20;
    var GameInterface = /** @class */ (function () {
        function GameInterface() {
            globalInterface = this;
        }
        GameInterface.prototype.init = function () {
            this.startIntroAnimation();
        };
        GameInterface.prototype.startIntroAnimation = function () {
            var _this = this;
            $('#game-wrapper').css({ 'width': '300px', 'border': '1px solid #fff' });
            setTimeout(function () {
                $('#game-wrapper').css({ 'height': '300px' });
                setTimeout(function () {
                    _this.showMainMenu();
                }, 1500);
            }, 1500);
        };
        GameInterface.prototype.showMainMenu = function () {
            var divContent = '<div id="main-menu">' +
                '<span class="menu-text">select difficulty</span>' +
                '<div id="difficulty-select" class="menu-text text-small"><span>NORMAL</span><span>HARD</span><span>INSANE</span></div>' +
                '<span id="start-button" class="menu-text text-large">START</span>' +
                '</div>';
            $('#game-wrapper').append(divContent);
            setTimeout(function () {
                $('#main-menu').css({ 'opacity': '1.0' });
            }, 50);
            this.initListeners();
        };
        GameInterface.prototype.initListeners = function () {
            var _this = this;
            $('#difficulty-select').on('click', function () {
                $('#difficulty-select').children().css({ 'background-color': '#000', 'color': '#fff' });
                $(event.target).css({ 'background-color': '#fff', 'color': '#000' });
                _this.difficulty = $(event.target).text();
            });
            $('#start-button').on('click', function () {
                if (_this.difficulty !== undefined) {
                    _this.startTransitionToGameAnimation();
                    $('#start-button').off();
                }
            });
        };
        GameInterface.prototype.startTransitionToGameAnimation = function () {
            var _this = this;
            $('#main-menu').css({ 'opacity': '0.0' });
            setTimeout(function () {
                $('#game-wrapper').css({ 'transition': 'width 500ms, height 500ms', 'width': '600px', 'height': '602px' });
                $('#main-menu').css({ 'opacity': '0.0' }).remove();
                setTimeout(function () {
                    $('#game-wrapper').append($('<div id="board"></div>'));
                    _this.startGame();
                }, 400);
            }, 1000);
        };
        GameInterface.prototype.showGameOverMenu = function () {
            var divContent = '<div id="game-over-menu">' +
                '<span class="menu-text">Game over</span>' +
                '<div id="game-over-select" class="menu-text "><span>MAIN MENU</span><span>TRY AGAIN</span></div>' +
                '</div>';
            $('body').append(divContent);
            this.initGameOverListener();
        };
        GameInterface.prototype.initGameOverListener = function () {
            var _this = this;
            $('#game-over-select').on('click', function () {
                var clicked = $(event.target).text();
                if (clicked === 'TRY AGAIN') {
                    $('#game-over-select').off();
                    $('#game-over-menu').remove();
                    _this.board.stop();
                    //
                    _this.board.reset();
                    _this.board.start();
                }
                if (clicked === 'MAIN MENU') {
                    window.location.reload();
                }
            });
        };
        GameInterface.prototype.startGame = function () {
            var _this = this;
            this.board = new Board(HEIGHT, WIDTH, this.difficulty);
            this.board.generate();
            this.board.initialize();
            setTimeout(function () {
                $('#board').children().children().css({ 'opacity': '1' });
                _this.board.start();
            }, 1000);
        };
        return GameInterface;
    }());
    var Board = /** @class */ (function () {
        function Board(width, height, difficulty) {
            this.width = width;
            this.height = height;
            this.board = $('#board');
            this.gameSpeed = difficulty === 'NORMAL' ? 180 : (difficulty === 'HARD' ? 130 : 60);
            globalBoard = this;
        }
        // Generate a blank board (30^2 pixels) squares
        Board.prototype.generate = function () {
            this.board.text('');
            for (var y = 1; y <= this.height; y++) {
                var row = $("<div class=\"row\" id=\"row-" + y + "\"></div >");
                for (var x = 1; x <= this.width; x++) {
                    var square = $("<div class=\"square\" id=\"square-" + y + "-" + x + "\"><div>");
                    square.css({ 'background-color': BOARD_COLOR, });
                    row.append(square);
                }
                this.board.append(row);
            }
            // function generateSquare(row: number, square: number){
            //     if(row <= HEIGHT && square <= WIDTH){
            //     setTimeout(()=>{
            //         const rowJQ = $('#row-' + row).length === 0 ?  $(`<div class="row" id="row-${row}"></div >`) : $('#row-' + row);
            //         if(square === 1) $('#board').append(rowJQ);
            //         let squareJQ: JQuery = $(`<div class="square" id="square-${row}-${square}"><div>`);
            //         squareJQ.css({'background-color': BOARD_COLOR, 'border': '1px solid #555'});
            //         rowJQ.append(squareJQ);
            //         if(square === WIDTH){
            //             square = 1;
            //             row = row +1;
            //         }else{
            //             square = square +1;
            //         }
            //         generateSquare(row, square);
            //     }, 10);
            // }else{
            //     globalBoard.start();
            // }
            // }
            // generateSquare(1,1);
        };
        Board.prototype.initialize = function () {
            this.snake = new Snake([15, 15]);
            this.spawnApple();
        };
        Board.prototype.start = function () {
            this.startKeyListen();
            this.gameInterval = this.startInterval();
        };
        Board.prototype.startInterval = function () {
            var _this = this;
            return setInterval(function () {
                var feedTime = (_this.snake.getHeadPosition()[0] === _this.getApplePos()[0] && _this.snake.getHeadPosition()[1] === _this.getApplePos()[1]);
                if (feedTime)
                    _this.spawnApple();
                if (_this.outsideOfBoard()) {
                    _this.stop();
                    globalInterface.showGameOverMenu();
                }
                _this.snake.move(feedTime);
            }, this.gameSpeed);
        };
        Board.prototype.stop = function () {
            clearInterval(this.gameInterval);
        };
        Board.prototype.reset = function () {
            this.generate();
            this.applePos = null;
            this.snake = null;
        };
        Board.prototype.outsideOfBoard = function () {
            var nextXY = this.snake.getNextPosition();
            var x = nextXY[0];
            var y = nextXY[1];
            if ((x < 1 || x > this.width) || (y < 1 || y > this.height)) {
                return true;
            }
            return false;
        };
        Board.prototype.startKeyListen = function () {
            var _this = this;
            $('body').on('keydown', function () {
                // left key
                // @ts-ignore
                if (event.keyCode === 37) {
                    _this.snake.setLastKey('left');
                }
                // right key
                // @ts-ignore
                if (event.keyCode === 39) {
                    _this.snake.setLastKey('right');
                }
                // @ts-ignore
                if (event.keyCode === 38) {
                    _this.stop();
                }
                // @ts-ignore
                if (event.keyCode === 40) {
                    _this.startInterval();
                }
                // @ts-ignore
                if (event.keyCode === 81) {
                    _this.enableDebugger();
                }
            });
        };
        Board.prototype.enableDebugger = function () {
            for (var y = 1; y <= this.height; y++) {
                for (var x = 1; x <= this.width; x++) {
                    $("#square-" + y + "-" + x).append("<span class=\"debug-xy-text\">" + y + ", " + x + "</span>");
                }
            }
        };
        Board.prototype.spawnApple = function () {
            var applePos = [Math.ceil(Math.random() * (this.width - 1)), Math.ceil(Math.random() * (this.height - 1))];
            var bodyPos = this.snake.getBodyPositionArray();
            if (bodyPos.some(function (s) { return s[0] === applePos[0] && s[1] === applePos[1]; })) {
                applePos = [Math.ceil(Math.random() * (this.width - 1)), Math.ceil(Math.random() * (this.height - 1))];
            }
            this.applePos = applePos;
            $("#square-" + applePos[0] + "-" + applePos[1]).css('background-color', APPLE_COLOR);
        };
        Board.prototype.getApplePos = function () {
            return this.applePos;
        };
        Board.prototype.killApple = function () {
            var appleJQ = Square.getElementFromPosition(this.getApplePos());
            appleJQ.css({ 'background-color': BOARD_COLOR });
            this.applePos = null;
            console.log(appleJQ);
        };
        return Board;
    }());
    var Snake = /** @class */ (function () {
        function Snake(xy) {
            this.snake = new LinkedList(new Square(xy, true));
            this.direction = 'y+';
        }
        Snake.prototype.move = function (extend) {
            if (extend === void 0) { extend = false; }
            if (this.nextPositionIsSelf()) {
                globalBoard.stop();
                globalInterface.showGameOverMenu();
            }
            var nextPosition = this.getNextPosition();
            this.snake.append(new Square(nextPosition, true));
            this.snake.getTail().data.deactivate();
            if (!extend) {
                this.snake.pop();
            }
        };
        Snake.prototype.kill = function () {
            var square = this.snake.getHead();
            while (square !== null) {
                square.data.deactivate();
                square = square.next;
            }
            this.snake.setLength(0);
            this.snake = null;
        };
        Snake.prototype.nextPositionIsSelf = function () {
            var bodyArray = this.getBodyPositionArray();
            bodyArray = bodyArray.slice(1, bodyArray.length);
            var nextPosition = this.getNextPosition();
            if (bodyArray.some(function (p) { return p[0] === nextPosition[0] && p[1] === nextPosition[1]; })) {
                return true;
            }
            else {
                return false;
            }
        };
        Snake.prototype.getHeadPosition = function () {
            return this.snake.getHead().data.getPosition();
        };
        Snake.prototype.getBodyPositionArray = function () {
            return this.snake.toArray().map(function (s) { return s.getPosition(); });
        };
        Snake.prototype.setLastKey = function (key) {
            this.lastKey = key;
        };
        Snake.prototype.resetLastKey = function () {
            this.lastKey = null;
        };
        Snake.prototype.getNextPosition = function () {
            var currentPos = this.snake.getHead().data.getPosition();
            switch (this.direction) {
                case 'y+':
                    if (this.lastKey === 'left') {
                        this.direction = 'x-';
                        this.resetLastKey();
                        return [currentPos[0], currentPos[1] - 1];
                    }
                    else if (this.lastKey === 'right') {
                        this.direction = 'x+';
                        this.resetLastKey();
                        return [currentPos[0], currentPos[1] + 1];
                    }
                    else {
                        return [currentPos[0] - 1, currentPos[1]];
                    }
                case 'y-':
                    if (this.lastKey === 'left') {
                        this.direction = 'x+';
                        this.resetLastKey();
                        return [currentPos[0], currentPos[1] + 1];
                    }
                    else if (this.lastKey === 'right') {
                        this.direction = 'x-';
                        this.resetLastKey();
                        return [currentPos[0], currentPos[1] - 1];
                    }
                    else {
                        return [currentPos[0] + 1, currentPos[1]];
                    }
                case 'x+':
                    if (this.lastKey === 'left') {
                        this.direction = 'y+';
                        this.resetLastKey();
                        return [currentPos[0] - 1, currentPos[1]];
                    }
                    else if (this.lastKey === 'right') {
                        this.direction = 'y-';
                        this.resetLastKey();
                        return [currentPos[0] + 1, currentPos[1]];
                    }
                    else {
                        return [currentPos[0], currentPos[1] + 1];
                    }
                case 'x-':
                    if (this.lastKey === 'left') {
                        this.direction = 'y-';
                        this.resetLastKey();
                        return [currentPos[0] + 1, currentPos[1]];
                    }
                    else if (this.lastKey === 'right') {
                        this.direction = 'y+';
                        this.resetLastKey();
                        return [currentPos[0] - 1, currentPos[1]];
                    }
                    else {
                        return [currentPos[0], currentPos[1] - 1];
                    }
            }
        };
        return Snake;
    }());
    var Square = /** @class */ (function () {
        function Square(xy, active) {
            this.xy = xy;
            this.element = Square.getElementFromPosition(this.xy);
            if (active)
                this.activate();
        }
        Square.prototype.activate = function () {
            this.element.css('background-color', SNAKE_COLOR);
        };
        Square.prototype.deactivate = function () {
            this.element.css('background-color', BOARD_COLOR);
        };
        Square.prototype.getPosition = function () {
            return this.xy;
        };
        Square.getElementFromPosition = function (xy) {
            return $("#square-" + xy[0] + "-" + xy[1]);
        };
        return Square;
    }());
    var LinkedList = /** @class */ (function () {
        function LinkedList(data) {
            var initial = new LinkedListNode(data);
            this.head = initial;
            this.tail = initial;
            this.length = 1;
        }
        LinkedList.prototype.toArray = function () {
            var array = [];
            var current = this.head;
            while (current !== null) {
                array.push(current.data);
                current = current.next;
            }
            return array;
        };
        LinkedList.prototype.append = function (data) {
            var newNode = new LinkedListNode(data);
            var prev = this.head;
            this.head = newNode;
            this.head.next = prev;
            prev.prev = this.head;
            this.length = this.length + 1;
        };
        LinkedList.prototype.pop = function () {
            this.tail = this.tail.prev;
            this.tail.next = null;
            this.length = this.length - 1;
        };
        LinkedList.prototype.getLength = function () {
            return this.length;
        };
        LinkedList.prototype.setLength = function (length) {
            this.length = length;
        };
        LinkedList.prototype.getHead = function () {
            return this.head;
        };
        LinkedList.prototype.getTail = function () {
            return this.tail;
        };
        return LinkedList;
    }());
    var LinkedListNode = /** @class */ (function () {
        function LinkedListNode(data, next) {
            if (next === void 0) { next = null; }
            this.data = data;
            this.next = null;
            this.prev = null;
        }
        return LinkedListNode;
    }());
    var g = new GameInterface();
    g.init();
})();
//# sourceMappingURL=script.js.map