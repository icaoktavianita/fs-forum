const Public = true;
const baseUrl = Public ? 'http://182.23.96.84:8182/forum/' : 'http://10.5.50.132/forum/api/';

export default {
  photoUrl: baseUrl+'uploads/',
  login:      baseUrl+'api/login.php?',
  changePassword:      baseUrl+'api/changepassword.php',
  discussions: baseUrl+'api/discussions',
  category : baseUrl+'api/categories',
  user: baseUrl+'api/users',
  profile: baseUrl+'api/profile.php',
}