import '../dist/styles.scss';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH} from './constants';
import {Page} from './game';

// Init canvas
const canvas = document.querySelector('canvas');
canvas.height = (BLOCK_SIZE + 1) * BOARD_HEIGHT + 1;
canvas.width = (BLOCK_SIZE + 1) * BOARD_WIDTH + 1;
const page = new Page(canvas);

// Init dialog
const dialog = document.querySelector('.dialog');
const countButtons = dialog.querySelectorAll('button');
const restartButton = document.querySelector('button.restart');

// snake count listener
Array.from(countButtons).forEach((button, index) => {
  button.addEventListener('click', () => {
    page.init(index + 1);
    dialog.classList.add('hide');
  });
});

restartButton.addEventListener('click', () => {
  page.stopGame();
  dialog.classList.remove('hide');
});

window.addEventListener('keydown', (event) => page.onKeyDown(event));
