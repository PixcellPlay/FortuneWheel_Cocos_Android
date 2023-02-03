import { _decorator, Component, Label, Animation, tween, Vec3, Color, Node, Sprite, Slider, ProgressBar, color, Widget, SpriteFrame, Vec2, Tween, math, AudioSource, ParticleSystem, Game, UITransform } from 'cc';
import { AnalyticsManager } from './AnalyticsManager';
import { FBManager } from './FBManager';
import { GameManager } from './GameManager';
import { SpinWheel } from './SpinWheel';
import { RewardType } from './SpinWheel';

const { ccclass, property } = _decorator;

const MULTIPLIER_MAX_VALUE: number = 5;

@ccclass('UIHandler')
export class UIHandler extends Component {

    @property({ type: Label })
    public coinCollectedText!: Label;

    @property({ type: Label })
    public coinNeededText!: Label;

    @property({ type: ProgressBar })
    public energyFill!: ProgressBar;

    @property({ type: UITransform })
    public energyBubbleFill!: UITransform;

    @property({ type: ProgressBar })
    public coinFill!: ProgressBar;

    @property({ type: Label })
    public energyText!: Label;

    @property({ type: Label })
    public keyText!: Label;

    @property({ type: Label })
    public chestText!: Label;

    @property({ type: Node })
    public upgradeButton!: Node;

    //Piggy
    @property({ type: Node })
    public piggyBankGroup: Node;

    @property({ type: Node })
    public piggyBankDoubleButton: Node;

    @property({ type: Label })
    public piggyBankCoinRewardCount: Label;

    @property({ type: Label })
    public piggyBankEnergyRewardCount: Label;

    @property({ type: Label })
    public piggyBankKeyRewardCount: Label;

    @property({ type: Node })
    public adMultiplierIndicatorPiggy!: Node;

    @property({ type: Node })
    public adMultiplierBarPiggy!: Node;

    @property({ type: Node })
    public menu: Node;

    @property({ type: Node })
    public upgradeUsingAdButton: Node;


    @property({ type: Label })
    public multiplier!: Label;

    @property({ type: Node })
    public chestPanel!: Node;

    //Chest
    @property({ type: Node })
    public levelUp!: Node;

    @property({ type: Node })
    public outofEnergyPopup!: Node;

    @property({ type: Label })
    public chestCoinReward!: Label;

    @property({ type: Label })
    public chestEnergyReward!: Label;

    public multiplierValue: number = 1;

    public _piggyFinalReward: number[] = [];

    @property({ type: Widget })
    public music: Widget;

    @property({ type: Widget })
    public sfx: Widget;

    @property({ type: SpriteFrame })
    public greenToggle: SpriteFrame;

    @property({ type: SpriteFrame })
    public grayToggle: SpriteFrame;

    @property({ type: SpriteFrame })
    public yellowCoinFill: SpriteFrame;

    @property({ type: SpriteFrame })
    public greenCoinFill: SpriteFrame;

    rewardRandom: any;
    adMultiplier: number = 1;
    adMultiplierTween: any;
    isMultiplierValueChanging: boolean = false;

    currentLevelData: string[] = [];



    start() {
        GameManager.Instance.uiHandler = this;

        //Init Coin & Energy
        console.log(GameManager.Instance.energyAccumulated)
        //GameManager.Instance.consumeEnergy(0);
        //GameManager.Instance.uiHandler.setCoins();
        //GameManager.Instance.consumeKey(0);
        //GameManager.Instance.consumeChest(0);
        console.log(this.multiplier.string, "........", this.multiplierValue);
        this.multiplier.string = "x" + this.multiplierValue.toString();
        GameManager.Instance.audioManager.playBG();
        //this.bgMusic.play();
        //this.bgMusic.loop = true;
    }

    update() {

    }

    setCoins() {
        this.coinCollectedText.string = GameManager.Instance.abbreviateNumber(Math.round(GameManager.Instance.coinsCollected)).toString();
        this.coinNeededText.string = " /  " + (GameManager.Instance.abbreviateNumber(GameManager.Instance._upgradeCost[GameManager.Instance.currentUpgradeLevel])).toString();
        this.coinFill.progress = GameManager.Instance.coinsCollected / GameManager.Instance._upgradeCost[GameManager.Instance.currentUpgradeLevel];
        GameManager.Instance.isUpgradableUsingAd();
    }

    addCoins(startCoin: number, endCoin: number, upgradeCost) {
        console.log(upgradeCost)
        // Coin Counter
        let startCoinCount = startCoin;
        let endCoinCount = endCoin;
        let difference = endCoinCount - startCoinCount;
        this.schedule(function () {
            startCoinCount = startCoinCount + (difference / 20);// 20-  Increment Step
            this.coinCollectedText.string = GameManager.Instance.abbreviateNumber(Math.round(startCoinCount)).toString();
        }, .05, 19);
        //ENd Coin Counter
        this.coinNeededText.string = " /  " + (GameManager.Instance.abbreviateNumber(upgradeCost)).toString();
        let startValue = startCoin / upgradeCost;
        let endValue = endCoin / upgradeCost;
        this.coinFill.progress = startValue;
        let addingDifference = (endValue - startValue) / 20;
        this.schedule(function () {
            startValue = startValue + addingDifference;
            this.coinFill.progress = startValue;
        }, .05, 19);
        this.updateCoinUI();
    }

    consumeCoins(currentCoinValue: number, newCoinValue: number, currentUpgradeCost: number, newUpgradeCost) {
        GameManager.Instance.audioManager.playCoinDrain();
        tween(this.coinFill.node.parent.parent)
            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) }).to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
            .call(() => { this.onCompleteScaleDownTextObject(this.coinFill.node.parent.parent); })
            .start()
        this.coinCollectedText.string = GameManager.Instance.abbreviateNumber(currentCoinValue).toString()
        this.coinNeededText.string = " /  " + (GameManager.Instance.abbreviateNumber(currentUpgradeCost)).toString();
        this.coinFill.progress = currentCoinValue / currentUpgradeCost;
        let tempValue = currentCoinValue;
        let incrimentAmount = (newCoinValue - currentCoinValue) / 20
        this.schedule(function () {
            tempValue = tempValue + incrimentAmount;
            this.coinCollectedText.string = GameManager.Instance.abbreviateNumber(tempValue).toString();
            this.coinFill.progress = tempValue / currentCoinValue;
        }, .05, 19);
        this.scheduleOnce(function () {
            this.coinCollectedText.string = GameManager.Instance.abbreviateNumber(newCoinValue).toString();
            this.coinNeededText.string = " / " + GameManager.Instance.abbreviateNumber(newUpgradeCost).toString();
            this.coinFill.progress = newCoinValue / newUpgradeCost;
        }, 1);
        // this.updateCoinUI();
    }

    updateCoinUI() {
        tween(this.coinCollectedText.node)
            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
            .call(() => { this.onCompleteScaleDownTextObject(this.coinCollectedText.node); })
            .start()
    }

    updateEnergyUI() {
        tween(this.energyText.node)
            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
            .call(() => { this.onCompleteScaleDownTextObject(this.energyText.node); })
            .start()
    }

    updateKeyUI() {
        tween(this.keyText.node)
            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
            .call(() => { this.onCompleteScaleDownTextObject(this.keyText.node); })
            .start()
    }

    updateChestUI() {
        tween(this.chestText.node)
            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
            .call(() => { this.onCompleteScaleDownTextObject(this.chestText.node); })
            .start()
    }

    onCompleteScaleDownTextObject(obj: Node) {
        tween(obj)
            .to(0.5, { scale: new Vec3(1, 1, 1) })
            .call(() => { console.log(''); })
            .start()
    }


    // Show Piggy Bank Reward Screen if the wheel stops at Piggy Bank 
    openPiggyBank() {
        this.piggyBankGroup.active = true;
        //this.piggyBankGroup.getComponent(Sprite).color = new Color(255, 255, 255, 0);
        tween(this.piggyBankGroup.getComponent(Sprite)).to(0.5, { color: new Color(255, 255, 255, 255) }).start();
        this.piggyBankGroup.children[0].getComponent(Animation).play("PiggyIdle");
    }

    calculatePiggyBankReward() {
        GameManager.Instance.audioManager.playPiggyBreak();
        this.piggyBankGroup.children[0].getComponent(Animation).play("blast");
        this.scheduleOnce(function () {
            this.rewardRandom = Math.random(); // Outcome is between 0 and 1
            console.log("Random Number -- ", this.rewardRandom);
            let rewardAmount = 0;

            if (this.rewardRandom >= 0.5) {
                // give coins + key

                // Calculate Coin reward amount
                rewardAmount = (GameManager.Instance.coinsCollected * (GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardCoinPercent / 100));
                if (rewardAmount < GameManager.Instance.spinWheel.piggyRewardCoinMinimum) {
                    rewardAmount = GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardCoinMinimum;
                }
                this._piggyFinalReward[0] = RewardType.COIN;
                this._piggyFinalReward[1] = Math.round(rewardAmount);
                this._piggyFinalReward[2] = RewardType.KEY;
                this._piggyFinalReward[3] = GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardKeyCount;
                this.enableRewardObjects(this._piggyFinalReward[1], this._piggyFinalReward[3], 0);

            } else {
                // give energy
                this._piggyFinalReward[0] = RewardType.ENERGY;
                this._piggyFinalReward[1] = GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardEnergyCount;
                this.enableRewardObjects(0, 0, this._piggyFinalReward[1]);
            };
            this.piggyBankGroup.children[0].active = false;
            this.piggyBankGroup.children[1].active = true;
            this.piggyBankDoubleButton.active = true;
            this.adMultiplierIndicatorPiggy.active = true;
            this.adMultiplierBarPiggy.active = true;
            this.adMultiplierIndicatorPiggy.setPosition(-176, -140, 0);
            this.adMultiplierIndicatorMovement();
            this.piggyBankGroup.children[1].children[0].scale = new Vec3(.1, .1, .1);
            tween(this.piggyBankGroup.children[1].children[0]).to(0.5, { scale: new Vec3(1, 1, 1) }).start();
        }, 0.6);
    }

    adMultiplierIndicatorMovement() {
        let t1 = tween(this.adMultiplierIndicatorPiggy).to(1, { position: new Vec3(176, -140, 0) });
        let t2 = tween(this.adMultiplierIndicatorPiggy).to(1, { position: new Vec3(-176, -140, 0) });
        this.adMultiplierTween = tween(this.adMultiplierIndicatorPiggy).sequence(t1, t2).repeatForever().start();
    }


    // public callBack() {
    //     this.adMultiplierIndicatorMovement();
    // }

    watchADToDoublePiggyReward() {
        this.adMultiplierTween.stop();
        // this.adMultiplierTween.destroy();
        this.adMultiplierIndicatorPiggy.active = false;
        this.adMultiplierBarPiggy.active = false;
        this.piggyBankDoubleButton.active = false;
        this.checkAdMutiplierIndication();
        AnalyticsManager.Instance.onPiggyAdMultiplier(this._piggyFinalReward[0], this.adMultiplier);
        FBManager.Instance.ShowRewardedVideoAd("DoublePiggyReward", this.node);
    }

    checkAdMutiplierIndication() {
        if ((this.adMultiplierIndicatorPiggy.position.x >= -176 && this.adMultiplierIndicatorPiggy.position.x <= -126) || (this.adMultiplierIndicatorPiggy.position.x > 73 && this.adMultiplierIndicatorPiggy.position.x <= 122)) {
            this.adMultiplier = 1.5;
        }
        else if ((this.adMultiplierIndicatorPiggy.position.x > -126 && this.adMultiplierIndicatorPiggy.position.x <= -92) || (this.adMultiplierIndicatorPiggy.position.x > 26 && this.adMultiplierIndicatorPiggy.position.x <= 73)) {
            this.adMultiplier = 3;
        }
        else if ((this.adMultiplierIndicatorPiggy.position.x > -92 && this.adMultiplierIndicatorPiggy.position.x <= 26) || (this.adMultiplierIndicatorPiggy.position.x > 122 && this.adMultiplierIndicatorPiggy.position.x <= 176)) {
            this.adMultiplier = 2;
        }
    }


    doublePiggyReward() {
        let rewardAmount = 0;

        if (this.rewardRandom >= 0.5) {
            // give coins + key

            // Calculate Coin reward amount
            rewardAmount = (GameManager.Instance.coinsCollected * (GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardCoinPercent / 100));
            if (rewardAmount < GameManager.Instance.spinWheel.piggyRewardCoinMinimum) {
                rewardAmount = GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardCoinMinimum;
            }
            this._piggyFinalReward[0] = RewardType.COIN;
            this._piggyFinalReward[1] = Math.round(rewardAmount * this.adMultiplier);
            this._piggyFinalReward[2] = RewardType.KEY;
            this._piggyFinalReward[3] = GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardKeyCount;
            this.enableRewardObjects(this._piggyFinalReward[1], this._piggyFinalReward[3], 0);

        } else {
            // give energy
            this._piggyFinalReward[0] = RewardType.ENERGY;
            this._piggyFinalReward[1] = Math.round(GameManager.Instance.spinWheelObject.getComponent(SpinWheel).piggyRewardEnergyCount * this.adMultiplier);
            this.enableRewardObjects(0, 0, this._piggyFinalReward[1]);
        }
        this.piggyBankDoubleButton.active = false;
        this.adMultiplier = 1;
    }

    // Called on clicking Piggy Bank COLLECT button 
    onClickPiggyBankRewardCollect() {
        for (let r = 0; r < this._piggyFinalReward.length; r = r + 2) {
            switch (this._piggyFinalReward[r]) {
                case RewardType.COIN:
                    GameManager.Instance.addCoins(this._piggyFinalReward[r + 1]);
                    GameManager.Instance.playCoinParticle();
                    break;
                case RewardType.KEY:
                    GameManager.Instance.addKey(this._piggyFinalReward[r + 1]);
                    break;
                case RewardType.ENERGY:
                    GameManager.Instance.addEnergy(this._piggyFinalReward[r + 1]);
                    GameManager.Instance.playEnergyParticle(this._piggyFinalReward[r + 1]);
                    break;
                default:
                    break;
            }
        }
        this._piggyFinalReward = [];    // Resize the array to zero so that the older data is wiped out
        this.resetPiggyBankPanel();
        AnalyticsManager.Instance.onPiggyRewardCollected();
    }

    enableRewardObjects(coinAmt: number, keyAmt: number, energyAmt: number) {
        if (coinAmt > 0) {
            this.piggyBankCoinRewardCount.string = coinAmt.toString();
            this.piggyBankCoinRewardCount.node.parent.active = true;
        }

        if (keyAmt > 0) {
            this.piggyBankKeyRewardCount.node.parent.active = true;
            this.piggyBankKeyRewardCount.string = keyAmt.toString();
        }

        if (energyAmt > 0) {
            this.piggyBankEnergyRewardCount.node.parent.active = true;
            this.piggyBankEnergyRewardCount.string = energyAmt.toString();
        }
    }

    disableRewardObjects() {
        this.piggyBankCoinRewardCount.node.parent.active = false;
        this.piggyBankCoinRewardCount.string = "";  //(Sprite).enabled = b;
        this.piggyBankKeyRewardCount.node.parent.active = false;
        this.piggyBankKeyRewardCount.string = "";
        this.piggyBankEnergyRewardCount.node.parent.active = false;
        this.piggyBankEnergyRewardCount.string = "";
        this.piggyBankGroup.children[1].active = false;
        this.piggyBankGroup.children[0].active = true;
    }

    resetPiggyBankPanel() {
        this.piggyBankGroup.active = false;
        this.disableRewardObjects();

    }


    MultiplierHandler() {
        tween(this.multiplier.node.parent).to(0.1, { scale: new Vec3(.9, .9, .9) }).to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) }).to(0.1, { scale: new Vec3(1, 1, 1) }).call(() => {
            if (GameManager.Instance.tutorialIndex == 2 && GameManager.Instance.tutorialHand.active) {
                GameManager.Instance.tutorialHand.position = new Vec3(65, -320, 0);//GameManager.Instance.uiHandler.energyText.node.parent.position;
                GameManager.Instance.tutorialIndex = 3;
            }
            if (!GameManager.Instance.spinWheel._isSpinning && (GameManager.Instance.energyAccumulated >= this.multiplierValue || GameManager.Instance.energyAccumulated == MULTIPLIER_MAX_VALUE) && !this.isMultiplierValueChanging) {
                this.isMultiplierValueChanging = true;
                if (this.multiplierValue == MULTIPLIER_MAX_VALUE || this.multiplierValue == GameManager.Instance.energyAccumulated) {
                    this.multiplierValue = 1;
                    this.multiplier.string = "x" + this.multiplierValue.toString();
                }
                else {
                    this.multiplierValue = this.multiplierValue + 1;
                    this.multiplier.string = "x" + this.multiplierValue.toString();
                }
                GameManager.Instance.audioManager.playMultiplier(this.multiplierValue);
                this.onMultiplierValueChange();
            }
        }).start();
    }

    onMultiplierValueChange() {
        this.getWheelData();
        let j = 0;
        // console.log(GameManager.Instance.spinWheel.allWheelPieceObjectsCollection.length);
        // console.log(this.currentLevelData);
        for (let i = 0; i < GameManager.Instance.spinWheel.allWheelPieceObjectsCollection.length; i++) {
            if (GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].name == "Piece") {
                // console.log(GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].children[0]);
                if (GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].children[0].name == "ENERGY" || GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].children[0].name == "COIN") {
                    let value;
                    console.log(this.currentLevelData[j], j);
                    switch (this.currentLevelData[j]) {
                        case "COIN":
                            value = parseInt(this.currentLevelData[j + 1]);
                            break;
                        case "ENERGY":
                            value = parseInt(this.currentLevelData[j + 1]);
                            break;
                        default:
                            break;
                    }
                    value = value * this.multiplierValue;
                    tween(GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].children[0].children[0]).to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) }).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
                    this.scheduleOnce(function () {
                        GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[i].children[0].getComponentInChildren(Label).string = GameManager.Instance.abbreviateNumber(value).toString();
                        this.isMultiplierValueChanging = false;
                    }, .2);
                }
                j = j + 3;
                console.log(j);
            }

        }

    }


    //Called when click on the Chest 
    openChestPanel() {
        GameManager.Instance.tutorialHand.active = false;
        if (GameManager.Instance.chestCollected >= 1 //true 
            && GameManager.Instance.currentUpgradeLevel > 1 //true
            && !GameManager.Instance.spinWheel._isSpinning 
            && !this.chestPanel.active
            && !GameManager.Instance.uiHandler.menu.active
            && !GameManager.Instance.uiHandler.outofEnergyPopup.active
            && !GameManager.Instance.uiHandler.piggyBankGroup.active) {
            this.chestPanel.active = true;
            this.chestPanel.children[1].getChildByName("Chest").position = new Vec3(0, 105, 0);
            this.chestPanel.getComponent(Animation).stop();
            this.chestPanel.getComponent(Animation).play("ChestStarting");
            GameManager.Instance.audioManager.playChestButtonClick();
            this.chestCoinReward.string = GameManager.Instance.spinWheel.coinChestReward[(GameManager.Instance.currentUpgradeLevel - 1)].toString();
            this.chestEnergyReward.string = GameManager.Instance.spinWheel.energyChestReward[(GameManager.Instance.currentUpgradeLevel - 1)].toString();
            this.chestPanel.children[1].getChildByName("Close").active = true;
            this.chestPanel.children[1].getChildByName("UnlockWithAd").active = true;
            this.scheduleOnce(function () {
                this.chestPanel.getComponent(Animation).stop();
                this.chestPanel.getComponent(Animation).play("ChestIdle");
            }, 1.5);
            if (GameManager.Instance.keysCollected < 1) {
                this.chestPanel.children[1].getChildByName("UnlockWithKey").active = false;
            }
            else {
                this.chestPanel.children[1].getChildByName("UnlockWithKey").active = true;
            }
        }
    }

    //Called when Tap on Chest opening with a key
    openChestWithKey() {
        if (GameManager.Instance.keysCollected >= 1 && GameManager.Instance.currentUpgradeLevel > 1) {
            this.chestPanel.children[1].getChildByName("Close").active = false;
            this.chestPanel.children[1].getChildByName("UnlockWithAd").active = false;
            GameManager.Instance.audioManager.playChestOpen();
            this.chestPanel.getComponent(Animation).play("ChestOpen");
            this.scheduleOnce(function () {
                AnalyticsManager.Instance.onChestOpenwithKey();
                GameManager.Instance.consumeChest(1);
                console.log(GameManager.Instance.keysCollected);
                GameManager.Instance.consumeKey(1);
                this.chestPanel.children[1].active = false;
                this.chestPanel.children[2].active = true;
            }, 0.84);
        }
    }

    watchAdToOpenChest() {
        AnalyticsManager.Instance.onChestOpenwithAdClicked();
        FBManager.Instance.ShowRewardedVideoAd("OpenChest", this.node);
        this.chestPanel.children[1].getChildByName("Close").active = false;
    }

    openChestWithAd() {
        this.chestPanel.children[1].getChildByName("UnlockWithAd").active = false;
        GameManager.Instance.audioManager.playChestOpen();
        this.chestPanel.getComponent(Animation).play("ChestOpen");
        this.scheduleOnce(function () {
            AnalyticsManager.Instance.onChestOpenwithAdShown();
            GameManager.Instance.consumeChest(1);
            console.log(GameManager.Instance.keysCollected);
            this.chestPanel.children[2].getChildByName("DoubleItButton").active = true;
            this.chestPanel.children[1].active = false;
            this.chestPanel.children[2].active = true;
        }, 0.82);
    }


    collectChestReward() {
        console.log("Chest Reward Collected")
        GameManager.Instance.addCoins(parseInt(this.chestCoinReward.string));
        GameManager.Instance.playCoinParticle();
        GameManager.Instance.addEnergy(parseInt(this.chestEnergyReward.string));
        GameManager.Instance.playEnergyParticle(parseInt(this.chestEnergyReward.string));
        this.chestPanel.children[1].active = true;
        this.chestPanel.children[2].active = false;
        this.chestPanel.active = false;
        this.chestPanel.getComponent(Animation).stop();
    }

    watchAdToDoubleChestReward() {
        AnalyticsManager.Instance.onChestDoubleRewardedAd();
        FBManager.Instance.ShowRewardedVideoAd("DoubleChestReward", this.node);
    }

    doubleChestReward() {
        this.chestPanel.children[2].getChildByName("DoubleItButton").active = false;
        this.chestCoinReward.string = (parseInt(this.chestCoinReward.string) * 2).toString();
        this.chestEnergyReward.string = (parseInt(this.chestEnergyReward.string) * 2).toString();
    }

    closeChestPanel() {
        this.chestPanel.children[1].active = true;
        this.chestPanel.children[2].active = false;
        this.chestPanel.active = false;
    }

    openMenu() {
        if (!GameManager.Instance.spinWheel._isSpinning || !GameManager.Instance.uiHandler.chestPanel.active || !GameManager.Instance.uiHandler.piggyBankGroup.active)
            this.menu.active = true;
        GameManager.Instance.tutorialHand.active = false;
    }

    closeMenu() {
        this.menu.active = false;
    }

    onMusicSwitch() {
        if (GameManager.Instance.audioManager.musicState == 1) {
            GameManager.Instance.audioManager.musicState = 0;
            GameManager.Instance.audioManager.stopBG();
            this.music.horizontalCenter = -20;
            AnalyticsManager.Instance.onMusicOff();
            this.music.node.parent.getComponent(Sprite).spriteFrame = this.grayToggle;
        }
        else if (GameManager.Instance.audioManager.musicState == 0) {
            GameManager.Instance.audioManager.musicState = 1;
            GameManager.Instance.audioManager.playBG();
            this.music.horizontalCenter = 20;
            AnalyticsManager.Instance.onMusicOn();
            this.music.node.parent.getComponent(Sprite).spriteFrame = this.greenToggle;
        }
        FBManager.Instance.savePlayerMusicSFXStateData();
        console.log(GameManager.Instance.audioManager.musicState);
    }

    onSfxSwitch() {
        if (GameManager.Instance.audioManager.sfxState == 1) {
            GameManager.Instance.audioManager.sfxState = 0;
            this.sfx.horizontalCenter = -20;
            this.sfx.node.parent.getComponent(Sprite).spriteFrame = this.grayToggle;
            AnalyticsManager.Instance.onSFXOff();
        }
        else if (GameManager.Instance.audioManager.sfxState == 0) {
            GameManager.Instance.audioManager.sfxState = 1;
            this.sfx.horizontalCenter = 20;
            this.sfx.node.parent.getComponent(Sprite).spriteFrame = this.greenToggle;
            AnalyticsManager.Instance.onSFXOn();
        }
        FBManager.Instance.savePlayerMusicSFXStateData();
        console.log(GameManager.Instance.audioManager.sfxState);
    }


    closeOutofEnergyPopup() {
        this.outofEnergyPopup.active = false;
    }


    watchAdTogetEnergy() {
        AnalyticsManager.Instance.onAdButtonClickedEnergy();
        FBManager.Instance.ShowRewardedVideoAd("GetEnergy", this.node);
    }


    energyAdWatchReward() {
        GameManager.Instance.playEnergyParticle(GameManager.Instance.adrewardOutOfEnergy);
        GameManager.Instance.addEnergy(GameManager.Instance.adrewardOutOfEnergy);
        this.outofEnergyPopup.active = false;
    }


    watchAdToUpgradeWheel() {
        if (!GameManager.Instance.spinWheel._isSpinning)
            FBManager.Instance.ShowRewardedVideoAd("UpgradeWheel", this.node);
    }


    upgradeWheelByAd() {
        if (!GameManager.Instance.spinWheel._isSpinning) {
            GameManager.Instance.addCoins(GameManager.Instance._upgradeCost[GameManager.Instance.currentUpgradeLevel] - GameManager.Instance.coinsCollected);
            GameManager.Instance.playCoinParticle();
            GameManager.Instance.upgradeSpinWheel();
        }
    }


    musicsfxStateOnStart() {
        if (GameManager.Instance.audioManager.musicState == 0) {
            GameManager.Instance.audioManager.stopBG();
            this.music.node.parent.getComponent(Sprite).spriteFrame = this.grayToggle;
            this.music.horizontalCenter = -15;
            console.log(GameManager.Instance.audioManager.musicState);
        }
        else {
            GameManager.Instance.audioManager.playBG();
            this.music.node.parent.getComponent(Sprite).spriteFrame = this.greenToggle;
            this.music.horizontalCenter = 15;
            GameManager.Instance.audioManager.musicState = 1;
        }
        if (GameManager.Instance.audioManager.sfxState == 0) {
            this.sfx.node.parent.getComponent(Sprite).spriteFrame = this.grayToggle;
            this.sfx.horizontalCenter = -15;
        }
        else {
            this.sfx.node.parent.getComponent(Sprite).spriteFrame = this.greenToggle;
            this.sfx.horizontalCenter = 15;
            GameManager.Instance.audioManager.musicState = 1;
        }
    }
    getWheelData() {
        switch (GameManager.Instance.currentUpgradeLevel) { // Based on the current wheel upgrade level and construct the Wheel
            case 1:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade1;
                break;
            case 2:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade2;
                break;
            case 3:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade3;
                break;
            case 4:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade4;
                break;
            case 5:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade5;
                break;
            case 6:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade6;
                break;
            case 7:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade7;
                break;
            case 8:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade8;
                break;
            case 9:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade9;
                break;
            case 10:
                this.currentLevelData = GameManager.Instance.spinWheel._upgrade10;
                break;
            default:
                break;
        }
    }


}