function getSongName(url) {
    let decoded = decodeURIComponent(url);
    let fileName = decoded.split("/").pop();
    fileName = fileName.replace(/\.[^/.]+$/, "");
    let songName = fileName.split(" - ")[0];
    return songName.trim();
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    seconds = Math.floor(seconds);
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");
}

async function main() {
    const resumebutton = "SVGs/resumebtn.svg";
    const pausebutton = "SVGs/pausebtn.svg";
    const note1 = "SVGs/note.svg";
    const note2 = "SVGs/note2.svg";
    const volume = "SVGs/volume.svg";
    const mute = "SVGs/mute.svg";
    const loop1 = "SVGs/loop.svg";
    const loop2 = "SVGs/loop2.svg";

    [resumebutton, pausebutton, note1, note2, volume, mute, loop1, loop2].forEach(src => {
        const img = new Image();
        img.src = src;
    });

    let pauseBtn = document.querySelector(".pausebtn");
    let nextBtn = document.querySelector(".nextbtn");
    let prevBtn = document.querySelector(".prevbtn");
    let seekbar = document.querySelector(".seekbar");
    let loopbtn = document.querySelector(".loop");

    let inactivebtns = [pauseBtn, prevBtn, nextBtn, seekbar, loopbtn];

    inactivebtns.forEach(btn => {
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.4";
    });

    // Fetching the JSON manifest
    let response = await fetch('songs.json');
    let data = await response.json();
    let playlists = data.playlists; 

    let songs = [];
    for (let i = 0; i < playlists.length; i++) {
        songs.push([]);
        for (let j = 0; j < playlists[i].length; j++) {
            songs[i].push(new Audio(playlists[i][j]));
        }
    }

    let curSong = songs[0][0];
    let curPi = -1; 
    let curSi = 0; 

    let boxes = document.getElementsByClassName('box');
    let curplaylist = []; 

    function loadLibraryUI(i) {
        let list = document.querySelector(".list");
        list.innerHTML = "Your Library<br><br>";
        curplaylist.length = 0; 

        for (let j = 0; j < playlists[i].length; j++) {
            let songDiv = document.createElement('div');
            let songTitle = getSongName(playlists[i][j]); 
            
            songDiv.innerHTML = songTitle;
            songDiv.setAttribute("class", "song");
            songDiv.insertAdjacentHTML("afterbegin", `<img class='musicnote' src='${note1}'>`);
            songDiv.insertAdjacentHTML("beforeend", "<div class='playnow'>Play Now</div>");

            songDiv.addEventListener("click", () => {
                curSong.pause();
                curSong = songs[i][j];
                curPi = i;
                curSi = j;
                curSong.load();
                curSong.play();
            });

            curplaylist.push(songDiv);
            list.append(songDiv);
        }
    }

    let prevbox = boxes[0];
    let prevplayBtn = boxes[0].querySelector(".playbtn");

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].addEventListener("click", () => {
            loadLibraryUI(i);
            prevbox.style.cssText = "";
            prevplayBtn.style.cssText = "";
            prevplayBtn.firstElementChild.src = resumebutton;
            
            boxes[i].style.cssText = "transform: scale(1.03);  background-color: #1DB954; color: black";
            let playBtn = boxes[i].querySelector(".playbtn");
            playBtn.style.cssText = "transform: translateY(-30px); opacity: 1;";
            
            prevbox = boxes[i];
            prevplayBtn = playBtn;

            inactivebtns.forEach(btn => {
                btn.style.pointerEvents = "auto";
                btn.style.opacity = "1";
            });
            
            if (curPi !== i) {
                curSong.pause();
                curPi = i;
                curSi = 0;
                curSong = songs[i][0];
            }
        });

        let playBtn = boxes[i].querySelector(".playbtn");
        if (playBtn) {
            playBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                prevbox.style.cssText = "";
                prevplayBtn.style.cssText = "";
                prevplayBtn.firstElementChild.src = resumebutton;
                
                boxes[i].style.cssText = "transform: scale(1.03);  background-color: #1DB954; color: black";
                playBtn.style.cssText = "transform: translateY(-30px); opacity: 1;";
                
                prevbox = boxes[i];
                prevplayBtn = playBtn;

                inactivebtns.forEach(btn => {
                    btn.style.pointerEvents = "auto";
                    btn.style.opacity = "1";
                });

                if (curPi === i) {
                    if (curSong.paused) {
                        curSong.play();
                    } else {
                        curSong.pause();
                    }
                } else {
                    loadLibraryUI(i);
                    curSong.pause();
                    curSong.currentTime = 0;
                    curPi = i;
                    curSi = 0;
                    curSong = songs[i][0];
                    curSong.load();
                    curSong.play();
                }
            });
        }
    }

    let isPlaying = false;

    for (let i = 0; i < songs.length; i++) {
        for (let j = 0; j < songs[i].length; j++) {
            songs[i][j].addEventListener("ended", () => {
                if (j == songs[i].length - 1) {
                    curSi = 0;
                } else {
                    curSi = j + 1;
                }
                curSong = songs[i][curSi];
                curSong.play();
            });

            let playBtn = boxes[i].querySelector(".playbtn");

            songs[i][j].addEventListener("play", () => {
                isPlaying = true;
                document.querySelector(".pausebtn").firstElementChild.src = pausebutton;
                playBtn.firstElementChild.src = pausebutton;
            });
            
            songs[i][j].addEventListener("pause", () => {
                isPlaying = false;
                document.querySelector(".pausebtn").firstElementChild.src = resumebutton;
                playBtn.firstElementChild.src = resumebutton;
            });

            let prev = 0;

            songs[i][j].addEventListener("timeupdate", () => {
                document.querySelector(".curtime").innerHTML = formatTime(curSong.currentTime);
                document.querySelector(".duration").innerHTML = formatTime(curSong.duration);
                document.querySelector(".fill").style.width = (curSong.currentTime / curSong.duration) * 100 + "%";
                
                let display = document.querySelector(".cursongdisplay");
                display.innerHTML = getSongName(playlists[curPi][curSi]);
                display.insertAdjacentHTML("afterbegin", `<img height='35px' width='35px' class='musicnote' src='${note1}'>`);
                
                if(curplaylist[prev]) {
                    curplaylist[prev].style.cssText = "background-color: #121212";
                    curplaylist[prev].querySelector(".musicnote").src = note1;
                    curplaylist[prev].querySelector(".playnow").innerHTML = "Play Now";
                }
                
                if(curplaylist[curSi]) {
                    curplaylist[curSi].style.cssText = "background-color: #1DB954; font-weight: 700; border-color: #1DB954; color: black;";
                    curplaylist[curSi].querySelector(".musicnote").src = note2;
                    curplaylist[curSi].querySelector(".playnow").innerHTML = "Playing Now";
                    prev = curSi;
                }
            });
        }
    }

    pauseBtn.addEventListener("click", () => {
        if (isPlaying) {
            curSong.pause();
        } else {
            curSong.play();
        }
    });

    nextBtn.addEventListener("click", () => {
        curSong.pause();
        if (curSi == songs[curPi].length - 1) {
            curSi = 0;
        } else {
            curSi++;
        }
        curSong = songs[curPi][curSi];
        curSong.load();
        curSong.play();
    });

    prevBtn.addEventListener("click", () => {
        if (curSi > 0) {
            curSong.pause();
            curSi--;
            curSong = songs[curPi][curSi];
            curSong.load();
            curSong.play();
        }
    });

    seekbar.addEventListener("click", (e) => {
        curSong.currentTime = ((e.x - seekbar.getBoundingClientRect().x) / seekbar.getBoundingClientRect().width * (curSong.duration));
    });

    seekbar.addEventListener("mouseenter", () => {
        document.querySelector(".fill").style.backgroundColor = "#1DB954";
        document.querySelector(".fill").innerHTML = "<div class='circle' style='height: 12px; width: 12px; border-radius: 50%; background-color: white; position: absolute;right: 0;'></div>";
    });

    seekbar.addEventListener("mouseleave", () => {
        document.querySelector(".fill").style.backgroundColor = "white";
        document.querySelector(".fill").innerHTML = "";
    });

    let isDragging = false;
    seekbar.addEventListener("mousedown", () => { isDragging = true; });
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        let rect = seekbar.getBoundingClientRect();
        let pos = (e.x - rect.x) / rect.width;
        if (pos >= 0 && pos <= 1) curSong.currentTime = pos * curSong.duration;
    });
    document.addEventListener("mouseup", () => { isDragging = false; });

    let vseekbar = document.querySelector(".vseekbar");
    vseekbar.addEventListener("click", (e) => {
        let vol = (e.x - vseekbar.getBoundingClientRect().x) / vseekbar.getBoundingClientRect().width;
        curSong.volume = Math.max(0, Math.min(1, vol));
        document.querySelector(".vfill").style.width = curSong.volume * 100 + "%";
    });

    let mutebtn = document.querySelector(".mute");
    mutebtn.addEventListener("click", () => {
        if (!curSong.muted) {
            curSong.muted = true;
            document.querySelector(".vfill").style.width = 0;
            mutebtn.src = mute;
        } else {
            curSong.muted = false;
            document.querySelector(".vfill").style.width = curSong.volume * 100 + "%";
            mutebtn.src = volume;
        }
    });

    loopbtn.addEventListener("click", () => {
        curSong.loop = !curSong.loop;
        loopbtn.src = curSong.loop ? loop2 : loop1;
        prevBtn.style.pointerEvents = nextBtn.style.pointerEvents = curSong.loop ? "none" : "auto";
    });
}

window.addEventListener("DOMContentLoaded", main);
