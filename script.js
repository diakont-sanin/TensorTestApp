const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]
const cellElements = document.querySelectorAll('[data-cell]')
const board = document.getElementById('board')

const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
const playerTurnButton = document.getElementById('playerTurn')
const aiTurnButton = document.getElementById('aiTurn')
const winningMessageTextElement = document.querySelector(
  '[data-winning-message-text]'
)
const score = document.getElementsByClassName('list-group-item')
const history = document.getElementById('list-history')
const radio = document.getElementsByName('checkbox')

playerTurnButton.addEventListener('click', () => startGame())
aiTurnButton.addEventListener('click', () => startGame())
restartButton.addEventListener('click', () => startGame())

let aiTurn

startGame()

function startGame() {//Начало игры. Удаление слушателей и элемента сообщения для "перезагрузки" игры
  
  radio[0].checked ? aiTurn = false : aiTurn = true
  
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS)
    cell.classList.remove(CIRCLE_CLASS)
    cell.removeEventListener('click', handleClick)
    cell.addEventListener('click', handleClick, { once: true })
  })
  drawHistory()
  setBoardTurn()
  winningMessageElement.classList.remove('show')
}



function handleClick(e) { //Функция определяет элемент для "рисования" Х 
  if (e.target.classList.contains(CIRCLE_CLASS)) return //поверх "О" рисовать нельзя
  const cell = e.target
  const currentClass = X_CLASS
  placeMark(cell, currentClass)
  if (checkWin(currentClass)) {
    addToHistory('Победа')
    endGame(false)
  } else if (isDraw()) {
    endGame(true)
  } else {
    swapTurns()
    setBoardTurn()
  }
}

function addToHistory(result) { //Записываем в localStorage результаты каждой игры
  const date = new Date().toLocaleString('en-GB') 
  const existingEntries = JSON.parse(localStorage.getItem('history')) || [] //[] if null
  const entry = {
    date,
    result,
  }
  existingEntries.push(entry)
  localStorage.setItem('history', JSON.stringify(existingEntries))
}

function drawHistory() {// "Рисуем" статистику игр и историю, предварительно очищая значение элемента history,исключая дублирование записей
  history.innerHTML = ''
  const historyGames = JSON.parse(localStorage.getItem('history')) || []

  const all = historyGames.length
  const win = historyGames.filter((item) => item.result === 'Победа').length
  const loose = historyGames.filter((item) => item.result === 'Поражение').length
  const draw = historyGames.filter((item) => item.result === 'Ничья').length

  score[0].textContent = 'Всего игр: ' + all
  score[1].textContent = 'Победы игрока: ' + win
  score[2].textContent = 'Победы компьютера: ' + loose
  score[3].textContent = 'Ничья: ' + draw

  historyGames.map((item) => {
    history.classList.add('list-group-item')
    history.innerHTML += `<a>${item.date}</a><p>${item.result}</p>`
  })
}

function autoTurn() { //Ход компьютера. Проверяюся все свободные поля и в случайное ставится  "О"
  const currentClass = CIRCLE_CLASS
  const rndCell = [...cellElements].filter(item=>item.classList.value === "cell")
  const id = Math.floor(Math.random() * rndCell.length)
  rndCell[id].classList.add(CIRCLE_CLASS)
  placeMark(rndCell[id], currentClass)
  if (checkWin(currentClass)) {
    addToHistory('Поражение')
    endGame(false)
  } else if (isDraw()) {
    endGame(true)
  } else {
    swapTurns()
    setBoardTurn()
  }
}

function placeMark(cell, currentClass) { //Функция добавления класса. Принимает элемент и текущий класс 
  cell.classList.add(currentClass)
}

function swapTurns() {//Смена хода
  aiTurn = !aiTurn
}

function setBoardTurn() { //Проверка хода для добавления соответствующего класса
  if (aiTurn) {
    autoTurn()
  } else {
    board.classList.add(X_CLASS)
  }
}

function endGame(draw) { //Функция окончания игры. Принимает true только если ничья 
  if (draw) {
    winningMessageTextElement.innerText = 'Ничья!'
    addToHistory('Ничья')
  } else {
    winningMessageTextElement.innerText = `${
      aiTurn ? 'Компьютер' : 'Ты'
    } победил!`
  }
  winningMessageElement.classList.add('show')
}

function isDraw() { //Если все элементы с классами (все поля заполнены "Х" или "О"), то ничья
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    )
  })
}



function checkWin(currentClass) { //Функция принимает текущее значение класса элемента. Проверка на соответствие WINNING_COMBINATIONS
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass)
    })
  })
}
