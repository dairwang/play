module.exports = (req, res, next) => {
  res.ok = (data, msg) => {
    res.json({ code: 200, data, msg })
  }
  res.error = (code, msg, data) => {
    const status = code && typeof code === 'number' ? code : 400
    res.status(status).json({ code: status, msg, data })
  }
  next()
}
