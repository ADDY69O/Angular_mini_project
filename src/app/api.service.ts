import { BaseApiService } from "./base-api.service";
import { HttpClient } from "@angular/common/http";
import { CacheService } from "./cache.service";


export class ApiService extends BaseApiService {

    constructor ( http: HttpClient, cacheService: CacheService){
        super(http,`https://dummyjson.com/`,cacheService)
    }


    getPosts <T> (limit:T,skip:T):void{

        const cacheKey = `${limit}-${skip}`;
        const cachedData = this.cacheService.getCache(cacheKey);
    
        if (cachedData) {
          return (cachedData); // Return cached data as an observable
        }
        else{
            const data = this.get(cacheKey);
            this.cacheService.setCache(cacheKey,data)
        }
    

    }

}