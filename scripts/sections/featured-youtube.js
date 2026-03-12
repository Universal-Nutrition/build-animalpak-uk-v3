import YouTubePlayer from "youtube-player";

class YoutubeEmbed extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let player = YouTubePlayer(this.querySelector("#youtube-player"));

    player.loadVideoById(
      this.querySelector("#youtube-player").getAttribute("youtube-id")
    );
    player.stopVideo().then(() => { });

    if (this.querySelector(".play-button")) {
      this.querySelector(".play-button").addEventListener("click", () => {
        if (this.querySelector(".youtube-modal")) {
          this.querySelector(".youtube-modal").classList.remove("hidden");
        } else {
          this.querySelector(".youtube-cover").classList.add("hidden");
          this.querySelector(".youtube-container").classList.remove("hidden");
          this.querySelector(".play-button").classList.add("hidden");
        }
        player.playVideo();
      });
    }

    if (this.querySelector(".youtube-modal")) {
      this.querySelector(".youtube-modal").addEventListener("click", (e) => {
        if (!e.target.classList.contains("video-container")) {
          if (this.querySelector(".youtube-modal")) {
            this.querySelector(".youtube-modal").classList.add("hidden");
          }
          player.stopVideo().then(() => { });
        }
      });
    }
  }
}
customElements.define("youtube-embed", YoutubeEmbed);
