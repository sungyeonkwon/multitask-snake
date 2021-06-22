# Multitasking snake game (WIP)

Snake game, but a lot of them because multitasking is hard. Featuring some home-made nom nom nom sounds. This needs more work / clean up.

https://multitasking-snake.xyz/

## TODO

### Feature

- [ ] Version: food with number to forward by
- [ ] Version: last one standing: snakes can die, till there is no snake left
- [ ] Version: Reproducing snakes: once reaches 12 segments, it splits into two
- [ ] Add acceleration
- [ ] Themed grid / background
- [ ] Add score/screenshot dashboard -> small image with pillow

### Fix

- [ ] Enemy agent: If it crosses itself, it should die
- [ ] Enemy agent: Apply BFS to targeting food with taking blockers into account
- [ ] Enemy agent: Wall and snake blockers needs to be updated on the fly

### General

- [x] BFS movement for enemy snake (Make enemy snake do u-turn)
- [x] Add play instruction
- [x] Make patterns more granular per snake
- [x] Improve debug mode
- [ ] Make it responsive
- [ ] Add a spinner
- [ ] Retain type/count with sessionStorage
- [ ] Add sound effect for drawing
- [ ] Add sound effect for starting game
