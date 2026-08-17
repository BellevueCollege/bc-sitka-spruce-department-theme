/**
 * @file
 * AccordionUntilFound class.
 */
import * as bootstrap from 'bootstrap';
import ComponentBase from '../core/component-base';
import WindowState from '../core/window-state';

const RESPONSIVE_BLOCK_SELECTOR =
	'.d-sm-block, .d-md-block, .d-lg-block, .d-xl-block, .d-xxl-block';

/**
 * Enables find-in-page search inside collapsed Bootstrap accordion panels
 * via hidden=until-found and the beforematch event.
 */
export default class AccordionUntilFound extends ComponentBase {
	/**
	 * Set the object's initial state.
	 *
	 * @constructor
	 */
	constructor() {
		super('accordion-until-found');
	}

	/**
	 * @inheritdoc
	 */
	init() {
		if (!('onbeforematch' in document.body)) {
			return this;
		}

		this.items.forEach((panel) => this.bindPanel(panel));

		WindowState.on('resize', () => this.syncAllPanels());

		return this;
	}

	/**
	 * Bind beforematch and collapse events for a single accordion panel.
	 *
	 * @param {HTMLElement} panel
	 *   The accordion collapse element.
	 */
	bindPanel(panel) {
		const collapse = bootstrap.Collapse.getOrCreateInstance(panel, {
			toggle: false,
		});

		panel.addEventListener('beforematch', () => {
			// beforematch only fires while hidden; show() avoids toggling an open panel
			collapse.show();
		});

		panel.addEventListener('show.bs.collapse', () => this.syncHiddenState(panel));
		panel.addEventListener('hidden.bs.collapse', () => this.syncHiddenState(panel));

		this.syncHiddenState(panel);
	}

	/**
	 * Whether the panel is visually collapsed (not shown to the user).
	 *
	 * @param {HTMLElement} panel
	 *   The accordion collapse element.
	 * @return {boolean}
	 *   True when the panel is collapsed.
	 */
	isPanelCollapsed(panel) {
		if (panel.classList.contains('show')) {
			return false;
		}

		// Avoid until-found height:0 while Bootstrap is still animating the close
		if (panel.classList.contains('collapsing')) {
			return false;
		}

		// until-found CSS sets display:block; getComputedStyle would falsely read "open"
		if (panel.getAttribute('hidden') === 'until-found') {
			return true;
		}

		if (panel.matches(RESPONSIVE_BLOCK_SELECTOR)) {
			return window.getComputedStyle(panel).display === 'none';
		}

		return true;
	}

	/**
	 * Apply or remove hidden=until-found based on collapsed state.
	 *
	 * @param {HTMLElement} panel
	 *   The accordion collapse element.
	 */
	syncHiddenState(panel) {
		const shouldHideUntilFound = this.isPanelCollapsed(panel);
		const hasUntilFoundHidden = panel.getAttribute('hidden') === 'until-found';

		if (shouldHideUntilFound && !hasUntilFoundHidden) {
			panel.hidden = 'until-found';
		} else if (!shouldHideUntilFound && panel.hasAttribute('hidden')) {
			panel.removeAttribute('hidden');
		}
	}

	/**
	 * Re-sync hidden state for every bound panel (e.g. on viewport resize).
	 */
	syncAllPanels() {
		this.items.forEach((panel) => this.syncHiddenState(panel));
	}
}
