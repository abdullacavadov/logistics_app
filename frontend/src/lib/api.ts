import axios from 'axios'
export const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL??'http://localhost:8000/api/v1',headers:{Accept:'application/json','Content-Type':'application/json'},timeout:15000})
let token:string|null=null
export function setAccessToken(value:string|null){token=value}
api.interceptors.request.use(config=>{if(token)config.headers.Authorization=`Bearer ${token}`;return config})
export interface ApiError{error?:{code?:string;message?:string;details?:Record<string,string[]>};message?:string}