import { mountCounter } from 'dynamic-countdown'
import { counter } from 'dynamic-countdown'

class CountdownBar extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const myCountdown = mountCounter(
      this.getAttribute('data-date'),
      'DHMS',
      '2',
      'en',
      'primary-light-inverted'
    )

    this.appendChild(myCountdown)
    counter()
  }
}
if (!customElements.get('countdown-bar')) customElements.define('countdown-bar', CountdownBar)
