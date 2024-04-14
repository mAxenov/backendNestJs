const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['authCookie'];
  }
  return token;
};

export default cookieExtractor;
