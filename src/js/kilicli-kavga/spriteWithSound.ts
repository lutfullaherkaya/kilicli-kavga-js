import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Sprite} from "@/js/kilicli-kavga/sprite";

export class SpriteWithSound extends Sprite {
    private sound: HTMLAudioElement | null = null;
    private soundLoops = false
    private playedOnce = false;

    constructor(tuval: Tuval, {
        soundSrc = '',
        soundLoops = false,
        ...spriteOptions
    }) {
        super(tuval, spriteOptions);
        this.soundLoops = soundLoops;
        if (soundSrc) {
            this.sound = new Audio(soundSrc);
        }
    }

    rewindToBeginning(): this {
        super.rewindToBeginning();
        if (this.sound) {
            this.sound.currentTime = 0;
            this.playedOnce = false;
        }
        return this;
    }

    start(): this {
        super.start();
        if (this.sound && (!this.playedOnce || this.soundLoops)) {
            this.sound.play().then(() => {
                this.playedOnce = true;
            });
        }
        return this;
    }

    pause(): this {
        super.pause();
        if (this.sound) {
            this.sound.pause();
        }
        return this;
    }

    update() {
        super.update();
        if (this.sound) {
            if (this.sound.ended && this.soundLoops && this.isPlaying) {

                this.sound.currentTime = 0;
                this.sound.play();
            }
        }
        return this;
    }
}
