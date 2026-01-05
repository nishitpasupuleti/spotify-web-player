// Fetches the folder "F<i>" inside the songs directory
// Returns the HTML text so we can later pick out the .mp3 links from it
async function getResponse(i) {
    let response = await fetch(`songs/F${i}/`);
    return response.text();
}

// Takes a song file URL and extracts a clean song name from it
function getSongName(url) {
    let decoded = decodeURIComponent(url);
    let fileName = decoded.split("/").pop();
    fileName = fileName.replace(/\.[^/.]+$/, "");
    let songName = fileName.split(" - ")[0];
    return songName.trim();
}

// Converts a time value in seconds into "MM:SS" format
function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

    seconds = Math.floor(seconds);
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    return mins.toString().padStart(2, "0") + ":" +
        secs.toString().padStart(2, "0");
}

async function main() {
    // File paths for all the SVG icons used in the player
    const resumebutton = "SVGs/resumebtn.svg";
    const pausebutton = "SVGs/pausebtn.svg";
    const note1 = "SVGs/note.svg";
    const note2 = "SVGs/note2.svg";
    const volume = "SVGs/volume.svg";
    const mute = "SVGs/mute.svg";
    const loop1 = "SVGs/loop.svg";
    const loop2 = "SVGs/loop2.svg";

    //Preload all SVG images so they appear instantly when swapped in the UI
    [resumebutton, pausebutton, note1, note2, volume, mute, loop1, loop2].forEach(src => {
        const img = new Image();
        img.src = src;
    });

    //All the buttons which have to be inactive inititally(when no playlist is selected)
    let pauseBtn = document.querySelector(".pausebtn");
    let nextBtn = document.querySelector(".nextbtn");
    let prevBtn = document.querySelector(".prevbtn");
    let seekbar = document.querySelector(".seekbar");
    let loopbtn = document.querySelector(".loop");

    let inactivebtns = [pauseBtn, prevBtn, nextBtn, seekbar, loopbtn];

    //Making the buttons inactive(removing pointer events)
    inactivebtns.forEach(btn => {
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.4";
    });

    let playlists = [];//Two-dimensional array of urls of each song of each playlist.
    let folders = [];//urls of folders(playlists)
    for (let i = 1; i <= 6; i++) {
        let folder = await getResponse(i);
        folders.push(folder);
    }
    // Convert each folder's HTML into an array of song URLs
    for (folder of folders) {
        let div = document.createElement('div');
        div.innerHTML = folder;
        let playlist = [];
        let anchors = div.getElementsByTagName('a');
        for (anchor of anchors) {
            if (anchor.getAttribute('href').endsWith('mp3')) {
                song = anchor.getAttribute('href');
                fixedsong = song.replace(/%5C/gi, "/").replace(/\/+/g, "/");

                playlist.push(fixedsong);
            }
        }
        playlists.push(playlist);
    }

    let songs = [];//Two Dimensional array of audio elements of each song of each playlist.

    for (let i = 0; i < playlists.length; i++) {
        songs.push([]);
        for (let j = 0; j < playlists[i].length; j++) {

            songs[i].push(new Audio(playlists[i][j]));
        }
    }
    let curSong = songs[0][0];// audio element of the current song.
    curSong.pause();
    let curPi = -1; // current playlist index
    let curSi = 0; // current song index

    let boxes = document.getElementsByClassName('box');
    let curplaylist = []; // stores the songs of current playlist(div).

    // Builds the sidebar song list(Your Library Section) for the selected playlist "i"
    function loadLibraryUI(i) {
        let list = document.querySelector(".list");
        list.innerHTML = "Your Library<br><br>";
        curplaylist.length = 0; // clearing the song array

        for (let j = 0; j < playlists[i].length; j++) {
            let song = document.createElement('div');
            song.innerHTML = getSongName(playlists[i][j]);
            song.setAttribute("class", "song");
            song.insertAdjacentHTML("afterbegin", "<img class='musicnote' src='SVGs/note.svg'>");
            song.insertAdjacentHTML("beforeend", "<div class='playnow'>Play Now</div>");


            song.addEventListener("click", () => {
                curSong.pause();
                curSong = songs[i][j];
                curPi = i;
                curSi = j;
                curSong.load();
                curSong.play();

            });

            curplaylist.push(song);
            list.append(song);
            curSong.pause();
            curSong = songs[i][j];
            curPi = i;
            curSi = 0;

        }
    }

    let prevbox = boxes[0];
    let prevplayBtn = boxes[0].querySelector(".playbtn");

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].addEventListener("click", () => {
            loadLibraryUI(i);
            // Highlights the clicked playlist card and restores the previous one
            prevbox.style.cssText = "";
            prevplayBtn.style.cssText = "";
            prevplayBtn.firstElementChild.src = resumebutton;
            boxes[i].style.cssText = "transform: scale(1.03);  background-color: #1DB954; color: black";
            playBtn.style.cssText = "transform: translateY(-30px); opacity: 1;";
            prevbox = boxes[i];
            prevplayBtn = boxes[i].querySelector(".playbtn");

            //Activating the inactive buttons(as a playlist is selected)
            inactivebtns.forEach(btn => {
                btn.style.pointerEvents = "auto";
                btn.style.opacity = "1";
            });

        });


        let playBtn = boxes[i].querySelector(".playbtn");
        console.log(playBtn)
        if (playBtn) {
            playBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                // Highlights the clicked playlist card and restores the previous one
                prevbox.style.cssText = "";
                prevplayBtn.style.cssText = "";
                prevplayBtn.firstElementChild.src = resumebutton;
                boxes[i].style.cssText = "transform: scale(1.03);  background-color: #1DB954; color: black";
                playBtn.style.cssText = "transform: translateY(-30px); opacity: 1;";
                prevbox = boxes[i];
                prevplayBtn = boxes[i].querySelector(".playbtn");

                //Activating the inactive buttons(as a playlist is selected)
                inactivebtns.forEach(btn => {
                    btn.style.pointerEvents = "auto";
                    btn.style.opacity = "1";
                });

                //If the user clicks play on the playlist that's already active:
                //Just toggle play/pause on the current song.
                if (curPi === i) {

                    if (curSong.paused) {
                        curSong.play();

                    } else {
                        curSong.pause();

                    }
                }
                //If the user clicks play on a different playlist:
                //Load that playlist, stop the old song,
                //switch to the first song of the new one, and start playing it.
                else {
                    loadLibraryUI(i);
                    curSong.pause();
                    curSong.currentTime = 0;
                    curSong = songs[i][0];
                    curPi = i;
                    curSi = 0;
                    curSong.load();
                    curSong.play();
                    playBtn.firstElementChild.src = pausebutton;
                }
            });
        }
    }

    let isPlaying = false;

    //Adding events to audio elements
    for (let i = 0; i < songs.length; i++) {
        for (let j = 0; j < songs[i].length; j++) {

            //Playing the next song once the current song has ended(curSong=nextsong)
            songs[i][j].addEventListener("ended", () => {
                if (j == songs[i].length - 1) {
                    curSong = songs[i][0];
                    curPi = i;
                    curSi = 0;
                }
                else {
                    curSong = songs[i][j + 1];
                    curPi = i;
                    curSi = j + 1;
                }
                curSong.play();
            })
            let playBtn = boxes[i].querySelector(".playbtn");

            //Chaning the svgs of both buttons when the song is played/paused.
            songs[i][j].addEventListener("play", () => {
                isPlaying = true;
                let pauseBtn = document.querySelector(".pausebtn").firstElementChild;
                pauseBtn.src = pausebutton;
                playBtn.firstElementChild.src = pausebutton;
            });
            songs[i][j].addEventListener("pause", () => {
                isPlaying = false;
                let pauseBtn = document.querySelector(".pausebtn").firstElementChild;
                pauseBtn.src = resumebutton;
                playBtn.firstElementChild.src = resumebutton;
            });

            let prev = 0;

            //Events to occur when the song is playing and its currentTime keeps updating.
            songs[i][j].addEventListener("timeupdate", () => {
                //displaying the currentTime and duration as the song is playing.
                document.querySelector(".curtime").innerHTML = formatTime(curSong.currentTime);
                document.querySelector(".duration").innerHTML = formatTime(curSong.duration);
                document.querySelector(".fill").style.width = (curSong.currentTime / curSong.duration) * 100 + "%";
                curSong.controls = true;
                //displaying the currentsong.
                let display = document.querySelector(".cursongdisplay");
                display.innerHTML = getSongName(playlists[curPi][curSi]);
                display.insertAdjacentHTML("afterbegin", "<img height='35px' width='35px' class='musicnote' src='SVGs/note.svg'>");
                //Highlighting the current song in Your Library section and restores the previous one
                curplaylist[prev].style.cssText = "background-color: #121212";
                curplaylist[prev].firstElementChild.src = note1;
                curplaylist[prev].lastElementChild.innerHTML = "Play Now";
                curplaylist[curSi].style.cssText = "background-color: #1DB954; font-weight: 700; border-color: #1DB954; color: black;";
                curplaylist[curSi].firstElementChild.src = note2;
                curplaylist[curSi].lastElementChild.innerHTML = "Playing Now";
                prev = curSi;

            })
        }
    }


    pauseBtn.addEventListener("click", () => {
        if (!curSong) return;
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
            curSong = songs[curPi][curSi];
        }
        else {
            curSi = curSi + 1;
            curSong = songs[curPi][curSi];
        }

        curSong.load();
        curSong.play();
    })

    prevBtn.addEventListener("click", () => {
        if (curSi > 0) {

            curSong.pause();
            curSi = curSi - 1;
            curSong = songs[curPi][curSi];
            curSong.load();
            curSong.play();
        }

    })

    seekbar.addEventListener("click", (e) => {
        curSong.currentTime = ((e.x - seekbar.getBoundingClientRect().x) / seekbar.getBoundingClientRect().width * (curSong.duration));

    });

    seekbar.addEventListener("mouseenter", () => {
        document.querySelector(".fill").style.backgroundColor = "#1DB954";
        document.querySelector(".fill").innerHTML = "<div class='circle' style='height: 12px; width: 12px; border-radius: 50%; background-color: white; position: absolute;right: 0;'></div>"
    });

    seekbar.addEventListener("mouseleave", () => {
        document.querySelector(".fill").style.backgroundColor = "white";
        document.querySelector(".fill").innerHTML = "";
        // isDragging=false;
    });


    let isDragging = false
    seekbar.addEventListener("mousedown", () => {
        isDragging = true;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging)
            return;
        curSong.currentTime = ((e.x - seekbar.getBoundingClientRect().x) / seekbar.getBoundingClientRect().width * (curSong.duration));
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    let vseekbar = document.querySelector(".vseekbar");

    vseekbar.addEventListener("click", (e) => {
        curSong.volume = (e.x - vseekbar.getBoundingClientRect().x) / vseekbar.getBoundingClientRect().width;
        console.log(curSong.volume)
        document.querySelector(".vfill").style.width = curSong.volume * 100 + "%";
    });

    let mutebtn = document.querySelector(".mute");

    [vseekbar, mutebtn].forEach(item => {
        item.addEventListener("mouseenter", () => {
            document.querySelector(".vfill").style.backgroundColor = "#1DB954";
            document.querySelector(".vfill").innerHTML = "<div class='circle' style='height: 12px; width: 12px; border-radius: 50%; background-color: white; position: absolute;right: 0;'></div>"
        });

        item.addEventListener("mouseleave", () => {
            document.querySelector(".vfill").style.backgroundColor = "white";
            document.querySelector(".vfill").innerHTML = "";
        });
    });

    let visDragging = false;

    vseekbar.addEventListener("mousedown", () => {
        visDragging = true;
    });

    document.addEventListener("mousemove", (e) => {
        if (!visDragging)
            return;
        curSong.volume = ((e.x - vseekbar.getBoundingClientRect().x) / vseekbar.getBoundingClientRect().width);
        document.querySelector(".vfill").style.width = curSong.volume * 100 + "%";
    });

    document.addEventListener("mouseup", () => {
        visDragging = false;
    });

    mutebtn.addEventListener("click", () => {
        if (!curSong.muted) {
            curSong.muted = true;
            document.querySelector(".vfill").style.width = 0;
            document.querySelector(".mute").src = mute;
        }
        else {
            curSong.muted = false;
            document.querySelector(".vfill").style.width = curSong.volume * 100 + "%";
            document.querySelector(".mute").src = volume;
        }
    });

    loopbtn.addEventListener("click", () => {
        if (!curSong.loop) {
            curSong.loop = true;
            loopbtn.src = loop2;
            [prevBtn, nextBtn].forEach(btn => {
                btn.style.pointerEvents = "none"
            });
        }
        else {
            curSong.loop = false;
            loopbtn.src = loop1;
            [prevBtn, nextBtn].forEach(btn => {
                btn.style.pointerEvents = "auto"
            });
        }
    })

}
window.addEventListener("DOMContentLoaded", main);
