import '../dist/styles.scss';

import {debounce} from 'debounce';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_GAME_CONFIG, GameConfig, SnakeType} from './constants';
import {Page} from './game/game';
import {DialogState} from './ui/dialog';

enum Selector {
  COUNT_CONTAINER = 'count-container',
  SELECTED = 'selected',
}

class Index {
  isDebugMode = this.getDebugMode();
  canvas = document.querySelector('canvas');
  page = new Page(this.canvas);
  dialog = this.page.dialog;

  restartButton: HTMLButtonElement = document.querySelector('button.restart');
  pauseButton: HTMLButtonElement = document.querySelector('button.pause');
  pencilButton: HTMLButtonElement = document.querySelector('button.pencil');
  eraserButton: HTMLButtonElement = document.querySelector('button.eraser');

  /** Should it record mouse movement for walls */
  shouldRecord = false;

  constructor() {
    this.initCanvas();
    this.addListeners();
    this.updateSelectedConfig();
    this.enableDebugMode();
    console.log('debounce', debounce);
  }

  private enableDebugMode() {
    if (!this.isDebugMode) return;

    console.log('enableDebugMode');
    const gridRow = document.createElement('div');
    gridRow.classList.add('debug');

    for (let i = 0; i < BOARD_WIDTH; i++) {
      const span = document.createElement('span');
      span.innerText = String(i + 1);
      gridRow.appendChild(span);
    }
    document.querySelector('.container').prepend(gridRow);


    // TODO: append grid
  }

  private getDebugMode() {
    var url = new URL(window.location.href);
    var params = new URLSearchParams(url.search);
    return params.get('debug');
  }

  initCanvas() {
    this.canvas.height = (BLOCK_SIZE + 1) * BOARD_HEIGHT + 1;
    this.canvas.width = (BLOCK_SIZE + 1) * BOARD_WIDTH + 1;
  }

  // separate snake count and type
  updateSelectedConfig() {
    this.dialog.countButtons.forEach((button) => {
      if (this.page.board.snakeCount === Number(button.dataset.count)) {
        button.classList.add(`${Selector.SELECTED}`);

      } else {
        button.classList.remove(`${Selector.SELECTED}`);
      }
    });

    this.dialog.typeButtons.forEach((button) => {
      if (this.page.board.snakeType === button.dataset.type) {
        button.classList.add(`${Selector.SELECTED}`);
      } else {
        button.classList.remove(`${Selector.SELECTED}`);
      }
    })
  }

  addShouldRecordListeners() {
    window.addEventListener('mousedown', () => {
      this.shouldRecord = true;
      document.body.style.cursor = 'crosshair';
    });

    window.addEventListener('mouseup', () => {
      this.shouldRecord = false;
      document.body.style.cursor = 'default';
    });
  }

  addListeners() {
    // snake count listener
    this.dialog.countButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.page.board.setSnakeCount(Number(button.dataset.count));

        this.updateSelectedConfig();
      });
    });

    // snake type listener
    this.dialog.typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.page.board.setSnakeType(button.dataset.type as SnakeType);

        this.updateSelectedConfig();
      });
    });

    this.dialog.startButton.addEventListener('click', () => {
      this.page.startGame();
      this.dialog.setDialogState(DialogState.HIDDEN);
    });

    this.pauseButton.addEventListener('click', () => {
      const isPausing = this.pauseButton.innerText === 'Pause';
      this.page.pauseGame(isPausing);
      this.flipPauseButtons(isPausing);
    });

    this.pencilButton.addEventListener('click', () => {
      this.addShouldRecordListeners();

      // Add throttle
      window.addEventListener('mousemove', (event: MouseEvent) => {
        if (!this.shouldRecord) return;

        const {pageX, pageY} = event;
        const {left, top} = this.canvas.getBoundingClientRect();
        const l = pageX - left;
        const r = pageY - top;

        const normalisedX = Math.floor(l / (BLOCK_SIZE + 1));
        const normalisedY = Math.floor(r / (BLOCK_SIZE + 1));
        this.page.board.setWalls(normalisedX, normalisedY);
      }, false);
    });

    this.eraserButton.addEventListener('click', () => {
      console.log('eraser');
      this.addShouldRecordListeners();

      // Add throttle
      window.addEventListener('mousemove', (event: MouseEvent) => {
        if (!this.shouldRecord) return;

        const {pageX, pageY} = event;
        const {left, top} = this.canvas.getBoundingClientRect();
        const l = pageX - left;
        const r = pageY - top;

        const normalisedX = Math.floor(l / (BLOCK_SIZE + 1));
        const normalisedY = Math.floor(r / (BLOCK_SIZE + 1));
        this.page.board.removeWalls(normalisedX, normalisedY);
      }, false);
    });

    window.addEventListener('keydown', (event) => this.page.onKeyDown(event));
  }

  private flipPauseButtons(isPausing = true) {
    const text = isPausing ? 'Resume' : 'Pause';
    this.pauseButton.innerText = text;
    this.pauseButton.classList.toggle('pause');
    this.pauseButton.classList.toggle('resume');
  }
}

new Index();