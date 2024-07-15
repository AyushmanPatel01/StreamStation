let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    // Remove any fractional part and convert to integer seconds
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    // Format the seconds to ensure two digits
    var formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    // Combine minutes and formatted seconds with a colon
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + formattedSeconds;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img width="48" height="48" src="https://misc.scdn.co/liked-songs/liked-songs-64.png"
            alt="musical-notes">
        <div class="songinfo">
            <div> ${song.replaceAll("%20", " ")} </div>
            <div></div>
        </div>
        <img width="30" height="30" src="playnow.svg" alt=""></li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector('.songlist').getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let CardContainer = document.querySelector(".CardContainer")
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            // console.log(e.href);
            let folder = e.href.split("/").slice(-1)[0];
            // console.log(folder);
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            CardContainer.innerHTML = CardContainer.innerHTML + `<div data-folder="${folder}" class="Card">
                            <div class="play">
                                <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="50" fill="#1ed760" />
                                    <polygon points="40,30 70,50 40,70" fill="black" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="Pritam">
                            <h2 class="sizeWeightCol-2-h" style="color: white;">${response.title}</h2>
                            <p class="sizeWeightCol-2-p">${response.description}</p>
                        </div>`
        }

        //Load the playlist whenever clicked
        Array.from(document.getElementsByClassName("Card")).forEach(e => {
            // console.log(e)
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    })
}

async function main() {

    //get all the songs
    await getSongs("songs/Adrenaline")
    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums()

    //Attach an event listner to play, next and previous
    play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "SongPlaybtn.png"
        }
    })

    //Listen for timeupdate
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listner to previous and next
    // let previous = document.querySelector("#previous")
    previous.addEventListener("click", () => {
        console.log('previous clicked');

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // let next = document.querySelector("#next")
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log('next clicked');


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    //Add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
        // console.log(e);  
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add event listner to mute the track
    document.querySelector(".volome> img").addEventListener("click", e=>{
        // console.log(e.target);
        // console.log("changing" + e.target.src);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0.0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()