import {injectable, singleton} from 'tsyringe';
import {Coords} from '../constants';
import {getRandomCoords} from '../helpers';

@injectable()
@singleton()
export class FoodService {
  private foodInfo: HTMLElement = document.querySelector('.food');
  private eatCount = 0;
  food: Coords[] = [];

  addFood(bounds: Coords, excludeArray: Coords[], multiplyBy: number) {
    for (let i = 0; i < multiplyBy; i++) {
      this.food.push(getRandomCoords(bounds, excludeArray));
    }
  }

  increaseFoodCount() {
    this.eatCount++;
    this.foodInfo.innerText = this.eatCount.toString();
  }

  isFoodAvailable(food: Coords): boolean {
    return !!this.food.find(item => item.x === food.x && item.y === food.y);
  }

  reset() {
    this.foodInfo.innerText = '0';
    this.food = [];
  }
}