var pull = require('pull-stream')

module.exports = resolve

function resolve (sbot, components, cb) {
  var id = (components || []).shift()
  if (id.startsWith('&')) {
    // resolve blob
    fetchBlob(id)
  } else if (id.startsWith('%')) {
    // resolve msg id
    resolveMsgId(id, function (err, blobId) {
      if (err) return cb(err)
      fetchBlob(blobId)
    })
  } else {
    return cb(new Error('root in path must be a URL encoded blob id or msg id'))
  }

  function fetchBlob (id) {
    sbot.blobs.size(id, function (err, size) {
      if (err) return cb(err)
      if (size == null) {
        sbot.blobs.want(id, function (err) {
          if (err) return cb(err)
          get()
        })
      } else get()

      function get () {
        pull(sbot.blobs.get(id), pull.collect(function (err, chunks) {
          if (err) return cb(err)
          var content = Buffer.concat(chunks)
          resolveRec(content)
        }))
      }
    })
  }

  function resolveMsgId (id, cb) {
    var foundRoot = false
    pull(
      sbot.backlinks.read({
        query: [ { $filter: { dest: id } } ],
        index: 'DTA',
        live: false,
        reverse: true
      }),
      pull.filter(function (msg) {
        return msg.value.content.type === 'web-root' && msg.value.content.root
      }),
      pull.drain(function (msg) {
        if (!foundRoot) cb(null, msg.value.content.root)
        foundRoot = true
      }, function () {
        if (!foundRoot) cb(new Error('404: no roots published'))
      })
    )
  }

  function resolveRec (content) {
    try {
      // if this succeeds, it's a directory
      var json = JSON.parse(content)
      if (!json.links) throw new Error('show me as a raw file')
      var link = components.shift()

      if (!link) {
        // if components[1] is empty, return the directory as text
        return cb(null, content)
      } else if (!json.links[link]) {
        // no such link exists
        return cb(new Error('404'))
      } else {
        // recurse
        resolve(sbot, [json.links[link]].concat(components), cb)
      }
    } catch (e) {
      // if this happens, it's a file blob
      // if components[1] exists, this is a 404; otherwise we arrived!
      if (components[0]) {
        return cb(new Error('404'))
      } else {
        cb(null, content)
      }
    }
  }
}
