import {BehaviorSubject, never, timer} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';

const RED_FOOD_TIMER = 16;
@injectable()
@singleton()
export class Dashboard {
  dashboardElement: HTMLElement = document.querySelector('.dashboard')!;
  statusElement =
      this.dashboardElement.querySelector('.status') as HTMLSpanElement;
  wallCount = this.dashboardElement.querySelector('.wall') as HTMLSpanElement;
  foodCount = this.dashboardElement.querySelector('.food') as HTMLSpanElement;

  timer = this.dashboardElement.querySelector('.timer') as HTMLSpanElement;
  isMultiSelectionTimerOn$ = new BehaviorSubject(false);
  pauseTimer$ = new BehaviorSubject(false);
  time = 0;

  constructor() {
    // resume / reset needs to stop the timer
    this.isMultiSelectionTimerOn$
        .pipe(
            tap(isOn => {
              if (!isOn) this.timer.innerText = '';
            }),
            withLatestFrom(this.pauseTimer$),
            switchMap(([isOn, _pause]) => isOn ? timer(0, 1000) : never()))
        .subscribe((value) => {
          if (value === 0) this.time = 0;
          this.time++;
          this.timer.innerText = '00:' +
              `${RED_FOOD_TIMER - this.time}`.padStart(2, '0');

          if (this.time > RED_FOOD_TIMER) {
            this.statusElement.classList.remove('show');
            this.timer.innerText = '';
            this.time = 0;
            this.isMultiSelectionTimerOn$.next(false);
            this.pauseTimer$.next(false);
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
}