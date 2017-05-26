/**
 * ghdl.js
 *
 * Copyright (c) 2017 Mani Maghsoudlou
 * Released under the MIT license
 */

/**
 * ghdl (github download) is a tiny module to get download info
 * of a github release. It searches all github repositories for a given
 * repository name and returns an object or an array of objects that
 * each object contain download info of all tags of the given repo.
 *
 */

'use strict'

const got = require('gh-got')

/*
 * ghdl main function that gets the name of a github
 * repository and returns download info of all tags
 * of the given repo.
 *
 * @public
 */

function ghdl (reponame, opts, cb) {
  opts.headers = Object.assign({
    'user-agent': 'https://github.com/manidlou/ghdl'
  }, opts.headers)

  const foundRepos = []

  search(reponame, opts, (err, repos) => {
    if (err) return cb(err)
    if (repos) {
      getAllTags(repos, reponame, opts, (err, res) => {
        if (err) return cb(err)
        if (res && res.length === 0) return cb()
        else if (res && res.length === 1 && res[0].tags.length > 0 && res[0].tags[0].files.length > 0) {
          return cb(null, res[0])
        } else if (res && res.length > 1) {
          res.forEach(repo => {
            if (repo.tags.length > 0 && repo.tags[0].files.length > 0) {
              foundRepos.push(repo)
            }
          })
          if (foundRepos.length === 0) return cb()
          else if (foundRepos.length === 1) return cb(null, foundRepos[0])
          else if (foundRepos.length > 1) return cb(null, foundRepos)
        } else return cb()
      })
    } else return cb()
  })
}

/*
 * search github repositories for a given repo name
 *
 *@private
 */

function search (repo, opts, cb) {
  got(`https://api.github.com/search/repositories?q=${repo}`, opts).then(res => {
    if (res.body.total_count > 0) return cb(null, res.body.items)
    return cb()
  }).catch(err => cb(err.response.body))
}

/* get all tags of all found repos.
 *
 * @private
 */

function getAllTags (repos, name, opts, cb) {
  const foundRepos = []
  Promise.all(repos.map(repo => {
    return new Promise((resolve, reject) => {
      getRepoTags(repo, name, opts, (err, foundRepo) => {
        if (err) reject(err)
        if (foundRepo) foundRepos.push(foundRepo)
        resolve()
      })
    })
  })).then(() => cb(null, foundRepos)).catch(cb)
}

/* get all tags of a given repo. If exactMatch is true,
 * get tags of that repo only, otherwise get tags info
 * if any repos found.
 *
 * @private
 */

function getRepoTags (repo, name, opts, cb) {
  if (!opts.exactMatch) return getTagInfo(repo, opts, cb)
  else if (repo.name === name) return getTagInfo(repo, opts, cb)
  return cb()
}

/* get tags info including download count and a few other
 * useful data such as published at, and updated at,
 * for each tag of a given repo.
 *
 * @private
 */

function getTagInfo (repo, opts, cb) {
  got(`https://api.github.com/repos/${repo.full_name}/releases`, opts).then(res => {
    if (res.body.length > 0) {
      const tags = res.body

      if (tags[0].hasOwnProperty('assets') && tags[0].assets.length > 0) {
        const foundRepo = {
          url: repo.html_url,
          tags: []
        }
        tags.forEach(tag => {
          if (tag.hasOwnProperty('assets') && tag.assets.length > 0 && tag.tag_name !== '') {
            const foundTag = {
              tagname: tag.tag_name,
              published_at: tag.published_at.slice(0, 10),
              files: []
            }
            tag.assets.forEach(asset => {
              foundTag.files.push({
                filename: asset.name,
                updated_at: asset.updated_at.slice(0, 10),
                download: asset.download_count
              })
            })
            if (foundTag.files.length > 0) {
              foundRepo.tags.push(foundTag)
            }
          }
        })
        if (foundRepo.tags.length > 0) return cb(null, foundRepo)
        return cb()
      } else {
        return cb()
      }
    } else {
      return cb()
    }
  }).catch(err => {
    return cb(err.response.body)
  })
}

module.exports = ghdl
