import '../dist/styles.scss';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH} from './constants';
import {Page} from './game';

// init canvas
const canvas = document.querySelector('canvas');
canvas.height = (BLOCK_SIZE + 1) * BOARD_HEIGHT + 1;
canvas.width = (BLOCK_SIZE + 1) * BOARD_WIDTH + 1;
const page = new Page(canvas);

// make dialog
const dialog = document.querySelector('.dialog');
const buttons = dialog.querySelectorAll('button');
Array.from(buttons).forEach((button, index) => {
  button.addEventListener('click', () => {
    page.init(index + 1);
    dialog.classList.add('hide');
  });
});

console.log('hello')
// todo: remove event klistners
window.addEventListener('keydown', (event) => page.onKeyDown(event));
