# Multitasking snake game (WIP)

Snake game, but a lot of them because multitasking is hard. Featuring some home-made nom nom nom sounds. This needs more work / clean up.

https://multitasking-snake.netlify.app/

## TODO

### Feature

- [ ] Version: food with number to forward by
- [ ] Version: last one standing: snakes can die, till there is no snake left
- [ ] Version: Reproducing snakes: once reaches 12 segments, it splits into two
- [ ] Add acceleration
- [ ] Themed grid / background
- [ ] Add score/screenshot dashboard -> small image with pillow

### Fix

- [ ] Growing when direction is changed just before food

### General

- [x] BFS movement for enemy agent (Make enemy agent do u-turn)
- [x] Add play instruction
- [x] Make patterns more granular per snake
- [x] Improve debug mode
- [x] Retain type/count with sessionStorage
- [ ] Enemy agent: Add a dying motion / reappearing functionality with shorter body
- [ ] Make it responsive
- [ ] Add a spinner
- [ ] Add sound effect for drawing
- [ ] Add sound effect for starting game
