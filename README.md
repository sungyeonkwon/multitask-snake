# Multitasking snake game (WIP)

Snake game, but a lot of them because multitasking is hard. Featuring some home-made nom nom nom sounds. This needs more work / clean up.

https://multitasking-snake.xyz/

## TODO

### Feature

- [ ] Version: food with number to forward by
- [ ] Add sound effect for drawing
- [ ] Add acceleration
- [ ] Themed grid / background

### Fix

- [ ] Enemy agent: if it crosses itself, it should die
- [ ] Enemy agent: Apply BFS to targeting food with taking blockers into account
- [ ] Enemy agent: Wall and snake blockers needs to be updated on the fly

### General

- [x] BFS movement for enemy snake (Make enemy snake do u-turn)
- [x] Add play instruction
- [ ] Make patterns more granular per snake
- [ ] Add score/screenshot dashboard -> small image with pillow
- [ ] Make it responsive
