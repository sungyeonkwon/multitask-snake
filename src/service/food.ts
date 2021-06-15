import {injectable, singleton} from 'tsyringe';
import {Coords} from '../constants';

@injectable()
@singleton()
export class FoodService {
  private foodInfo: HTMLElement = document.querySelector('.food');
  private eatCount = 0;
  food: Coords[] = [];

  addFood(newFood: Coords) {
    this.food.push(newFood);
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