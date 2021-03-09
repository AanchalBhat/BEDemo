/*
***** Not in use
*/
module.exports = fn => (req, res, next) => 
      Promise.resolve(fn(req, res, next))