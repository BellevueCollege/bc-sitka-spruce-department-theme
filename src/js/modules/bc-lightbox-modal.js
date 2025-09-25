import { Modal } from 'bootstrap'

class BCLightboxModal {
	static modalId = 'bc-lightbox-modal';

	constructor( modalId = BCLightboxModal.modalId, dataAttribute = '[data-bc-lightbox]' ) {
		this.modalId = modalId;
		this.dataAttribute = dataAttribute;
		this.modalBodyId = `${this.modalId}-body`;
		this.init();
	}

	init() {
		this.lightboxLinks = document.querySelectorAll( this.dataAttribute );
		this.modal = this.createModalHtml( this.lightboxLinks );
		if ( this.modal ) {
			this.transformLinksToLightbox( this.lightboxLinks, this.modal );
		}
	}

	/**
	 * Generate the HTML for the modal and append it to the body.
	 *
	 * @param {NodeList} lightboxLinks - The links that will trigger the lightbox.
	 * @returns {Modal|boolean} - Returns the Bootstrap Modal instance or false if no links.
	 */
	createModalHtml( lightboxLinks ) {
		if ( lightboxLinks.length > 0 ) {

			// Create container and set attributes
			const modalHtml = `
				<div class="modal fade" tabindex="-1" aria-hidden="true" id="${this.modalId}" aria-label="Video Overlay">
					<button type="button" class="btn-close position-absolute top-0 end-0 m-3 zindex-tooltip" data-bs-dismiss="modal" aria-label="Close">
						<span aria-hidden="true" class="fas fa-times fa-lg text-dark"></span>
					</button>
					<div class="modal-dialog modal-lg modal-dialog-centered">
						<div class="modal-content">
							<div class="modal-body p-0" id="${this.modalBodyId}">
								<div class="ratio ratio-16x9"></div>
							</div>
						</div>
					</div>
				</div>
			`;
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = modalHtml;
			const modalContainer = tempDiv.firstElementChild;
			document.body.appendChild(modalContainer);
			const modal =  new Modal(modalContainer, {});
			return modal;
		}
		return false;
	}

	/**
	 * Transform links to open the lightbox modal and handle video embedding.
	 *
	 * @param {NodeList} lightboxLinks - The links that will trigger the lightbox.
	 * @param {Modal} modal - The Bootstrap Modal instance.
	 * @return {void}
	 */
	transformLinksToLightbox( lightboxLinks, modal ) {

		// Attach modal to each link with data-bc-lightbox
		lightboxLinks.forEach( (link) => {

			// Transform Links by Adding Data Attributes
			const href = link.getAttribute('href');
			link.setAttribute('data-bs-toggle', 'modal');
			link.setAttribute('data-bc-lightbox-url', href);
			link.setAttribute('href', `#${this.modalId}`);


			const modalContainer = document.getElementById(this.modalId);
			if ( modalContainer ) {
				modalContainer.addEventListener('show.bs.modal', (event) => {
					const trigger = event.relatedTarget;
					const videoUrl = trigger.getAttribute('data-bc-lightbox-url');
					const modalBody = document.getElementById(this.modalBodyId);
					const ratioWrapper = modalBody.querySelector('.ratio');
					// Clear out existing content
					ratioWrapper.innerHTML = '';

					// Check if href is a YouTube or Vimeo link
					if ( videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ) {
						// Add autoplay to the URL
						BCLightboxModal.getOembedHTML(videoUrl).then( (html) => {
							if ( html ) {
								ratioWrapper.innerHTML = html;
							}
						});
					}
				});

				// Clear out content when modal is closed
				modalContainer.addEventListener('hidden.bs.modal', (event) => {
					const modalBody = document.getElementById('bc-lightbox-modal-body');
					const ratioWrapper = modalBody.querySelector('.ratio');
					// Clear out existing content
					ratioWrapper.innerHTML = '';
				});
			}

		});
	}

	/**
	 * Fetch oEmbed HTML for a given video URL (YouTube or Vimeo).
	 *
	 * @param {string} url - The video URL.
	 * @returns {Promise<string|null>} - Returns the embed HTML or null if not found/error.
	 */
	static async getOembedHTML( url ) {
		try {
			if ( url.includes('youtube.com') || url.includes('youtu.be') ) {

				// Get Video Info from oEmbed API
				const response = await fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json');
				if (!response.ok) throw new Error('Network response was not ok');
				const data = await response.json();

				// Modify embed HTML to include autoplay and nocookie domain
				let embedHtml = data.html.replace('feature=oembed', 'feature=oembed&autoplay=1&enablejsapi=1');
				embedHtml = embedHtml.replace('www.youtube.com', 'www.youtube-nocookie.com');
				return embedHtml || null;
			} else if ( url.includes('vimeo.com') ) {
				const response = await fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(url) +'&autoplay=1' );
				if (!response.ok) throw new Error('Network response was not ok');
				const data = await response.json();
				return data.html || null;
			}
		} catch (error) {
			console.error('Error fetching video info:', error);
		}
		return null;
	}
}

// Export the class for use in other modules
export default BCLightboxModal;
