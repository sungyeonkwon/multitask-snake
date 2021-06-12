import {injectable, singleton} from 'tsyringe';
import {Coords} from '../constants';

@injectable()
@singleton()
export class FoodService {
  food: Coords[] = [];
  foodInfo: HTMLElement = document.querySelector('.food');

  addFood(newFood: Coords) {
    this.food.push(newFood);
  }

  isFoodAvailable(food: Coords): boolean {
    return !!this.food.find(item => item.x === food.x && item.y === food.y);
  }

  reset() {
    this.foodInfo.innerText = '0';
    this.food = [];
  }
}