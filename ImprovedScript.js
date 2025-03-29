let currSong = new Audio()
let songs;
let currFolder;
let playlists;
let currPlaylist
let play = document.getElementById("playButton")
let prev = document.getElementById("prevButton")
let next = document.getElementById("nextButton")
let shuffle = document.getElementById("shuffle")
let cardContainer = document.getElementsByClassName("cardContainer")[0]
let cards = document.getElementsByClassName("card")
let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]

const updateBar = (currSong) => {
    document.querySelector(".songInfo").innerHTML = (currSong.src).split('/').pop().replace('.mp3', '').replaceAll("%20", " ")
    document.querySelector(".songTime").innerHTML
}
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    seconds = Math.round(seconds); // Round off seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
function random(max, exclude) {
    let randomNum;
    do {
        randomNum = Math.floor(Math.random() * (max + 1));
    } while (randomNum === exclude);
    return randomNum;
}
function reset() {
    play.src = "img/play.svg"
    document.querySelector(".circle").style.left = 0
}

async function setPlayList() {
    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let playlist = []
    let result
    for (let i = 1, j = 0; i < as.length; i++, j++) {
        playlist[j] = as[i].innerText.replace("/", "")
        //set Playlist in cardContainer
        let a = await fetch(`http://127.0.0.1:3000/songs/${playlist[j]}/info.json`)
        result = await a.json();
        let card = ` <div data-folder="${playlist[j]}" class="card rounded">
                        <div class="img">
                            <img src="songs/${playlist[j]}/cover.jpeg" alt="">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle -->
                                <circle cx="50" cy="50" r="40" fill="green" />

                                <!-- Play Sign (Black Triangle) -->
                                <polygon points="40,30 40,70 70,50" fill="black" />
                            </svg>

                        </div>
                        <h2>${result.title}</h2>
                        <p>${result.description}</p>
                    </div>`
        cardContainer.innerHTML = cardContainer.innerHTML + card
    }
    Array.from(cards).forEach(e => {
        e.addEventListener("click", async () => {
            reset()
            console.log(e.dataset.folder + " is lit")
            songs = await setSongs(e.dataset.folder)
            playMusic(songs[0])
        })
    })

}

async function setSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    songUL.innerHTML = ""
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (!element.href.includes(".mp3")) continue;
        let name = element.innerText.split(".mp3")[0];
        let songCard = `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="songDetail">
                                <div>${name}</div>
                                <div>artist name</div>
                            </div>
                            <div class="playNow">
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`
        songUL.innerHTML = songUL.innerHTML + songCard
        songs.push(name)
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        let track = e.querySelector(".songDetail").firstElementChild.innerHTML
        e.addEventListener("click", () => {
            playMusic(track, false)
            play.src = "img/pause.svg"
        })
    })
    return songs
}

const playMusic = (track, pause = true) => {
    // let  audio=new Audio("songs/"+track+".mp3")
    currSong.src = `songs/${currFolder}/` + track + ".mp3"
    if (!pause) {
        currSong.play()
    }
    updateBar(currSong)
}

async function main() {
    await setPlayList()
    await setSongs("Love")
    playMusic(songs[0])
    let isLoop=false
    let isShuffled=false

    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currSong.pause()
            play.src = "img/play.svg"
        }
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    document.querySelector(".vol").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".vol").getElementsByTagName("img")[0].addEventListener("click", () => {
        if (currSong.muted) {
            currSong.muted = false
            document.querySelector(".vol").getElementsByTagName("img")[0].src = "img/volume.svg"
        }
        else {
            currSong.muted = true
            document.querySelector(".vol").getElementsByTagName("img")[0].src = "img/mute.svg"
        }
    })

    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currSong.currentTime)}/ ${formatTime(currSong.duration)}`
        document.querySelector(".circle").style.left = ((currSong.currentTime / currSong.duration) * 100) + "%"
        if (currSong.currentTime == currSong.duration) {
            let isLast=false
            let index = songs.indexOf(currSong.src.split("/").slice(-1)[0].replace(".mp3", "").replace("%20", " "))
            if (isLoop == 1) {
                index = (index == songs.length-1 ) ? 0 : index + 1
            }
            if (isLoop == 2) {
                index = index
            }
            if (isShuffled &&  !(isLoop == 2) ) {
                index = random(songs.length, index)
            }
            if (!(isShuffled) && (isLoop == 0)) {
                index += 1
                if(index==songs.length){
                    index=0
                    reset()
                    isLast=true
                }
            }
            console.log(index)
            console.log(songs[index])
            playMusic(songs[index], isLast)
        }
    })

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0].replace(".mp3", "").replace("%20", " "))
        if (isShuffled &&  !(isLoop == 2) ) {
            index = random(songs.length, index)
        }
        else{
            index = (index == 0) ? (songs.length - 1) : (index - 1)
        }
        playMusic(songs[index], currSong.paused)
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0].replace(".mp3", "").replace("%20", " "))
        if (isShuffled &&  !(isLoop == 2) ) {
            index = random(songs.length, index)
        }
        else{
            index = (index == songs.length - 1) ? 0 : (index + 1)
        }
        playMusic((songs[index]), currSong.paused)
    })

    document.querySelector(".seekBar").addEventListener("click", e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = precent + "%"
        currSong.currentTime = ((currSong.duration) * precent) / 100
    })

    shuffle.addEventListener("click", () => {
        isShuffled = !(isShuffled)
        if (isShuffled)
            shuffle.src = "img/greenShuffle.svg"
        else
            shuffle.src = "img/shuffle.svg"
    })

    loop.addEventListener("click", () => {
        isLoop = (isLoop == 0) ? 1 : ((isLoop == 1) ? 2 : 0)
        if (isLoop > 0) {
            loop.src = "img/greenLoop.svg"
            if (isLoop == 2) {
                loop.src = "img/loop-1.svg"
            }
        }
        else {
            loop.src = "img/loop.svg"
        }
    })
}

main()