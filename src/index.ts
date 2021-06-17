import './styles/main.scss';
import 'reflect-metadata';

import {asyncScheduler, fromEvent} from 'rxjs';
import {filter, tap, throttleTime} from 'rxjs/operators';
import {container} from 'tsyringe';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, directionKeyMap, INTERVAL, selectedSnakeKeyMap, SnakeType} from './constants';
import {Game} from './game/game';
import {isDebugMode} from './helpers/utils';
import {AudioService, Sound} from './service/audio';
import {DialogState} from './ui/dialog';

enum Selector {
  COUNT_CONTAINER = 'count-container',
  SELECTED = 'selected',
}

class Index {
  private canvas = document.querySelector('canvas');
  game = new Game(this.canvas);
  dialog = this.game.dialog;

  restartButton: HTMLButtonElement = document.querySelector('button.restart');
  pauseButton: HTMLButtonElement = document.querySelector('button.pause');
  pencilButton: HTMLButtonElement = document.querySelector('button.pencil');
  eraserButton: HTMLButtonElement = document.querySelector('button.eraser');
  soundButton: HTMLButtonElement = document.querySelector('button.sound');

  /** Should it record mouse movement for walls */
  shouldRecord = false;

  constructor() {
    this.initCanvas();
    this.addListeners();
    this.updateSelectedConfig();
    this.enableDebugMode();
  }

  private enableDebugMode() {
    if (!isDebugMode()) return;

    console.log('[DEV] enableDebugMode');
    const gridRow = document.createElement('div');
    gridRow.classList.add('debug');

    for (let i = 0; i < BOARD_WIDTH; i++) {
      const span = document.createElement('span');
      span.innerText = String(i + 1);
      gridRow.appendChild(span);
    }
    document.querySelector('.container').prepend(gridRow);
  }

  initCanvas() {
    this.canvas.height = (BLOCK_SIZE + 1) * BOARD_HEIGHT + 1;
    this.canvas.width = (BLOCK_SIZE + 1) * BOARD_WIDTH + 1;
  }

  // separate snake count and type
  updateSelectedConfig() {
    this.dialog.countButtons.forEach((button) => {
      if (this.game.board.snakeCount === Number(button.dataset.count)) {
        button.classList.add(`${Selector.SELECTED}`);
      } else {
        button.classList.remove(`${Selector.SELECTED}`);
      }
    });

    this.dialog.typeButtons.forEach((button) => {
      if (this.game.board.snakeType === button.dataset.type) {
        button.classList.add(`${Selector.SELECTED}`);
      } else {
        button.classList.remove(`${Selector.SELECTED}`);
      }
    })
  }

  mouseDownListener = (event: MouseEvent) => {
    if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
    this.shouldRecord = true;
    document.body.style.cursor = 'crosshair';

    // only if the rendering isn't on
    if (!this.game.isGamePlaying) {
      this.game.render(true);
    }
  };

  mouseUpListener = (event: MouseEvent) => {
    if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
    this.shouldRecord = false;
    document.body.style.cursor = 'default';

    // only if the rendering isn't on
    if (!this.game.isGamePlaying) {
      cancelAnimationFrame(this.game.intervalId.value);
    }
  };

  pencilMouseMoveListener = (event: MouseEvent) => {
    if (!this.shouldRecord) return;
    const [normalisedX, normalisedY] = this.getNormalisedXY(event);
    this.game.board.setWalls(normalisedX, normalisedY);
  };

  eraserMouseMoveListener = (event: MouseEvent) => {
    if (!this.shouldRecord) return;
    const [normalisedX, normalisedY] = this.getNormalisedXY(event);
    this.game.board.removeWalls(normalisedX, normalisedY);
  };

  addShouldRecordListeners() {
    window.addEventListener('mousedown', this.mouseDownListener);
    window.addEventListener('mouseup', this.mouseUpListener);
  }

  removeMouseUpDownListners() {
    window.removeEventListener('mousedown', this.mouseDownListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
    window.removeEventListener('mousemove', this.pencilMouseMoveListener);
    window.removeEventListener('mousemove', this.eraserMouseMoveListener);
  }

  getNormalisedXY(event: MouseEvent): number[] {
    const {pageX, pageY} = event;
    const {left, top} = this.canvas.getBoundingClientRect();
    const l = pageX - left;
    const r = pageY - top;

    const normalisedX = Math.floor(l / (BLOCK_SIZE + 1));
    const normalisedY = Math.floor(r / (BLOCK_SIZE + 1));
    return [normalisedX, normalisedY]
  }

  addListeners() {
    fromEvent(this.soundButton, 'click').subscribe((event) => {
      container.resolve(AudioService)
          .toggleMute(event.target as HTMLButtonElement);
    });

    // snake count listener
    this.dialog.countButtons.forEach((button) => {
      button.addEventListener('click', () => {
        container.resolve(AudioService).play(Sound.BUTTON);
        this.game.board.setSnakeCount(Number(button.dataset.count));

        this.updateSelectedConfig();
      });
    });

    // snake type listener
    this.dialog.typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        container.resolve(AudioService).play(Sound.BUTTON);
        this.game.board.setSnakeType(button.dataset.type as SnakeType);

        this.updateSelectedConfig();
      });
    });

    this.dialog.startButton.addEventListener('click', (event) => {
      (event.target as HTMLButtonElement).classList.add('selected');
      container.resolve(AudioService).play(Sound.BUTTON);
      this.game.startGame();
      setTimeout(() => {
        this.dialog.setDialogState(DialogState.HIDDEN);
      }, 200);
    });

    this.restartButton.addEventListener('click', (event) => {
      container.resolve(AudioService).play(Sound.BUTTON);

      // TODO: disable all buttons except sound and restart
      [...document.querySelectorAll('button')].forEach(
          (button) => {
              // console.log('button', button);
          });

      (event.target as HTMLButtonElement).classList.add('selected');
      this.dialog.startButton.classList.remove('selected');
      this.pencilButton.classList.remove('selected');
      this.eraserButton.classList.remove('selected');

      setTimeout(() => {
        this.restartButton.classList.remove('selected');
        this.game.board.resetBoard();
        this.game.feature = null;
        this.game.dialog.setDialogState(DialogState.GAME_CONFIG);
      }, 200);
    });

    fromEvent(this.pauseButton, 'click')
        .pipe(
            tap(() => {
              container.resolve(AudioService).play(Sound.BUTTON);
            }),
            throttleTime(200))
        .subscribe((event) => {
          const isPausing = this.pauseButton.innerText === 'Pause';
          this.game.pauseGame(isPausing);
          this.flipPauseButtons(isPausing, event.target as HTMLButtonElement);
        });

    this.pencilButton.addEventListener('click', (event) => {
      container.resolve(AudioService).play(Sound.BUTTON);
      this.removeMouseUpDownListners();

      (event.target as HTMLButtonElement).classList.toggle('selected');
      if (this.eraserButton.classList.contains('selected')) {
        this.eraserButton.classList.remove('selected');
      }
      this.addShouldRecordListeners();
      // Add throttle
      window.addEventListener('mousemove', this.pencilMouseMoveListener);
    });

    this.eraserButton.addEventListener('click', (event) => {
      container.resolve(AudioService).play(Sound.BUTTON);
      this.removeMouseUpDownListners();

      (event.target as HTMLButtonElement).classList.toggle('selected');
      if (this.pencilButton.classList.contains('selected')) {
        this.pencilButton.classList.remove('selected');
      }
      this.addShouldRecordListeners();

      // Add throttle
      window.addEventListener('mousemove', this.eraserMouseMoveListener);
    });

    const directionKey$ =
        fromEvent(window, 'keydown')
            .pipe(filter(
                (event: KeyboardEvent) => !!directionKeyMap.get(event.code)));
    const selectSnakeKey$ = fromEvent(window, 'keydown')
                                .pipe(filter(
                                    (event: KeyboardEvent) =>
                                        !!selectedSnakeKeyMap.get(event.code)));
    directionKey$
        .pipe(throttleTime(
            INTERVAL, asyncScheduler, {leading: true, trailing: true}))
        .subscribe((event) => this.game.handleDirection(event.code));
    selectSnakeKey$.subscribe(
        (event) => this.game.handleSnakeSelection(event.code));
  }

  private flipPauseButtons(isPausing = true, button: HTMLButtonElement) {
    const text = isPausing ? 'Resume' : 'Pause';
    button.classList.add('selected');

    setTimeout(() => {
      this.pauseButton.innerText = text;
      this.pauseButton.classList.toggle('pause');
      this.pauseButton.classList.toggle('resume');

      if (!isPausing) {
        this.pencilButton.classList.remove('selected');
        this.eraserButton.classList.remove('selected');
      }

      setTimeout(() => {
        button.classList.remove('selected');
      }, 100);
    }, 200);
  }
}

new Index();