import {BehaviorSubject} from 'rxjs';
import {SNAKES} from '../constants';
import {getFullPattern} from '../helpers';

// TODO: rename to game state and use it for disabling the buttons
export enum DialogState {
  GAME_CONFIG = 1,
  HIDDEN,
  GAME_OVER,
}

export class Dialog {
  private dialogState$ = new BehaviorSubject(DialogState.GAME_CONFIG);

  dialogElement: HTMLElement = document.getElementById('dialog')!;
  startButton: HTMLButtonElement;
  countButtons: HTMLButtonElement[];
  typeButtons: HTMLButtonElement[];

  constructor() {
    this.dialogElement.innerHTML = this.getTemplate();
    this.startButton = this.dialogElement.querySelector('button.start');
    this.countButtons =
        [...this.dialogElement.querySelectorAll('button.count')] as
        HTMLButtonElement[];
    this.typeButtons =
        [...this.dialogElement.querySelectorAll('button.type')] as
        HTMLButtonElement[];

    this.dialogState$.subscribe((state: DialogState) => {
      switch (state) {
        case DialogState.HIDDEN:
          this.dialogElement.classList.add('transition');
          this.dialogElement.classList.add('hide');
          return;
        case DialogState.GAME_CONFIG:
          this.dialogElement.classList.remove('hide');
          this.dialogElement.classList.remove('gameover');
          return;
        case DialogState.GAME_OVER:
          this.dialogElement.classList.remove('hide');
          this.dialogElement.classList.add('gameover');
          return;
        default:
          return;
      }
    })
  }

  setDialogState(state: DialogState, gameOverMessage = '') {
    if (gameOverMessage) {
      (document.querySelector('.message') as HTMLParagraphElement).innerText =
          gameOverMessage;
    }
    this.dialogState$.next(state);
  }

  getSnakesTemplate() {
    return `
        ${
        SNAKES
            .map(snake => {
              const p = getFullPattern(snake.pattern, 8);
              const sections =
                  [0, 1, 2, 3, 4, 5, 6, 7]
                      .map(
                          index => `<span class="section" style="background: ${
                              p[index]}"></span>`)
                      .join('');
              return `<button class="type" data-type="${snake.type}">
              <div class="body">
                ${sections}
              </div>
              <h5 class="name">${snake.type}</h5>
            </button>`
            })
            .join('')}
      `;
  }

  getTemplate() {
    return `
      <div class="gameover-container">
        <h1>* Game over *</h1>
        <p class="message"></p>
        <button class="restart">Restart</button>
      </div>
      <div class="config-container">
        <div class="type-container">
          <h1 class="subheader">Choose your snakes</h1>
          <div>
            <div class="pad"></div>
            <div class="scroller">
              ${this.getSnakesTemplate()}
            </div>
          </div>
        </div>

        <div class="count-container">
        <h1 class="subheader">How many snakes can you handle?</h1>
          <div>
            <button class="count" data-count="1" type="button">× 1</button>
            <button class="count" data-count="2" type="button">× 2</button>
            <button class="count" data-count="3" type="button">× 3</button>
            <button class="count" data-count="4" type="button">× 4</button>
            <button class="count" data-count="5" type="button">× 5</button>
          </div>
        </div>
        <button class="start" type="button">Start game</button>
      </div>
    `;
  }
}
