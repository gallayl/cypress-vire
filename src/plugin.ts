import { mkdir, copyFile } from 'fs/promises'
import { createWriteStream } from 'fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import sanitize from 'sanitize-filename'
import { join } from 'path'
import { adjustCanvas, parseImage, errorSerialize } from './utils'

import 'cypress'

const SNAPSHOT_BASE_DIRECTORY = join(process.cwd(), 'cypress', 'snapshots', 'base')
const SNAPSHOT_DIFF_DIRECTORY = join(process.cwd(), 'cypress', 'snapshots', 'diff')
const CYPRESS_SCREENSHOT_DIR = join(process.cwd(), 'cypress', 'screenshots')

/**
 *
 *
 * @param args The Args
 * @param args.specName The Spec name.
 * @param args.from The source file
 * @param args.to The target file
 */
async function visualRegressionCopy({ specName, from, to }: { specName: string; from: string; to: string }) {
  const baseDir = join(SNAPSHOT_BASE_DIRECTORY, specName)
  const from = join(CYPRESS_SCREENSHOT_DIR, specName, `${from}.png`)
  const to = join(baseDir, `${to}.png`)

  await mkdir(baseDir, { recursive: true })
  await copyFile(from, to)
  return true
}

/**
 * @param args
 */
async function compareSnapshotsPlugin(args: Cypress.Task) {
  const fileName = sanitize(args.fileName)

  const options = {
    actualImage: join(CYPRESS_SCREENSHOT_DIR, args.specDirectory, `${fileName}-actual.png`),
    expectedImage: join(SNAPSHOT_BASE_DIRECTORY, args.specDirectory, `${fileName}-base.png`),
    diffImage: join(SNAPSHOT_DIFF_DIRECTORY, args.specDirectory, `${fileName}-diff.png`),
  }

  let mismatchedPixels = 0
  let percentage = 0
  try {
    await mkdir(SNAPSHOT_DIFF_DIRECTORY, { recursive: true })
    const specFolder = join(SNAPSHOT_DIFF_DIRECTORY, args.specDirectory)
    await mkdir(specFolder, { recursive: true })
    const imgExpected = await parseImage(options.expectedImage)
    const imgActual = await parseImage(options.actualImage)
    const diff = new PNG({
      width: Math.max(imgActual.width, imgExpected.width),
      height: Math.max(imgActual.height, imgExpected.height),
    })

    const imgActualFullCanvas = adjustCanvas(imgActual, diff.width, diff.height)
    const imgExpectedFullCanvas = adjustCanvas(imgExpected, diff.width, diff.height)

    mismatchedPixels = pixelmatch(
      imgActualFullCanvas.data,
      imgExpectedFullCanvas.data,
      diff.data,
      diff.width,
      diff.height,
      { threshold: 0.1 },
    )
    percentage = (mismatchedPixels / diff.width / diff.height) ** 0.5

    diff.pack().pipe(createWriteStream(options.diffImage))
  } catch (error) {
    return { error: errorSerialize(error) }
  }
  return {
    mismatchedPixels,
    percentage,
  }
}

/**
 * Gets the Plugin instance
 *
 * @param on The PluginEvents
 * @returns The Plugin instance
 */
export const getCompareSnapshotsPlugin = (on: Cypress.PluginEvents) =>
  on('task', {
    compareSnapshotsPlugin,
    visualRegressionCopy,
  })
