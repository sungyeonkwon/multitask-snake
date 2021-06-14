import {Howl, Howler} from 'howler';
import {injectable, singleton} from 'tsyringe';

export enum Sound {
  EAT1 = 'eat1',
  EAT2 = 'eat2',
  EAT3 = 'eat3',
  EAT4 = 'eat4',
  EAT5 = 'eat5',
  GAME_OVER = 'gameover',
  BUTTON = 'button',
  HIT = 'hit',
  DRAW = 'draw',
}

@injectable()
@singleton()
export class AudioService {
  readonly sounds: {[key: string]: Howl} = {};
  readonly isLoaded = this.loadFiles(Object.values(Sound));
  isMuted = false;

  play(sound: Sound, loop = false, volume = 1) {
    if (this.sounds[sound] && !this.sounds[sound].playing()) {
      this.sounds[sound].loop(loop);
      this.sounds[sound].volume(volume);
      this.sounds[sound].play();
    }
  }

  toggleMute(soundButton: HTMLButtonElement) {
    this.isMuted = !this.isMuted;
    soundButton.innerText =
        this.isMuted ? 'Sound on / [off]' : 'Sound [on] / off';
    Howler.mute(this.isMuted);
  }

  private loadFiles(files: string[]): Promise<void> {
    return new Promise((resolve) => {
      let loaded = 0;

      const onFileLoad = () => {
        if (loaded === files.length) {
          resolve();
        }
      };

      files.forEach((file: string) => {
        const sound = new Howl({
          src: `assets/${file}.mp3`,
          autoplay: false,
          onloaderror: onFileLoad,
          onload: onFileLoad
        });

        this.sounds[file] = sound;
      });
    });
  }
}
