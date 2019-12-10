var Board = /** @class */ (function () {
    function Board(width, height) {
        this.width = width;
        this.height = height;
        this.board = $('#board');
    }
    // Generate a blank board (25^2 pixels) squares
    Board.prototype.generate = function () {
        for (var y = 1; y <= this.height; y++) {
            var row = $("<div class=\"row\" id=\"row-" + y + "\"></div>");
            for (var x = 1; x <= this.width; x++) {
                var square = $("<div class=\"square\" id=\"square-" + y + "-" + x + "\"><div>");
                row.append(square);
            }
            this.board.append(row);
        }
    };
    Board.prototype.start = function () {
        this.snake = new Snake([15, 15]);
        this.spawnApple();
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
                if (confirm('u ded')) {
                    window.location.reload();
                }
            }
            _this.snake.move(feedTime);
        }, 200);
    };
    Board.prototype.stop = function () {
        clearInterval(this.gameInterval);
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
            if (event.keyCode === 37) {
                _this.snake.setLastKey('left');
            }
            // right key
            if (event.keyCode === 39) {
                _this.snake.setLastKey('right');
            }
        });
    };
    Board.prototype.spawnApple = function () {
        var applePos = [Math.round(Math.random() * this.width + 1), Math.round(Math.random() * this.height + 1)];
        var bodyPos = this.snake.getBodyPositionArray();
        while (bodyPos.some(function (s) { return s[0] === applePos[0] && s[1] === applePos[1]; })) {
            applePos = [Math.round(Math.random() * this.width + 1), Math.round(Math.random() * this.height + 1)];
        }
        this.applePos = applePos;
        $("#square-" + applePos[0] + "-" + applePos[1]).css('background-color', 'maroon');
    };
    Board.prototype.getApplePos = function () {
        return this.applePos;
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
            if (confirm('u ded')) {
                window.location.reload();
            }
        }
        var nextPosition = this.getNextPosition();
        this.snake.append(new Square(nextPosition, true));
        this.snake.getTail().data.deactivate();
        if (!extend) {
            this.snake.pop();
        }
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
        this.element = this.getElementFromPosition(this.xy);
        if (active)
            this.activate();
    }
    Square.prototype.activate = function () {
        this.element.css('background-color', 'green');
    };
    Square.prototype.deactivate = function () {
        this.element.css('background-color', 'rgb(56, 70, 153)');
    };
    Square.prototype.getPosition = function () {
        return this.xy;
    };
    Square.prototype.getElementFromPosition = function (xy) {
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
var b = new Board(15, 15);
b.generate();
b.start();
//# sourceMappingURL=script.js.map