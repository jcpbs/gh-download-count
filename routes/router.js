'use strict';

const express = require('express');
const ghdl = require('ghdl');
const router = express.Router();
const tok = process.env.GITHUB_TOKEN;

router.get('/', function(req, res, next) {
  res.render('home', {
    err: null,
    norepo: null
  });
});

router.get('/q', (req, res, next) => {
  var reponame = req.query.name.toString().toLowerCase();
  if (reponame) {
    console.log(`searchbox value: ${reponame}`);
    ghdl(reponame, {token: tok}, (err, repo) => {
      if (err) {
        console.log(`ghdl error: ${err.message}`);
        res.render('home', {
          err: err.message,
          norepo: null
        });
      }
      if (repo && !Array.isArray(repo)) {
        if (repo.tags.length > 0) {
          res.render('out', {
            repo: repo,
            repos: null
          });
        } else {
          console.log(`ghdl: no github release found for ${reponame}`);
          res.render('home', {
            err: null,
            norepo: reponame
          });
        }
      } else if (repo && Array.isArray(repo)) {
        if (repo[0].tags.length > 0) {
          res.render('out', {
            repo: null,
            repos: repo
          });
        } else {
          console.log(`ghdl: no github release found for ${reponame}`);
          res.render('home', {
            err: null,
            norepo: reponame
          });
        }
      } else {
        console.log(`ghdl: no github release found for ${reponame}`);
        res.render('home', {
          err: null,
          norepo: reponame
        });
      }
    });
  } else {
    res.render('home', {
      err: 'ghdl server err: requested url not found.',
      norepo: null
    });
  }
});

module.exports = router;
