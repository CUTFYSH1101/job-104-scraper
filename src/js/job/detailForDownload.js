import { detailConfig } from '@/js/job/detailStorage.js'

/**
 * @returns {string[]}
 */
export function getDetailsContent() {
  return detailConfig.config.details._values
}
