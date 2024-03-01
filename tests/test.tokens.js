const {deleteToken, storeRefreshToken} = require("../src/db")

const { expect } = require('expect');
const request = require('supertest');
const {createTokensFor} = require('../src/token')

const isJenkins = process.env.JENKINS === 'true';


let app;

if (isJenkins){
  app  = process.env.HOST
} else{
  app = require('../src/app.js');
}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
describe('Testing POST /generateTokens endpoint', () => {
  it('No JWT: responds with invalid status code',() =>{
    return request(app)
      .get("/")
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - JWT is missing')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Single JWT: responds with invalid status code',() =>{
    return request(app)
      .get("/")
      .set('Authorization', `Bearer xxxx`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Found Only Single JWT')
      })
      .catch((err)=>{
        return done(err)
      })
    })
  it('validate that tokens are stored', () => {
    return request(app)
      .post('/generateTokens/1') // Specify the POST method
      .send({}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Token Generated Successfully') // Check for expected status code
        // Check that cookies are set in the response
        expect(response.headers['set-cookie']).toBeDefined();

        // Assuming you set two cookies: accessToken and refreshToken
        const cookies = response.headers['set-cookie'];

        // Extract cookie values (you may need to adjust this based on actual cookie names)
        accessTokenCookie = cookies.find(cookie => cookie.includes('accessToken'));
        refreshTokenCookie = cookies.find(cookie => cookie.includes('refreshToken'));
        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toBeDefined();
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it('validate that accessCookie is deleted', () => {
    return request(app)
      .get('/clearCookies') // Specify the POST method
      .send({}) // Attach username and password in the request body
      .then((response) => {
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Cookies Cleared Successfully') // Check for expected status code
        // Check that cookies are set in the response
        expect(response.headers['set-cookie']).toBeDefined();

        // Assuming you set two cookies: accessToken and refreshToken
        const cookies = response.headers['set-cookie'];

        // Extract cookie values (you may need to adjust this based on actual cookie names)
        const accessTokenCookie = cookies.find(cookie => cookie.includes('accessToken'));

        // Assert that cookies are set as expected
        expect(accessTokenCookie).toBe("accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      })
      .catch((err) => {
        return done(err); // Handle potential errors
      });
  });
  it("Delete token: responds with valid status", ()=> {
    return request(app)
      .delete('/delete_token/1')
      .send()
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.text).toBe("Token Deleted Successfully") // Check for expected status code
      })
  });
});


describe('Testing Token Verification', async () => {
  let savedToken
  savedToken = createTokensFor(1, "-1s", "7d");
  await storeRefreshToken(savedToken.refresh);

  it('Expired Access and Valid Refresh JWT First Use: responds with valid status code',() =>{
    return request(app)
      .get("/")
      .set('Authorization', `Bearer ${savedToken.access}, Bearer ${savedToken.refresh}`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(200); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Generating new tokens')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Expired Access and Valid Refresh JWT Already Used: responds with invalid status code',async () =>{
    const tokens = createTokensFor(1,"-1s","7d")
    return request(app)
      .get("/")
      .set('Authorization', `Bearer ${tokens.access}, Bearer ${tokens.refresh}`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Reload Token already used')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Expired Access and Expired Refresh JWT: responds with invalid status code',() =>{
    const tokens = createTokensFor(1,"-1s","-1s")
    return request(app)
      .get("/")
      .set('Authorization', `Bearer ${tokens.access}, Bearer ${tokens.refresh}`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Refresh Token Expired')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Expired Access and Invalid Refresh JWT: responds with invalid status code',() =>{
    const tokens = createTokensFor(1,"-1s","-1s")
    return request(app)
      .get("/")
      .set('Authorization', `Bearer ${tokens.access}, Bearer yyyy`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - Invalid Refresh Token')
      })
      .catch((err)=>{
        return done(err)
      })
  })
  it('Invalid Access: responds with invalid status code',() =>{
    const tokens = createTokensFor(1,"-1s","7d")
    return request(app)
      .get("/")
      .set('Authorization', `Bearer xxxx, Bearer ${tokens.refresh}`)
      .send()
      .then((response)=>{
        expect(response.status).toBe(401); // Check for expected status code
        expect(response.text).toBe('Unauthorized - JWT MALFORMED')
      })
      .catch((err)=>{
        return done(err)
      })
  })

  await deleteToken(1)
});

