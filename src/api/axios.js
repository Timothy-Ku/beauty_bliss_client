import axios from "axios";

//const instance = axios.create({
  //baseURL: "http://localhost:5000/api", // DO NOT add `/routine` here
//});
const instance = axios.create({
  baseURL: "https://beauty-bliss-server-production.up.railway.app/api",
});


export default instance;
