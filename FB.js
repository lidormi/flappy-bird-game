// הגדרות
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// הגדרות הציפור
let birdWidth = 34;
let birdHeight = 24;
let bird = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: birdWidth,
    height: birdHeight,
    velocityY: 0 // מהירות הציפור בכיוון Y
};

// הגדרות הצינורות
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeGap = 150;  // הגובה של הרווח בין הצינורות

// משתנים עבור התנועה
let velocityX = -2; // מהירות הצינורות
let gravity = 0.4; // כוח הכבידה
let jumpPower = -10; // כוח הקפיצה של הציפור
let score = 0;
let gameOver = false;
let gameStarted = false;
let pipeInterval;

let birdImg, topPipeImg, bottomPipeImg;

// טוען תמונות כשדף נטען
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // תמונת הציפור
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // תמונות הצינורות
    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    // מאזינים לאירועים - התחלת המשחק ומעבר הציפור
    document.addEventListener("keydown", startGame);
    document.addEventListener("keydown", moveBird);
    board.addEventListener("click", startGame); // התחלת המשחק בלחיצה על המסך
    board.addEventListener("touchstart", startGame); // התחלת המשחק בלחיצה על המסך במובייל
};

// התחלת המשחק כאשר לוחצים על רווח או על המסך
function startGame(e) {
    if (!gameStarted || gameOver) {
        // אתחול מחדש של המשחק
        bird.y = boardHeight / 2;
        bird.velocityY = 0;
        pipeArray = [];
        score = 0;
        gameOver = false;
        gameStarted = true;
        clearInterval(pipeInterval); // מנקה את האינטרוול הקודם
        pipeInterval = setInterval(placePipes, 1500); // הוספת צינורות כל 1.5 שניות
        requestAnimationFrame(update);  // התחלת הלולאה של המשחק
    }
}

// עדכון מצב המשחק בכל פריים
function update() {
    if (gameOver) return;

    context.clearRect(0, 0, boardWidth, boardHeight); // מנקה את המסך

    // גרביטציה ותנועת הציפור
    bird.velocityY += gravity;
    bird.y = Math.max(bird.y + bird.velocityY, 0); // למנוע מהציפור לצאת מהמסך למעלה

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // מצייר את הציפור

    // בדיקת פגיעה בתקרה או רצפה
    if (bird.y >= boardHeight - bird.height || bird.y <= 0) {
        gameOver = true;
    }

    // תנועת הצינורות ובדיקת פגיעות
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // הצינורות זזים שמאלה
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // אם הציפור פוגעת בצינור, המשחק נגמר
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }

        // עדכון ניקוד כשהציפור עברה צינור
        if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
            score += 0.5;
            pipe.passed = true;
        }
    }

    // הצגת הניקוד
    context.fillStyle = "white";
    context.font = "35px sans-serif";
    context.fillText(score.toFixed(1), 7, 48);

    if (gameOver) {
        context.fillText("Game Over", boardWidth / 2 - 100, boardHeight / 2 - 25);  // מציג את ההודעה Game Over
        context.fillText("Click to Restart", boardWidth / 2 - 120, boardHeight / 2 + 25); // מורה להתחיל מחדש
        clearInterval(pipeInterval); // מנקה את האינטרוול של הצינורות
    }

    // ניקוי הצינורות שהפכו לשמלאים
    clearPipes();

    if (!gameOver) {
        requestAnimationFrame(update);  // קורא לעדכון הבא של המסך
    }
}

// הוספת צינורות חדשים למסך
function placePipes() {
    // הוספת רווח בין הצינורות
    let randomPipeY = Math.random() * (pipeHeight - pipeGap - 50) + 50; // הגובה הרנדומלי לצינור העליון

    // צינור עליון
    let topPipe = {
        img: topPipeImg,
        x: boardWidth,
        y: randomPipeY - pipeHeight, // הצינור העליון ממוקם בגובה רנדומלי
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    // צינור תחתון
    let bottomPipe = {
        img: bottomPipeImg,
        x: boardWidth,
        y: randomPipeY + pipeGap, // הצינור התחתון ממוקם מתחת לצינור העליון
        width: pipeWidth,
        height: pipeHeight
    };

    // הוספת הצינורות למערך
    pipeArray.push(topPipe);
    pipeArray.push(bottomPipe);
}

// תנועת הציפור ברגע שלוחצים על מקש (רווח או חץ למעלה)
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        bird.velocityY = jumpPower; // הציפור קופצת למעלה
    }
}

// פונקציה לבדוק אם הציפור פוגעת בצינור
function detectCollision(a, b) {
    return a.x + a.width > b.x &&
           a.x < b.x + b.width &&
           a.y + a.height > b.y &&
           a.y < b.y + b.height;
}

// ניקוי הצינורות שיצאו מהמסך
function clearPipes() {
    while (pipeArray.length > 0 && pipeArray[0].x + pipeWidth < 0) {
        pipeArray.shift(); // מסיר צינורות שהתפוגגו מהמסך
    }
}