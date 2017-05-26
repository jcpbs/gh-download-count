#!/usr/bin/env node

'use strict'

const path = require('path')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const ghdlc = require('./gh-download-count.js')
const tok = process.env.GITHUB_TOKEN
const app = express()

function normalizePort (val) {
  var port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

const server = http.createServer(app)
const port = normalizePort(process.env.PORT || 8080)
app.set('port', port)
server.listen(port, () => console.log(`gh-download-count server listening on port ${port}..`))
server.on('error', onError)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('home', {
    err: null,
    norepo: null
  })
})

app.get('/q', (req, res) => {
  const reponame = req.query.name.toString().toLowerCase()
  const opts = {token: tok, exactMatch: true}
  if (req.query.fuz === 'y') {
    opts.exactMatch = false
  }
  if (reponame) {
    ghdlc(reponame, opts, (err, repo) => {
      if (err) {
        console.log(`ghdl error: ${err.message}`)
        res.render('home', {
          err: err.message,
          norepo: null
        })
      }
      if (repo && !Array.isArray(repo)) {
        if (repo.tags.length > 0) {
          res.render('list', {
            repo: repo,
            repos: null
          })
        } else {
          console.log(`ghdl: no github release found for ${reponame}`)
          res.render('home', {
            err: null,
            norepo: reponame
          })
        }
      } else if (repo && Array.isArray(repo)) {
        if (repo[0].tags.length > 0) {
          res.render('list', {
            repo: null,
            repos: repo
          })
        } else {
          console.log(`ghdl: no github release found for ${reponame}`)
          res.render('home', {
            err: null,
            norepo: reponame
          })
        }
      } else {
        console.log(`ghdl: no github release found for ${reponame}`)
        res.render('home', {
          err: null,
          norepo: reponame
        })
      }
    })
  } else {
    res.render('home', {
      err: 'Invalid repo name.',
      norepo: null
    })
  }
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

app.use((err, req, res) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})
