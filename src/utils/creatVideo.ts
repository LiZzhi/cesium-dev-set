import videojs from "video.js";

export default function creatVideo(url: string) {
    const videoBox = document.createElement("div");
    videoBox.style.position = "relative";
    videoBox.style.width = "100%";
    videoBox.style.height = "100%";

    const videoElement = document.createElement("video");
    videoElement.classList.add("video-js");
    videoElement.style.position = "relative";
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    videoElement.setAttribute("data-setup", "{}");
    videoBox.appendChild(videoElement);
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.preload = "auto";
    videoElement.muted = true;

    const player = videojs(videoElement, {}, ()=>{
        const sources = [{
            src: url,
            type: 'application/x-mpegURL'
        }];
        player.src(sources);
        player.play();
    });
    function destory() {
        player && player.dispose();
        videoBox && videoBox.remove()
    }
    return { videoBox, videoElement, player, destory }
}
