import '../dist/styles.scss';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH} from './constants';
import {Dialog} from './dialog';
import {Page} from './game';

class Index {
  canvas = document.querySelector('canvas');
  page = new Page(this.canvas);
  dialog = new Dialog();

  // don't need to be a class variable
  countButtons: HTMLButtonElement[] =
      Array.from(this.dialog.dialogElement.querySelectorAll('button'));
  restartButton: HTMLButtonElement = document.querySelector('button.restart');
  pauseButton: HTMLButtonElement = document.querySelector('button.pause');

  constructor() {
    this.initCanvas();
    this.addListeners();
  }

  initCanvas() {
    this.canvas.height = (BLOCK_SIZE + 1) * BOARD_HEIGHT + 1;
    this.canvas.width = (BLOCK_SIZE + 1) * BOARD_WIDTH + 1;
  }

  addListeners() {
    // snake count listener
    this.countButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.page.init(index + 1);
        this.dialog.dialogElement.classList.add('hide');
      });
    });

    this.restartButton.addEventListener('click', () => {
      this.page.stopGame();
      this.dialog.dialogElement.classList.remove('hide');
    });

    this.pauseButton.addEventListener('click', () => {
      const isPausing = this.pauseButton.innerText === 'Pause';
      this.page.pauseGame(isPausing);
      this.flipPauseButtons(isPausing);
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