const levelBtn = document.querySelectorAll('.btn-level');

const CANVAS = document.getElementById('tetris-screen');
const CTX = CANVAS.getContext('2d');
const CANVAS_PREDICT = document.getElementById('next-tetris');
const CTX_PREDICT = CANVAS_PREDICT.getContext('2d');

const ROWS= 20;
const COLS = 10;
const ROWS_PREDICT = 5;
const COLS_PREDICT = 5;

const SCALE = 30;
const BUFFER = 4;
const TOTAL_ROWS = ROWS + BUFFER;

const TETRIS_BLOCK = {
    // Tính theo ma trận luôn bắt đầu dòng và cột là 0
    'J':{
        matrix: [
            [ 1, 0, 0],
            [ 1, 1, 1],
            [ 0, 0, 0]
        ],
        x: 3,
        y: 2,
        x_predict: 1,
        y_predict: 1,
    },

    'L':{
        matrix: [
            [0, 0, 2],
            [2, 2, 2],
            [0, 0, 0]
        ],
        x: 3,
        y: 2,
        x_predict: 1,
        y_predict: 1,
    },

    'O':{
        matrix: [
            [3, 3],
            [3, 3]
        ],
        x: 4,
        y: 2,
        x_predict: 1,
        y_predict: 1,
    },
    'S':{
        matrix: [
            [0, 4, 4],
            [4, 4, 0],
            [0, 0, 0],

        ],
        x: 3,
        y: 2,
        x_predict: 1,
        y_predict: 1,
    },
    'T':{
        matrix: [
            [0, 0, 0],
            [5, 5, 5],
            [0, 5, 0]
        ],
        x: 3,
        y: 1,
        x_predict: 1,
        y_predict: 0,
    },
    'Z':{
        matrix: [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0]
        ],
        x: 3,
        y: 2,
        x_predict: 1,
        y_predict: 1,
    },
    'I':{
        matrix: [
            [0, 0, 0, 0],
            [7, 7, 7, 7],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        x: 3,
        y: 2,
        x_predict: 0,
        y_predict: 2,
    },

}
const BLOCK_COLOR={
    0: '#FFF', // Không có khối
    1: '#0000F0', // khối J
    2: '#DDA422', // Khối L
    3: '#F1EF2F', // Khối O
    4: '#8AEA28', // Khối S
    5: '#882CED', // Khối T
    6: '#CF3616', // Khối Z
    7: '#00EAFF', // Khối I
};
const T_BAG = createTBag();

const STATE={
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSE: 'PAUSE',
    OVER: 'OVER'
};
const GAME_STATE={
    current_state: STATE.MENU,
    level: 0,
    score:0,
    board:  Array.from({length: TOTAL_ROWS}, () => Array(COLS).fill(0)),
    board_predict: Array.from({length: ROWS_PREDICT}, () => Array(COLS_PREDICT).fill(0)),
    interval: 1000,
    lastTimeStamp:0,
    timeCounter:0,
    player: {
        current_block: TETRIS_BLOCK[T_BAG[0]].matrix, // mảng 2 chiều của khối hiện tại
        next_block: TETRIS_BLOCK[T_BAG[1]].matrix, // mảng 2 chiều của khối tiếp theo
        position: {x: 0, y: 0}
    }
}

// Hàm tạo list 7 khối random
function createTBag() {
    const tempBag = Array.from(T_BAG);
    const Bag=[];
    for (let i = tempBag.length; i > 0 ; i--) {
        const random = Math.floor(Math.random() * i)
        Bag.push(tempBag[random]);
        tempBag.splice(random, 1);
    }
    return Bag;
}

// Chọn level ở main menu
function levelSelection(){
    levelBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedBtn = document.querySelector('.btn-level.active');

            if(selectedBtn && selectedBtn !== e.currentTarget) {
                selectedBtn.classList.remove('active');
                e.currentTarget.classList.add('active');
            } else if(!selectedBtn){
                e.currentTarget.classList.add('active');
            }
        })
    })
}
levelSelection();

// hàm chuyển screen
function navigateScreen(){
    document.addEventListener('click', (e) => {
        const clickedBtn = e.target.closest('[data-screen]');

        if(clickedBtn){
            const targetId =  clickedBtn.getAttribute('data-screen');
            // console.log(targetId);
            const targetScreen = document.getElementById(targetId);

            if(targetScreen){
                const currentScreen = document.querySelector('.screen.active');
                currentScreen.classList.remove('active');
                targetScreen.classList.add('active');
            } else{
                console.log(targetScreen);
            }
        }
    })
}


// hàm vẽ board
function drawBoard(){
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            let x = col * SCALE;
            let y = row * SCALE;
            let color = GAME_STATE.board[row][col];

            drawSquare(x, y, color);
            console.log("in xong dòng: " + row + ", cột: " + col + "vị trí tọa độ x: " + x + " y: " + y);
        }

    }
}

// Hàm vẽ khối block hiện tại của người chơi
function drawPiece(){
    for (let row = 0; row < GAME_STATE.player.current_block.length; row++) {
        for (let col = 0; col < GAME_STATE.player.current_block[0].length; col++) {
            let blockX = (col + GAME_STATE.player.position.x) * SCALE;
            let blockY = (row + GAME_STATE.player.position.y) * SCALE;

            drawSquare(blockX, blockY, GAME_STATE.player.current_block);
        }
    }

}
// hàm vẽ ô vuông
function drawSquare(x, y, color) {
    CTX.fillStyle =  BLOCK_COLOR[color];
    CTX.fillRect(x, y, SCALE, SCALE);

    CTX.strokeStyle = "#111";
    CTX.lineWidth = 0.5;
    CTX.strokeRect(x, y, SCALE, SCALE);

}

//  Hàm xóa sạch canvas
function clearCanvas(){
    CTX.fillRect(0,0, CANVAS.with, CANVAS.height);
}

// Hàm loop game
function gameLoop(timeStamp){
    const timePass = timeStamp - GAME_STATE.lastTimeStamp;
    GAME_STATE.lastTimeStamp = timeStamp;
    GAME_STATE.timeCounter += timePass;
    if(GAME_STATE.timeCounter  >= GAME_STATE.interval){
        GAME_STATE.timeCounter -= GAME_STATE.interval;
        // Thực hiện sau 1 giây có những phương thức
    }

    clearCanvas();
    drawBoard();
    drawPiece();

    requestAnimationFrame(gameLoop);
}
// hàm bắt đầu game
function startGame(){
    navigateScreen();
    requestAnimationFrame(gameLoop);
}
startGame();
