import {BehaviorSubject} from 'rxjs';
import {SNAKES} from '../constants';
import {getFullPattern} from '../helpers';

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
          this.dialogElement.classList.add('hide');
          return;
        case DialogState.GAME_CONFIG:
          this.dialogElement.classList.remove('hide');
          this.dialogElement.classList.remove('gameover');
          return;
        case DialogState.GAME_OVER:
          this.dialogElement.classList.remove('hide');
          this.dialogElement.classList.add('gameover');
          document.querySelector('button.restart')
              .addEventListener(
                  'click', () => this.setDialogState(DialogState.GAME_CONFIG));
          return;
        default:
          return;
      }
    })
  }

  setDialogState(state: DialogState) {
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
        <h1>Game Over</h1>
        <button class="restart">Restart</button>
      </div>
      <div class="config-container">
        <h1>Choose your snakes</h1>
        <div class="type-container">
          ${this.getSnakesTemplate()}
        </div>
        <h1>How many snakes can you handle?</h1>
        <div class="count-container">
          <button class="count" data-count="1" type="button">× 1</button>
          <button class="count" data-count="2" type="button">× 2</button>
          <button class="count" data-count="3" type="button">× 3</button>
          <button class="count" data-count="4" type="button">× 4</button>
          <button class="count" data-count="5" type="button">× 5</button>
        </div>
        <button class="start" type="button">Start game</button>
      </div>
    `;
  }
}
