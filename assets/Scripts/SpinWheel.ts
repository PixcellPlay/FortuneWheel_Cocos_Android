import { _decorator, Component, Node, instantiate, Prefab, Sprite, SpriteFrame, Label, Vec3, Quat, tween, randomRange, randomRangeInt, Animation, Color, CCInteger, Game, AudioSource, ParticleSystem, color } from 'cc';

import { WheelPiece } from './WheelPiece';
import { GameManager } from './GameManager';
import { FBManager } from './FBManager';
import { AnalyticsManager } from './AnalyticsManager';
const { ccclass, property } = _decorator;

export const enum RewardType { // REWARD TYPES
    NONE = 0,
    COIN = 1,
    ENERGY = 2,
    CHEST = 3,
    KEY = 4,
    BANKRUPT = 5,
    PIGGYBANK = 6
}

@ccclass('SpinWheel')
export class SpinWheel extends Component {

    //@property ({type: Number})
    public totalWheelSegments: number = 12;  // Total Wheel Segments

    // @property({ type: Node })
    // public godsRays: Node;
    @property({ type: Animation })
    public pointerWheel: Animation;

    @property({ type: Prefab })
    public wheelPiecePie: Prefab;

    @property({ type: Prefab })
    public wheelPiecePieSplit: Prefab;

    @property({ type: Prefab })
    public wheelPiecePrefab: Prefab;

    @property({ type: Node })
    public wheelPiecesParent: Node;

    @property({ type: Node })
    public spinButton: Node;

    @property({ type: Node })
    public wheelBG: Node;

    @property({ type: Prefab })
    public coinParticle: Prefab;

    @property({ type: Animation })
    public energyRewardAnim: Animation;

    @property({ type: ParticleSystem })
    public spinParticle: ParticleSystem;

    @property({ type: Animation })
    public chestReward: Animation;

    @property({ type: Animation })
    public keyReward: Animation;

    @property({ type: ParticleSystem })
    public upgradeParticle: ParticleSystem;

    @property({ type: ParticleSystem })
    public upgradeFireParticle: ParticleSystem;

    @property({ type: ParticleSystem })
    public coinShowerSmall: ParticleSystem;

    @property({ type: ParticleSystem })
    public coinShowerBig: ParticleSystem;

    @property({ type: Node })
    public allWheelPieceObjectsCollection: Node[] = [];

    private _wheelPieces: WheelPiece;
    private _pieceAngle: number;
    private _halfPieceAngle: number;
    private _halfAngleArray: number[] = [];
    private _halfPieceAngleWithPaddings: number;
    private _accumulatedWeight: number = 0;
    private _nonZeroChancesIndices: number[] = [];

    public _isSpinning: boolean = false;
    private _count: number = 0;
    private _countSplit: number = 0;

    @property({ type: [SpriteFrame] })
    private colorSprites: SpriteFrame[] = [];
    // Color Code Array
    public colorcode: number[][] = [[5, 9], [11, 5, 9], [11, 3, 6, 9], [0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]];

    // WHEEL upgrades
    public _upgrade1: string[] = ["COIN", "500", "6", "ENERGY", "2", "6"]; // TYPE, AMOUNT, No. OF PIES...
    public _upgrade2: string[] = ["COIN", "500", "4", "ENERGY", "2", "4", "COIN", "1200", "4"];
    public _upgrade3: string[] = ["COIN", "1200", "3", "ENERGY", "5", "3", "CHEST", "1", "3", "COIN", "2000", "3"];
    public _upgrade4: string[] = ["COIN", "2000", "2", "ENERGY", "5", "3", "CHEST", "1", "2", "COIN", "6000", "3", "KEY", "1", "2"];
    public _upgrade5: string[] = ["COIN", "6000", "2", "ENERGY", "5", "2", "CHEST", "1", "2", "COIN", "18000", "2", "KEY", "1", "2", "NONE", "0", "2"];
    public _upgrade6: string[] = ["COIN", "18000", "1", "ENERGY", "10", "2", "PIGGYBANK", "1", "1", "COIN", "60000", "2", "KEY", "1", "1", "NONE", "0", "2", "BANKRUPT", "0", "1", "CHEST", "1", "2"];
    public _upgrade7: string[] = ["COIN", "18000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "2", "COIN", "60000", "1", "KEY", "1", "1", "NONE", "0", "2", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "220000", "2"];
    public _upgrade8: string[] = ["COIN", "60000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "1", "COIN", "220000", "1", "KEY", "1", "1", "NONE", "0", "1", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "700000", "1", "NONE", "0", "1"];
    public _upgrade9: string[] = ["COIN", "220000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "1", "COIN", "700000", "1", "KEY", "1", "1", "NONE", "0", "1", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "2500000", "1", "NONE", "0", "1", "CHEST", "1", "1", "KEY", "1", "1"];
    public _upgrade10: string[] = ["COIN", "700000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "1", "COIN", "2500000", "1", "KEY", "1", "1", "NONE", "0", "1", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "8000000", "1", "NONE", "0", "1", "CHEST", "1", "1", "KEY", "1", "1"];
    public _upgrade11: string[] = ["COIN", "2500000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "1", "COIN", "8000000", "1", "KEY", "1", "1", "NONE", "0", "1", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "28000000", "1", "NONE", "0", "1", "CHEST", "1", "1", "KEY", "1", "1"];
    public _upgrade12: string[] = ["COIN", "8000000", "1", "ENERGY", "10", "1", "PIGGYBANK", "1", "1", "COIN", "28000000", "1", "KEY", "1", "1", "NONE", "0", "1", "BANKRUPT", "0", "1", "CHEST", "1", "1", "COIN", "96000000", "1", "NONE", "0", "1", "CHEST", "1", "1", "KEY", "1", "1"];

    // Rewards probability WITHOUT BET
    private _rewardProb1: number[] = [80, 80, 80, 80, 80, 80, 20, 20, 20, 20, 20, 20];
    private _rewardProb2: number[] = [50, 50, 50, 50, 20, 20, 20, 20, 30, 30, 30, 30];
    private _rewardProb3: number[] = [40, 40, 40, 10, 10, 10, 20, 20, 20, 30, 30, 30];
    private _rewardProb4: number[] = [40, 40, 10, 10, 10, 10, 10, 30, 30, 30, 10, 10];
    private _rewardProb5: number[] = [40, 40, 10, 10, 10, 10, 30, 30, 5, 5, 5, 5];
    private _rewardProb6: number[] = [30, 5, 5, 10, 20, 20, 10, 5, 5, 15, 5, 5];
    private _rewardProb7: number[] = [30, 5, 10, 10, 15, 5, 5, 5, 15, 5, 10, 10];
    private _rewardProb8: number[] = [25, 10, 5, 15, 5, 5, 15, 5, 10, 5, 0, 0];
    private _rewardProb9: number[] = [30, 5, 5, 20, 5, 5, 10, 5, 10, 5, 0, 0];
    private _rewardProb10: number[] = [25, 5, 10, 20, 10, 5, 5, 5, 10, 5, 0, 0];
    private _rewardProb11: number[] = [25, 5, 10, 20, 10, 5, 5, 5, 10, 5, 0, 0];
    private _rewardProb12: number[] = [25, 5, 10, 20, 10, 5, 5, 5, 10, 5, 0, 0];

    // Rewards probability WITH BET
    private _betRewardProb1: number[] = [80, 80, 80, 80, 80, 80, 20, 20, 20, 20, 20, 20];
    private _betRewardProb2: number[] = [50, 50, 50, 50, 20, 20, 20, 20, 30, 30, 30, 30];
    private _betRewardProb3: number[] = [50, 50, 50, 5, 5, 5, 10, 10, 10, 35, 35, 35];
    private _betRewardProb4: number[] = [40, 40, 5, 5, 5, 10, 10, 35, 35, 35, 10, 10];
    private _betRewardProb5: number[] = [45, 45, 5, 5, 10, 10, 30, 30, 5, 5, 5, 5];
    private _betRewardProb6: number[] = [30, 5, 5, 10, 20, 20, 5, 5, 5, 20, 5, 5];
    private _betRewardProb7: number[] = [30, 5, 5, 5, 20, 5, 5, 5, 15, 5, 10, 10];
    private _betRewardProb8: number[] = [25, 5, 5, 15, 5, 10, 15, 5, 10, 5, 0, 0];
    private _betRewardProb9: number[] = [30, 5, 5, 25, 5, 5, 10, 5, 5, 5, 0, 0];
    private _betRewardProb10: number[] = [30, 5, 10, 20, 5, 5, 5, 5, 10, 5, 0, 0];
    private _betRewardProb11: number[] = [30, 5, 5, 25, 5, 5, 5, 5, 10, 5, 0, 0];
    private _betRewardProb12: number[] = [25, 5, 5, 20, 10, 5, 10, 5, 10, 5, 0, 0];

    // Chest Reward
    public coinChestReward: number[] = [0, 1000, 1500, 2300, 3500, 5300, 8000, 12000, 18000, 27000];
    public energyChestReward: number[] = [0, 5, 5, 10, 10, 20, 20, 30, 30, 40, 40];

    // Piggy rewards - Coin & Energy
    public piggyRewardCoinPercent = 10;   // Percentage of coins in wallet given as rewards
    public piggyRewardCoinMinimum = 100;  // Minimum coins to given as reward
    public piggyRewardKeyCount = 1;
    public piggyRewardEnergyCount = 5;    // 5 - Static energy rewards give away
    private firsttime: boolean = true;


    start() {

        console.log("Level loaded and start hit..............!");
        // const godsRaysAnim = this.godsRays.getComponent(Animation); //.play('GodsRaysRotation').looping;
        // godsRaysAnim.clips[0].wrapMode;
        // godsRaysAnim.play('GodsRaysRotation');

        this._wheelPieces = this.node.getComponent(WheelPiece);
        this.onStart()
        GameManager.Instance.spinWheel = this;
    }

    update(deltaTime: number) {

    }

    onStart() {
        for (let ele = GameManager.Instance.spinWheel.allWheelPieceObjectsCollection.length - 1; ele >= 0; ele--) {
            GameManager.Instance.spinWheel.allWheelPieceObjectsCollection[ele].destroy();
        }

        // After destroying the objects, resize the allocated array else it will not free those previously allocated indices
        GameManager.Instance.spinWheel.allWheelPieceObjectsCollection = [];
        this.wheelDivider();
        this.createSpinWheel();
        this.calculateWeightsAndIndices();
    }

    // Calculate the angles 
    wheelDivider() {
        this._pieceAngle = 360 / this.totalWheelSegments; // 12 segments or pie
        this._halfPieceAngle = this._pieceAngle / 2.0;
        this._halfPieceAngleWithPaddings = this._halfPieceAngle - (this._halfPieceAngle / 4.0);

        // Setup the Half Angles array
        for (let i = 0; i < this.totalWheelSegments; i++) {
            this._halfAngleArray[i] = this._halfPieceAngle * (i + 1);   // 22.5, 45, ....            
        }
    }

    // Upgrade the Spin Wheel
    public upgradeWheel() {
        if (!this._isSpinning) {
            this.node.parent.getComponent(Animation).play("upgrade2");
            // Clear all the Game Objects of Wheel Pieces created earlier before creating new ones
            this.upgradeFireParticle.play();
            this.upgradeParticle.play();
            this.scheduleOnce(function () {
                for (let ele = this.allWheelPieceObjectsCollection.length - 1; ele >= 0; ele--) {
                    this.allWheelPieceObjectsCollection[ele].destroy();
                }
                GameManager.Instance.audioManager.playWheelUpgarde();
                // After destroying the objects, resize the allocated array else it will not free those previously allocated indices
                this.allWheelPieceObjectsCollection = [];
                this.createSpinWheel();
                GameManager.Instance.uiHandler.setCoins();  // update the required coins Ui data
                GameManager.Instance.isUpgradableUsingAd();
                //FBManager.Instance.savePlayerData();
                GameManager.Instance.uiHandler.onMultiplierValueChange();
                this.scheduleOnce(function () {
                    this.upgradeFireParticle.stop();
                }, .5);
                this.scheduleOnce(function () {
                    GameManager.Instance.uiHandler.levelUp.getChildByName("Level").getComponent(Label).string = "Level " + (GameManager.Instance.currentUpgradeLevel - 1).toString();
                    GameManager.Instance.uiHandler.levelUp.getChildByName("RewardCount").getComponent(Label).string = GameManager.Instance._upgradeReward[GameManager.Instance.currentUpgradeLevel - 1].toString();
                    GameManager.Instance.uiHandler.levelUp.scale = new Vec3(.1, .1, .1);
                    //GameManager.Instance.uiHandler.levelUp.getComponent(Sprite).color = color(255, 255, 255, 0);
                    GameManager.Instance.uiHandler.levelUp.active = true;
                    tween(GameManager.Instance.uiHandler.levelUp.getComponent(Sprite)).to(0.5, { color: new Color(255, 255, 255, 255) }).start();
                    tween(GameManager.Instance.uiHandler.levelUp).to(0.5, { scale: new Vec3(1, 1, 1) }).call(() => {
                        tween(GameManager.Instance.uiHandler.levelUp.getChildByName("Level"))
                            .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) }).
                            call(() => {
                                GameManager.Instance.uiHandler.levelUp.getChildByName("Level").getComponent(Label).string = "Level " + GameManager.Instance.currentUpgradeLevel.toString();
                            })
                            .to(0.5, { scale: new Vec3(1, 1, 1) })
                            .start()
                    }).start();
                }, 2.5);
            }, 1.0);
        }
    }

    createSpinWheel() {
        switch (GameManager.Instance.currentUpgradeLevel) { // Based on the current wheel upgrade level and construct the Wheel
            case 1:
                this.parseSpinWheelData(this._upgrade1);
                break;
            case 2:
                this.parseSpinWheelData(this._upgrade2);
                break;
            case 3:
                this.parseSpinWheelData(this._upgrade3);
                break;
            case 4:
                this.parseSpinWheelData(this._upgrade4);
                break;
            case 5:
                this.parseSpinWheelData(this._upgrade5);
                break;
            case 6:
                this.parseSpinWheelData(this._upgrade6);
                break;
            case 7:
                this.parseSpinWheelData(this._upgrade7);
                break;
            case 8:
                this.parseSpinWheelData(this._upgrade8);
                break;
            case 9:
                this.parseSpinWheelData(this._upgrade9);
                break;
            case 10:
                this.parseSpinWheelData(this._upgrade10);
                break;
            case 11:
                this.parseSpinWheelData(this._upgrade11);
                break;
            case 12:
                this.parseSpinWheelData(this._upgrade12);
                break;
            default:
                break;
        }
        this.setProbability();
    }

    setProbability() {
        switch (GameManager.Instance.currentUpgradeLevel) { // Based on the current level set probability
            case 1:
                this.generateRewardProbabilityPercentage(this._rewardProb1, this._betRewardProb1);
                break;
            case 2:
                this.generateRewardProbabilityPercentage(this._rewardProb2, this._betRewardProb2);
                break;
            case 3:
                this.generateRewardProbabilityPercentage(this._rewardProb3, this._betRewardProb3);
                break;
            case 4:
                this.generateRewardProbabilityPercentage(this._rewardProb4, this._betRewardProb4);
                break;
            case 5:
                this.generateRewardProbabilityPercentage(this._rewardProb5, this._betRewardProb5);
                break;
            case 6:
                this.generateRewardProbabilityPercentage(this._rewardProb6, this._betRewardProb6);
                break;
            case 7:
                this.generateRewardProbabilityPercentage(this._rewardProb7, this._betRewardProb7);
                break;
            case 8:
                this.generateRewardProbabilityPercentage(this._rewardProb8, this._betRewardProb8);
                break;
            case 9:
                this.generateRewardProbabilityPercentage(this._rewardProb9, this._betRewardProb9);
                break;
            case 10:
                this.generateRewardProbabilityPercentage(this._rewardProb10, this._betRewardProb10);
                break;
            case 11:
                this.generateRewardProbabilityPercentage(this._rewardProb11, this._betRewardProb11);
                break;
            case 12:
                this.generateRewardProbabilityPercentage(this._rewardProb12, this._betRewardProb12);
                break;
            default:
                break;
        }
    }

    // Assign the level specific reward Probability to global chance array
    generateRewardProbabilityPercentage(rewardProbability: number[], betRewardProbability: number[]) {
        if (GameManager.Instance.uiHandler.multiplierValue == 1) {
            for (let rp = 0; rp < rewardProbability.length; rp++) {
                this._wheelPieces.pieceChance[rp] = rewardProbability[rp];
            }
        }
        else {
            for (let rp = 0; rp < betRewardProbability.length; rp++) {
                this._wheelPieces.pieceChance[rp] = betRewardProbability[rp];
            }
        }
    }

    // Parse the upgrade data string for constructing the wheel pieces
    // ["COIN","7800","1","COIN","3000","3","ENERGY","10","1","PIGGYBANK","1","3","NONE","0","1","CHEST","1","1","KEY","1","1","BANKRUPT","0","1"];
    parseSpinWheelData(wheelData: string[]) {
        let colorCount = 0;
        this._count = 0;    // Reset the Counter, so that the upgrades are taken care
        //console.log(wheelData);
        for (let id = 0; id < wheelData.length; id = id + 3) {
            //console.log(id);
            switch (wheelData[id]) {
                case "NONE":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.NONE, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "NONE");
                    break;
                case "COIN":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.COIN, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "COIN");
                    break;
                case "ENERGY":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.ENERGY, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "ENERGY");
                    break;
                case "CHEST":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.CHEST, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "CHEST");
                    break;
                case "KEY":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.KEY, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "KEY");
                    break;
                case "BANKRUPT":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.BANKRUPT, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "BANKRUPT");
                    break;
                case "PIGGYBANK":
                    this.generateWheelPieces(parseInt(wheelData[id + 2]), RewardType.PIGGYBANK, parseInt(wheelData[id + 1]), this.colorSprites[this.colorcode[GameManager.Instance.currentUpgradeLevel - 1][colorCount]], "PIGGYBANK");
                    break;
                default:
                    break;
            }
            colorCount++;
        }
        this.parseSpinSplitWheelData(wheelData);
    }

    parseSpinSplitWheelData(wheelData: string[]) {
        this._countSplit = 0;
        for (let id = 0; id < wheelData.length; id = id + 3) {
            this.generateWheelSplitPieces(parseInt(wheelData[id + 2]));
        }
    }

    //Generate Split line between Pies
    generateWheelSplitPieces(numPies: number) {
        //console.log ("Num Pies : ", numPies, "Item : ", rewardItem, "Amount : ", rewardCount);
        for (let i = 0; i < numPies; i++) {
            let accumAngle = 0;
            if (this._countSplit == 0)
                accumAngle = this._halfAngleArray[this._countSplit];
            else
                accumAngle = this._halfAngleArray[this._countSplit] + this._halfAngleArray[this._countSplit - 1];

            if (i == numPies - 1) {
                let pie: Node = instantiate(this.wheelPiecePieSplit);
                pie.setWorldRotationFromEuler(0, 0, -accumAngle + (-15));
                pie.setParent(this.wheelPiecesParent);

                this.allWheelPieceObjectsCollection[this.allWheelPieceObjectsCollection.length] = pie;
            }
            this._countSplit++;
        }
    }
    // Dynamically generate the Wheel pieces
    generateWheelPieces(numPies: number, rewardItem: number, rewardCount: number, colorSprite: SpriteFrame, itemName: string) {
        //console.log("Num Pies : ", numPies, "Item : ", rewardItem, "Amount : ", rewardCount);

        for (let i = 0; i < numPies; i++) {
            // Calculate the amount of angle needs to be rotated
            let accumAngle = 0;
            if (this._count == 0)
                accumAngle = this._halfAngleArray[this._count];
            else
                accumAngle = this._halfAngleArray[this._count] + this._halfAngleArray[this._count - 1];

            // Wheel Color BG Pie generation
            //console.log("instantiate wheel piece ")
            let pie = instantiate(this.wheelPiecePie);
            //console.log(pie)
            pie.setPosition(this.wheelPiecesParent.position.x, this.wheelPiecesParent.position.y, this.wheelPiecesParent.position.z);
            pie.getComponent(Sprite).spriteFrame = colorSprite;

            pie.setWorldRotationFromEuler(0, 0, -accumAngle + (-15)); // -15 degrees needs to be rotated for the Pie BG image 
            pie.setParent(this.wheelPiecesParent);
            //console.log("instantiated wheel piece ")

            this.allWheelPieceObjectsCollection[this.allWheelPieceObjectsCollection.length] = pie; // Collect the objects so that we can destroy later

            // Store the generated wheel data for accessing the piece later for rewarding purpose
            this._wheelPieces.generatedPieceName[this._count] = itemName;
            this._wheelPieces.generatedRewardAmount[this._count] = rewardCount;

            // Create Wheel Pieces only for the mid pies and not for all the pies
            let midIndex = 0;
            let isMidOdd = true;
            if (numPies > 1) { // Assuming always the num Pies will be ODD number
                midIndex = Math.floor(numPies / 2);
                if (numPies % 2 == 0) {
                    isMidOdd = false;
                }
            }
            //console.log ("midIndex : ", midIndex);

            // Create the wheel piece only on the mid pie
            if (i == midIndex) {
                //console.log ("INSIDE MID");
                let piece: Node = instantiate(this.wheelPiecePrefab);   // Wheel reward content (Icon, amount)
                piece.setPosition(this.wheelPiecesParent.position.x, this.wheelPiecesParent.position.y, this.wheelPiecesParent.position.z);
                piece.setScale(1, 1, 1);

                let pieceHolder: Node = piece.getChildByName('Piece Holder');
                pieceHolder.setPosition(0, 160, 0);
                pieceHolder.name = itemName;

                let tempIcon: Node = pieceHolder.getChildByName('Icon');
                tempIcon.getComponent(Sprite).spriteFrame = this._wheelPieces.pieceIcon[rewardItem]; // Set the reward icon by reading the master icon array
                if (rewardCount == 0) {
                    pieceHolder.getChildByName('Text').getComponent(Label).node.active = false;
                }
                else {
                    pieceHolder.getChildByName('Text').getComponent(Label).node.active = true;
                    pieceHolder.getChildByName('Text').getComponent(Label).string = GameManager.Instance.abbreviateNumber(rewardCount).toString(); // Set the reward text from the upgrade data provided
                }
                if (isMidOdd) {
                    piece.setWorldRotationFromEuler(0, 0, -accumAngle);
                }
                else {
                    piece.setWorldRotationFromEuler(0, 0, -accumAngle + 15);
                }


                // Attach all the pieces to the respective parents on the scene which are pre-rotated. 
                piece.setParent(this.wheelPiecesParent);
                this.allWheelPieceObjectsCollection[this.allWheelPieceObjectsCollection.length] = piece;
            }

            this._count++;
        }
    }

    // Calculate the accumulated weight which is set per spoke piece and set the index of those pieces for later identification
    calculateWeightsAndIndices() {
        let counter = 0;
        this._accumulatedWeight = 0;
        //console.log("Accumulated Weights Before : " + this._accumulatedWeight);
        for (let i = 0; i < this.totalWheelSegments; i++) {
            // Add Weights
            this._accumulatedWeight = this._accumulatedWeight + this._wheelPieces.pieceChance[i];
            this._wheelPieces.pieceWieghtage[i] = this._accumulatedWeight;

            // Add Index
            this._wheelPieces.pieceIndex[i] = i;

            // Save non zero chance indices
            if (this._wheelPieces.pieceChance[i] > 0) {
                this._nonZeroChancesIndices[counter] = i;
                counter++;
            }
        }
        //console.log("Accumulated Weights : " + this._accumulatedWeight, this._wheelPieces.pieceChance, this._wheelPieces.pieceWieghtage);
    }

    // Get a random spoke piece index to set the angle
    getRandomPieceIndex() {
        let r = randomRange(0.0, 1.0);
        let rd = r * this._accumulatedWeight;
        //console.log("Random Range : " + r + " next val : " + rd);
        for (let i = 0; i < this.totalWheelSegments; i++) {
            if (this._wheelPieces.pieceWieghtage[i] >= rd) {
                return i;
            }
        }
        return 0;
    }

    // Spin the Fortune wheel with Tweening and easing out
    public spinTheWheel() {
        if (this._isSpinning
            || GameManager.Instance.uiHandler.chestPanel.active
            || GameManager.Instance.uiHandler.menu.active
            || GameManager.Instance.uiHandler.outofEnergyPopup.active
            || GameManager.Instance.uiHandler.piggyBankGroup.active
            || GameManager.Instance.dailyRewards.dailyRewardNode.active
            || GameManager.Instance.spiWithoutAd >= 4) // Don't do anything if its already in spinning state
            return;
        //console.log ("Nathan Energy -- ", GameManager.Instance.energyAccumulated);    
        if (GameManager.Instance.energyAccumulated < 1) {

            console.log ("Inside < 1....")
            GameManager.Instance.audioManager.playNoEnergy();
            GameManager.Instance.uiHandler.outofEnergyPopup.scale = new Vec3(0.1, 0.1, 0.1);
            GameManager.Instance.uiHandler.outofEnergyPopup.active = true;
            // NATHAN COMMENTED THIS LINE SINCE ITS THROWING ERROR
            //GameManager.Instance.uiHandler.outofEnergyPopup.getComponent(Sprite).color = new Color(255, 255, 255, 0);
            GameManager.Instance.uiHandler.outofEnergyPopup.children[2].getComponentInChildren(Label).string = GameManager.Instance.adrewardOutOfEnergy.toString();
            tween(GameManager.Instance.uiHandler.outofEnergyPopup).to(0.5, { scale: new Vec3(1, 1, 1) }).start()
            //tween(GameManager.Instance.uiHandler.outofEnergyPopup.getComponent(Sprite)).to(0.5, { color: new Color(255, 255, 255, 255) }).start()
            AnalyticsManager.Instance.onOutofEnergyPopUpShow();
            return;
        }

        if (GameManager.Instance.tutorialHand.active) {
            GameManager.Instance.tutorialHand.active = false;
        }
        if (this.firsttime && FBManager.Instance.FB != undefined) {
            FBManager.Instance.loadBannerAd(FBManager.Instance.FB);
            this.firsttime = false;
        }
        this._isSpinning = true;
        //console.log(GameManager.Instance.energyAccumulated, GameManager.Instance.uiHandler.multiplierValue)
        GameManager.Instance.consumeEnergy(GameManager.Instance.uiHandler.multiplierValue);
        GameManager.Instance.audioManager.playSpinButton();
        this.unschedule(GameManager.Instance.SpinButtonAnimSchedule);
        this.spinParticle.play();
        this.spinButton.getChildByName("Ripple").getComponent(ParticleSystem).play();
        //console.log("Spin clicked..........");
        AnalyticsManager.Instance.forMultiplier(GameManager.Instance.uiHandler.multiplierValue);
        // consume Energy for spinning
        this.setProbability();
        this.calculateWeightsAndIndices();
        let angleToRotate: number = 0.0;
        let prevAngle: number = 0.0;
        let currAngle: number = 0.0;
        let index = this.getRandomPieceIndex(); // Get the outcome index of the weighted pieces, so that the pointer can point at it.
        //console.log("Selected Index : ", index)
        if (this._wheelPieces.pieceChance[index] == 0 && this._nonZeroChancesIndices.length != 0) {
            index = this._nonZeroChancesIndices[randomRangeInt(0, this._nonZeroChancesIndices.length)];
            console.log("Selected Index : ", index)
        }
        // Calculate the rotation to spin the wheel and stop at the selected index
        angleToRotate = -(this._pieceAngle * index);

        let rightOffset = (angleToRotate - this._halfPieceAngleWithPaddings) % 360;
        let leftOffset = (angleToRotate + this._halfPieceAngleWithPaddings) % 360;

        let randomAngle = randomRange(leftOffset, rightOffset);

        let targetRotation: Vec3 = new Vec3(0, 0, 0);
        let targetAngle = (randomAngle + (2 * 360 * 8)); // 8 - spin duration
        Vec3.multiplyScalar(targetRotation, new Vec3(0, 0, -1), targetAngle);
        //console.log("Index : " + index + " Angle : " + angleToRotate + " right : " + rightOffset + " left : " + leftOffset + " rand Angle : " + randomAngle + " target Angle : " + targetAngle);


        tween(this.spinButton).to(0.1, { scale: new Vec3(.9, .9, .9) }).to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) }).to(0.1, { scale: new Vec3(1, 1, 1) }).call(() => {
            //
            this.node.setRotationFromEuler(0, 0, -21);
            prevAngle = this.node.eulerAngles.z;
            currAngle = prevAngle;
            this.node.getChildByName("SpiralParent").active = true;
            this.scheduleOnce(function () {
                this.node.getChildByName("SpiralParent").active = false;
            }, 2);
            //console.log("Target Rotation : " + targetRotation);
            //console.log("Target Angle : " + targetAngle);
            GameManager.Instance.audioManager.playWheelSpin();
            // For correction of angle added 15 degrees to match the outcome
            tween(this.node).to(4, { angle: -targetAngle + 15 }, { easing: 'sineOut' }).call(() => { this.onSpinComplete(index); }).start();
            //
        }).start();

        

        tween(this.node).to(.15, { scale: new Vec3(1.05, 1.05, 1.05) }).to(.15, { scale: new Vec3(1, 1, 1) }).start();
        tween(this.wheelBG).to(.15, { scale: new Vec3(1.05, 1.05, 1.05) }).to(.15, { scale: new Vec3(1, 1, 1) }).start();
        //console.log ("All Tweens completed..");
    }

    // On Wheel Spin complete do this
    onSpinComplete(id: number) {
        //console.log ("Came to Spin Complete");
        this.pointerWheel.play();
        this.scheduleOnce(function () {
            // Here this refers to component
            this.rewardPlayer(id); // // Send the index to reward the player appropriately
            GameManager.Instance.spiWithoutAd++;
            this.scheduleOnce(function () {
                GameManager.Instance.isUpgradableUsingAd();
            }, 4);
            if (GameManager.Instance.spiWithoutAd >= 4) {
                this.scheduleOnce(function () {
                    FBManager.Instance.showInterstitial();
                }, 2);
            }

            //Multplier HANDLE
            if (GameManager.Instance.energyAccumulated < 5) {
                GameManager.Instance.uiHandler.multiplierValue = 1;
                GameManager.Instance.uiHandler.onMultiplierValueChange();
                GameManager.Instance.uiHandler.multiplier.string = "x" + GameManager.Instance.uiHandler.multiplierValue.toString();
            }

            this._isSpinning = false;
            if (GameManager.Instance.tutorialIndex == 1) {
                GameManager.Instance.tutorialHand.active = true;
                GameManager.Instance.tutorialHand.position = new Vec3(120, -280, 0) //GameManager.Instance.uiHandler.multiplier.node.parent.worldPosition;
                GameManager.Instance.tutorialIndex = 2;
            }
        }, 1);
        //console.log ("Exiting Spin Complete");
    }

    // Give respective reward item and quantity based on the Spin
    rewardPlayer(id: number) {
        let reward = this._wheelPieces.generatedPieceName[id];
        let rewardAmount = this._wheelPieces.generatedRewardAmount[id];
        //console.log("reward item : ", reward, " Amount : ", rewardAmount);
        this.node.getChildByName("Light").getComponent(Animation).play("LightWin");
        this.scheduleOnce(function () {
            this.node.getChildByName("Light").getComponent(Animation).play();
        }, .5);
        switch (reward) {
            case "NONE":
                GameManager.Instance.audioManager.playGetNothingtFromWheel();
                // Do nothing
                break;
            case "COIN":
                GameManager.Instance.audioManager.playGetCoinFromWheel();
                GameManager.Instance.addCoins(rewardAmount * GameManager.Instance.uiHandler.multiplierValue);
                if (rewardAmount * GameManager.Instance.uiHandler.multiplierValue < 5000) {
                    this.coinShowerSmall.node.parent.active = true;
                    this.coinShowerSmall.play();
                    this.scheduleOnce(function () {
                        this.coinShowerSmall.node.parent.active = false;
                    }, 5);
                }
                else {
                    this.coinShowerBig.node.parent.active = true;
                    this.coinShowerBig.play();
                    this.scheduleOnce(function () {
                        this.coinShowerBig.node.parent.active = false;
                    }, 5);
                }
                //GameManager.Instance.playCoinParticle();
                break;
            case "ENERGY":
                GameManager.Instance.addEnergy(rewardAmount * GameManager.Instance.uiHandler.multiplierValue);
                GameManager.Instance.playEnergyParticle(rewardAmount * GameManager.Instance.uiHandler.multiplierValue);
                break;
            case "CHEST":
                this.scheduleOnce(function () {
                    GameManager.Instance.addChest(rewardAmount);
                }, 1.1);
                this.chestReward.play();
                GameManager.Instance.audioManager.playGetChestFromWheel();
                break;
            case "KEY":
                this.scheduleOnce(function () {
                    GameManager.Instance.addKey(rewardAmount);
                }, 1.1);
                this.keyReward.play();
                GameManager.Instance.audioManager.playGetKeyFromWheel();
                break;
            case "BANKRUPT":
                GameManager.Instance.audioManager.playGetBankruptFromWheel();
                GameManager.Instance.consumeCoins(GameManager.Instance.coinsCollected, "Bankrupt");
                break;
            case "PIGGYBANK":
                GameManager.Instance.audioManager.playGetPiggyFromWheel();
                GameManager.Instance.uiHandler.openPiggyBank();
                break;
            default:
                //console.log("------------- MISSED ITEM ------------ ", reward);
                break;
        }
    }

}


