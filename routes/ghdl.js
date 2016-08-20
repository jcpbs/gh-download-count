/**
 * ghdl.js
 * 
 * Copyright (c) 2016 Mawni Maghsoudlou
 * Released under the MIT license
 */

/**
 * ghdl (github download) is a tiny module to get download info
 * of a github release. It searches all github repositories for a given 
 * repository name and returns an object or an array of objects that
 * each object contain download info of all tags of the given repo.
 *
 */

'use strict';

const got = require('gh-got');
const async = require('async');

/*
 * search github repositories for a given repo name
 *@private
 */

function search(reponame, opts, cb) {
  got(`https://api.github.com/search/repositories?q=${reponame}`, opts).then(res => {
    if (res.body.total_count > 0) {
      return cb(null, res.body.items);
    } else {
      return cb(null, null);
    }
}).catch(err => {
  return cb(err.response.body, null);
});
}

function get_tags(repo, name, opts, all, cb) {
  if (all === 'all') {
    got(`https://api.github.com/repos/${repo.full_name}/releases`, opts).then(res => {
      if (res.body.length > 0) {
        var tags = res.body;

        if (tags[0].hasOwnProperty('assets') && tags[0].assets.length > 0) {
          var found_repo = {   
            url: repo.html_url,
            tags: []
          };
          tags.forEach((tag) => {
            if (tag.hasOwnProperty('assets') && tag.assets.length > 0 && tag.tag_name !== '') {
              var found_tag = {
                tagname: tag.tag_name,
                published_at: tag.published_at.slice(0, 10),
                files: []
              };
              tag.assets.forEach((asset) => {
                found_tag.files.push({
                  filename: asset.name,
                  updated_at: asset.updated_at.slice(0, 10),
                  download: asset.download_count
                });
              });
              if (found_tag.files.length > 0) {
                found_repo.tags.push(found_tag);
              }
            }
          });
          if (found_repo.tags.length > 0) {
            return cb(null, found_repo);
          } else {
            return cb(null ,null);
          }
        } else {
          return cb(null, null);
        }
      } else {
        return cb(null, null);
      }
  }).catch(err => {
    return cb(err.response.body, null);
  });
  } else if (all !== 'all' && repo.name === name) {
    got(`https://api.github.com/repos/${repo.full_name}/releases`, opts).then(res => {
      if (res.body.length > 0) {
        var tags = res.body;

        if (tags[0].hasOwnProperty('assets') && tags[0].assets.length > 0) {
          var found_repo = {   
            url: repo.html_url,
            tags: []
          };
          tags.forEach((tag) => {
            if (tag.hasOwnProperty('assets') && tag.assets.length > 0 && tag.tag_name !== '') {
              var found_tag = {
                tagname: tag.tag_name,
                published_at: tag.published_at.slice(0, 10),
                files: []
              };
              tag.assets.forEach((asset) => {
                found_tag.files.push({
                  filename: asset.name,
                  updated_at: asset.updated_at.slice(0, 10),
                  download: asset.download_count
                });
              });
              if (found_tag.files.length > 0) {
                found_repo.tags.push(found_tag);
              }
            }
          });
          if (found_repo.tags.length > 0) {
            return cb(null, found_repo);
          } else {
            return cb(null ,null);
          }
        } else {
          return cb(null, null);
        }
      } else {
        return cb(null, null);
      }
  }).catch(err => {
    return cb(err.response.body, null);
  });

  } else {
    return cb(null, null);
  }
}

/* fetch download info of all tags.
 * @private
 */

function fetch_tags_data(repos, name, opts, all, cb) {
  var found_repos = [];
  async.each(repos, (repo, callback) => {
    get_tags(repo, name, opts, all, (err, found_repo) => {
      if (err) {
        return callback(err);
      }
      if (found_repo) {
        found_repos.push(found_repo);
        return callback();
      } else {
        return callback();
      }
    });
  }, (err) => {
    if (err) {
      return cb(err, null);
    } else {
      return cb(null, found_repos);
    }
  });
}

/*
 * ghdl main function that gets the name of a github
 * repository and returns download info of all tags
 * of the given repo.
 * @public
 */

function ghdl(reponame, opts, all, cb) {
  opts.headers = Object.assign({
    'user-agent': 'https://github.com/mawni/ghdl'
  }, opts.headers);

  var found_repos = [];

  search(reponame, opts, (err, repos) => {
    if (err) {
      return cb(err, null);
    }
    if (repos) {
      fetch_tags_data(repos, reponame, opts, all, (err, res) => {
        if (err) {
          return cb(err, null);
        }
        if (res && res.length === 0) {
          return cb(null, null);
        } else if (res && res.length === 1 && res[0].tags.length > 0 && res[0].tags[0].files.length > 0) {
          return cb(null, res[0]);
        } else if (res && res.length > 1) {
          res.forEach((repo) => {
            if (repo.tags.length > 0 && repo.tags[0].files.length > 0) {
              found_repos.push(repo);
            }
          });
          if (found_repos.length === 0) {
            return cb(null, null);
          } else if (found_repos.length === 1) {
            return cb(null, found_repos[0]);
          } else if (found_repos.length > 1) {
            return cb(null, found_repos);
          }
        } else {
          return cb(null, null);
        }
      });
    } else {
      return cb(null, null);
    }
  });
}

module.exports = ghdl;

