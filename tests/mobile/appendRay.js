import awaitUntilTrue from '@/js/awaitUntilTrue.js'

let listener = null

async function activated(jobsView) {
  await awaitUntilTrue(() =>
    jobsView
    && jobsView.querySelectorAll('.job')
    && jobsView.querySelectorAll('.job').length)
  create(jobsView)
  listener = () => {
    destroy(jobsView)
    create(jobsView)
  }
  window.addEventListener('resize', listener)
}

function deactivated(jobsView) {
  if (!listener) return
  window.removeEventListener('resize', listener)
  destroy(jobsView)
}

function create(jobsView) {
  let jobEls = jobsView.querySelectorAll('.job')
  jobEls.forEach(jobEl => {
    jobEl.classList.add('relative')
    let posY = jobEl.offsetHeight * 0.5
    jobEl.insertAdjacentHTML('beforeend', `
      <hr style='border: none; top: ${posY}px; border-bottom: solid 3px lime;'
          class='absolute left-0 w-full z-50 removable'>
    `.trim())
  })
}

function destroy(jobsView) {
  let jobEls = jobsView.querySelectorAll('.job')
  jobEls.forEach(jobEl => jobEl.classList.remove('relative'))
  let removables = jobsView.querySelectorAll('hr.removable')
  removables.forEach(removable => removable.remove())
}

export default { activated, deactivated }
