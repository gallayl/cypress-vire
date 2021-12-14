import { createReadStream, PathLike } from 'fs'
import { PNG } from 'pngjs'

export const loadImage = async (image: PathLike) => {
  return new Promise<PNG>((resolve, reject) => {
    const fd = createReadStream(image)
    fd.pipe(new PNG())
      .on('parsed', function () {
        resolve(this)
      })
      .on('error', (error) => reject(error))
  })
}
