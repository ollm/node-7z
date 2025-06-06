/* global describe, it */
const { expect } = require('chai')
const { copyFileSync, statSync } = require('fs')
const Seven = require('../../src/main')

const del = Seven.delete
const mockDir = './test/_mock'
const tmpDir = './test/_tmp'

describe('Functional: delete()', function () {
  it('should emit error on 7z error', function (done) {
    const seven = del('', [])
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.be.a('string')
      expect(err.stderr).to.be.a('string')
      done()
    })
  })

  it('should emit error on spawn error', function (done) {
    const archive = ''
    const target = ''
    const bin = '/i/hope/this/is/not/where/your/7zip/bin/is'
    const seven = del(archive, target, { $bin: bin })
    seven.on('error', function (err) {
      expect(err).to.be.an.instanceof(Error)
      expect(err.code).to.equal('ENOENT')
      expect(err.syscall).to.equal(`spawn ${bin}`)
      expect(err.path).to.equal(bin)
      done()
    })
  })

  it('should reduce archive size by deleting content', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/del-md.7z`
    const target = 'DirExt/*.md'
    copyFileSync(archiveBase, archive)
    const sizeBase = statSync(archiveBase).size
    const seven = del(archive, target, { recursive: true })
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.lessThan(sizeBase)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      done()
    })
  })

  it('should accept multiple sources as a flat array', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/del-multiple.7z`
    const target = ['DirExt/*.md', 'DirExt/*.txt']
    copyFileSync(archiveBase, archive)
    const sizeBase = statSync(archiveBase).size
    const seven = del(archive, target, { recursive: true })
    seven.on('end', function () {
      const size = statSync(archive).size
      expect(size).to.lessThan(sizeBase)
      expect(seven.info.get('Updating archive')).to.equal(archive)
      done()
    })
  })

  it('should emit progress', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/progress-del.7z`
    const target = 'DirExt/*.md'
    copyFileSync(archiveBase, archive)
    const seven = del(archive, target, { $progress: true })
    let once = false
    seven.on('progress', function (progress) {
      once = true
      expect(progress.percent).to.be.an('number')
      expect(progress.fileCount).to.be.an('number')
    }).on('end', function () {
      expect(once).to.be.equal(true)
      done()
    })
  })

  it('should emit data', function (done) {
    const archiveBase = `${mockDir}/DirNew/ExtArchive.7z`
    const archive = `${tmpDir}/progress-file-del.7z`
    const target = 'DirExt/*.md'
    copyFileSync(archiveBase, archive)
    const seven = del(archive, target, { recursive: true })
    let counter = 0
    seven.on('data', function (progress) {
      ++counter
      expect(progress.symbol).to.be.an('string')
      expect(progress.file).to.be.an('string')
    }).on('end', function () {
      expect(counter).to.be.equal(10)
      done()
    })
  })
})
