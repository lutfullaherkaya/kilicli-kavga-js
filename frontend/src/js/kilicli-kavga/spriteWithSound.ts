import {Game} from "@/js/kilicli-kavga/game";
import {Sprite} from "@/js/kilicli-kavga/sprite";

function mobilMi(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export class SpriteWithSound extends Sprite {
    private sound: HTMLAudioElement | null = null;
    private readonly soundLoops
    private playedOnce = false;
    private mobileChromeLoopDelayInSeconds = 0.3; // in chrome mobile, sound loops with delay. So we loop early.


    constructor(tuval: Game, {
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

    soundIsEnded(): boolean {
        if (this.sound) {
            return this.sound.duration <= this.sound.currentTime;
        } else {
            return false;
        }

    }

    start(): this {
        super.start();
        if (this.sound && (!this.playedOnce || this.soundLoops)) {
            let loopRewindTime = this.sound.duration;
            if (mobilMi()) {
                loopRewindTime -= this.mobileChromeLoopDelayInSeconds;
            }
            if (this.soundLoops && this.sound.currentTime >= loopRewindTime) {
                this.sound.currentTime = 0;
            }
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
        return this;
    }

}
