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
  if (req.query.name) {
    console.log(`searchbox value: ${req.query.name}`);
    ghdl(req.query.name, {token: tok}, (err, repo) => {
      if (err) {
        console.log(`ghdl error: ${err.message}`);
        res.render('home', {
          err: err.message,
          norepo: null
        });
      }
      if (repo && !Array.isArray(repo)) {
        repo.tags.forEach((tag) => {
          console.log(tag);
        });
        if (repo.tags.length > 0) {
          res.render('out', {
            repo: repo,
            repos: null
          });
        } else {
          console.log(`ghdl: no github release found for ${req.query.name}`);
          res.render('home', {
            err: null,
            norepo: req.query.name
          });
        }
      } else if (repo && Array.isArray(repo)) {
        repo.forEach((rep) => {
          console.log(rep.url);
          console.log(rep.tags);
        });
        if (repo[0].tags.length > 0) {
          res.render('out', {
            repo: null,
            repos: repo
          });
        } else {
          console.log(`ghdl: no github release found for ${req.query.name}`);
          res.render('home', {
            err: null,
            norepo: req.query.name
          });
        }
      } else {
        console.log(`ghdl: no github release found for ${req.query.name}`);
        res.render('home', {
          err: null,
          norepo: req.query.name
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
