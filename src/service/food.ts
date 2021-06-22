import {container, injectable, singleton} from 'tsyringe';
import {Coords} from '../constants';
import {getRandomCoords, isDebugMode} from '../helpers/utils';
import {Dashboard} from '../ui/dashboard';

@injectable()
@singleton()
export class FoodService {
  private eatCount = 0;
  food: Coords[] = [];
  redFood: Coords[] = [];

  isRedFoodEnabled = false;
  fixedFoodSize?: number;

  addFood(excludeArray: Coords[], isRedFood: boolean) {
    if (isRedFood) {
      this.redFood.push(getRandomCoords(excludeArray));
    } else {
      this.food.push(getRandomCoords(excludeArray));
    }
  }

  replenishFood(
      foodIndex: number, snakeCount: number, excludeArray: Coords[],
      isRedFood: boolean) {
    // Provide red food
    if ((!isRedFood && this.eatCount !== 0 && this.eatCount === snakeCount &&
         this.isRedFoodEnabled) ||
        this.isRedFoodEnabled && isDebugMode()) {
      this.redFood.push(getRandomCoords(excludeArray));
    }
    const foodBatch = isRedFood ? this.redFood : this.food;
    const test = foodBatch.splice(foodIndex, 1);
    this.addFood(excludeArray, isRedFood);
  }

  increaseFoodCount() {
    this.eatCount++;
    container.resolve(Dashboard).updateFoodCount(this.eatCount);
  }

  isFoodAvailable(food: Coords|null): boolean {
    if (!food) return false;
    return !!this.food.find(item => item.x === food.x && item.y === food.y);
  }

  reset() {
    this.isRedFoodEnabled = false;
    container.resolve(Dashboard).updateFoodCount(0);
    this.food = [];
    this.eatCount = 0;
    this.redFood = [];
    this.fixedFoodSize = 0;
  }
}