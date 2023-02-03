
import { _decorator, Component, Node, tween, Vec3, sys } from 'cc';
import { AnalyticsManager } from './AnalyticsManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('FBManager')
export class FBManager extends Component {

    public static Instance: FBManager;

    FB: any;
    public preloadedRewardedVideo = null;
    public preloadedInterstitial = null;

    start() {
        if (FBManager.Instance == null) {
            FBManager.Instance = this;
        }
        // this.getLocalPlayerData();
 
        // <----- USE THIS BELOW BLOCK FOR ANDROID ONLY -------> 
        //Turn Of Title Screen And Play Start Animation
        /*
        let s = this.schedule(function () {
            console.log("Scheduler");
            GameManager.Instance.onStart();
            GameManager.Instance.titleScreen.active = false;
            this.unschedule(s);
        }, 3);
        */

        tween(this.node)
            .to(3, { scale: new Vec3(1.0, 1.0, 1.0) }) 
            .call(() => { 
                console.log("Scheduler");
                GameManager.Instance.onStart();
                GameManager.Instance.titleScreen.active = false; 
            })
            .start()
        
        GameManager.Instance.getPlayerDataFromStorageAndroid();

        //GameManager.Instance.uiHandler.musicsfxStateOnStart();
    }

    public getInstantMethod(fb: undefined) {
        this.FB = fb;
        this.getPlayerData();
        this.loadRewardedVideoAd();
        this.loadInterstetialAd();
        //Turn Of Title Screen And Play Start Animation
        this.scheduleOnce(function () {
            console.log("Scheduler");
            GameManager.Instance.onStart();
            GameManager.Instance.titleScreen.active = false;
        }, 3);
    }

    getPlayerData() {
        if (this.FB != undefined) {
            this.FB.player
                .getDataAsync(['currentCoins', 'currentEnergy', 'currentChest', 'currentKey', 'currentSpinwheelLevel', 'giftBoxState', 'dailyGiftCollectTime', 'clickIndex', 'musicState', 'sfxState', 'tutorialIndex', 'logoutTime'])
                .then(function (data: { [x: string]: any; }) {
                    // Check for Not a fresh profile
                    if (data['currentCoins'] != undefined) {
                        GameManager.Instance.coinsCollected = parseInt(data['currentCoins']);
                        GameManager.Instance.energyAccumulated = parseInt(data['currentEnergy']);
                        GameManager.Instance.chestCollected = parseInt(data['currentChest']);
                        GameManager.Instance.keysCollected = parseInt(data['currentKey']);
                        GameManager.Instance.currentUpgradeLevel = parseInt(data['currentSpinwheelLevel']);
                        GameManager.Instance.tutorialIndex = parseInt(data['tutorialIndex']);
                        GameManager.Instance.dailyRewards.clickedIndex = data['clickIndex'];
                        GameManager.Instance.audioManager.sfxState = data['sfxState'];
                        GameManager.Instance.audioManager.musicState = data['musicState'];

                        // Check for does have daily Gift Data
                        GameManager.Instance.dailyRewards.checkDailyReward(parseInt(data['dailyGiftCollectTime']), data['giftBoxState'].toString());
                        GameManager.Instance.checkEnergyRegeneration(parseInt(data['logoutTime']));
                        console.log("Energy Regeneraation started for with login time or 0 time");

                        console.log('data is loaded', data['currentCoins'], data['currentEnergy'], data['currentSpinwheelLevel'], data['currentChest'], data['currentKey'], "DailyReward Collected Time", data['dailyGiftCollectTime'], data['giftBoxState'], data['clickIndex'], data['sfxState'], data['musicState'], data['tutorialIndex'], data['logoutTime']);

                        GameManager.Instance.spinWheel.onStart();
                        console.log(GameManager.Instance.energyAccumulated);
                        GameManager.Instance.consumeEnergy(0);
                        GameManager.Instance.uiHandler.setCoins();
                        GameManager.Instance.consumeKey(0);
                        GameManager.Instance.consumeChest(0);
                        GameManager.Instance.isUpgradableUsingAd();
                        GameManager.Instance.uiHandler.musicsfxStateOnStart();


                    } else { //Fresh User
                        GameManager.Instance.isEnergyRegenerationStart = true;
                        console.log("Energy Regeneraation started for without login time or 0 time");

                        GameManager.Instance.dailyRewards.clickedIndex = 0;
                        GameManager.Instance.dailyRewards.giftBoxState = "111";
                        GameManager.Instance.dailyRewards.checkDailyReward(0, "111")
                    }

                });
        }
        else {
            console.log("UNDEFINED");
        }
    }

    public Share() {
        if (this.FB != undefined) {
            this.FB.shareAsync({
                // image: window.,
                text: 'Fortune Wheel',
                data: { myReplayData: '...' },
                shareDestination: ['NEWSFEED', 'GROUP', 'COPY_LINK', 'MESSENGER'],
                switchContext: false,
            }).then(function () {
                // continue with the game.
                console.log("SHOWING SHARE SCREEN")
                AnalyticsManager.Instance.onShare();
            });
        }
        else {
            console.log("UNDEFINED");
        }
    }


    public savePlayerData() {
        let time: number;
        fetch("http://worldtimeapi.org/api/ip")
            .then(res => res.json()) // the .json() method parses the JSON response into a JS object literal
            .then(data => time = data.unixtime);
        if (this.FB != undefined) {
            this.FB.player
                .setDataAsync({
                    currentCoins: GameManager.Instance.coinsCollected,
                    currentEnergy: GameManager.Instance.energyAccumulated,
                    currentChest: GameManager.Instance.chestCollected,
                    currentKey: GameManager.Instance.keysCollected,
                    currentSpinwheelLevel: GameManager.Instance.currentUpgradeLevel,
                    tutorialIndex: GameManager.Instance.tutorialIndex,
                    logoutTime: time,
                })
                .then(function () {
                    console.log('data is saved', GameManager.Instance.coinsCollected, GameManager.Instance.energyAccumulated)
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }


    loadBannerAd(FBInstant: any) {
        FBInstant.loadBannerAdAsync(
            '1460039451167364_1506465463191429'
        ).then(() => {
            console.log('success');
        });
    }

    loadInterstetialAd() {
        if (this.FB != undefined) {
            this.FB.getInterstitialAdAsync(
                '1460039451167364_1506465849858057' // Your Ad Placement Id
            ).then((interstitial: any) => {
                // Load the Ad asynchronously
                this.preloadedInterstitial = interstitial;
                if (this.preloadedInterstitial != null)
                    return this.preloadedInterstitial.loadAsync();
            }).then(function () {
                console.log('Interstitial video preloaded');
            }).catch((err: { message: string; }) => {
                console.error('Interstitial video failed to preload: ' + err.message);
                this.scheduleOnce(this.HandleVideoAdNoFill(this.preloadedInterstitial, 2), 45);
            });
        }
    }


    loadRewardedVideoAd() {
        if (this.FB != undefined) {
            console.log("API Support", this.FB.getSupportedAPIs());
            this.FB.getRewardedVideoAsync(
                '1460039451167364_1506464946524814' // Your Ad Placement Id
            ).then((rewarded: any) => {
                // Load the Ad asynchronously
                this.preloadedRewardedVideo = rewarded;
                return this.preloadedRewardedVideo.loadAsync();
            }).then(function () {
                console.log('preloaded Rewarded ad');
            }).catch((err: { message: string; }) => {
                console.error('failed to preload: ' + err.message);
                this.scheduleOnce(this.HandleVideoAdNoFill(this.preloadedRewardedVideo, 2), 45);
            });
        }
    }


    public HandleVideoAdNoFill(adInstance: any, attemptNumber: any) {
        if (attemptNumber > 3) {
            // You can assume we will not have to serve in the current session, no need to try
            // to load another ad.
            return;
        } else {
            adInstance.loadAsync().then(function () {
                // This should get called if we finally have ads to serve.
                console.log('Rewarded preloaded')
            }).catch((err: { message: string; }) => {
                console.error('Rewarded failed to preload: ' + err.message);
                // You can try to reload after 30 seconds
                setTimeout(() => {
                    this.HandleVideoAdNoFill(adInstance, attemptNumber + 1);
                }, 30 * 1000);
            });
        }
    }




    getLocalPlayerData() {
        let data: number[] = [1000, 5, 1, 1, 1, 0, 0, 111, 0, 1, 1, 0]
        GameManager.Instance.coinsCollected = data[0];
        GameManager.Instance.energyAccumulated = data[1];
        GameManager.Instance.chestCollected = data[2];
        GameManager.Instance.keysCollected = data[3];
        GameManager.Instance.currentUpgradeLevel = data[4];
        GameManager.Instance.tutorialIndex = data[5];
        console.log("Data Assaigned for coin,energy,key,...")
        GameManager.Instance.spinWheel.onStart();
        GameManager.Instance.consumeEnergy(0);
        GameManager.Instance.uiHandler.setCoins();
        GameManager.Instance.consumeKey(0);
        GameManager.Instance.consumeChest(0);
        GameManager.Instance.isUpgradableUsingAd();

        // Check for does have daily Gift Data
        GameManager.Instance.dailyRewards.checkDailyReward(data[6], data[7].toString());
        GameManager.Instance.dailyRewards.clickedIndex = data[8];


        GameManager.Instance.audioManager.sfxState = data[9];
        GameManager.Instance.audioManager.musicState = data[10];
        GameManager.Instance.uiHandler.musicsfxStateOnStart();

        GameManager.Instance.checkEnergyRegeneration(data[11]);
        console.log("Energy Regeneraation started for with login time or 0 time");

        console.log("Scheduler");
        GameManager.Instance.onStart();
        GameManager.Instance.titleScreen.active = false;
    }



    public ShowRewardedVideoAd(adFrom: string, node: Node) {
        // if (this.preloadedRewardedVideo != null)
        //     GameManager.Instance.audioManager.stopBG();
        // this.preloadedRewardedVideo.showAsync()
        //     .then(() => {
                // Perform post-ad success operation
                GameManager.Instance.spiWithoutAd = 0;
                AnalyticsManager.Instance.onAdShow();
                console.log('Rewarded video watched successfully');
                switch (adFrom) {
                    case "GetEnergy": GameManager.Instance.uiHandler.energyAdWatchReward();
                        break;
                    case "OpenChest": GameManager.Instance.uiHandler.openChestWithAd();
                        break;
                    case "UpgradeWheel": GameManager.Instance.uiHandler.upgradeWheelByAd();
                        break;
                    case "DoublePiggyReward": GameManager.Instance.uiHandler.doublePiggyReward();
                        break;
                    case "DoubleChestReward": GameManager.Instance.uiHandler.doubleChestReward();
                        break;
                    case "DailyGift": node.active = false;
                        AnalyticsManager.Instance.onDailyGiftAdButtonClicked();
                        GameManager.Instance.dailyRewards.rewardChecker();
                        break;
                }
                // this.loadRewardedVideoAd();
                GameManager.Instance.audioManager.playBG();
            // })
            // .catch((e: { message: any; }) => {
            //     console.error(e.message, 'ad error message');
            //     GameManager.Instance.spiWithoutAd = 0;
            //     AnalyticsManager.Instance.onAdFailToShow();
            //     this.loadRewardedVideoAd();
            // });
    }



    resetFBData() {
        let vcurrentCoins = 0;
        let vcurrentEnergy = 20;
        let vcurrentChest = 1;
        let vcurrentKey = 1;
        let vcurrentSpinwheelLevel = 1;
        let vclickedIndex = 0;
        let vmusicState = 1;
        let vsfxState = 1;
        let vtutorialIndex = 100;
        let vgiftBoxState = "111";
        if (this.FB != undefined) {
            this.FB.player
                .setDataAsync({
                    currentCoins: vcurrentCoins,
                    currentEnergy: vcurrentEnergy,
                    currentChest: vcurrentChest,
                    currentKey: vcurrentKey,
                    currentSpinwheelLevel: vcurrentSpinwheelLevel,
                    giftBoxState: vgiftBoxState,
                    clickIndex: vclickedIndex,
                    dailyGiftCollectTime: 0,
                    musicState: vmusicState,
                    sfxState: vsfxState,
                    tutorialIndex: vtutorialIndex,
                    logoutTime: 0,
                })
                .then(function () {
                    console.log('data is set');
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }

    resetAndroidData() {
        sys.localStorage.removeItem('Coin');
        sys.localStorage.removeItem('Energy');
        sys.localStorage.removeItem('Chest');
        sys.localStorage.removeItem('Keys');
        sys.localStorage.removeItem('SpinWheelLevel');
        sys.localStorage.removeItem('TutorialIndex');
        sys.localStorage.removeItem('LogoutTime');
    }

    public showInterstitial() {
        if (this.preloadedInterstitial != null) {
            GameManager.Instance.audioManager.stopBG();
            this.preloadedInterstitial.showAsync()
                .then(() => {
                    // Perform post-ad success operation
                    console.log('Interstitial ad finished successfully');
                    GameManager.Instance.spiWithoutAd = 0;
                    this.loadInterstetialAd();
                    GameManager.Instance.audioManager.playBG();
                })
                .catch((e: { message: any; }) => {
                    console.error(e.message);
                    GameManager.Instance.spiWithoutAd = 0;
                    this.loadInterstetialAd();
                    GameManager.Instance.audioManager.playBG();
                });
        }
        else {
            GameManager.Instance.spiWithoutAd = 0;
            console.log("Ad Not inisiatised")
        }
    }
    public savePlayerDailyGiftStateData() {
        if (this.FB != undefined) {
            this.FB.player
                .setDataAsync({
                    giftBoxState: GameManager.Instance.dailyRewards.giftBoxState,
                    clickIndex: GameManager.Instance.dailyRewards.clickedIndex,
                })
                .then(function () {

                    console.log('data is set');
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }

    public savePlayerDailyGiftCollectTimeData(time: any) {
        if (this.FB != undefined) {
            this.FB.player
                .setDataAsync({
                    dailyGiftCollectTime: time,
                })
                .then(function () {
                    console.log(time);
                    console.log('data is set');
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }
    public savePlayerMusicSFXStateData() {
        if (this.FB != undefined) {
            this.FB.player
                .setDataAsync({
                    musicState: GameManager.Instance.audioManager.musicState,
                    sfxState: GameManager.Instance.audioManager.sfxState,
                })
                .then(function () {
                    console.log('data is set');
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }
    getPlayerDataAfterReset() {
        if (this.FB != undefined) {
            this.FB.player
                .getDataAsync(['currentCoins', 'currentEnergy', 'currentChest', 'currentKey', 'currentSpinwheelLevel', 'giftBoxState', 'dailyGiftCollectTime', 'clickIndex', 'musicState', 'sfxState', 'tutorialIndex', 'logoutTime'])
                .then(function (data: { [x: string]: any; }) {
                    if (data['currentCoins'] != undefined && data['currentEnergy'] != undefined && data['currentSpinwheelLevel'] != undefined && data['currentChest'] != undefined && data['currentKey'] != undefined && data['tutorialIndex'] != undefined) {
                        console.log('data is loaded', data['currentCoins'], data['currentEnergy'], data['currentSpinwheelLevel'], data['currentChest'], data['currentKey'], "DailyReward Collected Time", data['dailyGiftCollectTime'], data['giftBoxState'], data['clickIndex'], data['sfxState'], data['musicState'], data['tutorialIndex']);
                    }
                });
        }
        else {
            console.log("UNDEFINED");
        }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
