PIXI.utils.skipHello();

Vue.component("start_part", {
    props: ['ready_yt'],
    data() {
        return {
            yt_address: ""
        }
    },
    methods: {
        leaveStartPage(tag) {
            this.$emit("leave-start-page", tag)
        },
    },
    watch: {
        yt_address() {
            if (this.yt_address.length > 10 && this.ready_yt) {
                this.$emit("emit-address", this.yt_address)
            }
        }
    },
    template: `
    <div class="start_part">
        <div class="sound_bigimg">
            <img class="w-100" src="./images/big_sound.png">
        </div>
        <div class="intro_text">
            <h2>TOMATO CLOCK</h2>
            <p>選擇你期望的工作狀態，播放對應的音樂</p>
        </div>
        <div class="button_section">
            <button class="main_btn" @click="leaveStartPage('happy')">青春洋溢</button>
            <button class="main_btn" @click="leaveStartPage('peace')">平靜思緒</button>
            <button class="main_btn yt_btn">
                <p>Youtube</p>
                <input placeholder="請輸入網址" type="text" v-model.trim="yt_address" >
                <div class="go" @click="leaveStartPage('yt')">
                    <img class="w-100" src="./images/go.png">
                </div>
            </button>
            <button class="close_music_btn" @click="leaveStartPage('no')">
                <div class="close_music">
                    <img class="w-100" src="./images/close.png">
                </div>
                <p>我不用任何音樂</p>
            </button>
        </div>
    </div>
     `
})


// var tag = document.createElement("script");
// tag.src = "https://www.youtube.com/iframe_api";
// var firstScriptTag = document.getElementsByTagName("script")[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


let vm = new Vue({
    el: "#app",
    data() {
        return {
            start: true,
            playmusic: false,
            playing: false,
            info_type: "",
            music: "happy",
            timer: null,
            total_time: 60 * 25,
            yt_address: "",
            player: null,
            youtube: false,
            ready_yt: false,
            nosound: false,
            // now time
            date: null,
            year: 2021,
            month: 0,
            day: 0,
            now_hour: 0,
            now_min: 0,
            // pixi
            app: null,
            bgX: 0,
            bgSpeed: 2,
            bgBack: null,
            bgMiddle: null,
            bgFront: null,
        }
    },
    computed: {
        music_type() {
            return this.music == "happy" ? "青春洋溢 的音樂" : this.music == "peace" ? "平靜思緒 的音樂" : this.music == "yt" ? "請輸入正確的YouTube網址" : "無使用音樂"
        },
        music_select_text() {
            if (!this.playmusic || this.music == 'no') {
                return "選擇你的工作狀態，播放對應的音樂"
            } else {
                return "音樂播放中，無法修改音樂"
            }
        },
        min() {
            let min = Math.floor(this.total_time / 60)
            if (min >= 10) {
                return min;
            } else if (0 < min) {
                return "0" + min;
            } else {
                return "00"
            }
        },
        sec() {
            let sec = Math.floor(this.total_time % 60)
            if (sec >= 10) {
                return sec;
            } else if (0 < sec) {
                return "0" + sec;
            } else {
                return "00"
            }
        },
        bar_length() {
            return (1500 - this.total_time) / 15
        },
        gogo_text() {
            if (this.total_time == 1500) {
                return "讓我們開始蕃茄鐘工作法吧！"
            }

            if (this.bar_length < 25) {
                return "加油！正要開始努力！"
            } else if (this.bar_length < 50) {
                return "沒有激流就稱不上勇進！"
            } else if (this.bar_length < 75) {
                return "超過50%了！再繼續邁進。"
            } else if (this.bar_length < 100) {
                return "再堅持一下，你就要完成了。"
            } else if (this.bar_length == 100) {
                return "恭喜你，休息5分鐘後再繼續吧！"
            }
        },
        turn_link() {
            let index_1 = this.yt_address.indexOf('v=')
            let index_2 = this.yt_address.indexOf('be/')
            let link_id;
            if( index_1 !== -1){
                link_id = this.yt_address.slice(index_1 + 2)
            }else if( index_2 !== -1 ){
                link_id = this.yt_address.slice(index_2 + 3)
            }else{
                link_id = "FWU_OD6TCrM&t=5185s"
            }

            return link_id
        },
        text_now_hour() {
            if (this.now_hour <= 12) {
                return this.now_hour < 10 ? `AM  0${this.now_hour}` : `AM  ${this.now_hour}`;
            } else {
                return (this.now_hour - 12) < 10 ? `PM  0${this.now_hour -12}` : `PM  ${this.now_hour -12}`;
            }
        },
        text_now_min() {
            return this.now_min < 10 ? `0${this.now_min}` : this.now_min;
        }
    },
    watch: {
        total_time() {
            if (this.total_time <= 0) {
                clearInterval(this.timer);
                this.playmusic = false;
                this.playing = false;
                this.musicPause();
                this.$refs.timeup.play();
                if (this.music !== "yt") this.$refs.music.currentTime = 0;
            }
        },
        yt_address() {
            if (this.yt_address.length < 10) {
                this.youtube = false;
            } else if (this.music == "yt" && this.ready_yt) {
                this.youtube = true;
                this.player.loadVideoById(this.turn_link);
                this.stopYT();
            }
        }
    },
    methods: {
        //Other
        getNowTime() {
            this.date = new Date();
            this.now_hour = this.date.getHours();
            this.now_min = this.date.getMinutes();
            setTimeout(() => {
                this.getNowTime()
            }, 1000)
        },
        leaveStartPage(tag) {
            this.music = tag;
            this.start = false;
        },
        emitAddress(addres) {
            this.music = "yt"
            this.yt_address = addres;
        },
        // Time
        toggleTime() {
            clearInterval(this.timer);
            if (this.total_time <= 0) {
                this.total_time = 60 * 25;
                this.playmusic = true;
                this.countTimeStart();
                this.musicPlay();
            } else {
                this.playmusic = !this.playmusic;
                if (this.playing && !this.playmusic) {
                    // 暫停
                    this.backRender("pause");
                    this.musicPause();
                } else if (this.playing && this.playmusic) {
                    // 暫停過再播放
                    this.backRender("play");
                    this.musicPlay();
                    this.countTimeStart();
                } else {
                    // 第一次播放
                    this.backRender("play");
                    this.musicPlay();
                    this.countTimeStart();
                    this.playing = true;
                }
            }
        },
        countTimeStart() {
            this.timer = setInterval(() => {
                this.total_time -= 1;
            }, 1000)
            return
        },
        resetTime() {
            clearInterval(this.timer);
            this.total_time = 60 * 25;
            this.playmusic = false;
            this.playing = false;
            this.musicPause();
            this.backRender("pause")
            if (this.music !== "yt") {
                this.$refs.music.currentTime = 0;
            } else {
                this.resetYT();
            }
        },
        backRender(state) {
            if(state == "play"){
                this.music == "happy" ? this.bgSpeed = 5 : this.music == "peace" ? this.bgSpeed = 1 : this.bgSpeed = 3;
            }else if(state == "pause"){
                this.bgSpeed = 0;
            }
            this.textureRender();
        },
        // Modal
        modalContral(tag) {
            if (this.info_type == tag) {
                this.info_type = "";
            } else {
                this.info_type = tag;
            }
        },
        modalClose() {
            this.info_type = "";
        },
        // Music
        musicPlay() {
            if (this.music !== "yt" && this.music !== "no") {
                this.$refs.music.play();
            } else if (this.music !== "no") {
                this.playYT();
            }
        },
        musicPause() {
            if (this.music !== "yt" && this.music !== "no") {
                this.$refs.music.pause();
            } else if (this.music !== "no") {
                this.stopYT();
            }
        },
        changeMusic(tag) {
            if (this.music == 'yt') this.youtube = false;
            if(tag == 'no'){
                this.stopYT();
                this.musicPause();
            }
            this.music = tag;
        },
        cangeToYT() {
            this.music = "yt";
            if (this.turn_link.length !== 0) this.youtube = true;
        },
        initYoutube() {
            let v_this = this;
            this.player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                // videoId: "X4vkAjsETTM",
                playerVars: {
                    'playsinline': 1
                },
                events: {
                    'onReady': v_this.onPlayerReady,
                }
            });
        },
        onPlayerReady() {
            this.ready_yt = true;
        },
        playYT() {
            this.player.playVideo();
        },
        stopYT() {
            this.player.pauseVideo();
        },
        resetYT() {
            this.player.seekTo(0)
        },
        noSound() {
            this.nosound = !this.nosound;
            if (this.music !== "yt") {
                this.nosound ? this.$refs.music.muted = true : this.$refs.music.muted = false;
            } else {
                this.nosound ? this.player.mute() : this.player.unMute();
            }
        },
        // PIXI Methods
        initLevel(size) {
            this.app.ticker.remove(this.gameLoop)
            this.app.stage.removeChildren()
            if (size == "big") {
                this.bgBack = this.createBg(this.app.loader.resources["bgBack"].texture, [2500, 186, 80]);
                this.bgMiddle = this.createBg(this.app.loader.resources["bgMiddle"].texture, [2500, 186, 80]);
                this.bgFront = this.createBg(this.app.loader.resources["bgFront"].texture, [2500, 186, 80]);
            } else {
                this.bgBack = this.createBg(this.app.loader.resources["sm_bgBack"].texture, [1800, 186, 25]);
                this.bgMiddle = this.createBg(this.app.loader.resources["sm_bgMiddle"].texture, [1800, 134, 25]);
                this.bgFront = this.createBg(this.app.loader.resources["sm_bgFront"].texture, [1800, 134, 25]);
            }

            this.app.ticker.add(this.gameLoop);
        },
        gameLoop() {
            this.updateBg();
        },
        createBg(texture, tex) {
            // [_w , _h , _b]
            let tilling = new PIXI.TilingSprite(texture, tex[0], tex[1]);
            tilling.position.set(0, tex[2])
            this.app.stage.addChild(tilling);
            return tilling;
        },
        updateBg() {
            this.bgX = (this.bgX + this.bgSpeed);
            this.bgFront.tilePosition.x = this.bgX;
            this.bgMiddle.tilePosition.x = this.bgX / 2;
            this.bgBack.tilePosition.x = this.bgX / 4;
        },
        textureRender() {
            let mql = window.matchMedia('(max-width: 576px)').matches;
            if (mql) {
                this.initLevel('small')
            } else {
                this.initLevel('big')
            }
        },
        tomatoCursor(e) {
            let pos = e.data.global;
            this.tomato.x = pos.x;
            this.tomato.y = pos.y;
        }
    },
    mounted() {
        onYouTubeIframeAPIReady = () => {
            this.initYoutube();
        };

        // 得到年月日
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth() + 1;
        this.day = this.date.getDate();
        this.getNowTime();

        // PIXI設置
        this.app = new PIXI.Application({
            width: 1200,
            height: 89,
            resizeTo: window,
            transparent: true
        })
        this.$refs.gameDiv.appendChild(this.app.view)

        this.app.loader.baseUrl = "images";
        this.app.loader
            .add("bgBack", "t_bg_back.png")
            .add("bgMiddle", "t_bg_middle.png")
            .add("bgFront", "t_bg_front.png")
            .add("sm_bgBack", "sm_bg_back.png")
            .add("sm_bgMiddle", "sm_bg_middle.png")
            .add("sm_bgFront", "sm_bg_front.png")



        this.app.loader.onComplete.add(this.textureRender);
        this.app.loader.load();


        let mql = window.matchMedia('(max-width: 600px)');
        mql.addEventListener('change', this.textureRender);

    },
    destroyed() {
        this.app.destroy(true)
    },
})

console.log("🍅🍅🍅🍅🍅🍅 \n \n%cTOMATO MUSIC CLOCK \n%cMaybe I will improve this small project someday  \n \n🍅🍅🍅🍅🍅🍅","color:#F95C3D;font-weight: bold;","color: auto;font-weight: normal;");

