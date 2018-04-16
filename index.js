var pull = require('pull-stream')

module.exports = function (sbot, components, cb) {
  var self = this

  if (!components || !components[0] || !components[0].startsWith('&')) {
    return cb(new Error('root in path must be a URL encoded blob id'))
  }

  var id = components.shift()

  // get root blob
  sbot.blobs.size(id, function (err, size) {
    if (err) return cb(err)
    if (size == null) return cb(null, self.askWantBlobsForm([id]))
    pull(sbot.blobs.get(id), pull.collect(function (err, chunks) {
      if (err) return cb(err)
      var text = Buffer.concat(chunks).toString()
      try {
        // if this succeeds, it's a directory
        var json = JSON.parse(text)
        if (!json.links) throw new Error('show me as a raw file')
        var link = components.shift()

        // if components[1] is empty, return the directory as text
        if (!link) {
          return cb(null, text)
        } else if (!json.links[link]) {
          // no such link exists
          return cb(new Error('404'))
        } else {
          // recurse
          self.resolveWebPath([json.links[link]].concat(components), cb)
        }
      } catch (e) {
        // if this happens, it's a file blob
        // if components[1] exists, this is a 404; otherwise we arrived!
        if (components[0]) {
          return cb(new Error('404'))
        } else {
          cb(null, text)
        }
      }
    }))
  })
}
