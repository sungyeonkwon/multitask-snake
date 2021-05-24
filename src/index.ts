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
    console.log('debounce', debounce);
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
      window.addEventListener('mousedown', () => {
        this.shouldRecord = true;
        document.body.style.cursor = 'crosshair';
      });

      window.addEventListener('mouseup', () => {
        this.shouldRecord = false;
        document.body.style.cursor = 'default';
      });

      // Add throttle
      window.addEventListener('mousemove', (event: MouseEvent) => {
        if (!this.shouldRecord) return;

        const {pageX, pageY} = event;
        const {left, top} = this.canvas.getBoundingClientRect();
        const normalisedX = Math.floor((pageX - left) / BLOCK_SIZE);
        const normalisedY = Math.floor((pageY - top) / BLOCK_SIZE);
        this.page.board.setWalls(normalisedX, normalisedY);
      }, false);
    });

    this.eraserButton.addEventListener('click', () => {
      console.log('eraser');
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