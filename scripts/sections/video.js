class Video extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
        this.addEventListener('click', function(){
            let video = this.dataset.src
            let videoBlock = document.createElement('div')
            videoBlock.classList.add('video-wrapper')
            let html = 
            `<div class="relative">
                <video src="${video}" autoplay></video>
                <span class="absolute close-video flex justify-center items-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 12" stroke="white" stroke-width="2" stroke-linecap="square"/>
                    <path d="M2 2L12 12" stroke="white" stroke-width="2" stroke-linecap="square"/>
                    </svg>
                </span>
            </div>`

            if(this.dataset.youtube) {
                html = 
                `<div class="relative">
                    <iframe src="https://www.youtube.com/embed/${video}?controls=1&showinfo=0&rel=0&loop=1&mute=0&modestbranding=0&playlist=${video}" frameborder="0" allowfullscreen class="youtube-video h-full w-full lg:w-[800px] aspect-video"></iframe>
                    <span class="absolute close-video flex justify-center items-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 12" stroke="white" stroke-width="2" stroke-linecap="square"/>
                        <path d="M2 2L12 12" stroke="white" stroke-width="2" stroke-linecap="square"/>
                        </svg>
                    </span>
                </div>`
            } 

            videoBlock.innerHTML = html
            document.querySelector('body').appendChild(videoBlock)

            // remove video
            document.addEventListener('click', function(e) {
                if(e.target.classList.contains('close-video') || e.target.classList.contains('video-wrapper')) {
                    videoBlock.remove()
                }
            })
        })
    }
}

if (!customElements.get('video-block')) customElements.define('video-block', Video);
