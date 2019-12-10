class Board{
    private width: number;
    private height: number;
    private board: JQuery;
    public snake: Snake;
    private applePos: number[];
    private gameInterval: number;

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
        this.board = $('#board');
    }

    // Generate a blank board (25^2 pixels) squares
    generate(): void{
        for(let y = 1; y <= this.height; y++){
            let row: JQuery = $(`<div class="row" id="row-${y}"></div>`);
            for(let x = 1; x <= this.width; x++){
                let square: JQuery = $(`<div class="square" id="square-${y}-${x}"><div>`);
                row.append(square);
            }
            this.board.append(row);
        }
    }

    start(){
        this.snake = new Snake([15,15]);
        this.spawnApple();
        this.startKeyListen();
        this.gameInterval = this.startInterval();
    }

    startInterval(): number{
        return setInterval(()=>{
            let feedTime = (this.snake.getHeadPosition()[0] === this.getApplePos()[0] && this.snake.getHeadPosition()[1] === this.getApplePos()[1]);
            if(feedTime) this.spawnApple();

            if(this.outsideOfBoard()){
                if(confirm('u ded')){
                    window.location.reload();
                }
            }
            this.snake.move(feedTime);

        }, 200);   
    }

    stop(){
        clearInterval(this.gameInterval);
    }

    outsideOfBoard():boolean{
        let nextXY: number[] = this.snake.getNextPosition();
        let x = nextXY[0];
        let y = nextXY[1];

        if((x < 1 || x > this.width) || ( y < 1 || y > this.height)){
            return true;
        }
        return false;
    }

    startKeyListen(){
        $('body').on('keydown', ()=>{

            // left key
            if(event.keyCode === 37){
                this.snake.setLastKey('left');
            }

            // right key
            if(event.keyCode === 39){
                this.snake.setLastKey('right');
            }
        })
    }

    spawnApple(){
        let applePos = [Math.round(Math.random() * this.width + 1), Math.round(Math.random() * this.height + 1)];
        let bodyPos = this.snake.getBodyPositionArray();

        while(bodyPos.some(s => s[0] === applePos[0] && s[1] === applePos[1])){
            applePos = [Math.round(Math.random() * this.width + 1), Math.round(Math.random() * this.height + 1)];
        }

        this.applePos = applePos;

        $(`#square-${applePos[0]}-${applePos[1]}`).css('background-color', 'maroon');
    }

    getApplePos():number[]{
        return this.applePos;
    }
}

class Snake{
    snake: LinkedList<Square>;
    lastKey: string;
    direction: string;

    constructor(xy: number[]){
        this.snake = new LinkedList<Square>(new Square(xy, true));
        this.direction = 'y+';
    }

    move(extend = false){
        if(this.nextPositionIsSelf()){
            if(confirm('u ded')){
                window.location.reload();
            }
        }
        let nextPosition = this.getNextPosition();

        this.snake.append(new Square(nextPosition, true));
        this.snake.getTail().data.deactivate();

        if(!extend){
            this.snake.pop();
        }
    }

    nextPositionIsSelf(): boolean{
        let bodyArray = this.getBodyPositionArray();
        bodyArray = bodyArray.slice(1, bodyArray.length);

        let nextPosition = this.getNextPosition();

        if(bodyArray.some(p => p[0] === nextPosition[0] && p[1] === nextPosition[1])){
            return true;
        }else{
            return false;
        }
    }

    getHeadPosition(): number[]{
        return this.snake.getHead().data.getPosition();
    }

    getBodyPositionArray(): number[][]{
        return this.snake.toArray().map(s => s.getPosition());
    }

    public setLastKey(key: string): void{
        this.lastKey = key;
    }

    private resetLastKey(){
        this.lastKey = null;
    }

    public getNextPosition(): number[]{
        let currentPos: number[] = this.snake.getHead().data.getPosition();
        switch(this.direction){
            case 'y+':
                if(this.lastKey === 'left'){
                    this.direction = 'x-';
                    this.resetLastKey();
                    return [currentPos[0], currentPos[1] - 1];
                }
                else if(this.lastKey === 'right') {
                    this.direction = 'x+';
                    this.resetLastKey();
                    return [currentPos[0], currentPos[1] + 1];
                }
                else{
                    return [currentPos[0] - 1, currentPos[1]];
                }
            case 'y-':
                if(this.lastKey === 'left'){
                    this.direction = 'x+';
                    this.resetLastKey();
                    return [currentPos[0], currentPos[1] + 1];
                }
                else if(this.lastKey === 'right') {
                    this.direction = 'x-';
                    this.resetLastKey();
                    return [currentPos[0], currentPos[1] - 1];
                }
                else{
                    return [currentPos[0] + 1, currentPos[1]];
                }
            case 'x+':
                if(this.lastKey === 'left'){
                    this.direction = 'y+';
                    this.resetLastKey();
                    return [currentPos[0] - 1, currentPos[1]];
                }
                else if(this.lastKey === 'right') {
                    this.direction = 'y-';
                    this.resetLastKey();
                    return [currentPos[0] + 1, currentPos[1]];
                }
                else{
                    return [currentPos[0], currentPos[1] + 1];
                }
            case 'x-':
                if(this.lastKey === 'left'){
                    this.direction = 'y-';
                    this.resetLastKey();
                    return [currentPos[0] + 1, currentPos[1]];
                }
                else if(this.lastKey === 'right') {
                    this.direction = 'y+';
                    this.resetLastKey();
                    return [currentPos[0] - 1, currentPos[1]];
                }
                else{   
                    return [currentPos[0], currentPos[1] - 1];
                }

        }
    }

}

class Square{
    element: JQuery;
    xy: number[];

    constructor(xy: number[], active: boolean){
        this.xy = xy;
        this.element = this.getElementFromPosition(this.xy);

        if(active) this.activate();
    }

    activate():void{
        this.element.css('background-color', 'green');
    }

    deactivate():void{
        this.element.css('background-color', 'rgb(56, 70, 153)');
    }

    getPosition(): number[]{
        return this.xy;
    }

    private getElementFromPosition(xy: number[]): JQuery{
        return $(`#square-${xy[0]}-${xy[1]}`);
    }

}

class LinkedList<T>{
    private head: LinkedListNode<T>;
    private tail: LinkedListNode<T>;
    private length: number;

    constructor(data: T){
        let initial = new LinkedListNode<T>(data);
        this.head = initial;
        this.tail = initial;
        this.length = 1;
    }

    toArray(): T[]{
        let array: T[] = [];
        let current = this.head;
        while(current !== null){
            array.push(current.data);
            current = current.next;
        }
        return array;
    }

    append(data: T): void{
        let newNode = new LinkedListNode<T>(data);

        let prev = this.head;
        this.head = newNode;
        this.head.next = prev;
        prev.prev = this.head;

        this.length = this.length + 1;
    }

    pop(){
        this.tail = this.tail.prev;
        this.tail.next = null;

        this.length = this.length - 1;
    }

    getLength(): number{
        return this.length;
    }

    getHead(): LinkedListNode<T>{
        return this.head;
    }

    getTail(): LinkedListNode<T>{
        return this.tail;
    }

}

class LinkedListNode<T>{
    public data: T;
    public next: LinkedListNode<T>;
    public prev: LinkedListNode<T>;

    constructor(data: T, next: LinkedListNode<T> = null){
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

let b = new Board(15,15);
b.generate();
b.start();