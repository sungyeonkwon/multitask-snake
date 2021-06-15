import {injectable, singleton} from 'tsyringe';

@injectable()
@singleton()
export class Dashboard {
  dashboardElement: HTMLElement = document.querySelector('.dashboard')!;
  statusElement =
      this.dashboardElement.querySelector('.status') as HTMLSpanElement;
  wallCount = this.dashboardElement.querySelector('.wall') as HTMLSpanElement;
  foodCount = this.dashboardElement.querySelector('.count') as HTMLSpanElement;

  updateStatus(text: string, isOn: boolean) {
    this.statusElement.innerText = text;
    isOn ? this.statusElement.classList.add('show') :
           this.statusElement.classList.remove('show');
  }

  updateFoodCount(count: number) {
    this.foodCount.innerText = count.toString();
  }

  updateWallCount(count: number) {
    this.wallCount.innerText = count.toString();
  }
}