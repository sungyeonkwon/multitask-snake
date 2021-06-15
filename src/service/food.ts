import {injectable, singleton} from 'tsyringe';
import {Coords} from '../constants';
import {getRandomCoords} from '../helpers';

@injectable()
@singleton()
export class FoodService {
  private foodInfo: HTMLElement = document.querySelector('.food');
  private eatCount = 0;
  food: Coords[] = [];
  redFood: Coords[] = [];

  // Feature-specific properties
  multiplyBy = 1;
  isRedFoodEnabled = false;

  addFood(excludeArray: Coords[], isRedFood: boolean) {
    if (isRedFood) {
      this.redFood.push(getRandomCoords(excludeArray));
    } else {
      for (let i = 0; i < this.multiplyBy; i++) {
        this.food.push(getRandomCoords(excludeArray));
      }
    }
  }

  replenishFood(
      foodIndex: number, snakeCount: number, excludeArray: Coords[],
      isRedFood: boolean) {
    // Provide red food
    if (!isRedFood && this.eatCount !== 0 && this.eatCount === snakeCount &&
        this.isRedFoodEnabled) {
      this.redFood.push(getRandomCoords(excludeArray));
    }
    const foodBatch = isRedFood ? this.redFood : this.food;
    foodBatch.splice(foodIndex, 1);
    this.addFood(excludeArray, isRedFood);
  }

  increaseFoodCount() {
    this.eatCount++;
    this.foodInfo.innerText = this.eatCount.toString();
  }

  isFoodAvailable(food: Coords): boolean {
    return !!this.food.find(item => item.x === food.x && item.y === food.y);
  }

  reset() {
    this.multiplyBy = 1;
    this.isRedFoodEnabled = false;
    this.foodInfo.innerText = '0';
    this.food = [];
    this.redFood = [];
  }

  private addRedFood() {}
}