import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

export const enum Audio {
    BGM = 0,
    MULTIPLIER1 = 1,
    MULTIPLIER2 = 2,
    MULTIPLIER3 = 3,
    MULTIPLIER4 = 4,
    MULTIPLIER5 = 5,
    WHEELSPIN = 6,
    SPINBUTTON = 7,
    CHESTBUTTONCLICK = 8,
    CHESTOPEN = 9,
    GETCHESTFROMWHEEL = 10,
    GETKEYFROMWHEEL = 11,
    GETCOINFROMWHEEL = 12,
    GETENERGYFROMWHEEL = 13,
    GETNOTHINGFROMWHEEL = 14,
    GETBANKRUPTFROMWHEEL = 15,
    GETPIGGYFROMWHEEL = 16,
    PIGGYBREAK = 17,
    WHEELUPGRADE = 18,
    COINDRAIN = 19,
    NOENERGY = 20,
    BUTTONCLICK = 21,
    COINADDINGTOWALLET = 22
}

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property({ type: Number })
    public musicState: number = 1;

    @property({ type: Number })
    public sfxState: number = 1;

    public audioArray:AudioSource[] = []

    start() {
        GameManager.Instance.audioManager = this;
        this.audioArray = this.getComponents(AudioSource);
    }

    update(deltaTime: number) {

    }

    playBG() {
        if (this.musicState == 1) {
            this.audioArray[Audio.BGM].play();
            this.audioArray[Audio.BGM].loop = true;
        }
    }

    stopBG(){
            this.audioArray[Audio.BGM].pause();
            this.audioArray[Audio.BGM].loop = false;
    }

    playMultiplier(multiplier:number){
        if (this.sfxState==1){
            this.audioArray[multiplier].play();
        }
    }

    playWheelSpin(){
        if (this.sfxState == 1){
            this.audioArray[Audio.WHEELSPIN].play();
        }
    }

    playSpinButton(){
        if (this.sfxState == 1){
            this.audioArray[Audio.SPINBUTTON].play();
        }
    }

    playChestButtonClick(){
        if (this.sfxState == 1){
            this.audioArray[Audio.CHESTBUTTONCLICK].play();
        }
    }

    playChestOpen(){
        if (this.sfxState == 1){
            this.audioArray[Audio.CHESTOPEN].play();
        }
    }

    playGetChestFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETCHESTFROMWHEEL].play();
        }
    }

    playGetCoinFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETCOINFROMWHEEL].play();
        }
    }

    playGetKeyFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETKEYFROMWHEEL].play();
        }
    }

    playGetNothingtFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETNOTHINGFROMWHEEL].play();
        }
    }

    playGetBankruptFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETBANKRUPTFROMWHEEL].play();
        }
    }

    playGetPiggyFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETPIGGYFROMWHEEL].play();
        }
    }

    playGetEnergyFromWheel(){
        if (this.sfxState == 1){
            this.audioArray[Audio.GETENERGYFROMWHEEL].play();
        }
    }

    playPiggyBreak(){
        if (this.sfxState == 1){
            this.audioArray[Audio.PIGGYBREAK].play();
        }
    }

    playCoinDrain(){
        if (this.sfxState == 1){
            this.audioArray[Audio.COINDRAIN].play();
        }
    }

    playWheelUpgarde(){
        if (this.sfxState == 1){
            this.audioArray[Audio.WHEELUPGRADE].play();
        }
    }

    playNoEnergy(){
        if (this.sfxState == 1){
            this.audioArray[Audio.NOENERGY].play();
        }
    }

    playButtonClick(){
        if (this.sfxState == 1){
            this.audioArray[Audio.BUTTONCLICK].play();
        }
    }

    playCoinAddingToWallet(){
        if (this.sfxState == 1){
            this.audioArray[Audio.COINADDINGTOWALLET].play();
        }
    }

}

