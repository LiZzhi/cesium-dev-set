import videojs from "video.js";

export default function creatVideo(url: string, className?: string) {
    const videoBox = document.createElement("div");
    videoBox.classList.add("video-box");
    className && videoBox.classList.add(className);

    const videoElement = document.createElement("video");
    videoElement.classList.add("video-js");
    videoElement.classList.add("video-content");
    videoElement.setAttribute("video-content", "{}");
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
    return { videoBox, videoElement, player }
}
