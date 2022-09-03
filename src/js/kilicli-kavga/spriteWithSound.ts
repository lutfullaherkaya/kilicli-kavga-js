import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Sprite} from "@/js/kilicli-kavga/sprite";

export class SpriteWithSound extends Sprite {
    private sound: HTMLAudioElement | null = null;
    private loop = false
    private playedOnce = false;

    constructor(tuval: Tuval, {
        soundSrc = '',
        loop = false,
        ...spriteOptions
    }) {
        super(tuval, spriteOptions);
        if (soundSrc) {
            this.sound = new Audio(soundSrc);
        }
    }

    update() {
        super.update();
        if (this.sound) {
            if (!this.playedOnce) {
                this.sound.play().then(() => {
                    this.playedOnce = true;
                });
            }
            if (this.sound.ended && this.loop) {
                this.sound.currentTime = 0;
                this.sound.play();
            }
        }
        return this;
    }
}
