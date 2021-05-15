export class Dialog {
  dialogElement: HTMLElement = document.getElementById('dialog')!;

  constructor() {
    console.log('dialog component');

    this.dialogElement.innerHTML = this.getTemplate();
  }

  getSnakesTemplate() {
    return ``;
  }

  getTemplate() {
    return `
      <h1 class="gameover">Game Over</h1>
      <h1>Type of snakes</h1>
      <ul class="snake-type-container">
        <li>Viper</li>
        <li>Boa</li>
        <li>Indian Krait</li>
        <li>Garter</li>
        <li>Python</li>
        <li>Rattle</li>
      </ul>
      <p>How many snakes can you handle?</p>
      <div>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>5</button>
      </div>
      <button>Start game</button>
    `;
  }
}
