import {BehaviorSubject, combineLatest, never, timer} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';

const RED_FOOD_TIME = 16;
@injectable()
@singleton()
export class Dashboard {
  dashboardElement: HTMLElement = document.querySelector('.dashboard')!;
  statusElement =
      this.dashboardElement.querySelector('.status') as HTMLSpanElement;
  wallCount = this.dashboardElement.querySelector('.wall') as HTMLSpanElement;
  foodCount = this.dashboardElement.querySelector('.food') as HTMLSpanElement;

  timer = this.dashboardElement.querySelector('.timer') as HTMLSpanElement;
  time = 0;
  isMultiSelectionTimerOn$ = new BehaviorSubject(false);
  pauseTimer$ = new BehaviorSubject(false);
  shouldKeepTime = false;

  constructor() {
    combineLatest(
        this.isMultiSelectionTimerOn$,
        this.pauseTimer$,
        )
        .pipe(
            tap(([isOn, _paused]) => {
              if (!isOn) {
                this.timer.innerText = '';
              }
            }),
            switchMap(
                ([isOn, paused]) => isOn ?
                    timer(0, 1000).pipe(map((n) => [n, paused])) :
                    never()),
            )
        .subscribe(([timer, paused]) => {
          if (paused) {
            this.shouldKeepTime = true;
            return;
          };
          if (timer === 0 && !paused && !this.shouldKeepTime) this.time = 0;
          if (!paused) this.shouldKeepTime = false;
          this.time++;
          this.timer.innerText = '00:' +
              `${RED_FOOD_TIME - this.time}`.padStart(2, '0');

          if (this.time > RED_FOOD_TIME) {
            this.destroyTimer()
          }
        });
  }

  updateStatus(text: string, isOn: boolean) {
    this.statusElement.innerText = text;
    if (isOn) {
      this.statusElement.classList.add('show');
    } else {
      this.statusElement.classList.remove('show');
    }
  }

  updateFoodCount(count: number) {
    this.foodCount.innerText = count.toString();
  }

  updateWallCount(count: number) {
    this.wallCount.innerText = count.toString();
  }

  reset() {
    this.updateWallCount(0);
    this.updateFoodCount(0);
    this.destroyTimer();
  }

  private destroyTimer() {
    this.statusElement.classList.remove('show');
    this.timer.innerText = '';
    this.time = 0;
    this.isMultiSelectionTimerOn$.next(false);
    this.pauseTimer$.next(false);
  }
}