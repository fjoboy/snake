(function(){

let globalBoard: Board;
let globalInterface: GameInterface;

const BOARD_COLOR: string = '#000';
const SNAKE_COLOR: string = '#29cb2b';
const APPLE_COLOR: string = 'maroon';
const HEIGHT: number = 20;
const WIDTH: number = 20;

class GameInterface{
    private difficulty: string;
    private score: number;
    private board: Board;

    constructor(){
        globalInterface = this;
    }

    init(){
        this.startIntroAnimation();
    }

    startIntroAnimation(){
        $('#game-wrapper').css({'width': '300px', 'border': '1px solid #fff'});
        setTimeout(()=>{
            $('#game-wrapper').css({'height': '300px'});
            
            setTimeout(()=>{
                this.showMainMenu();
            }, 1500)
        },1500);


    } 

    showMainMenu(){
        const divContent = 
        '<div id="main-menu">' +
        '<span class="menu-text">select difficulty</span>' + 
        '<div id="difficulty-select" class="menu-text text-small"><span>NORMAL</span><span>HARD</span><span>INSANE</span></div>' +
        '<span id="start-button" class="menu-text text-large">START</span>'+
        '</div>';   
        $('#game-wrapper').append(divContent);

        setTimeout(()=>{
            $('#main-menu').css({'opacity': '1.0'});
        },50);

        this.initListeners();
    }

    initListeners(){
        $('#difficulty-select').on('click', ()=>{

            $('#difficulty-select').children().css({'background-color': '#000', 'color': '#fff'});
            $(event.target).css({'background-color': '#fff', 'color': '#000'});
            this.difficulty = $(event.target).text();
        })

        $('#start-button').on('click', ()=>{
            if(this.difficulty !== undefined){
                this.startTransitionToGameAnimation();
                $('#start-button').off();
            }
        })
    }

    startTransitionToGameAnimation(){
        $('#main-menu').css({'opacity': '0.0'});
        setTimeout(()=>{
            $('#game-wrapper').css({'transition' : 'width 500ms, height 500ms','width': '600px', 'height': '602px'});
            $('#main-menu').css({'opacity': '0.0'}).remove();
            setTimeout(()=>{
                $('#game-wrapper').append($('<div id="board"></div>'));
                this.startGame();
            },400);
        },1000);
    }

    showGameOverMenu(){
        const divContent = 
        '<div id="game-over-menu">' +
        '<span class="menu-text">Game over</span>' + 
        '<div id="game-over-select" class="menu-text "><span>MAIN MENU</span><span>TRY AGAIN</span></div>' +
        '</div>';   
        $('body').append(divContent);

        this.initGameOverListener();

    }

    initGameOverListener(){
        $('#game-over-select').on('click', ()=>{
            const clicked:string = $(event.target).text();

            if(clicked === 'TRY AGAIN'){
                $('#game-over-select').off();
                $('#game-over-menu').remove();
                this.board.stop();
                //
                this.board.reset();
                this.board.start();
            }
            if(clicked === 'MAIN MENU'){
                window.location.reload();

            }
        })
    }

    startGame(){
        this.board = new Board(HEIGHT, WIDTH, this.difficulty);
        this.board.generate();
        this.board.initialize();
        setTimeout(()=>{
            $('#board').children().children().css({'opacity': '1'});
            this.board.start();
        },1000);
        
    }

}

class Board{
    private width: number;
    private height: number;
    private board: JQuery;
    private snake: Snake;
    private applePos: number[];
    private gameInterval: number;
    private gameSpeed: number;
    private started: boolean;

    constructor(width: number, height: number, difficulty: string){
        this.width = width;
        this.height = height;
        this.board = $('#board');
        this.gameSpeed = difficulty === 'NORMAL' ? 180 : (difficulty === 'HARD' ? 130 : 60);

        globalBoard = this;
    }


    // Generate a blank board (30^2 pixels) squares
    generate(): void{
        this.board.text('');
        for(let y = 1; y <= this.height; y++){
            let row: JQuery = $(`<div class="row" id="row-${y}"></div >`);
            for(let x = 1; x <= this.width; x++){
                let square: JQuery = $(`<div class="square" id="square-${y}-${x}"><div>`);
                square.css({'background-color': BOARD_COLOR, });
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
    }

    initialize(){
        this.snake = new Snake([15,15]);
        this.spawnApple();
    }

    start(){
        this.startKeyListen();
        this.gameInterval = this.startInterval();
    }

    startInterval(): number{
        return setInterval(()=>{
            let feedTime = (this.snake.getHeadPosition()[0] === this.getApplePos()[0] && this.snake.getHeadPosition()[1] === this.getApplePos()[1]);
            if(feedTime) this.spawnApple();

            if(this.outsideOfBoard()){
                this.stop();
                globalInterface.showGameOverMenu();
            }
            this.snake.move(feedTime);

        }, this.gameSpeed);   
    }

    stop(){
        clearInterval(this.gameInterval);
    }

    reset(){
        this.generate()
        this.applePos = null;
        this.snake = null;
        
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
            // @ts-ignore
            if(event.keyCode === 37){
                this.snake.setLastKey('left');
            }

            // right key
            // @ts-ignore
            if(event.keyCode === 39){
                this.snake.setLastKey('right');
            }
            // @ts-ignore
            if(event.keyCode === 38){
                this.stop();
            }
            // @ts-ignore
            if(event.keyCode === 40){
                this.startInterval();
            }
            // @ts-ignore
            if(event.keyCode === 81){
                this.enableDebugger();
            }

            })
    }

    enableDebugger(){
        for(let y = 1; y <= this.height; y++){
            for(let x = 1; x <= this.width; x++){
                $(`#square-${y}-${x}`).append(`<span class="debug-xy-text">${y}, ${x}</span>`);
            }
        }
    }

    spawnApple(){
        let applePos = [Math.ceil(Math.random() * (this.width - 1)), Math.ceil(Math.random() * (this.height - 1))];
        let bodyPos = this.snake.getBodyPositionArray();

        if(bodyPos.some(s => s[0] === applePos[0] && s[1] === applePos[1])){
            applePos = [Math.ceil(Math.random() * (this.width - 1)), Math.ceil(Math.random() * (this.height - 1))];
        }

        this.applePos = applePos;

        $(`#square-${applePos[0]}-${applePos[1]}`).css('background-color', APPLE_COLOR);
    }

    getApplePos():number[]{
        return this.applePos;
    }
    killApple(){
        const appleJQ = Square.getElementFromPosition(this.getApplePos());
        appleJQ.css({'background-color': BOARD_COLOR});
        this.applePos = null;

        console.log(appleJQ);

        
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
            globalBoard.stop();
            
            globalInterface.showGameOverMenu();
        }
        let nextPosition = this.getNextPosition();

        this.snake.append(new Square(nextPosition, true));
        this.snake.getTail().data.deactivate();

        if(!extend){
            this.snake.pop();
        }
    }

    kill(){

        let square = this.snake.getHead();
        while(square !== null){
            square.data.deactivate();
            square = square.next;
            
        }
        this.snake.setLength(0);
        this.snake = null;
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
        this.element = Square.getElementFromPosition(this.xy);

        if(active) this.activate();
    }

    activate():void{
        this.element.css('background-color', SNAKE_COLOR);
    }

    deactivate():void{
        this.element.css('background-color', BOARD_COLOR);
    }

    getPosition(): number[]{
        return this.xy;
    }

    static getElementFromPosition(xy: number[]): JQuery{
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

    setLength(length: number){
        this.length = length;
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

let g = new GameInterface();
g.init();
})();