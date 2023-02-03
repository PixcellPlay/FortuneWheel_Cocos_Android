import { _decorator, Component, Node, randomRangeInt, randomRange, Animation, tween, Sprite, Color, game, Vec3, color } from 'cc';
import { AnalyticsManager } from './AnalyticsManager';
import { FBManager } from './FBManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('DailyRewards')
export class DailyRewards extends Component {

    // @property({ type: Number })
    rewardWeightage: number[][] = [[100, 0, 0, 0], [0, 50, 50, 0], [0, 0, 0, 100]];
    public DateTimeValue: any;

    _accumulatedWeight: number = 0;
    totalSegments: number = 4;
    clickedIndex: number = 0;

    @property({ type: Node })
    public dailyRewardNode: Node;

    @property({ type: Animation })
    public dailyRewardButtonAnimation: Animation;

    @property({ type: String })
    public giftBoxState: string = "111";

    start() {
        GameManager.Instance.dailyRewards = this;
        // GameManager.Instance.dailyRewards.checkDailyReward(1670393842, "111")
        if (this.clickedIndex < 3) {
            this.schedule(function () {
                this.dailyRewardButtonAnimation.play();
            }, 7);
        }
        else {
            this.unscheduleAllCallbacks();
        }
    }

    update(deltaTime: number) {

    }

    checkDailyReward(savedTime: any, giftBoxState: string) {
        fetch("http://worldtimeapi.org/api/ip")
            .then(res => res.json()) // the .json() method parses the JSON response into a JS object literal
            .then(data => this.getTime(data, savedTime));
        this.giftBoxState = giftBoxState;
    }

    getTime(currentTime: any, savedTime: any) {
        this.DateTimeValue = currentTime;
        this.timeDifference(this.DateTimeValue.unixtime, savedTime);
    }

    timeDifference(date1: number, date2: number) {

        var difference = (date1) - (date2);
        let d1 = this.format(new Date(date1 * 1000));
        let d2 = this.format(new Date(date2 * 1000));
        console.log(d1, d2, (d1 != d2));


        var daysDifference = difference / (60 * 60 * 24);

        var days = Math.floor((((difference) / 60) / 60) / 24)


        var minutesDifference = Math.floor(difference / (1000 * 60));


        console.log('difference = ' + days + ' day/s ' + minutesDifference + ' minute/s '
        );

        if (d1 != d2) {
            this.giftBoxState = "111";
            this.clickedIndex = 0;
            this.setGiftBoxState();
            // this.dailyRewardNode.active = true;
        }
        else {
            this.setGiftBoxState();
        }
        if (this.clickedIndex < 3) {
            this.schedule(function () {
                this.dailyRewardButtonAnimation.play();
            }, 7);
        }
        else {
            this.unscheduleAllCallbacks();
        }

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


    firstRewardButtonClick() {
        this.buttonAction(this.dailyRewardNode.children[2], this.dailyRewardNode.children[3]);
        GameManager.Instance.audioManager.playButtonClick();
    }

    secondrewaedButtonClick() {
        this.buttonAction(this.dailyRewardNode.children[4], this.dailyRewardNode.children[5]);
        GameManager.Instance.audioManager.playButtonClick();
    }

    thirdRewardButtonClick() {
        this.buttonAction(this.dailyRewardNode.children[6], this.dailyRewardNode.children[7]);
        GameManager.Instance.audioManager.playButtonClick();
    }

    buttonAction(node: Node, nodeparticle: Node) {
        if (this.clickedIndex == 0) {
            this.giftBoxState = "";
            fetch("http://worldtimeapi.org/api/ip")
                .then(res => res.json()) // the .json() method parses the JSON response into a JS object literal
                .then(data => FBManager.Instance.savePlayerDailyGiftCollectTimeData(data.unixtime));
            node.active = false;
            nodeparticle.active = false;
            this.dailyRewardNode.getChildByName("ChoosetheBox").active = false;
            this.rewardChecker();
            for (let i = 2; i < 7; i = i + 2) {
                if (this.dailyRewardNode.children[i].active == true) {
                    this.dailyRewardNode.children[i].getChildByName("Ad").active = true;
                }
            }
        }
        else {
            FBManager.Instance.ShowRewardedVideoAd("DailyGift", node);
        }
        AnalyticsManager.Instance.onDailyGiftBoxOpen(this.clickedIndex);
        if (this.clickedIndex < 3) {
            this.schedule(function () {
                this.dailyRewardButtonAnimation.play();
            }, 7);
        }
        else {
            this.unscheduleAllCallbacks();
        }
    }

    getRandomIndex() {
        if (this.rewardWeightage != null) {
            // let i = 0
            for (let i = 0; i < this.rewardWeightage[this.clickedIndex].length; i++) {
                this._accumulatedWeight = this._accumulatedWeight + this.rewardWeightage[this.clickedIndex][i];
                console.log(this._accumulatedWeight, i, this.rewardWeightage[this.clickedIndex].length)
            }
        }
        let r = randomRange(0.0, 1.0);
        let rd = r * this._accumulatedWeight;
        console.log("Random Range : " + r + " next val : " + rd, ".....", this._accumulatedWeight);
        for (let j = 0; j < this.totalSegments; j++) {
            if (this.rewardWeightage[this.clickedIndex][j] >= rd) {
                return j;
            }
        }
        return 0;
    }

    rewardChecker() {
        this.giftBoxState = "";
        for (let i = 2; i < 7; i = i + 2) {
            if (!this.dailyRewardNode.children[i].active) {
                this.giftBoxState = this.giftBoxState + "0";
            }
            else {
                this.giftBoxState = this.giftBoxState + "1";
            }
            console.log(this.giftBoxState);
        }
        let reward = this.getRandomIndex()
        console.log("Daily Reward Index", reward, this.giftBoxState);
        this.rewardCollect(reward);
        this.clickedIndex++;
        //FBManager.Instance.savePlayerDailyGiftStateData();
        GameManager.Instance.writePlayerDataToStorageAndroid();

        if (!(this.giftBoxState.includes("1"))) {
            this.dailyRewardNode.getChildByName("NoMoreChest").active = true;
            this.dailyRewardNode.getChildByName("ChoosetheBox").active = false;
        }
    }


    rewardCollect(reward: number) {
        tween(this.dailyRewardNode.getComponent(Sprite)).to(0.1, { color:color(255,255, 255,0) }).to(2.3, { color:color(255,255, 255,0) }).to(0.1, { color:color(255,255, 255,255) }).start()
        switch (reward) {
            case 0:
                GameManager.Instance.addCoins(randomRangeInt(500, 2000));
                GameManager.Instance.playCoinParticle();
                break;
            case 1:
                GameManager.Instance.addChest(1);
                break;
            case 2:
                GameManager.Instance.addKey(1);
                break;
            case 3:
                var reward: number = randomRangeInt(5, 20);
                GameManager.Instance.addEnergy(reward);
                GameManager.Instance.playEnergyParticle(reward);
                break;
            default:
                console.log("------------- MISSED ITEM ------------ ", reward);
                break;
        }
    }

    setGiftBoxState() {
        console.log(this.giftBoxState, " data type ", typeof (this.giftBoxState));
        for (let i = 2; i < 7; i = i + 2) {
            if (this.giftBoxState != "" && this.giftBoxState != undefined) {
                let pos = (i / 2) - 1;
                console.log(pos, " Error Identifier ");
                // console.log(this.giftBoxState.charAt(pos));
                if (this.giftBoxState.charAt(pos) == "0") {
                    this.dailyRewardNode.children[i].active = false;
                    this.dailyRewardNode.children[i + 1].active = false;
                }
                else {
                    if (this.clickedIndex > 0)
                        this.dailyRewardNode.children[i].getChildByName("Ad").active = true;
                    this.dailyRewardNode.children[i].active = true;
                    this.dailyRewardNode.children[i + 1].active = true;
                }
                // console.log(this.dailyRewardNode.children[i], this.giftBoxState.charAt(pos));
            }
            else {
                this.dailyRewardNode.children[i].active = true;
                console.log(this.dailyRewardNode.children[i]);
            }
        }
        console.log(!(this.giftBoxState.includes("1")), ".......", this.giftBoxState);
        if (!(this.giftBoxState.includes("1"))) {
            this.dailyRewardNode.getChildByName("NoMoreChest").active = true;
            this.dailyRewardNode.getChildByName("ChoosetheBox").active = false;
        }
        else {
            this.dailyRewardNode.getChildByName("NoMoreChest").active = false;
            this.dailyRewardNode.getChildByName("ChoosetheBox").active = true;
        }
    }

    openDailyRewards() {
        if (!GameManager.Instance.spinWheel._isSpinning
            && !GameManager.Instance.uiHandler.chestPanel.active
            && !GameManager.Instance.uiHandler.menu.active
            && !GameManager.Instance.uiHandler.outofEnergyPopup.active
            && !GameManager.Instance.uiHandler.piggyBankGroup.active) // Don't do anything if its already in spinning state
        this.dailyRewardNode.active = true;
        // NATHAN COMMENTED THIS LINE SINCE ITS THROWING ERROR
        //this.dailyRewardNode.getComponent(Sprite).color = new Color(255, 255, 255, 0);
        tween(this.dailyRewardNode.getComponent(Sprite)).to(0.5, { color: new Color(255, 255, 255, 255) }).start();
        this.setGiftBoxState();
    }

    closeDailyRewards() {
        this.dailyRewardNode.active = false;
        GameManager.Instance.audioManager.playButtonClick();
        if (this.clickedIndex < 3) {
            this.schedule(function () {
                this.dailyRewardButtonAnimation.play();
            }, 7);
        }
        else {
            this.unscheduleAllCallbacks();
        }
    }
}

