// Copyright (c) 2014-2019, Quentin Rossetti <quentin.rossetti@gmail.com>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const { ERROR } = require('./regexp')

// Just assign an error to the stream. The event error is emitted on close
const assign = (stream, err) => {
  if (stream.err) {
    stream.err = Object.assign(err, stream.err)
  } else {
    stream.err = err
  }
  return stream
}

// Just append the buffer to the stream. The error is created before emitting on close
const append = (stream, buffer) => {
  if (stream.stderr) {
    stream.stderr += buffer
  } else {
    stream.stderr = buffer
  }
  return stream
}

const fromBuffer = chunk => {

  // Join WARNINGS|ERRORS in a single line
  const stderr = chunk.toString().replace(/(WARNINGS|ERRORS):\s*\n((?:[^\n]+\n)+)/gm, (match, level, message) => {
    message = message.trim().replace(/\n/g, ' : ');
    return `${level}: ${message}\n`;
  });

  const match = [...stderr.matchAll(ERROR)].pop(); // Get last error message
  const err = new Error('unknown error')
  err.stderr = stderr
  if (match) {
    Object.assign(err, match.groups)
    err.level = err.level.toUpperCase()
  }
  return err
}

module.exports = { assign, append, fromBuffer }
