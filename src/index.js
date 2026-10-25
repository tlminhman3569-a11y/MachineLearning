const levelBtn = document.querySelectorAll('.btn-level');
const PLAY_BTN = document.getElementById('btn-play');
const CURRENT_SCORE_POINT = document.getElementById('current-score-point');
const PAUSE_BTN = document.getElementById('pause');

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

const TETRIS_PIECES = {
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
        y_predict: 1,
    },

}
const PIECE_COLOR={
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
    OVER: 'OVER',
    WIN: 'WIN'
};
    const createGAME_STATE= () => ({
        current_state: STATE.MENU,
        level: 1,
        score: 0,
        score_target:1000,
        board:  Array.from({length: TOTAL_ROWS}, () => Array(COLS).fill(0)),
        board_predict: Array.from({length: ROWS_PREDICT}, () => Array(COLS_PREDICT).fill(0)),
        interval: 1000,
        lastTimeStamp:0,
        timeCounter:0,
        player: {
            current_piece: null, // mảng 2 chiều của khối hiện tại
            next_piece: null, // mảng 2 chiều của khối tiếp theo
            position: {x: 0, y: 0},
            position_predict: {x: 0, y: 0},
            isFirstWin: true,
        }
    });

let GAME_STATE = createGAME_STATE();
let animationID;

// hàm render lvl và target score cho play screen ui
function renderPlayScreenUI(){
    const curLevel = document.getElementById('current-level');
    curLevel.textContent = GAME_STATE.level;

    const curTargetScore = document.getElementById('target-score');
    curTargetScore.textContent = GAME_STATE.score_target;
}

// hàm render current score và target score cho over ui
function renderOverUI(){
    const curScore = document.getElementById('over-current-score');
    curScore.textContent = GAME_STATE.score;
    curScore.style.color = "#c61515";

    const curTargetScore = document.getElementById('over-target-score');
    curTargetScore.textContent = GAME_STATE.score_target;
}

// hàm render current score và target score cho win ui
function renderWinUI(){
    const curScore = document.getElementById('win-current-score');
    curScore.textContent = GAME_STATE.score;
    curScore.style.color = "#008001";

    const curTargetScore = document.getElementById('win-target-score');
    curTargetScore.textContent = GAME_STATE.score_target;
}

//hàm render target score và thêm dataset score cho main menu screen UI và gán target score cho lvl
function renderMainMenuUI(){
    levelBtn.forEach((btn) => {
        const lvl = parseInt(btn.getAttribute('data-level'));
        const target_score = (1000 * lvl) * 20 / 100;
        const score_point_display = btn.querySelector('.score-point-p');
        if(score_point_display){
            score_point_display.textContent = target_score.toString();
        }
        btn.setAttribute('data-targetScore', target_score.toString());
    })
}
// Hàm tạo list 7 khối random
function createTBag() {
    const tempBag = Object.keys(TETRIS_PIECES);
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
            const currentLevel = btn.getAttribute('data-level');
            const targetScore = btn.getAttribute('data-targetScore');

            GAME_STATE.level = currentLevel;
            // console.log(GAME_STATE.level);
            GAME_STATE.score_target = targetScore;
            // console.log(GAME_STATE.score_target);
        })
    })
}

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
function drawBoard(board, context){
    for (let row = board.length === TOTAL_ROWS? BUFFER: 0; row < board.length ; row++) {
        for (let col = 0; col < board[0].length; col++) {
            let x = col * SCALE;
            let y = board.length === TOTAL_ROWS? (row - BUFFER) * SCALE: row * SCALE;
            let color = board[row][col];

            drawSquare(x, y, color, context);
        }
    }
}

// Hàm vẽ khối piece hiện tại của người chơi
function drawPiece(x, y, piece_matrix, context){
    for (let row = 0; row < piece_matrix.length; row++) {
        for (let col = 0; col < piece_matrix[0].length; col++) {
            let color = piece_matrix[row][col]
            if(color !== 0) {
                let pieceX = (x + col) * SCALE;
                let pieceY = context === CTX? (y +row - BUFFER) * SCALE: (y +row) * SCALE;
                drawSquare(pieceX, pieceY, color, context);
            }
        }
    }
}
// hàm vẽ ô vuông
function drawSquare(x, y, color, context) {
    context.fillStyle =  PIECE_COLOR[color];
    context.fillRect(x, y, SCALE, SCALE);

    context.strokeStyle = "#111";
    context.lineWidth = 0.5;
    context.strokeRect(x, y, SCALE, SCALE);

}

//  Hàm xóa sạch canvas
function clearCanvas() {
    CTX.clearRect(0, 0, CANVAS.with, CANVAS.height);
}
// Hàm loop game
function gameLoop(timeStamp){
    if(GAME_STATE.current_state !== STATE.PLAYING){
        GAME_STATE.lastTimeStamp = timeStamp;
        animationID = requestAnimationFrame(gameLoop);
        return;

    }
    if(GAME_STATE.current_state === STATE.PLAYING){
        const xPredict = GAME_STATE.player.position_predict.x;
        const yPredict = GAME_STATE.player.position_predict.y;

        const timePass = timeStamp - GAME_STATE.lastTimeStamp;

        GAME_STATE.lastTimeStamp = timeStamp;
        GAME_STATE.timeCounter += timePass;
        if(GAME_STATE.timeCounter  >= GAME_STATE.interval){
            GAME_STATE.timeCounter -= GAME_STATE.interval;

            // console.log(T_BAG, predict_piece_matrix, xPredict, yPredict);
            // Thực hiện sau 1 giây có những phương thức
            gravity();

        }

        clearCanvas();

        // vẽ cho cái dự đoán tetris tiếp theo
        drawBoard(GAME_STATE.board_predict, CTX_PREDICT);
        drawPiece(xPredict, yPredict, GAME_STATE.player.next_piece, CTX_PREDICT);

        // Vẽ cho bàn cờ chính
        drawBoard(GAME_STATE.board, CTX);
        drawPiece(GAME_STATE.player.position.x, GAME_STATE.player.position.y, GAME_STATE.player.current_piece, CTX);


        animationID = requestAnimationFrame(gameLoop);
    }

}

// hàm thêm 7 khối tetris random vào T_BAG
function addTBag(){
    const tempBag = createTBag();
    for (let i=0; i < tempBag.length; i++){
        T_BAG.push(tempBag[i]);
    }
}
// hàm lấy phần tử đầu tiên trong T_BAG và thêm phần tử tiếp theo vào next piece
function spawnNewTetris(){
    if(T_BAG.length < 2){
        addTBag();
    }

    GAME_STATE.player.position.x = TETRIS_PIECES[T_BAG.slice(0,1)].x;
    GAME_STATE.player.position.y = TETRIS_PIECES[T_BAG.slice(0,1)].y;
    GAME_STATE.player.current_piece = TETRIS_PIECES[T_BAG.shift()].matrix;

    GAME_STATE.player.position_predict.x = TETRIS_PIECES[T_BAG.slice(0,1)].x_predict;
    GAME_STATE.player.position_predict.y = TETRIS_PIECES[T_BAG.slice(0,1)].y_predict;
    GAME_STATE.player.next_piece =  TETRIS_PIECES[T_BAG[0]].matrix;

}

// hàm trả về true có va chạm với khối hoặc biên
function isCollide(){
    const currentX = GAME_STATE.player.position.x;
    const currentY = GAME_STATE.player.position.y;
    const currentPieceMatrix = GAME_STATE.player.current_piece;

    for (let row = 0; row < currentPieceMatrix.length; row++) {
        for (let col = 0; col < currentPieceMatrix[0].length; col++) {
            const squareX = currentX + col;
            const squareY = currentY + row;

            if(currentPieceMatrix[row][col] !== 0){
                // console.log("\n");
                // vượt khỏi bàn cờ 24 dòng 10 cột (va chạm biên)
                if( (0 > squareX || squareX > 9 || 0 > squareY || squareY > 23) ){
                    return true;
                }

                // va chạm với khối
                else if (GAME_STATE.board[squareY][squareX] !== 0){
                    return true;
                }
            }
        }
    }
    return false;
}

// hàm cập nhật điểm khi ăn dòng
function updateScore(totalClearedLines) {
    if(totalClearedLines !== 0){
        const score = 100;
        GAME_STATE.score += totalClearedLines * score + (score * (totalClearedLines - 1));
        CURRENT_SCORE_POINT.textContent = GAME_STATE.score;
    }

    if(passTarget()){
        CURRENT_SCORE_POINT.textContent = GAME_STATE.score;
        CURRENT_SCORE_POINT.style.color = "#008001";

        if(GAME_STATE.player.isFirstWin){
            GAME_STATE.player.isFirstWin = false;
            displayWin();
        }
    } else if(!passTarget()){
        CURRENT_SCORE_POINT.style.color = "";
    }

    // restart cập nhật lại điểm
    if(totalClearedLines === 0){
        CURRENT_SCORE_POINT.textContent = GAME_STATE.score;
    }
}

// hàm xóa dòng khi đủ  và gọi hàm updateScore
function clearLines(){
    let totalClearedLines = 0;
    for (let row = 23; row >= 0; row--){
        let canClear = true;
        for (let col = 9; col >= 0; col--){
            if(GAME_STATE.board[row][col] === 0){
                canClear = false;
                break;
            }
        }
        if(canClear){
            const emptyRow = Array(10).fill(0);
            GAME_STATE.board.splice(row, 1);
            GAME_STATE.board.unshift(emptyRow);
            totalClearedLines++;
            row++;
        }
    }
    updateScore(totalClearedLines);
}

// hàm merge khối vào bàn cờ
function mergeBoard(){
    const currentX = GAME_STATE.player.position.x;
    const currentY = GAME_STATE.player.position.y;
    const currentPieceMatrix = GAME_STATE.player.current_piece;
    for (let row = 0; row <currentPieceMatrix.length; row++) {
        for (let col = 0; col < currentPieceMatrix[0].length; col++) {
            if(currentPieceMatrix[row][col] !== 0){
                GAME_STATE.board[currentY + row][currentX + col] = currentPieceMatrix[row][col];
            }
        }
    }
}

// hàm hiển thị kết thúc game do over
function displayOver(){
    GAME_STATE.current_state = STATE.OVER;
    const over_overlay = document.getElementById("over-overlay");
    if(over_overlay){
        over_overlay.classList.add("active");
        renderOverUI();
    }
}

// hàm hiển thị win game
// hàm hiển thị kết thúc game do over
function displayWin(){
    GAME_STATE.current_state = STATE.WIN;
    const win_overlay = document.getElementById("win-overlay");
    if(win_overlay){
        win_overlay.classList.add("active");
        renderWinUI();
    }
}

// hàm di chuyển khối hiện tại xuống mỗi giây
function gravity(){
    GAME_STATE.player.position.y += 1;
    if(isCollide()){
        GAME_STATE.player.position.y -= 1;
        mergeBoard();
        clearLines();
        spawnNewTetris();
        if(isCollide())
            displayOver();
    }
}

// hàm rotate khối
function rotate(){
    const currentPieceMatrix = GAME_STATE.player.current_piece;
    const tempPiece = structuredClone(currentPieceMatrix);
    const afterRotate = Array.from({length: currentPieceMatrix.length}
        , ()=> Array(currentPieceMatrix[0].length).fill(0)) ;
    for (let row = 0; row < currentPieceMatrix.length; row++){
        for (let col = 0; col < currentPieceMatrix[0].length; col++) {
                afterRotate[col][(currentPieceMatrix.length -1) - row] = tempPiece[row][col];
        }
    }
    GAME_STATE.player.current_piece = afterRotate;
    if(isCollide()){
        GAME_STATE.player.current_piece = tempPiece;
    }
}

// hàm di chuyển khối tetris hiện tại
function moveTetris(){
    window.addEventListener('keydown', function(e){
        switch (e.key){
            case 'ArrowUp':
                rotate();
                break;
            case 'ArrowDown':
                gravity();
                break;
            case 'ArrowLeft':
                GAME_STATE.player.position.x -= 1;
                if(isCollide()){
                    GAME_STATE.player.position.x += 1;
                }
                break;
            case 'ArrowRight':
                GAME_STATE.player.position.x += 1;
                if(isCollide()){
                    GAME_STATE.player.position.x -= 1;
                }
                break;
        }
    })
}
// gán sự kiện cho nút play game
function clickedPlayBtn(){
    PLAY_BTN.addEventListener('click', function(e){
        renderPlayScreenUI();
        GAME_STATE.current_state = STATE.PLAYING;
        GAME_STATE.lastTimeStamp = performance.now();
        spawnNewTetris();
        requestAnimationFrame(gameLoop);
    })
}

// gán sự kiện cho nút pause trong play screen
function clickedPauseBtn(){
    PAUSE_BTN.addEventListener('click', function(e){
        const pauseOverlay = document.querySelector('.pause-overlay');
        if(pauseOverlay){
            pauseOverlay.classList.add('active');
            GAME_STATE.current_state = STATE.PAUSE;
        }
    })
}

// hàm xóa active của overlay
function removeActiveOverlay(nameOverlay){
        const overlay = document.querySelector(`.${nameOverlay}.active`);
        if(overlay){
            overlay.classList.remove('active');
        }
}

// hàm resetGame reset lại trạng thái game về ban đầu
function resetGame(){
    cancelAnimationFrame(animationID);
    T_BAG.splice(0, T_BAG.length);
    Object.assign(GAME_STATE, createGAME_STATE());

    const selectedBtn = document.querySelector('.btn-level.active');
    if (selectedBtn) {
        selectedBtn.classList.remove('active');
    }

    clearCanvas();
    CTX_PREDICT.clearRect(0, 0, CANVAS_PREDICT.width, CANVAS_PREDICT.height);
    updateScore(0);

}

// hàm restartGame restart lại trạng thái game
function restartGame(){
    const curTaget = GAME_STATE.score_target;
    const curLevel = GAME_STATE.level;
    const isFirstWin = GAME_STATE.player.isFirstWin;

    cancelAnimationFrame(animationID);
    T_BAG.splice(0, T_BAG.length);
    Object.assign(GAME_STATE, createGAME_STATE());

    GAME_STATE.player.isFirstWin = isFirstWin;
    GAME_STATE.score_target = curTaget;
    GAME_STATE.level = curLevel;
    renderPlayScreenUI();

    GAME_STATE.lastTimeStamp = performance.now();
    GAME_STATE.current_state= STATE.PLAYING;
    updateScore(0);
    spawnNewTetris();
    animationID = requestAnimationFrame(gameLoop);

}


// hàm gán sự kiện cho 3 nút trong overlay
function clickedBtnOverlay(){
    const allBtn = document.querySelectorAll('[data-Option]');
    allBtn.forEach((button) => {
        button.addEventListener('click', function(e){
            if(button.getAttribute('data-Option') === "Resume"){
                GAME_STATE.current_state = STATE.PLAYING;
                removeActiveOverlay("pause-overlay");
                removeActiveOverlay("win-overlay");
            }
            else if(button.getAttribute('data-Option') === "Restart"){
                restartGame();
                removeActiveOverlay("over-overlay");
                removeActiveOverlay("pause-overlay");
                removeActiveOverlay("win-overlay");

            } else{
                resetGame();
                GAME_STATE.current_state = STATE.MENU;
                navigateScreen();
                removeActiveOverlay("pause-overlay");
                removeActiveOverlay("over-overlay");
                removeActiveOverlay("win-overlay");
            }
        })
    })
}
// hàm kích hoạt nút pasue button trong play screen
function triggerPauseButton(){
    const pauseOverlay = document.querySelector('.pause-overlay');
    if(pauseOverlay) {
        pauseOverlay.classList.add('active');
        GAME_STATE.current_state = STATE.PAUSE;
    }
}
// hàm kiểm tra xem người dùng có tab sang trang khác ko
function checkTabVisibility(){
    document.addEventListener('visibilitychange', function(e){
        if(document.visibilityState === 'hidden' && GAME_STATE.current_state === STATE.PLAYING){
            triggerPauseButton();
        }
    })
}
// hàm kiểm tra xem current score đạt target chưa
function passTarget(){
    return GAME_STATE.score >= GAME_STATE.score_target;
}

// hàm bắt đầu game
function initGame(){
    renderMainMenuUI();
    levelSelection();
    navigateScreen();
    clickedPlayBtn();
    clickedBtnOverlay();
    moveTetris();
    checkTabVisibility();
    clickedPauseBtn();
}
initGame();
