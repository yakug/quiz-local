let questions = [];
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;
let userAnswers = [];

// CSV読み込み
async function loadCSV() {
    const res = await fetch("questions.csv");
    const text = await res.text();

    const lines = text.trim().split("\n");

    questions = lines.map(line => {
        const [question, answer, explanation] = line.split(",");

        return {
            question: question,
            answer: answer.trim() === "true",
            explanation: explanation
        };
    });
}

// 10問ランダム抽選
function pickRandomQuestions() {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
}

// 画面切り替え
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// クイズ開始
document.getElementById("start-btn").addEventListener("click", async () => {
    const name = document.getElementById("username").value;
    if (!name) return alert("ニックネームを入力してね");

    await loadCSV(); // ← CSV読み込み

    selectedQuestions = pickRandomQuestions();
    currentIndex = 0;
    score = 0;
    userAnswers = [];

    loadQuestion();
    showScreen("quiz-screen");
});

// 問題読み込み
function loadQuestion() {
    const q = selectedQuestions[currentIndex];
    document.getElementById("question-number").textContent = `${currentIndex + 1} / 10`;
    document.getElementById("question-text").textContent = q.question;
}

// ○×ボタン
document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const userAnswer = btn.dataset.answer === "true";
        const correct = selectedQuestions[currentIndex].answer;

        // 解説用に記録
        userAnswers.push({
            question: selectedQuestions[currentIndex].question,
            correctAnswer: correct,
            userAnswer: userAnswer,
            explanation: selectedQuestions[currentIndex].explanation
        });

        if (userAnswer === correct) score++;

        currentIndex++;

        if (currentIndex < 10) {
            loadQuestion();
        } else {
            showResult();
        }
    });
});

// 結果表示（解説つき）
function showResult() {
    document.getElementById("score-text").textContent =
        `正解数：${score} / 10（正答率 ${(score / 10 * 100).toFixed(0)}%）`;

    const explanationDiv = document.getElementById("explanation-list");
    explanationDiv.innerHTML = "";

    userAnswers.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("explanation-item");

        div.innerHTML = `
            <p><strong>${index + 1}問目：</strong> ${item.question}</p>
            <p>あなたの答え：${item.userAnswer ? "○" : "×"}</p>
            <p>正解：${item.correctAnswer ? "○" : "×"}</p>
            <p class="exp">解説：${item.explanation}</p>
            <hr>
        `;

        explanationDiv.appendChild(div);
    });

    showScreen("result-screen");
}

// もう一度
document.getElementById("restart-btn").addEventListener("click", () => {
    showScreen("start-screen");
});
