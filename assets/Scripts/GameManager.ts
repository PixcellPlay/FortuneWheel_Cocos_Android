import { _decorator, Component, Node, Sprite, AudioSource, tween, animation, Animation, instantiate, Prefab, Vec3, Label, Vec2, Scheduler, ParticleSystem, random, randomRange, Scene, CurveRange, sys } from 'cc';
import { AnalyticsManager } from './AnalyticsManager';
import { AudioManager } from './AudioManager';
import { DailyRewards } from './DailyRewards';
import { FBManager } from './FBManager';
import { SpinWheel } from './SpinWheel';
import { UIHandler } from './UIHandler';

const { ccclass, property } = _decorator;

const MAX_ENERGY: number = 20;
const ENERGY_REGENERATION_TIME: number = 3;
const ENERGY_GIVEN_ONSTART: number = 20;
@ccclass('GameManager')
export class GameManager extends Component {


    public static Instance: GameManager;  // Making it as a Singleton

    @property({ type: Node })
    public titleScreen: Node;

    @property({ type: String })
    public playerName: string = "Player";

    @property({ type: Animation })
    public chestAnimationOnHud: Animation;

    @property({ type: Prefab })
    public coinParticle: Prefab;

    @property({ type: Node })
    public tutorialHand: Node;

    @property({ type: Number })
    public coinsCollected: number = 0;

    @property({ type: Number })
    public energyAccumulated: number = ENERGY_GIVEN_ONSTART;

    @property({ type: Number })
    public piggyBankCoins: number = 100;

    @property({ type: Number })
    public keysCollected: number = 0;

    @property({ type: Number })
    public chestCollected: number = 0;

    @property({ type: Number })
    public currentUpgradeLevel: number = 1;

    @property({ type: Boolean })
    public isGameStarted: boolean = false;

    @property({ type: Node })
    public spinWheelObject: Node;

    @property({ type: Label })
    public energyRegenerationTimeShow: Label;

    public energyRegenerationTimer: number = 0;
    public spinButtonIdleTime: number = 60;

    //@property({type: Node})
    public uiHandler: UIHandler = new UIHandler();
    public spinWheel: SpinWheel = new SpinWheel();
    public audioManager: AudioManager = new AudioManager();

    // Upgrade Cost
    public _upgradeCost: number[] = [0, 2000, 16000, 120000, 960000, 7600000, 60000000, 460000000, 3600000000, 29000000000, 80000000000, 220000000000, 630000000000];
    public _upgradeReward: number[] = [0, 5, 8, 10, 20, 30, 40, 50, 50, 50, 50, 50];

    public spiWithoutAd: number = 0;
    public dailyRewards: DailyRewards = new DailyRewards();

    @property({ type: Number })
    public tutorialIndex: number = 100;
    adrewardOutOfEnergy: number = 10;

    chestAnimSchedule: any;
    SpinButtonAnimSchedule: any;

    @property({ type: Animation })
    startTransition: Animation

    public isEnergyRegenerationStart = false;

    start() {
        if (GameManager.Instance == null) {
            GameManager.Instance = this;
        }
        // console.log("Game Manager Initialized");
        // console.log(window.location.href);
        // console.log(window.location.href.includes("localhost"));
        // if (window.location.href.includes("localhost")) {
        //     this.scheduleOnce(function () {
        //         console.log("Scheduler");
        //         GameManager.Instance.onStart();
        //         GameManager.Instance.titleScreen.active = false;
        //     }, 2);
        // }

        // Get the Android local player data
        /*this.scheduleOnce(function () {
            console.log ("Scheduler called........");
            this.getPlayerDataFromStorageAndroid(); 
        }, 1);
        */
    }

    onStart() {

        
        this.startTransition.play();
        this.energyRegenerationTimer = ENERGY_REGENERATION_TIME * 60;
        if (this.currentUpgradeLevel == 1 && this.coinsCollected == 0 && this.energyAccumulated == ENERGY_GIVEN_ONSTART) {
            this.tutorialIndex = 1;

            tween(this.node)
            .to(0.4, { scale: new Vec3(1.0, 1.0, 1.0) }) 
            .call(() => { 
                console.log ("INSIDE TWEEEN....");
                this.tutorialHand.active = true;
                this.tutorialHand.position = new Vec3(65, -320, 0);
            })
            .start()

            /*
            let k = this.schedule(function () {

                this.unschedule(k);
            }, 0.4);
            */
        }
        else if (this.tutorialIndex == 1) {
            GameManager.Instance.tutorialHand.active = true;
            GameManager.Instance.tutorialHand.position = new Vec3(120, -280, 0) //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
            GameManager.Instance.tutorialIndex = 2;
        }
        else if (this.tutorialIndex == 2) {
            GameManager.Instance.tutorialHand.active = true;
            GameManager.Instance.tutorialHand.position = new Vec3(65, -320, 0) //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
            GameManager.Instance.tutorialIndex = 3;
        }
        else if (this.tutorialIndex == 3) {
            GameManager.Instance.tutorialHand.active = true;
            GameManager.Instance.tutorialHand.position = new Vec3(230, 300, 0); //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
            GameManager.Instance.tutorialIndex = 4;
        }
        else if (this.tutorialIndex == 4) {
            GameManager.Instance.tutorialHand.active = true;
            GameManager.Instance.tutorialHand.position = new Vec3(230, 390, 0); //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
            GameManager.Instance.tutorialIndex = 5;
        }
        if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
            this.unschedule(this.chestAnimSchedule);
            this.playChestPopAnimation();
        }
        if (GameManager.Instance.currentUpgradeLevel < 2) {
            GameManager.Instance.uiHandler.chestText.node.parent.active = false;
            GameManager.Instance.uiHandler.keyText.node.parent.active = false;
        }

        this.uiHandler.musicsfxStateOnStart();

    }

    // Write Player data to local storage used only for ANDROID
    writePlayerDataToStorageAndroid() {
        let time: number = 0;
        fetch("http://worldtimeapi.org/api/ip")
            .then(res => res.json()) // the .json() method parses the JSON response into a JS object literal
            .then(data => time = data.unixtime);
        console.log ("time ", time);

        sys.localStorage.setItem('Coin', this.coinsCollected.toString());
        sys.localStorage.setItem('Energy', this.energyAccumulated.toString());
        sys.localStorage.setItem('Chest', this.chestCollected.toString());
        sys.localStorage.setItem('Keys', this.keysCollected.toString());        
        sys.localStorage.setItem('SpinWheelLevel', this.currentUpgradeLevel.toString());
        //sys.localStorage.setItem('GiftBoxState', this.dailyRewards.giftBoxState.toString());
        //sys.localStorage.setItem('GiftClickIndex', this.dailyRewards.clickedIndex.toString());
        //sys.localStorage.setItem('DailyGiftCollectTime', '0');
        //sys.localStorage.setItem('MusicState', '1');
        sys.localStorage.setItem('TutorialIndex', this.tutorialIndex.toString());
        

        let v = Math.floor(Date.now()/1000);
        console.log ("time after", v.toString());
        sys.localStorage.setItem('LogoutTime', v.toString());
    }

    getPlayerDataFromStorageAndroid() {
        console.log ("data called ..... ", sys.localStorage.getItem('Coin'), sys.localStorage.getItem('dummy'));
        if (sys.localStorage.getItem('Coin') != null) {
            this.coinsCollected = parseInt(sys.localStorage.getItem('Coin'));
            this.energyAccumulated = parseInt(sys.localStorage.getItem('Energy'));
            this.chestCollected = parseInt(sys.localStorage.getItem('Chest'));
            this.keysCollected = parseInt(sys.localStorage.getItem('Keys'));
            this.currentUpgradeLevel = parseInt(sys.localStorage.getItem('SpinWheelLevel'));
            //this.dailyRewards.giftBoxState = sys.localStorage.getItem('GiftBoxState');
            //this.dailyRewards.clickedIndex = parseInt(sys.localStorage.getItem('GiftClickIndex'));
            //this.dailyGiftCollectTimelocalStorage.setItem('DailyGiftCollectTime', '0');
            //sys.localStorage.setItem('MusicState', '1');
            this.tutorialIndex = parseInt(sys.localStorage.getItem('TutorialIndex'));
            //sys.localStorage.setItem('LogoutTime', time.toString());

            // Check for does have daily Gift Data
            //this.dailyRewards.checkDailyReward(parseInt(data['dailyGiftCollectTime']), data['giftBoxState'].toString());
            let t = parseInt(sys.localStorage.getItem('LogoutTime'));
            GameManager.Instance.checkEnergyRegeneration(t);
            console.log("Energy Regeneraation started for with login time or 0 time");

            console.log('data is loaded', this.coinsCollected, this.energyAccumulated, this.chestCollected, this.currentUpgradeLevel, this.tutorialIndex, t );
           
        }

        GameManager.Instance.spinWheel.onStart();
        console.log(GameManager.Instance.energyAccumulated);
        GameManager.Instance.consumeEnergy(0);
        GameManager.Instance.uiHandler.setCoins();
        GameManager.Instance.consumeKey(0);
        GameManager.Instance.consumeChest(0);
        GameManager.Instance.isUpgradableUsingAd();
        GameManager.Instance.uiHandler.musicsfxStateOnStart();
    }

    update(deltaTime: number) {
        //console.log(this.energyAccumulated)
        // console.log(this.energyAccumulated);
        if (this.energyAccumulated < MAX_ENERGY && this.isEnergyRegenerationStart) {
            this.energyRegenerationTimer = this.energyRegenerationTimer - deltaTime;
            this.energyRegenerationTimeShow.node.active = true;
            let min;
            let sec;
            if (Math.floor(this.energyRegenerationTimer / 60).toString().length == 1) {
                min = "0" + Math.floor(this.energyRegenerationTimer / 60).toString();
            }
            else {
                min = Math.floor(this.energyRegenerationTimer / 60).toString();
            }
            if (Math.floor(this.energyRegenerationTimer % 60).toString().length == 1) {
                sec = "0" + Math.floor(this.energyRegenerationTimer % 60).toString();
            }
            else {
                sec = Math.floor(this.energyRegenerationTimer % 60).toString();
            }
            this.energyRegenerationTimeShow.string = "Get +1 Energy In  " + min + ":" + sec;
            // console.log(this.energyRegenerationTimer);
            if (this.energyRegenerationTimer < 0) {
                this.addEnergy(1);
                this.energyRegenerationTimer = ENERGY_REGENERATION_TIME * 60;
            }
        }
        else if (this.energyRegenerationTimeShow.node.active) {
            this.energyRegenerationTimeShow.node.active = false;
        }
    }

    public upgradeSpinWheel() {
        if (this.isWheelUpgradable() && !this.spinWheel._isSpinning) {
            console.log("Wheel level before -- ", this.currentUpgradeLevel);
            if (this.tutorialHand.active) {
                this.tutorialHand.active = false;
            }
            AnalyticsManager.Instance.onLevelComplete();
            //this.coinsCollected = this.coinsCollected - this._upgradeCost[this.currentUpgradeLevel];
            this.consumeCoins(this._upgradeCost[this.currentUpgradeLevel], "UpgradeWheel");
            if (this.currentUpgradeLevel == 10) {
                this.currentUpgradeLevel = 1;
            } else {
                this.currentUpgradeLevel++;
            }
            if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
                this.unschedule(this.chestAnimSchedule);
                this.playChestPopAnimation();
            }
            // this.consumeCoins(0);
            console.log("Wheel level after  -- ", this.currentUpgradeLevel);
            this.spinWheelObject.getComponent(SpinWheel).upgradeWheel();
            this.isUpgradableUsingAd();
        }
    }

    collectUpgradeReward() {
        this.scheduleOnce(function () {
            if (this.currentUpgradeLevel == 2) {
                this.uiHandler.chestText.node.parent.active = true;
                this.uiHandler.keyText.node.parent.active = true;
                this.tutorialHand.active = true;
                //this.tutorialHand.position = this.uiHandler.chestText.node.parent.worldPosition;
                this.tutorialHand.position = new Vec3(230, 390, 0);
                this.tutorialIndex = 4;
            }
        }, 2);
        this.uiHandler.node.parent.getChildByName("Shine_Wheel").getComponentInChildren(ParticleSystem).play();
        this.addEnergy(this._upgradeReward[this.currentUpgradeLevel]);
        this.playEnergyParticle(this._upgradeReward[this.currentUpgradeLevel]);
        this.uiHandler.levelUp.active = false;
    }

    isWheelUpgradable() {
        if (this.currentUpgradeLevel < 10) {  // 10 - Max wheel upgrade level
            if (this.coinsCollected >= this._upgradeCost[this.currentUpgradeLevel]) {
                console.log("Wheel is upgradable");
                return true;
            } else {
                console.log("Wheel is NOT upgradable");
                return false;
            }
        }
        return false;
    }

    consumeEnergy(eCount: number) {
        console.log("Energy Available ", this.energyAccumulated, " Energy Need To Reduce ", eCount, this.energyAccumulated - eCount)
        this.energyAccumulated = this.energyAccumulated - eCount;
        this.uiHandler.energyText.string = this.energyAccumulated + " / " + MAX_ENERGY;
        console.log("Energy --> ", this.energyAccumulated);
        if (this.energyAccumulated == 0){
            this.uiHandler.energyFill.progress = 0;
            this.uiHandler.energyBubbleFill.height = 1;
        }
        else{
            this.uiHandler.energyFill.progress = this.energyAccumulated / MAX_ENERGY;
            this.uiHandler.energyBubbleFill.height = this.uiHandler.energyFill.progress * 100;
        }
        this.uiHandler.updateEnergyUI();
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
    }

    playEnergyParticle(energy: number) {
        if (energy <= 5) {
            this.spinWheel.energyRewardAnim.play("EnergyDrinkANI");
        }
        else {
            this.spinWheel.energyRewardAnim.play("EnergyDrinkLargeANI");
        }
    }

    addEnergy(eCount: number) {
        if (eCount > 0) {
            GameManager.Instance.audioManager.playGetEnergyFromWheel();
        }
        this.scheduleOnce(function () {
            // Energy Counter
            let startEnergyCount = this.energyAccumulated;
            let endEnergyCount = this.energyAccumulated + eCount;
            let difference = endEnergyCount - startEnergyCount;
            this.schedule(function () {
                startEnergyCount = startEnergyCount + (difference / 20);// 20-  Increment Step
                this.uiHandler.energyText.string = Math.round(startEnergyCount).toString() + " / " + MAX_ENERGY;
            }, .05, 19);
            //ENd energy Counter
            this.energyAccumulated = this.energyAccumulated + eCount;
            console.log("Energy --> ", this.energyAccumulated);
            this.uiHandler.energyFill.progress = this.energyAccumulated / MAX_ENERGY;
            this.uiHandler.energyBubbleFill.height = this.uiHandler.energyFill.progress * 100;
            this.uiHandler.updateEnergyUI();
            //FBManager.Instance.savePlayerData();
            this.writePlayerDataToStorageAndroid();
        }, 2.5);
    }

    consumeCoins(cCount: number, scenario: string) {
        this.coinsCollected = this.coinsCollected - cCount;
        if (scenario = "Bankrupt") {
            this.uiHandler.consumeCoins(this.coinsCollected + cCount, this.coinsCollected, this._upgradeCost[this.currentUpgradeLevel], this._upgradeCost[this.currentUpgradeLevel]);
        }
        else if (scenario = "Upgradewheel") {
            this.uiHandler.consumeCoins(this.coinsCollected + cCount, this.coinsCollected, this._upgradeCost[this.currentUpgradeLevel], this._upgradeCost[this.currentUpgradeLevel + 1]);
        }
        console.log("Coins --> ", this.coinsCollected, this.uiHandler.coinFill.progress);
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
    }

    playCoinParticle() {
        this.audioManager.playCoinAddingToWallet();
        let particleParent = new Node("CoinParticleParent");
        particleParent.setParent(this.spinWheel.node.parent);
        particleParent.position = this.spinWheel.node.position;
        particleParent.layer = 25;
        for (let i = 0; i < 20; i++) {
            instantiate(this.coinParticle).setParent(particleParent)
            this.playParticle(particleParent.children[i].getComponent(ParticleSystem));
        }
        //Coin Splitting In center
        for (let i = 0; i < 20; i++) {
            let pos = new Vec3(randomRange(80, 120) * Math.cos(randomRange(0, 360)), randomRange(30, 70) * Math.sin(randomRange(0, 360)), 0)
            tween(particleParent.children[i]).to(0.5, { position: pos }).start();
        }
        //Coin Moving From Center To HUD
        this.scheduleOnce(function () {
            for (let i = 0; i < 20; i++) {
                let newPos = new Vec3(- 85, 320, particleParent.position.z);
                tween(particleParent.children[i]).to(.5 + (i / 15), { position: newPos }).start();
            }
        }, .5);
        this.scheduleOnce(function () {
            particleParent.destroy();
        }, 2.5);
        // this.uiHandler.node.parent.getChildByName("CoinShower").getComponentInChildren(ParticleSystem).play();
    }



    playParticle(particle: ParticleSystem) {
        this.scheduleOnce(function () {
            particle.play();
        }, randomRange(0, 0.3));
    }
    addCoins(cCount: number) {
        this.coinsCollected = this.coinsCollected + cCount;
        this.scheduleOnce(function () {
            this.uiHandler.addCoins(this.coinsCollected - cCount, this.coinsCollected, this._upgradeCost[this.currentUpgradeLevel]);
            this.scheduleOnce(function () {
                this.isUpgradableUsingAd();
            }, 1);
            console.log("Coins --> ", this.coinsCollected, this.uiHandler.coinFill.progress);
            //FBManager.Instance.savePlayerData();
            this.writePlayerDataToStorageAndroid();
        }, 1);
    }

    consumeKey(kCount: number) {
        this.keysCollected = this.keysCollected - kCount;
        this.uiHandler.keyText.string = this.keysCollected.toString();
        console.log("Keys --> ", this.keysCollected);
        this.uiHandler.updateKeyUI();
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
    }

    addKey(kCount: number) {
        this.keysCollected = this.keysCollected + kCount;
        this.uiHandler.keyText.string = this.keysCollected.toString();
        console.log("Keys --> ", this.keysCollected);
        this.uiHandler.updateKeyUI();
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
        if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
            this.unschedule(this.chestAnimSchedule);
            this.playChestPopAnimation();
        }
    }

    consumeChest(cCount: number) {
        this.chestCollected = this.chestCollected - cCount;
        this.uiHandler.chestText.string = this.chestCollected.toString();
        console.log("Chest --> ", this.chestCollected);
        this.uiHandler.updateChestUI();
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
        if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
            this.unschedule(this.chestAnimSchedule);
            this.playChestPopAnimation();
        }
        else {
            this.unscheduleAllCallbacks();
        }
    }

    addChest(cCount: number) {
        this.chestCollected = this.chestCollected + cCount;
        this.uiHandler.chestText.string = this.chestCollected.toString();
        console.log("Chest --> ", this.chestCollected);
        this.uiHandler.updateChestUI();
        //FBManager.Instance.savePlayerData();
        this.writePlayerDataToStorageAndroid();
        if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
            this.unschedule(this.chestAnimSchedule);
            this.playChestPopAnimation();
        }
    }

    isUpgradableUsingAd() {
        if (this.coinsCollected / this._upgradeCost[this.currentUpgradeLevel] > 0.8 && this.coinsCollected / this._upgradeCost[this.currentUpgradeLevel] < 1) {
            this.uiHandler.upgradeUsingAdButton.active = true;
            this.uiHandler.upgradeButton.active = false;
            this.uiHandler.coinFill.node.getComponent(Sprite).spriteFrame = this.uiHandler.yellowCoinFill;
        }
        else if (this.coinsCollected / this._upgradeCost[this.currentUpgradeLevel] >= 1) {
            this.uiHandler.upgradeUsingAdButton.active = false;
            this.uiHandler.coinFill.node.getComponent(Sprite).spriteFrame = this.uiHandler.greenCoinFill;
            this.uiHandler.upgradeButton.active = true;
            if (this.tutorialIndex == 3 && this.currentUpgradeLevel == 1) {
                GameManager.Instance.tutorialHand.active = true;
                GameManager.Instance.tutorialHand.position = new Vec3(230, 310, 0); //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
                GameManager.Instance.tutorialIndex = 4;
            }
        }
        else {
            this.uiHandler.upgradeButton.active = false;
            this.uiHandler.coinFill.node.getComponent(Sprite).spriteFrame = this.uiHandler.yellowCoinFill;
            this.uiHandler.upgradeUsingAdButton.active = false;
        }

    }

    checkEnergyRegeneration(savedTime: any) {
        fetch("http://worldtimeapi.org/api/ip")
            .then(res => res.json()) // the .json() method parses the JSON response into a JS object literal
            .then(data => this.getTime(data, savedTime));

    }

    getTime(currentTime: any, savedTime: any) {
        let DateTimeValue = currentTime;
        console.log(DateTimeValue.unixtime, savedTime);
        this.timeDifference(DateTimeValue.unixtime, savedTime);
    }

    format(inputDate) {
        let date, month, year;

        date = inputDate.getDate();
        month = inputDate.getMonth() + 1;
        year = inputDate.getFullYear();

        date = date
            .toString()
            .padStart(2, '0');

        month = month
            .toString()
            .padStart(2, '0');

        return `${date}${month}${year}`;
    }

    timeDifference(date1: number, date2: number) {
        console.log(date1, date2)
        var difference = (date1) - (date2);
        console.log(difference);
        var minutesDifference = Math.floor(difference / (1000 * 60));
        console.log(minutesDifference);
        this.energyRegeneration(minutesDifference);
    }

    energyRegeneration(minutesDifference: number) {
        if (this.energyAccumulated < MAX_ENERGY) {
            this.energyAccumulated = this.energyAccumulated + Math.round(minutesDifference / 3);
            console.log(this.energyAccumulated, Math.round(minutesDifference / 3))
            if (this.energyAccumulated > MAX_ENERGY) {
                this.energyAccumulated = MAX_ENERGY;
                console.log(this.energyAccumulated)
            }
        }
        this.isEnergyRegenerationStart = true;
    }


    abbreviateNumber(value) {
        var newValue = value;
        if (value >= 100000) {
            var suffixes = ["", "K", "M", "B", "T"];
            var suffixNum = Math.floor(("" + value).length / 3);
            var shortValue = null;
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0) shortValue = shortValue.toFixed(2);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    }
    playChestPopAnimation() {
        if (this.currentUpgradeLevel > 1 && this.chestCollected >= 1) {
            this.chestAnimSchedule = this.schedule(function () {
                // Here this refers to component
                this.chestAnimationOnHud.play();
            }, 5);
        } else {
            this.unscheduleAllCallbacks();
        }
    }

}


